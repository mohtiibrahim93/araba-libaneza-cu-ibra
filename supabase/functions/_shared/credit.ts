/**
 * A student's credit with the school (owner, 14 and 16 November 2026;
 * Terms, section 4, "Credit").
 *
 * When a student leaves a group after the second lesson, the unused lessons
 * of the month in progress become credit instead of money. Credit is valid 6
 * months; it can pay for a later group, be passed to another person, or
 * become private lessons at 150 lei each. The student is reminded 30 days
 * before it runs out. What is still unused at expiry is refunded in money,
 * minus the Stripe fee, when the owner presses "refund now" in the admin:
 * nothing is refunded by itself.
 *
 * A credit row holds the amount; each use is its own row. What is left is
 * the amount minus the uses, worked out here and nowhere stored twice.
 * Months the owner grants for free ("lună acordată") are not credit.
 *
 * Pure: no Deno or browser imports, like group-months.ts.
 */
import { addMonths } from "./group-months.ts";
import { PRIVATE_LESSON } from "./prices.ts";

/** How long credit stays valid. */
export const CREDIT_MONTHS = 6;

/** How long before expiry the student is reminded. */
export const CREDIT_REMINDER_DAYS = 30;

export const CREDIT_USE_KINDS = [
  "group",
  "private",
  "transfer",
  "refund",
] as const;
export type CreditUseKind = (typeof CREDIT_USE_KINDS)[number];

export const CREDIT_USE_LABELS: Record<CreditUseKind, string> = {
  group: "Folosit la o grupă",
  private: "Lecții private",
  transfer: "Transferat altei persoane",
  refund: "Returnat în bani",
};

export interface CreditRow {
  amount_lei: number | string;
  created_at: string;
  expires_at: string;
  refund_at_expiry: boolean;
  reminder_sent_at?: string | null;
}

export interface CreditUseRow {
  kind: string;
  amount_lei: number | string;
}

export type CreditStatus =
  /** Something is left and it has not expired. */
  | "active"
  /** Nothing is left: used, passed on or refunded in full. */
  | "used"
  /** Expired with something left that is owed back in money. */
  | "refund_due"
  /** Expired with something left, under the earlier Terms: it simply ended. */
  | "ended";

export interface CreditState {
  amountLei: number;
  usedLei: number;
  remainingLei: number;
  status: CreditStatus;
  /** Whole days until it expires; 0 on the last day, negative afterwards. */
  daysLeft: number;
  /** The 30-day reminder is due: not expired, something left, none sent. */
  reminderDue: boolean;
  /** Whole private lessons the rest would pay for, at 150 lei each. */
  privateLessons: number;
}

const DAY_MS = 86_400_000;
const money = (v: number | string | null | undefined) => {
  const n = Number(v ?? 0);
  return Number.isFinite(n) ? Math.round(n * 100) / 100 : 0;
};

/**
 * When a credit given at `createdAt` runs out: the same day and hour six
 * calendar months later (31 August gives the last day of February).
 */
export function creditExpiry(createdAt: string): string {
  const at = new Date(createdAt);
  const day = addMonths(at.toISOString().slice(0, 10), CREDIT_MONTHS);
  return `${day}${at.toISOString().slice(10)}`;
}

export function creditState(
  credit: CreditRow,
  uses: CreditUseRow[],
  now: Date = new Date(),
): CreditState {
  const amountLei = money(credit.amount_lei);
  const usedLei = money(uses.reduce((sum, u) => sum + money(u.amount_lei), 0));
  const remainingLei = Math.max(0, money(amountLei - usedLei));
  const msLeft = Date.parse(credit.expires_at) - now.getTime();
  const expired = msLeft <= 0;
  // 0 on the last day; -1 through the first day after expiry, and so on.
  const daysLeft = expired
    ? -Math.ceil(-msLeft / DAY_MS) || 0
    : Math.floor(msLeft / DAY_MS);
  const status: CreditStatus =
    remainingLei <= 0
      ? "used"
      : !expired
        ? "active"
        : credit.refund_at_expiry
          ? "refund_due"
          : "ended";
  return {
    amountLei,
    usedLei,
    remainingLei,
    status,
    daysLeft,
    reminderDue:
      status === "active" &&
      daysLeft <= CREDIT_REMINDER_DAYS &&
      !credit.reminder_sent_at,
    privateLessons: Math.floor(remainingLei / PRIVATE_LESSON),
  };
}

/**
 * What goes back in money at expiry: the unused part minus the Stripe fee,
 * never below 0. The fee is kept once per card payment: pass 0 when an
 * earlier refund on the same payment already kept it, or when the money was
 * not paid by card.
 */
export function creditRefund(
  remainingLei: number,
  stripeFeeBani: number,
): { remainingBani: number; feeBani: number; refundBani: number } {
  const remainingBani = Math.max(0, Math.round(money(remainingLei) * 100));
  const feeBani = Math.min(
    Math.max(0, Math.round(Number(stripeFeeBani) || 0)),
    remainingBani,
  );
  return { remainingBani, feeBani, refundBani: remainingBani - feeBani };
}

/**
 * Whether `amountLei` can be taken from a credit: a positive amount and no
 * more than what is left. Paying for a group, private lessons or passing it
 * on needs a credit that has not expired; returning it in money is the
 * owner's button and is allowed at any time (it is owed at expiry, and
 * before or after that it is his call).
 */
export function canUseCredit(
  state: CreditState,
  kind: CreditUseKind,
  amountLei: number,
): "ok" | "amount" | "too_much" | "expired" {
  const amount = money(amountLei);
  if (!(amount > 0)) return "amount";
  if (amount > state.remainingLei) return "too_much";
  if (kind === "refund") return "ok";
  return state.status === "active" ? "ok" : "expired";
}
