import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { loadEdgeHandler, loadEdgeModule } from "./helpers/edge-handler";

/**
 * Credit in the admin (owner, 14 and 16 November 2026): the owner sees every
 * credit, adds one, records a use, passes it to another person, and returns
 * what is left in money with one button. Nothing is refunded by itself and
 * nothing here writes to the student.
 *
 * These run the real admin handler with Stripe and the database stubbed.
 */
const read = (p: string) => readFileSync(resolve(process.cwd(), p), "utf8");

beforeAll(() => {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date("2026-12-01T10:00:00.000Z"));
});
afterAll(() => {
  vi.useRealTimers();
});

type Row = Record<string, unknown>;
type Write = { table: string; op: string; value?: Row; filters: string[] };

function fakeDb(tables: Record<string, Row[]>, admin = true) {
  const writes: Write[] = [];
  let seq = 0;
  const from = (table: string) => {
    const filters: Array<[string, unknown]> = [];
    let op = "select";
    let value: Row | undefined;
    let embed = false;
    const rows = () =>
      (tables[table] ?? [])
        .filter((r) => filters.every(([k, v]) => r[k] === v))
        .map((r) =>
          embed
            ? {
                ...r,
                student_credit_uses: (
                  tables["student_credit_uses"] ?? []
                ).filter((u) => u["credit_id"] === r["id"]),
              }
            : r,
        );
    const result = async () => {
      const tags = filters.map(([k, v]) => `${k}=${v}`);
      if (op === "insert") {
        const row = { id: `${table}-${++seq}`, ...value! };
        (tables[table] ??= []).push(row);
        writes.push({ table, op, value: row, filters: tags });
        return { data: [row], error: null };
      }
      if (op === "delete") {
        tables[table] = (tables[table] ?? []).filter(
          (r) => !filters.every(([k, v]) => r[k] === v),
        );
        writes.push({ table, op, filters: tags });
        return { data: null, error: null };
      }
      return { data: rows(), error: null };
    };
    const one = async () => {
      const r = await result();
      return {
        data: Array.isArray(r.data) ? (r.data[0] ?? null) : r.data,
        error: r.error,
      };
    };
    const q: any = {
      select: (cols?: string) => {
        if (cols?.includes("student_credit_uses(")) embed = true;
        return q;
      },
      insert: (v: Row) => ((op = "insert"), (value = v), q),
      delete: () => ((op = "delete"), q),
      eq: (k: string, v: unknown) => (filters.push([k, v]), q),
      order: () => q,
      maybeSingle: one,
      single: one,
      then: (ok: (v: unknown) => void, bad: (e: unknown) => void) =>
        result().then(ok, bad),
    };
    return q;
  };
  const auth = {
    getUser: async () => ({
      data: {
        user: admin
          ? { email: "owner@example.test", email_confirmed_at: "2026-01-01" }
          : { email: "someone@example.test", email_confirmed_at: "2026-01-01" },
      },
    }),
  };
  return { db: { from, auth }, writes, tables };
}

const CREDIT = "c1";
const baseTables = (): Record<string, Row[]> => ({
  registrations: [
    {
      id: "reg-new",
      name: "Ana Exemplu",
      email: "Ana@Example.test",
      student_id: "st-1",
      created_at: "2026-11-20T09:00:00.000Z",
      anonymized_at: null,
    },
    {
      id: "reg-old",
      name: "Dan Exemplu",
      email: "dan@example.test",
      student_id: "st-2",
      created_at: "2026-10-01T09:00:00.000Z",
      anonymized_at: null,
    },
  ],
  student_credits: [
    {
      id: CREDIT,
      student_id: "st-1",
      registration_id: "reg-new",
      holder_name: "Ana Exemplu",
      holder_email: "ana@example.test",
      amount_lei: 312.5,
      origin: "5 lecții neținute din luna în curs (abonament anulat)",
      created_at: "2026-11-25T10:00:00.000Z",
      expires_at: "2027-05-25T10:00:00.000Z",
      refund_at_expiry: true,
      stripe_payment_id: "pi_month",
      reminder_sent_at: null,
    },
  ],
  student_credit_uses: [],
  audit_logs: [],
});

