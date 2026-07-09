import { describe, expect, it } from "vitest";
import {
  GROUP_MONTHLY_ONLINE,
  GROUP_MONTHS,
  PRIVATE_LESSON,
  groupMonthlyUnitAmount,
  groupMonthsFor,
  privateLessonUnitAmount,
} from "../../supabase/functions/_shared/prices";
import { GROUP_COURSE_MONTHS, ONLINE_PRICES, physicalPrice } from "@/lib/pricing";
import { getCurriculum } from "@/data/curriculum";

describe("server-side Stripe price table (supabase/functions/_shared/prices.ts)", () => {
  it("matches the prices the site displays (src/lib/pricing.ts)", () => {
    expect(GROUP_MONTHLY_ONLINE).toEqual(ONLINE_PRICES.groupMonthly);
    expect(PRIVATE_LESSON).toBe(ONLINE_PRICES.privateLesson);
  });

  it("charges each group level its own monthly rate, in bani", () => {
    expect(groupMonthlyUnitAmount("A1", "online")).toBe(50000);
    expect(groupMonthlyUnitAmount("A2", "online")).toBe(60000);
    expect(groupMonthlyUnitAmount("B1", "online")).toBe(70000);
    expect(groupMonthlyUnitAmount("B2", "online")).toBe(80000);
    expect(groupMonthlyUnitAmount("C1", "online")).toBe(90000);
    expect(groupMonthlyUnitAmount("C2", "online")).toBe(100000);
  });

  it("applies the +40% in-center surcharge, matching physicalPrice()", () => {
    for (const level of ["A1", "A2", "B1", "B2", "C1", "C2"] as const) {
      expect(groupMonthlyUnitAmount(level, "fizic")).toBe(
        physicalPrice(ONLINE_PRICES.groupMonthly[level]) * 100,
      );
    }
    expect(groupMonthlyUnitAmount("A1", "fizic")).toBe(70000);
    expect(groupMonthlyUnitAmount("A2", "fizic")).toBe(84000);
  });

  it("is case-insensitive on level and never overcharges on missing data", () => {
    expect(groupMonthlyUnitAmount("a2", "online")).toBe(60000);
    // Unknown or missing level/format falls back to the cheapest option.
    expect(groupMonthlyUnitAmount(null, "online")).toBe(50000);
    expect(groupMonthlyUnitAmount(undefined, undefined)).toBe(50000);
    expect(groupMonthlyUnitAmount("Z9", "weird")).toBe(50000);
    expect(groupMonthlyUnitAmount("A2", null)).toBe(60000);
  });

  it("prices private lessons flat at 150 RON", () => {
    expect(privateLessonUnitAmount()).toBe(15000);
  });

  it("bills each group level ceil(lessons / 8) monthly charges", () => {
    // Server table and client mirror must agree (Stripe bills the server value).
    expect(GROUP_MONTHS).toEqual(GROUP_COURSE_MONTHS);
    // And both must match ceil(total_lessons / 8) from the curriculum source.
    for (const lvl of getCurriculum("ro")) {
      const key = lvl.id.toUpperCase() as keyof typeof GROUP_MONTHS;
      expect(GROUP_MONTHS[key]).toBe(Math.ceil(lvl.lessons / 8));
    }
    expect(GROUP_MONTHS.A1).toBe(4);
    expect(GROUP_MONTHS.A2).toBe(7);
    expect(GROUP_MONTHS.C2).toBe(10);
  });

  it("groupMonthsFor is case-insensitive and falls back to the shortest course", () => {
    expect(groupMonthsFor("A2")).toBe(7);
    expect(groupMonthsFor("c2")).toBe(10);
    expect(groupMonthsFor(null)).toBe(4);
    expect(groupMonthsFor(undefined)).toBe(4);
    expect(groupMonthsFor("Z9")).toBe(4);
  });
});
