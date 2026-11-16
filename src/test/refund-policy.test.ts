import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  CANCEL_FEE_RATE,
  COURSE_LESSONS,
  FULL_REFUND_DAYS,
  LESSONS_PER_MONTH,
  NEW_REFUND_RULES_FROM,
  WITHDRAWAL_DAYS,
  cancelFeeRateFor,
  computeRefund,
  formatBani,
  withdrawalDaysFor,
  withinWithdrawal,
} from "../../supabase/functions/_shared/refund";
import { computeGroupCancelRefund } from "../../supabase/functions/_shared/group-refund";
import { getCurriculum } from "@/data/curriculum";

// Owner's rule, 8 November 2026. A course paid in full: 2000 lei over 32
// lessons, 8 a month; Stripe kept 30 lei.
const COURSE = {
  paidBani: 200_000,
  totalLessons: 32,
  stripeFeeBani: 3_000,
  lessonsPerMonth: LESSONS_PER_MONTH,
};
const START = "2026-10-01T17:00:00.000Z";
const STARTED = "2026-10-15T17:00:00.000Z";

describe("refund policy for a course paid in full", () => {
  it("keeps the lesson totals in step with the curriculum", () => {
    const levels = getCurriculum("ro");
    expect(levels.length).toBeGreaterThan(0);
    for (const level of levels)
      expect(COURSE_LESSONS[level.id.toUpperCase()], level.id).toBe(
        level.lessons,
      );
  });

  it("7+ days before the start: everything back minus only the Stripe fee", () => {
    const r = computeRefund({
      ...COURSE,
      lessonsTaken: 0,
      courseStartsAt: START,
      cancelledAt: "2026-09-24T17:00:00.000Z",
    });
    expect(r.tier).toBe("full");
    expect(r.daysBeforeStart).toBe(FULL_REFUND_DAYS);
    expect(r.feeBani).toBe(3_000);
    expect(r.refundBani).toBe(197_000);
  });

  it("less than 7 days before the start: also everything back minus the Stripe fee", () => {
    const r = computeRefund({
      ...COURSE,
      lessonsTaken: 0,
      courseStartsAt: START,
      cancelledAt: "2026-09-29T17:00:00.000Z",
    });
    expect(r.refundBani).toBe(197_000);
  });

  it("after lesson 1 (test lesson): only that lesson and the Stripe fee are kept", () => {
    const r = computeRefund({
      ...COURSE,
      lessonsTaken: 1,
      courseStartsAt: START,
      cancelledAt: STARTED,
    });
    expect(r.tier).toBe("pro-rata");
    expect(r.nonRefundableBani).toBe(6_250); // 62.50 lei
    expect(r.creditBani).toBe(0);
    expect(r.refundBani).toBe(190_750); // 2000 - 62.50 - 30
  });

  it("after lesson 2 the money still comes back for the unused lessons", () => {
    const r = computeRefund({
      ...COURSE,
      lessonsTaken: 2,
      courseStartsAt: START,
      cancelledAt: STARTED,
    });
    expect(r.refundBani).toBe(200_000 - 12_500 - 3_000);
  });

  it("after lesson 3: the running month becomes credit, later months come back", () => {
    const r = computeRefund({
      ...COURSE,
      lessonsTaken: 5,
      courseStartsAt: START,
      cancelledAt: STARTED,
    });
    expect(r.tier).toBe("credit");
    expect(r.nonRefundableBani).toBe(31_250); // 312.50 used
    expect(r.creditBani).toBe(18_750); // 187.50 credit
    expect(r.refundBani).toBe(147_000); // 1500 - 30
  });

  it("never lets the parts drift from the total", () => {
    for (let taken = 0; taken <= 32; taken++) {
      const r = computeRefund({
        ...COURSE,
        lessonsTaken: taken,
        courseStartsAt: START,
        cancelledAt: STARTED,
      });
      expect(
        r.nonRefundableBani + r.creditBani + r.feeBani + r.refundBani,
      ).toBe(COURSE.paidBani);
      expect(r.refundBani).toBeGreaterThanOrEqual(0);
    }
  });

  it("refunds nothing in the last month once lesson 2 has passed", () => {
    const r = computeRefund({
      ...COURSE,
      lessonsTaken: 26,
      courseStartsAt: START,
      cancelledAt: "2027-01-20T17:00:00.000Z",
    });
    expect(r.refundBani).toBe(0);
    expect(r.feeBani).toBe(0);
    expect(r.creditBani).toBe(37_500); // 6 lessons left in month 4
  });

  it("private lessons: unused lessons always come back, minus the Stripe fee", () => {
    const r = computeRefund({
      paidBani: 45_000, // 3 x 150 lei
      totalLessons: 3,
      lessonsTaken: 2,
      courseStartsAt: null,
      stripeFeeBani: 800,
    });
    expect(r.tier).toBe("pro-rata");
    expect(r.refundBani).toBe(15_000 - 800);
  });

  it("formats bani the way the admin displays money", () => {
    expect(formatBani(151_875).replace(/\u00a0/g, " ")).toBe("1.518,75 lei");
    expect(formatBani(0)).toBe("0,00 lei");
  });
});

