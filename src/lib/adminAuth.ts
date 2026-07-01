import { supabase } from "@/integrations/supabase/client";

/**
 * Calls the admin-registrations edge function authenticated as the current
 * Supabase Auth session (Google sign-in), instead of a shared password.
 * The edge function checks the caller's email against the ADMIN_EMAILS
 * allowlist secret before allowing any admin action.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function invokeAdmin<T = any>(body: Record<string, unknown>) {
  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData.session?.access_token;
  return supabase.functions.invoke<T>("admin-registrations", {
    body,
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
}
