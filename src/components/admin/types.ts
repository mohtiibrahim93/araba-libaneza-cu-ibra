export type LeadStatus =
  | "new"
  | "contacted"
  | "qualified"
  | "no_response"
  | "not_suitable"
  | "spam"
  | "converted";

export const LEAD_STATUSES: readonly LeadStatus[] = [
  "new",
  "contacted",
  "qualified",
  "no_response",
  "not_suitable",
  "spam",
  "converted",
] as const;

export type CourseTypeFilter = "all" | "group" | "private" | "kids";
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
}

export interface EmailSettings {
  sender_name: string;
  sender_email: string;
}

export const formTypeLabels: Record<string, string> = {
  group: "Curs Grup",
  private: "Lecții Private",
  kids: "Curs Copii",
};

export const leadStatusLabels: Record<LeadStatus, string> = {
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