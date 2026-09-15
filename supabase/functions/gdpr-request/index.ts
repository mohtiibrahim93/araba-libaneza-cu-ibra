import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { buildCorsHeaders } from "../_shared/cors.ts";
import { checkRateLimit, getClientIp } from "../_shared/rate-limit.ts";
import { sendTemplateEmail } from "../_shared/managed-email.ts";


// Self-service GDPR erasure request: the visitor submits their email and the
// school inbox gets an actionable notification (the actual deletion is done by
// the admin, who can verify identity — an unauthenticated endpoint must never
// delete data directly, or anyone could erase someone else's registration).

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

Deno.serve(async (req) => {
  const corsHeaders = buildCorsHeaders(req);
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  try {
    const { email, name, message } = await req.json();
    if (typeof email !== "string" || !EMAIL_RE.test(email.trim()) || email.length > 200) {
      return json({ error: "Email invalid" }, 400);
    }
    if (name != null && (typeof name !== "string" || name.length > 200)) {
      return json({ error: "Nume invalid" }, 400);
    }
    if (message != null && (typeof message !== "string" || message.length > 1000)) {
      return json({ error: "Mesaj invalid" }, 400);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Rate limit per IP and per target email so the endpoint can't be used to
    // spam the school inbox.
    const ip = getClientIp(req) || "unknown";
    const ipOk = await checkRateLimit(supabase, `gdpr:ip:${ip}`, 3, 3600);
    const emailOk = await checkRateLimit(
      supabase,
      `gdpr:email:${email.trim().toLowerCase()}`,
      2,
      86400,
    );
    if (!ipOk || !emailOk) {
      return json({ error: "Prea multe cereri. Încearcă mai târziu." }, 429);
    }

    const requestedAt = new Date().toLocaleString("ro-RO", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "Europe/Bucharest",
    });
    try {
      // Template pins the recipient to the school inbox.
      await sendTemplateEmail("gdpr-erasure-request", "", {
        idempotencyKey: `gdpr-${email.trim().toLowerCase()}-${new Date().toISOString().slice(0, 10)}`,
        templateData: {
          email: email.trim(),
          name: (name || "").trim() || undefined,
          message: (message || "").trim() || undefined,
          requestedAt,
        },
      });
    } catch (sendError) {
      console.error("gdpr-request email send failed", sendError);
      return json({ error: "Trimiterea a eșuat. Scrie-ne direct pe email." }, 500);
    }


    return json({ success: true });
  } catch (err) {
    console.error("gdpr-request error:", err instanceof Error ? err.message : err);
    return json({ error: "Cerere invalidă" }, 400);
  }
});
