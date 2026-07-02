import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

/**
 * DB-backed sliding-window rate limit, backed by the same
 * check_and_record_rate_limit() function the registrations-insert trigger
 * uses. Fails OPEN (allows the request) if the check itself errors, so a
 * bug here can never fully block a legitimate flow — worst case is the
 * limit silently doesn't apply for that request.
 */
export async function checkRateLimit(
  supabase: SupabaseClient,
  bucket: string,
  max: number,
  windowSeconds: number,
): Promise<boolean> {
  try {
    const { data, error } = await supabase.rpc("check_and_record_rate_limit", {
      p_bucket: bucket,
      p_max: max,
      p_window_seconds: windowSeconds,
    });
    if (error) {
      console.error("[rate-limit] check failed, failing open", error);
      return true;
    }
    return data === true;
  } catch (err) {
    console.error("[rate-limit] check threw, failing open", err);
    return true;
  }
}

/** Best-effort client IP from the standard proxy header chain. */
export function getClientIp(req: Request): string | null {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) {
    const first = fwd.split(",")[0]?.trim();
    if (first) return first;
  }
  return req.headers.get("cf-connecting-ip") || req.headers.get("x-real-ip") || null;
}
