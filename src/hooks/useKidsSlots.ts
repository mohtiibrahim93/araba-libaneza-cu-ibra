import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface KidsSlot {
  id: string;
  weekday: number; // 1=Mon..7=Sun
  start_time: string; // HH:MM:SS
  duration_min: number;
  format: "online" | "physical";
  location: string | null;
  max_seats: number;
  sort_order: number;
  taken: number;
  seatsLeft: number;
  full: boolean;
}

async function fetchSlots(): Promise<KidsSlot[]> {
  const [{ data: slots, error }, { data: counts }] = await Promise.all([
    supabase
      .from("kids_class_slots")
      .select("id, weekday, start_time, duration_min, format, location, max_seats, sort_order")
      .eq("is_active", true)
      .order("weekday", { ascending: true })
      .order("start_time", { ascending: true }),
    supabase.rpc("get_kids_slot_signup_counts"),
  ]);
  if (error) {
    console.error("[useKidsSlots] load error", error);
    return [];
  }

  const takenMap = new Map<string, number>();
  (counts || []).forEach((c: { kids_slot_id: string; taken: number }) => {
    takenMap.set(c.kids_slot_id, Number(c.taken) || 0);
  });

  return (slots || []).map((s) => {
    const taken = Math.min(takenMap.get(s.id) || 0, s.max_seats);
    return {
      ...s,
      format: s.format as "online" | "physical",
      taken,
      seatsLeft: Math.max(0, s.max_seats - taken),
      full: taken >= s.max_seats,
    };
  });
}

export function useKidsSlots() {
  const [slots, setSlots] = useState<KidsSlot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const load = async () => {
      const data = await fetchSlots();
      if (active) {
        setSlots(data);
        setLoading(false);
      }
    };
    load();

    const channel = supabase
      .channel(`kids-slot-updates-${Math.random().toString(36).slice(2)}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "registrations" }, load)
      .on("postgres_changes", { event: "*", schema: "public", table: "kids_class_slots" }, load)
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, []);

  return { slots, loading };
}