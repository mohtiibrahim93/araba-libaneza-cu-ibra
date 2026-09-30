import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  privateLessonStarts,
  weeklySeriesStarts,
} from "../../supabase/functions/_shared/private-series";

const read = (p: string) => readFileSync(resolve(process.cwd(), p), "utf8");

/**
 * Private lessons, in the owner's order: details, then the day and time, then
 * payment — and nothing is booked or counted as a lead until the payment
 * clears. The slot travels through Stripe and stripe-webhook books it.
 */
describe("weekly private series", () => {
  it("keeps the same Bucharest wall-clock time across the October clock change", () => {
    // Tuesday 20 Oct 2026, 18:00 in Bucharest (UTC+3). Clocks go back on 25 Oct.
    const starts = weeklySeriesStarts("2026-10-20T15:00:00.000Z", 3);
    expect(starts).toEqual([
      "2026-10-20T15:00:00.000Z",
      // 18:00 in winter time is 16:00 UTC, not 15:00.
      "2026-10-27T16:00:00.000Z",
      "2026-11-03T16:00:00.000Z",
    ]);
  });

  it("books one lesson unless the weekly option was chosen", () => {
    const meta = { booking_start_at: "2026-10-20T15:00:00.000Z", quantity: "10" };
    expect(privateLessonStarts(meta)).toHaveLength(1);
    expect(privateLessonStarts({ ...meta, booking_weekly: "1" })).toHaveLength(10);
    expect(privateLessonStarts({ quantity: "10", booking_weekly: "1" })).toEqual([]);
  });
});

describe("a private lesson is booked only once paid", () => {
  it("refuses a public booking of a paid lesson without a payment", () => {
    const src = read("supabase/functions/booking-create/index.ts");
    expect(src).toContain('et.slug !== "trial" && !internalCall && reg.payment_status !== "paid"');
    expect(src).toContain('code: "payment_required"');
  });

  it("sends the chosen slot through Stripe and books it from the webhook", () => {
    const checkout = read("supabase/functions/create-checkout-session/index.ts");
    expect(checkout).toContain("...(isPrivate ? { ...bookingMeta, quantity: String(quantity) } : {})");
    const webhook = read("supabase/functions/stripe-webhook/index.ts");
    expect(webhook).toContain('session.metadata?.course_type === "private"');
    expect(webhook).toContain("privateLessonStarts(");
  });

  it("keeps an unpaid private purchase out of the leads", () => {
    const form = read("src/components/RegistrationFormSection.tsx");
    expect(form).toContain('...(courseType === "private" ? { lead_status: "incomplete" } : {})');
    expect(form).toContain("purchase={{");
  });
});
