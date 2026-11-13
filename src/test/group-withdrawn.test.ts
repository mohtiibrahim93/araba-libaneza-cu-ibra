import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { groupMonthStatusLabel } from "@/components/admin/GroupPayment";

// Owner, 13 Nov 2026: a student who left a group is recorded as "Retras".
// Stored in registrations.canceled_at, which already frees the seat
// (cohort_seats_taken); a card subscription keeps "Abonament anulat".
const read = (p: string) => readFileSync(p, "utf8");

describe("a student who left the group", () => {
  it('reads "Retras" instead of the month status', () => {
    const base = { id: "r", name: "x", level: "A1", format: "online" };
    expect(groupMonthStatusLabel(base)).toBe("Neplătit");
    expect(
      groupMonthStatusLabel({ ...base, canceled_at: "2026-11-13T10:00:00Z" }),
    ).toBe("Retras");
  });

  it("shows as Retras in the list and on the sheet", () => {
    const table = read("src/components/admin/RegistrationsTable.tsx");
    expect(table).toContain(
      'badge("bg-muted text-muted-foreground", "Retras")',
    );
    const sheet = read("src/components/admin/PersonSheet.tsx");
    expect(sheet).toContain('"Retras din grupă"');
    expect(sheet).toContain('"Abonament anulat"');
    expect(sheet).toContain("<GroupWithdraw");
  });

  it("can be marked and undone by the owner, with no refund and no email", () => {
    const admin = read("supabase/functions/admin-registrations/index.ts");
    const start = admin.indexOf('if (action === "set_withdrawn")');
    expect(start).toBeGreaterThan(0);
    const action = admin.slice(
      start,
      admin.indexOf('if (action === "add_manual_registration")'),
    );
    expect(action).toContain(
      "canceled_at: withdrawn ? new Date().toISOString() : null",
    );
    expect(action).toContain('"mark_withdrawn"');
    // A live card subscription is stopped elsewhere, so the charges stop too.
    expect(action).toContain("Anulează abonament");
    expect(action).not.toMatch(
      /sendTemplateEmail|sendBookingEmail|refunds\.create/,
    );
    const button = read("src/components/admin/GroupWithdraw.tsx");
    expect(button).toContain('action: "set_withdrawn"');
    expect(button).toContain("Marchează retras din grupă");
    expect(button).toContain("Anulează retragerea");
  });

  it("is not listed as owing a month, nor counted as paid up or unpaid", () => {
    const admin = read("supabase/functions/admin-registrations/index.ts");
    const owing = admin.slice(
      admin.indexOf("async function groupStudentsOwing"),
    );
    expect(owing).toContain('.is("canceled_at", null)');
    const overview = admin.slice(
      admin.indexOf('if (action === "course_overview")'),
    );
    expect(overview).toContain("if (r.canceled_at) continue;");
    expect(overview).toContain("withdrawn_count");
    expect(read("src/components/admin/CourseOverviewAdmin.tsx")).toContain(
      "Retrași: {c.withdrawn_count}",
    );
  });
});
