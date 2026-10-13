import { expect, it } from "vitest";
import { loadEdgeHandler } from "./helpers/edge-handler";
function setup(authorized = true, fail = false) {
  const calls: any[] = [];
  const db = {
    auth: {
      getUser: async () => ({
        data: {
          user: {
            email: authorized ? "admin@example.test" : "student@example.test",
            email_confirmed_at: "2026-01-01",
          },
        },
      }),
    },
    rpc: async (name: string, params: any) => {
      calls.push({ name, params });
      return { error: fail ? new Error("DB failed") : null };
    },
  };
  const handler = loadEdgeHandler(
    "supabase/functions/admin-registrations/index.ts",
    {
      "https://esm.sh/@supabase/supabase-js@2": { createClient: () => db },
      "https://esm.sh/stripe@18.5.0": { default: class {} },
      "../_shared/cors.ts": { buildCorsHeaders: () => ({}) },
      "../_shared/booking.ts": {},
      "../_shared/cohort-sessions.ts": {},
      "../_shared/calendar-reconciliation.ts": {},
      "../_shared/refund.ts": {},
      "../_shared/prices.ts": {},
      "../_shared/managed-email.ts": {},
      "../_shared/registration-access.ts": {},
    },
    { ADMIN_EMAILS: "admin@example.test" },
  );
  return {
    calls,
    call: (body: any) =>
      handler(
        new Request("https://example.test/admin", {
          method: "POST",
          headers: {
            Authorization: "Bearer synthetic-admin",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ action: "update_contact", id: "r", ...body }),
        }),
      ),
  };
}
it("uses one atomic contact RPC without changing login or Stripe identity", async () => {
  const s = setup();
  expect(
    await (
      await s.call({
        name: " New Name ",
        email: " NEW@example.test ",
        phone: "123",
      })
    ).json(),
  ).toEqual({ success: true });
  expect(s.calls).toEqual([
    {
      name: "admin_update_registration_contact",
      params: {
        p_id: "r",
        p_name: "New Name",
        p_email: "new@example.test",
        p_phone: "123",
        p_actor: "admin@example.test",
      },
    },
  ]);
});
it("rejects unauthorized and invalid contact edits before writes", async () => {
  const denied = setup(false);
  expect(await (await denied.call({ name: "New Name" })).json()).toHaveProperty(
    "error",
  );
  expect(denied.calls).toEqual([]);
  const s = setup();
  expect((await s.call({ name: "New Name", email: "invalid" })).status).toBe(
    400,
  );
  expect(s.calls).toEqual([]);
});
it("does not report success when the contact transaction fails", async () => {
  const s = setup(true, true);
  const response = await s.call({
    name: "New Name",
    email: "new@example.test",
  });
  expect(response.status).toBe(500);
  expect(await response.json()).not.toHaveProperty("success", true);
});
