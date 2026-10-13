export type LeadStatus =
  // Step 1 of the trial form was submitted but no slot was ever chosen, so the
  // trial is NOT booked. Kept as a record, but it is not a real lead and must
  // not sit in the same list as people who actually booked.
  | "incomplete"
  | "new"
  | "contacted"
  | "qualified"
  | "no_response"
  | "not_suitable"
  | "spam"
  | "converted";

export const LEAD_STATUSES: readonly LeadStatus[] = [
  "incomplete",
  "new",
  "contacted",
  "qualified",
  "no_response",
  "not_suitable",
  "spam",
  "converted",
] as const;

export type CourseTypeFilter =
  "all" | "group" | "private" | "kids" | "trial" | "level_check";
export type LeadStatusFilter = "all" | LeadStatus;

export type LeadSource = "form" | "whatsapp" | "admin";
export type TrackPreference = "arabizi" | "arabic_script" | "not_sure";

export interface RegistrationCohort {
  id: string;
  title_ro: string | null;
  level: string | null;
  format: string | null;
  age_category: string | null;
  teaching_language: string | null;
  start_date: string | null;
  end_date: string | null;
  schedule_label_ro: string | null;
  status: string;
}

export interface Registration {
  id: string;
  /** Set by the admin list: a trial from someone who already used one under another email (same name or phone). */
  trial_duplicate_hint?: string;
  created_at: string;
  form_type: string;
  name: string;
  phone: string;
  email: string | null;
  account_email?: string | null;
  contact_email?: string | null;
  center: string | null;
  format: string | null;
  child_age: string | null;
  notes: string | null;
  lead_status: LeadStatus;
  source?: LeadSource | null;
  track_preference?: TrackPreference | null;
  cohort_id?: string | null;
  cohort?: RegistrationCohort | null;
  level?: string | null;
  age_category?: string | null;
  teaching_language?: string | null;
  payment_status?: string;
  stripe_session_id?: string | null;
  paid_at?: string | null;
  refunded_at?: string | null;
  refund_reason?: string | null;
  stripe_subscription_id?: string | null;
  subscription_status?: string | null;
  months_total?: number | null;
  months_paid?: number | null;
  canceled_at?: string | null;
  refunded_amount?: number | null;
  anonymized_at?: string | null;
  /**
   * Language the student needs the class explained in, from the site language
   * they registered in. Anything other than 'ro' needs a matching cohort —
   * every cohort is Romanian-taught until an English one is opened.
   */
  language?: "ro" | "en" | null;
  /** Computed server-side: how many registrations share this email. */
  email_dup_count?: number;
}

export interface EmailSettings {
  sender_name: string;
  sender_email: string;
}

export const formTypeLabels: Record<string, string> = {
  group: "Curs Grup",
  private: "Lecții Private",
  kids: "Curs Copii",
  trial: "Probă gratuită",
  level_check: "Verificare de nivel",
};

export const leadStatusLabels: Record<LeadStatus, string> = {
  incomplete: "Incomplet — fără interval ales",
  new: "Nou",
  contacted: "Contactat",
  qualified: "Calificat",
  no_response: "Fără răspuns",
  not_suitable: "Nepotrivit",
  spam: "Spam / invalid",
  converted: "Convertit",
};

