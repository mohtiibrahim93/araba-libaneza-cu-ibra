import { describe, expect, it } from "vitest";
import { loadEdgeHandler } from "./helpers/edge-handler";

function adminHandler() {
  const reads: string[] = [];
  const db = {
    auth: {
      getUser: async () => ({
        data: {
          user: {
            email: "admin@example.test",
            email_confirmed_at: "2026-01-01",
          },
        },
      }),
    },
    from: (table: string) => {
      reads.push(table);
      const query = {
        select: () => query,
        eq: () => query,
        order: () => query,
        range: async () => ({ data: [], error: null }),
        maybeSingle: async () => ({ data: null, error: null }),
      };
      return query;
    },
  };
  const handler = loadEdgeHandler(
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
  const call = (body: unknown) =>
    handler(
      new Request("https://example.test/admin", {
        method: "POST",
        headers: {
          Authorization: "Bearer test-admin",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }),
    );
  return { call, reads };
}

describe("admin action dispatch", () => {
  it("rejects unsupported actions rather than returning the registration list", async () => {
    const { call, reads } = adminHandler();
    const response = await call({ action: "book_for_student_typo" });
    expect(response.status).toBe(400);
    expect(await response.json()).toMatchObject({ code: "unknown_action" });
    expect(reads).toEqual([]);
  });
  it("preserves the existing unnamed registration-list request", async () => {
    const { call } = adminHandler();
    const response = await call({});
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ data: [] });
  });
});
