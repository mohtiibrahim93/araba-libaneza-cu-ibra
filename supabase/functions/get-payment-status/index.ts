import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { buildCorsHeaders } from "../_shared/cors.ts";
import { verifyRegistrationSignature } from "../_shared/registration-access.ts";

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

  const url = new URL(req.url);
  const id = url.searchParams.get("registration_id") || "";
  const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!UUID_RE.test(id)) return json({ error: "Invalid registration_id" }, 400);

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  );

  const { data, error } = await supabase
    .from("registrations")
    .select("id, email, created_at, payment_status, paid_at")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("get-payment-status error", error.message);
    return json({ error: "Lookup failed" }, 500);
  }

  // Caller must hold the server-signed return link; a typed email is not proof.
  if (!data || !(await verifyRegistrationSignature(data.id, url.searchParams.get("sig")))) {
    return json({ payment_status: null, paid_at: null });
  }

  return json({ payment_status: data.payment_status ?? null, paid_at: data.paid_at ?? null });
});
