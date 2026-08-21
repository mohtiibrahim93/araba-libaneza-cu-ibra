import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { buildCorsHeaders } from "../_shared/cors.ts";
import { checkRateLimit, getClientIp } from "../_shared/rate-limit.ts";

// Free-resource lead magnet: the visitor submits name + email on the Arabizi
// pages, we store the lead and email them the cheat-sheet PDF link.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RESOURCES: Record<string, { template: string }> = {
  "arabizi-cheat-sheet": { template: "arabizi-cheat-sheet" },
};

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
    const { email, name, resource, consent, source } = await req.json();
    const cleanEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
    if (!EMAIL_RE.test(cleanEmail) || cleanEmail.length > 200) {
      return json({ error: "Adresă de email invalidă." }, 400);
    }
    if (name != null && (typeof name !== "string" || name.length > 120)) {
      return json({ error: "Nume invalid." }, 400);
    }
    if (consent !== true) {
      return json({ error: "Este nevoie de acordul pentru prelucrarea datelor." }, 400);
    }
    const key = typeof resource === "string" && resource in RESOURCES
      ? resource
      : "arabizi-cheat-sheet";

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const ip = getClientIp(req) || "unknown";
    const ipOk = await checkRateLimit(supabase, `resource:ip:${ip}`, 10, 3600);
    const emailOk = await checkRateLimit(supabase, `resource:email:${cleanEmail}`, 3, 86400);
    if (!ipOk || !emailOk) {
      return json({ error: "Prea multe cereri. Încearcă mai târziu." }, 429);
    }

    const cleanName = (typeof name === "string" ? name.trim() : "") || null;
    const { error: insertError } = await supabase.from("resource_leads").insert({
      email: cleanEmail,
      name: cleanName,
      resource: key,
      consent: true,
      source: typeof source === "string" ? source.slice(0, 120) : null,
    });
    if (insertError) {
      console.error("resource-download insert failed", insertError.message);
      // Keep going — the visitor should still receive the resource.
    }

    const { error } = await supabase.functions.invoke("send-transactional-email", {
      body: {
        templateName: RESOURCES[key].template,
        recipientEmail: cleanEmail,
        idempotencyKey: `${key}-${cleanEmail}-${new Date().toISOString().slice(0, 10)}`,
        templateData: { name: cleanName || undefined },
      },
    });
    if (error) {
      console.error("resource-download email send failed", error);
      return json({ error: "Trimiterea emailului a eșuat. Încearcă din nou." }, 500);
    }

    return json({ success: true });
  } catch (err) {
    console.error("resource-download error:", err instanceof Error ? err.message : err);
    return json({ error: "Cerere invalidă." }, 400);
  }
});
