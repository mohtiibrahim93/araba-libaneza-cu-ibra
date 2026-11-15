/**
 * "Pay the next month by card" (owner, 14 Nov 2026).
 *
 * A group student whose months are recorded by hand (cash, transfer, at the
 * centre) could not pay a later month on the site: the sign-up counts as paid
 * and the checkout refuses a paid sign-up. This file decides, in one place,
 * whether a sign-up may pay its next month by card and which month that is.
 * The function that prepares the payment (create-month-payment) and the
 * student's account page both ask here, so the button and the charge cannot
 * disagree.
 *
 * The rule: one month at a time, the lowest month not yet paid or granted, at
 * the group's own monthly price when it has one, else the list price. A
 * sign-up on a card subscription is charged by Stripe each month and gets no
 * button; neither does one that left the group, was refunded, or has not
 * made its first payment yet (that one goes through the normal checkout).
 *
 * Pure: no Deno or browser imports, like group-months.ts.
 */
import { groupMonths, type MonthPaymentRow } from "./group-months.ts";
import { groupMonthlyUnitAmount, groupMonthsFor } from "./prices.ts";

/** Marks the Stripe payment so the webhook records one month and nothing else. */
export const GROUP_MONTH_PURPOSE = "group_month";

export interface MonthPaymentRegistration {
  form_type: string | null;
  payment_status: string | null;
  level: string | null;
  format: string | null;
  months_total: number | null;
  canceled_at?: string | null;
  subscription_status?: string | null;
}

export interface MonthPaymentCohort {
  status?: string | null;
  level?: string | null;
  format?: string | null;
  start_date?: string | null;
  price_lei?: number | string | null;
}

export type MonthPaymentRefusal =
  /** Not a group course: private lessons and trials have no months. */
  | "not_group"
  /** The sign-up has no group, or its group never ran (draft, cancelled). */
  | "no_group"
  /** The student left the group ("Retras") or the money was refunded. */
  | "withdrawn"
  /** Nothing paid or granted yet: the first payment is the normal checkout. */
  | "not_started"
  /** A card subscription is charging the months by itself. */
  | "subscription"
  /** Every month of the course is paid or granted. */
  | "all_paid";

export type MonthPaymentCheck =
  | {
      ok: true;
      /** The month this payment covers, 1-based. */
      month: number;
      /** Months in the course. */
      total: number;
      /** What is charged, in bani. */
      amountBani: number;
      /** First day the month is due (YYYY-MM-DD); null for month 1. */
      dueFrom: string | null;
      /** Whether the month is already due today. */
      due: boolean;
    }
  | { ok: false; reason: MonthPaymentRefusal };

const no = (reason: MonthPaymentRefusal): MonthPaymentCheck => ({
  ok: false,
  reason,
});

/** A group that never ran: nothing is owed to it. */
const CLOSED_GROUP = new Set(["draft", "cancelled"]);

export function monthPaymentCheck(input: {
  registration: MonthPaymentRegistration;
  cohort: MonthPaymentCohort | null | undefined;
  rows: MonthPaymentRow[];
  /** Today in Bucharest, YYYY-MM-DD. Defaults to now. */
  today?: string;
}): MonthPaymentCheck {
  const { registration: reg, cohort, rows } = input;
  if (reg.form_type !== "group") return no("not_group");
  if (!cohort || CLOSED_GROUP.has(cohort.status ?? "")) return no("no_group");
  if (reg.canceled_at || reg.payment_status === "refunded")
    return no("withdrawn");
  // Given for free by the owner: nothing is owed.
  if (reg.payment_status === "free") return no("all_paid");
  // Anything but "canceled" is a subscription Stripe still acts on.
  if (reg.subscription_status && reg.subscription_status !== "canceled")
    return no("subscription");

  const level = cohort.level ?? reg.level;
  const total = reg.months_total ?? groupMonthsFor(level);
  const summary = groupMonths({
    total,
    startDate: cohort.start_date ?? null,
    rows,
    ...(input.today ? { today: input.today } : {}),
  });
  if (reg.payment_status !== "paid" && summary.covered === 0)
    return no("not_started");
  if (summary.nextUncovered === null) return no("all_paid");

  const next = summary.months[summary.nextUncovered - 1]!;
  return {
    ok: true,
    month: next.month,
    total: summary.total,
    amountBani: groupMonthlyUnitAmount(
      level,
      cohort.format ?? reg.format,
      cohort.price_lei,
    ),
    dueFrom: next.dueFrom,
    due: next.due,
  };
}
