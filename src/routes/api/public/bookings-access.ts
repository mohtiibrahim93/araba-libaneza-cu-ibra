import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const SITE_URL = "https://centruldearabalibaneza.com";
const TOKEN_LIFETIME_SECONDS = 30 * 60;

const requestSchema = z.object({
  email: z.string().trim().email().max(255),
  lang: z.enum(["ro", "en"]).default("ro"),
});

interface AccessPayload {
  email: string;
  exp: number;
}

async function encryptionKey(secret: string) {
  const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(secret));
  return crypto.subtle.importKey(
    "raw",
    bytes,
    { name: "AES-GCM" },
    false,
    ["encrypt", "decrypt"],
  );
}

async function createAccessToken(payload: AccessPayload, secret: string): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    await encryptionKey(secret),
    new TextEncoder().encode(encodedPayload),
  );
  return Buffer.concat([Buffer.from(iv), Buffer.from(ciphertext)]).toString("base64url");
}

async function readAccessToken(token: string, secret: string): Promise<AccessPayload | null> {
  if (token.length < 40 || token.length > 4096) return null;
  try {
    const packed = Buffer.from(token, "base64url");
    if (packed.length <= 28) return null;
    const plaintext = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: packed.subarray(0, 12) },
      await encryptionKey(secret),
      packed.subarray(12),
    );
    const payload = JSON.parse(new TextDecoder().decode(plaintext)) as Partial<AccessPayload>;
    if (typeof payload.email !== "string" || typeof payload.exp !== "number") return null;
    if (payload.exp <= Math.floor(Date.now() / 1000)) return null;
    return { email: payload.email, exp: payload.exp };
  } catch {
    return null;
  }
}

async function digest(value: string): Promise<string> {
  const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Buffer.from(bytes).toString("hex");
}

function escapeIlike(value: string): string {
  return value.replace(/([%_\\])/g, "\\$1");
}

const genericMessage = {
  ok: true,
  message: "If bookings exist for that address, the private link has been sent.",
};

export const Route = createFileRoute("/api/public/bookings-access")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const parsed = requestSchema.safeParse(await request.json().catch(() => null));
        if (!parsed.success) return Response.json({ error: "invalid request" }, { status: 400 });

        const secret = process.env["LOVABLE_API_KEY"];
        if (!secret) return Response.json({ error: "service unavailable" }, { status: 503 });

        const email = parsed.data.email.toLowerCase();
        const ip = request.headers.get("cf-connecting-ip") ?? request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const [ipBucket, emailBucket] = await Promise.all([digest(ip), digest(email)]);
        const [ipLimit, emailLimit] = await Promise.all([
          supabaseAdmin.rpc("check_and_record_rate_limit", { p_bucket: `bookings_access_ip:${ipBucket}`, p_max: 10, p_window_seconds: 3600 }),
          supabaseAdmin.rpc("check_and_record_rate_limit", { p_bucket: `bookings_access_email:${emailBucket}`, p_max: 3, p_window_seconds: 3600 }),
        ]);
        if (ipLimit.error || emailLimit.error) {
          console.error("[bookings-access] rate limit check failed", ipLimit.error ?? emailLimit.error);
          return Response.json({ error: "service unavailable" }, { status: 503 });
        }
        if (!ipLimit.data || !emailLimit.data) return Response.json({ error: "too many requests" }, { status: 429 });

        const { data: booking } = await supabaseAdmin
          .from("bookings")
          .select("id")
          .ilike("student_email", escapeIlike(email))
          .limit(1)
          .maybeSingle();

        if (booking) {
          const token = await createAccessToken(
            { email, exp: Math.floor(Date.now() / 1000) + TOKEN_LIFETIME_SECONDS },
            secret,
          );
          const path = parsed.data.lang === "en" ? "/en/my-bookings" : "/rezervari";
          const accessUrl = `${SITE_URL}${path}?token=${encodeURIComponent(token)}`;
          const { sendTemplateEmail } = await import("@/lib/email-templates/send-email");
          try {
            await sendTemplateEmail("bookings-access", email, {
              templateData: { accessUrl, lang: parsed.data.lang },
            });
          } catch (error) {
            console.error("[bookings-access] email failed", error);
          }
        }

        return Response.json(genericMessage);
      },
      GET: async ({ request }) => {
        const secret = process.env["LOVABLE_API_KEY"];
        if (!secret) return Response.json({ error: "service unavailable" }, { status: 503 });
        const token = new URL(request.url).searchParams.get("token");
        if (!token) return Response.json({ error: "missing token" }, { status: 400 });
        const access = await readAccessToken(token, secret);
        if (!access) return Response.json({ error: "invalid or expired link" }, { status: 401 });

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data, error } = await supabaseAdmin
          .from("bookings")
          .select("id,event_type_slug,start_at,end_at,status,format,meet_link,manage_token,booking_event_types(name_ro,name_en,duration_min)")
          .ilike("student_email", escapeIlike(access.email))
          .order("start_at", { ascending: false });
        if (error) {
          console.error("[bookings-access] booking lookup failed", error);
          return Response.json({ error: "service unavailable" }, { status: 503 });
        }
        return Response.json({ bookings: data ?? [], expires_at: new Date(access.exp * 1000).toISOString() });
      },
    },
  },
});