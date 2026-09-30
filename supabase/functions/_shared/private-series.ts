// Private lessons booked as a weekly series: the dates, and the metadata that
// carries the choice through Stripe. Dependency-free on purpose so it can be
// unit-tested outside Deno — same reasoning as prices.ts and schedule-rules.ts.

import { TZ, utcToZonedParts } from "./schedule-rules.ts";

/** Most lessons a single purchase books in one go (the package sizes go to 20). */
export const MAX_SERIES_LESSONS = 40;

/**
 * The start of each lesson in a weekly series: the same weekday and the same
 * wall-clock time in Bucharest, `count` weeks in a row.
 *
 * Adding 7 × 24 h would drift by an hour across the October and March clock
 * changes — a Tuesday 18:00 lesson would turn into 17:00 — so each date is
 * rebuilt from the local calendar date and time instead.
 */
export function weeklySeriesStarts(firstIso: string, count: number, tz = TZ): string[] {
  const first = new Date(firstIso);
  if (!Number.isFinite(first.getTime())) return [];
  const n = Math.max(1, Math.min(MAX_SERIES_LESSONS, Math.floor(count)));
  const p = utcToZonedParts(first, tz);
  const out: string[] = [];
  for (let k = 0; k < n; k++) {
    // Date.UTC normalises day overflow, so this walks across month ends.
    const day = new Date(Date.UTC(p.year, p.month - 1, p.day + 7 * k));
    out.push(
      localToUtcIso(day.getUTCFullYear(), day.getUTCMonth() + 1, day.getUTCDate(), p.hour, p.minute, tz),
    );
  }
  return out;
}

/** A local Y-M-D H:M in `tz` as a UTC ISO string. Handles DST. */
function localToUtcIso(year: number, month: number, day: number, hour: number, minute: number, tz: string) {
  const guess = Date.UTC(year, month - 1, day, hour, minute);
  const seen = utcToZonedParts(new Date(guess), tz);
  const asLocal = Date.UTC(seen.year, seen.month - 1, seen.day, seen.hour, seen.minute);
  return new Date(guess + (guess - asLocal)).toISOString();
}

/**
 * Which lessons a paid private purchase books: only the first one, or the
 * first and the same slot every week for the rest of the package.
 */
export function privateLessonStarts(meta: {
  booking_start_at?: string | null;
  booking_weekly?: string | null;
  quantity?: string | number | null;
}): string[] {
  const start = meta.booking_start_at;
  if (!start) return [];
  const qty = Number.parseInt(String(meta.quantity ?? "1"), 10);
  const count = meta.booking_weekly === "1" && Number.isFinite(qty) && qty > 1 ? qty : 1;
  return weeklySeriesStarts(start, count);
}
