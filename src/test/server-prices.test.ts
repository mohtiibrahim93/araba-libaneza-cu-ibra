import { describe, expect, it } from "vitest";
import {
  GROUP_MONTHLY_ONLINE,
  PRIVATE_LESSON,
  groupMonthlyUnitAmount,
  privateLessonUnitAmount,
} from "../../supabase/functions/_shared/prices";
import { ONLINE_PRICES, physicalPrice } from "@/lib/pricing";

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
});
