import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { loadEdgeHandler, loadEdgeModule } from "./helpers/edge-handler";

/**
 * "Pay the next month by card" (owner, 14 Nov 2026), end to end on the
 * server: create-month-payment prepares one payment for one month, and the
 * Stripe webhook records it as "Card online" for that month and nothing else.
 *
 * These run the real handlers with Stripe and the database stubbed.
 */
const read = (p: string) => readFileSync(resolve(process.cwd(), p), "utf8");

// Which months are due depends on the day; the minute goes into Stripe's
// idempotency key. Pinned, so the tests mean the same on any day.
beforeAll(() => {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date("2026-11-15T10:00:00Z"));
});
afterAll(() => {
  vi.useRealTimers();
});

type Row = Record<string, unknown>;
type Write = { table: string; op: string; value?: Row; filters: string[] };

/** A small in-memory database with the calls the two handlers make. */
function fakeDb(
  tables: Record<string, Row[]>,
  opts: {
    failInsert?: boolean;
    failRead?: string;
    user?: { email: string; confirmed?: boolean } | null;
  } = {},
) {
  const writes: Write[] = [];
  const from = (table: string) => {
    const filters: Array<[string, unknown]> = [];
    let op = "select";
    let value: Row | undefined;
    const rows = () =>
      (tables[table] ?? []).filter((r) => filters.every(([k, v]) => r[k] === v));
    const result = async () => {
      const tags = filters.map(([k, v]) => `${k}=${v}`);
      if (op === "insert") {
        if (opts.failInsert)
          return { data: null, error: { code: "XX000", message: "down" } };
        (tables[table] ??= []).push(value!);
        writes.push({ table, op, value: value!, filters: tags });
        return { data: null, error: null };
      }
      if (op === "update") {
        for (const r of rows()) Object.assign(r, value);
        writes.push({ table, op, value: value!, filters: tags });
        return { data: null, error: null };
      }
      if (op === "delete") {
        writes.push({ table, op, filters: tags });
        return { data: null, error: null };
      }
      if (opts.failRead === table)
        return { data: null, error: { message: "read failed" } };
      return { data: rows(), error: null };
    };
    const q: any = {
      select: () => q,
      insert: (v: Row) => ((op = "insert"), (value = v), q),
      update: (v: Row) => ((op = "update"), (value = v), q),
      delete: () => ((op = "delete"), q),
      upsert: (v: Row) => ({
        select: async () => ({ data: [{ id: v["id"] }], error: null }),
      }),
      eq: (k: string, v: unknown) => (filters.push([k, v]), q),
      not: () => q,
      or: () => q,
      maybeSingle: async () => {
        const r = await result();
        return {
          data: Array.isArray(r.data) ? (r.data[0] ?? null) : r.data,
          error: r.error,
        };
      },
      then: (ok: (v: unknown) => void, bad: (e: unknown) => void) =>
        result().then(ok, bad),
    };
    return q;
  };
  const auth = {
    getUser: async () => ({
      data: {
        user: opts.user
          ? {
              email: opts.user.email,
              email_confirmed_at:
                opts.user.confirmed === false ? null : "2026-11-01T00:00:00Z",
              is_anonymous: false,
            }
          : null,
      },
      error: opts.user ? null : { message: "no session" },
    }),
  };
  return { db: { from, auth }, writes, tables };
}

const REG = "11111111-2222-4333-8444-555555555555";
/** Months 1–3 recorded at the centre; the group runs at its own 500 lei. */
const baseTables = (): Record<string, Row[]> => ({
  registrations: [
    {
      id: REG,
      form_type: "group",
      payment_status: "paid",
      email: "student@example.test",
      name: "Ana Exemplu",
      level: "A1",
      format: "fizic",
      cohort_id: "c1",
      months_total: 4,
      canceled_at: null,
      subscription_status: null,
    },
  ],
  group_cohorts: [
    {
      id: "c1",
      status: "in_progress",
      level: "A1",
      format: "fizic",
      start_date: "2026-09-02",
      price_lei: 500,
    },
  ],
  registration_payments: [
    {
      registration_id: REG,
      kind: "month",
      method: "other",
      amount_lei: 1500,
      paid_at: "2026-11-13T12:00:00Z",
      month_from: 1,
      month_to: 3,
      stripe_ref: null,
    },
  ],
});

// ---------------------------------------------------------------------------
// create-month-payment
// ---------------------------------------------------------------------------
type Intent = Row & { id: string; status: string; metadata?: Row };

