import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  bucharestDate,
  calendarDaysBetween,
  computeGroupCancelRefund,
} from "../../supabase/functions/_shared/group-refund";

// Owner's rule, 8 November 2026: 500 lei a month, 8 lessons, Stripe kept 10 lei.
const MONTH = 50_000;
const FEE = 1_000;
const START_DATE = "2026-11-02";
const charge = (chargedAt: string, amountBani = MONTH, id = "ch_1") => ({
  paymentId: id,
  amountBani,
  stripeFeeBani: FEE,
  chargedAt,
});
const NOVEMBER = [
  "2026-11-02T16:00:00Z",
  "2026-11-04T16:00:00Z",
  "2026-11-09T16:00:00Z",
  "2026-11-11T16:00:00Z",
  "2026-11-16T16:00:00Z",
  "2026-11-18T16:00:00Z",
  "2026-11-23T16:00:00Z",
  "2026-11-25T16:00:00Z",
];

describe("Bucharest calendar dates", () => {
  it("reads the date in Bucharest, not UTC", () => {
    // 22:30 UTC on 31 Oct is 00:30 on 1 Nov in Bucharest (UTC+2 after DST).
    expect(bucharestDate("2026-10-31T22:30:00Z")).toBe("2026-11-01");
    // Summer time: 21:30 UTC on 30 Jun is 00:30 on 1 Jul (UTC+3).
    expect(bucharestDate("2026-06-30T21:30:00Z")).toBe("2026-07-01");
  });

  it("counts whole calendar days", () => {
    expect(calendarDaysBetween("2026-10-26", "2026-11-02")).toBe(7);
    expect(calendarDaysBetween("2026-11-02", "2026-11-02")).toBe(0);
    // Across the end of DST (25 Oct 2026) a day is still a day.
    expect(calendarDaysBetween("2026-10-24", "2026-10-26")).toBe(2);
  });
});

describe("cancelling a monthly group", () => {
  it("7+ days before the start: the month back minus only the Stripe fee", () => {
    const r = computeGroupCancelRefund({
      charges: [charge("2026-10-20T10:00:00Z")],
      courseStartDate: START_DATE,
      sessionStarts: NOVEMBER,
      cancelledAt: "2026-10-26T10:00:00Z",
    });
    expect(r.case).toBe("before_start_full");
    expect(r.refundBani).toBe(49_000);
    expect(r.refunds).toEqual([{ paymentId: "ch_1", amountBani: 49_000 }]);
  });

  it("2 days before the start: still back minus only the Stripe fee", () => {
    const r = computeGroupCancelRefund({
      charges: [charge("2026-10-20T10:00:00Z")],
      courseStartDate: START_DATE,
      sessionStarts: NOVEMBER,
      cancelledAt: "2026-10-31T10:00:00Z",
    });
    expect(r.refundBani).toBe(49_000);
  });

  it("after lesson 1: 7 of 8 lessons back minus the Stripe fee", () => {
    const r = computeGroupCancelRefund({
      charges: [charge("2026-11-01T10:00:00Z")],
      courseStartDate: START_DATE,
      sessionStarts: NOVEMBER,
      currentPeriodEnd: "2026-12-01T10:00:00Z",
      cancelledAt: "2026-11-03T10:00:00Z",
    });
    expect(r.case).toBe("current_month");
    expect(r.eligibleBani).toBe(43_750);
    expect(r.refundBani).toBe(42_750); // 437.50 - 10
  });

  it("after lesson 3: no money back, the 5 unused lessons become credit", () => {
    const r = computeGroupCancelRefund({
      charges: [charge("2026-11-01T10:00:00Z")],
      courseStartDate: START_DATE,
      sessionStarts: NOVEMBER,
      currentPeriodEnd: "2026-12-01T10:00:00Z",
      cancelledAt: "2026-11-10T10:00:00Z",
    });
    expect(r.case).toBe("credit");
    expect(r.refundBani).toBe(0);
    expect(r.refunds).toEqual([]);
    expect(r.creditBani).toBe(31_250); // 312.50 lei
  });

  it("does not refund what was already refunded", () => {
    const r = computeGroupCancelRefund({
      charges: [{ ...charge("2026-10-20T10:00:00Z"), refundedBani: 10_000 }],
      courseStartDate: START_DATE,
      sessionStarts: NOVEMBER,
      cancelledAt: "2026-10-26T10:00:00Z",
    });
    expect(r.refundBani).toBe(39_000);
  });

  it("returns nothing when nothing was paid", () => {
    const r = computeGroupCancelRefund({
      charges: [],
      courseStartDate: START_DATE,
      sessionStarts: NOVEMBER,
      cancelledAt: "2026-10-26T10:00:00Z",
    });
    expect(r.case).toBe("nothing_paid");
    expect(r.refundBani).toBe(0);
  });
});

describe("the admin cancel uses the owner's rule", () => {
  const handler = readFileSync(
    resolve(process.cwd(), "supabase/functions/admin-registrations/index.ts"),
    "utf8",
  );

  it("computes the refund with computeGroupCancelRefund", () => {
    expect(handler).toContain('from "../_shared/group-refund.ts"');
    expect(handler).toContain("computeGroupCancelRefund(");
  });

  it("no longer uses the old 5-day prorated window", () => {
    expect(handler).not.toContain("GRACE_DAYS");
  });

  it("reads the cohort's real lessons", () => {
    const block = handler.slice(
      handler.indexOf('action === "cancel_subscription"'),
    );
    expect(block).toContain('.from("cohort_sessions")');
  });
});
