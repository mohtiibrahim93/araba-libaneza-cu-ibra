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
//
// Owner's rules, 14 November 2026, for sign-ups made from the day the new
// Terms are published (NEW_REFUND_RULES_FROM) and for nobody enrolled before:
// rules 1–3 stay, with one change in rule 3. The months not started of a
// course paid in full come back at the discounted monthly price (what was
// paid ÷ the months of the course), minus a 10% "taxă administrativă de
// anulare" (the owner's name for it, the only one used), minus the Stripe
// fee, never below 0.
// The month in progress still becomes credit (owner, 16 Nov 2026).
//
// Worked example — A1 in person paid in full, 2380 lei (595 a month), left
// after 2 months: 2 x 595 = 1190, minus 10% (119) = 1071, minus the Stripe
// fee.

/** Days before the start date up to which nothing but the Stripe fee is kept. */
export const FULL_REFUND_DAYS = 7;

/** Lessons up to which a started course is still refunded in money. */
export const TEST_LESSONS = 2;

/** Lessons in one paid month of a group course. */
export const LESSONS_PER_MONTH = 8;

/**
 * "Taxă administrativă de anulare": the share kept from the months not
 * started when a course paid in full is left after the second lesson. Only
 * for sign-ups made under the new Terms (cancelFeeRateFor).
 */
export const CANCEL_FEE_RATE = 0.1;

/**
 * The day the new Terms are published (YYYY-MM-DD, by the calendar in
 * Bucharest). The rules of 14 November 2026 apply ONLY to sign-ups made from
 * that day; a student enrolled before keeps the rules they signed up under.
 * null = not published yet: every sign-up is still on the rule of 8 November.
 * Set it in the same change that publishes section 4 of the Terms.
 *
 * 1 December 2026 (owner said "publish" on 16 November): a day ahead of the
 * text going live, never behind it. The Terms must be on the live site
 * BEFORE this day; if they are not, move the day forward first, or sign-ups
 * made under the earlier Terms would be treated by rules they never saw.
 */
export const NEW_REFUND_RULES_FROM: string | null = "2026-12-01";

/**
 * The share kept as "taxă administrativă de anulare" for a sign-up made at
 * `signedUpAt`: 10% from the day the new Terms are published, nothing before.
 */
export function cancelFeeRateFor(
  signedUpAt: string | null | undefined,
  rulesFrom: string | null = NEW_REFUND_RULES_FROM,
): number {
  if (!rulesFrom || !signedUpAt) return 0;
  const at = Date.parse(signedUpAt);
  if (!Number.isFinite(at)) return 0;
  // en-CA formats as YYYY-MM-DD, so the two dates compare as text.
  const day = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Bucharest",
  }).format(new Date(at));
  return day >= rulesFrom ? CANCEL_FEE_RATE : 0;
}

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
  /**
   * The share of the months not started kept as "taxă administrativă de
   * anulare" (cancelFeeRateFor). Omit, or 0, for a sign-up made under the
   * earlier Terms.
   */
  cancelFeeRate?: number | null;
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
  /**
   * "Taxă administrativă de anulare": kept from the months not started. 0
   * under the earlier Terms, before the second lesson is over, and for
   * private lessons.
   */
  cancelFeeBani: number;
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
 * Always: nonRefundable + credit + cancelFee + fee + refund = paid.
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
    cancelFeeRate = 0,
  ): RefundBreakdown => {
    const back = Math.max(0, paid - nonRefundableBani - creditBani);
    const cancelFeeBani = round(back * clamp(cancelFeeRate, 0, 1));
    const afterCancelFee = back - cancelFeeBani;
    const feeBani = Math.min(stripeFee, afterCancelFee);
    return {
      tier,
      daysBeforeStart,
      pricePerLessonBani: total > 0 ? round(paid / total) : 0,
      lessonsRemaining: remainingLessons,
      nonRefundableBani,
      remainingValueBani: paid - nonRefundableBani,
      creditBani,
      cancelFeeBani,
      feeBani,
      refundBani: afterCancelFee - feeBani,
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
  // its unused lessons become credit; the months after it come back, for a
  // sign-up under the new Terms minus the taxă administrativă de anulare.
  const monthEnd = Math.min(total, Math.ceil(taken / perMonth) * perMonth);
  const nonRefundable = valueOf(taken);
  return finish(
    "credit",
    nonRefundable,
    valueOf(monthEnd) - nonRefundable,
    Number(input.cancelFeeRate) || 0,
  );
}

/** Formats bani as a Romanian lei string, e.g. 151875 → "1.518,75 lei". */
export function formatBani(bani: number): string {
  return `${(bani / 100).toLocaleString("ro-RO", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} lei`;
}
