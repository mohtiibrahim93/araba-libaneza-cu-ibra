import { supabase } from "@/integrations/supabase/client";

export interface BacklinkSnapshot {
  id: string;
  snapshot_date: string;
  domain: string;
  authority_score: number | null;
  trust_score: number | null;
  backlinks_total: number | null;
  referring_domains: number | null;
  follow_links: number | null;
  nofollow_links: number | null;
  top_referring_domains: unknown[];
  anchor_distribution: unknown[];
  created_at: string;
  source?: string | null;
  metric_sources?: Record<string, string> | null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function invokeBacklinks<T = any>(body: Record<string, unknown>) {
  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData.session?.access_token;
  return supabase.functions.invoke<T>("backlink-snapshot", {
    body,
    ...(token ? { headers: { Authorization: `Bearer ${token}` } } : {}),
  });
}

export function formatNumber(n: number | null | undefined): string {
  if (n === null || n === undefined) return "—";
  return n.toLocaleString("ro-RO");
}
