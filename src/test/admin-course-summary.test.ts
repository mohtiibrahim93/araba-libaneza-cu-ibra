import { describe, expect, it, vi } from "vitest";
import { loadEdgeHandler } from "./helpers/edge-handler";

const cohorts = [
  { id: "november", title_ro: "A1 noiembrie", max_seats: 6, manual_offset: 1 },
  { id: "october", max_seats: 8, manual_offset: 0 },
];
const registrations = [
  { cohort_id: "november", payment_status: "paid", lead_status: "converted" },
  { cohort_id: "november", payment_status: "pending", lead_status: "new" },
  { cohort_id: "november", payment_status: "unpaid", lead_status: "qualified" },
  { cohort_id: "november", payment_status: "failed", lead_status: "new" },
  {
    cohort_id: "november",
    payment_status: "paid",
    refunded_at: "2026-10-10",
    lead_status: "converted",
  },
  { cohort_id: "october", payment_status: "card_saved", lead_status: "new" },
  { cohort_id: null, payment_status: "paid" },
];
function handler({
  rpcError = false,
  authorized = true,
  longHistory = false,
} = {}) {
  const reads: string[] = [];
  const tables: Record<string, unknown[]> = {
    group_cohorts: cohorts,
    registrations,
    manual_signups: [{ cohort_id: "november", count: 2 }],
  };
  if (longHistory)
    tables["registrations"] = Array.from({ length: 1001 }, () => ({
      cohort_id: "november",
      payment_status: "paid",
    }));
  const db = {
    auth: {
      getUser: async () => ({
        data: {
          user: authorized
            ? { email: "admin@example.test", email_confirmed_at: "2026-01-01" }
            : null,
        },
      }),
    },
    from: (table: string) => {
      reads.push(table);
      let start = 0;
      let end = 999;
      const q = {
        select: () => q,
        order: () => q,
        range: (from: number, to: number) => {
          start = from;
          end = to;
          return q;
        },
        then: (resolve: (value: unknown) => unknown) =>
          Promise.resolve({
            data: (tables[table] ?? []).slice(start, end + 1),
            error: null,
          }).then(resolve),
      };
      return q;
    },
    rpc: async () => ({
      data: [
        { cohort_id: "november", taken: 4 },
        { cohort_id: "october", taken: 0 },
      ],
      error: rpcError ? new Error("counter failed") : null,
    }),
  };
  const callHandler = loadEdgeHandler(
    "supabase/functions/admin-registrations/index.ts",
    {
      "https://esm.sh/@supabase/supabase-js@2": { createClient: () => db },
      "https://esm.sh/stripe@18.5.0": { default: class {} },
      "../_shared/cors.ts": { buildCorsHeaders: () => ({}) },
      "../_shared/booking.ts": {},
      "../_shared/calendar-reconciliation.ts": {},
      "../_shared/cohort-sessions.ts": {},
      "../_shared/refund.ts": {},
      "../_shared/prices.ts": {},
      "../_shared/managed-email.ts": {},
      "../_shared/registration-access.ts": {},
    },
    { ADMIN_EMAILS: "admin@example.test" },
  );
  return {
    reads,
    call: () =>
      callHandler(
        new Request("https://example.test/admin", {
          method: "POST",
          headers: {
            Authorization: "Bearer synthetic-admin",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ action: "course_overview" }),
        }),
      ),
  };
}
describe("authenticated group summary", () => {
  it("keeps payment states and exact group membership separate from authoritative seat counts", async () => {
    const response = await handler().call();
    expect(response.status).toBe(200);
    const { data } = await response.json();
    expect(data).toHaveLength(2);
    expect(data[0]).toMatchObject({
      id: "november",
      taken: 4,
      registration_count: 5,
      manual_signup_count: 2,
      payments: { paid: 1, unpaid: 1, pending: 1, failed: 1, refunded: 1 },
    });
    expect(data[1]).toMatchObject({
      id: "october",
      registration_count: 1,
      payments: { card_saved: 1 },
    });
  });
  it("returns an error rather than showing zero seats when the counter fails", async () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    try {
      const response = await handler({ rpcError: true }).call();
      expect(response.status).toBe(500);
      expect(await response.json()).toHaveProperty("error");
    } finally {
      log.mockRestore();
    }
  });
  it("refuses non-admin reads before touching enrolment data", async () => {
    const h = handler({ authorized: false });
    expect(await (await h.call()).json()).toHaveProperty("error");
    expect(h.reads).toEqual([]);
  });
  it("counts histories beyond the database page limit", async () => {
    const { data } = await (await handler({ longHistory: true }).call()).json();
    expect(data[0]).toMatchObject({
      registration_count: 1001,
      payments: { paid: 1001 },
    });
  });
});
