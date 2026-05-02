import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

const allowedSenderDomains = ["arabalibanezacuibra.ro", "notify.arabalibanezacuibra.ro"];

function isAllowedSenderEmail(email: string) {
  const normalized = email.trim().toLowerCase();
  const domain = normalized.split("@")[1];
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized) && allowedSenderDomains.includes(domain);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { password, action, ids, id, lead_status, sender_name, sender_email } = body;
    const adminPassword = Deno.env.get("ADMIN_PASSWORD");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    if (action === "get_private_status") {
      if (typeof id !== "string") {
        return jsonResponse({ error: "Cerere invalidă" });
      }

      const { data: registration, error: registrationError } = await supabase
        .from("registrations")
        .select("id, created_at, name, format, lead_status")
        .eq("id", id)
        .eq("form_type", "private")
        .single();

      if (registrationError) {
        return jsonResponse({ error: "Cererea nu a fost găsită" });
      }

      return jsonResponse({ data: registration });
    }

    if (!adminPassword || password !== adminPassword) {
      return jsonResponse({ error: "Parolă incorectă" });
    }

    if (action === "list_notifications") {
      const { data: regs, error: regsError } = await supabase
        .from("registrations")
        .select("id, created_at, name, phone, email, form_type, format, center, whatsapp_sent_at, lead_status")
        .order("created_at", { ascending: false });
      if (regsError) throw regsError;

      const emails = (regs || [])
        .map((r) => r.email)
        .filter((e): e is string => !!e)
        .map((e) => e.toLowerCase());

      const templates = [
        "group-registration-confirmation",
        "private-registration-confirmation",
        "kids-registration-confirmation",
      ];

      let logs: Array<{
        recipient_email: string;
        template_name: string;
        status: string;
        created_at: string;
        message_id: string | null;
      }> = [];

      if (emails.length > 0) {
        const { data: logData, error: logError } = await supabase
          .from("email_send_log")
          .select("recipient_email, template_name, status, created_at, message_id")
          .in("template_name", templates)
          .in("recipient_email", emails)
          .order("created_at", { ascending: false });
        if (logError) throw logError;
        logs = logData || [];
      }

      // Latest status per (email, template)
      const latestByKey = new Map<string, { status: string; created_at: string }>();
      for (const log of logs) {
        const key = `${log.recipient_email.toLowerCase()}|${log.template_name}`;
        if (!latestByKey.has(key)) {
          latestByKey.set(key, { status: log.status, created_at: log.created_at });
        }
      }

      const templateByForm: Record<string, string> = {
        group: "group-registration-confirmation",
        private: "private-registration-confirmation",
        kids: "kids-registration-confirmation",
      };

      const enriched = (regs || []).map((r) => {
        const tmpl = templateByForm[r.form_type];
        const latest =
          r.email && tmpl
            ? latestByKey.get(`${r.email.toLowerCase()}|${tmpl}`)
            : undefined;
        return {
          ...r,
          email_status: latest?.status || (r.email ? "not_sent" : "no_email"),
          email_sent_at: latest?.created_at || null,
        };
      });

      return jsonResponse({ data: enriched });
    }

    if (action === "mark_whatsapp_sent") {
      if (typeof id !== "string") return jsonResponse({ error: "ID invalid" });
      const clear = body.clear === true;
      const { data, error } = await supabase
        .from("registrations")
        .update({ whatsapp_sent_at: clear ? null : new Date().toISOString() })
        .eq("id", id)
        .select("id, whatsapp_sent_at")
        .single();
      if (error) throw error;
      return jsonResponse({ success: true, data });
    }

    if (action === "resend_confirmation") {
      if (typeof id !== "string") return jsonResponse({ error: "ID invalid" });
      const { data: reg, error: regError } = await supabase
        .from("registrations")
        .select("id, name, email, form_type")
        .eq("id", id)
        .single();
      if (regError) throw regError;
      if (!reg.email) return jsonResponse({ error: "Lead-ul nu are email" });

      const templateByForm: Record<string, string> = {
        group: "group-registration-confirmation",
        private: "private-registration-confirmation",
        kids: "kids-registration-confirmation",
      };
      const templateName = templateByForm[reg.form_type];
      if (!templateName) return jsonResponse({ error: "Tip înscriere necunoscut" });

      const invokeResp = await fetch(
        `${Deno.env.get("SUPABASE_URL")}/functions/v1/send-transactional-email`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
          },
          body: JSON.stringify({
            templateName,
            recipientEmail: reg.email,
            idempotencyKey: `reg-resend-${reg.id}-${Date.now()}`,
            templateData: { name: reg.name },
          }),
        }
      );
      const invokeData = await invokeResp.json().catch(() => ({}));
      if (!invokeResp.ok || invokeData?.error) {
        return jsonResponse({ error: invokeData?.error || "Trimitere eșuată" });
      }
      return jsonResponse({ success: true });
    }

    if (action === "update_email_settings") {
      const senderName = typeof sender_name === "string" ? sender_name.trim() : "";
      const senderEmail = typeof sender_email === "string" ? sender_email.trim().toLowerCase() : "";

      if (senderName.length < 2 || senderName.length > 80 || !isAllowedSenderEmail(senderEmail)) {
        return jsonResponse({ error: "Numele sau emailul expeditorului este invalid" });
      }

      const { data, error } = await supabase
        .from("email_confirmation_settings")
        .upsert({ id: 1, sender_name: senderName, sender_email: senderEmail }, { onConflict: "id" })
        .select("sender_name, sender_email")
        .single();

      if (error) throw error;
      return jsonResponse({ success: true, settings: data });
    }

    // Delete action
    if (action === "delete" && Array.isArray(ids) && ids.length > 0) {
      const { error } = await supabase
        .from("registrations")
        .delete()
        .in("id", ids);

      if (error) throw error;
      return jsonResponse({ success: true });
    }

    if (action === "update_status") {
      if (typeof id !== "string" || !["new", "contacted", "confirmed"].includes(lead_status)) {
        return jsonResponse({ error: "Status invalid" });
      }

      const { data: existing, error: existingError } = await supabase
        .from("registrations")
        .select("lead_status")
        .eq("id", id)
        .single();

      if (existingError) throw existingError;

      const { data, error } = await supabase
        .from("registrations")
        .update({ lead_status })
        .eq("id", id)
        .select("*")
        .single();

      if (error) throw error;

      if ((existing?.lead_status || "new") !== lead_status) {
        const { error: historyError } = await supabase
          .from("lead_status_history")
          .insert({
            registration_id: id,
            previous_status: existing?.lead_status || "new",
            new_status: lead_status,
            changed_by: "admin",
          });

        if (historyError) throw historyError;
      }

      return jsonResponse({ success: true, data });
    }

    if (action === "get_private_lead") {
      if (typeof id !== "string") {
        return jsonResponse({ error: "Lead invalid" });
      }

      const { data: registration, error: registrationError } = await supabase
        .from("registrations")
        .select("*")
        .eq("id", id)
        .eq("form_type", "private")
        .single();

      if (registrationError) throw registrationError;

      const { data: history, error: historyError } = await supabase
        .from("lead_status_history")
        .select("*")
        .eq("registration_id", id)
        .order("created_at", { ascending: false });

      if (historyError) throw historyError;

      return jsonResponse({ data: { registration, history } });
    }

    // Default: list all
    const { data, error } = await supabase
      .from("registrations")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    const { data: settings, error: settingsError } = await supabase
      .from("email_confirmation_settings")
      .select("sender_name, sender_email")
      .eq("id", 1)
      .maybeSingle();

    if (settingsError) throw settingsError;

    return jsonResponse({ data, settings: settings || { sender_name: "Arabă Libaneză cu Ibra", sender_email: "noreply@arabalibanezacuibra.ro" } });
  } catch (err) {
    return jsonResponse({ error: err.message }, 500);
  }
});
