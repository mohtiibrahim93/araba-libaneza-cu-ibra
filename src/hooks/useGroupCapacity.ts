import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type CapacityKey = { formType: "group" | "kids"; level?: string | null };

export interface CapacityRow {
  form_type: string;
  level: string | null;
  max_seats: number;
  min_seats: number;
  taken: number;
}

export interface CapacityInfo {
  taken: number;
  max: number;
  min: number;
  seatsLeft: number;
  needToStart: number;
  belowMin: boolean;
  full: boolean;
}

function buildKey(formType: string, level: string | null | undefined) {
  return `${formType}:${level ?? ""}`;
}

async function fetchAll(): Promise<Record<string, CapacityRow>> {
  // Counts come from a SECURITY DEFINER RPC that already gates on
  // qualified+converted lead statuses (§15). Anon clients have no
  // direct SELECT on registrations, so we must NOT query it here.
  const [{ data: caps }, { data: counts }] = await Promise.all([
    supabase.from("group_capacities").select("form_type, level, max_seats, min_seats"),
    supabase.rpc("get_group_capacity_counts"),
  ]);

  const countMap = new Map<string, number>();
  (counts || []).forEach((c: { form_type: string; level: string | null; taken: number }) => {
    countMap.set(buildKey(c.form_type, c.level ?? null), Number(c.taken) || 0);
  });

  const out: Record<string, CapacityRow> = {};
  (caps || []).forEach((c) => {
    const key = buildKey(c.form_type, c.level);
    out[key] = { ...c, taken: countMap.get(key) || 0 };
  });
  return out;
}

export function useGroupCapacities() {
  const [data, setData] = useState<Record<string, CapacityRow>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const load = async () => {
      const result = await fetchAll();
      if (active) {
        setData(result);
        setLoading(false);
      }
    };
    load();

    const channel = supabase
      .channel(`capacity-updates-${Math.random().toString(36).slice(2)}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "registrations" }, load)
      .on("postgres_changes", { event: "*", schema: "public", table: "group_capacities" }, load)
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, []);

  const get = (formType: "group" | "kids", level?: string | null): CapacityInfo | null => {
    const row = data[buildKey(formType, level ?? null)];
    if (!row) return null;
    const max = row.max_seats;
    const min = row.min_seats;
    // Guard against missing/invalid capacity rows so the UI never renders
    // impossible values like "10 / 0 locuri ocupate".
    if (!max || max <= 0) return null;
    const taken = Math.min(row.taken, max);
    return {
      taken,
      max,
      min,
      seatsLeft: Math.max(0, max - taken),
      needToStart: Math.max(0, min - taken),
      belowMin: taken < min,
      full: taken >= max,
    };
  };

  return { get, loading, raw: data };
}