function prepare(
  tables: Record<string, Row[]>,
  opts: Parameters<typeof fakeDb>[1] = {},
  existing: Intent[] = [],
) {
  const { db, writes } = fakeDb(tables, opts);
  const created: Array<{ params: Row; options: Row }> = [];
  const cancelled: string[] = [];
  const stripeCalls: string[] = [];
  class FakeStripe {
    customers = {
      list: async () => (stripeCalls.push("customers.list"), { data: [{ id: "cus_1" }] }),
      create: async () => ({ id: "cus_new" }),
    };
    paymentIntents = {
      list: async () => (stripeCalls.push("pi.list"), { data: existing }),
      cancel: async (id: string) => (cancelled.push(id), {}),
      create: async (params: Row, options: Row) => {
        created.push({ params, options });
        return {
          id: "pi_new",
          client_secret: "pi_new_secret",
          status: "requires_payment_method",
          ...params,
        };
      },
    };
  }
  let handler!: (req: Request) => Promise<Response>;
  loadEdgeHandler(
    "supabase/functions/create-month-payment/index.ts",
    {
      "https://deno.land/std@0.190.0/http/server.ts": {
        serve: (fn: typeof handler) => {
          handler = fn;
        },
      },
      "https://esm.sh/stripe@18.5.0": { default: FakeStripe },
      "https://esm.sh/@supabase/supabase-js@2.57.2": { createClient: () => db },
      "../_shared/cors.ts": { buildCorsHeaders: () => ({}) },
      // The real ownership check, not a stub: it is what keeps a stranger out.
      "../_shared/verified-registration-owner.ts": loadEdgeModule(
        "supabase/functions/_shared/verified-registration-owner.ts",
        {},
      ),
    },
    { STRIPE_SECRET_KEY: "sk_test", STRIPE_PUBLISHABLE_KEY: "pk_test_x" },
  );
  const call = async (body: unknown, signedIn = true) => {
    const res = await handler(
      new Request("https://example.test/create-month-payment", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          ...(signedIn ? { authorization: "Bearer token" } : {}),
        },
        body: JSON.stringify(body),
      }),
    );
    return { status: res.status, body: (await res.json()) as Row };
  };
  return { call, created, cancelled, stripeCalls, writes };
}

const student = { user: { email: "Student@Example.test" } };

