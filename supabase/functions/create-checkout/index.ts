import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { buildCorsHeaders } from "../_shared/cors.ts";
import { groupMonthlyUnitAmount, privateLessonUnitAmount } from "../_shared/prices.ts";

const COURSE_TYPES = ["group", "private"];

serve(async (req) => {
  const corsHeaders = buildCorsHeaders(req);
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { courseType, email, name, registrationId } = await req.json();

    if (!courseType || (!COURSE_TYPES.includes(courseType) && courseType !== "kids_deposit")) {
      throw new Error("Invalid course type");
    }
    // Group/private amounts are derived from the registration row (level,
    // format, quantity persisted at submission time), so a registration is
    // mandatory for those flows.
    if (courseType !== "kids_deposit" && !registrationId) {
      throw new Error("registrationId is required");
    }

    // Validate registrationId format & state BEFORE talking to Stripe so an
    // unauthenticated caller can't disrupt an existing paid registration.
    let existingReg: {
      payment_status: string | null;
      stripe_session_id: string | null;
      form_type: string | null;
      level: string | null;
      format: string | null;
      quantity: number | null;
    } | null = null;
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
        .select("payment_status, stripe_session_id, form_type, level, format, quantity")
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

    // Group/private amounts come from the server-side price table keyed by
    // the level + format on the registration row — the old fixed Stripe
    // price ID charged every group level the A1 rate. Same discount rules
    // as create-payment-intent (-10% at 3+ months, -15% at 20+ lessons).
    let lineItems;
    if (courseType === "kids_deposit") {
      lineItems = [{
        price_data: {
          currency: "ron",
          product_data: {
            name: "Avans loc grupa Copii — Arabă Libaneză",
            description: "Avans rambursabil 25% (125 LEI) pentru rezervarea locului în grupa de copii.",
          },
          unit_amount: 12500,
        },
        quantity: 1,
      }];
    } else {
      const quantity = Math.max(1, Math.min(100, Number.parseInt(String(existingReg?.quantity ?? 1), 10) || 1));
      const unitAmount = courseType === "group"
        ? groupMonthlyUnitAmount(existingReg?.level, existingReg?.format)
        : privateLessonUnitAmount();
      const discountRate =
        courseType === "private" && quantity >= 20
          ? 0.85
          : courseType === "group" && quantity >= 3
            ? 0.9
            : 1;
      const productName = courseType === "group"
        ? `Curs de grup Arabă Libaneză${existingReg?.level ? ` — nivel ${existingReg.level}` : ""}`
        : "Lecții private Arabă Libaneză";
      lineItems = [{
        price_data: {
          currency: "ron",
          product_data: { name: productName },
          unit_amount: Math.round(unitAmount * discountRate),
        },
        quantity,
      }];
    }

    const session = await stripe.checkout.sessions.create(
      {
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
      },
      // Ties repeated calls for the same registration to the same session
      // instead of creating orphaned duplicate checkout sessions.
      registrationId ? { idempotencyKey: `cs_${registrationId}_${courseType}` } : undefined,
    );

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
