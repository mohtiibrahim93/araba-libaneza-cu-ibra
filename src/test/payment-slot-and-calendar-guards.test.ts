import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const read = (p: string) => readFileSync(p, "utf8");

describe("audit P0-7: a paid booking time is one the site would offer", () => {
  it.each([
    "supabase/functions/create-payment-intent/index.ts",
    "supabase/functions/create-checkout-session/index.ts",
  ])("%s checks the slot before Stripe", (file) => {
    const src = read(file);
    const check = src.indexOf("await offeredSlot(");
    expect(check).toBeGreaterThan(-1);
    expect(check).toBeLessThan(src.search(/stripe\.(paymentIntents|checkout)/));
    expect(src).toContain('code: "invalid_slot"');
  });

  it("uses the reschedule rules: hours, notice, in-person days, days off", () => {
    const fn = read("supabase/functions/_shared/booking.ts");
    const body = fn.slice(fn.indexOf("export async function offeredSlot"));
    for (const rule of [
      "candidateSlotsForDays(",
      "passesTimingRules(",
      "inBlackout(",
      "rulesForEventType(",
    ])
      expect(body).toContain(rule);
  });
});

describe("audit P0-4: an embedded card payment can show as paid", () => {
  it("the payment intent returns the signed id and checkout puts it in the return link", () => {
    expect(read("supabase/functions/create-payment-intent/index.ts")).toContain(
      "sig: await signRegistrationId(registrationId)",
    );
    const checkout = read("src/pages/Checkout.tsx");
    expect(checkout).toContain('returnUrl.searchParams.set("sig", sig)');
    expect(checkout).not.toContain('returnUrl.searchParams.set("email"');
  });
});

describe("Google not answering never reads as a free calendar for visitors", () => {
  it("the slot list answers 503 instead of listing times", () => {
    const src = read("supabase/functions/booking-availability/index.ts");
    expect(src).toContain("gcalBusyOrNull(");
    expect(src).toContain('code: "calendar_unavailable"');
  });

  it("a visitor's booking is refused; the owner and the webhook go on", () => {
    const src = read("supabase/functions/booking-create/index.ts");
    expect(src).toContain("gcalBusyOrNull(");
    const branch = src.slice(src.indexOf("if (busy === null)"));
    expect(branch.slice(0, 200)).toContain("if (!internalCall)");
  });
});

describe("audit P0-6: the paid AI assistant is rate limited", () => {
  it("checks a per-visitor limit before calling the model, and rejects bad JSON", () => {
    const src = read("src/routes/api/chat.ts");
    const limit = src.indexOf('rpc("check_and_record_rate_limit"');
    expect(limit).toBeGreaterThan(-1);
    expect(limit).toBeLessThan(src.indexOf("streamText"));
    expect(src).toContain('new Response("Too many requests", { status: 429 })');
    expect(src).toContain('new Response("Invalid JSON", { status: 400 })');
  });
});
