import { describe, expect, it } from "vitest";
import {
  groupPagePath,
  groupSeriesNumber,
  groupSlug,
  levelPagePath,
  type SeriesCohort,
} from "@/lib/groupPage";
import { languageCounterpart } from "@/lib/languageRoutes";

// Owner, 1 Nov 2026: groups are numbered per format + teaching language,
// across levels, by start date; drafts that never ran take no number.
const groups: SeriesCohort[] = [
  {
    id: "on1",
    level: "A1",
    format: "online",
    teaching_language: "ro",
    start_date: "2026-08-15",
    status: "in_progress",
  },
  {
    id: "on-draft",
    level: "A2",
    format: "online",
    teaching_language: "ro",
    start_date: "2026-09-02",
    status: "draft",
  },
  {
    id: "on2",
    level: "A1",
    format: "online",
    teaching_language: "ro",
    start_date: "2026-11-07",
    status: "forming",
  },
  {
    id: "en1",
    level: "A1",
    format: "online",
    teaching_language: "en",
    start_date: "2026-11-21",
    status: "forming",
  },
  {
    id: "fz1",
    level: "A2",
    format: "fizic",
    teaching_language: "ro",
    start_date: "2026-09-01",
    status: "in_progress",
  },
  {
    id: "fz2",
    level: "A1",
    format: "fizic",
    teaching_language: "ro",
    start_date: "2026-09-02",
    status: "in_progress",
  },
];
const n = (id: string) =>
  groupSeriesNumber(
    groups.find((g) => g.id === id)!,
    groups,
  );

describe("group numbers, as the owner counts them", () => {
  it("matches the owner's table", () => {
    expect(n("on1")).toBe(1);
    expect(n("on2")).toBe(2);
    expect(n("en1")).toBe(1);
    expect(n("fz1")).toBe(1);
    expect(n("fz2")).toBe(2);
  });

  it("the next in-person group is 3", () => {
    const next: SeriesCohort = {
      id: "fz3",
      level: "A1",
      format: "fizic",
      teaching_language: "ro",
      start_date: "2027-02-01",
      status: "forming",
    };
    expect(groupSeriesNumber(next, [...groups, next])).toBe(3);
  });
});

describe("group page addresses", () => {
  it("names level, format, language, number and date", () => {
    const on2 = groups.find((g) => g.id === "on2")!;
    expect(groupSlug(on2, 2)).toBe("a1-online-romana-grupa-2-7-noiembrie-2026");
    const en1 = groups.find((g) => g.id === "en1")!;
    expect(groupSlug(en1, 1)).toBe(
      "a1-online-engleza-grupa-1-21-noiembrie-2026",
    );
  });

  it("has a Romanian and an English page, paired by the language switch", () => {
    const slug = "a1-online-romana-grupa-2-7-noiembrie-2026";
    expect(groupPagePath(slug, "ro")).toBe(`/cursuri/curs/${slug}`);
    expect(groupPagePath(slug, "en")).toBe(`/en/courses/course/${slug}`);
    expect(languageCounterpart(`/cursuri/curs/${slug}`, "en")).toBe(
      `/en/courses/course/${slug}`,
    );
    expect(languageCounterpart(`/en/courses/course/${slug}`, "ro")).toBe(
      `/cursuri/curs/${slug}`,
    );
  });

  it("points search engines to the level page", () => {
    expect(levelPagePath("A1", "ro")).toBe("/cursuri/grup/a1");
    expect(levelPagePath("A1", "en")).toBe("/en/courses/group/a1");
  });
});
