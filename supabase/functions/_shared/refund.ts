// Refund policy — single source of truth for what a cancelling student gets
// back. Mirrors the published Terms (src/pages/Terms.tsx, section 4); if one
// changes, change both. Dependency-free on purpose so it can be unit-tested
// outside Deno, like prices.ts.
//
// Owner's rule, 8 November 2026 (replaces the old 10% administrative fee):
//
//   1. Cancelled 7 or more days BEFORE the start → everything paid comes
//      back, minus only the processing fee Stripe kept.
//   2. Less than 7 days before, or within the first two lessons → the lessons
//      already held are kept (pro rata) plus the Stripe fee; the rest comes
//      back. Lesson 1 works as a test lesson.
//   3. After the second lesson → the month now running is not refunded in
//      money: its unused lessons become credit (valid 6 months, or private
//      lessons at the private-lesson price). Months not started yet come
//      back, minus the Stripe fee.
//
// Worked example — a 2000 lei course of 32 lessons (8 a month), Stripe fee
// 30 lei:
//   1 lesson taken:  kept 62.50, refunded 2000 - 62.50 - 30 = 1907.50
//   5 lessons taken: month 1 (500) stays — 312.50 used, 187.50 credit —
//                    months 2–4 (1500) refunded minus 30 = 1470.00

/** Days before the start date up to which nothing but the Stripe fee is kept. */
export const FULL_REFUND_DAYS = 7;

/** Lessons up to which a started course is still refunded in money. */
export const TEST_LESSONS = 2;

/** Lessons in one paid month of a group course. */
export const LESSONS_PER_MONTH = 8;

/**
 * Lessons in a full group course, per CEFR level. Mirrors `lessons` in
 * src/data/curriculum.ts — the test cross-checks the two so they cannot drift.
 */
export const COURSE_LESSONS: Record<string, number> = {
  A1: 32,
  A2: 56,
  B1: 72,
  B2: 72,
  C1: 72,
  C2: 72,
};

export type RefundTier = "full" | "fee-only" | "pro-rata" | "credit";

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
  /** The processing fee Stripe kept on the payment, in bani. Unknown = 0. */
  stripeFeeBani?: number | null;
  /**
   * Lessons in one paid month. Omit for private lessons, which have no
   * monthly rule: their unused lessons always come back.
   */
  lessonsPerMonth?: number | null;
}

export interface RefundBreakdown {
  tier: RefundTier;
  /** Whole days between the cancellation and the start; negative once started. */
  daysBeforeStart: number | null;
  pricePerLessonBani: number;
  lessonsRemaining: number;
  /** Value of the lessons already taken — never refunded. */
  nonRefundableBani: number;
  /** Value of the lessons still to come. */
  remainingValueBani: number;
  /** Unused lessons of the running month, kept as credit, not money. */
  creditBani: number;
  /** The Stripe processing fee kept back. */
  feeBani: number;
  /** What to actually send back through Stripe. */
  refundBani: number;
}

const DAY_MS = 86_400_000;

const round = (n: number): number => Math.round(n);

const clamp = (n: number, lo: number, hi: number): number =>
  Math.min(hi, Math.max(lo, n));

/**
 * Applies the published refund policy. Pure, so it is testable and auditable.
 * Always: nonRefundable + credit + fee + refund = paid.
 */
export function computeRefund(input: RefundInput): RefundBreakdown {
  const paid = Math.max(0, Math.round(input.paidBani));
  const total =
    Number.isFinite(input.totalLessons) && input.totalLessons > 0
      ? Math.floor(input.totalLessons)
      : 0;
  const taken =
    total > 0 ? clamp(Math.floor(input.lessonsTaken ?? 0), 0, total) : 0;
  const remainingLessons = total > 0 ? total - taken : 0;
  const valueOf = (lessons: number) =>
    total > 0 ? round((paid * lessons) / total) : 0;
  const stripeFee = Math.max(0, Math.round(Number(input.stripeFeeBani) || 0));

  const cancelledMs = Date.parse(input.cancelledAt ?? new Date().toISOString());
  const startMs = input.courseStartsAt ? Date.parse(input.courseStartsAt) : NaN;
  const daysBeforeStart = Number.isFinite(startMs)
    ? Math.floor((startMs - cancelledMs) / DAY_MS)
    : null;

  const finish = (
    tier: RefundTier,
    nonRefundableBani: number,
    creditBani: number,
  ): RefundBreakdown => {
    const back = Math.max(0, paid - nonRefundableBani - creditBani);
    const feeBani = Math.min(stripeFee, back);
    return {
      tier,
      daysBeforeStart,
      pricePerLessonBani: total > 0 ? round(paid / total) : 0,
      lessonsRemaining: remainingLessons,
      nonRefundableBani,
      remainingValueBani: paid - nonRefundableBani,
      creditBani,
      feeBani,
      refundBani: back - feeBani,
    };
  };

  if (daysBeforeStart !== null && daysBeforeStart >= FULL_REFUND_DAYS)
    return finish("full", 0, 0);

  const started = daysBeforeStart !== null ? daysBeforeStart < 0 : taken > 0;
  if (!started) return finish("fee-only", 0, 0);

  const perMonth =
    input.lessonsPerMonth && input.lessonsPerMonth > 0
      ? Math.floor(input.lessonsPerMonth)
      : 0;
  if (taken <= TEST_LESSONS || perMonth === 0)
    return finish("pro-rata", valueOf(taken), 0);

  // After the second lesson the running month stays: used lessons are kept,
  // its unused lessons become credit; the months after it come back.
  const monthEnd = Math.min(total, Math.ceil(taken / perMonth) * perMonth);
  const nonRefundable = valueOf(taken);
  return finish("credit", nonRefundable, valueOf(monthEnd) - nonRefundable);
}

/** Formats bani as a Romanian lei string, e.g. 151875 → "1.518,75 lei". */
export function formatBani(bani: number): string {
  return `${(bani / 100).toLocaleString("ro-RO", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} lei`;
}
