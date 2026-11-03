import type { Cohort } from "@/lib/cohortTypes";

/**
 * The next group course a visitor can still join: the earliest cohort that has
 * not started yet and still has a free seat. Shared by the menu's green band
 * and the "Cursuri" dropdown so both always name the same course.
 */
export const nextOpenCohort = (
  cohorts: Cohort[],
  today = new Date(),
  lang?: "ro" | "en",
): Cohort | null => {
  const day = today.toISOString().slice(0, 10);
  const open = cohorts
    .filter((c) => c.start_date > day && !c.full)
    .sort((a, b) => a.start_date.localeCompare(b.start_date));
  // A reader of the English site is shown the group taught in English first
  // (audit, 1 Nov 2026: /en showed the Romanian 7 Nov group, the English one
  // starts 21 Nov); any open group when none is taught in their language.
  return (
    (lang ? open.find((c) => c.teaching_language === lang) : undefined) ??
    open[0] ??
    null
  );
};

/** "în română" / "taught in English", for a cohort's teaching language. */
export const teachingLanguageShort = (
  c: Pick<Cohort, "teaching_language">,
  lang: "ro" | "en",
) =>
  c.teaching_language === "en"
    ? lang === "en"
      ? "taught in English"
      : "în engleză"
    : lang === "en"
      ? "taught in Romanian"
      : "în română";

/** "17 oct" / "17 Oct". */
export const shortDate = (iso: string, lang: "ro" | "en") =>
  new Date(`${iso}T12:00:00`)
    .toLocaleDateString(lang === "en" ? "en-GB" : "ro-RO", {
      day: "numeric",
      month: "short",
    })
    .replace(".", "");

/** "17 octombrie" / "17 October". */
export const longDate = (iso: string, lang: "ro" | "en") =>
  new Date(`${iso}T12:00:00`).toLocaleDateString(
    lang === "en" ? "en-GB" : "ro-RO",
    {
      day: "numeric",
      month: "long",
    },
  );

/**
 * Where "sign up" for a cohort leads: its level page, with the format and the
 * teaching language preset — so the English-taught A1 opens the form on
 * English, not on whatever language the visitor reads the site in.
 */
export const cohortHref = (c: Cohort, lang: "ro" | "en" = "ro") => {
  const q = new URLSearchParams();
  if (c.format) q.set("mod", c.format);
  if (c.teaching_language) q.set("predare", c.teaching_language);
  const qs = q.toString();
  const base = lang === "en" ? "/en/courses/group" : "/cursuri/grup";
  return `${base}/${(c.level ?? "a1").toLowerCase()}${qs ? `?${qs}` : ""}`;
};
