/**
 * Public title pieces for a running group card on the level pages
 * ("Grupe în desfășurare"): whether a cohort counts as running, the group
 * number taken from its admin name, and the localized "7 noiembrie" start
 * label.
 */

/** A group runs once marked in progress, or once its start date has come. */
export const isRunningCohort = (
  status: string,
  startDate: string,
  today: string,
): boolean =>
  status === "in_progress" ||
  (["forming", "minimum_reached", "confirmed"].includes(status) &&
    startDate <= today);

/**
 * The group number as named in the admin ("… Grupa 2"), so the public card
 * matches what the owner calls the group. Groups whose admin name carries no
 * number — for example the first A1 group, which ran before the site kept
 * records — show no number rather than an invented one.
 */
export const groupNumberFromTitle = (title: string | null): number | null => {
  const m = title?.match(/\bgrupa\s+(\d+)\b/i) ?? title?.match(/\bgroup\s+(\d+)\b/i);
  return m ? Number(m[1]) : null;
};

/**
 * The public group-card title: level • format • language • grupa N • start
 * date. Empty pieces (a group whose admin name carries no number) drop out
 * instead of leaving a stray bullet.
 */
export const groupTitle = (parts: Array<string | null>): string =>
  parts.filter((p): p is string => Boolean(p)).join(" • ");

/** "7 noiembrie" / "7 November" from a YYYY-MM-DD start date. */
export const startLabel = (startDate: string, lang: "ro" | "en"): string =>
  new Date(`${startDate}T12:00:00Z`).toLocaleDateString(
    lang === "en" ? "en-GB" : "ro-RO",
    { day: "numeric", month: "long", timeZone: "UTC" },
  );
