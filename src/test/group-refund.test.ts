import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  MONTH_REFUND_WINDOW_DAYS,
  bucharestDate,
  calendarDaysBetween,
  computeGroupCancelRefund,
} from "../../supabase/functions/_shared/group-refund";

// The worked example in the Terms: 500 lei a month, 8 lessons a month.
const MONTH = 50_000;
// Course starts Monday 2 November 2026; charged on 1 November.
const START_DATE = "2026-11-02";
const charge = (chargedAt: string, amountBani = MONTH, id = "ch_1") => ({
  paymentId: id,
  amountBani,
  chargedAt,
});
// Eight lessons in November, two a week, 18:00 Bucharest (16:00 UTC).
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
const DECEMBER = [
  "2026-12-02T16:00:00Z",
  "2026-12-07T16:00:00Z",
  "2026-12-09T16:00:00Z",
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

describe("cancelling a monthly group before the course starts", () => {
  it("refunds the first month in full 7 or more days before", () => {
    const r = computeGroupCancelRefund({
      charges: [charge("2026-10-20T10:00:00Z")],
      courseStartDate: START_DATE,
      sessionStarts: NOVEMBER,
      cancelledAt: "2026-10-26T10:00:00Z", // 7 days before
    });
    expect(r.case).toBe("before_start_full");
    expect(r.daysBeforeStart).toBe(7);
    expect(r.feeBani).toBe(0);
    expect(r.refundBani).toBe(50_000);
    expect(r.refunds).toEqual([{ paymentId: "ch_1", amountBani: 50_000 }]);
  });

  it("keeps 10% less than 7 days before", () => {
    const r = computeGroupCancelRefund({
      charges: [charge("2026-10-20T10:00:00Z")],
      courseStartDate: START_DATE,
      sessionStarts: NOVEMBER,
      cancelledAt: "2026-10-30T10:00:00Z", // 3 days before
    });
    expect(r.case).toBe("before_start_fee");
    expect(r.daysBeforeStart).toBe(3);
    expect(r.feeBani).toBe(5_000);
    expect(r.refundBani).toBe(45_000);
  });

  it("decides 'before' by the Bucharest date, not UTC", () => {
    // 22:30 UTC on 25 Oct is already 26 Oct in Bucharest: 7 days, full.
    const r = computeGroupCancelRefund({
      charges: [charge("2026-10-20T10:00:00Z")],
      courseStartDate: START_DATE,
      sessionStarts: NOVEMBER,
      cancelledAt: "2026-10-25T22:30:00Z",
    });
    expect(r.cancelDate).toBe("2026-10-26");
    expect(r.case).toBe("before_start_full");
  });

  it("does not refund what was already refunded", () => {
    const r = computeGroupCancelRefund({
      charges: [{ ...charge("2026-10-20T10:00:00Z"), refundedBani: 10_000 }],
      courseStartDate: START_DATE,
      sessionStarts: NOVEMBER,
      cancelledAt: "2026-10-22T10:00:00Z",
    });
    expect(r.refundBani).toBe(40_000);
  });
});

describe("cancelling a monthly group after the course started", () => {
  it("is the Terms example: charged on the 1st, cancelled on the 5th after 2 of 8 lessons", () => {
    const r = computeGroupCancelRefund({
      charges: [charge("2026-11-01T08:00:00Z")],
      courseStartDate: "2026-11-02",
      sessionStarts: [...NOVEMBER, ...DECEMBER],
      currentPeriodEnd: "2026-12-01T08:00:00Z",
      cancelledAt: "2026-11-05T09:00:00Z",
    });
    expect(r.case).toBe("current_month");
    expect(r.daysSinceCharge).toBe(4);
    expect(r.lessonsInMonth).toBe(8);
    expect(r.lessonsHeld).toBe(2);
    expect(r.lessonsNotHeld).toBe(6);
    expect(r.eligibleBani).toBe(37_500);
    expect(r.feeBani).toBe(3_750);
    expect(r.refundBani).toBe(33_750);
    expect(r.refunds).toEqual([{ paymentId: "ch_1", amountBani: 33_750 }]);
  });

  it("refunds nothing for that month more than 7 days after its charge", () => {
    const r = computeGroupCancelRefund({
      charges: [charge("2026-11-01T08:00:00Z")],
      courseStartDate: "2026-11-02",
      sessionStarts: NOVEMBER,
      currentPeriodEnd: "2026-12-01T08:00:00Z",
      cancelledAt: "2026-11-12T09:00:00Z",
    });
    expect(r.case).toBe("outside_window");
    expect(r.daysSinceCharge).toBe(11);
    expect(r.refundBani).toBe(0);
    expect(r.refunds).toEqual([]);
  });

  it("still refunds on the 7th day after the charge", () => {
    const r = computeGroupCancelRefund({
      charges: [charge("2026-11-01T08:00:00Z")],
      courseStartDate: "2026-11-02",
      sessionStarts: NOVEMBER,
      currentPeriodEnd: "2026-12-01T08:00:00Z",
      cancelledAt: "2026-11-08T09:00:00Z",
    });
    expect(r.daysSinceCharge).toBe(MONTH_REFUND_WINDOW_DAYS);
    expect(r.case).toBe("current_month");
    // Held by then: 2, 4 Nov. Six left.
    expect(r.refundBani).toBe(33_750);
  });

  it("never refunds earlier months, only the current one", () => {
    const r = computeGroupCancelRefund({
      charges: [
        charge("2026-11-01T08:00:00Z", MONTH, "ch_nov"),
        charge("2026-12-01T08:00:00Z", MONTH, "ch_dec"),
      ],
      courseStartDate: "2026-11-02",
      sessionStarts: [...NOVEMBER, ...DECEMBER],
      currentPeriodEnd: "2027-01-01T08:00:00Z",
      cancelledAt: "2026-12-03T09:00:00Z",
    });
    expect(r.case).toBe("current_month");
    // December holds 3 known lessons; 1 held (2 Dec), 2 left.
    expect(r.lessonsInMonth).toBe(3);
    expect(r.lessonsNotHeld).toBe(2);
    expect(r.refunds.map((l) => l.paymentId)).toEqual(["ch_dec"]);
    expect(r.eligibleBani).toBe(33_333);
    expect(r.feeBani).toBe(3_333);
    expect(r.refundBani).toBe(30_000);
  });

  it("counts lessons from the real sessions, whatever their number", () => {
    // A month with a break: only 5 lessons, 1 held.
    const r = computeGroupCancelRefund({
      charges: [charge("2026-11-01T08:00:00Z")],
      courseStartDate: "2026-11-02",
      sessionStarts: NOVEMBER.slice(0, 5),
      currentPeriodEnd: "2026-12-01T08:00:00Z",
      cancelledAt: "2026-11-03T09:00:00Z",
    });
    expect(r.lessonsInMonth).toBe(5);
    expect(r.lessonsNotHeld).toBe(4);
    expect(r.refundBani).toBe(36_000); // 500 x 4/5 = 400, minus 40
  });

  it("treats the start day itself as started", () => {
    const r = computeGroupCancelRefund({
      charges: [charge("2026-11-01T08:00:00Z")],
      courseStartDate: "2026-11-02",
      sessionStarts: NOVEMBER,
      currentPeriodEnd: "2026-12-01T08:00:00Z",
      cancelledAt: "2026-11-02T09:00:00Z",
    });
    expect(r.case).toBe("current_month");
    expect(r.lessonsNotHeld).toBe(8);
    expect(r.refundBani).toBe(45_000);
  });

  it("returns nothing when nothing was paid", () => {
    const r = computeGroupCancelRefund({
      charges: [],
      courseStartDate: "2026-11-02",
      sessionStarts: NOVEMBER,
      cancelledAt: "2026-11-05T09:00:00Z",
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
