import type { Registration } from "./types";

export const cohortStatusLabels: Record<string, string> = {
  draft: "Draft",
  forming: "În formare",
  minimum_reached: "Minim atins",
  confirmed: "Confirmată",
  full: "Plină",
  in_progress: "În desfășurare",
  completed: "Încheiată",
  cancelled: "Anulată",
};
export const teachingLanguageLabels: Record<string, string> = {
  ro: "Română",
  en: "Engleză",
};
export const ageCategoryLabels: Record<string, string> = {
  adulti: "Adulți",
  adolescenti: "Adolescenți",
  copii: "Copii",
};
export function registrationFormatLabel(r: Registration) {
  const format = r.cohort ? r.cohort.format : r.format;
  return format === "online"
    ? "Online"
    : format === "fizic" || format === "physical"
      ? "În persoană"
      : "Format nespecificat";
}
/**
 * One name for a group everywhere in admin (owner, 1 Nov 2026): two groups of
 * the same level and format differ only by the teaching language, so the
 * name always says it. "A1 · Online · în română", or the owner's own title
 * followed by format and language.
 */
export function cohortAdminTitle(c: {
  title_ro?: string | null;
  title_en?: string | null;
  level?: string | null;
  format?: string | null;
  teaching_language?: string | null;
}) {
  const base = c.title_ro || c.title_en || `Grupă ${c.level || ""}`.trim();
  const format =
    c.format === "online"
      ? "Online"
      : c.format === "fizic"
        ? "În persoană"
        : null;
  const language =
    c.teaching_language === "en"
      ? "în engleză"
      : c.teaching_language === "ro"
        ? "în română"
        : null;
  const lower = base.toLowerCase();
  return [
    base,
    format && !lower.includes(format.toLowerCase()) ? format : null,
    language && !lower.includes(language) ? language : null,
  ]
    .filter(Boolean)
    .join(" · ");
}

export function courseDate(iso: string | null | undefined) {
  if (!iso) return "Nespecificată";
  const day = iso.slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) return "Nespecificată";
  return day.split("-").reverse().join(".");
}

/** A selected cohort is authoritative; never infer it from level or site language. */
export default function RegistrationCourse({
  registration: r,
}: {
  registration: Registration;
}) {
  const c = r.cohort;
  const language = c ? c.teaching_language : r.teaching_language;
  return (
    <div className="mt-1.5 space-y-1 text-xs">
      {c ? (
        <>
          <p className="font-semibold">
            {cohortAdminTitle(c)}
          </p>
          <p>
            Start: {courseDate(c.start_date)} ·{" "}
            {cohortStatusLabels[c.status] ?? c.status}
          </p>
          {c.schedule_label_ro && <p>{c.schedule_label_ro} · ora României</p>}
          {c.level && <p>Nivel: {c.level}</p>}
          {c.age_category && (
            <p>{ageCategoryLabels[c.age_category] ?? c.age_category}</p>
          )}
        </>
      ) : r.form_type === "group" || r.form_type === "kids" ? (
        <p className="font-medium text-amber-700 dark:text-amber-400">
          {r.cohort_id
            ? "Grupa nu mai este disponibilă"
            : "Fără grupă atribuită"}
        </p>
      ) : null}
      {language && (
        <p>Predare: {teachingLanguageLabels[language] ?? language}</p>
      )}
    </div>
  );
}
