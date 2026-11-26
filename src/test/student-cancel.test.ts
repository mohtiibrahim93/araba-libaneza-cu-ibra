import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { loadEdgeHandler, loadEdgeModule } from "./helpers/edge-handler";

/**
 * Withdrawing or cancelling from "Contul meu" (owner, 17 Nov 2026: "the
 * cancel button if they want to cancel yes"), end to end on the server:
 * student-cancel, with the database, Stripe and the email sender stubbed.
 */
const read = (p: string) => readFileSync(resolve(process.cwd(), p), "utf8");

type Row = Record<string, unknown>;
type Write = { table: string; op: string; value?: unknown; filters: string[] };

function fakeDb(
  tables: Record<string, Row[]>,
  user: { email: string } | null,
  failRead?: string,
) {
  const writes: Write[] = [];
  let ids = 0;
  const from = (table: string) => {
    const tests: Array<(r: Row) => boolean> = [];
    const tags: string[] = [];
    let op = "select";
    let value: Row | undefined;
    let returning = false;
    const rows = () =>
      (tables[table] ?? []).filter((r) => tests.every((t) => t(r)));
    const run = async (): Promise<{ data: unknown; error: unknown }> => {
      if (op === "select" && failRead === table)
        return { data: null, error: { message: "read failed" } };
      if (op === "insert") {
        const row: Row = {
          id: `q${++ids}`,
          requested_at: new Date().toISOString(),
          handled_at: null,
          ...value,
        };
        // The unique index: one open request per sign-up.
        if (
          table === "cancellation_requests" &&
          (tables[table] ?? []).some(
            (r) =>
              r["registration_id"] === row["registration_id"] &&
              r["handled_at"] == null,
          )
        )
          return { data: null, error: { code: "23505", message: "dup" } };
        (tables[table] ??= []).push(row);
        writes.push({ table, op, value, filters: tags });
        return { data: returning ? row : null, error: null };
      }
      if (op === "update") {
        for (const r of rows()) Object.assign(r, value);
        writes.push({ table, op, value, filters: tags });
        return { data: null, error: null };
      }
      return { data: rows(), error: null };
    };
    const q: any = {
      select: () => ((returning = true), q),
      insert: (v: Row) => ((op = "insert"), (value = v), q),
      update: (v: Row) => ((op = "update"), (value = v), q),
      eq: (k: string, v: unknown) => (
        tags.push(`${k}=${v}`),
        tests.push((r) => r[k] === v),
        q
      ),
      is: (k: string, v: unknown) => (
        tags.push(`${k} is ${v}`),
        tests.push((r) => (r[k] ?? null) === v),
        q
      ),
      in: (k: string, v: unknown[]) => (tests.push((r) => v.includes(r[k])), q),
      gt: (k: string, v: string) => (tests.push((r) => String(r[k]) > v), q),
      order: () => q,
      limit: () => q,
      single: async () => {
        const r = await run();
        return {
          data: Array.isArray(r.data) ? (r.data[0] ?? null) : r.data,
          error: r.error,
        };
      },
      maybeSingle: async () => {
        const r = await run();
        return {
          data: Array.isArray(r.data) ? (r.data[0] ?? null) : r.data,
          error: r.error,
        };
      },
      then: (ok: (v: unknown) => void, bad: (e: unknown) => void) =>
        run().then(ok, bad),
    };
    return q;
  };
  const auth = {
    getUser: async () => ({
      data: {
        user: user
          ? {
              email: user.email,
              email_confirmed_at: "2026-11-01T00:00:00Z",
              is_anonymous: false,
            }
          : null,
      },
      error: user ? null : { message: "no session" },
    }),
  };
  return { db: { from, auth }, writes };
}

