import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { leadSegment, studentLabel } from "@/components/admin/types";

/** Task 11 as approved by the owner on 13 October 2026. */
const read = (p: string) => readFileSync(resolve(process.cwd(), p), "utf8");

describe("Înscrieri tabs", () => {
  it("puts paying students in Cursanți, closed leads in Închise, everyone else in Lead-uri", () => {
    expect(leadSegment({ lead_status: "converted", payment_status: "paid" })).toBe("students");
    expect(leadSegment({ lead_status: "contacted", payment_status: "paid" })).toBe("students");
    expect(leadSegment({ lead_status: "new", payment_status: "past_due" })).toBe("students");
    expect(leadSegment({ lead_status: "spam", payment_status: "unpaid" })).toBe("closed");
    expect(leadSegment({ lead_status: "not_suitable", payment_status: null })).toBe("closed");
    for (const s of ["new", "contacted", "qualified", "no_response"]) expect(leadSegment({ lead_status: s, payment_status: "unpaid" })).toBe("leads");
  });
  it("labels a student by the course they took", () => {
    expect(studentLabel({ form_type: "group", level: null, cohort: { level: "A1" } })).toBe("Cursant · Grupă A1");
    expect(studentLabel({ form_type: "private" })).toBe("Cursant · Privat");
    expect(studentLabel({ form_type: "kids" })).toBe("Cursant · Copii");
  });
  it("is wired into the list and the table", () => {
    const admin = read("src/pages/Admin.tsx");
    expect(admin).toContain('role="tablist" aria-label="Înscrieri"');
    expect(admin).toContain("leadSegment(r) === segment");
    expect(read("src/components/admin/RegistrationsTable.tsx")).toContain("{studentLabel(r)}");
  });
});

describe("Acasă quick actions", () => {
  const today = read("src/components/admin/TodayAdmin.tsx");
  const admin = read("supabase/functions/admin-registrations/index.ts");
  it("marks a lead nobody answered in one click through the existing status action", () => {
    expect(today).toContain('{ action: "update_status", lead_status: status }');
    for (const label of ['"Contactat"', '"Fără răspuns"', '"Nepotrivit"']) expect(today).toContain(label);
  });
  it("puts an unpaid person aside for 7 days, without touching the money", () => {
    expect(today).toContain('{ action: "snooze_followup", days: 7 }');
    const action = admin.slice(admin.indexOf('if (action === "snooze_followup")'), admin.indexOf("// Money received outside Stripe"));
    expect(action).toContain(".update({ followup_snoozed_until: until })");
    expect(action).not.toContain("payment_status");
    expect(admin).toContain("followup_snoozed_until.is.null,followup_snoozed_until.lt.");
    expect(read("supabase/migrations/20261013120000_registration_followup_snooze.sql")).toContain("ADD COLUMN IF NOT EXISTS followup_snoozed_until timestamptz");
  });
});

describe("marking money received outside Stripe", () => {
  const admin = read("supabase/functions/admin-registrations/index.ts");
  const action = admin.slice(admin.indexOf('if (action === "mark_paid_offline")'), admin.indexOf('if (action === "update_status")'));
  it("records paid with cash or transfer, never over paid or refunded, and logs it", () => {
    expect(action).toContain('body.method === "cash" || body.method === "transfer"');
    expect(action).toContain('payment_status: "paid", paid_at: paidAt, payment_method: method');
    expect(action).toContain(`.not("payment_status", "in", '("paid","refunded")')`);
    expect(action).toContain('action: "mark_paid_offline"');
  });
  it("asks for confirmation on Acasă before saving", () => {
    const today = read("src/components/admin/TodayAdmin.tsx");
    expect(today).toContain("window.confirm(`Marchezi ${r.name} ca plătit ${how}?");
    expect(today).toContain('{ action: "mark_paid_offline", method }');
  });
});
