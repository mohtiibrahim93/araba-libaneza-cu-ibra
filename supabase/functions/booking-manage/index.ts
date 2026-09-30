import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  TZ,
  json as _json,
  gcalDeleteEvent,
  gcalPatchEvent,
  gcalFreebusy,
  overlaps,
  utcToZonedParts,
  candidateSlotsForDays,
  passesTimingRules,
  cohortBusyForDays,
  ACTIVE_COHORT_SELECT,
  ACTIVE_COHORT_STATUSES,
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
  // PATCH (reschedule) and DELETE (cancel) are not CORS-safelisted methods:
  // without an explicit Allow-Methods the browser preflight rejects them.
  const corsHeaders = buildCorsHeaders(req, {
    "Access-Control-Allow-Methods": "GET, PATCH, DELETE, OPTIONS",
  });
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
      // Write first, conditional on the row still being the confirmed booking
      // we loaded, so a failed or duplicate write never deletes the calendar
      // event or tells the student it is cancelled.
      const { data: cancelledRows, error: cancelErr } = await supabase
        .from("bookings")
        .update({ status: "cancelled", cancelled_at: new Date().toISOString() })
        .eq("id", booking.id)
        .eq("status", "confirmed")
        .select("id");
      if (cancelErr) {
        console.error("[booking-manage] cancel write failed", cancelErr);
        return json({ error: "cancel failed" }, 500);
      }
      if (!cancelledRows?.length) return json({ error: "booking is not active" }, 409);
      if (booking.google_event_id) await gcalDeleteEvent(booking.google_event_id);
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

      // The new time must be one booking-availability would offer: generated
      // from the availability rules, and inside notice / advance / format
      // rules. Same helpers as that function, so the rules cannot drift.
      const p = utcToZonedParts(new Date(startMs));
      const day = { y: p.year, m: p.month, d: p.day };
      const { data: rules } = await supabase
        .from("availability_rules")
        .select("weekday,start_time,end_time")
        .eq("is_active", true);
      const offered = candidateSlotsForDays([day], rules ?? [], et.duration_min);
      if (!offered.includes(startISO) || !passesTimingRules(et, booking.format, startISO)) {
        return json({ error: "slot not bookable", code: "invalid_slot" }, 400);
      }

      const checkStart = new Date(startMs - et.buffer_before_min * 60_000).toISOString();
      const checkEnd = new Date(endMs + et.buffer_after_min * 60_000).toISOString();
      const [busy, { data: clashes }, { data: cohorts }] = await Promise.all([
        gcalFreebusy(checkStart, checkEnd),
        supabase
          .from("bookings")
          .select("id,start_at,end_at")
          .eq("status", "confirmed")
          .neq("id", booking.id)
          .lt("start_at", checkEnd)
          .gt("end_at", checkStart),
        supabase
          .from("group_cohorts")
          .select(ACTIVE_COHORT_SELECT)
          .eq("is_active", true)
          .in("status", ACTIVE_COHORT_STATUSES),
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
      for (const b of cohortBusyForDays(cohorts ?? [], [day])) {
        if (overlaps(s, e, b.start, b.end)) {
          return json({ error: "slot taken", code: "conflict" }, 409);
        }
      }

      // Claim the old booking first, atomically: only a row that is still
      // confirmed at the start time we loaded can be claimed, so a second
      // concurrent reschedule finds nothing and stops here.
      const { data: claimed, error: claimErr } = await supabase
        .from("bookings")
        .update({ status: "rescheduled" })
        .eq("id", booking.id)
        .eq("status", "confirmed")
        .eq("start_at", booking.start_at)
        .select("id");
      if (claimErr) {
        console.error("[booking-manage] reschedule claim failed", claimErr);
        return json({ error: "reschedule failed" }, 500);
      }
      if (!claimed?.length) return json({ error: "booking is not active" }, 409);

      const restoreOld = async () => {
        const { error } = await supabase
          .from("bookings")
          .update({ status: "confirmed" })
          .eq("id", booking.id)
          .eq("status", "rescheduled");
        if (error) console.error("[booking-manage] could not restore old booking", booking.id, error);
      };

      const { data: created, error: insErr } = await supabase
        .from("bookings")
        .insert({
          event_type_slug: booking.event_type_slug,
          registration_id: booking.registration_id,
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
        await restoreOld();
        const msg = (insErr?.message || "").toLowerCase();
        if (msg.includes("duplicate") || msg.includes("unique")) {
          return json({ error: "slot taken", code: "conflict" }, 409);
        }
        return json({ error: "reschedule failed" }, 500);
      }
      const { error: clearErr } = await supabase
        .from("bookings")
        .update({ google_event_id: null, meet_link: null })
        .eq("id", booking.id);
      if (clearErr) console.error("[booking-manage] could not clear old event link", booking.id, clearErr);

      // Patch GCal event in place (keeps id + Meet link) — only after the DB is consistent.
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