const REG = "11111111-2222-4333-8444-555555555555";
/** Two lessons a week (Mon, Wed), 32 of them, from Monday 7 Sep 2026. */
function lessons(first: string, n: number): string[] {
  const out: string[] = [];
  let t = Date.parse(`${first}T16:00:00.000Z`);
  for (let i = 0; i < n; i++) {
    out.push(new Date(t).toISOString());
    t += (i % 2 === 0 ? 2 : 5) * 86_400_000;
  }
  return out;
}
const SESSIONS = lessons("2026-09-07", 32);

const tables = (over: Row = {}): Record<string, Row[]> => ({
  registrations: [
    {
      id: REG,
      form_type: "group",
      email: "student@example.test",
      name: "Ana Exemplu",
      phone: "+40700000000",
      level: "A1",
      format: "online",
      cohort_id: "c1",
      months_total: 4,
      created_at: "2026-09-01T10:00:00.000Z",
      canceled_at: null,
      early_start_requested_at: null,
      stripe_subscription_id: null,
      subscription_status: null,
      anonymized_at: null,
      ...over,
    },
  ],
  group_cohorts: [
    {
      id: "c1",
      form_type: "group",
      status: "in_progress",
      level: "A1",
      format: "online",
      start_date: "2026-09-07",
      title_ro: null,
      title_en: null,
      schedule_label_ro: "Luni și miercuri la 19:00",
      schedule_label_en: null,
    },
    {
      id: "c2",
      form_type: "group",
      status: "forming",
      level: "A1",
      format: "online",
      start_date: "2027-01-09",
      title_ro: null,
      title_en: null,
      schedule_label_ro: "Sâmbătă și duminică la 12:00",
      schedule_label_en: null,
    },
    // Full, another level, or over: not offered.
    {
      id: "c3",
      form_type: "group",
      status: "full",
      level: "A1",
      start_date: "2027-02-01",
    },
    {
      id: "c4",
      form_type: "group",
      status: "forming",
      level: "A2",
      start_date: "2027-01-10",
    },
    {
      id: "c5",
      form_type: "group",
      status: "completed",
      level: "A1",
      start_date: "2027-01-11",
    },
  ],
  registration_payments: [
    {
      registration_id: REG,
      kind: "month",
      method: "transfer",
      amount_lei: 1500,
      paid_at: "2026-09-01T10:00:00.000Z",
      month_from: 1,
      month_to: 3,
    },
  ],
  cohort_sessions: SESSIONS.map((starts_at) => ({
    cohort_id: "c1",
    starts_at,
  })),
  cancellation_requests: [],
  audit_logs: [],
});

function setup(
  t: Record<string, Row[]>,
  opts: {
    user?: { email: string } | null;
    failAck?: boolean;
    failRead?: string;
  } = {},
) {
  const { db, writes } = fakeDb(
    t,
    opts.user === undefined ? { email: "Student@Example.test" } : opts.user,
    opts.failRead,
  );
  const emails: unknown[][] = [];
  const stripeCalls: unknown[][] = [];
  class FakeStripe {
    subscriptions = {
      update: async (...a: unknown[]) => (stripeCalls.push(a), {}),
    };
  }
  let handler!: (req: Request) => Promise<Response>;
  loadEdgeHandler(
    "supabase/functions/student-cancel/index.ts",
    {
      "https://deno.land/std@0.190.0/http/server.ts": {
        serve: (fn: typeof handler) => {
          handler = fn;
        },
      },
      "https://esm.sh/stripe@18.5.0": { default: FakeStripe },
      "https://esm.sh/@supabase/supabase-js@2": { createClient: () => db },
      "../_shared/cors.ts": { buildCorsHeaders: () => ({}) },
      "../_shared/rate-limit.ts": { checkRateLimit: async () => true },
      "../_shared/managed-email.ts": {
        sendTemplateEmail: async (...a: unknown[]) => {
          if (opts.failAck && a[0] === "cancel-request-received")
            throw new Error("mail down");
          emails.push(a);
          return { sent: true };
        },
      },
      // The real ownership check and the real rules, not stubs.
      "../_shared/verified-registration-owner.ts": loadEdgeModule(
        "supabase/functions/_shared/verified-registration-owner.ts",
        {},
      ),
      "../_shared/prices.ts": loadEdgeModule(
        "supabase/functions/_shared/prices.ts",
        {},
      ),
      "../_shared/cancel-request.ts": loadEdgeModule(
        "supabase/functions/_shared/cancel-request.ts",
        {},
      ),
    },
    { STRIPE_SECRET_KEY: "sk_test" },
  );
  const call = async (body: Row, signedIn = true) => {
    const res = await handler(
      new Request("https://example.test/student-cancel", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          ...(signedIn ? { authorization: "Bearer token" } : {}),
        },
        body: JSON.stringify({ registrationId: REG, ...body }),
      }),
    );
    return { status: res.status, body: (await res.json()) as any };
  };
  return { call, writes, emails, stripeCalls, tables: t };
}

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["Date"] });
  // Lesson 11 held (month 2, its third lesson), lesson 12 not yet.
  vi.setSystemTime(new Date(Date.parse(SESSIONS[10]!) + 3_600_000));
});
afterEach(() => {
  vi.useRealTimers();
});

