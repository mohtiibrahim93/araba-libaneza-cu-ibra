import { beforeEach, describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  buildEnrolment,
  needsEarlyStartRequest,
  type AccountCohortRow,
  type AccountRegistrationRow,
} from "@/lib/myAccount";

/**
 * The request to start lessons inside the 14-day withdrawal period, made in
 * "Contul meu" (owner, 17 Nov 2026: "the box can't reach them"): for the
 * student the owner signed up by hand, who saw neither the box in the
 * sign-up form nor the one at checkout.
 */
const read = (p: string) => readFileSync(resolve(process.cwd(), p), "utf8");
const REG_ID = "6f9c1d2e-3b4a-4c5d-8e7f-0a1b2c3d4e5f";

const reg = (
  over: Partial<AccountRegistrationRow> = {},
): AccountRegistrationRow => ({
  id: REG_ID,
  form_type: "group",
  level: "A1",
  format: "fizic",
  // 17 Nov 2026, under the new Terms (from 16 Nov 2026)
  created_at: "2026-11-17T10:00:00.000Z",
  payment_status: "unpaid",
  months_total: 4,
  subscription_status: null,
  canceled_at: null,
  refunded_amount: null,
  quantity: 1,
  cohort_id: "c1",
  early_start_requested_at: null,
  registration_payments: [],
  ...over,
});
const cohort = (over: Partial<AccountCohortRow> = {}): AccountCohortRow => ({
  id: "c1",
  status: "open",
  level: "A1",
  format: "fizic",
  start_date: "2026-11-24",
  price_lei: 500,
  title_ro: null,
  title_en: null,
  schedule_label_ro: null,
  schedule_label_en: null,
  ...over,
});
const NOW = new Date("2026-11-18T12:00:00.000Z");

describe("who is asked in Contul meu", () => {
  it("a group sign-up, still inside its 14 days, to a group starting in them", () => {
    expect(needsEarlyStartRequest(reg(), "2026-11-24", NOW)).toBe(true);
    // Day 14 after the sign-up still counts; day 15 does not.
    expect(needsEarlyStartRequest(reg(), "2026-12-01", NOW)).toBe(true);
    expect(needsEarlyStartRequest(reg(), "2026-12-02", NOW)).toBe(false);
  });

  it("nobody who already asked, left, or is not in a group", () => {
    expect(
      needsEarlyStartRequest(
        reg({ early_start_requested_at: "2026-11-17T10:05:00.000Z" }),
        "2026-11-24",
        NOW,
      ),
    ).toBe(false);
    expect(
      needsEarlyStartRequest(
        reg({ canceled_at: "2026-11-18T09:00:00.000Z" }),
        "2026-11-24",
        NOW,
      ),
    ).toBe(false);
    expect(
      needsEarlyStartRequest(reg({ form_type: "private" }), "2026-11-24", NOW),
    ).toBe(false);
    expect(needsEarlyStartRequest(reg(), null, NOW)).toBe(false);
  });

  it("not once the 14 days are over, nor under the earlier Terms", () => {
    expect(
      needsEarlyStartRequest(
        reg(),
        "2026-11-24",
        new Date("2026-12-03T12:00:00.000Z"),
      ),
    ).toBe(false);
    expect(
      needsEarlyStartRequest(
        reg({ created_at: "2026-11-10T10:00:00.000Z" }),
        "2026-11-12",
        new Date("2026-11-12T12:00:00.000Z"),
      ),
    ).toBe(false);
  });

  it("the course card carries the answer", () => {
    expect(buildEnrolment(reg(), cohort(), "2026-11-18").earlyStartNeeded).toBe(
      true,
    );
    expect(
      buildEnrolment(
        reg({ early_start_requested_at: "2026-11-17T10:05:00.000Z" }),
        cohort(),
        "2026-11-18",
      ).earlyStartNeeded,
    ).toBe(false);
    expect(
      buildEnrolment(reg(), cohort({ start_date: "2027-01-09" }), "2026-11-18")
        .earlyStartNeeded,
    ).toBe(false);
  });
});

describe("the box in Contul meu", () => {
  const page = read("src/pages/MyAccount.tsx");

  it("is shown only when the request is still needed, unticked", () => {
    expect(page).toContain("{e.earlyStartNeeded && (");
    expect(page).toContain("const [ticked, setTicked] = useState(false);");
    expect(page).toContain("disabled={!ticked || busy}");
  });

  it("sends the tick and the sign-up, nothing else, with the session", () => {
    expect(page).toContain('fetch("/api/public/early-start", {');
    expect(page).toContain(
      "body: JSON.stringify({ registrationId: enrolment.id, accepted: true }),",
    );
    expect(page).toContain("Authorization: `Bearer ${token}`,");
  });

  it("the account route reads whether it was made", () => {
    expect(read("src/routes/api/public/my-account.ts")).toContain(
      "canceled_at,early_start_requested_at,refunded_amount",
    );
  });
});

// ---------------------------------------------------------------------------
// The route that records it: who is asking is decided by Auth alone
// ---------------------------------------------------------------------------
type Row = Record<string, unknown>;
const state = vi.hoisted(() => ({
  user: null as Record<string, unknown> | null,
  rateOk: true,
  failTable: null as string | null,
  tables: {} as Record<string, Array<Record<string, unknown>>>,
  updates: [] as Array<{ table: string; value: unknown; filters: string[] }>,
  inserts: [] as Array<{ table: string; value: unknown }>,
}));

