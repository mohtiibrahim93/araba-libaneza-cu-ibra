// Course model for the new Cursuri section. Backed by the extended
// group_cohorts table (see migration 20260722120000). This module is the
// shared vocabulary — types + display labels — used by the public listing,
// the individual course page, and the admin CRUD. No data fetching here.

export type AgeCategory = "adulti" | "adolescenti" | "copii";
export type CourseType = "grup" | "privat";
export type Modality = "online" | "fizic";

export type CourseStatus =
  | "draft"
  | "forming"
  | "minimum_reached"
  | "confirmed"
  | "full"
  | "in_progress"
  | "completed"
  | "cancelled";

export const AGE_LABELS: Record<AgeCategory, { ro: string; en: string }> = {
  adulti: { ro: "Adulți", en: "Adults" },
  adolescenti: { ro: "Adolescenți", en: "Teens" },
  copii: { ro: "Copii", en: "Kids" },
};

export const MODALITY_LABELS: Record<Modality, { ro: string; en: string }> = {
  online: { ro: "Online", en: "Online" },
  fizic: { ro: "Fizic, în București", en: "In person, Bucharest" },
};

export const COURSE_TYPE_LABELS: Record<CourseType, { ro: string; en: string }> = {
  grup: { ro: "Grup", en: "Group" },
  privat: { ro: "Privat", en: "Private" },
};

/** Rich bilingual prose stored in group_cohorts.content (JSONB). All optional. */
export interface CourseContent {
  short_ro?: string;
  short_en?: string;
  long_ro?: string;
  long_en?: string;
  audience_ro?: string;
  audience_en?: string;
  prerequisites_ro?: string;
  prerequisites_en?: string;
  objectives_ro?: string;
  objectives_en?: string;
  curriculum_ro?: string;
  curriculum_en?: string;
  method_ro?: string;
  method_en?: string;
  materials_ro?: string;
  materials_en?: string;
  teacher_ro?: string;
  teacher_en?: string;
  policies_ro?: string;
  policies_en?: string;
  payment_ro?: string;
  payment_en?: string;
  faq?: { q_ro?: string; q_en?: string; a_ro?: string; a_en?: string }[];
}

/** A course row (extended group_cohorts) plus derived seat counts. */
export interface Course {
  id: string;
  form_type: "group" | "kids";
  age_category: AgeCategory | null;
  course_type: CourseType;
  level: string | null;
  format: Modality | null;
  slug: string | null;
  title_ro: string | null;
  title_en: string | null;
  start_date: string; // YYYY-MM-DD
  end_date: string | null;
  schedule_label_ro: string;
  schedule_label_en: string;
  session_count: number | null;
  total_hours: number | null;
  price_lei: number | null;
  image_url: string | null;
  max_seats: number;
  status: CourseStatus;
  is_active: boolean;
  sort_order: number;
  content: CourseContent;
  // Derived at fetch time from the signup-count RPC:
  taken?: number;
  seatsLeft?: number;
  full?: boolean;
}

export type StatusTone =
  | "open"
  | "low"
  | "waitlist"
  | "full"
  | "soon"
  | "progress"
  | "done"
  | "cancelled";

export interface StatusBadge {
  ro: string;
  en: string;
  tone: StatusTone;
}

/** How many seats left counts as "last spots". */
export const LOW_SEATS_THRESHOLD = 3;

/** Statuses joinable from the public site (mirror of useGroupCohorts). */
export const PUBLIC_COURSE_STATUSES: CourseStatus[] = [
  "forming",
  "minimum_reached",
  "confirmed",
  "full",
];

/**
 * Map the internal lifecycle status (+ remaining seats) to the enrollment
 * badge the visitor sees, per the redesign spec: Înscrieri deschise / Ultimele
 * locuri / Listă de așteptare / Complet / În curând / Încheiat.
 */
export function courseStatusBadge(status: CourseStatus, seatsLeft?: number): StatusBadge {
  switch (status) {
    case "full":
      return { ro: "Listă de așteptare", en: "Waitlist", tone: "waitlist" };
    case "in_progress":
      return { ro: "În desfășurare", en: "In progress", tone: "progress" };
    case "completed":
      return { ro: "Încheiat", en: "Finished", tone: "done" };
    case "cancelled":
      return { ro: "Anulat", en: "Cancelled", tone: "cancelled" };
    case "draft":
      return { ro: "În curând", en: "Coming soon", tone: "soon" };
    // forming / minimum_reached / confirmed = enrollment open
    default:
      if (typeof seatsLeft === "number" && seatsLeft <= 0) {
        return { ro: "Complet", en: "Full", tone: "full" };
      }
      if (typeof seatsLeft === "number" && seatsLeft <= LOW_SEATS_THRESHOLD) {
        return { ro: "Ultimele locuri", en: "Last spots", tone: "low" };
      }
      return { ro: "Înscrieri deschise", en: "Enrolling now", tone: "open" };
  }
}

/** Display title: explicit title, else level-derived, else a generic label. */
export function courseTitle(c: Pick<Course, "title_ro" | "title_en" | "level">, lang: "ro" | "en"): string {
  const explicit = lang === "en" ? c.title_en : c.title_ro;
  if (explicit) return explicit;
  if (c.level) return `Arabă Libaneză ${c.level.toUpperCase()}`;
  return lang === "en" ? "Lebanese Arabic course" : "Curs de arabă libaneză";
}
