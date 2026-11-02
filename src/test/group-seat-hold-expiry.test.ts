import { readFileSync } from "node:fs";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Owner, 2 Nov 2026: a group payment started and not finished holds its seat
// for 2 hours. 15 minutes in, one "finish your payment" email with the link
// and the exact deadline; at the deadline the Stripe payment is closed, the
// registration becomes "expired" (kept, "Expirat" in admin) and one short
// "seat released" email goes out. A late payment is accepted and, if the
// group filled up meanwhile, the owner is told; nothing is refunded.

const sent: Array<{ template: string; to: string; data: any }> = [];
vi.mock("../../supabase/functions/_shared/managed-email.ts", () => ({
  sendTemplateEmail: async (
    template: string,
    to: string,
    opts: { templateData?: unknown },
  ) => {
    sent.push({ template, to, data: opts.templateData });
    return { sent: true };
  },
}));

// Loaded by a path the type check does not follow: the module pulls in the
// Deno email templates (npm: imports), which only Deno can type-check.
const groupHoldsPath = "../../supabase/functions/_shared/group-holds";
const { processGroupHolds, flagOverCapacity, formatDeadline } =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (await import(/* @vite-ignore */ groupHoldsPath)) as any;

type Row = Record<string, any>;

/** Enough of the Supabase query builder for group-holds.ts. */
function fakeDb(
  tables: Record<string, Row[]>,
  rpc: Record<string, unknown> = {},
) {
  const writes: Array<{ table: string; op: string; payload: unknown }> = [];
  const from = (table: string) => {
    let rows = [...(tables[table] ?? [])];
    let pendingUpdate: Row | null = null;
    const q: any = {
      select: () => q,
      eq: (k: string, v: unknown) => {
        rows = rows.filter((r) => r[k] === v);
        return q;
      },
      is: (k: string, v: unknown) => {
        rows = rows.filter((r) => (r[k] ?? null) === v);
        return q;
      },
      in: (k: string, vs: unknown[]) => {
        rows = rows.filter((r) => vs.includes(r[k]));
        return q;
      },
      not: (k: string, _op: string, list: string) => {
        const vals = list.replace(/[()"]/g, "").split(",");
        rows = rows.filter((r) => !vals.includes(r[k]));
        return q;
      },
      gt: (k: string, v: string) => {
        rows = rows.filter((r) => r[k] > v);
        return q;
      },
      lte: (k: string, v: string) => {
        rows = rows.filter((r) => r[k] <= v);
        return q;
      },
      maybeSingle: async () => ({ data: rows[0] ?? null, error: null }),
      update: (payload: Row) => {
        pendingUpdate = payload;
        return q;
      },
      insert: async (payload: unknown) => {
        writes.push({ table, op: "insert", payload });
        return { error: null };
      },
      then: (resolve: (v: unknown) => void) => {
        if (pendingUpdate) {
          for (const r of rows) Object.assign(r, pendingUpdate);
          writes.push({ table, op: "update", payload: pendingUpdate });
        }
        resolve({ data: rows, error: null });
      },
    };
    return q;
  };
  return {
    from,
    rpc: async (name: string) => ({ data: rpc[name] ?? null, error: null }),
    writes,
  };
}

function fakeStripe(intentStatus: string) {
  const calls: string[] = [];
  return {
    calls,
    paymentIntents: {
      retrieve: async () => ({ status: intentStatus }),
      cancel: async (id: string) => {
        calls.push(`cancel ${id}`);
      },
    },
    checkout: { sessions: {} },
    subscriptions: {},
  };
}

const now = new Date("2026-11-03T10:00:00Z");
const cohort = {
  id: "c7",
  level: "A1",
  format: "online",
  teaching_language: "ro",
  start_date: "2026-11-07",
  max_seats: 6,
};
const base = {
  form_type: "group",
  payment_status: "pending",
  lead_status: "new",
  anonymized_at: null,
  hold_reminder_sent_at: null,
  hold_released_at: null,
  cohort_id: "c7",
  plan: "monthly",
  name: "Ana",
  email: "ana@example.test",
  contact_email: null,
  language: "ro",
  stripe_session_id: "pi_1",
  stripe_subscription_id: null,
};

beforeEach(() => {
  sent.length = 0;
});

describe("group seat hold: reminder and release", () => {
  it("emails the finish-payment link with the deadline once 15 minutes have passed", async () => {
    const reg = {
      ...base,
      id: "r1",
      // Started 20 minutes ago: 100 minutes left.
      seat_hold_until: "2026-11-03T11:40:00.000Z",
    };
    const fresh = {
      ...base,
      id: "r2",
      // Started 5 minutes ago: not yet.
      seat_hold_until: "2026-11-03T11:55:00.000Z",
    };
    const db = fakeDb({ registrations: [reg, fresh], group_cohorts: [cohort] });
    const out = await processGroupHolds(
      db,
      fakeStripe("requires_payment_method"),
      now,
    );
    expect(out.reminded).toBe(1);
    expect(sent).toHaveLength(1);
    expect(sent[0]).toMatchObject({
      template: "group-seat-hold",
      to: "ana@example.test",
    });
    expect(sent[0]!.data).toMatchObject({
      kind: "reminder",
      lang: "ro",
      deadline: formatDeadline("2026-11-03T11:40:00.000Z", "ro"),
    });
    expect(sent[0]!.data.deadline).toContain("13:40");
    expect(sent[0]!.data.url).toContain("registrationId=r1");
    expect(sent[0]!.data.group).toContain("A1 online");
    expect(reg).toHaveProperty("hold_reminder_sent_at", now.toISOString());
  });

  it("at the deadline closes the Stripe payment, marks it expired and says the seat was released", async () => {
    const reg = {
      ...base,
      id: "r1",
      language: "en",
      seat_hold_until: "2026-11-03T09:59:00.000Z",
    };
    const db = fakeDb({ registrations: [reg], group_cohorts: [cohort] });
    const stripe = fakeStripe("requires_payment_method");
    const out = await processGroupHolds(db, stripe, now);
    expect(out.released).toBe(1);
    expect(stripe.calls).toEqual(["cancel pi_1"]);
    expect(reg.payment_status).toBe("expired");
    expect(sent).toHaveLength(1);
    expect(sent[0]!.data).toMatchObject({ kind: "released", lang: "en" });
    expect(sent[0]!.data.url).toContain("/en/courses/group");
  });

  it("leaves a payment Stripe already took to the webhook", async () => {
    const reg = {
      ...base,
      id: "r1",
      seat_hold_until: "2026-11-03T09:59:00.000Z",
    };
    const db = fakeDb({ registrations: [reg], group_cohorts: [cohort] });
    const out = await processGroupHolds(db, fakeStripe("succeeded"), now);
    expect(out).toMatchObject({ released: 0, kept: 1 });
    expect(reg.payment_status).toBe("pending");
    expect(sent).toHaveLength(0);
  });

  it("never touches someone the owner added or accepted", async () => {
    const reg = {
      ...base,
      id: "r1",
      lead_status: "converted",
      seat_hold_until: "2026-11-03T09:59:00.000Z",
    };
    const db = fakeDb({ registrations: [reg], group_cohorts: [cohort] });
    const out = await processGroupHolds(
      db,
      fakeStripe("requires_payment_method"),
      now,
    );
    expect(out).toMatchObject({ released: 0, reminded: 0 });
    expect(reg.payment_status).toBe("pending");
  });
});

describe("late payment into a full group", () => {
  it("is flagged and the owner is emailed; nothing is refunded", async () => {
    const db = fakeDb(
      {
        registrations: [
          { id: "r1", name: "Ana", cohort_id: "c7", form_type: "group" },
        ],
        group_cohorts: [cohort],
      },
      { cohort_seats_taken: 7 },
    );
    expect(await flagOverCapacity(db, "r1")).toBe(true);
    expect(sent[0]).toMatchObject({
      template: "admin-group-over-capacity",
      to: "marhaba@centruldearabalibaneza.com",
    });
    expect(sent[0]!.data).toMatchObject({ taken: 7, maxSeats: 6 });
    expect(db.writes).toContainEqual(
      expect.objectContaining({ table: "audit_logs", op: "insert" }),
    );
  });

  it("says nothing while the group has room", async () => {
    const db = fakeDb(
      {
        registrations: [
          { id: "r1", name: "Ana", cohort_id: "c7", form_type: "group" },
        ],
        group_cohorts: [cohort],
      },
      { cohort_seats_taken: 6 },
    );
    expect(await flagOverCapacity(db, "r1")).toBe(false);
    expect(sent).toHaveLength(0);
  });
});

describe("wiring", () => {
  const read = (p: string) => readFileSync(p, "utf8");
  const migration = read(
    "supabase/migrations/20261103090000_group_seat_hold_two_hours.sql",
  );

  it("counts paid, free, added or accepted, manual numbers and live holds; never cancelled or refunded", () => {
    expect(migration).toContain("r.canceled_at is null");
    expect(migration).toContain("coalesce(r.payment_status, '') <> 'refunded'");
    expect(migration).toContain("r.payment_status in ('paid', 'free')");
    expect(migration).toContain("r.lead_status in ('qualified', 'converted')");
    expect(migration).toContain("r.seat_hold_until > now()");
  });

  it("holds 2 hours and does not move the deadline when the page is reopened", () => {
    expect(migration).toContain("p_minutes integer default 120");
    expect(migration).toContain(
      "if r.seat_hold_until > now() then return true; end if;",
    );
  });

  it("runs from the 15-minute reminders job and the webhook flags late payments", () => {
    expect(read("supabase/functions/booking-reminders/index.ts")).toContain(
      "await processGroupHolds(",
    );
    const hook = read("supabase/functions/stripe-webhook/index.ts");
    expect(hook.match(/await flagOverCapacity\(/g)?.length).toBe(3);
  });

  it("the hosted Stripe page closes with the hold", () => {
    const cs = read("supabase/functions/create-checkout-session/index.ts");
    expect(cs).toContain("expires_at: groupExpiresAt");
    expect(cs.match(/\.\.\.expiryFields,/g)?.length).toBe(2);
  });
});
