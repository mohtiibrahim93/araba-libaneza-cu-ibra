// Shared CORS handling for all edge functions. Restricts responses to our
// own origins instead of "*", which previously let any third-party site
// make browser-based calls (including payment/admin endpoints) using a
// visitor's own session context.
const ALLOWED_ORIGINS = [
  "https://centruldearabalibaneza.com",
  "https://araba-libaneza-cu-ibra.lovable.app",
];

// Lovable preview/editor sandboxes and localhost dev servers.
const ALLOWED_ORIGIN_PATTERNS = [
  /^https:\/\/([a-z0-9-]+--)?[a-z0-9-]+\.lovable\.app$/i,
  /^https:\/\/([a-z0-9-]+\.)*lovableproject\.com$/i,
  /^http:\/\/localhost(:\d+)?$/i,
  /^http:\/\/127\.0\.0\.1(:\d+)?$/i,
];

const BASE_HEADERS = {
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Vary": "Origin",
};

/** Build per-request CORS headers, reflecting the origin only if it's allowed. */
export function buildCorsHeaders(req: Request, extraHeaders?: Record<string, string>): Record<string, string> {
  const origin = req.headers.get("origin") || "";
  const allowed =
    ALLOWED_ORIGINS.includes(origin) || ALLOWED_ORIGIN_PATTERNS.some((re) => re.test(origin));
  return {
    ...BASE_HEADERS,
    ...extraHeaders,
    "Access-Control-Allow-Origin": allowed ? origin : ALLOWED_ORIGINS[0],
  };
}

/**
 * Origin to send the customer back to after a Stripe-hosted checkout
 * (success_url / cancel_url). Only ever an allowlisted origin — a forged
 * Origin header must not be able to bounce customers to an arbitrary site.
 */
export function resolveReturnOrigin(req: Request): string {
  const origin = req.headers.get("origin") || "";
  const allowed =
    ALLOWED_ORIGINS.includes(origin) || ALLOWED_ORIGIN_PATTERNS.some((re) => re.test(origin));
  return allowed ? origin : ALLOWED_ORIGINS[0];
}