describe("what the student sees before confirming", () => {
  it("a running group after the 14 days: the cancel button, the refund by the Terms, groups to move to", async () => {
    const { call, writes } = setup(tables());
    const { status, body } = await call({ action: "preview" });
    expect(status).toBe(200);
    expect(body.options).toEqual({ withdrawalUntil: null, cancel: true });
    expect(body.statement).toBe(
      "Anulez locul meu la „Curs de grup A1 · online”, la care m-am înscris pe 1 septembrie 2026.",
    );
    expect(body.preview).toMatchObject({
      case: "after_test_lessons",
      currentMonth: 2,
      creditLei: 312.5,
      backLei: 500,
      certain: true,
    });
    expect(body.groups.map((g: Row) => g["id"])).toEqual(["c2"]);
    expect(body.email).toBe("student@example.test");
    expect(writes).toEqual([]);
  });

  it("nobody else's sign-up, and not without signing in", async () => {
    expect(
      (
        await setup(tables(), { user: { email: "other@example.test" } }).call({
          action: "preview",
        })
      ).status,
    ).toBe(404);
    expect(
      (await setup(tables()).call({ action: "preview" }, false)).status,
    ).toBe(404);
  });
});

describe("sending it", () => {
  it("records the cancellation with the database's time and what was shown, then emails both", async () => {
    const s = setup(tables());
    const { status, body } = await s.call({
      action: "request",
      kind: "cancellation",
      confirm: true,
      name: "Ana E.",
    });
    expect(status).toBe(200);
    expect(body.acknowledged).toBe(true);
    const saved = s.tables["cancellation_requests"]![0]!;
    expect(saved).toMatchObject({
      registration_id: REG,
      kind: "cancellation",
      email: "student@example.test",
      name: "Ana E.",
      statement:
        "Anulez locul meu la „Curs de grup A1 · online”, la care m-am înscris pe 1 septembrie 2026.",
      target_cohort_id: null,
    });
    expect(saved["shown"]).toMatchObject({ creditLei: 312.5, backLei: 500 });
    expect(body.request.requestedAt).toBe(saved["requested_at"]);
    // The acknowledgement repeats the statement with its date and time.
    const [ack, owner] = s.emails;
    expect(ack![0]).toBe("cancel-request-received");
    expect(ack![1]).toBe("student@example.test");
    expect((ack![2] as Row)["idempotencyKey"]).toBe(
      `cancel-request-${saved["id"]}`,
    );
    expect((ack![2] as any).templateData).toMatchObject({
      kind: "cancellation",
      statement: saved["statement"],
      when: expect.stringMatching(
        /^\d{1,2} \S+ 2026, ora \d\d:\d\d \(ora României\)$/,
      ),
    });
    expect(owner![0]).toBe("admin-cancel-request");
    expect(owner![1]).toBe("marhaba@centruldearabalibaneza.com");
    expect(saved["acknowledged_at"]).toEqual(expect.any(String));
    expect(saved["owner_notified_at"]).toEqual(expect.any(String));
    expect(s.tables["audit_logs"]![0]).toMatchObject({
      action: "student_cancellation_request",
      registration_id: REG,
    });
    // Nothing touched the sign-up or the money.
    expect(
      s.writes.filter(
        (w) => w.table !== "cancellation_requests" && w.table !== "audit_logs",
      ),
    ).toEqual([]);
  });

  it("only a press of the confirm button counts, and a second press sends nothing new", async () => {
    const s = setup(tables());
    expect(
      (await s.call({ action: "request", kind: "cancellation" })).status,
    ).toBe(400);
    await s.call({ action: "request", kind: "cancellation", confirm: true });
    const again = await s.call({
      action: "request",
      kind: "cancellation",
      confirm: true,
    });
    expect(again.body.already).toBe(true);
    expect(s.tables["cancellation_requests"]).toHaveLength(1);
    expect(s.emails).toHaveLength(2);
  });

  it("the withdrawal is only for the 14 days under the new rules", async () => {
    const s = setup(tables());
    expect(
      (await s.call({ action: "request", kind: "withdrawal", confirm: true }))
        .status,
    ).toBe(409);
  });

  it("within the 14 days: the withdrawal, and a card subscription stops charging", async () => {
    vi.setSystemTime(new Date("2026-11-25T10:00:00.000Z"));
    const s = setup(
      tables({
        created_at: "2026-11-20T10:00:00.000Z",
        stripe_subscription_id: "sub_123",
        subscription_status: "active",
      }),
    );
    const preview = await s.call({ action: "preview" });
    expect(preview.body.options).toEqual({
      withdrawalUntil: "2026-12-04",
      cancel: false,
    });
    expect(preview.body.statement).toBe(
      "Mă retrag din contractul pentru „Curs de grup A1 · online”, încheiat pe 20 noiembrie 2026.",
    );
    const { status } = await s.call({
      action: "request",
      kind: "withdrawal",
      confirm: true,
    });
    expect(status).toBe(200);
    expect(s.stripeCalls).toEqual([
      ["sub_123", { cancel_at_period_end: true }],
    ]);
    expect(
      s.tables["cancellation_requests"]![0]!["subscription_stopped_at"],
    ).toEqual(expect.any(String));
    // A cancellation is not offered inside the 14 days.
    expect(
      (
        await setup(tables({ created_at: "2026-11-20T10:00:00.000Z" })).call({
          action: "request",
          kind: "cancellation",
          confirm: true,
        })
      ).status,
    ).toBe(409);
  });

  it("a move only to a group offered, and without promising money", async () => {
    const s = setup(tables());
    expect(
      (
        await s.call({
          action: "request",
          kind: "transfer",
          confirm: true,
          targetCohortId: "c3",
        })
      ).status,
    ).toBe(409);
    const ok = await s.call({
      action: "request",
      kind: "transfer",
      confirm: true,
      targetCohortId: "c2",
    });
    expect(ok.status).toBe(200);
    expect(s.tables["cancellation_requests"]![0]).toMatchObject({
      kind: "transfer",
      target_cohort_id: "c2",
      shown: null,
    });
  });

  it("an email that does not go out does not lose the request, and the owner is told", async () => {
    const s = setup(tables(), { failAck: true });
    const { status, body } = await s.call({
      action: "request",
      kind: "cancellation",
      confirm: true,
    });
    expect(status).toBe(200);
    expect(body.acknowledged).toBe(false);
    expect(
      s.tables["cancellation_requests"]![0]!["acknowledged_at"],
    ).toBeUndefined();
    const owner = s.emails.find((e) => e[0] === "admin-cancel-request");
    expect((owner![2] as any).templateData.acknowledged).toBe(false);
  });
});

