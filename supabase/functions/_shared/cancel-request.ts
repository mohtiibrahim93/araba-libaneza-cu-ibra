// Withdrawing or cancelling from "Contul meu" (owner, 17 November 2026: "the
// cancel button if they want to cancel yes"; Terms, section 4).
//
// Which button a sign-up gets, and what the student is shown before they
// confirm: what the Terms give back for the payments recorded on the sign-up
// (transfer, centre, cash, card terminal, card online), month by month. The
// owner makes the refund in the admin; nothing here moves money.
// Dependency-free, like refund.ts and group-refund.ts, so the account page,
// the student's function and the tests all read the same rule.
//
// The rule, as published (section 4; section 4.1 for sign-ups made before the
// new rules, which have no 14-day paragraph and no 10% fee):
//   Within 14 days of signing up (new rules): everything paid comes back,
//     with no fee kept; lessons held are kept only when the student asked
//     for them to start in that time.
//   Before the first lesson: everything paid comes back, minus the Stripe fee
//     on a card payment.
//   Up to and including the second lesson: the lessons held are kept, the
//     rest comes back, minus the Stripe fee on a card payment.
//   After the second lesson: the month in progress is not refunded in money;
//     its lessons not held yet become credit. Earlier months are not
//     refunded. Months paid that have not started come back, minus the
//     Stripe fee on a card payment; for a course paid in full under the new
//     rules, minus the 10% "taxă administrativă de anulare" as well.
//
// Lessons belong to months in order, eight to a month, as in the Terms'
// example ("8 lecții pe lună (62,50 lei pe lecție)"): lessons 1-8 are month 1,
// 9-16 month 2, and so on. A lesson counts as held once it has started. A
// lesson the owner excused for this student (an absence for a serious
// reason, section 4 "Absențe") counts as not held for them.

import type { MonthPaymentRow } from "./group-months.ts";
import {
  CANCEL_FEE_RATE,
  LESSONS_PER_MONTH,
  TEST_LESSONS,
  WITHDRAWAL_DAYS,
  underNewRefundRules,
  withinWithdrawal,
} from "./refund.ts";

export const CANCEL_KINDS = ["withdrawal", "cancellation", "transfer"] as const;
export type CancelKind = (typeof CANCEL_KINDS)[number];

const TZ = "Europe/Bucharest";
const DAY_MS = 86_400_000;

/** The Bucharest calendar day of an instant, "YYYY-MM-DD". */
export function bucharestDay(at: string | number | Date): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(
    new Date(at),
  );
}

const plusDays = (day: string, days: number): string => {
  const [y = 0, m = 1, d = 1] = day.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d) + days * DAY_MS)
    .toISOString()
    .slice(0, 10);
};

/** What decides the buttons: the sign-up and its group. */
export interface CancelSignup {
  form_type: string;
  created_at: string;
  canceled_at: string | null;
}

export interface CancelOptions {
  /**
   * "Retrage-te din contract aici" is shown until this day (YYYY-MM-DD,
   * Bucharest), inclusive; null when the withdrawal period is over or does
   * not apply.
   */
  withdrawalUntil: string | null;
  /** "Anulează cursul": a group course still running, after the 14 days. */
  cancel: boolean;
}

/** Group statuses after which there is nothing left to cancel. */
const OVER = new Set(["completed", "cancelled"]);

/**
 * Which button the sign-up gets. The withdrawal one is for any course (not
 * the free trial) signed up for under the new rules, during its 14 days; the
 * cancel one is for a group course after that, while the group runs.
 */
export function cancelOptions(
  reg: CancelSignup,
  groupStatus: string | null | undefined,
  now: Date = new Date(),
): CancelOptions {
  const none = { withdrawalUntil: null, cancel: false };
  if (reg.canceled_at) return none;
  if (!["group", "private", "kids"].includes(reg.form_type)) return none;
  if (
    underNewRefundRules(reg.created_at) &&
    withinWithdrawal(reg.created_at, now.toISOString(), WITHDRAWAL_DAYS)
  )
    return {
      withdrawalUntil: plusDays(bucharestDay(reg.created_at), WITHDRAWAL_DAYS),
      cancel: false,
    };
  return {
    withdrawalUntil: null,
    cancel:
      reg.form_type === "group" && !!groupStatus && !OVER.has(groupStatus),
  };
}

// ---------------------------------------------------------------------------
// What comes back
// ---------------------------------------------------------------------------

export interface CancelPreviewInput {
  /** When the sign-up was made, ISO: decides the rules and the 14 days. */
  signedUpAt: string;
  /** The student asked for lessons to start inside the 14 days. */
  earlyStartRequested?: boolean;
  monthsTotal: number;
  /** The group's first day, "YYYY-MM-DD". */
  courseStartDate?: string | null;
  /** Start times (ISO) of the group's real lessons (cohort_sessions). */
  sessionStarts: string[];
  /** Start times (ISO) of the lessons the owner excused for this student. */
  excusedStarts?: string[];
  /** The payments recorded on the sign-up (registration_payments). */
  rows: MonthPaymentRow[];
  /** When the request is made, ISO. Defaults to now. */
  at?: string;
}

