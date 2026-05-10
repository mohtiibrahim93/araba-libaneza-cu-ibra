import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const ADMIN_RECIPIENT = "mohtiibrahim@gmail.com";
const TEMPLATE_BY_FORM_TYPE: Record<string, string> = {
  group: "group-registration-confirmation",
  private: "private-registration-confirmation",
  kids: "kids-registration-confirmation",
};
const FORM_TYPE_LABEL: Record<string, string> = {
  group: "Grup",
  private: "Privat",
  kids: "Copii",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { registrationId } = await req.json();
    if (!registrationId || typeof registrationId !== "string") {
      return new Response(JSON.stringify({ error: "registrationId is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    // Look up the registration server-side. This prevents callers from
    // spoofing arbitrary recipient emails — we only send to what is in DB.
    const { data: reg, error: regErr } = await supabase
      .from("registrations")
      .select("id, form_type, name, phone, email, center, format, notes")
      .eq("id", registrationId)
      .maybeSingle();

    if (regErr || !reg) {
      return new Response(JSON.stringify({ error: "Registration not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const formTypeLabel = FORM_TYPE_LABEL[reg.form_type] ?? reg.form_type;

    const invokeEmail = async (body: Record<string, unknown>) => {
      try {
        const r = await fetch(`${supabaseUrl}/functions/v1/send-transactional-email`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // Service-role auth required by send-transactional-email.
            Authorization: `Bearer ${serviceKey}`,
          },
          body: JSON.stringify(body),
        });
        if (!r.ok) {
          console.error("send-transactional-email failed", r.status, await r.text());
        }
      } catch (e) {
        console.error("send-transactional-email invocation error", e);
      }
    };

    // 1) Confirmation to the registrant (only if they provided an email)
    if (reg.email) {
      const tpl = TEMPLATE_BY_FORM_TYPE[reg.form_type];
      if (tpl) {
        await invokeEmail({
          templateName: tpl,
          recipientEmail: reg.email,
          idempotencyKey: `reg-${reg.id}`,
          templateData: { name: reg.name },
        });
      }
    }

    // 2) Admin notification with the full lead details
    await invokeEmail({
      templateName: "admin-new-registration",
      recipientEmail: ADMIN_RECIPIENT,
      idempotencyKey: `admin-reg-${reg.id}`,
      templateData: {
        name: reg.name,
        phone: reg.phone,
        email: reg.email || "",
        formType: formTypeLabel,
        format: reg.format || "",
        center: reg.center || "",
        notes: reg.notes || "",
      },
    });

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("notify-registration error:", msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