/**
 * What `registrations.payment_status` means. The column has no database
 * constraint, so this comment is the only thing holding the vocabulary
 * together; `payment-status-vocabulary.test.ts` enforces it.
 *
 * The column tracks THE MONEY, never the policy or the outcome. The question
 * that separates the first two values — the pair that has been confused
 * repeatedly, in both directions — is simply: has a payment attempt started?
 *
 *   unpaid      Nobody has tried to pay. No checkout session, no card on file.
 *               This is where anyone who owes money begins, and where they stay
 *               if they never pay. A student added by hand in "Înscrieri
 *               externe" starts here.
 *   pending     An attempt is open. A Stripe session exists, so the money is in
 *               flight or awaiting confirmation. The four checkout functions
 *               UPDATE the registration from unpaid to pending at that moment,
 *               which is what makes the distinction real rather than nominal.
 *   card_saved  A card is on file and authorised but deliberately not charged;
 *               a trial, chargeable later without asking again.
 *   paid        The money arrived.
 *   failed      An attempt was made and declined. Not the same as unpaid: one
 *               tried and was refused, the other never tried.
 *   expired     An attempt was opened and abandoned: the Stripe payment page
 *               was left until Stripe closed it (24h). No money moved and
 *               nothing was declined. Worth a follow-up: they got as far as
 *               paying. (Owner's decision, 13 October 2026.)
 *   past_due    A subscription renewal lapsed. The relationship continues.
 *   refunded    The money arrived and was given back.
 *
 * Two things that are NOT payment states, and must not be folded in here:
 *
 *   - "They never paid, so they are charged the full price." That is a business
 *     consequence of staying `unpaid`; the money has not moved, so the status
 *     has not changed.
 *   - Whether it is their first payment or their fifth. An attempt is an
 *     attempt. Splitting the pair by WHICH payment is what made `unpaid` and
 *     `pending` collapse into each other every time someone tried to define
 *     them, because a first payment can be in flight too.
 *
 * So `unpaid` is not a legacy spelling of `pending` to be migrated away, and a
 * migration that merged them would destroy a distinction the data carries
 * correctly. One was written and deleted before it ran.
 */
export const paymentStatusLabels: Record<string, string> = {
  paid: "Plătit",
  unpaid: "Neplătit",
  pending: "În așteptare",
  card_saved: "Card salvat",
  failed: "Eșuat",
  expired: "Expirat",
  refunded: "Rambursat",
  past_due: "Restant",
};

/**
 * A partial refund: the money arrived and part of it went back. The status
 * stays what it was (usually "Plătit": the student keeps their lessons) and
 * the amount is shown next to it. Only a full refund is `refunded`.
 * refunded_amount is in bani (Stripe's smallest unit); prices are in lei.
 */
export function partialRefundNote(r: {
  payment_status?: string | null;
  refunded_amount?: number | null;
}): string | null {
  const amount = Number(r.refunded_amount) || 0;
  if (amount <= 0 || r.payment_status === "refunded") return null;
  return `rambursat parțial: ${(amount / 100).toLocaleString("ro-RO")} lei`;
}

/**
 * The three tabs of Înscrieri (owner's request, 13 October 2026). A student is
 * someone who became a paying student: "Convertit" (set automatically on
 * payment) or money that arrived. The course they took is already on the
 * registration, so no extra status per course type is needed.
 */
export type LeadSegment = "leads" | "students" | "closed";
export const leadSegmentLabels: Record<LeadSegment, string> = {
  leads: "Lead-uri",
  students: "Cursanți",
  closed: "Închise",
};
export function leadSegment(r: {
  lead_status?: string | null;
  payment_status?: string | null;
}): LeadSegment {
  if (
    r.lead_status === "converted" ||
    r.payment_status === "paid" ||
    r.payment_status === "past_due"
  )
    return "students";
  if (r.lead_status === "not_suitable" || r.lead_status === "spam")
    return "closed";
  return "leads";
}
/** "Cursant · Grupă A1", "Cursant · Privat", "Cursant · Copii". */
export function studentLabel(r: {
  form_type: string;
  level?: string | null;
  cohort?: { level: string | null } | null;
}): string {
  if (r.form_type === "group") {
    const level = r.cohort?.level ?? r.level;
    return level ? `Cursant · Grupă ${level}` : "Cursant · Grupă";
  }
  if (r.form_type === "private") return "Cursant · Privat";
  if (r.form_type === "kids") return "Cursant · Copii";
  return "Cursant";
}

export const leadSourceLabels: Record<LeadSource, string> = {
  form: "Formular",
  whatsapp: "WhatsApp",
  admin: "Adăugat manual",
};

export const trackPreferenceLabels: Record<TrackPreference, string> = {
  arabizi: "Arabizi (latin)",
  arabic_script: "Alfabet arab",
  not_sure: "Nu sunt sigur",
};
