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

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { password, action, ids, id, lead_status } = body;
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

    return jsonResponse({ data });
  } catch (err) {
    return jsonResponse({ error: err.message }, 500);
  }
});
