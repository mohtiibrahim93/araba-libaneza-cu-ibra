import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { buildCorsHeaders } from "../_shared/cors.ts";
import { sendTemplateEmail } from "../_shared/managed-email.ts";
import { privateLessonStarts } from "../_shared/private-series.ts";

// Where the owner reads their mail. Same address notify-registration uses.
const ADMIN_RECIPIENT = "marhaba@centruldearabalibaneza.com";
/** Money that already settled; a late failure/expiry event must never overwrite it. */
const SETTLED_PAYMENT_STATES = '("paid","refunded")';

type PaidRegistration = {
  id: string;
  email: string | null;
  name: string;
  phone: string | null;
  language: string | null;
};

/**
 * Books the lesson(s) of a paid private purchase from the slot carried in the
 * Stripe metadata — a Checkout Session's (hosted) or a PaymentIntent's
 * (embedded). One implementation for both events. It cannot double-book when
 * both arrive or an event is redelivered: booking-create refuses a slot that
 * is taken and refuses more lessons than the package, and a refusal caused by
 * this registration's own existing booking is not treated as a failure.
 */
async function bookPrivateLessons(
  // deno-lint-ignore no-explicit-any
  supabase: any,
  updated: PaidRegistration,
  meta: Record<string, string>,
): Promise<void> {
  const starts = privateLessonStarts({
    booking_start_at: meta.booking_start_at,
    booking_weekly: meta.booking_weekly,
    quantity: meta.quantity,
  });
  if (starts.length === 0) return;
  const format = meta.booking_format || "online";
  const language = meta.booking_language || updated.language || "ro";
  const seriesNote =
    starts.length > 1
      ? `Serie săptămânală: ${starts.length} lecții, aceeași zi și oră.`
      : null;
  // All at once rather than one after another: a 20-lesson series booked
  // in sequence could outlast Stripe's wait for this response, and a
  // redelivered event is skipped by the log above — the late weeks
  // would silently never be booked.
  const bookOne = async (
    startAt: string,
    i: number,
  ): Promise<string | null> => {
    const res = await fetch(
      `${Deno.env.get("SUPABASE_URL")}/functions/v1/booking-create`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
        },
        body: JSON.stringify({
          registration_id: updated.id,
          event_type: meta.booking_event_type || "paid",
          start_at: startAt,
          format,
          student_name: updated.name,
          student_email: updated.email,
          student_phone: updated.phone || undefined,
          notes:
            [seriesNote, meta.booking_notes].filter(Boolean).join(" ") ||
            undefined,
          language,
          gdpr_consent: true,
          // One confirmation for the purchase, not one per week.
          quiet: i > 0,
        }),
      },
    ).catch((e) => {
      console.error(
        `Registration ${updated.id}: booking-create call failed`,
        e,
      );
      return null;
    });
    if (res && res.ok) return null;
    const detail = res
      ? `${res.status} ${await res.text().catch(() => "")}`.slice(0, 200)
      : "booking-create could not be reached";
    // A redelivered event (or the other of the two payment events) finds its
    // own booking already there; that is not a failure worth an alarm.
    if (
      res?.status === 409 &&
      (detail.includes("conflict") || detail.includes("lessons_used_up"))
    ) {
      const { data: own } = await supabase
        .from("bookings")
        .select("id")
        .eq("registration_id", updated.id)
        .eq("start_at", new Date(startAt).toISOString())
        .eq("status", "confirmed")
        .maybeSingle();
      if (own) return null;
    }
    return `${startAt} — ${detail}`;
  };
  const failed = (
    await Promise.all(starts.map((iso, i) => bookOne(iso, i)))
  ).filter((f): f is string => f !== null);
  if (failed.length > 0) {
    // Paid, told it is confirmed, and one or more lessons are not in the
    // calendar. Never throw (Stripe would redo the payment update);
    // tell the owner, with what is needed to book them by hand.
    console.error(
      `Registration ${updated.id}: ${failed.length} private lesson(s) not booked`,
    );
    await sendTemplateEmail("admin-trial-booking-failed", ADMIN_RECIPIENT, {
      templateData: {
        kind: "private",
        name: updated.name,
        email: updated.email,
        phone: updated.phone,
        startAt: failed.map((f) => f.split(" — ")[0]).join(", "),
        format,
        registrationId: updated.id,
        reason: failed.join(" | ").slice(0, 900),
      },
      idempotencyKey: `private-booking-failed-${updated.id}`,
    }).catch((e) =>
      console.error(
        `Registration ${updated.id}: could not send the failure alert`,
        e,
      ),
    );
  }
}

