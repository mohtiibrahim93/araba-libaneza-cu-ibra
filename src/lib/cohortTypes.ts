/**
 * The shape of a cohort, with nothing else attached.
 *
 * These types used to live in useGroupCohorts.ts, which imports the Supabase
 * client at module scope. Anything that wanted only the type pulled the whole
 * 216 KB client onto its first-load path — `import type` is erased by the
 * bundler, but src/test/homepage-critical-path.test.ts walks imports as
 * written, and it was right to complain: one careless value import in the same
 * file and the erasure stops happening.
 *
 * useGroupCohorts re-exports both, so existing imports keep working.
 */
export interface Cohort {
  id: string;
  form_type: "group" | "kids";
  level: string | null;
  format: string | null; // 'fizic' | 'online' | null (null = either)
  start_date: string; // YYYY-MM-DD
  schedule_label_ro: string;
  schedule_label_en: string;
  max_seats: number;
  sort_order: number;
  /** Language the cohort is taught in — must match what the student needs. */
  teaching_language: "ro" | "en";
  end_date: string | null;
  /** True when end_date allows for a break whose exact dates are not settled. */
  end_date_is_estimate: boolean;
  /** Holiday break shown on the card, per language. */
  break_note_ro: string | null;
  break_note_en: string | null;
  status: CohortStatus;
  taken: number;
  seatsLeft: number;
  full: boolean;
}

export type CohortStatus =
  | "draft"
  | "forming"
  | "minimum_reached"
  | "confirmed"
  | "full"
  | "in_progress"
  | "completed"
  | "cancelled";
