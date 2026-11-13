import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  groupPaymentSummary,
  groupPrices,
} from "@/components/admin/GroupPayment";
import { groupMonths } from "../../supabase/functions/_shared/group-months";
import { catchUpFee } from "../../supabase/functions/_shared/cohort-sessions";
import { groupMonthlyPrice } from "@/lib/pricing";

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

// Owner, 4 Nov 2026: months are tracked one by one (src/test/group-months.test.ts).
const summary = (rows: Array<[number, string]>, offline = 0) =>
  groupPaymentSummary({
    id: "r",
    name: "x",
    months_total: 4,
    offline_paid_lei: offline || null,
    payment_months: groupMonths({
      total: 4,
      startDate: "2026-11-07",
      rows: rows.map(([m, method]) => ({
        kind: method === "credit" ? "credit" : "month",
        method,
        amount_lei: method === "credit" ? 0 : 500,
        paid_at: "2026-11-03T12:00:00Z",
        month_from: m,
        month_to: m,
      })),
    }),
  });

describe("what the admin shows", () => {
  it("months covered and the total received outside the site", () => {
    expect(
      summary(
        [
          [1, "cash"],
          [2, "transfer"],
        ],
        1000,
      ),
    ).toBe("2/4 luni acoperite · 1.000 lei primiți în afara site-ului");
    expect(summary([])).toBeNull();
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
    expect(action).toContain("months_paid: covered");
    expect(action).toContain("month_from: range.from");
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

// Owner, 2 Nov 2026 (Andrada): a month given by private agreement, e.g.
// carried over from a previous course, covers a month of the new course but
// is not money: it counts in the months, never in the lei or payment_status.
describe("a month given by agreement", () => {
  it("shows in the months, not in the lei", () => {
    expect(
      summary(
        [
          [1, "credit"],
          [2, "cash"],
        ],
        500,
      ),
    ).toBe(
      "2/4 luni acoperite · 1 acordată · 500 lei primiți în afara site-ului",
    );
  });

  it("is stored with no amount and leaves payment_status alone", () => {
    const src = readFileSync(
      "supabase/functions/admin-registrations/index.ts",
      "utf8",
    );
    const action = src.slice(src.indexOf('action === "record_group_payment"'));
    expect(action).toContain('const amount = kind === "credit" ? 0');
    expect(action).toMatch(
      /\.\.\.\(kind === "credit"\s*\?\s*\{\}\s*:\s*\{\s*payment_status: "paid"/,
    );
    const sql = readFileSync(
      "supabase/migrations/20261103090000_group_seat_hold_two_hours.sql",
      "utf8",
    );
    expect(sql).toContain(
      "(kind = 'credit' and method = 'credit' and amount_lei = 0)",
    );
  });
});

// Owner, 11 Nov 2026: the two in-person groups that started in September 2026
// run at 500 lei (A1) and 600 lei (A2) a month. The price list does not
// change: a group's own price (group_cohorts.price_lei) applies to that group
// only.
describe("a group's own monthly price", () => {
  it("leaves the list price alone when the group has none", () => {
    expect(groupMonthlyPrice("A1", "fizic")).toBe(700);
    expect(groupMonthlyPrice("A2", "fizic")).toBe(840);
    expect(groupMonthlyPrice("A1", "fizic", null)).toBe(700);
    expect(groupMonthlyPrice("A1", "fizic", 0)).toBe(700);
    expect(groupMonthlyPrice("A1", "fizic", "")).toBe(700);
  });

  it("wins over the list for that group", () => {
    expect(groupMonthlyPrice("A1", "fizic", 500)).toBe(500);
    expect(groupMonthlyPrice("A2", "fizic", 600)).toBe(600);
    expect(groupMonthlyPrice("A2", "fizic", "600")).toBe(600);
  });

  it("is what the catch-up of a running group is counted from", () => {
    // 20 lessons missed = 3 months started.
    expect(catchUpFee(20, groupMonthlyPrice("A2", "fizic"))).toBe(2_520);
    expect(catchUpFee(20, groupMonthlyPrice("A2", "fizic", 600))).toBe(1_800);
    // At most 4 lessons missed stays 200 lei whatever the group costs.
    expect(catchUpFee(4, groupMonthlyPrice("A2", "fizic", 600))).toBe(200);
  });

  it("is what the admin's payment amounts start from", () => {
    const p = groupPrices({
      id: "r",
      name: "x",
      level: "A1",
      cohort: { level: "A1", format: "fizic", price_lei: 500 },
    });
    expect(p).toEqual({ monthly: 500, months: 4, full: 1700 });
    const a2 = groupPrices({
      id: "r",
      name: "x",
      level: "A2",
      cohort: { level: "A2", format: "fizic", price_lei: 600 },
    });
    expect(a2.monthly).toBe(600);
    expect(a2.months).toBe(7);
  });

  it("reaches both places from the group's row", () => {
    const panel = readFileSync("src/components/RunningGroups.tsx", "utf8");
    expect(panel).toContain(
      "groupMonthlyPrice(g.level, g.format, g.price_lei)",
    );
    const admin = readFileSync(
      "supabase/functions/admin-registrations/index.ts",
      "utf8",
    );
    expect(admin).toContain("price_lei: c.price_lei ?? null");
  });
});

// Owner, 13 Nov 2026: students of the in-person groups pay the centre
// (Raduga), not the school. The owner records "Plătit la centru".
describe("paid at the centre", () => {
  it("is a method the owner can choose, with its own label", async () => {
    const m = await import("../../supabase/functions/_shared/group-months");
    expect(m.MANUAL_METHODS).toContain("center");
    expect(m.MONTH_METHODS).toContain("center");
    expect(m.MONTH_METHOD_LABELS.center).toBe("Plătit la centru");
    // Not a bank transfer or a card of ours: no bank to name.
    expect(m.PROVIDER_METHODS).not.toContain("center");
    expect(m.cleanProvider("center", "Revolut")).toBeNull();
  });

  it("counts as a paid month like any other payment outside the site", () => {
    const s = groupMonths({
      total: 4,
      startDate: "2026-09-02",
      today: "2026-11-13",
      rows: [
        {
          kind: "month",
          method: "center",
          amount_lei: 1500,
          paid_at: "2026-11-13T12:00:00.000Z",
          month_from: 1,
          month_to: 3,
        },
      ],
    });
    expect(s.status).toBe("up_to_date");
    expect(s.covered).toBe(3);
    expect(s.months[0]?.state).toBe("paid_offline");
  });

  it("is accepted by the database and by the manual sign-up", () => {
    const sql = readFileSync(
      "supabase/migrations/20261113120000_payment_method_center.sql",
      "utf8",
    );
    expect(sql).toContain("registration_payments_method_check");
    expect(sql).toContain("registrations_payment_method_check");
    expect(sql.match(/'center'/g)?.length).toBe(2);
    expect(
      readFileSync("supabase/functions/admin-registrations/index.ts", "utf8"),
    ).toContain('["cash", "transfer", "card", "paypal", "center"]');
    expect(
      readFileSync("src/components/admin/ManualStudentForm.tsx", "utf8"),
    ).toContain('["center", "Plătit la centru"]');
  });
});
