import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  groupPaymentSummary,
  groupPrices,
} from "@/components/admin/GroupPayment";

// Owner, 1 Nov 2026: a group course paid in cash or by transfer is recorded as
// one month or the whole course (-15%), with the amount received.
describe("group payment prices", () => {
  it("A1 online: 500 a month, 4 months, 1 700 in full", () => {
    expect(
      groupPrices({ id: "r", name: "x", level: "A1", format: "online" }),
    ).toEqual({
      monthly: 500,
      months: 4,
      full: 1700,
    });
  });

  it("uses the group's level and format, in person +40%", () => {
    const p = groupPrices({
      id: "r",
      name: "x",
      level: "A2",
      cohort: { level: "A1", format: "fizic" },
    });
    expect(p.monthly).toBe(700);
    expect(p.full).toBe(Math.round(700 * 4 * 0.85));
  });
});

describe("what the admin shows", () => {
  it("monthly progress and the total received", () => {
    expect(
      groupPaymentSummary({
        id: "r",
        name: "x",
        months_paid: 2,
        months_total: 4,
        offline_paid_lei: 1000,
        payment_plan: "monthly",
      }),
    ).toBe("Lunar 2/4 luni · 1.000 lei");
    expect(
      groupPaymentSummary({
        id: "r",
        name: "x",
        months_paid: 4,
        months_total: 4,
        offline_paid_lei: 1700,
        payment_plan: "full",
      }),
    ).toBe("Integral · 1.700 lei");
    expect(groupPaymentSummary({ id: "r", name: "x" })).toBeNull();
  });
});

describe("server and database", () => {
  it("records the payment, advances months and logs it", () => {
    const src = readFileSync(
      "supabase/functions/admin-registrations/index.ts",
      "utf8",
    );
    const action = src.slice(src.indexOf('action === "record_group_payment"'));
    expect(action).toMatch(/\.from\("registration_payments"\)\s*\.insert\(/);
    expect(action).toContain("months_paid: monthsPaid");
    expect(action).toContain('action: "record_group_payment"');
  });

  it("the payments table is service-role only", () => {
    const sql = readFileSync(
      "supabase/migrations/20261102130000_registration_payments.sql",
      "utf8",
    );
    expect(sql).toContain("enable row level security");
    expect(sql).not.toMatch(/create policy/i);
  });
});
