import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { TRIAL_NO_SHOW_FEE_BANI } from "../../supabase/functions/_shared/prices";

/**
 * The free trial's no-show fee (owner's decision, 27 October 2026): after the
 * owner marks a trial lost (no-show or a cancellation under 24 h), the admin
 * charges the saved card 150 lei after one confirmation — off-session, on the
 * saved payment method, one idempotency key per booking. A declined card is
 * reported and nothing is marked paid. The refund button gives it back.
 */
const read = (p: string) => readFileSync(resolve(process.cwd(), p), "utf8");
const admin = read("supabase/functions/admin-registrations/index.ts");
const block = admin.slice(
  admin.indexOf('action === "preview_no_show_fee"'),
  admin.indexOf("// The owner's word on a package lesson"),
);

describe("trial no-show fee", () => {
  it("is 150 lei", () => {
    expect(TRIAL_NO_SHOW_FEE_BANI).toBe(15_000);
  });

  it("is charged only for a trial the owner marked lost", () => {
    expect(block).toContain('booking.event_type_slug !== "trial"');
    expect(block).toContain('booking.trial_outcome !== "lost"');
  });

  it("charges the saved card off-session, once per booking", () => {
    expect(block).toContain("off_session: true");
    expect(block).toContain("confirm: true");
    expect(block).toContain("payment_method: paymentMethodId");
    expect(block).toContain(
      "{ idempotencyKey: `trial_no_show_fee_${booking.id}` }",
    );
    expect(block).toContain('purpose: "trial_no_show_fee"');
  });

  it("only previews without moving money until the owner confirms", () => {
    const preview = block.slice(
      block.indexOf('if (action === "preview_no_show_fee") {'),
      block.indexOf("stripe.paymentIntents.create("),
    );
    expect(preview).toContain("return jsonResponse(");
    expect(preview).not.toContain("paymentIntents.create");
  });

  it("leaves it unpaid when the card fails, and says so", () => {
    expect(block).toContain('no_show_fee_status: "failed"');
    expect(block).toContain("Taxa rămâne neîncasată.");
    // Never through payment_status: a trial marked paid would read as a
    // student and refuse their later payment for lessons.
    expect(block).not.toContain("payment_status");
  });

  it("can be refunded by the existing refund button", () => {
    const refund = admin.slice(admin.indexOf('if (action === "refund") {'));
    expect(refund).toContain('reg.no_show_fee_status === "paid"');
    expect(refund).toContain("noShowFeeRefundFor(");
    expect(refund).toContain('no_show_fee_status: "refunded"');
    const table = read("src/components/admin/RegistrationsTable.tsx");
    expect(table).toContain('registration.no_show_fee_status === "paid"');
  });

  it("is never taken by the webhook for a payment for lessons", () => {
    const hook = read("supabase/functions/stripe-webhook/index.ts");
    for (const event of [
      'case "payment_intent.succeeded"',
      'case "payment_intent.payment_failed"',
    ]) {
      const handler = hook.slice(
        hook.indexOf(event),
        hook.indexOf(event) + 900,
      );
      expect(handler).toContain('purpose === "trial_no_show_fee"');
    }
    const refunded = hook.slice(hook.indexOf('case "charge.refunded"'));
    expect(refunded).toContain("if (noShowFee) {");
  });

  it("is told to the visitor before booking and in the Terms", () => {
    const scheduler = read("src/components/NativeScheduler.tsx");
    expect(scheduler).toContain("Taxa poate fi rambursată dacă o contești.");
    expect(scheduler).toContain("The fee may be refunded if");
  });
});
