// Private lesson packages: which lessons use up the package, and their
// numbers (owner's rules, 26 October 2026). Dependency-free on purpose, so
// the site's tests and every edge function apply the same rule.
//
// - A lesson that took place, or a no-show, counts.
// - A late cancellation by the student (under 24 hours) counts: the owner
//   marks it "pierdută" (lost) when cancelling.
// - A cancellation more than 24 hours ahead does not count, nor one by the
//   owner.
// - The owner can always decide otherwise: "scuzat" (excused) never counts,
//   "pierdută" (lost) always does — after a student's appeal, for instance.
//
// Numbers follow the date: the counted lessons of a package, oldest first,
// are 1, 2, 3… so a lesson moved or excused renumbers the rest by itself.

export interface PackageLessonRow {
  id: string;
  start_at: string;
  status: string;
  event_type_slug: string;
  /** done | excused | lost | null — the owner's word (trial_outcome column). */
  trial_outcome?: string | null;
}

/** Whether this lesson uses up one lesson of its package. */
export function countsAgainstPackage(b: PackageLessonRow): boolean {
  if (b.event_type_slug === "trial" || b.event_type_slug === "verificare-nivel")
    return false;
  if (b.trial_outcome === "excused") return false;
  if (b.trial_outcome === "lost") return true;
  return b.status === "confirmed" || b.status === "completed";
}

/** Lesson id → its number in the package (1-based, by date). */
export function packageNumbers(rows: PackageLessonRow[]): Map<string, number> {
  const counted = rows
    .filter(countsAgainstPackage)
    .sort(
      (a, b) =>
        Date.parse(a.start_at) - Date.parse(b.start_at) ||
        a.id.localeCompare(b.id),
    );
  return new Map(counted.map((b, i) => [b.id, i + 1]));
}

/** How many lessons of the package are used (taken, booked, or lost). */
export function lessonsUsed(rows: PackageLessonRow[]): number {
  return rows.filter(countsAgainstPackage).length;
}

/** The Google Calendar title the owner chose: "Ioan - Araba libaneza- L3/10". */
export function packageTitle(name: string, n: number, total: number): string {
  return `${name.trim()} - Araba libaneza- ${packageLessonLabel(n, total)}`;
}

/** The short label the panel and the emails show: "L3/10". */
export function packageLessonLabel(n: number, total: number): string {
  return `L${n}/${total}`;
}

/** The words the student emails use: "Lecția 3 din 10" / "Lesson 3 of 10". */
export function lessonOfPackage(
  n: number,
  total: number,
  lang: "ro" | "en" = "ro",
): string {
  return lang === "en" ? `Lesson ${n} of ${total}` : `Lecția ${n} din ${total}`;
}
