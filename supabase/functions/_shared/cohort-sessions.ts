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
export function lessonNumber(summary: string | null | undefined, prefix: string): number | null {
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
export function titleForLesson(lastSummary: string, lastNumber: number, n: number): string {
  const re = new RegExp(`(\\D|^)${lastNumber}(?!.*\\d)`);
  return re.test(lastSummary) ? lastSummary.replace(re, `$1${n}`) : `${lastSummary} L${n}`;
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
  const byDay = [...meetings].sort((a, b) => a.start_time.localeCompare(b.start_time));
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

/**
 * Whether someone can still join a running group (the owner's rule, October
 * 2026): yes until the last month starts — lesson total − 8, i.e. lesson 24 of
 * a 32-lesson course — with the missed lessons caught up free of charge. In
 * the last month there is not enough time left to catch up.
 */
export function canStillJoin(lessonsDone: number, total: number): boolean {
  return lessonsDone < total - 8;
}

/** The last lesson after which joining closes. */
export function joinClosesAfter(total: number): number {
  return Math.max(0, total - 8);
}
