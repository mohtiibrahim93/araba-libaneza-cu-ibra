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
import {
  ADMIN_RECIPIENT,
  fmtBookingLocal,
  manageUrl,
  sendBookingEmail,
  sendAdminBookingEmail,
} from "../_shared/booking-emails.ts";
import { buildCorsHeaders } from "../_shared/cors.ts";
import {
  LEVEL_CHECK_RULES,
  LEVEL_CHECK_SLUG,
  inBlackout,
  rulesForEventType,
} from "../_shared/schedule-rules.ts";
import { syncPackageTitles } from "../_shared/package-titles.ts";

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

/**
 * A package lesson counted as lost (no-show, late cancellation) can be
 * contested once, within two weeks of being marked, from the lesson page
 * (owner's rule, 26 October 2026). The owner answers within 24 hours.
 */
const APPEAL_WINDOW_MS = 14 * 24 * 60 * 60 * 1000;

// deno-lint-ignore no-explicit-any
function canAppeal(b: any) {
  if (b.event_type_slug === "trial" || b.event_type_slug === "verificare-nivel")
    return false;
  if (b.trial_outcome !== "lost" || b.appeal_at) return false;
  const markedAt = Date.parse(b.trial_outcome_at ?? b.start_at);
  return Date.now() - markedAt < APPEAL_WINDOW_MS;
}

function whatsappUrl(phone: string | null | undefined) {
  const digits = (phone ?? "").replace(/[^0-9]/g, "");
  if (digits.length < 8) return null;
  // A Romanian number written 07…: wa.me needs the country code.
  return `https://wa.me/${digits.startsWith("0") ? `4${digits}` : digits}`;
}

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
  const bearer = (req.headers.get("Authorization") ?? "").replace(
    /^Bearer\s+/i,
    "",
  );
  return serviceRoleKey.length > 0 && bearer === serviceRoleKey;
}

