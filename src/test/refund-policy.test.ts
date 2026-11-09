import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  COURSE_LESSONS,
  FULL_REFUND_DAYS,
  LESSONS_PER_MONTH,
  computeRefund,
  formatBani,
} from "../../supabase/functions/_shared/refund";
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
