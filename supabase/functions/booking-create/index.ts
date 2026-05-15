import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  TZ,
  corsHeaders,
  json,
  gcalCreateEvent,
  gcalFreebusy,
  overlaps,
  utcToZonedParts,
} from "../_shared/booking.ts";

interface CreateBody {
  event_type: string;
  start_at: string; // ISO UTC
  format?: "online" | "physical";
  student_name: string;
  student_email: string;
  student_phone?: string;
  notes?: string;
  language?: "ro" | "en";
}

function fmtLocal(iso: string, lang: "ro" | "en") {
  const p = utcToZonedParts(new Date(iso));
  const months: Record<"ro" | "en", string[]> = {
    ro: ["ian.","feb.","mar.","apr.","mai","iun.","iul.","aug.","sep.","oct.","noi.","dec."],
    en: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
  };
  const hh = String(p.hour).padStart(2, "0");
  const mm = String(p.minute).padStart(2, "0");
  return `${p.day} ${months[lang][p.month - 1]} ${p.year}, ${hh}:${mm}`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "POST required" }, 405);

  try {
    const body = (await req.json()) as CreateBody;
    if (!body?.event_type || !body?.start_at || !body?.student_name || !body?.student_email) {
      return json({ error: "missing fields" }, 400);
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(body.student_email)) {
      return json({ error: "invalid email" }, 400);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: et } = await supabase
      .from("booking_event_types")
      .select("*")
      .eq("slug", body.event_type)
      .eq("is_active", true)
      .maybeSingle();
    if (!et) return json({ error: "event type not found" }, 404);

    const startMs = Date.parse(body.start_at);
    if (!Number.isFinite(startMs)) return json({ error: "invalid start_at" }, 400);
    const endMs = startMs + et.duration_min * 60_000;
    const startISO = new Date(startMs).toISOString();
    const endISO = new Date(endMs).toISOString();

    // min-notice / max-advance
    const now = Date.now();
    if (startMs < now + (et.min_notice_hours ?? 0) * 3_600_000) {
      return json({ error: "slot too soon" }, 409);
    }
    if (startMs > now + (et.max_advance_days ?? 30) * 86_400_000) {
      return json({ error: "slot too far in advance" }, 409);
    }

    // Re-check availability against DB & GCal (with buffers)
    const checkStart = new Date(startMs - et.buffer_before_min * 60_000).toISOString();
    const checkEnd = new Date(endMs + et.buffer_after_min * 60_000).toISOString();

    const [busy, { data: clashes }] = await Promise.all([
      gcalFreebusy(checkStart, checkEnd),
      supabase
        .from("bookings")
        .select("start_at,end_at")
        .eq("status", "confirmed")
        .lt("start_at", checkEnd)
        .gt("end_at", checkStart),
    ]);
    const s = startMs - et.buffer_before_min * 60_000;
    const e = endMs + et.buffer_after_min * 60_000;
    for (const b of clashes ?? []) {
      if (overlaps(s, e, Date.parse(b.start_at), Date.parse(b.end_at))) {
        return json({ error: "slot just taken", code: "conflict" }, 409);
      }
    }
    for (const b of busy) {
      if (overlaps(s, e, Date.parse(b.start), Date.parse(b.end))) {
        return json({ error: "slot just taken", code: "conflict" }, 409);
      }
    }

    const format = body.format ?? "online";
    const language = body.language ?? "ro";

    // Insert (unique partial index protects against final race)
    const { data: inserted, error: insErr } = await supabase
      .from("bookings")
      .insert({
        event_type_slug: et.slug,
        start_at: startISO,
        end_at: endISO,
        student_name: body.student_name,
        student_email: body.student_email,
        student_phone: body.student_phone ?? null,
        format,
        notes: body.notes ?? null,
        status: "confirmed",
        language,
      })
      .select()
      .single();
    if (insErr || !inserted) {
      const msg = (insErr?.message || "").toLowerCase();
      if (msg.includes("duplicate") || msg.includes("unique")) {
        return json({ error: "slot just taken", code: "conflict" }, 409);
      }
      console.error("[booking-create] insert failed", insErr);
      return json({ error: "insert failed" }, 500);
    }

    // Create GCal event (best-effort)
    const summary = `${et.name_ro} — ${body.student_name}`;
    const description = [
      `Student: ${body.student_name}`,
      `Email: ${body.student_email}`,
      body.student_phone ? `Telefon: ${body.student_phone}` : null,
      `Format: ${format === "online" ? "Online" : "Fizic"}`,
      body.notes ? `Note: ${body.notes}` : null,
      `Manage: ${Deno.env.get("SUPABASE_URL")?.replace(".supabase.co", ".lovable.app") ?? ""}/booking/manage/${inserted.manage_token}`,
    ]
      .filter(Boolean)
      .join("\n");

    const gcal = await gcalCreateEvent({
      summary,
      description,
      startISO,
      endISO,
      attendeeEmail: body.student_email,
      attendeeName: body.student_name,
      withMeet: format === "online",
    });

    if (gcal.ok && gcal.id) {
      await supabase
        .from("bookings")
        .update({ google_event_id: gcal.id, meet_link: gcal.meetLink ?? null })
        .eq("id", inserted.id);
    }

    return json({
      ok: true,
      booking_id: inserted.id,
      manage_token: inserted.manage_token,
      meet_link: gcal.meetLink ?? null,
      start_at: startISO,
      end_at: endISO,
      tz: TZ,
      label: fmtLocal(startISO, language),
    });
  } catch (err) {
    console.error("[booking-create] error", err);
    return json({ error: String(err) }, 500);
  }
});