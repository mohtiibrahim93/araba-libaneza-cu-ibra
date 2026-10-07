import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { buildCorsHeaders } from "../_shared/cors.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { verifiedRegistrationOwner } from "../_shared/verified-registration-owner.ts";

function maskEmail(e: string | null): string | null {
  if (!e || !e.includes("@")) return null;
  const [user, domain] = e.split("@");
  return `${user.slice(0, 1)}***@${domain}`;
}

serve(async (req) => {
  const corsHeaders = buildCorsHeaders(req);
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const sessionId = url.searchParams.get("session_id");
    if (!sessionId) throw new Error("Missing session_id");

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["line_items"],
    });
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );
    const registrationId = session.metadata?.registration_id;
    const { data: reg } = registrationId
      ? await supabaseAdmin.from("registrations").select("email").eq("id", registrationId).maybeSingle()
      : { data: null };
    // Legacy standalone deposit sessions use the stored Stripe customer email.
    // Never fall back when a registration is referenced but cannot be found.
    const owner = registrationId ? reg : { email: session.customer_email || session.customer_details?.email };
    if (!owner || !(await verifiedRegistrationOwner(req, owner, supabaseAdmin.auth))) {
      return new Response(JSON.stringify({ error: "Sign in with your verified registration email to continue" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const payload = {
      id: session.id,
      status: session.status,
      paymentStatus: session.payment_status,
      amountTotal: session.amount_total,
      currency: session.currency,
      // Masked and minimal: the session id alone must not reveal who paid.
      customerEmail: maskEmail(
        session.customer_details?.email || session.customer_email || null,
      ),
      courseType: session.metadata?.course_type || null,
      lineItems:
        session.line_items?.data.map((li: { description: string | null; quantity: number | null; amount_total: number }) => ({
          description: li.description,
          quantity: li.quantity,
          amount: li.amount_total,
        })) ?? [],
    };

    return new Response(JSON.stringify(payload), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("get-checkout-session error:", message);
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});