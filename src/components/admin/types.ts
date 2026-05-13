export type LeadStatus = "new" | "contacted" | "confirmed";
export type CourseTypeFilter = "all" | "group" | "private" | "kids";
export type LeadStatusFilter = "all" | LeadStatus;

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
  confirmed: "Confirmat",
};