import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type CapacityKey = { formType: "group" | "kids"; level?: string | null };
export type CapacityFormat = "fizic" | "online";

export interface CapacityRow {
  form_type: string;
  level: string | null;
  format: string | null;
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

function buildKey(
  formType: string,
  level: string | null | undefined,
  format: string | null | undefined,
) {
  return `${formType}:${level ?? ""}:${format ?? ""}`;
}

async function fetchAll(): Promise<Record<string, CapacityRow>> {
  // Counts come from a SECURITY DEFINER RPC that already gates on
  // qualified+converted lead statuses and folds in admin-logged manual
  // signups (§ manual_signups). Anon clients have no direct SELECT on
  // registrations or manual_signups, so we must NOT query those here.
  const [{ data: caps }, { data: counts }] = await Promise.all([
    supabase.from("group_capacities").select("form_type, level, format, max_seats, min_seats"),
    supabase.rpc("get_group_capacity_counts"),
  ]);

  const countMap = new Map<string, number>();
  (counts || []).forEach(
    (c: { form_type: string; level: string | null; format: string | null; taken: number }) => {
      countMap.set(buildKey(c.form_type, c.level ?? null, c.format ?? null), Number(c.taken) || 0);
    },
  );

  const out: Record<string, CapacityRow> = {};
  (caps || []).forEach((c: Omit<CapacityRow, "taken">) => {
    const key = buildKey(c.form_type, c.level, c.format);
    out[key] = { ...c, taken: countMap.get(key) || 0 };
  });
  return out;
}

function toInfo(max: number, min: number, rawTaken: number): CapacityInfo | null {
  // Guard against missing/invalid capacity rows so the UI never renders
  // impossible values like "10 / 0 locuri ocupate".
  if (!max || max <= 0) return null;
  const taken = Math.min(rawTaken, max);
  return {
    taken,
    max,
    min,
    seatsLeft: Math.max(0, max - taken),
    needToStart: Math.max(0, min - taken),
    belowMin: taken < min,
    full: taken >= max,
  };
}

export function useGroupCapacities() {
  const [data, setData] = useState<Record<string, CapacityRow>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const load = async () => {
      // Unreachable backend → no capacity rows, which the `get` helpers below
      // already read as "seat counters unknown" (they return null).
      const result = await fetchAll().catch((err) => {
        console.error("[useGroupCapacities] unreachable backend", err);
        return {} as Record<string, CapacityRow>;
      });
      if (active) {
        setData(result);
        setLoading(false);
      }
    };
    void load();

    const channel = supabase
      .channel(`capacity-updates-${Math.random().toString(36).slice(2)}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "registrations" }, load)
      .on("postgres_changes", { event: "*", schema: "public", table: "group_capacities" }, load)
      .on("postgres_changes", { event: "*", schema: "public", table: "manual_signups" }, load)
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, []);

  /**
   * Seat info for a class.
   * - kids: single row (format ignored).
   * - group + format: that format's own seats (fizic vs online tracked apart).
   * - group without format: aggregate across formats (total seats for the
   *   level) — used by summary displays that aren't tied to one format yet.
   */
  const get = (
    formType: "group" | "kids",
    level?: string | null,
    format?: CapacityFormat | null,
  ): CapacityInfo | null => {
    if (formType === "kids") {
      const row = data[buildKey("kids", null, null)];
      return row ? toInfo(row.max_seats, row.min_seats, row.taken) : null;
    }

    if (format) {
      const row = data[buildKey("group", level ?? null, format)];
      return row ? toInfo(row.max_seats, row.min_seats, row.taken) : null;
    }

    // Aggregate across formats for this level.
    const prefix = buildKey("group", level ?? null, "");
    const rows = Object.entries(data)
      .filter(([k]) => k.startsWith(prefix))
      .map(([, r]) => r);
    if (rows.length === 0) return null;
    const max = rows.reduce((s, r) => s + r.max_seats, 0);
    const taken = rows.reduce((s, r) => s + r.taken, 0);
    const min = Math.min(...rows.map((r) => r.min_seats));
    return toInfo(max, min, taken);
  };

  /**
   * Both formats' seat info for a group level, kept apart — never summed.
   * Public displays use this so "5 fizic + 7 online" reads as two counters,
   * not a misleading combined "12".
   */
  const getFormats = (
    level?: string | null,
  ): { fizic: CapacityInfo | null; online: CapacityInfo | null } => ({
    fizic: get("group", level, "fizic"),
    online: get("group", level, "online"),
  });

  return { get, getFormats, loading, raw: data };
}