function admin(
  tables: Record<string, Row[]>,
  opts: { isAdmin?: boolean; refundedBefore?: number; feeBani?: number } = {},
) {
  const { db, writes } = fakeDb(tables, opts.isAdmin !== false);
  const refunds: Array<{ params: Row; options: Row }> = [];
  const stripeCalls: string[] = [];
  class FakeStripe {
    paymentIntents = {
      retrieve: async () => {
        stripeCalls.push("pi.retrieve");
        return {
          amount_received: 50_000,
          amount_refunded: opts.refundedBefore ?? 0,
          latest_charge: { balance_transaction: { fee: opts.feeBani ?? 900 } },
        };
      },
    };
    refunds = {
      create: async (params: Row, options: Row) => {
        refunds.push({ params, options });
        return { id: "re_1" };
      },
    };
  }
  const real = (name: string) =>
    loadEdgeModule(`supabase/functions/_shared/${name}.ts`, {});
  const handler = loadEdgeHandler(
    "supabase/functions/admin-registrations/index.ts",
    {
      "https://esm.sh/@supabase/supabase-js@2": { createClient: () => db },
      "https://esm.sh/stripe@18.5.0": { default: FakeStripe },
      "../_shared/cors.ts": { buildCorsHeaders: () => ({}) },
      "../_shared/booking.ts": {},
      "../_shared/calendar-reconciliation.ts": {},
      "../_shared/cohort-sessions.ts": {},
      // The real rules: which Terms a sign-up is under, and money as text.
      "../_shared/refund.ts": real("refund"),
      "../_shared/prices.ts": real("prices"),
      "../_shared/managed-email.ts": {
        sendTemplateEmail: async () => {
          throw new Error("credit must not email anyone");
        },
      },
      "../_shared/registration-access.ts": {},
    },
    { ADMIN_EMAILS: "owner@example.test", STRIPE_SECRET_KEY: "sk_test" },
  );
  const call = async (body: unknown) => {
    const res = await handler(
      new Request("https://example.test/admin", {
        method: "POST",
        headers: {
          Authorization: "Bearer test-admin",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }),
    );
    return { status: res.status, body: (await res.json()) as Row };
  };
  return { call, writes, refunds, stripeCalls, tables };
}
const inserted = (writes: Write[], table: string) =>
  writes
    .filter((w) => w.table === table && w.op === "insert")
    .map((w) => w.value!);

describe("seeing and adding credit", () => {
  it("lists every credit with what is left and when it ends", async () => {
    const tables = baseTables();
    tables["student_credit_uses"]!.push({
      id: "u1",
      credit_id: CREDIT,
      kind: "private",
      amount_lei: 150,
    });
    const out = await admin(tables).call({ action: "list_credits" });
    const [c] = out.body["data"] as Row[];
    expect(c).toMatchObject({
      id: CREDIT,
      holder_name: "Ana Exemplu",
      state: {
        amountLei: 312.5,
        usedLei: 150,
        remainingLei: 162.5,
        status: "active",
      },
    });
    expect((c!["uses"] as Row[]).length).toBe(1);
  });

  it("adds a credit to a sign-up: its student, six months, the Terms it is under", async () => {
    const t = admin(baseTables());
    const out = await t.call({
      action: "add_credit",
      registration_id: "reg-new",
      amount_lei: 187.5,
      origin: "3 lecții neținute din luna 2",
    });
    expect(out.body).toMatchObject({ success: true });
    const [row] = inserted(t.writes, "student_credits");
    expect(row).toMatchObject({
      student_id: "st-1",
      registration_id: "reg-new",
      holder_name: "Ana Exemplu",
      holder_email: "ana@example.test",
      amount_lei: 187.5,
      created_at: "2026-12-01T10:00:00.000Z",
      expires_at: "2027-06-01T10:00:00.000Z",
      refund_at_expiry: true,
      created_by: "owner@example.test",
    });
    // A sign-up from before the new Terms: its credit simply ends.
    const old = admin(baseTables());
    await old.call({
      action: "add_credit",
      registration_id: "reg-old",
      amount_lei: 100,
      origin: "lecții neținute",
    });
    expect(inserted(old.writes, "student_credits")[0]).toMatchObject({
      refund_at_expiry: false,
    });
  });

  it("asks for an amount, where it comes from and whose it is", async () => {
    const t = admin(baseTables());
    for (const body of [
      { amount_lei: 0, origin: "x", holder_name: "Ana" },
      { amount_lei: 100, origin: "", holder_name: "Ana" },
      { amount_lei: 100, origin: "x" },
      {
        amount_lei: 100,
        origin: "x",
        holder_name: "Ana",
        given_on: "2027-03-01",
      },
    ])
      expect((await t.call({ action: "add_credit", ...body })).status).toBe(
        400,
      );
    expect(inserted(t.writes, "student_credits")).toEqual([]);
  });
});

describe("using credit", () => {
  it("records a use and refuses more than what is left", async () => {
    const t = admin(baseTables());
    expect(
      (
        await t.call({
          action: "use_credit",
          credit_id: CREDIT,
          kind: "private",
          amount_lei: 300,
        })
      ).body,
    ).toMatchObject({ success: true });
    expect(inserted(t.writes, "student_credit_uses")[0]).toMatchObject({
      credit_id: CREDIT,
      kind: "private",
      amount_lei: 300,
      recorded_by: "owner@example.test",
    });
    const more = await t.call({
      action: "use_credit",
      credit_id: CREDIT,
      kind: "group",
      amount_lei: 50,
    });
    expect(more.status).toBe(400);
    expect(String(more.body["error"])).toContain("12.5");
  });

  it("an expired credit can no longer pay for anything", async () => {
    const tables = baseTables();
    tables["student_credits"]![0]!["expires_at"] = "2026-11-30T10:00:00.000Z";
    const t = admin(tables);
    for (const action of ["use_credit", "transfer_credit"])
      expect(
        (
          await t.call({
            action,
            credit_id: CREDIT,
            amount_lei: 100,
            to_name: "Maria Exemplu",
          })
        ).status,
      ).toBe(400);
    expect(inserted(t.writes, "student_credit_uses")).toEqual([]);
  });

  it("passes credit to another person with the same last day, never a longer one", async () => {
    const t = admin(baseTables());
    const out = await t.call({
      action: "transfer_credit",
      credit_id: CREDIT,
      amount_lei: 200,
      to_name: "Maria Exemplu",
      to_email: "Maria@Example.test",
    });
    expect(out.body).toMatchObject({ success: true });
    expect(inserted(t.writes, "student_credits")[0]).toMatchObject({
      holder_name: "Maria Exemplu",
      holder_email: "maria@example.test",
      student_id: null,
      amount_lei: 200,
      origin: "Transfer de la Ana Exemplu",
      expires_at: "2027-05-25T10:00:00.000Z",
      refund_at_expiry: true,
      stripe_payment_id: "pi_month",
    });
    expect(inserted(t.writes, "student_credit_uses")[0]).toMatchObject({
      credit_id: CREDIT,
      kind: "transfer",
      amount_lei: 200,
      note: "Către Maria Exemplu",
    });
  });
});

describe("refund now", () => {
  it("shows the sum first and writes nothing", async () => {
    const t = admin(baseTables());
    const out = await t.call({
      action: "preview_refund_credit",
      credit_id: CREDIT,
    });
    expect(out.body["data"]).toMatchObject({
      remaining_bani: 31_250,
      fee_bani: 900,
      refund_bani: 30_350,
      by_hand: false,
    });
    expect(t.refunds).toEqual([]);
    expect(t.writes).toEqual([]);
  });

  it("returns what is left to the same card, minus the Stripe fee, and closes the credit", async () => {
    const t = admin(baseTables());
    const out = await t.call({ action: "refund_credit", credit_id: CREDIT });
    expect(out.body).toMatchObject({ success: true });
    expect(t.refunds).toEqual([
      {
        params: { payment_intent: "pi_month", amount: 30_350 },
        options: { idempotencyKey: `credit_refund_${CREDIT}` },
      },
    ]);
    const [use] = inserted(t.writes, "student_credit_uses");
    expect(use).toMatchObject({
      credit_id: CREDIT,
      kind: "refund",
      amount_lei: 312.5,
      refund_ref: "re_1",
    });
    expect(String(use!["note"])).toContain("Returnat pe card");
    // Nothing is left, so a second press returns nothing more.
    const again = await t.call({ action: "refund_credit", credit_id: CREDIT });
    expect(again.status).toBe(400);
    expect(t.refunds).toHaveLength(1);
  });

  it("keeps the Stripe fee once per card payment, not twice", async () => {
    const t = admin(baseTables(), { refundedBefore: 10_000 });
    const out = await t.call({
      action: "preview_refund_credit",
      credit_id: CREDIT,
    });
    expect(out.body["data"]).toMatchObject({
      fee_bani: 0,
      refund_bani: 31_250,
    });
  });

  it("without a card payment the owner returns it by hand and records that", async () => {
    const tables = baseTables();
    tables["student_credits"]![0]!["stripe_payment_id"] = null;
    const t = admin(tables);
    const out = await t.call({
      action: "refund_credit",
      credit_id: CREDIT,
      note: "transfer bancar",
    });
    expect(out.body).toMatchObject({ success: true, data: { by_hand: true } });
    expect(t.stripeCalls).toEqual([]);
    expect(t.refunds).toEqual([]);
    const [use] = inserted(t.writes, "student_credit_uses");
    expect(use).toMatchObject({
      kind: "refund",
      amount_lei: 312.5,
      refund_ref: null,
    });
    expect(String(use!["note"])).toContain("Returnat manual");
  });

  it("is the owner's alone", async () => {
    const t = admin(baseTables(), { isAdmin: false });
    for (const action of [
      "list_credits",
      "add_credit",
      "use_credit",
      "refund_credit",
    ])
      expect((await t.call({ action, credit_id: CREDIT })).body).toEqual({
        error: "Neautorizat",
      });
    expect(t.writes).toEqual([]);
    expect(t.refunds).toEqual([]);
  });
});

describe("credit left by a cancellation", () => {
  const handler = read("supabase/functions/admin-registrations/index.ts");

  it("goes on the student's credit by itself, for both ways of paying", () => {
    // Paid in full: the rest of the month in progress.
    expect(handler).toContain("amountBani: breakdown.creditBani,");
    expect(
      handler.match(/await recordCancellationCredit\(supabase, \{/g)?.length,
    ).toBe(2);
    // Monthly: only when the rule gave credit, tied to the month's payment.
    expect(handler).toMatch(
      /breakdown\.case === "credit"\s+\? await recordCancellationCredit/,
    );
    expect(handler).toContain(
      "stripePaymentId: latestCharge?.paymentId ?? null",
    );
    expect(handler).toContain("stripePaymentId: paymentIntentId");
  });

  it("is written once per sign-up, lasts six months, and never undoes the cancellation", () => {
    const fn = handler.slice(
      handler.indexOf("async function recordCancellationCredit("),
      handler.indexOf("Deno.serve(async (req) => {"),
    );
    expect(fn).toContain('.eq("note", CANCELLATION_CREDIT_NOTE)');
    expect(fn).toContain("if (existing) return existing.id as string;");
    expect(fn).toContain("expires_at: creditExpiry(now)");
    expect(fn).toContain("refund_at_expiry: underNewRefundRules(");
    expect(fn).toMatch(/catch \(e\) \{[\s\S]*return null;/);
  });

  it("no longer asks the owner to note it somewhere else", () => {
    const ui = read("src/components/admin/RegistrationsTable.tsx");
    expect(ui).not.toContain("Notează-l");
    expect(ui.match(/Se trece singur la Cursanți › Credite\./g)?.length).toBe(
      2,
    );
  });
});
