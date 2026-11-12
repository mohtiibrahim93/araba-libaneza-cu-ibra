import { groupEnrolmentError } from "../_shared/group-enrolment.ts";
import {
  applyPlanChange,
  groupOwnPrice,
  planOptions,
} from "../_shared/registration-plan.ts";
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { buildCorsHeaders } from "../_shared/cors.ts";
import { verifiedRegistrationOwner } from "../_shared/verified-registration-owner.ts";
import {
  groupMonthlyUnitAmount,
  groupMonthsFor,
  kidsGroupMonthlyUnitAmount,
  KIDS_GROUP_MONTHS,
} from "../_shared/prices.ts";

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
type InvoiceLike =
  | {
      confirmation_secret?: { client_secret?: string | null } | null;
      payment_intent?: string | { client_secret?: string | null } | null;
    }
  | null
  | undefined;

function firstInvoiceClientSecret(invoice: InvoiceLike): string | undefined {
  if (!invoice || typeof invoice !== "object") return undefined;
  const cs = invoice.confirmation_secret?.client_secret;
  if (cs) return cs;
  const pi = invoice.payment_intent;
  if (pi && typeof pi === "object" && pi.client_secret)
    return pi.client_secret ?? undefined;
  return undefined;
}

serve(async (req) => {
  const corsHeaders = buildCorsHeaders(req);
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, name, registrationId, changePlan } = await req.json();

    if (!registrationId || typeof registrationId !== "string") {
      return new Response(
        JSON.stringify({ error: "registrationId is required" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        },
      );
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );
    const { data: regRow, error: regErr } = await supabaseAdmin
      .from("registrations")
      .select(
        "id, form_type, payment_status, stripe_subscription_id, email, quantity, level, cohort_id, format, lead_status, plan",
      )
      .eq("id", registrationId)
      .maybeSingle();

    if (regErr || !regRow) {
      return new Response(JSON.stringify({ error: "Registration not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!(await verifiedRegistrationOwner(req, regRow, supabaseAdmin.auth))) {
      return new Response(
        JSON.stringify({
          error: "Sign in with your verified registration email to continue",
        }),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }
    if (regRow.form_type !== "group" && regRow.form_type !== "kids") {
      return new Response(
        JSON.stringify({
          error: "Subscriptions are for group or kids courses only",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }
    const groupError = await groupEnrolmentError(supabaseAdmin, regRow);
    if (groupError)
      return new Response(JSON.stringify({ error: groupError }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    // "free": the owner gave it for free, so there is nothing to charge.
    // A trial's "free" covers the trial only: a later paid lesson is still owed.
    if (
      regRow.payment_status === "paid" ||
      (regRow.payment_status === "free" && regRow.form_type !== "trial")
    ) {
      return new Response(
        JSON.stringify({ error: "Registration already paid" }),
        {
          status: 409,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // The plan lives on the row. The buyer may switch it on /checkout
    // (changePlan, written to the row first); a pay-in-full row is charged by
    // create-payment-intent, so this function refuses it and names the plan.
    const plan = await applyPlanChange(supabaseAdmin, regRow, changePlan);
    // A group with its own monthly price is charged that price.
    const ownPrice = await groupOwnPrice(supabaseAdmin, regRow);
    const options = planOptions(regRow, ownPrice);
    if (plan !== "monthly") {
      return new Response(
        JSON.stringify({
          error: "This registration is set to pay the whole course upfront",
          code: "plan_mismatch",
          plan,
          planOptions: options,
        }),
        {
          status: 409,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const stripePublishableKey = Deno.env.get("STRIPE_PUBLISHABLE_KEY") || "";
    if (!stripePublishableKey.startsWith("pk_")) {
      throw new Error(
        "Stripe publishable key is invalid. Use a key that starts with pk_test_ or pk_live_.",
      );
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Amount + length come from the server price table keyed by the level+format
    // persisted on the row — never a client value, which could be manipulated.
    // Kids has no level, but takes the same +40% in person as everything else.
    const isKids = regRow.form_type === "kids";
    const monthlyUnitAmount = isKids
      ? kidsGroupMonthlyUnitAmount(regRow.format)
      : groupMonthlyUnitAmount(regRow.level, regRow.format, ownPrice);
    const monthsTotal = isKids
      ? KIDS_GROUP_MONTHS
      : groupMonthsFor(regRow.level);
    const quantity = Math.max(
      1,
      Math.min(100, Number.parseInt(String(regRow.quantity ?? 1), 10) || 1),
    );
    // No discount on the monthly plan. The only group discount is for paying
    // the whole course upfront, which goes through create-payment-intent.
    const discountApplied = false;
    const monthlyUnit = monthlyUnitAmount;
    const currency = "ron";

    const groupProductId = Deno.env.get("STRIPE_GROUP_PRODUCT_ID") || "";
    if (!groupProductId.startsWith("prod_")) {
      throw new Error(
        "STRIPE_GROUP_PRODUCT_ID is not configured (expected a prod_… id).",
      );
    }

    const jsonOk = (body: Record<string, unknown>) =>
      new Response(JSON.stringify(body), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });

    // Reuse an in-flight subscription for this registration (double-click / retry)
    // when it still has a confirmable first invoice, instead of stacking duplicates.
    if (
      regRow.stripe_subscription_id &&
      regRow.stripe_subscription_id.startsWith("sub_")
    ) {
      try {
        const existing = await stripe.subscriptions.retrieve(
          regRow.stripe_subscription_id,
          {
            expand: ["latest_invoice.confirmation_secret"],
          },
        );
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
            plan,
            planOptions: options,
          });
        }
      } catch (retrieveErr) {
        console.warn(
          "existing subscription retrieve failed, will create new:",
          retrieveErr,
        );
      }
    }

    // The Stripe customer is the registration's own, verified email (audit
    // P1: it was matched by whatever email the browser sent, so one person's
    // payment could land on another person's Stripe customer).
    const customerEmail: string = regRow.email || "";
    // Find or create the customer (best-effort).
    let customerId: string | undefined;
    if (customerEmail) {
      const customers = await stripe.customers.list({
        email: customerEmail,
        limit: 1,
      });
      customerId =
        customers.data[0]?.id ??
        (
          await stripe.customers.create({
            email: customerEmail,
            name: name || undefined,
          })
        ).id;
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
        description: isKids
          ? "Grupa de copii Araba Libaneză — abonament lunar"
          : "Curs de grup Araba Libaneză — abonament lunar",
        payment_behavior: "default_incomplete",
        payment_settings: { save_default_payment_method: "on_subscription" },
        expand: ["latest_invoice.confirmation_secret"],
        metadata: {
          registration_id: registrationId,
          course_type: isKids ? "kids" : "group",
          student_name: name || "",
          level: regRow.level || "",
          format: regRow.format || "",
          months_total: String(monthsTotal),
          quantity: String(quantity),
        },
      },
      // One key per attempt: a subscription that ended unpaid (cancelled when
      // the group seat hold ran out, or expired by Stripe) is followed by a new
      // one, which the fixed key `sub_<id>` would refuse.
      {
        idempotencyKey: `sub_${registrationId}${
          regRow.stripe_subscription_id
            ? `_after_${regRow.stripe_subscription_id}`
            : ""
        }`,
      },
    );

    const clientSecret = firstInvoiceClientSecret(
      subscription.latest_invoice as unknown as InvoiceLike,
    );
    if (!clientSecret) {
      throw new Error(
        "Subscription created without a confirmable first invoice",
      );
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
      plan,
      planOptions: options,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("create-subscription error:", message);
    // The visitor gets a plain message; Stripe's and the server's own text
    // stays in the log (audit P1: raw error text was shown on the page).
    return new Response(JSON.stringify({ error: PUBLIC_PAYMENT_ERROR }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

const PUBLIC_PAYMENT_ERROR =
  "Plata nu a putut fi pregătită. Încearcă din nou peste un minut sau scrie-ne pe WhatsApp. / The payment could not be prepared. Please try again in a minute or message us on WhatsApp.";