vi.mock("@/integrations/supabase/client.server", () => {
  const from = (table: string) => {
    const tests: Array<(r: Row) => boolean> = [];
    const tags: string[] = [];
    let patch: Row | null = null;
    const run = async () => {
      if (state.failTable === table)
        return { data: null, error: { message: "down" } };
      const hit = (state.tables[table] ?? []).filter((r) =>
        tests.every((t) => t(r)),
      );
      if (patch) {
        for (const r of hit) Object.assign(r, patch);
        state.updates.push({ table, value: patch, filters: tags });
        return { data: null, error: null };
      }
      return { data: hit[0] ?? null, error: null };
    };
    const q: Record<string, unknown> = {
      select: () => q,
      update: (v: Row) => ((patch = v), q),
      insert: async (v: unknown) => {
        state.inserts.push({ table, value: v });
        return { error: null };
      },
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
      maybeSingle: run,
      then: (ok: (v: unknown) => void) => run().then(ok),
    };
    return q;
  };
  return {
    supabaseAdmin: {
      auth: {
        getUser: async () => ({
          data: { user: state.user },
          error: state.user ? null : { message: "bad token" },
        }),
      },
      rpc: async () => ({ data: state.rateOk, error: null }),
      from,
    },
  };
});

async function post(
  body: unknown,
  headers: Record<string, string> = { authorization: "Bearer token" },
) {
  const { Route } = await import("@/routes/api/public/early-start");
  const handler = (
    Route as unknown as {
      options: {
        server: {
          handlers: {
            POST: (ctx: { request: Request }) => Promise<Response>;
          };
        };
      };
    }
  ).options.server.handlers.POST;
  const res = await handler({
    request: new Request("https://example.test/api/public/early-start", {
      method: "POST",
      headers: { "content-type": "application/json", ...headers },
      body: JSON.stringify(body),
    }),
  });
  return { res, body: (await res.json()) as Record<string, unknown> };
}
const TICK = { registrationId: REG_ID, accepted: true };

describe("the route that records the request", () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(NOW);
    state.user = {
      id: "u1",
      email: "Student@Example.test",
      email_confirmed_at: "2026-11-01T00:00:00Z",
      is_anonymous: false,
    };
    state.rateOk = true;
    state.failTable = null;
    state.updates = [];
    state.inserts = [];
    state.tables = {
      registrations: [
        {
          ...reg(),
          email: " student@example.test ",
          anonymized_at: null,
        },
      ],
      group_cohorts: [{ ...cohort() }],
    };
  });

  it("records it with the server's time, once, for the student's own sign-up", async () => {
    const { res, body } = await post(TICK);
    vi.useRealTimers();
    expect(res.status).toBe(200);
    expect(res.headers.get("cache-control")).toBe("no-store");
    expect(body).toEqual({ ok: true, requestedAt: NOW.toISOString() });
    expect(state.updates).toEqual([
      {
        table: "registrations",
        value: { early_start_requested_at: NOW.toISOString() },
        filters: [`id=${REG_ID}`, "early_start_requested_at is null"],
      },
    ]);
    expect(state.inserts).toEqual([
      {
        table: "audit_logs",
        value: {
          actor: "student@example.test",
          action: "student_early_start",
          registration_id: REG_ID,
          details: { source: "my_account", requested_at: NOW.toISOString() },
        },
      },
    ]);
    // Asked again: already recorded, nothing written.
    const again = await post(TICK);
    expect(again.body["requestedAt"]).toBe(NOW.toISOString());
    expect(state.updates).toHaveLength(1);
  });

  it("someone else's sign-up looks like none at all", async () => {
    state.user = { ...state.user, email: "other@example.test" };
    const { res } = await post(TICK);
    vi.useRealTimers();
    expect(res.status).toBe(404);
    expect(state.updates).toEqual([]);
  });

  it("asks to sign in without a session, a confirmed address, or with an anonymous one", async () => {
    expect((await post(TICK, {})).res.status).toBe(401);
    state.user = null;
    expect((await post(TICK)).res.status).toBe(401);
    state.user = { id: "u", email: "a@example.test", email_confirmed_at: null };
    expect((await post(TICK)).res.status).toBe(401);
    state.user = {
      id: "u",
      email: "student@example.test",
      email_confirmed_at: "2026-11-01T00:00:00Z",
      is_anonymous: true,
    };
    expect((await post(TICK)).res.status).toBe(401);
    vi.useRealTimers();
    expect(state.updates).toEqual([]);
  });

  it("only a real tick is a request", async () => {
    for (const accepted of [undefined, "true", 1, false])
      expect(
        (await post({ registrationId: REG_ID, accepted })).res.status,
      ).toBe(400);
    expect(
      (await post({ registrationId: "r1", accepted: true })).res.status,
    ).toBe(400);
    vi.useRealTimers();
    expect(state.updates).toEqual([]);
  });

  it("refuses where the request is not needed", async () => {
    state.tables["group_cohorts"] = [
      { ...cohort({ start_date: "2027-01-09" }) },
    ];
    const { res } = await post(TICK);
    vi.useRealTimers();
    expect(res.status).toBe(409);
    expect(state.updates).toEqual([]);
  });

  it("slows down a caller who asks too often, and stops when it cannot read", async () => {
    state.rateOk = false;
    expect((await post(TICK)).res.status).toBe(429);
    state.rateOk = true;
    for (const table of ["registrations", "group_cohorts"]) {
      state.failTable = table;
      expect((await post(TICK)).res.status).toBe(503);
    }
    vi.useRealTimers();
    expect(state.updates).toEqual([]);
  });

  it("the admin's history names it", () => {
    expect(read("src/components/admin/AuditLogAdmin.tsx")).toContain(
      'student_early_start: "Cerere de începere în cele 14 zile bifată în Contul meu",',
    );
  });
});
