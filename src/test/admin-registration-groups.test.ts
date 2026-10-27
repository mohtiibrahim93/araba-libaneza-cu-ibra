import { describe, expect, it, vi } from "vitest";
import { loadEdgeHandler } from "./helpers/edge-handler";

const regs = [
  { id: "upcoming", form_type: "group", cohort_id: "november", level: "A1" },
  { id: "ongoing", form_type: "group", cohort_id: "october", level: "A1" },
  { id: "loose", form_type: "group", cohort_id: null, level: "A1" },
  { id: "manual-private", form_type: "private", source: "form" },
];
function admin(longHistory = false) {
  const inserts: { table: string; data: Record<string, unknown> }[] = [];
  const tables: Record<string, unknown[]> = {
    registrations: regs,
    group_cohorts: [
      { id: "november", start_date: "2026-11-02" },
      { id: "october", start_date: "2026-10-05" },
    ],
    audit_logs: [{ registration_id: "manual-private" }],
    email_confirmation_settings: [],
  };
  if (longHistory)
    tables["registrations"] = Array.from({ length: 1001 }, (_, i) => ({
      id: `registration-${i}`,
      form_type: "group",
      cohort_id: "november",
    }));
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
      let unsupportedEmbed = false;
      let start = 0;
      let end = 999;
      const result = () => ({
        data: structuredClone((tables[table] ?? []).slice(start, end + 1)),
        error: unsupportedEmbed ? new Error("No FK relationship") : null,
      });
      const q = {
        select: (fields: string) => {
          unsupportedEmbed = fields.includes("cohort:group_cohorts(");
          return q;
        },
        order: () => q,
        eq: () => q,
        in: () => q,
        range: (from: number, to: number) => {
          start = from;
          end = to;
          return q;
        },
        insert: async (data: Record<string, unknown>) => {
          inserts.push({ table, data });
          return { error: null };
        },
        maybeSingle: async () => ({ data: null, error: null }),
        then: (resolve: (value: unknown) => unknown) =>
          Promise.resolve(result()).then(resolve),
      };
      return q;
    },
  };
  const h = loadEdgeHandler(
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
    {
      ADMIN_EMAILS: "admin@example.test",
      SUPABASE_URL: "https://backend.example.test",
      SUPABASE_SERVICE_ROLE_KEY: "synthetic-service",
    },
  );
  return {
    inserts,
    call: (body: unknown) =>
      h(
        new Request("https://example.test/admin", {
          method: "POST",
          headers: {
            Authorization: "Bearer synthetic-admin",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        }),
      ),
  };
}
describe("exact enrolment group lookup", () => {
  it("works without a database FK and never guesses an unassigned same-level group", async () => {
    const response = await admin().call({});
    expect(response.status).toBe(200);
    const { data } = await response.json();
    expect(data[0].cohort.start_date).toBe("2026-11-02");
    expect(data[1].cohort.start_date).toBe("2026-10-05");
    expect(data[2].cohort).toBeNull();
  });
  it("uses existing admin booking audit evidence to identify legacy manual private registrations", async () => {
    const { data } = await (await admin().call({})).json();
    expect(
      data.find((r: { id: string }) => r.id === "manual-private").source,
    ).toBe("admin");
  });
  it("records the admin source for newly created private arrangements", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async () =>
          new Response(JSON.stringify({ success: true }), { status: 200 }),
      ),
    );
    try {
      const a = admin();
      expect(
        await (
          await a.call({
            action: "book_for_student",
            student_name: "Synthetic Student",
            student_email: "synthetic@example.test",
            student_phone: "+40700000000",
            start_at: "2026-11-04T12:00:00Z",
          })
        ).json(),
      ).toMatchObject({ success: true });
      expect(
        a.inserts.find((r) => r.table === "registrations")?.data["source"],
      ).toBe("admin");
    } finally {
      vi.unstubAllGlobals();
    }
  });
  it("includes registrations beyond the first database page", async () => {
    const { data } = await (await admin(true).call({})).json();
    expect(data).toHaveLength(1001);
    expect(data[1000].cohort.id).toBe("november");
  });
});
