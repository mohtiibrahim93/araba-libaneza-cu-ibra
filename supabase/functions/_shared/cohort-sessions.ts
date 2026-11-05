// Group lessons from the owner's Google Calendar (October 2026).
//
// Pure helpers, no Deno or network, so the site's tests can run them. The
// edge function (admin-registrations: sync_cohort_sessions) does the reading
// and writing; these decide what an event is and which lessons are missing.
//
// The owner names each lesson "<course>-L<N>": in the calendar today they read
// "Adulti-A1- Grupa 2-  Libaneza-L11", "Adulti- A2- Grupa 1- Libaneza-L12" and
// "Curs A1 online Araba Libaneza … L14". Spacing, dashes, case and diacritics
// vary between events typed by hand, so matching ignores all of them, and
// "Lecția N" / "Lectia N" are read as well as "LN".

/** Lowercase, no diacritics, every run of other characters one space. */
export function normTitle(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/** The lesson number when `summary` is a lesson of the course `prefix`, else null. */
export function lessonNumber(
  summary: string | null | undefined,
  prefix: string,
): number | null {
  if (!summary || !prefix.trim()) return null;
  const s = normTitle(summary);
  const p = normTitle(prefix);
  if (!(s === p || s.startsWith(p + " "))) return null;
  // After the course name: "l14", "l 14", "lectia 14".
  const m = s.slice(p.length).match(/\b(?:lectia|l) ?(\d{1,3})\b/);
  if (!m) return null;
  const n = Number(m[1]);
  return n > 0 ? n : null;
}

/**
 * The title for lesson `n`, written exactly like the group's latest lesson:
 * its last number is swapped for `n`, so "Adulti-A1- Grupa 2-  Libaneza-L11"
 * gives "Adulti-A1- Grupa 2-  Libaneza-L12" and the owner's calendar stays
 * consistent with what he types himself.
 */
export function titleForLesson(
  lastSummary: string,
  lastNumber: number,
  n: number,
): string {
  const re = new RegExp(`(\\D|^)${lastNumber}(?!.*\\d)`);
  return re.test(lastSummary)
    ? lastSummary.replace(re, `$1${n}`)
    : `${lastSummary} L${n}`;
}

export interface Meeting {
  /** 0 = Sunday .. 6 = Saturday, as in cohort_meetings. */
  weekday: number;
  /** "HH:MM" or "HH:MM:SS", local (Europe/Bucharest) time. */
  start_time: string;
  end_time: string;
}

export interface PlannedLesson {
  lesson_number: number;
  /** Local date, YYYY-MM-DD. */
  date: string;
  start_time: string;
  end_time: string;
}

const hm = (t: string) => t.slice(0, 5);

/**
 * The lessons still to add after `lastNumber`, on the group's weekly pattern,
 * starting the day after `lastDate` (local), until `total`.
 *
 * Breaks are not invented here: the owner marks a break by moving or removing
 * lessons in the calendar, and the next sync plans from whatever is there.
 */
export function planRemaining(input: {
  lastNumber: number;
  lastDate: string;
  meetings: Meeting[];
  total: number;
}): PlannedLesson[] {
  const { lastNumber, lastDate, meetings, total } = input;
  if (lastNumber >= total || meetings.length === 0) return [];
  const byDay = [...meetings].sort((a, b) =>
    a.start_time.localeCompare(b.start_time),
  );
  const out: PlannedLesson[] = [];
  const [y, m, d] = lastDate.split("-").map(Number);
  // Noon UTC on the local date: stepping by whole days never slips a day.
  let t = Date.UTC(y!, m! - 1, d!, 12);
  let n = lastNumber;
  // Bounded: two years of days is far beyond any course.
  for (let i = 0; i < 730 && n < total; i++) {
    t += 86_400_000;
    const day = new Date(t);
    const weekday = day.getUTCDay();
    for (const mt of byDay) {
      if (mt.weekday !== weekday || n >= total) continue;
      n += 1;
      out.push({
        lesson_number: n,
        date: day.toISOString().slice(0, 10),
        start_time: hm(mt.start_time),
        end_time: hm(mt.end_time),
      });
    }
  }
  return out;
}

/** A group month is 8 lessons (classes run twice a week). */
export const LESSONS_PER_MONTH = 8;

/** How many months a course of `total` lessons runs. */
export function courseMonths(total: number): number {
  return Math.ceil(total / LESSONS_PER_MONTH);
}

/** At most this many months can be missed before a group closes to new students. */
export const MAX_MISSED_MONTHS = 4;

/**
 * Last month during which someone can still join a running group.
 *
 * A 4-month course (A1) closes at the end of month 2, so two months with the
 * group are still left. A longer course closes after 4 missed months, and
 * never in its last month: month 4 of a 7-month course (A2) and of a 9-month
 * course (B1–C2).
 */
export function lastJoinableMonth(total: number): number {
  const months = courseMonths(total);
  const monthsStillLeft = months <= 4 ? 2 : 1;
  return Math.max(
    0,
    Math.min(MAX_MISSED_MONTHS, months - monthsStillLeft),
  );
}

/**
 * Whether someone can still join a running group: yes through the end of
 * `lastJoinableMonth`, no once that month's lessons are done.
 */
export function canStillJoin(lessonsDone: number, total: number): boolean {
  if (total <= 0) return false;
  return lessonsDone < joinClosesAfter(total);
}

/** The last lesson after which joining closes. */
export function joinClosesAfter(total: number): number {
  return lastJoinableMonth(total) * LESSONS_PER_MONTH;
}

/**
 * What a late joiner pays to catch up the lessons the group has already had.
 *
 * Up to 4 missed lessons: 200 lei, whatever the group costs. After that, the
 * group's own monthly price for each month started (8 lessons): 500 lei for
 * A1 online, 700 lei for A1 in person, 600 lei for A2 online, and so on.
 * `monthlyRon` is that price. The fee pays for as much time with the teacher
 * as the catch-up needs.
 */
export function catchUpFee(lessonsMissed: number, monthlyRon: number): number {
  if (lessonsMissed <= 0) return 0;
  if (lessonsMissed <= 4) return 200;
  const month = monthlyRon > 0 ? monthlyRon : 500;
  return Math.ceil(lessonsMissed / LESSONS_PER_MONTH) * month;
}

/**
 * The lessons still missing from a group's calendar, each on its own slot of
 * the weekly pattern — so lessons can be added one at a time, or four, or all,
 * in any order, and every lesson keeps the same date it would have had.
 *
 * The plan starts after the end of the run of lessons that follows the most
 * recent past lesson (gaps further back are history, not work). Numbers that
 * already exist in the calendar keep their slot and are left out.
 */
export function planMissing(input: {
  /** Lessons in the calendar: number and local date (YYYY-MM-DD). */
  lessons: Array<{ n: number; date: string }>;
  /** Highest lesson number that has already taken place (0 if none). */
  pastMax: number;
  meetings: Meeting[];
  total: number;
  /** For a group with no lessons yet: its first day. */
  startDate: string;
}): PlannedLesson[] {
  const { lessons, pastMax, meetings, total, startDate } = input;
  const have = new Set(lessons.map((l) => l.n));
  let anchor: { n: number; date: string } | null = null;
  if (lessons.length) {
    const sorted = [...lessons].sort(
      (a, b) => a.n - b.n || a.date.localeCompare(b.date),
    );
    for (const l of sorted) {
      if (l.n >= pastMax && !have.has(l.n + 1)) {
        anchor = l;
        break;
      }
    }
    anchor ??= sorted[sorted.length - 1]!;
  }
  const dayBefore = new Date(Date.parse(`${startDate}T12:00:00Z`) - 86_400_000)
    .toISOString()
    .slice(0, 10);
  return planRemaining({
    lastNumber: anchor ? anchor.n : 0,
    lastDate: anchor ? anchor.date : dayBefore,
    meetings,
    total,
  }).filter((p) => !have.has(p.lesson_number));
}

/**
 * The owner's common structure for a group's calendar name (October 2026):
 * "Curs - Arabă Libaneză - Adulți - Online - A1 - Grupa 1". Lessons add
 * " - L<N>".
 */
export function commonCalendarName(input: {
  kids: boolean;
  format: string | null;
  level: string | null;
  grupa: string;
}): string {
  const where = input.format === "online" ? "Online" : "Fizic";
  return [
    "Curs",
    "Arabă Libaneză",
    input.kids ? "Copii" : "Adulți",
    where,
    input.level ?? "",
    `Grupa ${input.grupa}`,
  ]
    .filter((p) => p.trim())
    .join(" - ");
}
