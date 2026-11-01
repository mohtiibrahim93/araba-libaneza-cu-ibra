// One public page per group (owner, 1 Nov 2026).
//
// A group's address names it the way the owner does: level, format, teaching
// language, its number in its series, and its start date —
// /cursuri/curs/a1-online-romana-grupa-2-7-noiembrie-2026, with the same slug
// under /en/courses/course/. The series is format + teaching language, across
// levels and counted by start date: the online Romanian groups are 1, 2, 3…,
// the first English online group is 1 again, and in person has its own count.
// Drafts and cancelled groups never ran, so they take no number.
//
// The slug is generated when the group is saved in admin and then stored
// (group_cohorts.slug), so a later cancellation or a deleted group does not
// renumber anything and a link already shared on WhatsApp keeps working.

export interface SeriesCohort {
  id: string;
  level: string | null;
  format: string | null;
  teaching_language: string | null;
  start_date: string | null;
  status: string;
}

const NO_NUMBER = new Set(["draft", "cancelled"]);

const MONTHS_RO = [
  "ianuarie",
  "februarie",
  "martie",
  "aprilie",
  "mai",
  "iunie",
  "iulie",
  "august",
  "septembrie",
  "octombrie",
  "noiembrie",
  "decembrie",
];

const sameSeries = (a: SeriesCohort, b: SeriesCohort) =>
  (a.format ?? "") === (b.format ?? "") &&
  (a.teaching_language ?? "ro") === (b.teaching_language ?? "ro");

/** The group's number in its series (format + teaching language), from 1. */
export function groupSeriesNumber(
  cohort: SeriesCohort,
  all: SeriesCohort[],
): number {
  const series = all
    .filter(
      (c) =>
        c.id === cohort.id ||
        (!NO_NUMBER.has(c.status) && sameSeries(c, cohort)),
    )
    .sort(
      (a, b) =>
        (a.start_date ?? "9999").localeCompare(b.start_date ?? "9999") ||
        a.id.localeCompare(b.id),
    );
  return series.findIndex((c) => c.id === cohort.id) + 1;
}

/** "a1-online-romana-grupa-2-7-noiembrie-2026". */
export function groupSlug(cohort: SeriesCohort, number: number): string {
  const parts = [
    (cohort.level ?? "grup").toLowerCase(),
    cohort.format === "fizic" ? "fizic" : "online",
    cohort.teaching_language === "en" ? "engleza" : "romana",
    `grupa-${number}`,
  ];
  const day = cohort.start_date?.slice(0, 10);
  if (day && /^\d{4}-\d{2}-\d{2}$/.test(day)) {
    const [y, m, d] = day.split("-").map(Number) as [number, number, number];
    parts.push(String(d), MONTHS_RO[m - 1]!, String(y));
  }
  return parts.join("-");
}

/** The group page in the reader's language. */
export function groupPagePath(slug: string, lang: "ro" | "en"): string {
  return lang === "en" ? `/en/courses/course/${slug}` : `/cursuri/curs/${slug}`;
}

/** The level page a group page points search engines and readers to. */
export function levelPagePath(level: string | null, lang: "ro" | "en") {
  const l = (level ?? "a1").toLowerCase();
  return lang === "en" ? `/en/courses/group/${l}` : `/cursuri/grup/${l}`;
}
