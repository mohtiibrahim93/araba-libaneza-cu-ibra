import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Cohort {
  id: string;
  form_type: "group" | "kids";
  level: string | null;
  start_date: string; // YYYY-MM-DD
  schedule_label_ro: string;
  schedule_label_en: string;
  max_seats: number;
  sort_order: number;
  status: CohortStatus;
  taken: number;
  seatsLeft: number;
  full: boolean;
}

export type CohortStatus =
  | "draft"
  | "forming"
  | "minimum_reached"
  | "confirmed"
  | "full"
  | "in_progress"
  | "completed"
  | "cancelled";

// Statuses that should appear on the public site / registration form.
// `draft` is admin-only; `completed`/`cancelled` are historical; `in_progress`
// is mid-cohort and not joinable; `full` is shown but as waitlist.
const PUBLIC_COHORT_STATUSES: CohortStatus[] = [
  "forming",
  "minimum_reached",
  "confirmed",
  "full",
];

async function fetchCohorts(formType: "group" | "kids", level?: string | null): Promise<Cohort[]> {
  const today = new Date().toISOString().slice(0, 10);
  let q = supabase
    .from("group_cohorts")
    .select("id, form_type, level, start_date, schedule_label_ro, schedule_label_en, max_seats, sort_order, status")
    .eq("form_type", formType)
    .in("status", PUBLIC_COHORT_STATUSES)
    .gte("start_date", today)
    .order("sort_order", { ascending: true })
    .order("start_date", { ascending: true });

  if (level) q = q.eq("level", level);
  else if (formType === "kids") q = q.is("level", null);

  const [{ data: cohorts, error }, { data: counts }] = await Promise.all([
    q,
    supabase.rpc("get_cohort_signup_counts"),
  ]);
  if (error) {
    console.error("[useGroupCohorts] load error", error);
    return [];
  }

  const takenMap = new Map<string, number>();
  (counts || []).forEach((c: { cohort_id: string; taken: number }) => {
    takenMap.set(c.cohort_id, Number(c.taken) || 0);
  });

  return (cohorts || []).map((c) => {
    const taken = Math.min(takenMap.get(c.id) || 0, c.max_seats);
    return {
      ...c,
      form_type: c.form_type as "group" | "kids",
      status: (c.status as CohortStatus) ?? "forming",
      taken,
      seatsLeft: Math.max(0, c.max_seats - taken),
      full: taken >= c.max_seats,
    };
  });
}

export function useGroupCohorts(formType: "group" | "kids", level?: string | null) {
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const load = async () => {
      const data = await fetchCohorts(formType, level ?? null);
      if (active) {
        setCohorts(data);
        setLoading(false);
      }
    };
    load();

    const channel = supabase
      .channel(`cohort-updates-${Math.random().toString(36).slice(2)}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "registrations" }, load)
      .on("postgres_changes", { event: "*", schema: "public", table: "group_cohorts" }, load)
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, [formType, level]);

  return { cohorts, loading };
}