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

    if (!adminPassword || password !== adminPassword) {
      return jsonResponse({ error: "Parolă incorectă" });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

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

      const { data, error } = await supabase
        .from("registrations")
        .update({ lead_status })
        .eq("id", id)
        .select("*")
        .single();

      if (error) throw error;
      return jsonResponse({ success: true, data });
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
