import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const read = (p: string) => readFileSync(resolve(process.cwd(), p), "utf8");

/**
 * A paid registration books at most the lessons it bought, and the private
 * purchase pays inside the site with the hosted page as fallback.
 */
describe("paid lessons are capped at the quantity bought", () => {
  const src = read("supabase/functions/booking-create/index.ts");

  it("counts confirmed and completed non-trial bookings against registrations.quantity", () => {
    expect(src).toContain('.select("id, payment_status, quantity")');
    expect(src).toContain('.neq("event_type_slug", "trial")');
    expect(src).toContain('.in("status", ["confirmed", "completed"])');
    expect(src).toContain("(used ?? 0) >= bought");
    expect(src).toContain('code: "lessons_used_up"');
  });

  it("applies to internal calls too (the check is not gated on internalCall)", () => {
    const block = src.slice(src.indexOf("// A paid registration books at most"), src.indexOf('code: "lessons_used_up"'));
    expect(block).toContain('if (et.slug !== "trial") {');
    expect(block).not.toContain("internalCall");
  });

  it("the scheduler explains it in both languages with a link to the private page", () => {
    const ui = read("src/components/NativeScheduler.tsx");
    expect(ui).toContain('code === "lessons_used_up"');
    expect(ui).toContain("Ai programat deja toate lecțiile plătite.");
    expect(ui).toContain("You have already booked all the lessons you paid for.");
    expect(ui).toContain("/cursuri/private#register");
  });
});

describe("private purchase pays inside the site", () => {
  it("sends the slot on the PaymentIntent and falls back to hosted Checkout", () => {
    const ui = read("src/components/NativeScheduler.tsx");
    expect(ui).toContain('invoke("create-payment-intent"');
    expect(ui).toContain("openHostedCheckout");
    const pi = read("supabase/functions/create-payment-intent/index.ts");
    expect(pi).toContain('put("booking_start_at", booking.start_at, 40);');
    expect(pi).toContain("...bookingMeta,");
  });

  it("books from payment_intent.succeeded through the same shared function", () => {
    const wh = read("supabase/functions/stripe-webhook/index.ts");
    expect(wh.match(/await bookPrivateLessons\(/g)?.length).toBe(2);
    expect(wh).toContain('intent.metadata?.course_type === "private" && intent.metadata?.booking_start_at');
  });
});
