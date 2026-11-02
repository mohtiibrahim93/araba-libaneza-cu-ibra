// Backup list of open groups, used ONLY when the database cannot be reached
// (paused or offline). Live data always wins when it loads. Keep this in step
// with the admin when a new group opens; places are a dated snapshot.
import type { Course } from "@/lib/courses";
import type { Cohort } from "@/lib/cohortTypes";

/** Marks a row that came from this file, not the database. */
export const FALLBACK_ID_PREFIX = "fallback-";

export const FALLBACK_COURSES: Course[] = [
  {
    id: `${FALLBACK_ID_PREFIX}a1-online-ro-2026-11-07`,
    form_type: "group",
    age_category: "adulti",
    course_type: "grup",
    level: "A1",
    format: "online",
    slug: "a1-online-romana-grupa-2-7-noiembrie-2026",
    title_ro: null,
    title_en: null,
    start_date: "2026-11-07",
    end_date: null,
    schedule_label_ro: "",
    schedule_label_en: "",
    session_count: null,
    total_hours: null,
    price_lei: null,
    image_url: null,
    max_seats: 6,
    teaching_language: "ro",
    status: "forming",
    is_active: true,
    sort_order: 0,
    content: {},
    taken: 2,
    seatsLeft: 4,
    full: false,
  },
];

const today = () => new Date().toLocaleDateString("sv-SE");

/** Backup groups still open (start today or later). */
export function fallbackCourses(): Course[] {
  return FALLBACK_COURSES.filter((c) => c.start_date >= today());
}

export function fallbackCourseBySlug(slug: string | undefined): Course | null {
  return FALLBACK_COURSES.find((c) => c.slug === slug) ?? null;
}

export function fallbackCohorts(
  formType: "group" | "kids",
  level?: string | null,
  format?: string | null,
  teachingLanguage?: "ro" | "en" | null,
): Cohort[] {
  return fallbackCourses()
    .filter((c) => c.form_type === formType)
    .filter((c) => !level || (c.level ?? "") === level)
    .filter((c) => !format || !c.format || c.format === format)
    .filter(
      (c) => !teachingLanguage || (c.teaching_language ?? "ro") === teachingLanguage,
    )
    .map((c) => ({
      id: c.id,
      form_type: c.form_type,
      level: c.level,
      format: c.format,
      start_date: c.start_date,
      schedule_label_ro: c.schedule_label_ro,
      schedule_label_en: c.schedule_label_en,
      max_seats: c.max_seats,
      sort_order: c.sort_order,
      teaching_language: c.teaching_language ?? "ro",
      end_date: c.end_date,
      end_date_is_estimate: false,
      break_note_ro: null,
      break_note_en: null,
      status: c.status,
      taken: c.taken ?? 0,
      seatsLeft: c.seatsLeft ?? c.max_seats,
      full: !!c.full,
    }));
}
