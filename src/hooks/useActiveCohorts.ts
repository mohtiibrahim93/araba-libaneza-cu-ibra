import { useEffect, useState } from "react";
import type { Cohort, CohortStatus } from "@/lib/cohortTypes";

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
  // Imported here rather than at module scope: the Supabase client is 216 KB,
  // and a static import puts it on the first-load path of every page that
  // renders this hook — src/test/homepage-critical-path.test.ts exists
  // because that happened once already. Same pattern as useSiteTexts.
  const { supabase } = await import("@/integrations/supabase/client");
  const now = new Date();
  const from = new Date(now);
  from.setDate(from.getDate() - PAST_WINDOW_DAYS);
  const to = new Date(now);
  to.setDate(to.getDate() + FUTURE_WINDOW_DAYS);

  // A query error is handled below; an unreachable backend REJECTS instead
  // (DNS failure while the database is paused), which used to leave the
  // section stuck on `loading` forever. Treat both as "no cohorts" so the
  // evergreen copy renders.
  const [{ data, error }, { data: counts }] = await Promise.all([
    supabase
      .from("group_cohorts")
      .select(
        "id, form_type, level, format, start_date, schedule_label_ro, schedule_label_en, max_seats, sort_order, status, teaching_language",
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
        teaching_language: (c.teaching_language as "ro" | "en") ?? "ro",
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
    });
  // No slice here: the homepage banner keeps only upcoming cohorts, while the
  // enrollment note on /cursuri/grup lists running ones too — each consumer
  // trims the list to what its own copy promises.
}

/** Group cohorts that are running now or starting soon (homepage highlight). */
export function useActiveCohorts() {
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetchActive()
      .catch((err) => {
        console.error("[useActiveCohorts] unreachable backend", err);
        return [] as Cohort[];
      })
      .then((d) => {
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
