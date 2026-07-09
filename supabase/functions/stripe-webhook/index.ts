import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { buildCorsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  // Stripe calls this server-to-server (no browser Origin), so CORS is not
  // the real protection here — the Stripe signature check below is.
  const corsHeaders = buildCorsHeaders(req);
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }

  const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
    apiVersion: "2025-08-27.basil",
  });

  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET") || "";
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    console.error("Missing stripe-signature header");
    return new Response(JSON.stringify({ error: "Missing signature" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(rawBody, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid signature";
    console.error("Webhook signature verification failed:", message);
    return new Response(JSON.stringify({ error: message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  );

  try {
    switch (event.type) {
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded": {
        const session = event.data.object as Stripe.Checkout.Session;
        const registrationId = session.metadata?.registration_id;
        const sessionId = session.id;
        const paid = session.payment_status === "paid";

        if (!paid) {
          console.log(`Session ${sessionId} not paid yet (status=${session.payment_status}), skipping`);
          break;
        }

        // Match by registration_id from metadata first, fallback to session_id
        const matchColumn = registrationId ? "id" : "stripe_session_id";
        const matchValue = registrationId || sessionId;

        const { data: updated, error: updateError } = await supabase
          .from("registrations")
          .update({
            payment_status: "paid",
            paid_at: new Date().toISOString(),
            stripe_session_id: sessionId,
          })
          .eq(matchColumn, matchValue)
          .select("id, email, name, form_type")
          .maybeSingle();

        if (updateError) {
          console.error("Failed to mark registration as paid:", updateError);
          throw updateError;
        }

        if (!updated) {
          console.warn(`No registration found for ${matchColumn}=${matchValue}`);
        } else {
          console.log(`Registration ${updated.id} marked as paid`);
        }
        break;
      }

      case "checkout.session.async_payment_failed":
      case "checkout.session.expired": {
        const session = event.data.object as Stripe.Checkout.Session;
        const newStatus = event.type === "checkout.session.expired" ? "expired" : "failed";

        const { error: updateError } = await supabase
          .from("registrations")
          .update({ payment_status: newStatus })
          .eq("stripe_session_id", session.id);

        if (updateError) {
          console.error(`Failed to mark registration as ${newStatus}:`, updateError);
        }
        break;
      }

      case "payment_intent.succeeded": {
        const intent = event.data.object as Stripe.PaymentIntent;
        // Subscription-invoice PaymentIntents are handled by invoice.paid (which
        // also advances months_paid); skip them here to avoid double-processing.
        if (intent.invoice) {
          console.log(`PI ${intent.id} belongs to invoice ${intent.invoice}, handled via invoice.paid`);
          break;
        }
        const registrationId = intent.metadata?.registration_id;
        const matchColumn = registrationId ? "id" : "stripe_session_id";
        const matchValue = registrationId || intent.id;

        const { data: updated, error: updateError } = await supabase
          .from("registrations")
          .update({
            payment_status: "paid",
            paid_at: new Date().toISOString(),
            stripe_session_id: intent.id,
          })
          .eq(matchColumn, matchValue)
          .select("id")
          .maybeSingle();

        if (updateError) {
          console.error("Failed to mark registration as paid (PI):", updateError);
          throw updateError;
        }
        if (!updated) {
          console.warn(`No registration found for PI ${matchColumn}=${matchValue}`);
        }
        break;
      }

      case "payment_intent.payment_failed": {
        const intent = event.data.object as Stripe.PaymentIntent;
        const registrationId = intent.metadata?.registration_id;
        const matchColumn = registrationId ? "id" : "stripe_session_id";
        const matchValue = registrationId || intent.id;
        await supabase
          .from("registrations")
          .update({ payment_status: "failed" })
          .eq(matchColumn, matchValue);
        break;
      }

      case "invoice.paid": {
        // Each paid monthly invoice for a group subscription: mark the
        // registration paid and set months_paid to the count of paid invoices
        // (set, not increment, so redelivery of this event stays idempotent).
        const invoice = event.data.object as Stripe.Invoice;
        const subId = invoice.subscription as string | null;
        if (!subId) break;

        let monthsPaid = 1;
        try {
          const paidInvoices = await stripe.invoices.list({
            subscription: subId,
            status: "paid",
            limit: 100,
          });
          monthsPaid = Math.max(1, paidInvoices.data.length);
        } catch (listErr) {
          console.warn("could not count paid invoices, defaulting months_paid:", listErr);
        }

        const { error: updateError } = await supabase
          .from("registrations")
          .update({
            payment_status: "paid",
            paid_at: new Date().toISOString(),
            months_paid: monthsPaid,
            subscription_status: "active",
          })
          .eq("stripe_subscription_id", subId);
        if (updateError) {
          console.error("Failed to record invoice.paid:", updateError);
          throw updateError;
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const subId = invoice.subscription as string | null;
        if (!subId) break;
        await supabase
          .from("registrations")
          .update({ payment_status: "past_due" })
          .eq("stripe_subscription_id", subId);
        break;
      }

      case "customer.subscription.deleted": {
        // Fires when the subscription ends — either naturally at cancel_at after
        // the final month, or from an admin cancellation.
        const subscription = event.data.object as Stripe.Subscription;
        await supabase
          .from("registrations")
          .update({ subscription_status: "canceled" })
          .eq("stripe_subscription_id", subscription.id);
        break;
      }

      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        // Best effort: find by payment_intent → session
        if (charge.payment_intent) {
          const sessions = await stripe.checkout.sessions.list({
            payment_intent: charge.payment_intent as string,
            limit: 1,
          });
          if (sessions.data.length > 0) {
            await supabase
              .from("registrations")
              .update({ payment_status: "refunded" })
              .eq("stripe_session_id", sessions.data[0].id);
          }
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Webhook processing error";
    console.error("Webhook handler error:", message);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
