import { describe, expect, it } from "vitest";
import { loadEdgeHandler } from "./helpers/edge-handler";

/**
 * Task 10 audit: three ways the webhook could record the wrong money state.
 *
 *  1. Failure/expiry events overwrote money that had already settled. Stripe
 *     does not guarantee event order, so a declined first attempt (or an old
 *     session expiring) could turn a paid registration into failed.
 *  2. invoice.payment_failed marked a subscription past_due even when that
 *     invoice had been paid since.
 *  3. A refund made in Stripe was only matched through a Checkout session, so
 *     PaymentIntent payments (the embedded card form, /checkout) were never
 *     marked refunded; and a partial refund was recorded as a full one.
 *
 * These run the real handler with Stripe and the database stubbed.
 */
type Write = { table: string; patch: Record<string, unknown>; filters: string[] };

function run(event: Record<string, unknown>, stripeApi: Record<string, unknown> = {}, rows: Record<string, unknown[]> = {}) {
  const writes: Write[] = [];
  const db = {
    from: (table: string) => {
      const filters: string[] = [];
      let patch: Record<string, unknown> | null = null;
      const q: any = {
        upsert: () => ({ select: async () => ({ data: [{ id: event["id"] }], error: null }) }),
        update: (p: Record<string, unknown>) => { patch = p; return q; },
        select: () => q,
        eq: (k: string, v: unknown) => { filters.push(`${k}=${v}`); return q; },
        neq: (k: string, v: unknown) => { filters.push(`${k}!=${v}`); return q; },
        not: (k: string, op: string, v: unknown) => { filters.push(`${k} not ${op} ${v}`); return q; },
        delete: () => q,
        maybeSingle: async () => ({ data: (rows[table] ?? [])[0] ?? null, error: null }),
        then: (resolve: (v: unknown) => void) => { if (patch) writes.push({ table, patch, filters }); resolve({ data: null, error: null }); },
      };
      return q;
    },
  };
  class FakeStripe {
    webhooks = { constructEventAsync: async () => event };
    invoices = (stripeApi["invoices"] as object) ?? {};
    paymentIntents = (stripeApi["paymentIntents"] as object) ?? {};
    checkout = { sessions: (stripeApi["sessions"] as object) ?? { list: async () => ({ data: [] }) } };
    setupIntents = {};
    subscriptions = (stripeApi["subscriptions"] as object) ?? {};
  }
  let handler!: (req: Request) => Promise<Response>;
  loadEdgeHandler("supabase/functions/stripe-webhook/index.ts", {
    "https://deno.land/std@0.190.0/http/server.ts": { serve: (fn: typeof handler) => { handler = fn; } },
    "https://esm.sh/stripe@18.5.0": { default: FakeStripe },
    "https://esm.sh/@supabase/supabase-js@2.57.2": { createClient: () => db },
    "../_shared/cors.ts": { buildCorsHeaders: () => ({}) },
    "../_shared/managed-email.ts": { sendTemplateEmail: async () => ({ sent: true }) },
    "../_shared/private-series.ts": { privateLessonStarts: () => [] },
  }, { STRIPE_SECRET_KEY: "sk_test", STRIPE_WEBHOOK_SECRET: "whsec" });
  return handler(new Request("https://example.test/stripe-webhook", { method: "POST", headers: { "stripe-signature": "sig" }, body: "{}" }))
    .then(async (res) => ({ status: res.status, writes }));
}

describe("late failure events never overwrite settled money", () => {
  it("payment_intent.payment_failed leaves paid and refunded registrations alone", async () => {
    const out = await run({ id: "evt1", type: "payment_intent.payment_failed", data: { object: { id: "pi_1", metadata: { registration_id: "reg" } } } });
    const w = out.writes.find((x) => x.table === "registrations")!;
    expect(w.patch).toEqual({ payment_status: "failed" });
    expect(w.filters).toContain('payment_status not in ("paid","refunded")');
  });

  it("an expired or failed Checkout session does the same", async () => {
    for (const type of ["checkout.session.expired", "checkout.session.async_payment_failed"]) {
      const out = await run({ id: `evt-${type}`, type, data: { object: { id: "cs_1" } } });
      expect(out.writes.find((x) => x.table === "registrations")!.filters).toContain('payment_status not in ("paid","refunded")');
    }
  });
});

