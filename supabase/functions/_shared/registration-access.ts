// Ownership checks for public (no-login) registration endpoints.
//
// Registrations are created anonymously, so there is no user session to check.
// Instead a caller must prove they are the registrant:
//  - browser flows send the email they registered with, which must match the
//    email stored on the row (registrations have no public SELECT, so the
//    email is not discoverable from the ID);
//  - links we generate server-side (calendar .ics, payment return URLs) carry
//    an HMAC signature of the registration ID that only the server can mint.

const enc = new TextEncoder();

async function hmacHex(message: string): Promise<string> {
  const secret = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(`registration-access:${secret}`),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, 40);
}

/** Signature to append to server-generated links for a registration. */
export function signRegistrationId(id: string): Promise<string> {
  return hmacHex(`reg:${id}`);
}

export async function verifyRegistrationSignature(id: string, sig: unknown): Promise<boolean> {
  if (typeof sig !== "string" || sig.length !== 40) return false;
  return (await signRegistrationId(id)) === sig;
}

const norm = (e: unknown) => (typeof e === "string" ? e.trim().toLowerCase() : "");

/**
 * True when the caller may act on this registration.
 * - Valid server-issued signature always passes.
 * - Otherwise the caller-supplied email must match the registration email.
 * - Registrations with no email (email is optional on the group form) are only
 *   actionable within 24h of creation, i.e. by the visitor who just submitted.
 */
export async function callerOwnsRegistration(
  reg: { id: string; email?: string | null; created_at?: string | null },
  proof: { email?: unknown; sig?: unknown },
): Promise<boolean> {
  if (await verifyRegistrationSignature(reg.id, proof.sig)) return true;
  const stored = norm(reg.email);
  if (stored) return norm(proof.email) === stored;
  const created = reg.created_at ? Date.parse(reg.created_at) : NaN;
  return Number.isFinite(created) && Date.now() - created < 24 * 3600 * 1000;
}
