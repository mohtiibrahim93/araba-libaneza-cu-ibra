import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { buildCorsHeaders } from "../_shared/cors.ts";
import { groupMonthlyUnitAmount, groupMonthsFor } from "../_shared/prices.ts";

// Group courses are billed as a fixed-length monthly subscription: one charge
// per "month" (8 lessons), repeated groupMonthsFor(level) times, then Stripe
// auto-cancels via cancel_at. Private lessons stay one-time (create-payment-intent).

/** Add whole calendar months to a unix-seconds timestamp. */
function addMonthsUnix(fromSeconds: number, months: number): number {
  const d = new Date(fromSeconds * 1000);
  d.setMonth(d.getMonth() + months);
  return Math.floor(d.getTime() / 1000);
}

// The client secret needed to confirm a subscription's first invoice moved
// across Stripe API versions: on 2025-08-27.basil `invoice.payment_intent` is
// gone and it lives on `invoice.confirmation_secret`. Read the new shape first,
// fall back to the legacy PaymentIntent so this keeps working either way.
type InvoiceLike = {
  confirmation_secret?: { client_secret?: string | null } | null;
  payment_intent?: string | { client_secret?: string | null } | null;
} | null | undefined;

function firstInvoiceClientSecret(invoice: InvoiceLike): string | undefined {
  if (!invoice || typeof invoice !== "object") return undefined;
  const cs = invoice.confirmation_secret?.client_secret;
  if (cs) return cs;
  const pi = invoice.payment_intent;
  if (pi && typeof pi === "object" && pi.client_secret) return pi.client_secret ?? undefined;
  return undefined;
}

serve(async (req) => {
  const corsHeaders = buildCorsHeaders(req);
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, name, registrationId } = await req.json();

    if (!registrationId || typeof registrationId !== "string") {
      throw new Error("registrationId is required");
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );
    const { data: regRow, error: regErr } = await supabaseAdmin
      .from("registrations")
      .select(
        "id, form_type, payment_status, stripe_subscription_id, email, quantity, level, format",
      )
      .eq("id", registrationId)
      .maybeSingle();

    if (regErr || !regRow) {
      return new Response(JSON.stringify({ error: "Registration not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (regRow.form_type !== "group") {
      return new Response(JSON.stringify({ error: "Subscriptions are for group courses only" }), {
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

    const stripePublishableKey = Deno.env.get("STRIPE_PUBLISHABLE_KEY") || "";
    if (!stripePublishableKey.startsWith("pk_")) {
      throw new Error("Stripe publishable key is invalid. Use a key that starts with pk_test_ or pk_live_.");
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Amount + length come from the server price table keyed by the level+format
    // persisted on the row — never a client value, which could be manipulated.
    const monthlyUnitAmount = groupMonthlyUnitAmount(regRow.level, regRow.format);
    const monthsTotal = groupMonthsFor(regRow.level);
    const quantity = Math.max(1, Math.min(100, Number.parseInt(String(regRow.quantity ?? 1), 10) || 1));
    // Same 3+ volume discount the one-time flow applied, folded into the monthly
    // unit amount so it repeats every cycle.
    const discountApplied = quantity >= 3;
    const monthlyUnit = discountApplied ? Math.round(monthlyUnitAmount * 0.9) : monthlyUnitAmount;
    const currency = "ron";

    const groupProductId = Deno.env.get("STRIPE_GROUP_PRODUCT_ID") || "";
    if (!groupProductId.startsWith("prod_")) {
      throw new Error("STRIPE_GROUP_PRODUCT_ID is not configured (expected a prod_… id).");
    }

    const jsonOk = (body: Record<string, unknown>) =>
      new Response(JSON.stringify(body), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });

    // Reuse an in-flight subscription for this registration (double-click / retry)
    // when it still has a confirmable first invoice, instead of stacking duplicates.
    if (regRow.stripe_subscription_id && regRow.stripe_subscription_id.startsWith("sub_")) {
      try {
        const existing = await stripe.subscriptions.retrieve(regRow.stripe_subscription_id, {
          expand: ["latest_invoice.confirmation_secret"],
        });
        const clientSecret = firstInvoiceClientSecret(
          existing.latest_invoice as unknown as InvoiceLike,
        );
        if (existing.status === "incomplete" && clientSecret) {
          return jsonOk({
            clientSecret,
            subscriptionId: existing.id,
            amount: monthlyUnit * quantity,
            monthlyAmount: monthlyUnit,
            monthsTotal,
            quantity,
            discountApplied,
            currency,
            publishableKey: stripePublishableKey,
          });
        }
      } catch (retrieveErr) {
        console.warn("existing subscription retrieve failed, will create new:", retrieveErr);
      }
    }

    // Find or create the customer (best-effort).
    let customerId: string | undefined;
    if (email) {
      const customers = await stripe.customers.list({ email, limit: 1 });
      customerId = customers.data[0]?.id ?? (await stripe.customers.create({ email, name: name || undefined })).id;
    }

    const startSeconds = Math.floor(Date.now() / 1000);
    const cancelAt = addMonthsUnix(startSeconds, monthsTotal);

    const subscription = await stripe.subscriptions.create(
      {
        customer: customerId,
        items: [
          {
            quantity,
            price_data: {
              currency,
              product: groupProductId,
              unit_amount: monthlyUnit,
              recurring: { interval: "month" },
            },
          },
        ],
        cancel_at: cancelAt,
        // Shows on the invoice + Stripe receipt email so the customer sees the
        // school, not a bare card charge. Account-level branding (business name,
        // statement descriptor, logo) is configured in the Stripe Dashboard.
        description: "Curs de grup Araba Libaneză — abonament lunar",
        payment_behavior: "default_incomplete",
        payment_settings: { save_default_payment_method: "on_subscription" },
        expand: ["latest_invoice.confirmation_secret"],
        metadata: {
          registration_id: registrationId,
          course_type: "group",
          student_name: name || "",
          level: regRow.level || "",
          format: regRow.format || "",
          months_total: String(monthsTotal),
          quantity: String(quantity),
        },
      },
      { idempotencyKey: `sub_${registrationId}` },
    );

    const clientSecret = firstInvoiceClientSecret(
      subscription.latest_invoice as unknown as InvoiceLike,
    );
    if (!clientSecret) {
      throw new Error("Subscription created without a confirmable first invoice");
    }

    // Persist the subscription id + length. /payment-status polls the DB (set by
    // the invoice.paid webhook, matched on stripe_subscription_id), so no PI
    // mirror on stripe_session_id is needed for the subscription flow.
    await supabaseAdmin
      .from("registrations")
      .update({
        stripe_subscription_id: subscription.id,
        months_total: monthsTotal,
        payment_status: "pending",
      })
      .eq("id", registrationId);

    return jsonOk({
      clientSecret,
      subscriptionId: subscription.id,
      amount: monthlyUnit * quantity,
      monthlyAmount: monthlyUnit,
      monthsTotal,
      quantity,
      discountApplied,
      currency,
      publishableKey: stripePublishableKey,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("create-subscription error:", message);
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
