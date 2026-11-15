// Pay the next month of a group course by card (owner, 14 Nov 2026).
//
// A student whose months are recorded by hand (cash, transfer, at the centre)
// could not pay a later month on the site: the sign-up counts as paid, and
// create-payment-intent / create-subscription refuse a paid sign-up. This
// function prepares ONE payment for ONE month: the lowest month not yet paid
// or granted, at the group's own price when it has one (_shared/month-payment.ts
// decides both). The Stripe webhook records it as "Card online" for that month.
//
// It never touches the sign-up's payment_status or stripe_session_id: those
// belong to the first payment and its seat hold, and a month payment that is
// started and abandoned must not make an enrolled student look unpaid.
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { buildCorsHeaders } from "../_shared/cors.ts";
import { verifiedRegistrationOwner } from "../_shared/verified-registration-owner.ts";
import type { MonthPaymentRow } from "../_shared/group-months.ts";
import {
  GROUP_MONTH_PURPOSE,
  monthPaymentCheck,
  type MonthPaymentRefusal,
} from "../_shared/month-payment.ts";

/** A Stripe payment the student can still finish. */
const OPEN_STATES = [
  "requires_payment_method",
  "requires_confirmation",
  "requires_action",
];

/** How long a payment that went through may take to show as a paid month. */
const RECORDING_WINDOW_MS = 60 * 60 * 1000;

/** Why there is nothing to pay, in both languages (the page has its own text). */
const REFUSALS: Record<MonthPaymentRefusal, string> = {
  not_group:
    "Doar cursurile de grup se plătesc lună de lună. / Only group courses are paid month by month.",
  no_group:
    "Înscrierea nu are o grupă activă. / This sign-up has no active group.",
  withdrawn:
    "Înscrierea nu mai este activă. / This sign-up is no longer active.",
  not_started:
    "Prima plată se face din pagina de plată a înscrierii. / The first payment is made on the sign-up's payment page.",
  subscription:
    "Lunile se plătesc automat de pe card, prin abonament. / The months are charged automatically to your card, by subscription.",
  all_paid: "Toate lunile sunt plătite. / Every month is paid.",
};

serve(async (req) => {
  const corsHeaders = buildCorsHeaders(req);
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  try {
    const body = await req.json().catch(() => null);
    const registrationId = body?.registrationId;
    if (
      typeof registrationId !== "string" ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        registrationId,
      )
    ) {
      return json({ error: "registrationId is required" }, 400);
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );
    const { data: reg, error: regErr } = await supabaseAdmin
      .from("registrations")
      .select(
        "id, form_type, payment_status, email, name, level, format, cohort_id, months_total, canceled_at, subscription_status",
      )
      .eq("id", registrationId)
      .maybeSingle();

    // Only the student: signed in, with the sign-up's own confirmed address.
    if (
      regErr ||
      !reg ||
      !(await verifiedRegistrationOwner(req, reg, supabaseAdmin.auth))
    ) {
      return json({ error: "Registration not found" }, 404);
    }

    // The group and the months already recorded. A read that fails stops the
    // payment: without the group there is no price to charge, and a guess
    // could charge the list price to a group that has its own.
    let cohort = null;
    if (reg.cohort_id) {
      const { data, error } = await supabaseAdmin
        .from("group_cohorts")
        .select("status, level, format, start_date, price_lei")
        .eq("id", reg.cohort_id)
        .maybeSingle();
      if (error) throw new Error("Could not read the group");
      cohort = data;
    }
    const { data: rows, error: rowsErr } = await supabaseAdmin
      .from("registration_payments")
      .select(
        "kind, method, amount_lei, paid_at, month_from, month_to, stripe_ref",
      )
      .eq("registration_id", registrationId);
    if (rowsErr) throw new Error("Could not read the recorded payments");
    const recorded = new Set(
      (rows ?? [])
        .map((r: { stripe_ref?: string | null }) => r.stripe_ref)
        .filter(Boolean),
    );

    const check = monthPaymentCheck({
      registration: reg,
      cohort,
      rows: (rows ?? []) as MonthPaymentRow[],
    });
    if (!check.ok) {
      return json({ error: REFUSALS[check.reason], code: check.reason }, 409);
    }

    const stripePublishableKey = Deno.env.get("STRIPE_PUBLISHABLE_KEY") || "";
    if (!stripePublishableKey.startsWith("pk_")) {
      throw new Error("Stripe publishable key is invalid.");
    }
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // The Stripe customer is the sign-up's own, verified email.
    const customerEmail: string = reg.email || "";
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
            name: reg.name || undefined,
          })
        ).id;
    }

    const month = String(check.month);
    const currency = "ron";
    let intent: Stripe.PaymentIntent | null = null;
    if (customerId) {
      const recent = await stripe.paymentIntents.list({
        customer: customerId,
        limit: 20,
      });
      for (const pi of recent.data) {
        if (
          pi.metadata?.purpose !== GROUP_MONTH_PURPOSE ||
          pi.metadata?.registration_id !== reg.id
        )
          continue;
        // Paid within the last hour and not recorded yet (the webhook writes
        // the month a few seconds after the payment): a second payment for
        // the same month would charge the student twice.
        if (
          pi.metadata?.month === month &&
          (pi.status === "succeeded" || pi.status === "processing") &&
          !recorded.has(pi.id) &&
          pi.created * 1000 > Date.now() - RECORDING_WINDOW_MS
        ) {
          return json(
            {
              error:
                "Plata pentru această lună a fost deja primită și se înregistrează. / The payment for this month has already been received and is being recorded.",
              code: "processing",
            },
            409,
          );
        }
        if (!OPEN_STATES.includes(pi.status)) continue;
        if (
          !intent &&
          pi.metadata?.month === month &&
          pi.amount === check.amountBani &&
          pi.currency === currency &&
          pi.client_secret
        ) {
          intent = pi;
          continue;
        }
        // An older attempt for another month or price: closed, so it cannot
        // be paid by mistake from a tab left open.
        try {
          await stripe.paymentIntents.cancel(pi.id);
        } catch (cancelErr) {
          console.warn("old month payment could not be cancelled:", cancelErr);
        }
      }
    }

    if (!intent) {
      intent = await stripe.paymentIntents.create(
        {
          amount: check.amountBani,
          currency,
          customer: customerId,
          receipt_email: customerEmail || undefined,
          automatic_payment_methods: { enabled: true },
          description: `Luna ${check.month} din ${check.total}`,
          metadata: {
            purpose: GROUP_MONTH_PURPOSE,
            course_type: "group",
            registration_id: reg.id,
            month,
            months_total: String(check.total),
            level: cohort?.level || reg.level || "",
            format: cohort?.format || reg.format || "",
          },
        },
        {
          // A double click within the same minute gets the same payment back.
          idempotencyKey: `gm_${reg.id}_${month}_${check.amountBani}_${Math.floor(Date.now() / 60000)}`,
        },
      );
    }

    return json({
      clientSecret: intent.client_secret,
      paymentIntentId: intent.id,
      amount: check.amountBani,
      currency,
      month: check.month,
      monthsTotal: check.total,
      publishableKey: stripePublishableKey,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("create-month-payment error:", message);
    return json({ error: PUBLIC_PAYMENT_ERROR }, 500);
  }
});

const PUBLIC_PAYMENT_ERROR =
  "Plata nu a putut fi pregătită. Încearcă din nou peste un minut sau scrie-ne pe WhatsApp. / The payment could not be prepared. Please try again in a minute or message us on WhatsApp.";
