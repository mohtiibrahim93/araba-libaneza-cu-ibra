import { beforeEach, describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  buildAccount,
  buildEnrolment,
  enrolmentTitle,
  paymentMonths,
  type AccountCohortRow,
  type AccountRegistrationRow,
} from "@/lib/myAccount";
import { languageCounterpart } from "@/lib/languageRoutes";
import { allSeoRoutes } from "@/lib/seoHead";
import { belongsInSitemap } from "@/lib/sitemap";

/**
 * "Contul meu" (owner, 14 Nov 2026): a signed-in student sees their own
 * courses, months, payments and booked lessons, and nobody else's.
 */
const read = (p: string) => readFileSync(resolve(process.cwd(), p), "utf8");
const TODAY = "2026-11-15";

const cohort = (over: Partial<AccountCohortRow> = {}): AccountCohortRow => ({
  id: "c1",
  status: "in_progress",
  level: "A1",
  format: "fizic",
  start_date: "2026-09-02",
  price_lei: 500,
  title_ro: null,
  title_en: null,
  schedule_label_ro: "Luni la 19:00 & Miercuri la 18:30",
  schedule_label_en: "Monday at 7:00 pm & Wednesday at 6:30 pm",
  ...over,
});
const reg = (
  over: Partial<AccountRegistrationRow> = {},
): AccountRegistrationRow => ({
  id: "r1",
  form_type: "group",
  level: "A1",
  format: "fizic",
  created_at: "2026-09-02T00:00:00Z",
  payment_status: "paid",
  months_total: 4,
  subscription_status: null,
  canceled_at: null,
  refunded_amount: null,
  quantity: 1,
  cohort_id: "c1",
  registration_payments: [
    {
      kind: "month",
      method: "other",
      amount_lei: "1500.00",
      paid_at: "2026-11-13T12:00:00Z",
      month_from: 1,
      month_to: 3,
    },
  ],
  ...over,
});

describe("what a student sees about a group course", () => {
  it("every month, the verdict, and the month that can be paid by card", () => {
    const e = buildEnrolment(reg(), cohort(), TODAY);
    expect(e.months).toEqual([
      { month: 1, state: "paid", due: true, dueFrom: null },
      { month: 2, state: "paid", due: true, dueFrom: "2026-10-02" },
      { month: 3, state: "paid", due: true, dueFrom: "2026-11-02" },
      { month: 4, state: "unpaid", due: false, dueFrom: "2026-12-02" },
    ]);
    expect(e.monthsStatus).toBe("up_to_date");
    expect(e.nextPayment).toEqual({
      month: 4,
      total: 4,
      amountLei: 500,
      due: false,
      dueFrom: "2026-12-02",
    });
    expect(e.payments).toEqual([
      {
        paidAt: "2026-11-13T12:00:00Z",
        amountLei: 1500,
        granted: false,
        monthFrom: 1,
        monthTo: 3,
      },
    ]);
    expect(enrolmentTitle(e, "ro")).toBe("Curs de grup A1 · fizic, la centru");
    expect(enrolmentTitle(e, "en")).toBe(
      "Group course A1 · in person, at the centre",
    );
    expect(paymentMonths(e.payments[0]!, "ro")).toBe("lunile 1–3");
    expect(paymentMonths(e.payments[0]!, "en")).toBe("months 1–3");
  });

  it("says a month is due once its day has come", () => {
    const e = buildEnrolment(reg(), cohort(), "2026-12-02");
    expect(e.monthsStatus).toBe("unpaid");
    expect(e.nextPayment).toMatchObject({ month: 4, due: true });
  });

  it("shows a granted month as granted, never as money", () => {
    const e = buildEnrolment(
      reg({
        registration_payments: [
          {
            kind: "month",
            method: "transfer",
            amount_lei: 500,
            paid_at: "2026-10-30T10:00:00Z",
            month_from: 1,
            month_to: 1,
          },
          {
            kind: "credit",
            method: "credit",
            amount_lei: 0,
            paid_at: "2026-11-03T10:00:00Z",
            month_from: 4,
            month_to: 4,
          },
        ],
      }),
      cohort({ format: "online", price_lei: null, start_date: "2026-11-07" }),
      TODAY,
    );
    expect(e.months!.map((m) => m.state)).toEqual([
      "paid",
      "unpaid",
      "unpaid",
      "granted",
    ]);
    expect(e.nextPayment).toMatchObject({ month: 2, amountLei: 500 });
    expect(e.payments.find((p) => p.granted)).toMatchObject({
      amountLei: 0,
      monthFrom: 4,
    });
  });

  it("a student who left owes nothing and gets no payment button", () => {
    const e = buildEnrolment(
      reg({ canceled_at: "2026-11-13T19:41:07Z", months_total: 1 }),
      cohort(),
      TODAY,
    );
    expect(e.left).toBe(true);
    expect(e.monthsStatus).toBeNull();
    expect(e.nextPayment).toBeNull();
    expect(e.noPaymentReason).toBe("withdrawn");
  });

  it("a card subscription is charged by itself", () => {
    const e = buildEnrolment(
      reg({ subscription_status: "active" }),
      cohort(),
      TODAY,
    );
    expect(e.subscription).toBe(true);
    expect(e.nextPayment).toBeNull();
    expect(e.noPaymentReason).toBe("subscription");
  });

  it("keeps internal details out: no notes, banks or who recorded what", () => {
    const withInternals = reg({
      registration_payments: [
        {
          kind: "month",
          method: "transfer",
          amount_lei: 500,
          paid_at: "2026-10-30T10:00:00Z",
          month_from: 1,
          month_to: 1,
          ...({
            note: "a private note",
            provider: "Revolut",
            recorded_by: "owner@example.test",
            stripe_ref: "pi_secret",
          } as object),
        },
      ],
    });
    const out = JSON.stringify(buildEnrolment(withInternals, cohort(), TODAY));
    for (const hidden of [
      "private note",
      "Revolut",
      "owner@example.test",
      "pi_secret",
    ])
      expect(out).not.toContain(hidden);
  });
});

