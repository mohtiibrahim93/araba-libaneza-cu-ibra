import type { Cohort } from "@/lib/cohortTypes";

/**
 * Turns live cohorts into the enrolment sentence the site shows.
 *
 * The site used to state its start dates in prose — "start marți 1 și
 * miercuri 2 septembrie 2026" — written by hand into i18n strings, curriculum
 * data and poster alt text. On 21 September that sentence was still on the
 * homepage, telling a visitor about a course that had begun three weeks
 * earlier. A date typed into copy cannot age.
 *
 * These dates already exist in group_cohorts, where the owner keeps them
 * current through the admin, so the copy reads them from there. Pure functions
 * so the wording is testable without a database.
 */
export interface CohortNoteStrings {
  /** "În desfășurare din {date}" */
  runningSince: string;
  /** "Începe pe {date}" */
  startsOn: string;
  /** "Începe azi" */
  today: string;
  /** "Listă de așteptare" */
  full: string;
  /** "online" */
  online: string;
  /** "fizic" */
  inPerson: string;
  /** "{n} locuri rămase" */
  spotsLeft: string;
}

const DAY_MS = 24 * 60 * 60 * 1000;

const formatDate = (iso: string, lang: "ro" | "en"): string =>
  new Date(`${iso}T00:00:00`).toLocaleDateString(lang === "en" ? "en-GB" : "ro-RO", {
    day: "numeric",
    month: "long",
  });

/** One line per cohort: level, format, when it starts or that it is running. */
export function cohortNoteLine(
  c: Cohort,
  s: CohortNoteStrings,
  lang: "ro" | "en",
  now: Date = new Date(),
): string {
  const midnight = new Date(now);
  midnight.setHours(0, 0, 0, 0);
  const start = new Date(`${c.start_date}T00:00:00`);
  const days = Math.round((start.getTime() - midnight.getTime()) / DAY_MS);
  const date = formatDate(c.start_date, lang);

  const when = c.full
    ? s.full
    : days === 0
      ? s.today
      : days < 0
        ? s.runningSince.replace("{date}", date)
        : s.startsOn.replace("{date}", date);

  const level = (c.level || "A1").toUpperCase();
  const format = c.format === "online" ? s.online : c.format === "fizic" ? s.inPerson : "";
  const head = format ? `${level} ${format}` : level;

  // Seats are only worth saying when they are running out; "10 locuri rămase"
  // on a fresh cohort reads as an empty room.
  const seats = !c.full && c.seatsLeft > 0 && c.seatsLeft <= 4
    ? ` · ${s.spotsLeft.replace("{n}", String(c.seatsLeft))}`
    : "";

  return `${head} · ${when}${seats}`;
}

export function cohortNoteLines(
  cohorts: Cohort[],
  s: CohortNoteStrings,
  lang: "ro" | "en",
  now: Date = new Date(),
): string[] {
  return cohorts.map((c) => cohortNoteLine(c, s, lang, now));
}
