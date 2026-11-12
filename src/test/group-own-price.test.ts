import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  groupFullCourseUnitAmount,
  groupMonthlyUnitAmount,
} from "../../supabase/functions/_shared/prices";
import {
  groupOwnPrice,
  planOptions,
} from "../../supabase/functions/_shared/registration-plan";

// Owner, 11 Nov 2026: the two in-person groups that started in September 2026
// run at 500 lei (A1) and 600 lei (A2) a month, and a student of those groups
// who pays by card pays that price. The price table does not change: a group's
// own price (group_cohorts.price_lei) applies to that group only.

/** A stand-in for the service client: answers one group_cohorts read. */
const reader = (row: { price_lei?: unknown } | null, error: unknown = null) => {
  const calls: Array<{ table: string; column: string; value: string }> = [];
  return {
    calls,
    from: (table: string) => ({
      select: () => ({
        eq: (column: string, value: string) => ({
          maybeSingle: async () => {
            calls.push({ table, column, value });
            return { data: row, error };
          },
        }),
      }),
    }),
  };
};

describe("what Stripe charges for a group with its own price", () => {
  it("keeps the table price when the group has none", () => {
    expect(groupMonthlyUnitAmount("A1", "fizic")).toBe(70_000);
    expect(groupMonthlyUnitAmount("A2", "fizic")).toBe(84_000);
    expect(groupMonthlyUnitAmount("A1", "fizic", null)).toBe(70_000);
    expect(groupMonthlyUnitAmount("A1", "fizic", 0)).toBe(70_000);
    expect(groupMonthlyUnitAmount("A1", "fizic", "")).toBe(70_000);
    expect(groupMonthlyUnitAmount("A1", "fizic", -5)).toBe(70_000);
    expect(groupMonthlyUnitAmount("A1", "fizic", "abc")).toBe(70_000);
  });

  it("charges the group's own monthly price", () => {
    expect(groupMonthlyUnitAmount("A1", "fizic", 500)).toBe(50_000);
    expect(groupMonthlyUnitAmount("A2", "fizic", 600)).toBe(60_000);
    expect(groupMonthlyUnitAmount("A2", "fizic", "600")).toBe(60_000);
  });

  it("counts the whole course from the group's own price, less 15%", () => {
    // A1: 4 months x 500 = 2000, -15% = 1700. A2: 7 x 600 = 4200, -15% = 3570.
    expect(groupFullCourseUnitAmount("A1", "fizic", 500)).toBe(170_000);
    expect(groupFullCourseUnitAmount("A2", "fizic", 600)).toBe(357_000);
    // Unchanged without one: 4 x 700 = 2800, -15% = 2380.
    expect(groupFullCourseUnitAmount("A1", "fizic")).toBe(238_000);
  });

  it("shows the same amounts on /checkout", () => {
    const reg = { form_type: "group", level: "A2", format: "fizic" };
    expect(planOptions(reg, 600)).toEqual({
      monthly: { amount: 60_000, monthsTotal: 7 },
      full: { amount: 357_000, fullBase: 420_000 },
    });
    expect(planOptions(reg).monthly.amount).toBe(84_000);
    expect(planOptions(reg, null).monthly.amount).toBe(84_000);
  });

  it("never applies a group price to a kids registration", () => {
    const kids = { form_type: "kids", level: null, format: "fizic" };
    expect(planOptions(kids, 500)).toEqual(planOptions(kids));
  });
});

describe("reading the group's own price", () => {
  it("reads it from the group the registration row points at", async () => {
    const db = reader({ price_lei: 500 });
    await expect(
      groupOwnPrice(db, { form_type: "group", cohort_id: "c1" }),
    ).resolves.toBe(500);
    expect(db.calls).toEqual([
      { table: "group_cohorts", column: "id", value: "c1" },
    ]);
  });

  it("is null when the group follows the table", async () => {
    for (const row of [{ price_lei: null }, { price_lei: 0 }, {}, null])
      await expect(
        groupOwnPrice(reader(row), { form_type: "group", cohort_id: "c1" }),
      ).resolves.toBeNull();
  });

  it("does not look anything up without a group, or for another course", async () => {
    const db = reader({ price_lei: 500 });
    await expect(
      groupOwnPrice(db, { form_type: "group", cohort_id: null }),
    ).resolves.toBeNull();
    await expect(
      groupOwnPrice(db, { form_type: "private", cohort_id: "c1" }),
    ).resolves.toBeNull();
    await expect(
      groupOwnPrice(db, { form_type: "kids", cohort_id: "c1" }),
    ).resolves.toBeNull();
    expect(db.calls).toEqual([]);
  });

  it("stops the payment when the group cannot be read", async () => {
    // Carrying on would charge the table price: for a group with a lower
    // price of its own, that is an overcharge.
    await expect(
      groupOwnPrice(reader(null, { message: "boom" }), {
        form_type: "group",
        cohort_id: "c1",
      }),
    ).rejects.toThrow("Could not read the group's price");
  });
});

describe("every card payment path uses it", () => {
  const src = (fn: string) =>
    readFileSync(`supabase/functions/${fn}/index.ts`, "utf8");

  it("the monthly subscription", () => {
    const s = src("create-subscription");
    expect(s).toContain("await groupOwnPrice(supabaseAdmin, regRow)");
    expect(s).toContain("planOptions(regRow, ownPrice)");
    expect(s).toContain(
      "groupMonthlyUnitAmount(regRow.level, regRow.format, ownPrice)",
    );
  });

  it("the whole course in one payment", () => {
    const s = src("create-payment-intent");
    expect(s).toContain("await groupOwnPrice(supabaseAdmin, regRow)");
    expect(s).toContain("planOptions(regRow, ownPrice)");
    expect(s).toContain(
      "groupFullCourseUnitAmount(regRow.level, regRow.format, ownPrice)",
    );
    expect(s).toContain(
      "groupMonthlyUnitAmount(regRow.level, regRow.format, ownPrice)",
    );
  });

  it("the hosted checkout, both plans and the quote", () => {
    const s = src("create-checkout-session");
    expect(s).toContain("await groupOwnPrice(supabaseAdmin, reg)");
    expect(s).toContain("planOptions(reg, ownPrice)");
    expect(s).toContain(
      "groupMonthlyUnitAmount(reg.level, reg.format, ownPrice)",
    );
    expect(s).toContain(
      "groupFullCourseUnitAmount(reg.level, reg.format, ownPrice)",
    );
  });

  it("the older one-off checkout", () => {
    const s = src("create-checkout");
    expect(s).toContain("ownPrice = await groupOwnPrice(adminClient, regRow)");
    expect(s).not.toContain(
      "groupMonthlyUnitAmount(existingReg?.level, existingReg?.format)",
    );
  });

  it("no path prices a group from the table alone any more", () => {
    for (const fn of [
      "create-subscription",
      "create-payment-intent",
      "create-checkout-session",
      "create-checkout",
    ]) {
      const s = src(fn);
      expect(s, fn).not.toMatch(
        /group(Monthly|FullCourse)UnitAmount\(\s*[\w.?]+level,\s*[\w.?]+format\s*\)/,
      );
      expect(s, fn).not.toMatch(/planOptions\(\s*\w+\s*\)/);
    }
  });
});
