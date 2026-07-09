import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { buildCorsHeaders } from "../_shared/cors.ts";
import {
  groupFullCourseUnitAmount,
  groupMonthlyUnitAmount,
  groupMonthsFor,
  kidsGroupFullCourseUnitAmount,
  kidsGroupMonthlyUnitAmount,
  KIDS_GROUP_MONTHS,
  privateLessonUnitAmount,
} from "../_shared/prices.ts";

const COURSE_TYPES = ["group", "private", "kids"] as const;

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
    // Group + kids reaching this function are the PAY-IN-FULL path (monthly
    // subscriptions live in create-subscription): the whole course billed at
    // once with a 10% upfront discount. Private: 15% off at 20+ lessons.
    const groupMonths = courseType === "group"
      ? groupMonthsFor(regRow.level)
      : courseType === "kids"
        ? KIDS_GROUP_MONTHS
        : 1;
    const discountApplied =
      (courseType === "private" && quantity >= 20) ||
      courseType === "group" ||
      courseType === "kids";

    const stripePublishableKey = Deno.env.get("STRIPE_PUBLISHABLE_KEY") || "";
    if (!stripePublishableKey.startsWith("pk_")) {
      throw new Error("Stripe publishable key is invalid. Use a key that starts with pk_test_ or pk_live_.");
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Unit amount comes from the server-side price table, keyed by the
    // level + format persisted on the registration row — the old fixed
    // Stripe price ID charged every group level the A1 rate. Kids is a
    // flat monthly (no level, physical-only).
    const unitAmount =
      courseType === "group"
        ? groupMonthlyUnitAmount(regRow.level, regRow.format)
        : courseType === "kids"
          ? kidsGroupMonthlyUnitAmount()
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

    // Group / kids pay-in-full: whole course (monthly × months) −10%.
    // Private: unit × lesson quantity, −15% at 20+. All from the server price table.
    const finalAmount =
      courseType === "group"
        ? groupFullCourseUnitAmount(regRow.level, regRow.format)
        : courseType === "kids"
          ? kidsGroupFullCourseUnitAmount()
          : Math.round(unitAmount * quantity * (quantity >= 20 ? 0.85 : 1));

    // If a PaymentIntent already exists for this registration, reuse it when
    // the amount still matches. Otherwise (e.g. price was updated after the
    // stale intent was created, or the customer changed quantity) cancel it
    // and create a fresh one with a distinct idempotency key so Stripe
    // doesn't reject the create with an idempotency-mismatch error.
    let idempotencySuffix = "";
    if (regRow.stripe_session_id && regRow.stripe_session_id.startsWith("pi_")) {
      try {
        const existing = await stripe.paymentIntents.retrieve(regRow.stripe_session_id);
        if (
          existing &&
          existing.client_secret &&
          !["succeeded", "canceled"].includes(existing.status)
        ) {
          if (existing.amount === finalAmount && existing.currency === currency) {
            return new Response(
              JSON.stringify({
                clientSecret: existing.client_secret,
                paymentIntentId: existing.id,
                amount: existing.amount,
                unitAmount,
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
          // Amount drifted — try to update in place (cheapest option, keeps
          // the same client_secret); if the intent is past the updatable
          // state, cancel it and fall through to create a fresh one.
          try {
            const updated = await stripe.paymentIntents.update(existing.id, {
              amount: finalAmount,
              currency,
              metadata: {
                course_type: courseType,
                student_name: name || "",
                registration_id: registrationId,
                quantity: String(courseType === "group" ? groupMonths : quantity),
                level: regRow.level || "",
                format: regRow.format || "",
                discount_applied: discountApplied ? (courseType === "private" ? "15" : "10") : "0",
              },
            });
            return new Response(
              JSON.stringify({
                clientSecret: updated.client_secret,
                paymentIntentId: updated.id,
                amount: updated.amount,
                unitAmount,
                quantity,
                discountApplied,
                currency: updated.currency,
                publishableKey: stripePublishableKey,
              }),
              {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
                status: 200,
              },
            );
          } catch (updateErr) {
            console.warn("intent update failed, will cancel and recreate:", updateErr);
            try {
              await stripe.paymentIntents.cancel(existing.id);
            } catch (cancelErr) {
              console.warn("intent cancel failed, proceeding anyway:", cancelErr);
            }
            // Salt the idempotency key so the new create doesn't collide
            // with the previous one.
            idempotencySuffix = `_${Date.now()}`;
          }
        }
      } catch (retrieveErr) {
        console.warn("existing intent retrieve failed, will create new:", retrieveErr);
      }
    }

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
          quantity: String(courseType === "group" ? groupMonths : quantity),
          level: regRow.level || "",
          format: regRow.format || "",
          discount_applied: discountApplied
            ? courseType === "private"
              ? "15"
              : "10"
            : "0",
        },
      },
      { idempotencyKey: `pi_${registrationId}${idempotencySuffix}` },
    );

    // Persist the new intent id — this covers first-time create AND the
    // recreate-after-cancel path above, so a stale id doesn't linger.
    await supabaseAdmin
      .from("registrations")
      .update({
        stripe_session_id: intent.id,
        payment_status: "pending",
      })
      .eq("id", registrationId);

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