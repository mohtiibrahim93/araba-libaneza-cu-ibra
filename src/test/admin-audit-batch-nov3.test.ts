import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

// Admin findings from the Claude in Chrome pass (docs/SITE_AUDIT_2026-10.md,
// 1 Nov 2026), fixed 3 Nov 2026.
const read = (p: string) => readFileSync(p, "utf8");
const server = read("supabase/functions/admin-registrations/index.ts");

describe("one way to add a student to a group (#1)", () => {
  it("the old number-only panel lists and deletes, never adds", () => {
    const panel = read("src/components/ManualSignupsAdmin.tsx");
    expect(panel).not.toContain('action: "upsert_manual_signup"');
    expect(panel).toContain('action: "delete_manual_signup"');
    expect(panel).toContain("„Adaugă un cursant");
  });

  it("the per-group number is labelled as a seat adjustment", () => {
    const cohorts = read("src/components/admin/CohortsAdmin.tsx");
    expect(cohorts).toContain("Ajustare locuri");
  });
});

describe("seat numbers say what they are (#3)", () => {
  it("the card shows how many seats are only a number", () => {
    expect(read("src/components/admin/CourseOverviewAdmin.tsx")).toContain(
      "doar ca număr, fără un cursant anume",
    );
  });
});

describe("small admin fixes", () => {
  it("lesson times are always 24-hour (#4)", () => {
    expect(read("src/components/admin/CohortSessionsAdmin.tsx")).toContain(
      'hourCycle: "h23"',
    );
  });

  it("the selection bar floats instead of pushing the table (#7) and force delete is local-only (P1-5)", () => {
    const admin = read("src/pages/Admin.tsx");
    expect(admin).toMatch(/fixed inset-x-4 bottom-4/);
    const force = admin.slice(
      admin.indexOf("import.meta.env.DEV &&"),
      admin.indexOf("Forțează ștergerea (test)"),
    );
    expect(force.length).toBeGreaterThan(0);
    expect(force.length).toBeLessThan(600);
  });

  it("the sidebar says the school's full name (#8)", () => {
    expect(read("src/components/admin/AdminShell.tsx")).toContain(
      "Arabă Libaneză cu Ibra",
    );
  });

  it("Capacități points to the tab that exists (#9)", () => {
    expect(read("src/components/CapacitiesAdmin.tsx")).toContain(
      "„Înscrieri externe”",
    );
  });
});

describe("trial funnel counts trials that took place (#10)", () => {
  const funnel = server.slice(
    server.indexOf('action === "list_trial_funnel"'),
    server.indexOf("return jsonResponse({ data: enriched, counts });"),
  );
  it("a completed trial is booked and held", () => {
    expect(funnel).toContain('booking?.status === "completed"');
    expect(funnel).toContain("booked: !!booking && kept");
  });
});

describe("move a registration into another group (#12)", () => {
  const move = server.slice(server.indexOf('action === "move_to_cohort"'));
  it("keeps payments, follows the new group, refuses a full one unless confirmed, logs it", () => {
    expect(move).toContain("cohort_id: target.id");
    expect(move).toContain("level: target.level");
    expect(move).toContain('code: "cohort_full"');
    expect(move).toContain("body.force !== true");
    expect(move).toContain('action: "move_to_cohort"');
    expect(move.slice(0, 3000)).not.toContain("payment_status:");
  });

  it("the student sheet offers it for group registrations", () => {
    const sheet = read("src/components/admin/PersonSheet.tsx");
    expect(sheet).toContain("<MoveToCohort");
  });
});
