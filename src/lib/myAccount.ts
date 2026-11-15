/**
 * The student's account, "Contul meu" (owner, 14 Nov 2026): what one signed-in
 * student sees about their own courses, months and payments.
 *
 * This file turns database rows into what the page shows. The months come
 * from the same rule the admin uses (group-months.ts), and "which month can
 * be paid by card" from the same rule the payment function uses
 * (month-payment.ts), so the student, the owner and the charge agree.
 *
 * Nothing internal leaves here: no notes, no bank names, no who-recorded-it.
 */
import {
  groupMonths,
  type MonthPaymentRow,
} from "../../supabase/functions/_shared/group-months";
import {
  monthPaymentCheck,
  type MonthPaymentRefusal,
} from "../../supabase/functions/_shared/month-payment";
import { groupMonthsFor } from "../../supabase/functions/_shared/prices";

export type Lang = "ro" | "en";

/** A registrations row, with its recorded payments, as the server reads it. */
export interface AccountRegistrationRow {
  id: string;
  form_type: string;
  level: string | null;
  format: string | null;
  created_at: string;
  payment_status: string;
  months_total: number | null;
  subscription_status: string | null;
  canceled_at: string | null;
  refunded_amount: number | null;
  quantity: number | null;
  cohort_id: string | null;
  registration_payments: AccountPaymentRow[] | null;
}

export interface AccountPaymentRow {
  kind: string;
  method: string;
  amount_lei: number | string;
  paid_at: string;
  month_from: number | null;
  month_to: number | null;
}

export interface AccountCohortRow {
  id: string;
  status: string;
  level: string | null;
  format: string | null;
  start_date: string | null;
  price_lei: number | string | null;
  title_ro: string | null;
  title_en: string | null;
  schedule_label_ro: string | null;
  schedule_label_en: string | null;
}

export interface AccountMonth {
  month: number;
  state: "paid" | "granted" | "unpaid";
  /** Due today or earlier. */
  due: boolean;
  /** First day it is due (YYYY-MM-DD); null for month 1 (due at sign-up). */
  dueFrom: string | null;
}

export interface AccountPayment {
  paidAt: string;
  amountLei: number;
  /** A month granted for free by the school: no money moved. */
  granted: boolean;
  monthFrom: number | null;
  monthTo: number | null;
}

export interface AccountEnrolment {
  id: string;
  /** group, private, kids or trial. */
  kind: string;
  level: string | null;
  format: string | null;
  signedUpAt: string;
  paymentStatus: string;
  group: {
    titleRo: string | null;
    titleEn: string | null;
    scheduleRo: string | null;
    scheduleEn: string | null;
    startDate: string | null;
    finished: boolean;
  } | null;
  /** The student left the group ("Retras"). */
  left: boolean;
  /** A card subscription charges the months by itself. */
  subscription: boolean;
  /** Group courses only: every month of the course. */
  months: AccountMonth[] | null;
  /** Group courses only: nothing due and unpaid, or something is. */
  monthsStatus: "up_to_date" | "unpaid" | null;
  /** The month the student can pay by card now, if any. */
  nextPayment: {
    month: number;
    total: number;
    amountLei: number;
    due: boolean;
    dueFrom: string | null;
  } | null;
  /** Why there is no card payment to make; null when there is one. */
  noPaymentReason: MonthPaymentRefusal | null;
  /** Private lessons: the size of the package. */
  lessons: number | null;
  payments: AccountPayment[];
  refundedLei: number;
}

const lei = (v: number | string | null | undefined) => {
  const n = Number(v ?? 0);
  return Number.isFinite(n) ? Math.round(n * 100) / 100 : 0;
};

