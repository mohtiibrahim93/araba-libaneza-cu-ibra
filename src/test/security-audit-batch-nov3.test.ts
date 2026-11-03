import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

// P1 security findings (docs/SITE_AUDIT_2026-10.md), fixed 3 Nov 2026.
const read = (p: string) => readFileSync(p, "utf8");
const fn = (name: string) => read(`supabase/functions/${name}/index.ts`);

describe("Stripe customers come from the registration, not the browser (P1 #3)", () => {
  it.each(["create-payment-intent", "create-subscription"])("%s", (name) => {
    const src = fn(name);
    expect(src).toContain('const customerEmail: string = regRow.email || "";');
    expect(src).not.toMatch(/customers\.list\(\{ email, limit/);
  });

  it("create-checkout prefers the stored registration email", () => {
    expect(fn("create-checkout")).toContain(
      'const customerEmail: string = existingReg?.email || email || "";',
    );
  });
});

describe("visitors never see raw Stripe or server errors (P1 #4)", () => {
  it.each([
    "create-payment-intent",
    "create-subscription",
    "create-checkout-session",
  ])("%s", (name) => {
    const src = fn(name);
    expect(src).toContain("JSON.stringify({ error: PUBLIC_PAYMENT_ERROR })");
    expect(src).not.toContain("JSON.stringify({ error: message })");
  });
});

describe("CORS: only this project's own origins (P1 #7)", () => {
  it("no longer accepts any *.lovable.app or *.lovableproject.com", () => {
    const cors = read("supabase/functions/_shared/cors.ts");
    expect(cors).not.toContain("[a-z0-9-]+\\.lovable\\.app$/i");
    expect(cors).not.toContain("([a-z0-9-]+\\.)*lovableproject\\.com$/i");
    expect(cors).toContain(
      'const PROJECT_ID = "b6dbaaf5-f5c4-4603-a0e4-cbbbddd78e67"',
    );
  });
});

describe("the free-PDF form cannot flood an inbox (P1 #2)", () => {
  it("at most 2 of a PDF and 3 in all per address a day", () => {
    const src = fn("resource-download");
    expect(src).toMatch(
      /`resource:email:\$\{cleanEmail\}:\$\{key\}`,\s*2,\s*86400/,
    );
    expect(src).toMatch(/`resource:email:\$\{cleanEmail\}`,\s*3,\s*86400/);
  });
});