describe("invoice.payment_failed checks the invoice as it is now", () => {
  it("does not mark past_due when the invoice has been paid since", async () => {
    const out = await run(
      { id: "evt2", type: "invoice.payment_failed", data: { object: { id: "in_1", subscription: "sub_1" } } },
      { invoices: { retrieve: async () => ({ id: "in_1", status: "paid" }) } },
    );
    expect(out.writes.filter((x) => x.table === "registrations")).toEqual([]);
  });

  it("marks past_due while the invoice is still open", async () => {
    const out = await run(
      { id: "evt3", type: "invoice.payment_failed", data: { object: { id: "in_1", subscription: "sub_1" } } },
      { invoices: { retrieve: async () => ({ id: "in_1", status: "open" }) } },
    );
    const w = out.writes.find((x) => x.table === "registrations")!;
    expect(w.patch).toEqual({ payment_status: "past_due" });
    expect(w.filters).toContain("payment_status!=refunded");
  });
});

describe("refunds made in Stripe", () => {
  const charge = (amount_refunded: number) => ({ id: "evt4", type: "charge.refunded", created: 1_791_900_000, data: { object: { payment_intent: "pi_9", amount: 50000, amount_refunded } } });

  it("are matched for PaymentIntent payments through the intent's registration id", async () => {
    const out = await run(charge(50000), { paymentIntents: { retrieve: async () => ({ id: "pi_9", metadata: { registration_id: "reg-9" } }) } });
    const w = out.writes.find((x) => x.table === "registrations")!;
    expect(w.filters).toContain("id=reg-9");
    expect(w.patch).toMatchObject({ payment_status: "refunded", refunded_amount: 50000 });
  });

  it("record a partial refund without calling it a full one", async () => {
    const out = await run(charge(20000), { paymentIntents: { retrieve: async () => ({ id: "pi_9", metadata: { registration_id: "reg-9" } }) } });
    const w = out.writes.find((x) => x.table === "registrations")!;
    expect(w.patch["refunded_amount"]).toBe(20000);
    expect(w.patch).not.toHaveProperty("payment_status");
  });

  it("fall back to the registration that stored the intent id", async () => {
    const out = await run(
      charge(50000),
      { paymentIntents: { retrieve: async () => ({ id: "pi_9", metadata: {} }) } },
      { registrations: [{ id: "reg-by-intent" }] },
    );
    expect(out.writes.find((x) => x.table === "registrations")!.filters).toContain("id=reg-by-intent");
  });
});

describe("customer.subscription.updated records a lapse without a failed invoice", () => {
  const updated = (status: string) => ({ id: `evt-sub-${status}`, type: "customer.subscription.updated", data: { object: { id: "sub_1", status } } });

  it("marks past_due from Stripe's current status, never over a refund", async () => {
    const out = await run(updated("active"), { subscriptions: { retrieve: async () => ({ id: "sub_1", status: "unpaid" }) } });
    const regs = out.writes.filter((x) => x.table === "registrations");
    expect(regs[0]!.patch).toEqual({ subscription_status: "unpaid" });
    expect(regs[1]!.patch).toEqual({ payment_status: "past_due" });
    expect(regs[1]!.filters).toContain("payment_status!=refunded");
  });

  it("leaves payment_status alone while the subscription is active", async () => {
    const out = await run(updated("active"), { subscriptions: { retrieve: async () => ({ id: "sub_1", status: "active" }) } });
    const regs = out.writes.filter((x) => x.table === "registrations");
    expect(regs.map((w) => w.patch)).toEqual([{ subscription_status: "active" }]);
  });
});
