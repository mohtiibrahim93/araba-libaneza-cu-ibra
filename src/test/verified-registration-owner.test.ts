import { describe, expect, it, vi } from "vitest";
import { verifiedRegistrationOwner } from "../../supabase/functions/_shared/verified-registration-owner";
import { readFileSync } from "node:fs";

const req = (token?: string) => new Request("https://example.test", { headers: token ? { authorization: `Bearer ${token}` } : {} });
const reg = { email: "student@example.test" };
const auth = (email = reg.email, confirmed: string | null = "2026-01-01") => ({
  getUser: vi.fn(async () => ({ data: { user: { email, email_confirmed_at: confirmed } }, error: null })),
});
describe("verified registration ownership", () => {
  it("accepts only the matching verified mailbox", async () => {
    const client = auth(" STUDENT@example.test ");
    expect(await verifiedRegistrationOwner(req("valid"), reg, client)).toBe(true);
    expect(client.getUser).toHaveBeenCalledWith("valid");
  });
  it("rejects signed-out callers", async () => {
    const client = auth();
    expect(await verifiedRegistrationOwner(req(), reg, client)).toBe(false);
    expect(client.getUser).not.toHaveBeenCalled();
  });
  it("rejects another account, unconfirmed email and missing email", async () => {
    expect(await verifiedRegistrationOwner(req("valid"), reg, auth("other@example.test"))).toBe(false);
    expect(await verifiedRegistrationOwner(req("valid"), reg, auth(reg.email, null))).toBe(false);
    expect(await verifiedRegistrationOwner(req("valid"), {}, auth())).toBe(false);
  });
  it("fails closed on invalid tokens or Auth outages", async () => {
    expect(await verifiedRegistrationOwner(req("invalid"), reg, { getUser: async () => ({ data: { user: null }, error: "invalid" }) })).toBe(false);
    expect(await verifiedRegistrationOwner(req("invalid"), reg, { getUser: async () => { throw new Error("offline"); } })).toBe(false);
  });
  it("rejects anonymous identities even with a matching email", async () => {
    expect(await verifiedRegistrationOwner(req("valid"), reg, { getUser: async () => ({ data: { user: { email: reg.email, email_confirmed_at: "2026-01-01", is_anonymous: true } }, error: null }) })).toBe(false);
  });
  it.each([
    ["create-subscription", "stripe.subscriptions.create("],
    ["booking-create", '.from("bookings")\n      .insert('],
    ["create-checkout", "stripe.checkout.sessions.create("],
    ["create-checkout-session", "stripe.checkout.sessions.create("],
    ["get-checkout-session", "const payload ="],
  ])("%s authorizes before private operations", (name, operation) => {
    const src = readFileSync(`supabase/functions/${name}/index.ts`, "utf8");
    const gate = src.indexOf("verifiedRegistrationOwner(req,");
    expect(gate).toBeGreaterThan(-1);
    expect(src.indexOf(operation)).toBeGreaterThan(gate);
    expect(src).not.toContain("callerOwnsRegistration(");
  });
  it("keeps only the trusted booking bypass", () => {
    const src = readFileSync("supabase/functions/booking-create/index.ts", "utf8");
    expect(src).toContain("serviceRoleKey.length > 0 && bearer === serviceRoleKey");
    expect(src).toContain("!internalCall && !(await verifiedRegistrationOwner(req, reg, supabase.auth))");
  });
  it("does not trust resubmitted assistant roles", () => {
    const src = readFileSync("src/routes/api/chat.ts", "utf8");
    expect(src).toContain('role: "user" as const');
    expect(src).not.toMatch(/role:\s*m\.role/);
    expect(src).toContain("convertToModelMessages(sanitizedMessages)");
    expect(src).toContain("system: ASK_SYSTEM_PROMPT");
  });
});