export function buildEnrolment(
  reg: AccountRegistrationRow,
  cohort: AccountCohortRow | null,
  today?: string,
): AccountEnrolment {
  const rows = (reg.registration_payments ?? []) as AccountPaymentRow[];
  const isGroup = reg.form_type === "group";
  const left = Boolean(reg.canceled_at);
  const subscription =
    Boolean(reg.subscription_status) && reg.subscription_status !== "canceled";

  let months: AccountMonth[] | null = null;
  let monthsStatus: AccountEnrolment["monthsStatus"] = null;
  let nextPayment: AccountEnrolment["nextPayment"] = null;
  let noPaymentReason: MonthPaymentRefusal | null = null;

  if (isGroup) {
    const level = cohort?.level ?? reg.level;
    const summary = groupMonths({
      total: reg.months_total ?? groupMonthsFor(level),
      startDate: cohort?.start_date ?? null,
      rows: rows as MonthPaymentRow[],
      ...(today ? { today } : {}),
    });
    months = summary.months.map((m) => ({
      month: m.month,
      state:
        m.state === "unpaid"
          ? "unpaid"
          : m.state === "granted"
            ? "granted"
            : "paid",
      due: m.due,
      dueFrom: m.dueFrom,
    }));
    // A student who left owes nothing more: no "unpaid" verdict for them.
    monthsStatus = left ? null : summary.status;
    const check = monthPaymentCheck({
      registration: reg,
      cohort,
      rows: rows as MonthPaymentRow[],
      ...(today ? { today } : {}),
    });
    if (check.ok)
      nextPayment = {
        month: check.month,
        total: check.total,
        amountLei: check.amountBani / 100,
        due: check.due,
        dueFrom: check.dueFrom,
      };
    else noPaymentReason = check.reason;
  }

  return {
    id: reg.id,
    kind: reg.form_type,
    level: cohort?.level ?? reg.level,
    format: cohort?.format ?? reg.format,
    signedUpAt: reg.created_at,
    paymentStatus: reg.payment_status,
    group:
      isGroup && cohort
        ? {
            titleRo: cohort.title_ro,
            titleEn: cohort.title_en,
            scheduleRo: cohort.schedule_label_ro,
            scheduleEn: cohort.schedule_label_en,
            startDate: cohort.start_date,
            finished: cohort.status === "completed",
          }
        : null,
    left,
    subscription,
    months,
    monthsStatus,
    nextPayment,
    noPaymentReason,
    lessons:
      reg.form_type === "private" && reg.quantity ? Number(reg.quantity) : null,
    payments: rows
      .map((r) => ({
        paidAt: r.paid_at,
        amountLei: lei(r.amount_lei),
        granted: r.method === "credit" || r.kind === "credit",
        monthFrom: r.month_from,
        monthTo: r.month_to ?? r.month_from,
      }))
      .sort((a, b) => Date.parse(b.paidAt) - Date.parse(a.paidAt)),
    // registrations.refunded_amount is in Stripe minor units (bani).
    refundedLei: reg.refunded_amount ? reg.refunded_amount / 100 : 0,
  };
}

/** Newest sign-up first; a course still running before one that was left. */
export function buildAccount(
  regs: AccountRegistrationRow[],
  cohorts: AccountCohortRow[],
  today?: string,
): AccountEnrolment[] {
  const byId = new Map(cohorts.map((c) => [c.id, c]));
  return regs
    .map((r) =>
      buildEnrolment(
        r,
        r.cohort_id ? (byId.get(r.cohort_id) ?? null) : null,
        today,
      ),
    )
    .sort(
      (a, b) =>
        Number(a.left) - Number(b.left) ||
        Date.parse(b.signedUpAt) - Date.parse(a.signedUpAt),
    );
}

// ---------------------------------------------------------------------------
// Words on the page
// ---------------------------------------------------------------------------

const KIND: Record<Lang, Record<string, string>> = {
  ro: {
    group: "Curs de grup",
    private: "Lecții private",
    kids: "Curs pentru copii",
    trial: "Lecție de probă",
  },
  en: {
    group: "Group course",
    private: "Private lessons",
    kids: "Kids course",
    trial: "Trial lesson",
  },
};

const FORMAT: Record<Lang, Record<string, string>> = {
  ro: { online: "online", fizic: "fizic, la centru" },
  en: { online: "online", fizic: "in person, at the centre" },
};

/** "Curs de grup A1 · online", or the group's own title when it has one. */
export function enrolmentTitle(e: AccountEnrolment, lang: Lang): string {
  const own = lang === "en" ? e.group?.titleEn : e.group?.titleRo;
  if (own) return own;
  const kind = KIND[lang][e.kind] ?? e.kind;
  const level = e.kind === "group" && e.level ? ` ${e.level}` : "";
  const format = e.format ? FORMAT[lang][e.format] : undefined;
  return `${kind}${level}${format ? ` · ${format}` : ""}`;
}

export function formatLei(amount: number, lang: Lang): string {
  return `${new Intl.NumberFormat(lang === "en" ? "en-GB" : "ro-RO", {
    maximumFractionDigits: 2,
  }).format(amount)} lei`;
}

/** A calendar date (YYYY-MM-DD) or an instant, shown as a long date. */
export function formatDay(value: string, lang: Lang): string {
  const date = /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? new Date(`${value}T12:00:00Z`)
    : new Date(value);
  return new Intl.DateTimeFormat(lang === "en" ? "en-GB" : "ro-RO", {
    timeZone: "Europe/Bucharest",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

/** "luna 4" or "lunile 1–3"; null when the payment names no month. */
export function paymentMonths(p: AccountPayment, lang: Lang): string | null {
  if (!p.monthFrom) return null;
  const to = p.monthTo ?? p.monthFrom;
  if (to === p.monthFrom)
    return lang === "en" ? `month ${p.monthFrom}` : `luna ${p.monthFrom}`;
  return lang === "en"
    ? `months ${p.monthFrom}–${to}`
    : `lunile ${p.monthFrom}–${to}`;
}
