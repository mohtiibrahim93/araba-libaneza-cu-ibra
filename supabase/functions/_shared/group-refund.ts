// Monthly group subscription — what a cancellation gives back. Owner's rule,
// 8 November 2026 (replaces the 10% fee and the 7-day window of 27 October).
// Mirrors the published Terms (src/pages/Terms.tsx, section 4); if one
// changes, change both. Dependency-free on purpose, like refund.ts, so it is
// unit-tested outside Deno.
//
// Cancelling always stops every future monthly charge. On top of that:
//
//   Before the course starts (by the calendar date in Bucharest):
//     everything already paid comes back, minus only the processing fee
//     Stripe kept (7+ days before, and also later: no lesson is held yet).
//   Within the first two lessons of the course (the test week):
//     the current month comes back for its lessons not yet held, minus the
//     Stripe fee.
//   After the second lesson:
//     the current month is not refunded in money; its lessons not yet held
//     become credit (6 months, or private lessons). Earlier months never
//     come back.
//
// "The lessons of that month" are the cohort's real lessons (cohort_sessions,
// read from the owner's Google Calendar) that fall in the billing period the
// charge paid for: from that charge to the next one.
//
// Worked example: 500 lei a month, 8 lessons a month, Stripe fee 10 lei.
//   cancelled before the start                   → 500 - 10 = 490.00 back
//   after lesson 1: 7 not held, 500 x 7/8 = 437.50 → 427.50 back
//   after lesson 3: 5 not held → 312.50 credit, nothing back in money

import { FULL_REFUND_DAYS, TEST_LESSONS, withinWithdrawal } from "./refund.ts";

export const BUCHAREST_TZ = "Europe/Bucharest";

export interface GroupCharge {
  /** Stripe payment intent id of the monthly invoice, what the refund is issued against. */
  paymentId: string;
  /** What actually cleared, in bani. */
  amountBani: number;
  /** Already refunded on this charge, in bani. */
  refundedBani?: number;
  /** The processing fee Stripe kept on this charge, in bani. Unknown = 0. */
  stripeFeeBani?: number;
  /** When the charge was made, ISO. */
  chargedAt: string;
}

export interface GroupCancelInput {
  /** Paid monthly charges, any order. */
  charges: GroupCharge[];
  /** Course start date, "YYYY-MM-DD" (Bucharest calendar date). */
  courseStartDate: string | null;
  /** Start times (ISO) of the cohort's real lessons. */
  sessionStarts: string[];
  /**
   * End of the billing period the latest charge paid for (the next charge
   * date), ISO. Without it the period is taken as one calendar month.
   */
  currentPeriodEnd?: string | null;
  /** When the cancellation is made, ISO. Defaults to now. */
  cancelledAt?: string | null;
  /** When the sign-up was made, ISO: the withdrawal period counts from it. */
  signedUpAt?: string | null;
  /** Days of the right of withdrawal; omit or 0 under the earlier Terms. */
  withdrawalDays?: number | null;
  /**
   * The student expressly asked for lessons to begin inside the withdrawal
   * period, so the lessons held are kept (registrations.early_start_requested_at).
   */
  startedAtRequest?: boolean | null;
  /**
   * Start times (ISO) of the lessons the owner excused for this student (an
   * absence with a good reason, Terms section 4 "Absențe"): not held for them.
   */
  excusedStarts?: string[] | null;
}

export type GroupCancelCase =
  | "withdrawal"
  | "before_start_full"
  | "before_start_fee"
  | "current_month"
  | "credit"
  | "nothing_paid";

export interface GroupRefundLine {
  paymentId: string;
  amountBani: number;
}

