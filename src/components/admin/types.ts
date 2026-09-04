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

export type CourseTypeFilter = "all" | "group" | "private" | "kids" | "trial";
export type LeadStatusFilter = "all" | LeadStatus;

export type LeadSource = "form" | "whatsapp" | "admin";
export type TrackPreference = "arabizi" | "arabic_script" | "not_sure";

export interface Registration {
  id: string;
  created_at: string;
  form_type: string;
  name: string;
  phone: string;
  email: string | null;
  center: string | null;
  format: string | null;
  child_age: string | null;
  notes: string | null;
  lead_status: LeadStatus;
  source?: LeadSource | null;
  track_preference?: TrackPreference | null;
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