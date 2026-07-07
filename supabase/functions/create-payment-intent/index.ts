import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { buildCorsHeaders } from "../_shared/cors.ts";
import { groupMonthlyUnitAmount, privateLessonUnitAmount } from "../_shared/prices.ts";

const COURSE_TYPES = ["group", "private"] as const;

serve(async (req) => {
  const corsHeaders = buildCorsHeaders(req);
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { courseType, email, name, registrationId } = await req.json();

    if (!courseType || !COURSE_TYPES.includes(courseType)) {
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
      .select("id, form_type, payment_status, stripe_session_id, email, quantity, level, format")
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

    // Trust only the quantity persisted on the registration at submission
    // time (server-side, immutable post-insert) — never a client-supplied
    // value, which would let the amount charged be manipulated directly.
    const quantity = Math.max(1, Math.min(100, Number.parseInt(String(regRow.quantity ?? 1), 10) || 1));
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

    // If a PaymentIntent already exists for this registration, reuse it —
    // creating a new one with the `pi_${registrationId}` idempotency key but
    // different parameters (e.g. new customer id after list-then-create,
    // updated quantity) is rejected by Stripe with an idempotency-mismatch
    // error, which is what surfaced as "paying not working".
    if (regRow.stripe_session_id && regRow.stripe_session_id.startsWith("pi_")) {
      try {
        const existing = await stripe.paymentIntents.retrieve(regRow.stripe_session_id);
        if (
          existing &&
          existing.client_secret &&
          !["succeeded", "canceled"].includes(existing.status)
        ) {
          return new Response(
            JSON.stringify({
              clientSecret: existing.client_secret,
              paymentIntentId: existing.id,
              amount: existing.amount,
              unitAmount: Math.round(existing.amount / quantity),
              quantity,
              discountApplied,
              currency: existing.currency,
              publishableKey: stripePublishableKey,
            }),
            {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
              status: 200,
            },
          );
        }
      } catch (retrieveErr) {
        console.warn("existing intent retrieve failed, will create new:", retrieveErr);
      }
    }

    // Unit amount comes from the server-side price table, keyed by the
    // level + format persisted on the registration row — the old fixed
    // Stripe price ID charged every group level the A1 rate.
    const unitAmount =
      courseType === "group"
        ? groupMonthlyUnitAmount(regRow.level, regRow.format)
        : privateLessonUnitAmount();
    const currency = "ron";

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

    const baseAmount = unitAmount * quantity;
    const discountRate =
      courseType === "private" && quantity >= 20
        ? 0.85
        : courseType === "group" && quantity >= 3
          ? 0.9
          : 1;
    const finalAmount = Math.round(baseAmount * discountRate);

    // Idempotency key ties repeated calls (double-click, retry after a
    // network blip) for the same registration to the same Stripe intent
    // instead of creating orphaned duplicates.
    const intent = await stripe.paymentIntents.create(
      {
        amount: finalAmount,
        currency,
        customer: customerId,
        receipt_email: email || undefined,
        automatic_payment_methods: { enabled: true },
        metadata: {
          course_type: courseType,
          student_name: name || "",
          registration_id: registrationId || "",
          quantity: String(quantity),
          level: regRow.level || "",
          format: regRow.format || "",
          discount_applied: discountApplied
            ? courseType === "private"
              ? "15"
              : "10"
            : "0",
        },
      },
      { idempotencyKey: `pi_${registrationId}` },
    );

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
        unitAmount,
        quantity,
        discountApplied,
        currency,
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