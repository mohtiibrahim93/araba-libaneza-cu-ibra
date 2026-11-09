/**
 * What a student sees about their own enrolments and payments on the private
 * "Rezervările mele" page. Statuses keep the vocabulary of
 * `registrations.payment_status`; `free` is a lesson given for free, `unpaid`
 * means no payment was attempted yet.
 */
export type Lang = "ro" | "en";

export interface MyPayment {
  amount_lei: number;
  paid_at: string;
  kind: string;
  method: string;
}

export interface MyRegistration {
  id: string;
  form_type: string;
  level: string | null;
  created_at: string;
  payment_status: string;
  paid_at: string | null;
  months_total: number | null;
  months_paid: number;
  subscription_status: string | null;
  refunded_amount: number | null;
  payments: MyPayment[];
}

const STATUS: Record<Lang, Record<string, string>> = {
  ro: {
    paid: "Plătit",
    unpaid: "Neplătit",
    pending: "Plată în curs",
    card_saved: "Card salvat",
    failed: "Plată refuzată",
    expired: "Plată neterminată",
    refunded: "Rambursat",
    past_due: "Plată restantă",
    free: "Gratuit",
  },
  en: {
    paid: "Paid",
    unpaid: "Not paid",
    pending: "Payment in progress",
    card_saved: "Card saved",
    failed: "Payment declined",
    expired: "Payment not completed",
    refunded: "Refunded",
    past_due: "Payment overdue",
    free: "Free",
  },
};

const COURSE: Record<Lang, Record<string, string>> = {
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

export function paymentStatusText(status: string, lang: Lang): string {
  return STATUS[lang][status] ?? status;
}

export function courseText(formType: string, lang: Lang): string {
  return COURSE[lang][formType] ?? formType;
}

/** Total actually received, in lei, from recorded payments. */
export function totalPaidLei(reg: Pick<MyRegistration, "payments">): number {
  return reg.payments.reduce((sum, p) => sum + Number(p.amount_lei || 0), 0);
}

/** "2 / 4 luni" for courses paid month by month; null otherwise. */
export function monthsText(
  reg: Pick<MyRegistration, "months_total" | "months_paid">,
  lang: Lang,
): string | null {
  if (!reg.months_total || reg.months_total <= 1) return null;
  return lang === "ro"
    ? `${reg.months_paid} din ${reg.months_total} luni plătite`
    : `${reg.months_paid} of ${reg.months_total} months paid`;
}
