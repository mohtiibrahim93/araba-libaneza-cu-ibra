import type { Cohort } from "@/lib/cohortTypes";

/**
 * The next group course a visitor can still join: the earliest cohort that has
 * not started yet and still has a free seat. Shared by the menu's green band
 * and the "Cursuri" dropdown so both always name the same course.
 */
export const nextOpenCohort = (cohorts: Cohort[], today = new Date()): Cohort | null => {
  const day = today.toISOString().slice(0, 10);
  return (
    cohorts
      .filter((c) => c.start_date > day && !c.full)
      .sort((a, b) => a.start_date.localeCompare(b.start_date))[0] ?? null
  );
};

/** "17 oct" / "17 Oct". */
export const shortDate = (iso: string, lang: "ro" | "en") =>
  new Date(`${iso}T12:00:00`).toLocaleDateString(lang === "en" ? "en-GB" : "ro-RO", {
    day: "numeric",
    month: "short",
  }).replace(".", "");

/** "17 octombrie" / "17 October". */
export const longDate = (iso: string, lang: "ro" | "en") =>
  new Date(`${iso}T12:00:00`).toLocaleDateString(lang === "en" ? "en-GB" : "ro-RO", {
    day: "numeric",
    month: "long",
  });

/** Where "sign up" for a cohort leads: its level page, with the format preset. */
export const cohortHref = (c: Cohort) =>
  `/cursuri/grup/${(c.level ?? "a1").toLowerCase()}${c.format ? `?mod=${c.format}` : ""}`;
