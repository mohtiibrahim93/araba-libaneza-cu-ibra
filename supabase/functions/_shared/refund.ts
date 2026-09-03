// Refund policy — single source of truth for what a cancelling student gets
// back. Mirrors the published Terms (src/pages/Terms.tsx, section 4); if one
// changes, change both. Dependency-free on purpose so it can be unit-tested
// outside Deno, like prices.ts.
//
// The rule, in three tiers:
//
//   1. Cancelled 7 or more days BEFORE the course starts → full refund.
//   2. Cancelled less than 7 days before the start, course not begun yet →
//      the whole course price minus a 10% administrative fee.
//   3. Course already started → lessons already taken are not refundable.
//      Of the value that remains, 10% is kept as the administrative fee and
//      the rest is returned.
//
// Worked example the policy is written against — a 2000 lei course of 32
// lessons, cancelled after 5 lessons:
//   price per lesson  2000 / 32      =   62.50
//   taken (kept)      62.50 x  5     =  312.50
//   remaining         62.50 x 27     = 1687.50
//   fee (10%)         1687.50 x 0.10 =  168.75
//   refunded          1687.50 - 168.75 = 1518.75

/** Administrative fee kept on any cancellation past the 7-day window. */
export const ADMIN_FEE_RATE = 0.1;

/** Days before the start date up to which a cancellation is refunded in full. */
export const FULL_REFUND_DAYS = 7;

/**
 * Lessons in a full group course, per CEFR level. Mirrors `lessons` in
 * src/data/curriculum.ts — the test cross-checks the two so they cannot drift.
 */
export const COURSE_LESSONS: Record<string, number> = {
  A1: 32,
  A2: 54,
  B1: 70,
  B2: 70,
  C1: 70,
  C2: 80,
};

export type RefundTier = "full" | "fee-only" | "pro-rata";

export interface RefundInput {
  /** What the student actually paid, in bani (RON x100). */
  paidBani: number;
  /** Lessons in the whole course. */
  totalLessons: number;
  /** Lessons already delivered at the moment of cancellation. */
  lessonsTaken: number;
  /** Course start date, ISO. Omit when the course has no fixed start. */
  courseStartsAt?: string | null;
  /** When the cancellation was requested, ISO. Defaults to now. */
  cancelledAt?: string | null;
}

export interface RefundBreakdown {
  tier: RefundTier;
  /** Whole days between the cancellation and the start; negative once started. */
  daysBeforeStart: number | null;
  pricePerLessonBani: number;
  lessonsRemaining: number;
  /** Value of the lessons already taken — never refunded. */
  nonRefundableBani: number;
  /** Value of the lessons still to come, before the fee. */
  remainingValueBani: number;
  /** The 10% administrative fee, or 0 in the full-refund tier. */
  feeBani: number;
  /** What to actually send back through Stripe. */
  refundBani: number;
}

const DAY_MS = 86_400_000;

/** Round to whole bani, away from zero, so no half-bani ever escapes. */
const round = (n: number): number => Math.round(n);

const clamp = (n: number, lo: number, hi: number): number =>
  Math.min(hi, Math.max(lo, n));

/**
 * Applies the published refund policy. Pure: give it the same numbers and it
 * gives the same answer, which is what makes it testable and auditable.
 *
 * Deliberately conservative on bad input — a nonsensical lesson count falls
 * back to treating the course as untouched rather than silently refunding
 * less than the student is owed.
 */
export function computeRefund(input: RefundInput): RefundBreakdown {
  const paid = Math.max(0, Math.round(input.paidBani));
  const total = Number.isFinite(input.totalLessons) && input.totalLessons > 0
    ? Math.floor(input.totalLessons)
    : 0;
  const taken = total > 0 ? clamp(Math.floor(input.lessonsTaken ?? 0), 0, total) : 0;
  const remainingLessons = total > 0 ? total - taken : 0;

  const pricePerLessonBani = total > 0 ? paid / total : 0;
  const nonRefundableBani = total > 0 ? round((paid * taken) / total) : 0;
  const remainingValueBani = paid - nonRefundableBani;

  const cancelledMs = Date.parse(input.cancelledAt ?? new Date().toISOString());
  const startMs = input.courseStartsAt ? Date.parse(input.courseStartsAt) : NaN;
  const hasStartDate = Number.isFinite(startMs);
  const daysBeforeStart = hasStartDate
    ? Math.floor((startMs - cancelledMs) / DAY_MS)
    : null;

  // Tier 1 — cancelled early enough that nothing has been committed.
  if (daysBeforeStart !== null && daysBeforeStart >= FULL_REFUND_DAYS) {
    return {
      tier: "full",
      daysBeforeStart,
      pricePerLessonBani: round(pricePerLessonBani),
      lessonsRemaining: remainingLessons,
      nonRefundableBani: 0,
      remainingValueBani: paid,
      feeBani: 0,
      refundBani: paid,
    };
  }

  // Tier 2 — late, but the course has not begun, so no lesson is consumed yet.
  const started = daysBeforeStart !== null ? daysBeforeStart < 0 : taken > 0;
  if (!started) {
    const feeBani = round(paid * ADMIN_FEE_RATE);
    return {
      tier: "fee-only",
      daysBeforeStart,
      pricePerLessonBani: round(pricePerLessonBani),
      lessonsRemaining: total > 0 ? total : 0,
      nonRefundableBani: 0,
      remainingValueBani: paid,
      feeBani,
      refundBani: paid - feeBani,
    };
  }

  // Tier 3 — under way. Lessons taken are gone; 10% of the rest is the fee.
  const feeBani = round(remainingValueBani * ADMIN_FEE_RATE);
  return {
    tier: "pro-rata",
    daysBeforeStart,
    pricePerLessonBani: round(pricePerLessonBani),
    lessonsRemaining: remainingLessons,
    nonRefundableBani,
    remainingValueBani,
    feeBani,
    refundBani: remainingValueBani - feeBani,
  };
}

/** Formats bani as a Romanian lei string, e.g. 151875 → "1.518,75 lei". */
export function formatBani(bani: number): string {
  return `${(bani / 100).toLocaleString("ro-RO", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} lei`;
}
