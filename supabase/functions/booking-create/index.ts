import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  TZ,
  json as _json,
  gcalCreateEvent,
  gcalFreebusy,
  overlaps,
} from "../_shared/booking.ts";
import { fmtBookingLocal, manageUrl, sendBookingEmail, sendAdminBookingEmail } from "../_shared/booking-emails.ts";
import { buildCorsHeaders } from "../_shared/cors.ts";
import { checkRateLimit, getClientIp } from "../_shared/rate-limit.ts";

interface CreateBody {
  event_type: string;
  start_at: string; // ISO UTC
  format?: "online" | "physical";
  student_name: string;
  student_email: string;
  student_phone?: string;
  notes?: string;
  language?: "ro" | "en";
  gdpr_consent?: boolean;
  registration_id: string;
}

const fmtLocal = fmtBookingLocal;

Deno.serve(async (req) => {
  const corsHeaders = buildCorsHeaders(req);
  const json = (body: unknown, status = 200) => {
    const res = _json(body, status);
    for (const [k, v] of Object.entries(corsHeaders)) res.headers.set(k, v);
    return res;
  };
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "POST required" }, 405);

  try {
    const body = (await req.json()) as CreateBody;
    if (!body?.event_type || !body?.start_at || !body?.student_name || !body?.student_email) {
      return json({ error: "missing fields" }, 400);
    }
    if (!body.registration_id || !/^[0-9a-f-]{36}$/i.test(body.registration_id)) {
      return json({ error: "registration_id required" }, 400);
    }
    if (!body.gdpr_consent) {
      return json({ error: "gdpr consent required" }, 400);
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(body.student_email)) {
      return json({ error: "invalid email" }, 400);
    }
    if (body.student_email.length > 254) {
      return json({ error: "invalid email" }, 400);
    }
    if (typeof body.student_name !== "string" || body.student_name.trim().length === 0 || body.student_name.length > 200) {
      return json({ error: "invalid student_name" }, 400);
    }
    if (body.student_phone != null && (typeof body.student_phone !== "string" || body.student_phone.length > 40)) {
      return json({ error: "invalid student_phone" }, 400);
    }
    if (body.notes != null && (typeof body.notes !== "string" || body.notes.length > 2000)) {
      return json({ error: "invalid notes" }, 400);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // This endpoint is unauthenticated and sends a real transactional email
    // to a client-supplied address — without a throttle it can be scripted
    // into a spam/phishing relay. Cap per-IP before doing any real work.
    const clientIp = getClientIp(req);
    if (clientIp) {
      const allowed = await checkRateLimit(supabase, `booking_create:${clientIp}`, 5, 3600);
      if (!allowed) {
        return json({ error: "Too many booking attempts. Please try again later." }, 429);
      }
    }

    // Verify the registration exists (FK will catch it too, but fail early with a clearer error).
    const { data: reg } = await supabase
      .from("registrations")
      .select("id")
      .eq("id", body.registration_id)
      .maybeSingle();
    if (!reg) return json({ error: "registration not found" }, 404);

    const { data: et } = await supabase
      .from("booking_event_types")
      .select("*")
      .eq("slug", body.event_type)
      .eq("is_active", true)
      .maybeSingle();
    if (!et) return json({ error: "event type not found" }, 404);

    // The free trial is for first contact only: one per person. A cancelled
    // trial can be rebooked, but a kept (confirmed/completed) one blocks a
    // second freebie — the paid flow is the path for returning students.
    if (et.slug === "trial") {
      // ilike with the wildcards escaped = case-insensitive equality.
      const emailPattern = body.student_email.trim().replace(/([%_\\])/g, "\\$1");
      const { data: priorTrials } = await supabase
        .from("bookings")
        .select("id")
        .eq("event_type_slug", "trial")
        .in("status", ["confirmed", "completed"])
        .ilike("student_email", emailPattern)
        .limit(1);
      if ((priorTrials ?? []).length > 0) {
        return json(
          { error: "Proba gratuită a fost deja folosită pentru acest email.", code: "trial_used" },
          409,
        );
      }
    }

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
    const zoomUrl = Deno.env.get("ZOOM_MEETING_URL") ?? null;
    const onlineLink = format === "online" ? zoomUrl : null;

    // Insert (unique partial index protects against final race)
    const { data: inserted, error: insErr } = await supabase
      .from("bookings")
      .insert({
        registration_id: body.registration_id,
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
        gdpr_consent_at: new Date().toISOString(),
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

    // The trial step-1 lead was stored as "incomplete" because no slot had been
    // chosen yet. A slot is booked now, so promote it to a real lead here
    // (service role) — the browser cannot update registrations under RLS.
    // Older rows used a marker string in `notes`; clear that too so historic
    // leads stop showing the warning once they convert.
    {
      const { error: clearErr } = await supabase
        .from("registrations")
        .update({ lead_status: "new", notes: null })
        .eq("id", body.registration_id)
        .eq("lead_status", "incomplete");
      if (clearErr) console.error("[booking-create] promote lead failed", clearErr);

      const { error: legacyErr } = await supabase
        .from("registrations")
        .update({ notes: null })
        .eq("id", body.registration_id)
        .like("notes", "%NEALES%");
      if (legacyErr) console.error("[booking-create] clear legacy marker failed", legacyErr);
    }

    // Create GCal event (best-effort)
    const summary = `${et.name_ro} — ${body.student_name}`;
    const description = [
      `Student: ${body.student_name}`,
      `Email: ${body.student_email}`,
      body.student_phone ? `Telefon: ${body.student_phone}` : null,
      `Format: ${format === "online" ? "Online" : "Fizic"}`,
      onlineLink ? `Zoom: ${onlineLink}` : null,
      body.notes ? `Note: ${body.notes}` : null,
      `Manage: ${manageUrl(inserted.manage_token)}`,
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
      withMeet: false,
    });

    // Record the sync outcome on the row. A booking that never reached the
    // calendar used to be indistinguishable from one that did — both just had
    // google_event_id = NULL — so the admin panel and the health check now read
    // google_sync_error to tell them apart.
    await supabase
      .from("bookings")
      .update({
        google_event_id: gcal.ok && gcal.id ? gcal.id : null,
        google_sync_error: gcal.ok && gcal.id ? null : (gcal.error ?? "unknown"),
        meet_link: onlineLink,
      })
      .eq("id", inserted.id);

    // Send confirmation email (best-effort, async)
    sendBookingEmail(
      "booking-confirmation",
      body.student_email,
      {
        name: body.student_name,
        whenLabel: fmtLocal(startISO, language),
        durationMin: et.duration_min,
        format,
        meetLink: onlineLink,
        manageUrl: manageUrl(inserted.manage_token),
        lang: language,
      },
      `booking-confirm-${inserted.id}`,
    );

    // Admin notification (best-effort)
    sendAdminBookingEmail(
      "new",
      {
        eventName: et.name_ro,
        studentName: body.student_name,
        studentEmail: body.student_email,
        studentPhone: body.student_phone ?? null,
        format: format === "online" ? "online" : "fizic",
        whenLabel: fmtLocal(startISO, language),
        notes: body.notes ?? null,
        // The owner's own copy is the only place they would notice that the
        // lesson is not in their Google Calendar, so say so explicitly.
        calendarSyncError: gcal.ok && gcal.id ? null : (gcal.error ?? "unknown"),
      },
      `admin-booking-new-${inserted.id}`,
    );



    return json({
      ok: true,
      booking_id: inserted.id,
      manage_token: inserted.manage_token,
      meet_link: onlineLink,
      start_at: startISO,
      end_at: endISO,
      tz: TZ,
      label: fmtLocal(startISO, language),
    });
  } catch (err) {
    console.error("[booking-create] error", err);
    return json({ error: "Internal server error" }, 500);
  }
});