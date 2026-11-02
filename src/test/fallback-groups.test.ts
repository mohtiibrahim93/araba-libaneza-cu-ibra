import { describe, expect, it } from "vitest";
import {
  FALLBACK_COURSES,
  fallbackCourseBySlug,
  fallbackCohorts,
} from "@/data/fallbackGroups";

describe("backup groups when the database is offline", () => {
  it("lists the 7 November 2026 online A1 group with 4 of 6 places free", () => {
    const g = FALLBACK_COURSES.find((c) => c.start_date === "2026-11-07");
    expect(g?.format).toBe("online");
    expect(g?.level).toBe("A1");
    expect(g?.max_seats).toBe(6);
    expect(g?.seatsLeft).toBe(4);
  });

  it("its group page resolves by slug", () => {
    expect(
      fallbackCourseBySlug("a1-online-romana-grupa-2-7-noiembrie-2026")?.start_date,
    ).toBe("2026-11-07");
  });

  it("is not offered to English-taught or in-person filters", () => {
    expect(fallbackCohorts("group", "A1", "fizic", "ro").length).toBe(0);
    expect(fallbackCohorts("group", "A1", "online", "en").length).toBe(0);
  });
});
