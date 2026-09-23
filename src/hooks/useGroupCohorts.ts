import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Cohort, CohortStatus } from "@/lib/cohortTypes";

export type { Cohort, CohortStatus } from "@/lib/cohortTypes";


// Statuses that should appear on the public site / registration form.
// `draft` is admin-only; `completed`/`cancelled` are historical; `in_progress`
// is mid-cohort and not joinable; `full` is shown but as waitlist.
const PUBLIC_COHORT_STATUSES: CohortStatus[] = [
  "forming",
  "minimum_reached",
  "confirmed",
  "full",
];

async function fetchCohorts(
  formType: "group" | "kids",
  level?: string | null,
  format?: string | null,
  teachingLanguage?: "ro" | "en" | null,
): Promise<Cohort[]> {
  const today = new Date().toISOString().slice(0, 10);
  let q = supabase
    .from("group_cohorts")
    .select("id, form_type, level, format, start_date, end_date, end_date_is_estimate, break_note_ro, break_note_en, schedule_label_ro, schedule_label_en, max_seats, sort_order, status, teaching_language")
    .eq("form_type", formType)
    .in("status", PUBLIC_COHORT_STATUSES)
    .gte("start_date", today)
    .order("sort_order", { ascending: true })
    .order("start_date", { ascending: true });

  if (level) q = q.eq("level", level);
  else if (formType === "kids") q = q.is("level", null);

  // A chosen format shows that format's cohorts plus any format-agnostic ones
  // (format IS NULL) — so cohorts created before formats existed still appear.
  if (format) q = q.or(`format.eq.${format},format.is.null`);

  // Only offer classes taught in a language the student actually follows. Every
  // cohort is 'ro' until an English-language one is opened, so an English
  // visitor correctly sees an empty list and lands on the waiting message
  // rather than being quietly booked into a Romanian class.
  if (teachingLanguage) q = q.eq("teaching_language", teachingLanguage);

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
      teaching_language: (c.teaching_language as "ro" | "en") ?? "ro",
      end_date: c.end_date ?? null,
      end_date_is_estimate: Boolean(c.end_date_is_estimate),
      break_note_ro: c.break_note_ro ?? null,
      break_note_en: c.break_note_en ?? null,
      taken,
      seatsLeft: Math.max(0, c.max_seats - taken),
      full: taken >= c.max_seats,
    };
  });
}

/**
 * Cohorts a given student could actually join.
 *
 * `teachingLanguage` defaults to the language the visitor is reading the site
 * in: someone on the English pages is offered English-language cohorts only.
 * Pass null to opt out of the filter (the admin views list every cohort).
 */
export function useGroupCohorts(
  formType: "group" | "kids",
  level?: string | null,
  format?: string | null,
  teachingLanguage?: "ro" | "en" | null,
) {
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const load = async () => {
      // An unreachable backend rejects rather than returning an error object;
      // treat it as "no cohorts" so the form shows its waiting message.
      const data = await fetchCohorts(
        formType,
        level ?? null,
        format ?? null,
        teachingLanguage ?? null,
      ).catch((err) => {
        console.error("[useGroupCohorts] unreachable backend", err);
        return [] as Cohort[];
      });
      if (active) {
        setCohorts(data);
        setLoading(false);
      }
    };
    void load();

    const channel = supabase
      .channel(`cohort-updates-${Math.random().toString(36).slice(2)}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "registrations" }, load)
      .on("postgres_changes", { event: "*", schema: "public", table: "group_cohorts" }, load)
      .on("postgres_changes", { event: "*", schema: "public", table: "manual_signups" }, load)
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, [formType, level, format, teachingLanguage]);

  return { cohorts, loading };
}