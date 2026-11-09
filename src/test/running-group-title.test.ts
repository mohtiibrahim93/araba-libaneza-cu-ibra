import { describe, it, expect } from "vitest";
import {
  groupNumberFromTitle,
  groupTitle,
  isRunningCohort,
  startLabel,
} from "@/lib/runningGroupTitle";

describe("groupTitle", () => {
  it("joins the pieces with a bullet, in the agreed order", () => {
    expect(
      groupTitle(["A1", "Online", "română", "grupa 2", "din 7 noiembrie"]),
    ).toBe("A1 • Online • română • grupa 2 • din 7 noiembrie");
  });

  it("drops a missing group number without leaving an empty bullet", () => {
    expect(
      groupTitle(["A1", "Fizic", "română", null, "din 15 august"]),
    ).toBe("A1 • Fizic • română • din 15 august");
  });

  it("keeps the English wording", () => {
    expect(
      groupTitle(["A1", "In person", "English", "Group 1", "since 2 September"]),
    ).toBe("A1 • In person • English • Group 1 • since 2 September");
  });
});

describe("groupNumberFromTitle", () => {
  it("takes the number from the admin group name", () => {
    expect(groupNumberFromTitle("A1 Online RO Grupa 2")).toBe(2);
    expect(groupNumberFromTitle("A1 Fizic Grupa 1")).toBe(1);
    expect(groupNumberFromTitle("A2 Online EN Group 3")).toBe(3);
  });

  it("is case-insensitive about the word Grupa", () => {
    expect(groupNumberFromTitle("grupa 4 — seral")).toBe(4);
  });

  it("invents no number when the admin name has none", () => {
    expect(groupNumberFromTitle("A1 Online RO")).toBeNull();
    expect(groupNumberFromTitle(null)).toBeNull();
  });
});

describe("isRunningCohort", () => {
  it("counts a forming group as running once its start date has come", () => {
    expect(isRunningCohort("forming", "2026-11-07", "2026-11-08")).toBe(true);
    expect(isRunningCohort("forming", "2026-11-21", "2026-11-08")).toBe(false);
  });

  it("always counts in_progress groups", () => {
    expect(isRunningCohort("in_progress", "2026-08-15", "2026-08-01")).toBe(
      true,
    );
  });
});

describe("startLabel", () => {
  it("localizes the start date", () => {
    expect(startLabel("2026-11-07", "ro")).toBe("7 noiembrie");
    expect(startLabel("2026-11-07", "en")).toBe("7 November");
  });
});
