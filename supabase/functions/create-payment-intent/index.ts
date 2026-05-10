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
    const { courseType, email, name, registrationId, quantity: rawQuantity } = await req.json();

    if (!courseType || !PRICES[courseType]) {
      throw new Error("Invalid course type");
    }
    if (!registrationId || typeof registrationId !== "string") {
      throw new Error("registrationId is required");
    }

    // Validate the registration exists and is not already paid / in flight.
    // This prevents anonymous callers from creating Stripe intents for
    // unrelated registrations or overwriting their payment metadata.
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );
    const { data: regRow, error: regErr } = await supabaseAdmin
      .from("registrations")
      .select("id, form_type, payment_status, stripe_session_id, email")
      .eq("id", registrationId)
      .maybeSingle();

    if (regErr || !regRow) {
      return new Response(JSON.stringify({ error: "Registration not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (regRow.form_type !== courseType) {
      return new Response(JSON.stringify({ error: "Course type mismatch" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (regRow.payment_status === "paid") {
      return new Response(JSON.stringify({ error: "Registration already paid" }), {
        status: 409,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const quantity = Math.max(1, Math.min(100, Number.parseInt(String(rawQuantity ?? 1), 10) || 1));
    const discountApplied =
      (courseType === "private" && quantity >= 20) ||
      (courseType === "group" && quantity >= 3);

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

    const baseAmount = price.unit_amount * quantity;
    const discountRate =
      courseType === "private" && quantity >= 20
        ? 0.85
        : courseType === "group" && quantity >= 3
          ? 0.9
          : 1;
    const finalAmount = Math.round(baseAmount * discountRate);

    const intent = await stripe.paymentIntents.create({
      amount: finalAmount,
      currency: price.currency,
      customer: customerId,
      receipt_email: email || undefined,
      automatic_payment_methods: { enabled: true },
      metadata: {
        course_type: courseType,
        student_name: name || "",
        registration_id: registrationId || "",
        quantity: String(quantity),
        discount_applied: discountApplied
          ? courseType === "private"
            ? "15"
            : "10"
          : "0",
      },
    });

    // Only set the session id if there isn't already one — never overwrite.
    if (!regRow.stripe_session_id) {
      await supabaseAdmin
        .from("registrations")
        .update({
          stripe_session_id: intent.id,
          payment_status: "pending",
        })
        .eq("id", registrationId)
        .is("stripe_session_id", null);
    }

    return new Response(
      JSON.stringify({
        clientSecret: intent.client_secret,
        paymentIntentId: intent.id,
        amount: finalAmount,
        unitAmount: price.unit_amount,
        quantity,
        discountApplied,
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