describe("preparing the payment for the next month", () => {
  it("charges one month, the lowest one open, at the group's own price", async () => {
    const t = prepare(baseTables(), student);
    const out = await t.call({ registrationId: REG });
    expect(out.status).toBe(200);
    expect(out.body).toMatchObject({
      clientSecret: "pi_new_secret",
      amount: 50000,
      currency: "ron",
      month: 4,
      monthsTotal: 4,
      publishableKey: "pk_test_x",
    });
    expect(t.created).toHaveLength(1);
    expect(t.created[0]!.params).toMatchObject({
      amount: 50000,
      currency: "ron",
      customer: "cus_1",
      receipt_email: "student@example.test",
      metadata: {
        purpose: "group_month",
        registration_id: REG,
        month: "4",
        months_total: "4",
      },
    });
  });

  it("writes nothing to the sign-up: its status and seat are not this payment's", async () => {
    const t = prepare(baseTables(), student);
    await t.call({ registrationId: REG });
    expect(t.writes).toEqual([]);
    const src = read("supabase/functions/create-month-payment/index.ts");
    expect(src).not.toMatch(/\.update\(|\.insert\(|\.upsert\(|\.delete\(/);
  });

  it("is only for the student, signed in with the sign-up's own confirmed address", async () => {
    for (const t of [
      prepare(baseTables(), { user: null }),
      prepare(baseTables(), { user: { email: "other@example.test" } }),
      prepare(baseTables(), {
        user: { email: "student@example.test", confirmed: false },
      }),
    ]) {
      const out = await t.call({ registrationId: REG });
      expect(out.status).toBe(404);
      expect(t.stripeCalls).toEqual([]);
      expect(t.created).toEqual([]);
    }
    const noHeader = prepare(baseTables(), student);
    expect((await noHeader.call({ registrationId: REG }, false)).status).toBe(404);
  });

  it("says why when there is nothing to pay, and charges nothing", async () => {
    const cases: Array<[string, (t: Record<string, Row[]>) => void]> = [
      ["all_paid", (t) => (t["registration_payments"]![0]!["month_to"] = 4)],
      ["subscription", (t) => (t["registrations"]![0]!["subscription_status"] = "active")],
      ["withdrawn", (t) => (t["registrations"]![0]!["canceled_at"] = "2026-11-13T19:41:07Z")],
      ["no_group", (t) => (t["group_cohorts"]![0]!["status"] = "cancelled")],
      ["not_group", (t) => (t["registrations"]![0]!["form_type"] = "private")],
    ];
    for (const [code, change] of cases) {
      const tables = baseTables();
      change(tables);
      const t = prepare(tables, student);
      const out = await t.call({ registrationId: REG });
      expect([code, out.status, out.body["code"]]).toEqual([code, 409, code]);
      expect(t.created).toEqual([]);
    }
  });

  it("stops when the group cannot be read, instead of guessing a price", async () => {
    const t = prepare(baseTables(), { ...student, failRead: "group_cohorts" });
    const out = await t.call({ registrationId: REG });
    expect(out.status).toBe(500);
    expect(t.created).toEqual([]);
  });

  it("hands back the payment already open for that month, and closes stale ones", async () => {
    const meta = { purpose: "group_month", registration_id: REG };
    const t = prepare(baseTables(), student, [
      {
        id: "pi_open",
        status: "requires_payment_method",
        amount: 50000,
        currency: "ron",
        client_secret: "pi_open_secret",
        created: 1794700000,
        metadata: { ...meta, month: "4" },
      },
      {
        id: "pi_old_month",
        status: "requires_payment_method",
        amount: 50000,
        currency: "ron",
        client_secret: "x",
        created: 1794000000,
        metadata: { ...meta, month: "3" },
      },
      {
        id: "pi_someone_else",
        status: "requires_payment_method",
        amount: 50000,
        currency: "ron",
        client_secret: "y",
        created: 1794000000,
        metadata: { purpose: "group_month", registration_id: "another", month: "4" },
      },
    ]);
    const out = await t.call({ registrationId: REG });
    expect(out.body).toMatchObject({
      clientSecret: "pi_open_secret",
      paymentIntentId: "pi_open",
    });
    expect(t.created).toEqual([]);
    expect(t.cancelled).toEqual(["pi_old_month"]);
  });

  it("does not charge the same month twice while the first payment is being recorded", async () => {
    const paid = (created: number): Intent => ({
      id: "pi_paid",
      status: "succeeded",
      amount: 50000,
      currency: "ron",
      created,
      metadata: { purpose: "group_month", registration_id: REG, month: "4" },
    });
    const now = Math.floor(Date.now() / 1000);
    const t = prepare(baseTables(), student, [paid(now - 120)]);
    const out = await t.call({ registrationId: REG });
    expect([out.status, out.body["code"]]).toEqual([409, "processing"]);
    expect(t.created).toEqual([]);

    // Already written as a month, or long ago: it no longer blocks.
    const recorded = baseTables();
    recorded["registration_payments"]!.push({
      registration_id: REG,
      kind: "month",
      method: "card_online",
      amount_lei: 500,
      paid_at: "2026-11-15T09:58:00Z",
      month_from: 5,
      month_to: 5,
      stripe_ref: "pi_paid",
    });
    expect(
      (await prepare(recorded, student, [paid(now - 120)]).call({ registrationId: REG }))
        .status,
    ).toBe(200);
    expect(
      (await prepare(baseTables(), student, [paid(now - 7200)]).call({ registrationId: REG }))
        .status,
    ).toBe(200);
  });

  it("refuses anything that is not a sign-up id", async () => {
    const t = prepare(baseTables(), student);
    for (const body of [{}, { registrationId: 7 }, { registrationId: "abc" }])
      expect((await t.call(body)).status).toBe(400);
  });

  it("checks the caller itself, like the other payment functions", () => {
    expect(read("supabase/config.toml")).toMatch(
      /\[functions\.create-month-payment\]\s+verify_jwt = false/,
    );
  });
});

// ---------------------------------------------------------------------------
// stripe-webhook
// ---------------------------------------------------------------------------
function webhook(
  event: Row,
  tables: Record<string, Row[]>,
  opts: Parameters<typeof fakeDb>[1] = {},
  intents: Record<string, Row> = {},
) {
  const { db, writes } = fakeDb(tables, opts);
  class FakeStripe {
    webhooks = { constructEventAsync: async () => event };
    paymentIntents = { retrieve: async (id: string) => intents[id] ?? { id } };
    checkout = { sessions: { list: async () => ({ data: [] }) } };
    invoices = {};
    setupIntents = {};
    subscriptions = {};
  }
  let handler!: (req: Request) => Promise<Response>;
  loadEdgeHandler(
    "supabase/functions/stripe-webhook/index.ts",
    {
      "https://deno.land/std@0.190.0/http/server.ts": {
        serve: (fn: typeof handler) => {
          handler = fn;
        },
      },
      "https://esm.sh/stripe@18.5.0": { default: FakeStripe },
      "https://esm.sh/@supabase/supabase-js@2.57.2": { createClient: () => db },
      "../_shared/cors.ts": { buildCorsHeaders: () => ({}) },
      "../_shared/managed-email.ts": {
        sendTemplateEmail: async () => ({ sent: true }),
      },
      "../_shared/private-series.ts": { privateLessonStarts: () => [] },
      "../_shared/group-holds.ts": { flagOverCapacity: async () => false },
    },
    { STRIPE_SECRET_KEY: "sk_test", STRIPE_WEBHOOK_SECRET: "whsec" },
  );
  return handler(
    new Request("https://example.test/stripe-webhook", {
      method: "POST",
      headers: { "stripe-signature": "sig" },
      body: "{}",
    }),
  ).then((res) => ({ status: res.status, writes }));
}

const monthIntent = {
  id: "pi_month",
  amount: 50000,
  amount_received: 50000,
  metadata: { purpose: "group_month", registration_id: REG, month: "4" },
};
const succeeded = {
  id: "evt_month",
  type: "payment_intent.succeeded",
  created: 1794736800, // 2026-11-15T10:00:00Z
  data: { object: monthIntent },
};

describe("the webhook records a month payment as that month and nothing else", () => {
  it("writes one 'Card online' month and updates only the month counters", async () => {
    const tables = baseTables();
    const out = await webhook(succeeded, tables);
    expect(out.status).toBe(200);
    const inserted = out.writes.filter((w) => w.op === "insert");
    expect(inserted).toHaveLength(1);
    expect(inserted[0]).toMatchObject({
      table: "registration_payments",
      value: {
        registration_id: REG,
        kind: "month",
        method: "card_online",
        amount_lei: 500,
        recorded_by: "stripe",
        month_from: 4,
        month_to: 4,
        stripe_ref: "pi_month",
      },
    });
    const onSignUp = out.writes.filter((w) => w.table === "registrations");
    expect(onSignUp.map((w) => w.value)).toEqual([
      { months_total: 4, months_paid: 4 },
    ]);
  });

  it("records nothing twice when Stripe sends the event again", async () => {
    const tables = baseTables();
    await webhook(succeeded, tables);
    const again = await webhook({ ...succeeded, id: "evt_again" }, tables);
    expect(again.writes.filter((w) => w.op === "insert")).toEqual([]);
    expect(
      tables["registration_payments"]!.filter((r) => r["stripe_ref"] === "pi_month"),
    ).toHaveLength(1);
  });

  it("asks Stripe to send the event again when the month could not be written", async () => {
    const out = await webhook(succeeded, baseTables(), { failInsert: true });
    expect(out.status).toBe(500);
    // The claim on the event is released, so the retry is not skipped.
    expect(
      out.writes.some((w) => w.table === "stripe_events" && w.op === "delete"),
    ).toBe(true);
  });

  it("a declined month payment leaves the sign-up as it is", async () => {
    const out = await webhook(
      { id: "evt_f", type: "payment_intent.payment_failed", data: { object: monthIntent } },
      baseTables(),
    );
    expect(out.status).toBe(200);
    expect(out.writes.filter((w) => w.table === "registrations")).toEqual([]);
  });

  it("a refunded month keeps the sign-up paid and records the amount", async () => {
    const out = await webhook(
      {
        id: "evt_r",
        type: "charge.refunded",
        created: 1794736800,
        data: {
          object: {
            id: "ch_1",
            payment_intent: "pi_month",
            amount: 50000,
            amount_refunded: 50000,
          },
        },
      },
      baseTables(),
      {},
      { pi_month: monthIntent },
    );
    expect(out.status).toBe(200);
    const w = out.writes.find((x) => x.table === "registrations")!;
    expect(w.value).toMatchObject({ refunded_amount: 50000 });
    expect(w.value).not.toHaveProperty("payment_status");
  });
});