function client() {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
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
    "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
  });
  const json = (body: unknown, status = 200) => {
    const res = _json(body, status);
    for (const [k, v] of Object.entries(corsHeaders)) res.headers.set(k, v);
    return res;
  };
  if (req.method === "OPTIONS")
    return new Response(null, { headers: corsHeaders });

  try {
    const url = new URL(req.url);
    const parts = url.pathname.split("/").filter(Boolean);
    const token = parts[parts.length - 1];
    if (!token || token.length < 20)
      return json({ error: "missing token" }, 400);

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
          changes_allowed:
            booking.status === "confirmed" &&
            !tooLateToChange(booking.start_at),
          // Once it has ended, the student can confirm it took place.
          can_confirm_done:
            booking.status === "confirmed" &&
            !booking.trial_outcome &&
            Date.parse(booking.end_at) <= Date.now(),
          // Counted as lost: the student may ask the owner to reconsider.
          counted_as_lost: booking.trial_outcome === "lost",
          can_appeal: canAppeal(booking),
          appeal: booking.appeal_at
            ? {
                at: booking.appeal_at,
                decided_at: booking.appeal_decided_at ?? null,
                decision: booking.appeal_decision ?? null,
              }
            : null,
        },
        tz: TZ,
      });
    }

    // The student confirms the lesson took place (owner's request, 14
    // October 2026; the after-lesson email links here). Without it the
    // lesson counts as done 48 hours after it ended (booking-reminders).
    if (req.method === "POST") {
      const body = (await req.json().catch(() => ({}))) as {
        action?: string;
        text?: unknown;
      };
      if (body?.action === "appeal") {
        const text = typeof body.text === "string" ? body.text.trim() : "";
        if (text.length < 5 || text.length > 2000)
          return json({ error: "invalid text", code: "invalid_text" }, 400);
        if (!canAppeal(booking))
          return json({ error: "cannot appeal", code: "cannot_appeal" }, 409);
        const nowISO = new Date().toISOString();
        const { data: saved, error: appealErr } = await client()
          .from("bookings")
          .update({ appeal_text: text, appeal_at: nowISO })
          .eq("id", booking.id)
          .is("appeal_at", null)
          .select("id");
        if (appealErr) {
          console.error("[booking-manage] appeal failed", appealErr);
          return json({ error: "appeal failed" }, 500);
        }
        if (!saved?.length) return json({ ok: true, already: true });
        await sendBookingEmail(
          "lesson-appeal-owner",
          ADMIN_RECIPIENT,
          {
            studentName: booking.student_name,
            studentEmail: booking.student_email,
            studentPhone: booking.student_phone,
            whenLabel: fmtBookingLocal(booking.start_at, "ro"),
            appealText: text,
            whatsappUrl: whatsappUrl(booking.student_phone),
            adminUrl: "https://centruldearabalibaneza.com/admin",
          },
          `lesson-appeal-${booking.id}`,
        );
        return json({ ok: true });
      }
      if (body?.action !== "confirm_done")
        return json({ error: "unknown action" }, 400);
      if (booking.status === "completed")
        return json({ ok: true, already: true });
      if (booking.status !== "confirmed")
        return json({ error: "booking is not active" }, 409);
      if (Date.parse(booking.end_at) > Date.now())
        return json({ error: "lesson not over", code: "not_over" }, 409);
      const { error: doneError } = await client()
        .from("bookings")
        .update({
          status: "completed",
          completed_at: new Date().toISOString(),
          completed_by: "student",
        })
        .eq("id", booking.id)
        .eq("status", "confirmed");
      if (doneError) {
        console.error("[booking-manage] confirm_done failed", doneError);
        return json({ error: "confirm failed" }, 500);
      }
      return json({ ok: true });
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
      // The owner, cancelling inside the 24 hours because the student asked
      // late, says so: the lesson then counts as lost ("pierdută") against the
      // package, the owner's rule. Only the service-role call may say it.
      const cancelBody = internalCall(req)
        ? ((await req.json().catch(() => ({}))) as {
            late_by_student?: unknown;
            by?: unknown;
          })
        : {};
      const lateByStudent = cancelBody.late_by_student === true;
      // Write first, conditional on the row still being the confirmed booking
      // we loaded, so a failed or duplicate write never deletes the calendar
      // event or tells the student it is cancelled.
      let cancelQuery = supabase
        .from("bookings")
        .update({
          status: "cancelled",
          cancelled_at: new Date().toISOString(),
          google_sync_error: booking.google_event_id
            ? "cancel_update_pending"
            : null,
          ...(lateByStudent
            ? {
                trial_outcome: "lost",
                trial_outcome_at: new Date().toISOString(),
                trial_outcome_by:
                  typeof cancelBody.by === "string" ? cancelBody.by : null,
              }
            : {}),
        })
        .eq("id", booking.id)
        .eq("status", "confirmed");
      cancelQuery = booking.google_event_id
        ? cancelQuery.eq("google_event_id", booking.google_event_id)
        : cancelQuery.is("google_event_id", null);
      const { data: cancelledRows, error: cancelErr } =
        await cancelQuery.select("id");
      if (cancelErr) {
        console.error("[booking-manage] cancel write failed", cancelErr);
        return json({ error: "cancel failed" }, 500);
      }
      if (!cancelledRows?.length)
        return json({ error: "booking is not active" }, 409);
      const calendarDeleted =
        !booking.google_event_id ||
        (await gcalDeleteEvent(booking.google_event_id));
      const deletionPending =
        !calendarDeleted ||
        booking.google_sync_error === "calendar_create_pending";
      if (!deletionPending) {
        const { error } = await supabase
          .from("bookings")
          .update({ google_sync_error: null })
          .eq("id", booking.id);
        if (error)
          console.error(
            "[booking-manage] cancellation sync marker not cleared",
            error,
          );
      }
      // The package's later lessons move down a number (unless this one still
      // counts, as a late cancellation).
      await syncPackageTitles(supabase, booking.registration_id);
      sendBookingEmail(
        "booking-cancelled",
        booking.student_email,
        {
          name: booking.student_name,
          whenLabel: fmtBookingLocal(
            booking.start_at,
            booking.language ?? "ro",
          ),
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
          whenLabel: fmtBookingLocal(
            booking.start_at,
            booking.language ?? "ro",
          ),
          notes: booking.notes,
        },
        `admin-booking-cancel-${booking.id}`,
      );
      return json({
        ok: true,
        status: "cancelled",
        sync_pending: deletionPending,
      });
    }

    if (req.method === "PATCH") {
      const body = (await req.json()) as { start_at?: string; force?: boolean };
      if (!body?.start_at) return json({ error: "start_at required" }, 400);
      // The owner, through admin-registrations, with the service-role key.
      const admin = internalCall(req);
      const startMs = Date.parse(body.start_at);
      if (!Number.isFinite(startMs))
        return json({ error: "invalid start_at" }, 400);
      const et = booking.booking_event_types;
      // A moved lesson keeps its own length (a 90-minute lesson stays 90),
      // not the lesson type's default; the type's length only when unknown.
      const ownLengthMs =
        Date.parse(booking.end_at) - Date.parse(booking.start_at);
      const endMs =
        startMs +
        (Number.isFinite(ownLengthMs) && ownLengthMs > 0
          ? ownLengthMs
          : et.duration_min * 60_000);
      const startISO = new Date(startMs).toISOString();
      const endISO = new Date(endMs).toISOString();

      // The new time must be one booking-availability would offer: generated
      // from the availability rules, and inside notice / advance / format
      // rules. Same helpers as that function, so the rules cannot drift.
      const p = utcToZonedParts(new Date(startMs));
      const day = { y: p.year, m: p.month, d: p.day };
      const dayKey = `${p.year}-${String(p.month).padStart(2, "0")}-${String(p.day).padStart(2, "0")}`;
      const [{ data: rules }, { data: blackouts }] = await Promise.all([
        supabase
          .from("availability_rules")
          .select("weekday,start_time,end_time,event_type_slug")
          .eq("is_active", true),
        supabase
          .from("availability_blackouts")
          .select("start_date,end_date")
          .lte("start_date", dayKey)
          .gte("end_date", dayKey),
      ]);
      const offered = candidateSlotsForDays(
        [day],
        rulesForEventType(
          rules ?? [],
          booking.event_type_slug,
          booking.event_type_slug === LEVEL_CHECK_SLUG
            ? LEVEL_CHECK_RULES
            : undefined,
        ),
        et.duration_min,
      );
      const outsideAvailability =
        !offered.includes(startISO) ||
        !passesTimingRules(et, booking.format, startISO) ||
        inBlackout(startISO, blackouts ?? []);
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

      const checkStart = new Date(
        startMs - et.buffer_before_min * 60_000,
      ).toISOString();
      const checkEnd = new Date(
        endMs + et.buffer_after_min * 60_000,
      ).toISOString();
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
          {
            error: "slot taken",
            code: "conflict",
            clashes: found,
            outside_availability: outsideAvailability,
          },
          409,
        );
      }
      // Nothing clashes, but it is outside the published hours: say so and let
      // the second call confirm. Silence here would make the panel look like
      // it had quietly extended his working week.
      if (
        found.length === 0 &&
        admin &&
        outsideAvailability &&
        body.force !== true
      ) {
        return json(
          {
            error: "outside availability",
            code: "outside_availability",
            clashes: [],
            outside_availability: true,
          },
          409,
        );
      }

      // Atomic claim, replacement and exact Calendar link transfer. The
      // registration lock shares the contact editor's transaction order.
      const { data: created, error: moveError } = await supabase.rpc(
        "move_booking_atomically",
        {
          p_id: booking.id,
          p_expected_start: booking.start_at,
          p_expected_event: booking.google_event_id,
          p_start: startISO,
          p_end: endISO,
        },
      );
      if (moveError || !created) {
        if (moveError?.code === "23505")
          return json({ error: "slot taken", code: "conflict" }, 409);
        if (moveError?.code === "40001")
          return json(
            {
              error: "booking changed; reload and retry",
              code: "booking_changed",
            },
            409,
          );
        console.error("[booking-manage] atomic reschedule failed", moveError);
        return json({ error: "reschedule failed" }, 500);
      }

      // Patch GCal event in place (keeps id + Meet link) — only after the DB is consistent.
      const calendarPatched =
        !!booking.google_event_id &&
        (await gcalPatchEvent(booking.google_event_id, startISO, endISO));
      const contactStillPending =
        !!booking.google_sync_error ||
        created.student_name !== booking.student_name ||
        created.student_email !== booking.student_email ||
        created.student_phone !== booking.student_phone;
      let calendarConfirmed = false;
      if (calendarPatched) {
        let syncWrite = supabase
          .from("bookings")
          .update({
            google_sync_error: contactStillPending
              ? "contact_update_pending"
              : null,
          })
          .eq("id", created.id)
          .eq("status", "confirmed")
          .eq("start_at", created.start_at)
          .eq("google_sync_error", created.google_sync_error);
        for (const field of ["student_name", "student_email", "student_phone"])
          syncWrite =
            created[field] == null
              ? syncWrite.is(field, null)
              : syncWrite.eq(field, created[field]);
        const { data: syncedRows, error } = await syncWrite.select("id");
        calendarConfirmed =
          !error && !!syncedRows?.length && !contactStillPending;
        if (error)
          console.error(
            "[booking-manage] reschedule sync marker not cleared",
            error,
          );
      }

      // Numbers follow the date, so a move can reorder the package.
      await syncPackageTitles(supabase, booking.registration_id);

      sendBookingEmail(
        "booking-rescheduled",
        created.student_email,
        {
          name: created.student_name,
          oldWhenLabel: fmtBookingLocal(
            booking.start_at,
            booking.language ?? "ro",
          ),
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
          studentName: created.student_name,
          studentEmail: created.student_email,
          studentPhone: created.student_phone,
          format: booking.format === "online" ? "online" : "fizic",
          oldWhenLabel: fmtBookingLocal(
            booking.start_at,
            booking.language ?? "ro",
          ),
          newWhenLabel: fmtBookingLocal(startISO, booking.language ?? "ro"),
          notes: booking.notes,
        },
        `admin-booking-resched-${created.id}`,
      );

      return json({
        ok: true,
        manage_token: created.manage_token,
        start_at: startISO,
        sync_pending: !calendarConfirmed,
      });
    }

    return json({ error: "method not allowed" }, 405);
  } catch (err) {
    console.error("[booking-manage] error", err);
    return json({ error: "Internal server error" }, 500);
  }
});
