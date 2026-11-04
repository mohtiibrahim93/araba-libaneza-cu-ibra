import type { RealtimeChannel } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

/**
 * One Supabase realtime channel per set of tables, shared by every component
 * that listens to it (audit P3: each seat badge opened its own channel, so a
 * page with six badges held six identical subscriptions).
 *
 * The channel opens with the first listener and closes with the last.
 */
const shared = new Map<
  string,
  { channel: RealtimeChannel; listeners: Set<() => void> }
>();

export function subscribeToTables(
  tables: readonly string[],
  listener: () => void,
): () => void {
  const key = [...tables].sort().join(",");
  let entry = shared.get(key);
  if (!entry) {
    const listeners = new Set<() => void>();
    let channel = supabase.channel(
      // A fresh topic each time: supabase-js hands back an existing channel
      // with the same topic, and one still closing cannot take new callbacks.
      `shared-${key}-${Math.random().toString(36).slice(2)}`,
    );
    for (const table of tables) {
      channel = channel.on(
        "postgres_changes",
        { event: "*", schema: "public", table },
        () => listeners.forEach((l) => l()),
      );
    }
    channel.subscribe();
    entry = { channel, listeners };
    shared.set(key, entry);
  }
  entry.listeners.add(listener);
  const current = entry;
  return () => {
    current.listeners.delete(listener);
    if (current.listeners.size === 0 && shared.get(key) === current) {
      shared.delete(key);
      void supabase.removeChannel(current.channel);
    }
  };
}
