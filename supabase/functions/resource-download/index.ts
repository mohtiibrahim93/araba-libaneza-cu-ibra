import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { buildCorsHeaders } from "../_shared/cors.ts";
import { checkRateLimit, getClientIp } from "../_shared/rate-limit.ts";
import { sendTemplateEmail } from "../_shared/managed-email.ts";


// Free-resource lead magnet: the visitor submits name + email on the Arabizi
// pages, we store the lead and email them the cheat-sheet PDF link.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RESOURCES: Record<string, { template: string }> = {
  "arabizi-cheat-sheet": { template: "arabizi-cheat-sheet" },
  "100-expresii-libaneze": { template: "expresii-libaneze" },
  "plan-30-zile": { template: "plan-30-zile" },
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
    const requested = typeof resource === "string" ? resource.trim() : "";

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Resources are admin-editable rows; the hardcoded map stays as a fallback
    // so the flow keeps working even if the table is empty/unreachable.
    const { data: row } = await supabase
      .from("resources")
      .select("slug, email_template, is_active, file_url")
      .eq("slug", requested)
      .maybeSingle();

    const key = row?.is_active
      ? row.slug
      : requested in RESOURCES
        ? requested
        : "arabizi-cheat-sheet";
    const template = row?.is_active && row.email_template
      ? row.email_template
      : RESOURCES[key]?.template ?? RESOURCES["arabizi-cheat-sheet"].template;

    const ip = getClientIp(req) || "unknown";
    // Limits are per resource so that requesting several different PDFs
    // (the normal flow on /invata-araba-gratis) never trips the limiter.
    const ipOk = await checkRateLimit(supabase, `resource:ip:${ip}`, 120, 3600);
    const emailOk = await checkRateLimit(
      supabase,
      `resource:email:${cleanEmail}:${key}`,
      20,
      86400,
    );
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

    try {
      await sendTemplateEmail(template, cleanEmail, {
        idempotencyKey: `${key}-${cleanEmail}-${new Date().toISOString().slice(0, 16)}`,
        templateData: {
          name: cleanName || undefined,
          // Admin-editable file: prefer the current URL so replaced PDFs are
          // reflected in the email. Falls back to the template default.
          downloadUrl:
            row?.is_active && typeof row.file_url === "string" && /^https?:\/\//.test(row.file_url)
              ? row.file_url
              : undefined,
        },
      });
    } catch (sendError) {
      console.error("resource-download email send failed", sendError);
      return json({ error: "Trimiterea emailului a eșuat. Încearcă din nou." }, 500);
    }


    return json({ success: true });
  } catch (err) {
    console.error("resource-download error:", err instanceof Error ? err.message : err);
    return json({ error: "Cerere invalidă." }, 400);
  }
});
