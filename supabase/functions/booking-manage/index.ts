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

/**
 * Free changes stop 24 hours before the lesson — the rule the trial notice,
 * the FAQ and the confirmation emails all state, and the reason the card is on
 * file in the first place: a slot nobody turns up for costs a private lesson.
 *
 * It is enforced here rather than only in the page, because the page is
 * reached by a token anyone holding the email link can replay directly against
 * this function.
 *
 * Inside the window a genuine emergency is not refused, it is just not
 * self-service: the blocked screen points at WhatsApp, and Ibra judges each
 * one. Letting the button work regardless is what makes an emergency claim
 * free, and that is what the rule is protecting against.
 */
const CHANGE_CUTOFF_MS = 24 * 60 * 60 * 1000;

function tooLateToChange(startAt: string) {
  return Date.parse(startAt) - Date.now() < CHANGE_CUTOFF_MS;
}

/**
 * A server-to-server call carrying the service-role key — the admin panel,
 * which cancels through this endpoint so that one code path sends the emails
 * and clears the calendar. The exemption has to be earned by the key, not
 * assumed: the manage token travels in email and reaches this function from
 * the visitor's browser with only the anon key.
 */
function internalCall(req: Request) {
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const bearer = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "");
  return serviceRoleKey.length > 0 && bearer === serviceRoleKey;
}

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
          // The language the booking was made in, so the page reads in the
          // language of the email the link came from rather than in whatever
          // the browser last had stored.
          language: booking.language ?? "ro",
          // Computed here so the page and this function apply the same cutoff
          // to the same clock.
          changes_allowed: booking.status === "confirmed" && !tooLateToChange(booking.start_at),
        },
        tz: TZ,
      });
    }

    if (booking.status !== "confirmed") {
      return json({ error: "booking is not active" }, 409);
    }

    // Both DELETE and PATCH are changes, and both stop at the same cutoff —
    // for the student. The cutoff protects Ibra's time from a late cancellation,
    // so it cannot be allowed to stop Ibra: admin-registrations cancels a
    // booking through this same endpoint with the service-role key, and that is
    // exactly what he does for the emergency the blocked screen tells people to
    // write in about.
    if (!internalCall(req) && tooLateToChange(booking.start_at)) {
      return json({ error: "too late to change", code: "too_late" }, 409);
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
      const body = (await req.json()) as { start_at?: string; force?: boolean };
      if (!body?.start_at) return json({ error: "start_at required" }, 400);
      // The owner, through admin-registrations, with the service-role key.
      const admin = internalCall(req);
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
      const outsideAvailability =
        !offered.includes(startISO) || !passesTimingRules(et, booking.format, startISO);
      // A student may only move a booking to a slot this site would have
      // offered them: inside the published hours, and inside the notice and
      // advance windows. The owner is not bound by his own opening hours --
      // "same time next week, but at nine, just this once" is a normal thing
      // to agree with a student, and refusing it in the panel is what sends
      // him to edit Google Calendar by hand instead, which is the direction
      // that does not sync back. He is still told when a time is outside
      // them; see `outside_availability` in the conflict reply below.
      if (!admin && outsideAvailability) {
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
      // Named rather than counted: "slot taken" tells the owner nothing he can
      // act on, and the three causes have different answers -- another student
      // means pick a different time, his own calendar might be a thing he is
      // willing to move, a group lesson almost certainly is not.
      const found: string[] = [];
      for (const b of clashes ?? []) {
        if (overlaps(s, e, Date.parse(b.start_at), Date.parse(b.end_at))) {
          found.push("another_booking");
          break;
        }
      }
      for (const b of busy) {
        if (overlaps(s, e, Date.parse(b.start), Date.parse(b.end))) {
          found.push("calendar");
          break;
        }
      }
      for (const b of cohortBusyForDays(cohorts ?? [], [day])) {
        if (overlaps(s, e, b.start, b.end)) {
          found.push("group_lesson");
          break;
        }
      }
      // A student is simply refused, exactly as before. The owner is refused
      // once, with the reasons, and goes through on a second call that says
      // force -- so overriding is deliberate rather than a button that
      // silently double-books him.
      if (found.length > 0 && (!admin || body.force !== true)) {
        return json(
          { error: "slot taken", code: "conflict", clashes: found, outside_availability: outsideAvailability },
          409,
        );
      }
      // Nothing clashes, but it is outside the published hours: say so and let
      // the second call confirm. Silence here would make the panel look like
      // it had quietly extended his working week.
      if (found.length === 0 && admin && outsideAvailability && body.force !== true) {
        return json(
          { error: "outside availability", code: "outside_availability", clashes: [], outside_availability: true },
          409,
        );
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