describe("the rest of the build", () => {
  it("the table: one open request per sign-up, server-only", () => {
    const sql = read(
      "supabase/migrations/20261117140000_cancellation_requests.sql",
    );
    expect(sql).toContain(
      "create table if not exists public.cancellation_requests",
    );
    expect(sql).toContain("kind in ('withdrawal', 'cancellation', 'transfer')");
    expect(sql).toContain("requested_at timestamptz not null default now()");
    expect(sql).toMatch(
      /create unique index if not exists cancellation_requests_one_open_idx\s+on public\.cancellation_requests \(registration_id\)\s+where handled_at is null;/,
    );
    expect(sql).toContain(
      "alter table public.cancellation_requests enable row level security;",
    );
    expect(sql).toContain(
      "revoke all on public.cancellation_requests from anon, authenticated;",
    );
  });

  it("the function checks the student itself", () => {
    expect(read("supabase/config.toml")).toMatch(
      /\[functions\.student-cancel\]\s+#[^\n]*\n\s+verify_jwt = false/,
    );
  });

  it("the account page: the two buttons with the law's and the Terms' words", () => {
    const page = read("src/pages/MyAccount.tsx");
    expect(page).toContain('withdrawHere: "Retrage-te din contract aici"');
    expect(page).toContain('withdrawConfirm: "Confirmă retragerea"');
    expect(page).toContain('withdrawConfirm: "Confirm withdrawal"');
    expect(page).toContain('cancelCourse: "Anulează cursul"');
    expect(page).toContain('"student-cancel"');
    expect(page).toContain("<CancelSection");
  });

  it("the admin: the requests in De rezolvat and on the sheet, the refund from the date sent", () => {
    const admin = read("supabase/functions/admin-registrations/index.ts");
    expect(admin).toContain('if (action === "resolve_cancel_request")');
    expect(admin).toContain('if (action === "list_cancel_requests")');
    expect(admin).toContain(
      "openCancelRequests: cancelErr ? [] : (cancelRows ?? []),",
    );
    expect(
      admin.match(/await requestedCancellationAt\(supabase, reg\.id\)/g)
        ?.length,
    ).toBe(3);
    expect(read("src/components/admin/TodayAdmin.tsx")).toContain(
      "Cereri din Contul meu — răspunde în 14 zile",
    );
    expect(read("src/components/admin/PersonSheet.tsx")).toContain(
      "<CancelRequests",
    );
  });

  it("the emails exist and the owner's goes to the school's inbox", () => {
    const registry = read(
      "supabase/functions/_shared/transactional-email-templates/registry.ts",
    );
    expect(registry).toContain(
      '"cancel-request-received": cancelRequestReceived',
    );
    expect(registry).toContain('"admin-cancel-request": adminCancelRequest');
    expect(
      read(
        "supabase/functions/_shared/transactional-email-templates/admin-cancel-request.tsx",
      ),
    ).toContain('to: "marhaba@centruldearabalibaneza.com"');
  });
});

describe("the withdrawal is never blocked by the estimate", () => {
  it("the button and the statement come up, and the request is recorded, when the lessons cannot be read", async () => {
    vi.setSystemTime(new Date("2026-11-25T10:00:00.000Z"));
    const s = setup(tables({ created_at: "2026-11-20T10:00:00.000Z" }), {
      failRead: "cohort_sessions",
    });
    const preview = await s.call({ action: "preview" });
    expect(preview.status).toBe(200);
    expect(preview.body.statement).toContain("Mă retrag din contractul");
    expect(preview.body.preview).toBeNull();
    const { status } = await s.call({
      action: "request",
      kind: "withdrawal",
      confirm: true,
    });
    expect(status).toBe(200);
    expect(s.tables["cancellation_requests"]![0]).toMatchObject({
      kind: "withdrawal",
      shown: null,
    });
  });

  it("an unread absence mark promises no amount", async () => {
    const s = setup(tables(), { failRead: "lesson_excusals" });
    const { body } = await s.call({ action: "preview" });
    expect(body.preview.certain).toBe(false);
  });
});
