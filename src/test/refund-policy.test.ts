import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  ADMIN_FEE_RATE,
  COURSE_LESSONS,
  FULL_REFUND_DAYS,
  computeRefund,
  formatBani,
} from "../../supabase/functions/_shared/refund";
import { getCurriculum } from "@/data/curriculum";

// The course the policy is written against: 500 lei/month x 4 months = 2000 lei
// over 32 lessons.
const COURSE = { paidBani: 200_000, totalLessons: 32 };
const START = "2026-10-01T17:00:00.000Z";

describe("refund policy (supabase/functions/_shared/refund.ts)", () => {
  it("keeps the lesson totals in step with the curriculum", () => {
    for (const level of getCurriculum("ro")) {
      if (COURSE_LESSONS[level.id] === undefined) continue;
      expect(COURSE_LESSONS[level.id]).toBe(level.lessons);
    }
  });

  it("refunds in full 7 or more days before the start", () => {
    const r = computeRefund({
      ...COURSE,
      lessonsTaken: 0,
      courseStartsAt: START,
      cancelledAt: "2026-09-24T17:00:00.000Z", // exactly 7 days
    });
    expect(r.tier).toBe("full");
    expect(r.daysBeforeStart).toBe(FULL_REFUND_DAYS);
    expect(r.feeBani).toBe(0);
    expect(r.refundBani).toBe(200_000);
  });

  it("keeps only the 10% fee when cancelled late but before the first lesson", () => {
    const r = computeRefund({
      ...COURSE,
      lessonsTaken: 0,
      courseStartsAt: START,
      cancelledAt: "2026-09-29T17:00:00.000Z", // 2 days before
    });
    expect(r.tier).toBe("fee-only");
    expect(r.feeBani).toBe(20_000); // 200 lei
    expect(r.refundBani).toBe(180_000); // 1800 lei
  });

  it("matches the worked example: 2000 lei, 32 lessons, 5 taken", () => {
    const r = computeRefund({
      ...COURSE,
      lessonsTaken: 5,
      courseStartsAt: START,
      cancelledAt: "2026-10-15T17:00:00.000Z",
    });
    expect(r.tier).toBe("pro-rata");
    expect(r.pricePerLessonBani).toBe(6_250); // 62.50 lei
    expect(r.lessonsRemaining).toBe(27);
    expect(r.nonRefundableBani).toBe(31_250); // 312.50 lei
    expect(r.remainingValueBani).toBe(168_750); // 1687.50 lei
    expect(r.feeBani).toBe(16_875); // 168.75 lei
    expect(r.refundBani).toBe(151_875); // 1518.75 lei
  });

  it("never lets the parts drift from the total", () => {
    for (let taken = 0; taken <= 32; taken++) {
      const r = computeRefund({
        ...COURSE,
        lessonsTaken: taken,
        courseStartsAt: START,
        cancelledAt: "2026-10-15T17:00:00.000Z",
      });
      expect(r.nonRefundableBani + r.feeBani + r.refundBani).toBe(COURSE.paidBani);
      expect(r.refundBani).toBeGreaterThanOrEqual(0);
      expect(r.refundBani).toBeLessThanOrEqual(COURSE.paidBani);
    }
  });

  it("refunds nothing once every lesson has been delivered", () => {
    const r = computeRefund({
      ...COURSE,
      lessonsTaken: 32,
      courseStartsAt: START,
      cancelledAt: "2027-02-01T17:00:00.000Z",
    });
    expect(r.refundBani).toBe(0);
    expect(r.nonRefundableBani).toBe(200_000);
  });

  it("clamps a lesson count that overshoots the course", () => {
    const r = computeRefund({
      ...COURSE,
      lessonsTaken: 99,
      courseStartsAt: START,
      cancelledAt: "2027-02-01T17:00:00.000Z",
    });
    expect(r.lessonsRemaining).toBe(0);
    expect(r.refundBani).toBe(0);
  });

  it("falls back to the fee-only tier when there is no start date and no lesson taken", () => {
    const r = computeRefund({ ...COURSE, lessonsTaken: 0, courseStartsAt: null });
    expect(r.tier).toBe("fee-only");
    expect(r.refundBani).toBe(180_000);
  });

  it("charges the fee stated in the Terms", () => {
    expect(ADMIN_FEE_RATE).toBe(0.1);
  });

  it("formats bani the way the admin displays money", () => {
    expect(formatBani(151_875).replace(/ /g, " ")).toBe("1.518,75 lei");
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

  it("computes that amount with computeRefund", () => {
    expect(handler).toContain('from "../_shared/refund.ts"');
    expect(handler).toContain("computeRefund(");
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
