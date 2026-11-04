import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  groupPaymentSummary,
  groupPrices,
} from "@/components/admin/GroupPayment";
import { groupMonths } from "../../supabase/functions/_shared/group-months";

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
