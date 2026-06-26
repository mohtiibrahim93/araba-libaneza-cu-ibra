import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const PRICES: Record<string, string> = {
  group: "price_1TFLYjInUEhMEuJrameFTK8V",
  private: "price_1TFLZ6InUEhMEuJrX5wg1e7q",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { courseType, email, name, registrationId } = await req.json();

    if (!courseType || (!PRICES[courseType] && courseType !== "kids_deposit")) {
      throw new Error("Invalid course type");
    }

    // Validate registrationId format & state BEFORE talking to Stripe so an
    // unauthenticated caller can't disrupt an existing paid registration.
    let existingReg: { payment_status: string | null; stripe_session_id: string | null; form_type: string | null } | null = null;
    if (registrationId) {
      if (typeof registrationId !== "string" || !/^[0-9a-f-]{36}$/i.test(registrationId)) {
        return new Response(JSON.stringify({ error: "Invalid registrationId" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        });
      }
      const adminClient = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      );
      const { data: regRow } = await adminClient
        .from("registrations")
        .select("payment_status, stripe_session_id, form_type")
        .eq("id", registrationId)
        .maybeSingle();
      if (!regRow) {
        return new Response(JSON.stringify({ error: "Registration not found" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 404,
        });
      }
      if (regRow.payment_status === "paid") {
        return new Response(JSON.stringify({ error: "Already paid" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 409,
        });
      }
      if (regRow.stripe_session_id) {
        return new Response(JSON.stringify({ error: "Checkout already initiated" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 409,
        });
      }
      const expectedFormType = courseType === "kids_deposit" ? "kids" : courseType;
      if (regRow.form_type && regRow.form_type !== expectedFormType) {
        return new Response(JSON.stringify({ error: "Course type mismatch" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        });
      }
      existingReg = regRow;
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Check if customer exists
    let customerId: string | undefined;
    if (email) {
      const customers = await stripe.customers.list({ email, limit: 1 });
      if (customers.data.length > 0) {
        customerId = customers.data[0].id;
      }
    }

    const lineItems = courseType === "kids_deposit"
      ? [{
          price_data: {
            currency: "ron",
            product_data: {
              name: "Avans loc grupa Copii — Arabă Libaneză",
              description: "Avans rambursabil 25% (125 LEI) pentru rezervarea locului în grupa de copii.",
            },
            unit_amount: 12500,
          },
          quantity: 1,
        }]
      : [{ price: PRICES[courseType], quantity: 1 }];

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : email || undefined,
      line_items: lineItems,
      mode: "payment",
      success_url: `${req.headers.get("origin")}/thank-you?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/?payment=canceled`,
      metadata: {
        course_type: courseType,
        student_name: name || "",
        registration_id: registrationId || "",
      },
    });

    // Persist Stripe session id on the registration so the webhook can match it
    if (registrationId && existingReg) {
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      );
      const { error: updateError } = await supabase
        .from("registrations")
        .update({
          stripe_session_id: session.id,
          payment_status: "pending",
        })
        .eq("id", registrationId)
        .is("stripe_session_id", null)
        .neq("payment_status", "paid");
      if (updateError) {
        console.error("Failed to attach stripe_session_id to registration:", updateError);
      }
    }

    return new Response(JSON.stringify({ url: session.url, sessionId: session.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Checkout error:", message);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
