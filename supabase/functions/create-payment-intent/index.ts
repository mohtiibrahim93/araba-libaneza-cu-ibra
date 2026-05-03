import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
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

    if (!courseType || !PRICES[courseType]) {
      throw new Error("Invalid course type");
    }

    const stripePublishableKey = Deno.env.get("STRIPE_PUBLISHABLE_KEY") || "";
    if (!stripePublishableKey.startsWith("pk_")) {
      throw new Error("Stripe publishable key is invalid. Use a key that starts with pk_test_ or pk_live_.");
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Look up the price to get amount + currency
    const price = await stripe.prices.retrieve(PRICES[courseType]);
    if (!price.unit_amount || !price.currency) {
      throw new Error("Price misconfigured");
    }

    // Find or create customer (best-effort)
    let customerId: string | undefined;
    if (email) {
      const customers = await stripe.customers.list({ email, limit: 1 });
      if (customers.data.length > 0) {
        customerId = customers.data[0].id;
      } else {
        const customer = await stripe.customers.create({ email, name: name || undefined });
        customerId = customer.id;
      }
    }

    const intent = await stripe.paymentIntents.create({
      amount: price.unit_amount,
      currency: price.currency,
      customer: customerId,
      receipt_email: email || undefined,
      automatic_payment_methods: { enabled: true },
      metadata: {
        course_type: courseType,
        student_name: name || "",
        registration_id: registrationId || "",
      },
    });

    if (registrationId) {
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      );
      await supabase
        .from("registrations")
        .update({
          stripe_session_id: intent.id,
          payment_status: "pending",
        })
        .eq("id", registrationId);
    }

    return new Response(
      JSON.stringify({
        clientSecret: intent.client_secret,
        paymentIntentId: intent.id,
        amount: price.unit_amount,
        currency: price.currency,
        publishableKey: stripePublishableKey,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("create-payment-intent error:", message);
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});