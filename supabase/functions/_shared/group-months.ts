/**
 * A group student's months, one by one (owner, 4 Nov 2026).
 *
 * Each month of the course is paid online (card on the site, recorded by the
 * Stripe webhook as "Card online"), paid outside the site (bank transfer,
 * card outside the site, cash, another method), granted free ("lună
 * acordată") or unpaid. The months come from registration_payments rows, each
 * covering month_from..month_to.
 *
 * One rule everywhere: "Plătit la zi" when every month due so far is paid or
 * granted, "Neplătit" when a due month is neither. Month 1 is due from the
 * sign-up (it is what holds the seat); month k is due from the course start
 * plus k−1 months. Without a start date only month 1 is due.
 *
 * Pure, no Deno or browser imports: used by admin-registrations, the Stripe
 * webhook and the admin screens alike, so they cannot disagree.
 */

export const MONTH_METHODS = [
  "card_online",
  "transfer",
  "paypal",
  "card_terminal",
  "cash",
  "other",
  "credit",
] as const;
export type MonthMethod = (typeof MONTH_METHODS)[number];

/**
 * Methods the owner records by hand (everything but Stripe and the grant).
 * A bank is not a method: a Revolut or ING payment is a transfer or a card
 * (owner, 4 Nov 2026); the note can name the bank.
 */
export const MANUAL_METHODS = [
  "transfer",
  "paypal",
  "card_terminal",
  "cash",
  "other",
] as const;
export type ManualMethod = (typeof MANUAL_METHODS)[number];

/** Methods that can say which bank or app the money went through. */
export const PROVIDER_METHODS = ["transfer", "card_terminal"] as const;

/** The banks offered as one tap; anything else is typed ("Altă bancă"). */
export const PROVIDERS = [
  "Revolut",
  "ING",
  "Banca Transilvania",
  "UniCredit",
  "bunq",
] as const;

/** Trimmed, at most 60 characters, and only for a transfer or a card. */
export function cleanProvider(method: string, raw: unknown): string | null {
  if (!(PROVIDER_METHODS as readonly string[]).includes(method)) return null;
  if (typeof raw !== "string") return null;
  const p = raw.trim().slice(0, 60);
  return p || null;
}

export const MONTH_METHOD_LABELS: Record<MonthMethod, string> = {
  card_online: "Card online",
  transfer: "Transfer bancar",
  paypal: "PayPal",
  card_terminal: "Card (în afara site-ului)",
  cash: "Cash",
  other: "Altă metodă",
  credit: "Lună acordată",
};

export interface MonthPaymentRow {
  kind: string;
  method: string;
  amount_lei: number | string;
  paid_at: string;
  month_from: number | null;
  month_to: number | null;
  note?: string | null;
  provider?: string | null;
}

export type MonthState = "paid_online" | "paid_offline" | "granted" | "unpaid";

export interface GroupMonth {
  month: number;
  state: MonthState;
  /** First day it is due (YYYY-MM-DD); null for month 1 (due from sign-up). */
  dueFrom: string | null;
  due: boolean;
  method?: MonthMethod | undefined;
  paid_at?: string | undefined;
  note?: string | null | undefined;
  /** Bank or app of a transfer or outside card payment, e.g. "Revolut". */
  provider?: string | null | undefined;
}

export interface GroupMonthsSummary {
  total: number;
  months: GroupMonth[];
  /** "up_to_date" = Plătit la zi; "unpaid" = Neplătit. */
  status: "up_to_date" | "unpaid";
  dueCount: number;
  covered: number;
  granted: number;
  /** Lowest month not covered yet, or null when all are. */
  nextUncovered: number | null;
}

export const MONTH_STATUS_LABELS = {
  up_to_date: "Plătit la zi",
  unpaid: "Neplătit",
} as const;

/** YYYY-MM-DD plus n calendar months, clamped to the month's last day. */
export function addMonths(date: string, n: number): string {
  const [y, m, d] = date.slice(0, 10).split("-").map(Number) as [
    number,
    number,
    number,
  ];
  const first = new Date(Date.UTC(y, m - 1 + n, 1));
  const last = new Date(
    Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + 1, 0),
  ).getUTCDate();
  first.setUTCDate(Math.min(d, last));
  return first.toISOString().slice(0, 10);
}

/** Today in Bucharest, YYYY-MM-DD. */
export function bucharestToday(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Bucharest",
  }).format(now);
}

/** Month numbers a row covers. A legacy row without months covers none. */
function rowMonths(r: MonthPaymentRow): number[] {
  if (!r.month_from) return [];
  const to = Math.max(r.month_from, r.month_to ?? r.month_from);
  const out: number[] = [];
  for (let m = r.month_from; m <= to; m++) out.push(m);
  return out;
}

export function groupMonths(input: {
  total: number;
  startDate: string | null | undefined;
  rows: MonthPaymentRow[];
  today?: string;
}): GroupMonthsSummary {
  const total = Math.max(1, Math.floor(input.total) || 1);
  const today = input.today ?? bucharestToday();
  const byMonth = new Map<number, MonthPaymentRow>();
  for (const r of input.rows)
    for (const m of rowMonths(r)) if (!byMonth.has(m)) byMonth.set(m, r);

  const months: GroupMonth[] = [];
  for (let month = 1; month <= total; month++) {
    const dueFrom =
      month === 1
        ? null
        : input.startDate
          ? addMonths(input.startDate, month - 1)
          : null;
    const due = month === 1 || (dueFrom !== null && dueFrom <= today);
    const row = byMonth.get(month);
    const method = row?.method as MonthMethod | undefined;
    months.push({
      month,
      dueFrom,
      due,
      state: !row
        ? "unpaid"
        : method === "credit"
          ? "granted"
          : method === "card_online"
            ? "paid_online"
            : "paid_offline",
      ...(row
        ? {
            method,
            paid_at: row.paid_at,
            note: row.note ?? null,
            provider: row.provider ?? null,
          }
        : {}),
    });
  }
  const dueMonths = months.filter((m) => m.due);
  return {
    total,
    months,
    status: dueMonths.some((m) => m.state === "unpaid")
      ? "unpaid"
      : "up_to_date",
    dueCount: dueMonths.length,
    covered: months.filter((m) => m.state !== "unpaid").length,
    granted: months.filter((m) => m.state === "granted").length,
    nextUncovered: months.find((m) => m.state === "unpaid")?.month ?? null,
  };
}

/**
 * The months a new payment covers: `count` months starting at `from`, which
 * must all be uncovered and within the course. Returns null when they are not.
 */
export function monthsToCover(
  summary: GroupMonthsSummary,
  from: number,
  count: number,
): { from: number; to: number } | null {
  if (!Number.isInteger(from) || !Number.isInteger(count) || count < 1)
    return null;
  const to = from + count - 1;
  if (from < 1 || to > summary.total) return null;
  for (let m = from; m <= to; m++)
    if (summary.months[m - 1]?.state !== "unpaid") return null;
  return { from, to };
}
