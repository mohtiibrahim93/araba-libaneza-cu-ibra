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
  const [{ data: caps }, { data: regs }] = await Promise.all([
    supabase.from("group_capacities").select("form_type, level, max_seats, min_seats"),
    supabase
      .from("registrations")
      .select("form_type, level")
      .in("form_type", ["group", "kids"]),
  ]);

  const counts = new Map<string, number>();
  (regs || []).forEach((r) => {
    const key = buildKey(r.form_type, (r as { level?: string | null }).level ?? null);
    counts.set(key, (counts.get(key) || 0) + 1);
  });

  const out: Record<string, CapacityRow> = {};
  (caps || []).forEach((c) => {
    const key = buildKey(c.form_type, c.level);
    out[key] = { ...c, taken: counts.get(key) || 0 };
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
      .channel("capacity-updates")
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
    const taken = row.taken;
    const max = row.max_seats;
    const min = row.min_seats;
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