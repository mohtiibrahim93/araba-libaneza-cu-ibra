import { describe, expect, it } from "vitest";
import {
  applyPlanChange,
  planOf,
  planOptions,
} from "../../supabase/functions/_shared/registration-plan";

const fakeAdmin = () => {
  const updates: Record<string, unknown>[] = [];
  return {
    updates,
    from: () => ({
      update: (v: Record<string, unknown>) => {
        updates.push(v);
        return { eq: async () => ({ error: null }) };
      },
    }),
  };
};

describe("registration payment plan", () => {
  it("treats a missing or unknown stored plan as monthly", () => {
    expect(planOf(null)).toBe("monthly");
    expect(planOf(undefined)).toBe("monthly");
    expect(planOf("weird")).toBe("monthly");
    expect(planOf("full")).toBe("full");
  });

  it("pay in full is the whole A1 online course minus 15%", () => {
    const o = planOptions({ form_type: "group", level: "A1", format: "online" });
    expect(o.monthly).toEqual({ amount: 50000, monthsTotal: 4 });
    expect(o.full.fullBase).toBe(200000);
    expect(o.full.amount).toBe(170000);
  });

  it("writes a buyer's switch to the row before pricing", async () => {
    const admin = fakeAdmin();
    const reg = { id: "r1", form_type: "group", plan: "monthly" };
    expect(await applyPlanChange(admin, reg, "full")).toBe("full");
    expect(admin.updates).toEqual([{ plan: "full" }]);
  });

  it("ignores plan changes for private lessons and junk values", async () => {
    const admin = fakeAdmin();
    expect(
      await applyPlanChange(admin, { id: "r", form_type: "private", plan: null }, "full"),
    ).toBe("monthly");
    expect(
      await applyPlanChange(admin, { id: "r", form_type: "group", plan: "full" }, "bogus"),
    ).toBe("full");
    expect(admin.updates).toEqual([]);
  });
});