serve(async (req) => {
  // Stripe calls this server-to-server (no browser Origin), so CORS is not
  // the real protection here — the Stripe signature check below is.
  const corsHeaders = buildCorsHeaders(req);
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", {
      status: 405,
      headers: corsHeaders,
    });
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
    event = await stripe.webhooks.constructEventAsync(
      rawBody,
      signature,
      webhookSecret,
    );
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

  // Event log + idempotency: record every verified event once; a redelivery
  // (same evt_ id) short-circuits so double-processing can't corrupt counters.
  // Best-effort — if the log write itself fails we still process the event.
  //
  // The row is a claim, not a receipt: it is written before processing, so if
  // processing then fails the claim is released (see the catch below). Leaving
  // it in place made Stripe's retry look like a duplicate and the event was
  // dropped for good — a paid registration never marked paid.
  let claimed = false;
  try {
    const { data: logged, error: logErr } = await supabase
      .from("stripe_events")
      .upsert(
        {
          id: event.id,
          type: event.type,
          summary: {
            object: (event.data.object as { object?: string })?.object ?? null,
            object_id: (event.data.object as { id?: string })?.id ?? null,
          },
        },
        { onConflict: "id", ignoreDuplicates: true },
      )
      .select("id");
    if (!logErr && (logged ?? []).length === 0) {
      console.log(`Event ${event.id} already processed, skipping (idempotent)`);
      return new Response(JSON.stringify({ received: true, duplicate: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    claimed = !logErr;
  } catch (logCatch) {
    console.warn("stripe_events log failed, processing anyway:", logCatch);
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded": {
        const session = event.data.object as Stripe.Checkout.Session;
        const registrationId = session.metadata?.registration_id;
        const sessionId = session.id;
        const paid = session.payment_status === "paid";

        // Setup-mode sessions (free-trial card-on-file) carry no payment —
        // payment_status is "no_payment_required". Record the saved card and
        // stop; nothing here is "paid".
        if (session.mode === "setup") {
          if (registrationId) {
            const { data: trialRow } = await supabase
              .from("registrations")
              .select("id, payment_status, name, email, phone, language")
              .eq("id", registrationId)
              .maybeSingle();
            // The card's fingerprint identifies the card across Stripe
            // customers: one free trial per card, not only per email.
            let cardFingerprint: string | null = null;
            const setupIntentId =
              typeof session.setup_intent === "string"
                ? session.setup_intent
                : session.setup_intent?.id;
            if (setupIntentId) {
              try {
                const intent = await stripe.setupIntents.retrieve(
                  setupIntentId,
                  { expand: ["payment_method"] },
                );
                const method = intent.payment_method;
                cardFingerprint =
                  method && typeof method !== "string"
                    ? (method.card?.fingerprint ?? null)
                    : null;
              } catch (e) {
                console.error(
                  `Registration ${registrationId}: could not read the card fingerprint`,
                  e,
                );
              }
            }
            if (trialRow && trialRow.payment_status !== "paid") {
              await supabase
                .from("registrations")
                .update({
                  payment_status: "card_saved",
                  stripe_session_id: sessionId,
                  ...(cardFingerprint
                    ? { card_fingerprint: cardFingerprint }
                    : {}),
                })
                .eq("id", registrationId);
              console.log(
                `Registration ${registrationId}: trial card saved (setup session ${sessionId})`,
              );
            }

            // The trial slot is booked HERE, not before the redirect. The card
            // is the commitment: booking first and asking for the card after
            // meant the confirmation email went out to people who then closed
            // the tab, and five of the first six trials ever booked carried no
            // card at all.
            //
            // Doing it in the webhook rather than on the browser's return is
            // what makes it survive a closed tab — Stripe retries this event,
            // the browser gets one chance.
            const startAt = session.metadata?.booking_start_at;
            if (trialRow && startAt) {
              // booking-create is the only place a booking is made: it holds
              // the conflict checks, the Zoom link and both emails. Calling it
              // keeps one implementation rather than a second one here that
              // would drift.
              const res = await fetch(
                `${Deno.env.get("SUPABASE_URL")}/functions/v1/booking-create`,
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
                  },
                  body: JSON.stringify({
                    registration_id: registrationId,
                    event_type: session.metadata?.booking_event_type || "trial",
                    start_at: startAt,
                    format: session.metadata?.booking_format || "online",
                    student_name: trialRow.name,
                    student_email: trialRow.email,
                    student_phone: trialRow.phone || undefined,
                    notes: session.metadata?.booking_notes || undefined,
                    language:
                      session.metadata?.booking_language ||
                      trialRow.language ||
                      "ro",
                    // Consent was given on the form, before the redirect to
                    // Stripe; the booking is the same submission finishing.
                    gdpr_consent: true,
                    ...(cardFingerprint
                      ? { card_fingerprint: cardFingerprint }
                      : {}),
                  }),
                },
              ).catch((e) => {
                console.error(
                  `Registration ${registrationId}: booking-create call failed`,
                  e,
                );
                return null;
              });
              if (res && res.ok) {
                console.log(
                  `Registration ${registrationId}: trial booked for ${startAt} after card save`,
                );
              } else {
                // Never throw: Stripe would retry the whole event and the card
                // update above would run again. The card is saved either way.
                const body = res ? await res.text().catch(() => "") : "";
                const code = (() => {
                  try {
                    return JSON.parse(body)?.code;
                  } catch {
                    return undefined;
                  }
                })();
                // A refused trial is not a failure to fix by hand: say why, in
                // the owner's words, so he knows to offer a paid lesson.
                const detail =
                  code === "trial_card_used"
                    ? "Cardul a mai fost folosit pentru o probă gratuită, cu alt email. Nu s-a programat: proba se poate face doar plătit."
                    : code === "trial_used"
                      ? "Acest email și-a folosit deja proba gratuită. Nu s-a programat: proba se poate face doar plătit."
                      : res
                        ? `${res.status} ${body}`.slice(0, 300)
                        : "booking-create could not be reached";
                console.error(
                  `Registration ${registrationId}: booking-create failed — ${detail}`,
                );

                // This is the one failure that strands a person: the card is on
                // file and they have been told their spot is confirmed, but no
                // booking exists and nothing else will notice. Mail it to the
                // owner with everything needed to create it by hand, because
                // the booking that would have held them is not there to look up.
                await sendTemplateEmail(
                  "admin-trial-booking-failed",
                  ADMIN_RECIPIENT,
                  {
                    templateData: {
                      name: trialRow.name,
                      email: trialRow.email,
                      phone: trialRow.phone,
                      startAt,
                      format: session.metadata?.booking_format || "online",
                      registrationId,
                      reason: detail,
                    },
                    idempotencyKey: `trial-booking-failed-${registrationId}`,
                  },
                ).catch((e) =>
                  // A failed alert must not take the handler down with it; the
                  // log line above is still the backstop.
                  console.error(
                    `Registration ${registrationId}: could not send the failure alert`,
                    e,
                  ),
                );
              }
            }
          }
          break;
        }

        if (!paid) {
          console.log(
            `Session ${sessionId} not paid yet (status=${session.payment_status}), skipping`,
          );
          break;
        }

        // The kids seat deposit is not the course: it gets its own marker and
        // payment_status (the course's money) is left as it was, so the course
        // stays payable. Owner's decision, 27 October 2026.
        if (session.metadata?.course_type === "kids_deposit") {
          const depositMatch = registrationId
            ? { column: "id", value: registrationId }
            : { column: "deposit_session_id", value: sessionId };
          const { error: depositErr } = await supabase
            .from("registrations")
            .update({
              deposit_paid_at: new Date().toISOString(),
              deposit_amount: session.amount_total ?? null,
              deposit_session_id: sessionId,
            })
            .eq(depositMatch.column, depositMatch.value)
            .is("deposit_paid_at", null);
          if (depositErr) {
            console.error("Failed to record the kids deposit:", depositErr);
            throw depositErr;
          }
          console.log(`Kids deposit recorded for session ${sessionId}`);
          break;
        }

        // Match by registration_id from metadata first, fallback to session_id
        const matchColumn = registrationId ? "id" : "stripe_session_id";
        const matchValue = registrationId || sessionId;

        // Subscription-mode hosted-checkout fallback: persist the subscription
        // id (so invoice.paid can match it), set months_total from metadata,
        // and cap the sub at cancel_at = start + months_total months. This
        // mirrors what create-subscription does for the embedded flow.
        const subId =
          typeof session.subscription === "string"
            ? session.subscription
            : session.subscription?.id;
        let monthsTotal: number | null = null;
        let monthsPaid: number | null = null;
        if (session.mode === "subscription" && subId) {
          const rawMonths = Number.parseInt(
            String(session.metadata?.months_total ?? ""),
            10,
          );
          monthsTotal =
            Number.isFinite(rawMonths) && rawMonths > 0 ? rawMonths : null;
          if (monthsTotal) {
            try {
              // Anchor to the subscription's real start and skip if already
              // set, so webhook redelivery can't drift the end date.
              const sub = await stripe.subscriptions.retrieve(subId);
              if (!sub.cancel_at) {
                const start = sub.start_date ?? Math.floor(Date.now() / 1000);
                const d = new Date(start * 1000);
                d.setMonth(d.getMonth() + monthsTotal);
                await stripe.subscriptions.update(subId, {
                  cancel_at: Math.floor(d.getTime() / 1000),
                });
              }
            } catch (subErr) {
              console.warn("Failed to set cancel_at on subscription:", subErr);
            }
          }
          // Set months_paid here too: invoice.paid for the first invoice can
          // arrive before this event, when the row didn't yet carry the
          // subscription id, so its months_paid update matched nothing.
          monthsPaid = 1;
          try {
            const paidInvoices = await stripe.invoices.list({
              subscription: subId,
              status: "paid",
              limit: 100,
            });
            monthsPaid = Math.max(1, paidInvoices.data.length);
          } catch (listErr) {
            console.warn(
              "could not count paid invoices, defaulting months_paid:",
              listErr,
            );
          }
        }

        const { data: updated, error: updateError } = await supabase
          .from("registrations")
          .update({
            payment_status: "paid",
            paid_at: new Date().toISOString(),
            lead_status: "converted",
            stripe_session_id: sessionId,
            ...(subId
              ? { stripe_subscription_id: subId, subscription_status: "active" }
              : {}),
            ...(monthsTotal ? { months_total: monthsTotal } : {}),
            ...(monthsPaid ? { months_paid: monthsPaid } : {}),
          })
          .eq(matchColumn, matchValue)
          .select("id, email, name, phone, language, form_type")
          .maybeSingle();

        if (updateError) {
          console.error("Failed to mark registration as paid:", updateError);
          throw updateError;
        }

        if (!updated) {
          console.warn(
            `No registration found for ${matchColumn}=${matchValue}`,
          );
        } else {
          console.log(`Registration ${updated.id} marked as paid`);
        }

        // Private lessons: the day and time were picked before paying, and are
        // booked only now that the payment has cleared — the same rule as the
        // trial's card, for the same reason: a slot held for someone who left
        // on Stripe's page is a lesson nobody else could take.
        if (updated && session.metadata?.course_type === "private") {
          await bookPrivateLessons(supabase, updated, session.metadata ?? {});
        }
        break;
      }

      case "checkout.session.async_payment_failed":
      case "checkout.session.expired": {
        const session = event.data.object as Stripe.Checkout.Session;
        const newStatus =
          event.type === "checkout.session.expired" ? "expired" : "failed";

        // Never overwrite money that already settled: a late or redelivered
        // event for an old session must not turn paid/refunded into failed.
        const { error: updateError } = await supabase
          .from("registrations")
          .update({ payment_status: newStatus })
          .eq("stripe_session_id", session.id)
          .not("payment_status", "in", SETTLED_PAYMENT_STATES);

        if (updateError) {
          console.error(
            `Failed to mark registration as ${newStatus}:`,
            updateError,
          );
        }
        break;
      }

      case "payment_intent.succeeded": {
        const intent = event.data.object as Stripe.PaymentIntent;
        // The trial's no-show fee (charged from the admin) is not payment for
        // lessons: it is recorded in no_show_fee_*, never in payment_status,
        // and the student is not "converted".
        if (intent.metadata?.purpose === "trial_no_show_fee") {
          if (intent.metadata?.registration_id)
            await supabase
              .from("registrations")
              .update({
                no_show_fee_status: "paid",
                no_show_fee_intent_id: intent.id,
                no_show_fee_amount: intent.amount_received || intent.amount,
                no_show_fee_error: null,
              })
              .eq("id", intent.metadata.registration_id)
              .or("no_show_fee_status.is.null,no_show_fee_status.eq.failed");
          break;
        }
        // Subscription-invoice PaymentIntents are handled by invoice.paid (which
        // also advances months_paid); skip them here to avoid double-processing.
        if (intent.invoice) {
          console.log(
            `PI ${intent.id} belongs to invoice ${intent.invoice}, handled via invoice.paid`,
          );
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
            lead_status: "converted",
            stripe_session_id: intent.id,
          })
          .eq(matchColumn, matchValue)
          .select("id, email, name, phone, language")
          .maybeSingle();

        if (updateError) {
          console.error(
            "Failed to mark registration as paid (PI):",
            updateError,
          );
          throw updateError;
        }
        if (!updated) {
          console.warn(
            `No registration found for PI ${matchColumn}=${matchValue}`,
          );
        }

        // Embedded private payment (the day-and-time picker): the slot rides on
        // the PaymentIntent's metadata. A hosted-Checkout payment's intent
        // carries no booking_start_at, so this books nothing there — that
        // purchase is booked on checkout.session.completed instead.
        if (
          updated &&
          intent.metadata?.course_type === "private" &&
          intent.metadata?.booking_start_at
        ) {
          await bookPrivateLessons(supabase, updated, intent.metadata ?? {});
        }
        break;
      }

      case "payment_intent.payment_failed": {
        const intent = event.data.object as Stripe.PaymentIntent;
        // A declined no-show fee is already recorded by the admin action; it
        // says nothing about the student's payments for lessons.
        if (intent.metadata?.purpose === "trial_no_show_fee") break;
        const registrationId = intent.metadata?.registration_id;
        const matchColumn = registrationId ? "id" : "stripe_session_id";
        const matchValue = registrationId || intent.id;
        // Stripe does not guarantee event order: a declined first attempt can
        // arrive after the retry that succeeded. Settled money stays settled.
        await supabase
          .from("registrations")
          .update({ payment_status: "failed" })
          .eq(matchColumn, matchValue)
          .not("payment_status", "in", SETTLED_PAYMENT_STATES);
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
          console.warn(
            "could not count paid invoices, defaulting months_paid:",
            listErr,
          );
        }

        const { error: updateError } = await supabase
          .from("registrations")
          .update({
            payment_status: "paid",
            paid_at: new Date().toISOString(),
            lead_status: "converted",
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
        // Ask Stripe for the invoice as it is now: a failed attempt that was
        // later paid (or an event delivered late) must not mark a paying
        // student past due.
        try {
          const current = invoice.id
            ? await stripe.invoices.retrieve(invoice.id)
            : null;
          if (current && current.status !== "open") {
            console.log(
              `Invoice ${invoice.id} is ${current.status} now; past_due not applied`,
            );
            break;
          }
        } catch (e) {
          console.warn(
            `Invoice ${invoice.id}: could not re-check status, applying past_due`,
            e,
          );
        }
        await supabase
          .from("registrations")
          .update({ payment_status: "past_due" })
          .eq("stripe_subscription_id", subId)
          .neq("payment_status", "refunded");
        break;
      }

      case "customer.subscription.updated": {
        // A subscription can lapse (past_due, or Stripe's "unpaid" after the
        // retries run out) without an invoice.payment_failed reaching us.
        // Read it from Stripe as it is now, since events can arrive out of
        // order. subscription_status keeps Stripe's own word; payment_status
        // only moves to past_due (Stripe's "unpaid" is a lapsed renewal, not
        // our "unpaid", which means no payment was ever attempted).
        const subscription = event.data.object as Stripe.Subscription;
        let status: string = subscription.status;
        try {
          status = (await stripe.subscriptions.retrieve(subscription.id))
            .status;
        } catch (e) {
          console.warn(
            `Subscription ${subscription.id}: could not re-check status, using the event's`,
            e,
          );
        }
        await supabase
          .from("registrations")
          .update({ subscription_status: status })
          .eq("stripe_subscription_id", subscription.id);
        if (status === "past_due" || status === "unpaid") {
          await supabase
            .from("registrations")
            .update({ payment_status: "past_due" })
            .eq("stripe_subscription_id", subscription.id)
            .neq("payment_status", "refunded");
        }
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
        const intentId =
          typeof charge.payment_intent === "string"
            ? charge.payment_intent
            : charge.payment_intent?.id;
        if (!intentId) break;
        // Find the registration however it was paid: the embedded card form
        // and /checkout use a PaymentIntent (registration id in its metadata,
        // stripe_session_id = the intent id); hosted Checkout uses a session.
        let registrationId: string | null = null;
        let noShowFee = false;
        try {
          const intent = await stripe.paymentIntents.retrieve(intentId);
          registrationId = intent.metadata?.registration_id || null;
          noShowFee = intent.metadata?.purpose === "trial_no_show_fee";
        } catch (e) {
          console.warn(`Refund: could not read PaymentIntent ${intentId}`, e);
        }
        if (!registrationId) {
          const { data: byIntent } = await supabase
            .from("registrations")
            .select("id")
            .eq("stripe_session_id", intentId)
            .maybeSingle();
          registrationId = byIntent?.id ?? null;
        }
        if (!registrationId) {
          const sessions = await stripe.checkout.sessions.list({
            payment_intent: intentId,
            limit: 1,
          });
          if (sessions.data.length > 0) {
            const { data: bySession } = await supabase
              .from("registrations")
              .select("id")
              .eq("stripe_session_id", sessions.data[0].id)
              .maybeSingle();
            registrationId = bySession?.id ?? null;
          }
        }
        if (!registrationId) {
          console.warn(`Refund for ${intentId}: no registration found`);
          break;
        }
        // A refunded no-show fee: recorded on its own columns, leaving the
        // registration's lesson payments (refunded_at, payment_status) alone.
        if (noShowFee) {
          const { error: feeErr } = await supabase
            .from("registrations")
            .update({
              no_show_fee_refunded_amount: charge.amount_refunded,
              ...(charge.amount_refunded >= charge.amount
                ? { no_show_fee_status: "refunded" }
                : {}),
            })
            .eq("id", registrationId)
            .eq("no_show_fee_intent_id", intentId);
          if (feeErr) throw feeErr;
          break;
        }
        // A partial refund keeps the registration paid and records the amount;
        // only a full refund is "refunded". Amounts are Stripe minor units,
        // like the admin refund. The admin refund already wrote these fields
        // when it started the refund, so this is idempotent for it.
        const fullyRefunded = charge.amount_refunded >= charge.amount;
        const { error: refundErr } = await supabase
          .from("registrations")
          .update({
            refunded_amount: charge.amount_refunded,
            refunded_at: new Date(event.created * 1000).toISOString(),
            ...(fullyRefunded ? { payment_status: "refunded" } : {}),
          })
          .eq("id", registrationId);
        if (refundErr) throw refundErr;
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
    const message =
      err instanceof Error ? err.message : "Webhook processing error";
    console.error("Webhook handler error:", message);
    // Release the claim so Stripe's retry is processed instead of skipped.
    if (claimed) {
      const { error: releaseErr } = await supabase
        .from("stripe_events")
        .delete()
        .eq("id", event.id);
      if (releaseErr)
        console.error(
          `Event ${event.id}: could not release the idempotency claim`,
          releaseErr,
        );
    }
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
