// Lesson reminders — which one is due for a booking right now. Owner's rule,
// 27 October 2026, replacing the 2-days / day-of / 3h / 1h / 30m stages:
//
//   - one reminder every morning, at 08:00 Bucharest time, on each day from
//     the day after the booking up to and including the lesson day;
//   - on the lesson day, one more 1 hour before the lesson.
//
// No duplicates:
//   - nothing in the morning of the day the lesson was booked (or moved):
//     the confirmation (or the "moved" email) has just gone out;
//   - no 1-hour reminder when the lesson was booked or moved less than an
//     hour before it starts;
//   - when the lesson starts within the hour after 08:00 (before 09:00), the
//     1-hour reminder is the only one that morning.
//
// A move resets everything: the database (migration
// 20261027130000_lesson_reminder_schedule) clears both stamps and sets
// reminders_from to the time of the move whenever start_at changes, so the
// schedule starts again for the new time.
//
// Dependency-free, like refund.ts, so the rule is unit-tested outside Deno.

import {
  BUCHAREST_TZ,
  bucharestDate,
  calendarDaysBetween,
} from "./group-refund.ts";

export const MORNING_HOUR = 8;
const HOUR_MS = 3_600_000;

export interface ReminderBooking {
  start_at: string;
  /** When the booking was made, or last moved. */
  reminders_from: string;
  /** Bucharest date ("YYYY-MM-DD") of the last morning reminder sent. */
  morning_reminder_on: string | null;
  reminder_1h_sent_at: string | null;
  /** False for lessons the owner arranged himself and imported from Google. */
  reminders_enabled?: boolean | null;
}

export type ReminderDue =
  | { kind: "morning"; day: string; daysToLesson: number }
  | { kind: "hour_before" }
  | null;

/** The offset of Bucharest from UTC at an instant, in minutes. */
function bucharestOffsetMinutes(at: number): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: BUCHAREST_TZ,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).formatToParts(new Date(at));
  const get = (type: string) =>
    Number(parts.find((p) => p.type === type)?.value ?? 0);
  const asUtc = Date.UTC(
    get("year"),
    get("month") - 1,
    get("day"),
    get("hour"),
    get("minute"),
  );
  return Math.round((asUtc - Math.floor(at / 60_000) * 60_000) / 60_000);
}

/** The instant of hh:00 Bucharest time on a Bucharest date "YYYY-MM-DD". */
export function bucharestTimeOn(day: string, hour: number): number {
  const [y = 0, m = 1, d = 1] = day.split("-").map(Number);
  const guess = Date.UTC(y, m - 1, d, hour);
  // Two passes settle the offset even on the night the clocks change.
  let at = guess - bucharestOffsetMinutes(guess) * 60_000;
  at = guess - bucharestOffsetMinutes(at) * 60_000;
  return at;
}

/** Which reminder, if any, is due now. Pure. */
export function reminderDue(b: ReminderBooking, nowISO: string): ReminderDue {
  if (b.reminders_enabled === false) return null;
  const now = Date.parse(nowISO);
  const start = Date.parse(b.start_at);
  const from = Date.parse(b.reminders_from);
  if (!Number.isFinite(start) || !Number.isFinite(now) || now >= start)
    return null;
  const toStart = start - now;

  if (toStart <= HOUR_MS) {
    if (b.reminder_1h_sent_at) return null;
    // Booked or moved within the hour: the confirmation is the reminder.
    if (Number.isFinite(from) && start - from <= HOUR_MS) return null;
    return { kind: "hour_before" };
  }

  const today = bucharestDate(now);
  const lessonDay = bucharestDate(start);
  if (today > lessonDay) return null;
  if (b.morning_reminder_on && b.morning_reminder_on >= today) return null;
  if (now < bucharestTimeOn(today, MORNING_HOUR)) return null;
  // Not on the day it was booked or moved: that email has just gone out.
  if (Number.isFinite(from) && bucharestDate(from) >= today) return null;
  return {
    kind: "morning",
    day: today,
    daysToLesson: calendarDaysBetween(today, lessonDay),
  };
}

/** "today" / "tomorrow" / "in N days", as the reminder email words it. */
export function reminderInLabel(
  due: Exclude<ReminderDue, null>,
  lang: "ro" | "en",
): string {
  if (due.kind === "hour_before")
    return lang === "en" ? "in 1 hour" : "în 1 oră";
  const n = due.daysToLesson;
  if (n <= 0) return lang === "en" ? "today" : "astăzi";
  if (n === 1) return lang === "en" ? "tomorrow" : "mâine";
  return lang === "en" ? `in ${n} days` : `în ${n} zile`;
}
