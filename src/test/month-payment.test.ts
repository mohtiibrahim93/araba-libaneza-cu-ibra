import { describe, expect, it } from "vitest";
import {
  monthPaymentCheck,
  type MonthPaymentCohort,
  type MonthPaymentRegistration,
} from "../../supabase/functions/_shared/month-payment";
import type { MonthPaymentRow } from "../../supabase/functions/_shared/group-months";

/**
 * "Pay the next month by card" (owner, 14 Nov 2026): a student whose months
 * were recorded by hand can pay the next one on the site. One month at a
 * time, the lowest month still open, at the group's own price when it has one.
 */
const reg = (
  over: Partial<MonthPaymentRegistration> = {},
): MonthPaymentRegistration => ({
  form_type: "group",
  payment_status: "paid",
  level: "A1",
  format: "fizic",
  months_total: 4,
  canceled_at: null,
  subscription_status: null,
  ...over,
});
const cohort = (
  over: Partial<MonthPaymentCohort> = {},
): MonthPaymentCohort => ({
  status: "in_progress",
  level: "A1",
  format: "fizic",
  start_date: "2026-09-02",
  price_lei: 500,
  ...over,
});
const row = (
  from: number,
  to: number,
  over: Partial<MonthPaymentRow> = {},
): MonthPaymentRow => ({
  kind: "month",
  method: "other",
  amount_lei: 500 * (to - from + 1),
  paid_at: "2026-11-13T12:00:00Z",
  month_from: from,
  month_to: to,
  ...over,
});
const check = (
  r: MonthPaymentRegistration,
  c: MonthPaymentCohort | null,
  rows: MonthPaymentRow[],
  today = "2026-11-15",
) => monthPaymentCheck({ registration: r, cohort: c, rows, today });

describe("which month a student can pay by card", () => {
  it("months 1–3 paid at the centre: month 4, at the group's own price", () => {
    expect(check(reg(), cohort(), [row(1, 3)])).toEqual({
      ok: true,
      month: 4,
      total: 4,
      amountBani: 50000,
      dueFrom: "2026-12-02",
      due: false,
    });
  });

  it("one month at a time, the lowest one still open", () => {
    const out = check(reg(), cohort(), [row(1, 1)]);
    expect(out).toMatchObject({ ok: true, month: 2, due: true });
  });

  it("a granted month is covered: with month 1 paid and month 4 granted, month 2 is next", () => {
    const out = check(
      reg({ format: "online" }),
      cohort({ format: "online", price_lei: null, start_date: "2026-11-07" }),
      [
        row(1, 1, { method: "transfer" }),
        row(4, 4, { kind: "credit", method: "credit", amount_lei: 0 }),
      ],
    );
    expect(out).toMatchObject({
      ok: true,
      month: 2,
      amountBani: 50000,
      dueFrom: "2026-12-07",
      due: false,
    });
  });

  it("uses the list price when the group has no price of its own", () => {
    const a2 = reg({ level: "A2", months_total: 7 });
    expect(
      check(a2, cohort({ level: "A2", price_lei: null }), [row(1, 3)]),
    ).toMatchObject({ ok: true, month: 4, total: 7, amountBani: 84000 });
    expect(
      check(a2, cohort({ level: "A2", price_lei: 600 }), [row(1, 3)]),
    ).toMatchObject({ ok: true, amountBani: 60000 });
  });

  it("a finished group can still be paid up", () => {
    expect(
      check(reg(), cohort({ status: "completed" }), [row(1, 2)]),
    ).toMatchObject({ ok: true, month: 3 });
  });

  it("a first month granted for free lets the student pay the second", () => {
    expect(
      check(reg({ payment_status: "unpaid" }), cohort(), [
        row(1, 1, { kind: "credit", method: "credit", amount_lei: 0 }),
      ]),
    ).toMatchObject({ ok: true, month: 2 });
  });
});

describe("who gets no button", () => {
  it("every month paid or granted, or a course paid in full", () => {
    expect(check(reg(), cohort(), [row(1, 4)])).toEqual({
      ok: false,
      reason: "all_paid",
    });
    expect(
      check(reg(), cohort(), [row(1, 4, { kind: "full", amount_lei: 1700 })]),
    ).toEqual({ ok: false, reason: "all_paid" });
    expect(check(reg({ payment_status: "free" }), cohort(), [])).toEqual({
      ok: false,
      reason: "all_paid",
    });
  });

  it("a card subscription charges the months by itself", () => {
    expect(
      check(reg({ subscription_status: "active" }), cohort(), [
        row(1, 1, { method: "card_online" }),
      ]),
    ).toEqual({ ok: false, reason: "subscription" });
    expect(
      check(reg({ subscription_status: "past_due" }), cohort(), [row(1, 1)]),
    ).toEqual({ ok: false, reason: "subscription" });
  });

  it("a student who left, or was refunded", () => {
    expect(
      check(reg({ canceled_at: "2026-11-13T19:41:07Z" }), cohort(), [
        row(1, 1),
      ]),
    ).toEqual({ ok: false, reason: "withdrawn" });
    expect(
      check(reg({ payment_status: "refunded" }), cohort(), [row(1, 1)]),
    ).toEqual({ ok: false, reason: "withdrawn" });
    // A cancelled subscription alone does not block: the student may have
    // stayed and now pays by hand. Leaving the group is what blocks.
    expect(
      check(reg({ subscription_status: "canceled" }), cohort(), [row(1, 2)]),
    ).toMatchObject({ ok: true, month: 3 });
  });

  it("a sign-up that has paid nothing yet goes through the normal checkout", () => {
    for (const status of ["unpaid", "pending", "failed", "expired"])
      expect(check(reg({ payment_status: status }), cohort(), [])).toEqual({
        ok: false,
        reason: "not_started",
      });
  });

  it("anything that is not a running group course", () => {
    expect(check(reg({ form_type: "private" }), cohort(), [])).toEqual({
      ok: false,
      reason: "not_group",
    });
    expect(check(reg(), null, [row(1, 1)])).toEqual({
      ok: false,
      reason: "no_group",
    });
    for (const status of ["draft", "cancelled"])
      expect(check(reg(), cohort({ status }), [row(1, 1)])).toEqual({
        ok: false,
        reason: "no_group",
      });
  });
});
