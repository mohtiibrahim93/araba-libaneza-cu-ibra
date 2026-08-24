import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  TZ,
  json as _json,
  gcalDeleteEvent,
  gcalPatchEvent,
  gcalFreebusy,
  overlaps,
} from "../_shared/booking.ts";
import { fmtBookingLocal, manageUrl, sendBookingEmail, sendAdminBookingEmail } from "../_shared/booking-emails.ts";
import { buildCorsHeaders } from "../_shared/cors.ts";

function client() {
  return createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
}

async function loadByToken(token: string) {
  const supabase = client();
  const { data } = await supabase
    .from("bookings")
    .select("*, booking_event_types!inner(*)")
    .eq("manage_token", token)
    .maybeSingle();
  return data;
}

Deno.serve(async (req) => {
  const corsHeaders = buildCorsHeaders(req);
  const json = (body: unknown, status = 200) => {
    const res = _json(body, status);
    for (const [k, v] of Object.entries(corsHeaders)) res.headers.set(k, v);
    return res;
  };
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const url = new URL(req.url);
    const parts = url.pathname.split("/").filter(Boolean);
    const token = parts[parts.length - 1];
    if (!token || token.length < 20) return json({ error: "missing token" }, 400);

    const booking = await loadByToken(token);
    if (!booking) return json({ error: "not found" }, 404);

    if (req.method === "GET") {
      return json({
        booking: {
          id: booking.id,
          event_type_slug: booking.event_type_slug,
          event_type_name_ro: booking.booking_event_types?.name_ro,
          event_type_name_en: booking.booking_event_types?.name_en,
          duration_min: booking.booking_event_types?.duration_min,
          start_at: booking.start_at,
          end_at: booking.end_at,
          status: booking.status,
          format: booking.format,
          meet_link: booking.meet_link,
          student_name: booking.student_name,
          student_email: booking.student_email,
        },
        tz: TZ,
      });
    }

    if (booking.status !== "confirmed") {
      return json({ error: "booking is not active" }, 409);
    }

    const supabase = client();

    if (req.method === "DELETE") {
      if (booking.google_event_id) await gcalDeleteEvent(booking.google_event_id);
      await supabase
        .from("bookings")
        .update({ status: "cancelled", cancelled_at: new Date().toISOString() })
        .eq("id", booking.id);
      sendBookingEmail(
        "booking-cancelled",
        booking.student_email,
        {
          name: booking.student_name,
          whenLabel: fmtBookingLocal(booking.start_at, booking.language ?? "ro"),
          lang: booking.language ?? "ro",
        },
        `booking-cancel-${booking.id}`,
      );
      sendAdminBookingEmail(
        "cancelled",
        {
          eventName: booking.booking_event_types?.name_ro,
          studentName: booking.student_name,
          studentEmail: booking.student_email,
          studentPhone: booking.student_phone,
          format: booking.format === "online" ? "online" : "fizic",
          whenLabel: fmtBookingLocal(booking.start_at, booking.language ?? "ro"),
          notes: booking.notes,
        },
        `admin-booking-cancel-${booking.id}`,
      );
      return json({ ok: true, status: "cancelled" });
    }

    if (req.method === "PATCH") {
      const body = (await req.json()) as { start_at?: string };
      if (!body?.start_at) return json({ error: "start_at required" }, 400);
      const startMs = Date.parse(body.start_at);
      if (!Number.isFinite(startMs)) return json({ error: "invalid start_at" }, 400);
      const et = booking.booking_event_types;
      const endMs = startMs + et.duration_min * 60_000;
      const startISO = new Date(startMs).toISOString();
      const endISO = new Date(endMs).toISOString();

      const checkStart = new Date(startMs - et.buffer_before_min * 60_000).toISOString();
      const checkEnd = new Date(endMs + et.buffer_after_min * 60_000).toISOString();
      const [busy, { data: clashes }] = await Promise.all([
        gcalFreebusy(checkStart, checkEnd),
        supabase
          .from("bookings")
          .select("id,start_at,end_at")
          .eq("status", "confirmed")
          .neq("id", booking.id)
          .lt("start_at", checkEnd)
          .gt("end_at", checkStart),
      ]);
      const s = startMs - et.buffer_before_min * 60_000;
      const e = endMs + et.buffer_after_min * 60_000;
      for (const b of clashes ?? []) {
        if (overlaps(s, e, Date.parse(b.start_at), Date.parse(b.end_at))) {
          return json({ error: "slot taken", code: "conflict" }, 409);
        }
      }
      for (const b of busy) {
        if (overlaps(s, e, Date.parse(b.start), Date.parse(b.end))) {
          return json({ error: "slot taken", code: "conflict" }, 409);
        }
      }

      // Mark old booking rescheduled, insert new confirmed booking
      const { data: created, error: insErr } = await supabase
        .from("bookings")
        .insert({
          event_type_slug: booking.event_type_slug,
          start_at: startISO,
          end_at: endISO,
          student_name: booking.student_name,
          student_email: booking.student_email,
          student_phone: booking.student_phone,
          format: booking.format,
          notes: booking.notes,
          status: "confirmed",
          original_booking_id: booking.id,
          google_event_id: booking.google_event_id,
          meet_link: booking.meet_link,
          language: booking.language,
        })
        .select()
        .single();
      if (insErr || !created) {
        const msg = (insErr?.message || "").toLowerCase();
        if (msg.includes("duplicate") || msg.includes("unique")) {
          return json({ error: "slot taken", code: "conflict" }, 409);
        }
        return json({ error: "reschedule failed" }, 500);
      }
      await supabase
        .from("bookings")
        .update({ status: "rescheduled", google_event_id: null, meet_link: null })
        .eq("id", booking.id);

      // Patch GCal event in place (keeps id + Meet link)
      if (booking.google_event_id) await gcalPatchEvent(booking.google_event_id, startISO, endISO);

      sendBookingEmail(
        "booking-rescheduled",
        booking.student_email,
        {
          name: booking.student_name,
          oldWhenLabel: fmtBookingLocal(booking.start_at, booking.language ?? "ro"),
          newWhenLabel: fmtBookingLocal(startISO, booking.language ?? "ro"),
          meetLink: booking.meet_link,
          manageUrl: manageUrl(created.manage_token),
          lang: booking.language ?? "ro",
        },
        `booking-resched-${created.id}`,
      );

      sendAdminBookingEmail(
        "rescheduled",
        {
          eventName: booking.booking_event_types?.name_ro,
          studentName: booking.student_name,
          studentEmail: booking.student_email,
          studentPhone: booking.student_phone,
          format: booking.format === "online" ? "online" : "fizic",
          oldWhenLabel: fmtBookingLocal(booking.start_at, booking.language ?? "ro"),
          newWhenLabel: fmtBookingLocal(startISO, booking.language ?? "ro"),
          notes: booking.notes,
        },
        `admin-booking-resched-${created.id}`,
      );

      return json({ ok: true, manage_token: created.manage_token, start_at: startISO });
    }

    return json({ error: "method not allowed" }, 405);
  } catch (err) {
    console.error("[booking-manage] error", err);
    return json({ error: "Internal server error" }, 500);
  }
});