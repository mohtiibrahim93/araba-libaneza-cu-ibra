// Hosted Stripe Checkout fallback. When js.stripe.com is blocked in the
// visitor's browser (Brave Shields, adblockers, DNS filters, corporate Wi-Fi,
// etc.), the embedded Elements flow on /checkout can't load. This function
// creates a Stripe-hosted Checkout Session and returns its `url`; the client
// redirects to checkout.stripe.com, which is a first-party navigation and
// bypasses tracker/script blockers.
//
// Pricing is derived server-side from the registration row (level, format,
// quantity) — never from client input — so the amount charged matches the
// embedded flow exactly.

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { buildCorsHeaders, resolveReturnOrigin } from "../_shared/cors.ts";
import {
  groupFullCourseUnitAmount,
  groupMonthlyUnitAmount,
  groupMonthsFor,
  kidsGroupFullCourseUnitAmount,
  kidsGroupMonthlyUnitAmount,
  KIDS_GROUP_MONTHS,
  privateLessonUnitAmount,
} from "../_shared/prices.ts";

serve(async (req) => {
  const corsHeaders = buildCorsHeaders(req);
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { registrationId, plan } = await req.json();
    if (!registrationId || typeof registrationId !== "string") {
      throw new Error("registrationId is required");
    }
    if (!/^[0-9a-f-]{36}$/i.test(registrationId)) {
      return new Response(JSON.stringify({ error: "Invalid registrationId" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );
    const { data: reg } = await supabaseAdmin
      .from("registrations")
      .select(
        "id, form_type, payment_status, email, name, quantity, level, format, stripe_session_id",
      )
      .eq("id", registrationId)
      .maybeSingle();

    if (!reg) {
      return new Response(JSON.stringify({ error: "Registration not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (reg.payment_status === "paid") {
      return new Response(JSON.stringify({ error: "Registration already paid" }), {
        status: 409,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Allowlisted origins only — a forged Origin header must not be able to
    // bounce the customer to an arbitrary site after paying.
    const origin = resolveReturnOrigin(req);
    // NB: /payment-status reads `registration_id` (snake_case) — it polls the
    // DB with it; the camelCase param would leave the page "pending" forever.
    const successUrl = `${origin}/payment-status?registration_id=${encodeURIComponent(registrationId)}&courseType=${encodeURIComponent(reg.form_type ?? "group")}&session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${origin}/checkout?courseType=${encodeURIComponent(reg.form_type ?? "group")}&registrationId=${encodeURIComponent(registrationId)}&email=${encodeURIComponent(reg.email ?? "")}&name=${encodeURIComponent(reg.name ?? "")}&fallback=1`;

    // Best-effort reuse: if we already created a session and it's still open,
    // return its URL instead of stacking duplicates.
    if (reg.stripe_session_id && reg.stripe_session_id.startsWith("cs_")) {
      try {
        const prior = await stripe.checkout.sessions.retrieve(
          reg.stripe_session_id,
        );
        if (prior.status === "open" && prior.url) {
          return new Response(JSON.stringify({ url: prior.url, sessionId: prior.id }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          });
        }
      } catch (_e) {
        // fall through to create a new one
      }
    }

    const courseType = reg.form_type as "group" | "private" | "kids";
    const isSubscription =
      (courseType === "group" || courseType === "kids") && plan !== "full";
    const quantity = Math.max(
      1,
      Math.min(100, Number.parseInt(String(reg.quantity ?? 1), 10) || 1),
    );
    const currency = "ron";

    // Find or create customer (best effort, keeps receipts consistent).
    let customerId: string | undefined;
    if (reg.email) {
      const customers = await stripe.customers.list({ email: reg.email, limit: 1 });
      customerId =
        customers.data[0]?.id ??
        (await stripe.customers.create({
          email: reg.email,
          name: reg.name || undefined,
        })).id;
    }

    let session: Stripe.Checkout.Session;

    if (isSubscription) {
      const monthly =
        courseType === "kids"
          ? kidsGroupMonthlyUnitAmount()
          : groupMonthlyUnitAmount(reg.level, reg.format);
      const discountApplied = courseType !== "kids" && quantity >= 3;
      const unitAmount = discountApplied ? Math.round(monthly * 0.9) : monthly;
      const monthsTotal =
        courseType === "kids" ? KIDS_GROUP_MONTHS : groupMonthsFor(reg.level);
      const productName =
        courseType === "kids"
          ? "Grupa de copii Arabă Libaneză — abonament lunar"
          : `Curs de grup Arabă Libaneză${reg.level ? ` — nivel ${reg.level}` : ""} — abonament lunar`;

      session = await stripe.checkout.sessions.create(
        {
          mode: "subscription",
          customer: customerId,
          customer_email: customerId ? undefined : reg.email || undefined,
          success_url: successUrl,
          cancel_url: cancelUrl,
          line_items: [
            {
              quantity,
              price_data: {
                currency,
                product_data: { name: productName },
                unit_amount: unitAmount,
                recurring: { interval: "month" },
              },
            },
          ],
          subscription_data: {
            description:
              courseType === "kids"
                ? "Grupa de copii Arabă Libaneză — abonament lunar"
                : "Curs de grup Arabă Libaneză — abonament lunar",
            metadata: {
              registration_id: registrationId,
              course_type: courseType,
              level: reg.level || "",
              format: reg.format || "",
              months_total: String(monthsTotal),
              quantity: String(quantity),
            },
          },
          metadata: {
            registration_id: registrationId,
            course_type: courseType,
            months_total: String(monthsTotal),
          },
        },
        // Hour-bucketed: a double-click reuses one session, but a retry after
        // the previous session expired (24 h) isn't pinned by Stripe's
        // idempotency layer to the dead session forever.
        { idempotencyKey: `cos_sub_${registrationId}_${Math.floor(Date.now() / 3_600_000)}` },
      );
    } else {
      const isPrivate = courseType === "private";
      const finalAmount =
        courseType === "group"
          ? groupFullCourseUnitAmount(reg.level, reg.format)
          : courseType === "kids"
            ? kidsGroupFullCourseUnitAmount()
            : Math.round(
                privateLessonUnitAmount() *
                  quantity *
                  (quantity >= 20 ? 0.85 : 1),
              );
      const productName = isPrivate
        ? "Lecții private Arabă Libaneză"
        : courseType === "kids"
          ? "Grupa de copii Arabă Libaneză — curs plătit integral"
          : `Curs de grup Arabă Libaneză${reg.level ? ` — nivel ${reg.level}` : ""} — curs plătit integral`;

      session = await stripe.checkout.sessions.create(
        {
          mode: "payment",
          customer: customerId,
          customer_email: customerId ? undefined : reg.email || undefined,
          success_url: successUrl,
          cancel_url: cancelUrl,
          line_items: [
            {
              quantity: isPrivate ? quantity : 1,
              price_data: {
                currency,
                product_data: { name: productName },
                unit_amount: isPrivate
                  ? Math.round(finalAmount / quantity)
                  : finalAmount,
              },
            },
          ],
          payment_intent_data: {
            metadata: {
              registration_id: registrationId,
              course_type: courseType,
              level: reg.level || "",
              format: reg.format || "",
              quantity: String(quantity),
            },
          },
          metadata: {
            registration_id: registrationId,
            course_type: courseType,
          },
        },
        // Hour-bucketed for the same reason as the subscription branch above.
        { idempotencyKey: `cos_pay_${registrationId}_${Math.floor(Date.now() / 3_600_000)}` },
      );
    }

    // Persist the session id so /payment-status and repeated calls can find
    // it. The webhook already marks the registration paid on
    // checkout.session.completed by matching registration_id metadata.
    await supabaseAdmin
      .from("registrations")
      .update({
        stripe_session_id: session.id,
        payment_status: "pending",
      })
      .eq("id", registrationId);

    return new Response(JSON.stringify({ url: session.url, sessionId: session.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("create-checkout-session error:", message);
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});