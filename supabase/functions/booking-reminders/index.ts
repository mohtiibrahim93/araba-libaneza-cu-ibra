import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { json as _json } from "../_shared/booking.ts";
import { fmtBookingLocal, manageUrl } from "../_shared/booking-emails.ts";
import { sendTemplateEmail } from "../_shared/managed-email.ts";
import { buildCorsHeaders } from "../_shared/cors.ts";
import {
  reminderDue,
  reminderInLabel,
  type ReminderBooking,
} from "../_shared/reminder-schedule.ts";

/**
 * Cron-driven (every 15 min). Lesson reminders on the owner's schedule
 * (27 October 2026), decided per booking by _shared/reminder-schedule.ts:
 *   - every morning at 08:00 Bucharest time, from the day after the booking
 *     (or the last move) up to and including the lesson day;
 *   - on the lesson day, also 1 hour before.
 * The stamp (morning_reminder_on / reminder_1h_sent_at) is written only once
 * the email went out, and the idempotency key names the lesson time, so a
 * retry never sends twice and a moved lesson is a new key. A move resets the
 * stamps in the database (trigger in 20261027130000_lesson_reminder_schedule).
 */
Deno.serve(async (req) => {
  const corsHeaders = buildCorsHeaders(req);
  const json = (body: unknown, status = 200) => {
    const res = _json(body, status);
    for (const [k, v] of Object.entries(corsHeaders)) res.headers.set(k, v);
    return res;
  };
  if (req.method === "OPTIONS")
    return new Response(null, { headers: corsHeaders });

  // Cron-only endpoint: require the shared secret header (fail-closed).
  const cronSecret = Deno.env.get("CRON_SECRET");
  if (!cronSecret || req.headers.get("x-cron-secret") !== cronSecret) {
    return json({ error: "Unauthorized" }, 401);
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const now = Date.now();
  const nowISO = new Date(now).toISOString();

  type ReminderRow = ReminderBooking & {
    id: string;
    student_name: string;
    student_email: string | null;
    format: string;
    meet_link: string | null;
    manage_token: string;
    language: string | null;
  };

  // Every lesson still to come gets a reminder each morning until its day, so
  // all upcoming confirmed lessons are read; the rule decides per lesson.
  const { data: upcoming, error: upcomingErr } = await supabase
    .from("bookings")
    .select(
      "id,start_at,student_name,student_email,format,meet_link,manage_token,language,reminders_from,morning_reminder_on,reminder_1h_sent_at,reminders_enabled",
    )
    .eq("status", "confirmed")
    .gt("start_at", nowISO)
    .eq("reminders_enabled", true)
    .order("start_at")
    .limit(1000);
  if (upcomingErr) console.error("[reminders] query failed", upcomingErr);

  let sent = 0;
  let failed = 0;
  for (const r of (upcoming ?? []) as unknown as ReminderRow[]) {
    const due = reminderDue(r, nowISO);
    if (!due || !r.student_email) continue;
    const lang = r.language === "en" ? "en" : "ro";
    const startMs = Date.parse(r.start_at);
    // Stamp the reminder only once the send went through (or the recipient
    // is suppressed), so a failed send is retried on the next run. The
    // idempotency key stops a double send.
    try {
      await sendTemplateEmail("booking-reminder", r.student_email, {
        templateData: {
          name: r.student_name,
          whenLabel: fmtBookingLocal(r.start_at, lang),
          inLabel: reminderInLabel(due, lang),
          format: r.format,
          meetLink: r.meet_link,
          manageUrl: manageUrl(r.manage_token),
          lang,
        },
        idempotencyKey:
          due.kind === "morning"
            ? `booking-reminder-morning-${r.id}-${due.day}-${startMs}`
            : `booking-reminder-1h-${r.id}-${startMs}`,
      });
    } catch (err) {
      console.error("[reminders] send failed; will retry", due.kind, r.id, err);
      failed++;
      continue;
    }
    // Only if the lesson was not moved meanwhile: a move resets the stamps,
    // and this must not write an old stamp over the reset.
    await supabase
      .from("bookings")
      .update(
        due.kind === "morning"
          ? { morning_reminder_on: due.day }
          : { reminder_1h_sent_at: new Date().toISOString() },
      )
      .eq("id", r.id)
      .eq("start_at", r.start_at);
    sent++;
  }
  const results = { sent, failed };

  // After the lesson (owner's request, 14 October 2026): ask the student to
  // confirm it took place, once, stamped only when the email went out.
  // Lessons that had already ended when this started were stamped by the
  // migration, so nobody gets an email about an old lesson.
  let doneChecks = 0;
  let doneCheckFailed = 0;
  const { data: ended, error: endedErr } = await supabase
    .from("bookings")
    .select("id,start_at,student_name,student_email,manage_token,language")
    .eq("status", "confirmed")
    .lte("end_at", nowISO)
    .is("done_check_sent_at", null)
    .limit(50);
  if (endedErr) console.error("[reminders] done-check query failed", endedErr);
  for (const r of (ended ?? []) as Array<{
    id: string;
    start_at: string;
    student_name: string;
    student_email: string | null;
    manage_token: string;
    language: string | null;
  }>) {
    if (!r.student_email) {
      await supabase
        .from("bookings")
        .update({ done_check_sent_at: nowISO })
        .eq("id", r.id);
      continue;
    }
    const lang = r.language === "en" ? "en" : "ro";
    try {
      await sendTemplateEmail("lesson-done-check", r.student_email, {
        templateData: {
          name: r.student_name,
          whenLabel: fmtBookingLocal(r.start_at, lang),
          confirmUrl: `${manageUrl(r.manage_token)}?done=1`,
          lang,
        },
        idempotencyKey: `lesson-done-check-${r.id}`,
      });
    } catch (err) {
      console.error(
        "[reminders] done-check send failed; will retry",
        r.id,
        err,
      );
      doneCheckFailed++;
      continue;
    }
    await supabase
      .from("bookings")
      .update({ done_check_sent_at: nowISO })
      .eq("id", r.id);
    doneChecks++;
  }

  // 48 hours after a lesson nobody confirmed, it counts as done by itself.
  const { data: autoDone, error: autoErr } = await supabase
    .from("bookings")
    .update({ status: "completed", completed_at: nowISO, completed_by: "auto" })
    .eq("status", "confirmed")
    .lte("end_at", new Date(now - 48 * 3_600_000).toISOString())
    .select("id");
  if (autoErr) console.error("[reminders] auto-complete failed", autoErr);

  return json({
    ok: true,
    results,
    done_checks: { sent: doneChecks, failed: doneCheckFailed },
    auto_completed: autoDone?.length ?? 0,
  });
});
