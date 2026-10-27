// Monthly group subscription — what a cancellation gives back. Owner's rule,
// 27 October 2026. Mirrors the "Grupe cu plată lunară" part of the published
// Terms (src/pages/Terms.tsx, section 4); if one changes, change both.
// Dependency-free on purpose, like refund.ts, so it is unit-tested outside Deno.
//
// Cancelling always stops every future monthly charge. On top of that:
//
//   Before the course starts (by the calendar date in Bucharest):
//     - 7 or more days before the start date → the month(s) already paid are
//       refunded in full;
//     - less than 7 days before → refunded minus the 10% administrative fee.
//   After the course has started:
//     - the month now being paid for is refunded for the lessons of that month
//       not yet held, minus 10% — only if the cancellation comes within 7 days
//       of that month's charge; later than that, nothing for that month;
//     - months before the current one are never refunded.
//
// "The lessons of that month" are the cohort's real lessons (cohort_sessions,
// read from the owner's Google Calendar) that fall in the billing period the
// charge paid for: from that charge to the next one.
//
// Worked example (the one in the Terms): 500 lei a month, 8 lessons a month.
//   cancelled 10 days before the start            → 500.00 back
//   cancelled 3 days before the start             → 500 - 50 = 450.00 back
//   charged on the 1st, cancelled on the 5th after 2 of the month's 8 lessons:
//     6 lessons not yet held: 500 x 6/8 = 375.00, fee 37.50 → 337.50 back
//   same, cancelled on the 12th (11 days after the charge) → 0 for that month

import { ADMIN_FEE_RATE, FULL_REFUND_DAYS } from "./refund.ts";

/** Days after a month's charge within which that month is still refundable. */
export const MONTH_REFUND_WINDOW_DAYS = 7;

export const BUCHAREST_TZ = "Europe/Bucharest";

export interface GroupCharge {
  /** Stripe payment intent id of the monthly invoice, what the refund is issued against. */
  paymentId: string;
  /** What actually cleared, in bani. */
  amountBani: number;
  /** Already refunded on this charge, in bani. */
  refundedBani?: number;
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
}

export type GroupCancelCase =
  | "before_start_full"
  | "before_start_fee"
  | "current_month"
  | "outside_window"
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
  /** Whole calendar days since the current month's charge; null before the start. */
  daysSinceCharge: number | null;
  /** Billing period of the current month, ISO; null before the start. */
  periodStart: string | null;
  periodEnd: string | null;
  /** Lessons of the current month (after the start only). */
  lessonsInMonth: number;
  lessonsHeld: number;
  lessonsNotHeld: number;
  /** What the money being looked at amounts to, in bani. */
  chargedBani: number;
  /** The part of it that is refundable before the fee. */
  eligibleBani: number;
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
    daysSinceCharge: null,
    periodStart: null,
    periodEnd: null,
    lessonsInMonth: 0,
    lessonsHeld: 0,
    lessonsNotHeld: 0,
    chargedBani: 0,
    eligibleBani: 0,
    feeBani: 0,
    refundBani: 0,
    refunds: [] as GroupRefundLine[],
  };
  if (charges.length === 0) return { case: "nothing_paid", ...empty };

  // Before the start: nothing has been held, so everything paid is the
  // "first month" the rule speaks of.
  if (daysBeforeStart !== null && daysBeforeStart > 0) {
    const full = daysBeforeStart >= FULL_REFUND_DAYS;
    const refunds: GroupRefundLine[] = [];
    let charged = 0;
    let fee = 0;
    for (const c of charges) {
      const amount = remaining(c);
      if (amount <= 0) continue;
      const lineFee = full ? 0 : Math.round(amount * ADMIN_FEE_RATE);
      charged += amount;
      fee += lineFee;
      refunds.push({ paymentId: c.paymentId, amountBani: amount - lineFee });
    }
    return {
      ...empty,
      case: full ? "before_start_full" : "before_start_fee",
      chargedBani: charged,
      eligibleBani: charged,
      feeBani: fee,
      refundBani: charged - fee,
      refunds,
    };
  }

  // Started (or no start date known): only the month now paid for can come back.
  const current = charges[charges.length - 1]!;
  const periodStart = current.chargedAt;
  const periodEnd =
    input.currentPeriodEnd &&
    Date.parse(input.currentPeriodEnd) > Date.parse(periodStart)
      ? input.currentPeriodEnd
      : addOneMonth(periodStart);
  const startMs = Date.parse(periodStart);
  const endMs = Date.parse(periodEnd);
  const inMonth = input.sessionStarts
    .map((s) => Date.parse(s))
    .filter((t) => Number.isFinite(t) && t >= startMs && t < endMs);
  const held = inMonth.filter((t) => t <= cancelMs).length;
  const notHeld = inMonth.length - held;
  const daysSinceCharge = calendarDaysBetween(
    bucharestDate(periodStart),
    cancelDate,
  );
  const amount = remaining(current);

  const base = {
    ...empty,
    daysSinceCharge,
    periodStart,
    periodEnd,
    lessonsInMonth: inMonth.length,
    lessonsHeld: held,
    lessonsNotHeld: notHeld,
    chargedBani: amount,
  };

  if (daysSinceCharge > MONTH_REFUND_WINDOW_DAYS) {
    return { ...base, case: "outside_window" };
  }

  const eligible =
    inMonth.length > 0 ? Math.round((amount * notHeld) / inMonth.length) : 0;
  const fee = Math.round(eligible * ADMIN_FEE_RATE);
  const refund = eligible - fee;
  return {
    ...base,
    case: "current_month",
    eligibleBani: eligible,
    feeBani: fee,
    refundBani: refund,
    refunds: refund > 0 ? [{ paymentId: current.paymentId, amountBani: refund }] : [],
  };
}
