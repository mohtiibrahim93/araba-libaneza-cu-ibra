import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const read = (p: string) => readFileSync(resolve(process.cwd(), p), "utf8");

/**
 * The owner's group rules (October 2026): a waiting list for full groups, an
 * email when a group reaches its minimum, and students added by hand into an
 * exact group.
 */
describe("waiting list for a full group", () => {
  it("opens the waiting list instead of selecting a full group", () => {
    const picker = read("src/components/RegistrationForm/CohortPicker.tsx");
    expect(picker).toContain("if (c.full) {");
    expect(picker).toContain("<NotifyMeForm");
    // Inside the sign-up <form>: no nested <form>.
    expect(picker).toMatch(/<NotifyMeForm\s+nested/);
  });

  it("can actually be saved: the status the visitor policy requires is allowed", () => {
    const mig = read("supabase/migrations/20261005130000_course_requests_accept_new.sql");
    expect(mig).toContain("array['new', 'open', 'grouped', 'converted', 'closed']");
    const form = read("src/components/NotifyMeForm.tsx");
    // The table stores "physical", not "fizic".
    expect(form).toContain('format === "fizic" ? "physical"');
  });
});

describe("minimum reached", () => {
  it("emails the group's students once, only when the status changes to it", () => {
    const fn = read("supabase/functions/admin-registrations/index.ts");
    expect(fn).toContain('data.status === "minimum_reached" && before?.status !== "minimum_reached"');
    expect(fn).toContain("idempotencyKey: `group-confirmed-${cId}-${r.id}`");
    expect(fn).toContain('.in("lead_status", ["qualified", "converted"])');
    const registry = read("supabase/functions/_shared/transactional-email-templates/registry.ts");
    expect(registry).toContain("'group-confirmed': groupConfirmed");
  });
});

describe("a student added by hand", () => {
  it("becomes a real registration in the exact group, holding a seat", () => {
    const fn = read("supabase/functions/admin-registrations/index.ts");
    expect(fn).toContain('action === "add_manual_registration"');
    expect(fn).toContain('lead_status: isPaid ? "converted" : "qualified"');
    expect(fn).toContain("cohort_id: cohort.id");
    const mig = read("supabase/migrations/20261005140000_manual_registration_source_payment.sql");
    expect(mig).toContain("'tiktok', 'instagram', 'direct', 'telefon', 'other'");
    expect(mig).toContain("add column if not exists payment_method text");
  });
});
