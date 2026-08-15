import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Cohort, CohortStatus } from "@/hooks/useGroupCohorts";

// Cohorts that are joinable right now: already-running ones (started in the
// last 3 weeks) plus those starting within the next 2 months.
const PAST_WINDOW_DAYS = 21;
const FUTURE_WINDOW_DAYS = 60;

const ACTIVE_STATUSES: CohortStatus[] = [
  "forming",
  "minimum_reached",
  "confirmed",
  "full",
  "in_progress",
];

const iso = (d: Date) => d.toISOString().slice(0, 10);

async function fetchActive(): Promise<Cohort[]> {
  const now = new Date();
  const from = new Date(now);
  from.setDate(from.getDate() - PAST_WINDOW_DAYS);
  const to = new Date(now);
  to.setDate(to.getDate() + FUTURE_WINDOW_DAYS);

  const [{ data, error }, { data: counts }] = await Promise.all([
    supabase
      .from("group_cohorts")
      .select(
        "id, form_type, level, format, start_date, schedule_label_ro, schedule_label_en, max_seats, sort_order, status",
      )
      .eq("form_type", "group")
      .eq("is_active", true)
      .in("status", ACTIVE_STATUSES)
      .gte("start_date", iso(from))
      .lte("start_date", iso(to))
      .order("start_date", { ascending: true }),
    supabase.rpc("get_cohort_signup_counts"),
  ]);

  if (error) {
    console.error("[useActiveCohorts] load error", error);
    return [];
  }

  const takenMap = new Map<string, number>();
  (counts || []).forEach((c: { cohort_id: string; taken: number }) => {
    takenMap.set(c.cohort_id, Number(c.taken) || 0);
  });

  const today = iso(now);
  return (data || [])
    .map((c) => {
      const taken = Math.min(takenMap.get(c.id) || 0, c.max_seats);
      return {
        ...c,
        form_type: c.form_type as "group" | "kids",
        status: (c.status as CohortStatus) ?? "forming",
        taken,
        seatsLeft: Math.max(0, c.max_seats - taken),
        full: taken >= c.max_seats,
      } as Cohort;
    })
    // Already-started cohorts first (most urgent), then by start date.
    .sort((a, b) => {
      const aRun = a.start_date <= today ? 0 : 1;
      const bRun = b.start_date <= today ? 0 : 1;
      if (aRun !== bRun) return aRun - bRun;
      return a.start_date.localeCompare(b.start_date);
    })
    .slice(0, 3);
}

/** Group cohorts that are running now or starting soon (homepage highlight). */
export function useActiveCohorts() {
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetchActive().then((d) => {
      if (active) {
        setCohorts(d);
        setLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  return { cohorts, loading };
}
