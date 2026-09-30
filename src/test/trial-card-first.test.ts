import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

/**
 * A free trial is not booked until the card is saved.
 *
 * It used to work the other way round: booking-create ran first, the
 * confirmation email went out, and the success screen said "Your booking is
 * confirmed!" above a panel asking for a card as a "last step". That sentence
 * told people they could close the tab, and they did — five of the first six
 * trials ever booked carried no card at all, each one a real slot that a
 * no-show costs 150 lei of teaching time.
 *
 * The order is now: registration (so the lead survives either way) → Stripe
 * setup session carrying the slot → webhook creates the booking. The webhook
 * rather than the browser's return is the whole point: Stripe retries the
 * event, a closed tab gets no second chance.
 *
 * These are source assertions. The flow spans a React component and two edge
 * functions that run on Deno against live Stripe, so there is nothing here to
 * execute — but each step can be deleted or reordered by accident, and the
 * failure mode is silent: bookings would simply go back to being free.
 */
const read = (p: string) => readFileSync(resolve(process.cwd(), p), "utf8");

describe("the trial slot is paid for with a card, not a promise", () => {
  const scheduler = read("src/components/NativeScheduler.tsx");
  const checkout = read("supabase/functions/create-checkout-session/index.ts");
  const webhook = read("supabase/functions/stripe-webhook/index.ts");

  it("sends a trial to the card step instead of booking it", () => {
    expect(scheduler).toContain('if (eventType === "trial" && mode === "create" && resolvedRegistrationId)');
    // The redirect has to happen before booking-create is reached.
    const cardStep = scheduler.indexOf('eventType === "trial" && mode === "create"');
    const bookingCall = scheduler.indexOf('supabase.functions.invoke("booking-create"');
    expect(cardStep).toBeGreaterThan(-1);
    expect(bookingCall).toBeGreaterThan(cardStep);
  });

  it("still captures the lead before the redirect", () => {
    // An abandoned card step must leave someone to contact.
    const ensure = scheduler.indexOf("ensureRegistration?.(");
    const cardStep = scheduler.indexOf('eventType === "trial" && mode === "create"');
    expect(ensure).toBeGreaterThan(-1);
    expect(ensure).toBeLessThan(cardStep);
  });

  it("no longer offers the card as an afterthought", () => {
    // The panel that said "Last step: confirm your spot" sat under a heading
    // claiming the booking was already confirmed.
    expect(scheduler).not.toContain("Confirm my spot (0 lei)");
    expect(scheduler).not.toContain("startCardConfirmation");
  });

  it("carries the slot to Stripe in the session metadata", () => {
    expect(checkout).toContain("booking_start_at");
    expect(checkout).toContain("booking_event_type");
    // Notes are truncated rather than allowed to break the session create.
    expect(checkout).toContain("put(\"booking_notes\", booking.notes)");
  });

  it("creates the booking in the webhook, where a closed tab cannot stop it", () => {
    expect(webhook).toContain("booking_start_at");
    expect(webhook).toContain("/functions/v1/booking-create");
    // booking-create stays the only place a booking is made.
    expect(webhook).not.toContain('.from("bookings")\n              .insert');
  });

  it("never throws out of the webhook when booking-create fails", () => {
    // Throwing would make Stripe retry the whole event and re-run the card
    // update above it.
    const setupBranch = webhook
      .slice(webhook.indexOf('if (session.mode === "setup")'), webhook.indexOf("if (!paid)"))
      // Comments explain the rule and would match it.
      .split("\n")
      .filter((l) => !l.trim().startsWith("//"))
      .join("\n");
    expect(setupBranch).toContain("console.error");
    expect(setupBranch).not.toMatch(/\bthrow\b/);
  });

  it("does not throttle the webhook as if it were a visitor", () => {
    // booking-create caps 5 per hour per IP, which is right for a public
    // endpoint that emails a client-supplied address. The webhook calls it
    // server-to-server, so every visitor's booking shares the function
    // runtime's IP — that per-person limit would become a global cap of five
    // trials an hour, failing silently with a card saved and no booking.
    const create = read("supabase/functions/booking-create/index.ts");
    expect(create).toContain("internalCall");
    expect(create).toContain("if (clientIp && !internalCall)");
    // The exemption must be earned by the service-role key, not assumed.
    expect(create).toContain("bearer === serviceRoleKey");
  });

  it("tells a human when the booking fails after the card is saved", () => {
    // The one failure that strands someone: card on file, told their spot is
    // confirmed, no booking, and nothing else notices — the handler logs
    // rather than throws, on purpose, so Stripe does not retry the card update.
    expect(webhook).toContain("admin-trial-booking-failed");
    expect(webhook).toContain("ADMIN_RECIPIENT");
    // The alert failing must not take the handler down with it.
    expect(webhook).toContain("could not send the failure alert");
  });

  it("stops telling a visitor who skipped the card that they have a booking", () => {
    const index = read("src/pages/Index.tsx");
    expect(index).not.toContain("your trial booking still stands");
    expect(index).toContain("your slot was not reserved");
  });
});