describe("other sign-ups, and the order they come in", () => {
  it("private lessons show their package, not months", () => {
    const e = buildEnrolment(
      reg({
        id: "p1",
        form_type: "private",
        cohort_id: null,
        quantity: 10,
        format: "online",
        months_total: null,
        registration_payments: [],
      }),
      null,
      TODAY,
    );
    expect(e.months).toBeNull();
    expect(e.lessons).toBe(10);
    expect(e.nextPayment).toBeNull();
    expect(enrolmentTitle(e, "ro")).toBe("Lecții private · online");
  });

  it("records a refund in lei", () => {
    expect(
      buildEnrolment(reg({ refunded_amount: 43750 }), cohort(), TODAY)
        .refundedLei,
    ).toBe(437.5);
  });

  it("running courses first, then by newest sign-up", () => {
    const out = buildAccount(
      [
        reg({
          id: "left",
          canceled_at: "2026-11-13T00:00:00Z",
          created_at: "2026-11-10T00:00:00Z",
        }),
        reg({ id: "old", created_at: "2026-08-15T00:00:00Z" }),
        reg({ id: "new", created_at: "2026-11-07T00:00:00Z" }),
      ],
      [cohort()],
      TODAY,
    );
    expect(out.map((e) => e.id)).toEqual(["new", "old", "left"]);
  });
});

// ---------------------------------------------------------------------------
// The server route: who is asking is decided by Auth alone
// ---------------------------------------------------------------------------
type Call = { table: string; method: string; args: unknown[] };
const state = vi.hoisted(() => ({
  user: null as Record<string, unknown> | null,
  rateOk: true,
  failTable: null as string | null,
  calls: [] as Array<{ table: string; method: string; args: unknown[] }>,
  tables: {} as Record<string, unknown[]>,
}));