export type CancelCase =
  | "withdrawal"
  | "before_start"
  | "test_lessons"
  | "after_test_lessons"
  | "finished";

export interface CancelPreview {
  case: CancelCase;
  rules: "new" | "old";
  /** Money recorded on the sign-up, in lei. A month granted for free is not money. */
  paidLei: number;
  /** Lessons of the group held so far. */
  lessonsHeld: number;
  /** Of those, excused for this student. */
  lessonsExcused: number;
  /** The month in progress, when a month is under way. */
  currentMonth: number | null;
  /** Lessons held, kept. */
  keptLei: number;
  /** Lessons of the month in progress not held yet: credit, not money. */
  creditLei: number;
  /** The 10% kept on months not started of a course paid in full (new rules). */
  cancelFeeLei: number;
  /** Money back, before the Stripe fee. */
  backLei: number;
  /** The Stripe fee comes off backLei: some of it was paid by card online. */
  stripeFee: boolean;
  /**
   * The lessons are known well enough for the amounts to be shown. False
   * when the group has started and no lesson of it is known, or when no
   * lesson is known after today in a course still running (the calendar has
   * not brought them in): then the owner works the amount out.
   */
  certain: boolean;
}

/** A row that is money (a month granted for free is not). */
const isMoney = (r: MonthPaymentRow) =>
  r.kind !== "credit" && r.method !== "credit";

const bani = (lei: number | string) => Math.round(Number(lei) * 100) || 0;
const toLei = (b: number) => Math.round(b) / 100;

/**
 * The months a row pays for: its own range, or the whole course for a
 * payment in full recorded without one.
 */
function monthsOf(r: MonthPaymentRow, total: number): number[] {
  const from = r.month_from ?? (r.kind === "full" ? 1 : null);
  if (!from) return [];
  const to = Math.min(
    total,
    Math.max(from, r.month_to ?? (r.kind === "full" ? total : from)),
  );
  const out: number[] = [];
  for (let m = from; m <= to; m++) out.push(m);
  return out;
}

/**
 * What the Terms give back if the student cancels (or withdraws) at `at`,
 * for the payments recorded on the sign-up. Pure: same input, same answer.
 */
export function cancelPreview(input: CancelPreviewInput): CancelPreview {
  const at = input.at ?? new Date().toISOString();
  const atMs = Date.parse(at);
  const total = Math.max(1, Math.floor(input.monthsTotal) || 1);
  const rules = underNewRefundRules(input.signedUpAt) ? "new" : "old";

  // Money per month, and which of it came from a payment in full.
  const value = new Array<number>(total + 1).fill(0);
  const fromFull = new Array<number>(total + 1).fill(0);
  let paid = 0;
  let stripeFee = false;
  for (const r of input.rows) {
    if (!isMoney(r)) continue;
    const amount = bani(r.amount_lei);
    if (amount <= 0) continue;
    paid += amount;
    if (r.method === "card_online") stripeFee = true;
    const months = monthsOf(r, total);
    if (months.length === 0) continue;
    // Whole bani: the last month takes what rounding leaves.
    const share = Math.floor(amount / months.length);
    months.forEach((m, i) => {
      const part =
        i === months.length - 1 ? amount - share * (months.length - 1) : share;
      value[m]! += part;
      if (r.kind === "full") fromFull[m]! += part;
    });
  }

  const starts = input.sessionStarts
    .map((s) => Date.parse(s))
    .filter((t) => Number.isFinite(t))
    .sort((a, b) => a - b);
  const excused = new Set(
    (input.excusedStarts ?? [])
      .map((s) => Date.parse(s))
      .filter((t) => Number.isFinite(t)),
  );
  const heldTimes = starts.filter((t) => t <= atMs);
  const held = heldTimes.length;
  const monthOf = (k: number) =>
    Math.min(total, Math.ceil(k / LESSONS_PER_MONTH));
  // Lessons held in each month, counting only those not excused.
  const heldIn = new Array<number>(total + 1).fill(0);
  let excusedCount = 0;
  heldTimes.forEach((t, i) => {
    if (excused.has(t)) excusedCount++;
    else heldIn[monthOf(i + 1)]! += 1;
  });
  const perLesson = (m: number) => value[m]! / LESSONS_PER_MONTH;
  const keptHeld = () => {
    let kept = 0;
    for (let m = 1; m <= total; m++)
      kept += Math.min(value[m]!, Math.round(perLesson(m) * heldIn[m]!));
    return kept;
  };

  const lessonsTotal = total * LESSONS_PER_MONTH;
  const today = bucharestDay(at);
  const started = !!input.courseStartDate && input.courseStartDate <= today;
  const certain =
    !(started && held === 0) &&
    !(held > 0 && held < lessonsTotal && !starts.some((t) => t > atMs));

  const base = {
    rules,
    paidLei: toLei(paid),
    lessonsHeld: held,
    lessonsExcused: excusedCount,
    currentMonth: null as number | null,
    keptLei: 0,
    creditLei: 0,
    cancelFeeLei: 0,
    backLei: 0,
    stripeFee: false,
    certain,
  } as const;

  // The right of withdrawal comes first: everything back, no fee kept;
  // lessons held only when the student asked to start inside the 14 days.
  if (
    rules === "new" &&
    withinWithdrawal(input.signedUpAt, at, WITHDRAWAL_DAYS)
  ) {
    const kept = input.earlyStartRequested ? Math.min(paid, keptHeld()) : 0;
    return {
      ...base,
      // Without the request nothing depends on the lessons.
      certain: input.earlyStartRequested ? certain : true,
      case: "withdrawal",
      keptLei: toLei(kept),
      backLei: toLei(paid - kept),
    };
  }

  if (held === 0)
    return { ...base, case: "before_start", backLei: toLei(paid), stripeFee };

  if (held <= TEST_LESSONS) {
    const kept = Math.min(paid, keptHeld());
    return {
      ...base,
      case: "test_lessons",
      currentMonth: 1,
      keptLei: toLei(kept),
      backLei: toLei(paid - kept),
      stripeFee,
    };
  }

  if (held >= lessonsTotal) return { ...base, case: "finished" };

  // The month in progress: the one of the last lesson held, unless that
  // lesson closed its month, in which case no month is under way and the
  // next one has not started.
  const lastMonth = monthOf(held);
  const current = held % LESSONS_PER_MONTH === 0 ? null : lastMonth;
  const credit =
    current !== null
      ? Math.max(
          0,
          Math.round(
            perLesson(current) * (LESSONS_PER_MONTH - heldIn[current]!),
          ),
        )
      : 0;
  // Months paid that have not started come back.
  let back = 0;
  let fee = 0;
  for (let m = lastMonth + 1; m <= total; m++) {
    back += value[m]!;
    if (rules === "new") fee += Math.round(fromFull[m]! * CANCEL_FEE_RATE);
  }
  return {
    ...base,
    case: "after_test_lessons",
    currentMonth: current,
    creditLei: toLei(Math.min(credit, current ? value[current]! : 0)),
    cancelFeeLei: toLei(fee),
    backLei: toLei(back - fee),
    stripeFee: stripeFee && back - fee > 0,
  };
}

