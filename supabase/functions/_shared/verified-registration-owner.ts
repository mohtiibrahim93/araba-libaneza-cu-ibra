/** Verify mailbox control through Auth, never through caller-supplied email. */
export async function verifiedRegistrationOwner(
  request: Request,
  registration: { email?: string | null },
  auth: { getUser: (token: string) => Promise<{ data: { user: { email?: string; email_confirmed_at?: string | null; is_anonymous?: boolean } | null }; error: unknown }> },
): Promise<boolean> {
  const match = /^Bearer\s+(\S+)$/i.exec(request.headers.get("authorization") ?? "");
  const token = match?.[1];
  const email = registration.email?.trim().toLowerCase();
  if (!token || !email) return false;
  try {
    const { data, error } = await auth.getUser(token);
    return !error && !!data.user?.email_confirmed_at && !data.user.is_anonymous
      && data.user.email?.trim().toLowerCase() === email;
  } catch { return false; }
}