/**
 * Owner's rules of 14 November 2026, for sign-ups made from the day the new
 * Terms are published and for nobody enrolled before. One thing changes in
 * the arithmetic: the months not started of a course paid in full come back
 * minus a 10% "taxă administrativă de anulare". The month in progress still
 * becomes credit (owner, 16 November 2026).
 */
describe("new sign-ups: 10% kept from the months not started", () => {
  // A1 in person paid in full with the 15% discount: 2,380 lei, 595 a month.
  const FULL = {
    paidBani: 238_000,
    totalLessons: 32,
    stripeFeeBani: 3_600,
    lessonsPerMonth: LESSONS_PER_MONTH,
    cancelFeeRate: CANCEL_FEE_RATE,
    courseStartsAt: START,
    cancelledAt: "2026-12-02T10:00:00.000Z",
  };

  it("the owner's example: left after 2 months, 1,190 − 10% = 1,071 lei, minus the Stripe fee", () => {
    const r = computeRefund({ ...FULL, lessonsTaken: 16 });
    expect(r.tier).toBe("credit");
    expect(r.nonRefundableBani).toBe(119_000);
    expect(r.creditBani).toBe(0);
    expect(r.cancelFeeBani).toBe(11_900);
    expect(r.feeBani).toBe(3_600);
    expect(r.refundBani).toBe(107_100 - 3_600);
  });

  it("the month in progress is still credit; the 10% is on the months not started only", () => {
    // 11 lessons: 3 into month 2. Its 5 unused lessons are credit, months 3
    // and 4 (1,190 lei) come back minus 10%.
    const r = computeRefund({ ...FULL, lessonsTaken: 11 });
    expect(r.creditBani).toBe(37_187);
    expect(r.cancelFeeBani).toBe(11_900);
    expect(r.refundBani).toBe(107_100 - 3_600);
  });

  it("keeps nothing extra before the second lesson is over, or before the start", () => {
    for (const lessonsTaken of [0, 1, 2])
      expect(computeRefund({ ...FULL, lessonsTaken }).cancelFeeBani).toBe(0);
    const early = computeRefund({
      ...FULL,
      lessonsTaken: 0,
      cancelledAt: "2026-09-20T10:00:00.000Z",
    });
    expect(early.tier).toBe("full");
    expect(early.cancelFeeBani).toBe(0);
    expect(early.refundBani).toBe(238_000 - 3_600);
  });

  it("does not touch private lessons", () => {
    const r = computeRefund({
      paidBani: 150_000,
      totalLessons: 10,
      lessonsTaken: 4,
      stripeFeeBani: 2_000,
      lessonsPerMonth: null,
      cancelFeeRate: CANCEL_FEE_RATE,
    });
    expect(r.cancelFeeBani).toBe(0);
    expect(r.refundBani).toBe(90_000 - 2_000);
  });

  it("never goes below 0, and every ban is accounted for", () => {
    const tiny = computeRefund({
      ...FULL,
      paidBani: 3_200,
      stripeFeeBani: 5_000,
      lessonsTaken: 24,
    });
    expect(tiny.refundBani).toBe(0);
    for (let lessonsTaken = 0; lessonsTaken <= 32; lessonsTaken++) {
      const r = computeRefund({ ...FULL, lessonsTaken });
      expect(r.refundBani).toBeGreaterThanOrEqual(0);
      expect(
        r.nonRefundableBani +
          r.creditBani +
          r.cancelFeeBani +
          r.feeBani +
          r.refundBani,
        `after ${lessonsTaken} lessons`,
      ).toBe(238_000);
    }
  });

  it("is for sign-ups from the day the new Terms are published, by the Bucharest calendar", () => {
    const from = "2026-12-01";
    // 30 Nov 23:59 in Bucharest is still the earlier Terms.
    expect(cancelFeeRateFor("2026-11-30T21:59:00.000Z", from)).toBe(0);
    expect(cancelFeeRateFor("2026-11-30T22:00:00.000Z", from)).toBe(0.1);
    expect(cancelFeeRateFor("2027-02-01T10:00:00.000Z", from)).toBe(0.1);
    // Not published, or no usable sign-up date: the earlier rule.
    expect(cancelFeeRateFor("2027-02-01T10:00:00.000Z", null)).toBe(0);
    expect(cancelFeeRateFor(null, from)).toBe(0);
    expect(cancelFeeRateFor("not a date", from)).toBe(0);
  });

  it("is switched on together with the Terms that announce it, not before", () => {
    const terms = readFileSync(
      resolve(process.cwd(), "src/pages/Terms.tsx"),
      "utf8",
    );
    // "taxă" or, with the article, "taxa administrativă de anulare".
    const announced = /tax[ăa] administrativă de anulare/i.test(terms);
    expect(NEW_REFUND_RULES_FROM !== null).toBe(announced);
  });

  it("the admin applies it by the sign-up's own date and shows it by its name", () => {
    const handler = readFileSync(
      resolve(process.cwd(), "supabase/functions/admin-registrations/index.ts"),
      "utf8",
    );
    expect(handler).toContain("cancelFeeRate: cancelFeeRateFor(");
    expect(handler).toContain("reg.created_at");
    const ui = readFileSync(
      resolve(process.cwd(), "src/components/admin/RegistrationsTable.tsx"),
      "utf8",
    );
    expect(ui).toContain("Taxă administrativă de anulare");
    for (const text of [
      ui,
      readFileSync(
        resolve(process.cwd(), "supabase/functions/_shared/refund.ts"),
        "utf8",
      ),
    ])
      expect(text).not.toMatch(/penaliz|penalty|penalit/i);
  });
});