/**
 * The current start times of the lessons the owner excused for a student
 * (lesson_excusals, by Google Calendar event): a lesson moved in the calendar
 * keeps its mark; one cancelled there is gone, and its mark with it.
 */
export function excusedStarts(
  sessions: Array<{ starts_at: string; google_event_id: string }>,
  excusedEventIds: string[],
): string[] {
  const ids = new Set(excusedEventIds);
  return sessions
    .filter((s) => ids.has(s.google_event_id))
    .map((s) => s.starts_at);
}

// ---------------------------------------------------------------------------
// The statement the student sends, as the acknowledgement repeats it
// ---------------------------------------------------------------------------

/** "17 noiembrie 2026" / "17 November 2026" for an instant or a day. */
export function longDate(at: string, lang: "ro" | "en"): string {
  const day = /^\d{4}-\d{2}-\d{2}$/.test(at) ? `${at}T12:00:00Z` : at;
  return new Intl.DateTimeFormat(lang === "en" ? "en-GB" : "ro-RO", {
    timeZone: TZ,
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(day));
}

/** "17 noiembrie 2026, ora 14:05" (Bucharest), as the acknowledgement says. */
export function dateAndTime(at: string, lang: "ro" | "en"): string {
  const time = new Intl.DateTimeFormat("en-GB", {
    timeZone: TZ,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(new Date(at));
  return lang === "en"
    ? `${longDate(at, "en")} at ${time} (Romanian time)`
    : `${longDate(at, "ro")}, ora ${time} (ora României)`;
}

/**
 * The statement, in the student's words as the page shows them before they
 * confirm. `course` is the course's name as the account shows it.
 */
export function cancelStatement(
  kind: CancelKind,
  input: {
    course: string;
    signedUpAt: string;
    lang: "ro" | "en";
    target?: string | null;
  },
): string {
  const day = longDate(input.signedUpAt, input.lang);
  if (input.lang === "en")
    return kind === "withdrawal"
      ? `I withdraw from the contract for “${input.course}”, concluded on ${day}.`
      : kind === "cancellation"
        ? `I cancel my place in “${input.course}”, signed up for on ${day}.`
        : `Instead of cancelling, I ask to move from “${input.course}” to “${input.target ?? ""}”.`;
  return kind === "withdrawal"
    ? `Mă retrag din contractul pentru „${input.course}”, încheiat pe ${day}.`
    : kind === "cancellation"
      ? `Anulez locul meu la „${input.course}”, la care m-am înscris pe ${day}.`
      : `În loc să anulez, cer mutarea de la „${input.course}” la „${input.target ?? ""}”.`;
}
