import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";

/**
 * Paying the kids seat deposit used to run through the ordinary paid path and
 * set payment_status to "paid", as if the course had been paid; the course
 * could then not be paid for at all. The deposit now has its own marker
 * (owner's decision, 27 October 2026) and payment_status is left to the course.
 */
const read = (p: string) => readFileSync(resolve(process.cwd(), p), "utf8");

describe("kids deposit marker", () => {
  const webhook = read("supabase/functions/stripe-webhook/index.ts");
  const checkout = read("supabase/functions/create-checkout/index.ts");

  it("has its own columns, added by a migration in supabase/migrations", () => {
    const file = readdirSync(resolve(process.cwd(), "supabase/migrations")).find(
      (f) => /^\d{14}_kids_deposit_marker\.sql$/.test(f),
    );
    expect(file).toBeTruthy();
    const sql = read(`supabase/migrations/${file}`);
    for (const col of ["deposit_paid_at", "deposit_amount", "deposit_session_id"])
      expect(sql).toContain(col);
    expect(sql).not.toMatch(/update\s+public\.registrations\s+set\s+payment_status/i);
  });

  it("records a paid deposit without touching payment_status", () => {
    const start = webhook.indexOf('session.metadata?.course_type === "kids_deposit"');
    expect(start).toBeGreaterThan(-1);
    const branch = webhook.slice(start, webhook.indexOf("break;", start));
    expect(branch).toContain("deposit_paid_at");
    expect(branch).not.toContain("payment_status");
    // It must come before the generic "mark as paid" update.
    expect(start).toBeLessThan(webhook.indexOf('lead_status: "converted"', start));
  });

  it("opens a deposit session without marking the course pending", () => {
    const start = checkout.indexOf('courseType === "kids_deposit"\n          ? await supabase');
    expect(start).toBeGreaterThan(-1);
    const depositWrite = checkout.slice(start, checkout.indexOf("          : await supabase", start));
    expect(depositWrite).toContain("deposit_session_id: session.id");
    expect(depositWrite).not.toContain("payment_status");
  });
});
