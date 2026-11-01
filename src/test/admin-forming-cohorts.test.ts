import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  daysUntil,
  formingCohorts,
} from "@/components/admin/FormingCohortsAdmin";
import type { CourseSummary } from "@/components/admin/CourseOverviewAdmin";
import { cohortAdminTitle } from "@/components/admin/RegistrationCourse";

// Owner, 30 Oct 2026: groups still forming must be visible in admin › Grupe
// with their numbers, and every group name says its teaching language.

const cohort = (over: Partial<CourseSummary>): CourseSummary => ({
  id: "x",
  title_ro: null,
  level: "A1",
  format: "online",
  age_category: "adulti",
  teaching_language: "ro",
  start_date: "2026-11-07",
  end_date: null,
  schedule_label_ro: null,
  status: "forming",
  form_type: "group",
  course_type: "grup",
  max_seats: 6,
  taken: 2,
  manual_offset: 0,
  registration_count: 2,
  incomplete_count: 0,
  manual_signup_count: 0,
  payments: { unpaid: 2 },
  ...over,
});

describe("Grupe în formare", () => {
  const today = "2026-11-01";

  it("keeps groups that have not started, soonest first, and drafts", () => {
    const rows = [
      cohort({ id: "late", start_date: "2026-11-21" }),
      cohort({ id: "soon", start_date: "2026-11-07" }),
      cohort({ id: "running", status: "in_progress", start_date: "2026-09-02" }),
      cohort({ id: "done", status: "completed", start_date: "2026-03-01" }),
      cohort({ id: "draft", status: "draft", start_date: "2026-09-02" }),
      cohort({ id: "stale", status: "forming", start_date: "2026-10-01" }),
    ];
    expect(formingCohorts(rows, today).map((c) => c.id)).toEqual([
      "draft",
      "soon",
      "late",
    ]);
  });

  it("counts days in whole calendar days", () => {
    expect(daysUntil("2026-11-07", today)).toBe(6);
    expect(daysUntil("2026-11-01", today)).toBe(0);
    expect(daysUntil("2026-10-31", today)).toBe(-1);
  });

  it("is the first card of the Grupe tab", () => {
    const admin = readFileSync("src/pages/Admin.tsx", "utf8");
    const tab = admin.slice(admin.indexOf('<TabsContent value="cohorts"'));
    expect(tab.indexOf("<FormingCohortsAdmin")).toBeGreaterThan(-1);
    expect(tab.indexOf("<FormingCohortsAdmin")).toBeLessThan(
      tab.indexOf("<CohortSessionsAdmin"),
    );
  });
});

describe("cohortAdminTitle", () => {
  it("names format and teaching language", () => {
    expect(cohortAdminTitle(cohort({}))).toBe("Grupă A1 · Online · în română");
    expect(
      cohortAdminTitle(cohort({ format: "fizic", teaching_language: "en" })),
    ).toBe("Grupă A1 · În persoană · în engleză");
  });

  it("keeps the owner's title and does not repeat what it already says", () => {
    expect(
      cohortAdminTitle(cohort({ title_ro: "A1 Online în română — noiembrie" })),
    ).toBe("A1 Online în română — noiembrie");
    expect(cohortAdminTitle(cohort({ title_ro: "Grupa de sâmbătă" }))).toBe(
      "Grupa de sâmbătă · Online · în română",
    );
  });
});