export interface GroupCancelBreakdown {
  case: GroupCancelCase;
  /** Bucharest calendar date of the cancellation, "YYYY-MM-DD". */
  cancelDate: string;
  /** Whole calendar days from the cancellation to the start; null without a start date. */
  daysBeforeStart: number | null;
  /** Lessons of the course held so far (after the start only). */
  courseLessonsHeld: number;
  /** Billing period of the current month, ISO; null before the start. */
  periodStart: string | null;
  periodEnd: string | null;
  /** Lessons of the current month (after the start only). */
  lessonsInMonth: number;
  lessonsHeld: number;
  lessonsNotHeld: number;
  /** What the money being looked at amounts to, in bani. */
  chargedBani: number;
  /** The part of it that is refundable before the Stripe fee. */
  eligibleBani: number;
  /** Unused lessons of the current month kept as credit, not money. */
  creditBani: number;
  /** The Stripe processing fee kept back. */
  feeBani: number;
  refundBani: number;
  /** One line per Stripe charge to refund. */
  refunds: GroupRefundLine[];
}

const DAY_MS = 86_400_000;

/** The Bucharest calendar date of an instant, "YYYY-MM-DD". */
export function bucharestDate(iso: string | number | Date): string {
  const d = new Date(iso);
  // en-CA formats as YYYY-MM-DD.
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: BUCHAREST_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

/** Whole calendar days from date a to date b ("YYYY-MM-DD"), b - a. */
export function calendarDaysBetween(a: string, b: string): number {
  const utc = (d: string) => {
    const [y = 0, m = 1, day = 1] = d.split("-").map(Number);
    return Date.UTC(y, m - 1, day);
  };
  return Math.round((utc(b) - utc(a)) / DAY_MS);
}

const addOneMonth = (iso: string): string => {
  const d = new Date(iso);
  d.setUTCMonth(d.getUTCMonth() + 1);
  return d.toISOString();
};

const remaining = (c: GroupCharge) =>
  Math.max(0, Math.round(c.amountBani) - Math.round(c.refundedBani ?? 0));

const feeOf = (c: GroupCharge) =>
  Math.max(0, Math.round(Number(c.stripeFeeBani) || 0));

/**
 * Applies the owner's rule. Pure: the same numbers give the same answer.
 * Every amount is in bani and rounded to whole bani.
 */
export function computeGroupCancelRefund(
  input: GroupCancelInput,
): GroupCancelBreakdown {
  const cancelledAt = input.cancelledAt ?? new Date().toISOString();
  const cancelMs = Date.parse(cancelledAt);
  const cancelDate = bucharestDate(cancelledAt);
  const charges = input.charges
    .filter((c) => c.paymentId && Date.parse(c.chargedAt) <= cancelMs)
    .sort((a, b) => Date.parse(a.chargedAt) - Date.parse(b.chargedAt));

  const daysBeforeStart = input.courseStartDate
    ? calendarDaysBetween(cancelDate, input.courseStartDate)
    : null;

  const empty = {
    cancelDate,
    daysBeforeStart,
    courseLessonsHeld: 0,
    periodStart: null,
    periodEnd: null,
    lessonsInMonth: 0,
    lessonsHeld: 0,
    lessonsNotHeld: 0,
    chargedBani: 0,
    eligibleBani: 0,
    creditBani: 0,
    feeBani: 0,
    refundBani: 0,
    refunds: [] as GroupRefundLine[],
  };
  if (charges.length === 0) return { case: "nothing_paid", ...empty };

  // An excused lesson is not held for this student: it is not kept from the
  // money. The course's own progress (the test lessons) still counts it.
  const excused = new Set(
    (input.excusedStarts ?? [])
      .map((s) => Date.parse(s))
      .filter((t) => Number.isFinite(t)),
  );

  // The right of withdrawal (Terms, section 4; refund.ts) comes first: inside
  // its 14 days everything paid goes back, with no Stripe fee kept. Lessons
  // held are kept only when the student expressly asked to start early.
  if (withinWithdrawal(input.signedUpAt, cancelledAt, input.withdrawalDays)) {
    const latest = charges[charges.length - 1]!;
    const times = input.sessionStarts
      .map((s) => Date.parse(s))
      .filter((t) => Number.isFinite(t));
    const from = Date.parse(latest.chargedAt);
    const to = Date.parse(
      input.currentPeriodEnd && Date.parse(input.currentPeriodEnd) > from
        ? input.currentPeriodEnd
        : addOneMonth(latest.chargedAt),
    );
    const inMonth = times.filter((t) => t >= from && t < to);
    const held = inMonth.filter((t) => t <= cancelMs && !excused.has(t)).length;
    const kept =
      input.startedAtRequest && inMonth.length > 0
        ? Math.round((remaining(latest) * held) / inMonth.length)
        : 0;
    const refunds: GroupRefundLine[] = [];
    let charged = 0;
    for (const c of charges) {
      const amount = remaining(c);
      if (amount <= 0) continue;
      charged += amount;
      const back = c === latest ? amount - kept : amount;
      if (back > 0) refunds.push({ paymentId: c.paymentId, amountBani: back });
    }
    return {
      ...empty,
      case: "withdrawal",
      courseLessonsHeld: times.filter((t) => t <= cancelMs).length,
      lessonsInMonth: inMonth.length,
      lessonsHeld: held,
      lessonsNotHeld: inMonth.length - held,
      chargedBani: charged,
      eligibleBani: charged - kept,
      refundBani: charged - kept,
      refunds,
    };
  }

  // Before the start: nothing has been held, everything paid comes back
  // minus what Stripe kept.
  if (daysBeforeStart !== null && daysBeforeStart > 0) {
    const refunds: GroupRefundLine[] = [];
    let charged = 0;
    let fee = 0;
    for (const c of charges) {
      const amount = remaining(c);
      if (amount <= 0) continue;
      const lineFee = Math.min(feeOf(c), amount);
      charged += amount;
      fee += lineFee;
      if (amount - lineFee > 0)
        refunds.push({ paymentId: c.paymentId, amountBani: amount - lineFee });
    }
    return {
      ...empty,
      case:
        daysBeforeStart >= FULL_REFUND_DAYS
          ? "before_start_full"
          : "before_start_fee",
      chargedBani: charged,
      eligibleBani: charged,
      feeBani: fee,
      refundBani: charged - fee,
      refunds,
    };
  }

  // Started (or no start date known): only the month now paid for counts.
  const current = charges[charges.length - 1]!;
  const periodStart = current.chargedAt;
  const periodEnd =
    input.currentPeriodEnd &&
    Date.parse(input.currentPeriodEnd) > Date.parse(periodStart)
      ? input.currentPeriodEnd
      : addOneMonth(periodStart);
  const startMs = Date.parse(periodStart);
  const endMs = Date.parse(periodEnd);
  const times = input.sessionStarts
    .map((s) => Date.parse(s))
    .filter((t) => Number.isFinite(t));
  const inMonth = times.filter((t) => t >= startMs && t < endMs);
  const held = inMonth.filter((t) => t <= cancelMs && !excused.has(t)).length;
  const notHeld = inMonth.length - held;
  const courseLessonsHeld = times.filter((t) => t <= cancelMs).length;
  const amount = remaining(current);
  const eligible =
    inMonth.length > 0 ? Math.round((amount * notHeld) / inMonth.length) : 0;

  const base = {
    ...empty,
    courseLessonsHeld,
    periodStart,
    periodEnd,
    lessonsInMonth: inMonth.length,
    lessonsHeld: held,
    lessonsNotHeld: notHeld,
    chargedBani: amount,
    eligibleBani: eligible,
  };

  if (courseLessonsHeld > TEST_LESSONS) {
    return { ...base, case: "credit", creditBani: eligible };
  }

  const fee = Math.min(feeOf(current), eligible);
  const refund = eligible - fee;
  return {
    ...base,
    case: "current_month",
    feeBani: fee,
    refundBani: refund,
    refunds:
      refund > 0 ? [{ paymentId: current.paymentId, amountBani: refund }] : [],
  };
}
