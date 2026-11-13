import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

// Owner, 13 Nov 2026: a finished group stays in Grupe, under "Grupe
// încheiate", not among the running ones. The first A1 group (24 March –
// 25 June 2026) is the first of them.
const overview = readFileSync(
  "src/components/admin/CourseOverviewAdmin.tsx",
  "utf8",
);

describe("finished groups in the admin's group overview", () => {
  it("are listed in a section of their own", () => {
    expect(overview).toContain('new Set(["completed", "cancelled"])');
    expect(overview).toContain("Grupe încheiate ({ended.length})");
    expect(overview).toContain("{ended.map(card)}");
  });

  it("are no longer mixed with the running and forming groups", () => {
    expect(overview).toContain("{current.map(card)}");
    expect(overview).toContain("!ENDED_STATUSES.has(c.status)");
    expect(overview).not.toContain("{visible.map(");
  });

  it("stay off the public site", () => {
    // Public lists read only groups that are forming or running.
    const hook = readFileSync("src/hooks/useGroupCohorts.ts", "utf8");
    const publicStatuses = hook.slice(
      hook.indexOf("PUBLIC_COHORT_STATUSES"),
      hook.indexOf("];", hook.indexOf("PUBLIC_COHORT_STATUSES")),
    );
    expect(publicStatuses).not.toContain("completed");
    const running = readFileSync("src/lib/runningGroupTitle.ts", "utf8");
    expect(running).toContain('status === "in_progress"');
    expect(running).not.toContain('"completed"');
  });
});