/**
 * The 14-day right of withdrawal, written into section 4 of the Terms on the
 * owner's word of 16 November 2026: inside 14 days of signing up online,
 * everything paid goes back, with no Stripe fee and no taxă administrativă de
 * anulare kept. It comes before every other rule.
 */
describe("the 14-day right of withdrawal", () => {
  const SIGNED_UP = "2026-11-20T09:00:00.000Z";
  const FULL = {
    paidBani: 238_000,
    totalLessons: 32,
    stripeFeeBani: 3_600,
    lessonsPerMonth: LESSONS_PER_MONTH,
    cancelFeeRate: CANCEL_FEE_RATE,
    signedUpAt: SIGNED_UP,
    withdrawalDays: WITHDRAWAL_DAYS,
  };

  it("counts 14 calendar days from the day of the sign-up, in Bucharest", () => {
    expect(withinWithdrawal(SIGNED_UP, "2026-11-20T10:00:00.000Z", 14)).toBe(
      true,
    );
    // 4 December, 23:59 in Bucharest: the last day.
    expect(withinWithdrawal(SIGNED_UP, "2026-12-04T21:59:00.000Z", 14)).toBe(
      true,
    );
    expect(withinWithdrawal(SIGNED_UP, "2026-12-04T22:00:00.000Z", 14)).toBe(
      false,
    );
    // Not offered (earlier Terms), or nothing to count from.
    expect(withinWithdrawal(SIGNED_UP, "2026-11-21T10:00:00.000Z", 0)).toBe(
      false,
    );
    expect(withinWithdrawal(null, "2026-11-21T10:00:00.000Z", 14)).toBe(false);
    expect(withinWithdrawal("2026-11-25T10:00:00.000Z", SIGNED_UP, 14)).toBe(
      false,
    );
  });

  it("is for sign-ups under the new Terms only", () => {
    const from = "2026-11-16";
    expect(withdrawalDaysFor("2026-11-16T08:00:00.000Z", from)).toBe(14);
    expect(withdrawalDaysFor("2026-11-15T08:00:00.000Z", from)).toBe(0);
    expect(withdrawalDaysFor("2026-11-16T08:00:00.000Z", null)).toBe(0);
  });

  it("a course paid in full: everything back, no Stripe fee, no 10%", () => {
    const r = computeRefund({
      ...FULL,
      lessonsTaken: 0,
      courseStartsAt: "2026-12-10T17:00:00.000Z",
      cancelledAt: "2026-11-28T10:00:00.000Z",
    });
    expect(r.tier).toBe("withdrawal");
    expect(r.feeBani).toBe(0);
    expect(r.cancelFeeBani).toBe(0);
    expect(r.refundBani).toBe(238_000);
  });

  it("lessons already held are kept only on the student's express request to start early", () => {
    const started = {
      ...FULL,
      lessonsTaken: 3,
      courseStartsAt: "2026-11-22T17:00:00.000Z",
      cancelledAt: "2026-12-02T10:00:00.000Z",
    };
    // No request on record (the checkout has no box for it yet): all back.
    expect(computeRefund(started).refundBani).toBe(238_000);
    const asked = computeRefund({ ...started, startedAtRequest: true });
    expect(asked.tier).toBe("withdrawal");
    expect(asked.nonRefundableBani).toBe(22_313); // 3 of 32 lessons
    expect(asked.feeBani).toBe(0);
    expect(asked.refundBani).toBe(238_000 - 22_313);
  });

  it("after the 14 days the ordinary rules apply again", () => {
    const r = computeRefund({
      ...FULL,
      lessonsTaken: 0,
      courseStartsAt: "2027-01-10T17:00:00.000Z",
      cancelledAt: "2026-12-06T10:00:00.000Z",
    });
    expect(r.tier).toBe("full");
    expect(r.refundBani).toBe(238_000 - 3_600);
  });

  it("monthly: the months paid so far come back in full, with no Stripe fee", () => {
    const input = {
      charges: [
        {
          paymentId: "pi_1",
          amountBani: 50_000,
          stripeFeeBani: 900,
          chargedAt: "2026-11-20T09:05:00.000Z",
        },
      ],
      courseStartDate: "2026-11-22",
      sessionStarts: [
        "2026-11-22T15:00:00.000Z",
        "2026-11-23T15:00:00.000Z",
        "2026-11-29T15:00:00.000Z",
        "2026-11-30T15:00:00.000Z",
        "2026-12-06T15:00:00.000Z",
        "2026-12-07T15:00:00.000Z",
        "2026-12-13T15:00:00.000Z",
        "2026-12-14T15:00:00.000Z",
      ],
      cancelledAt: "2026-12-01T10:00:00.000Z",
      signedUpAt: SIGNED_UP,
      withdrawalDays: WITHDRAWAL_DAYS,
    };
    const r = computeGroupCancelRefund(input);
    expect(r.case).toBe("withdrawal");
    expect(r.feeBani).toBe(0);
    expect(r.creditBani).toBe(0);
    expect(r.refundBani).toBe(50_000);
    expect(r.refunds).toEqual([{ paymentId: "pi_1", amountBani: 50_000 }]);
    // On an express request to start early, the 4 lessons held are kept.
    const asked = computeGroupCancelRefund({
      ...input,
      startedAtRequest: true,
    });
    expect(asked.lessonsHeld).toBe(4);
    expect(asked.refundBani).toBe(25_000);
    // Without the right (earlier Terms): after lesson 2 it is credit, as before.
    const before = computeGroupCancelRefund({ ...input, withdrawalDays: 0 });
    expect(before.case).toBe("credit");
    expect(before.refundBani).toBe(0);
  });

  it("the admin passes the sign-up's own date to both calculations", () => {
    const handler = readFileSync(
      resolve(process.cwd(), "supabase/functions/admin-registrations/index.ts"),
      "utf8",
    );
    expect(handler.match(/withdrawalDays: withdrawalDaysFor\(/g)?.length).toBe(
      2,
    );
    expect(handler).not.toContain("startedAtRequest: true");
  });
});

/**
 * The policy existed in _shared/refund.ts, in the published Terms and in this
 * test file for weeks while the admin "Rambursează" button called
 * stripe.refunds.create with no `amount` — which refunds the charge in full.
 * Every refund issued in that window ignored all three tiers.
 *
 * These read the shipped handler rather than the helper, because the defect was
 * never in the arithmetic; it was that nothing called it.
 */
describe("the admin refund button applies the policy", () => {
  const handler = readFileSync(
    resolve(process.cwd(), "supabase/functions/admin-registrations/index.ts"),
    "utf8",
  );

  it("passes an explicit amount to Stripe", () => {
    const call = handler.match(/stripe\.refunds\.create\(\{[\s\S]{0,200}?\}\)/);
    expect(call, "no stripe.refunds.create call found").toBeTruthy();
    expect(call![0]).toContain("amount:");
    expect(call![0]).toContain("breakdown.refundBani");
  });

  it("computes that amount with computeRefund and the real Stripe fee", () => {
    expect(handler).toContain('from "../_shared/refund.ts"');
    expect(handler).toContain("computeRefund(");
    expect(handler).toContain("balance_transaction");
  });

  it("offers a preview so the number is seen before the money moves", () => {
    expect(handler).toContain('action === "preview_refund"');
  });

  it("records what was actually returned, not the full charge", () => {
    expect(handler).toContain("refunded_amount: breakdown.refundBani");
  });

  it("refuses rather than sending a zero or negative refund", () => {
    expect(handler).toContain("breakdown.refundBani <= 0");
  });
});