vi.mock("@/integrations/supabase/client.server", () => {
  const from = (table: string) => {
    const q: Record<string, unknown> = {};
    for (const method of ["select", "ilike", "is", "order", "in", "limit"])
      q[method] = (...args: unknown[]) => {
        state.calls.push({ table, method, args });
        return q;
      };
    q["then"] = (ok: (v: unknown) => void) =>
      ok(
        state.failTable === table
          ? { data: null, error: { message: "down" } }
          : { data: state.tables[table] ?? [], error: null },
      );
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

async function get(headers: Record<string, string> = {}, query = "") {
  const { Route } = await import("@/routes/api/public/my-account");
  const handler = (
    Route as unknown as {
      options: {
        server: {
          handlers: { GET: (ctx: { request: Request }) => Promise<Response> };
        };
      };
    }
  ).options.server.handlers.GET;
  const res = await handler({
    request: new Request(`https://example.test/api/public/my-account${query}`, {
      headers,
    }),
  });
  return { res, body: (await res.json()) as Record<string, unknown> };
}
const signedIn = { authorization: "Bearer token" };
const filterOn = (table: string): Call | undefined =>
  state.calls.find((c) => c.table === table && c.method === "ilike");

describe("the account route", () => {
  beforeEach(() => {
    state.user = {
      id: "u1",
      email: "Student@Example.test",
      email_confirmed_at: "2026-11-01T00:00:00Z",
      is_anonymous: false,
    };
    state.rateOk = true;
    state.failTable = null;
    state.calls = [];
    state.tables = {
      registrations: [reg()],
      group_cohorts: [cohort()],
      bookings: [],
    };
  });

  it("returns the signed-in student's own sign-ups, by the address Auth confirmed", async () => {
    const { res, body } = await get(signedIn, "?email=victim@example.test");
    expect(res.status).toBe(200);
    expect(res.headers.get("cache-control")).toBe("no-store");
    expect(body["email"]).toBe("student@example.test");
    expect((body["enrolments"] as unknown[]).length).toBe(1);
    // The address in the query is the one from Auth, lower-cased; whatever the
    // request carries is ignored.
    expect(filterOn("registrations")?.args).toEqual([
      "email",
      "student@example.test",
    ]);
    expect(filterOn("bookings")?.args).toEqual([
      "student_email",
      "student@example.test",
    ]);
    expect(JSON.stringify(state.calls)).not.toContain("victim");
  });

  it("asks to sign in without a session, a confirmed address, or with an anonymous one", async () => {
    expect((await get()).res.status).toBe(401);
    state.user = null;
    expect((await get(signedIn)).res.status).toBe(401);
    state.user = { id: "u", email: "a@example.test", email_confirmed_at: null };
    expect((await get(signedIn)).res.status).toBe(401);
    state.user = {
      id: "u",
      email: "a@example.test",
      email_confirmed_at: "2026-11-01T00:00:00Z",
      is_anonymous: true,
    };
    expect((await get(signedIn)).res.status).toBe(401);
    expect(state.calls).toEqual([]);
  });

  it("escapes the address, so % and _ in it match nothing else", async () => {
    state.user = { ...state.user, email: "a_b%c@example.test" };
    await get(signedIn);
    expect(filterOn("registrations")?.args[1]).toBe("a\\_b\\%c@example.test");
  });

  it("shows nothing rather than wrong months when the group cannot be read", async () => {
    state.failTable = "group_cohorts";
    expect((await get(signedIn)).res.status).toBe(503);
  });

  it("slows down a caller who asks too often", async () => {
    state.rateOk = false;
    expect((await get(signedIn)).res.status).toBe(429);
  });

  it("reads no address from the request", () => {
    const src = read("src/routes/api/public/my-account.ts");
    expect(src).not.toMatch(/searchParams|request\.json\(|request\.formData\(/);
    expect(src).toContain("supabaseAdmin.auth.getUser(token)");
  });
});

describe("the page is on the site in both languages, and private", () => {
  it("pairs the two addresses", () => {
    expect(languageCounterpart("/contul-meu", "en")).toBe("/en/my-account");
    expect(languageCounterpart("/en/my-account", "ro")).toBe("/contul-meu");
  });

  it("is kept out of search results and of the sitemap", () => {
    for (const path of ["/contul-meu", "/en/my-account"]) {
      const route = allSeoRoutes().find((r) => r.path === path)!;
      expect(route, path).toBeTruthy();
      expect(route.noindex).toBe(true);
      expect(belongsInSitemap(route)).toBe(false);
    }
  });

  it("is in the top band next to Programare on wide screens, and in the phone menu", () => {
    // Owner, 16 Nov 2026. In the band only from xl up: narrower, it would cut
    // the "next course" pill short; there the menu lists it under Programare.
    const nav = read("src/components/Navbar.tsx");
    const account = 'to={lang === "en" ? "/en/my-account" : "/contul-meu"}';
    const booking = 'to={lang === "en" ? "/en/booking" : "/booking"}';
    expect(nav.split(account).length - 1).toBe(2);
    const inBand = nav.indexOf(account);
    expect(inBand).toBeGreaterThan(nav.indexOf(booking));
    const bandLink = nav.slice(inBand, inBand + 400);
    expect(bandLink).toContain("hidden");
    expect(bandLink).toContain("xl:inline-flex");
    const inMenu = nav.lastIndexOf(account);
    expect(inMenu).toBeGreaterThan(nav.lastIndexOf(booking));
    expect(nav.slice(inMenu, inMenu + 400)).toContain("setOpen(false)");
  });

  it("is linked from the footer and uses the game's sign-in", () => {
    expect(read("src/components/Footer.tsx")).toContain(
      'to={lang === "en" ? "/en/my-account" : "/contul-meu"}',
    );
    const page = read("src/pages/MyAccount.tsx");
    expect(page).toContain(
      '<StudentAccountBox user={user} syncing={false} purpose="account" />',
    );
    expect(page).toContain('"create-month-payment"');
  });
});
