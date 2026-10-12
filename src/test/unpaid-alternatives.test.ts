import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

/**
 * Cash, transfer and PayPal stay on offer — they just do not hold the place.
 *
 * The three alternatives were listed with nothing said about timing, which for
 * a group with a seat cap reads as "pick any of these and you are in". The
 * card clears in seconds; the other three clear when Ibra has seen the money,
 * and until then the seat is not anyone's.
 *
 * The fix is a condition on payment state, not a deletion: an earlier pass
 * started removing the methods themselves, which was wrong and was reverted
 * before anything was committed. This file pins both halves — the notice is
 * there while unpaid, and all three methods are still there at all.
 */
const instructions = readFileSync(
  resolve(process.cwd(), "src/components/PaymentInstructions.tsx"),
  "utf8",
);
const i18n = readFileSync(resolve(process.cwd(), "src/lib/i18n.tsx"), "utf8");

describe("the alternatives", () => {
  it("still offers all three methods", () => {
    for (const key of ["t.paymentCash", "t.paymentTransfer", "t.paymentPaypal"]) {
      expect(instructions, `${key} must stay available`).toContain(key);
    }
    expect(instructions).toContain("t.paymentIban");
  });

  it("says the place is not held until the money arrives, while unpaid", () => {
    expect(instructions).toContain("{!paid && (");
    expect(instructions).toContain("t.paymentAlternativesUnpaid");
  });

  it("adds the seat-cap sentence only where there is a cap", () => {
    // Private lessons are not a seat in a group, so the capacity line would be
    // false there.
    expect(instructions).toContain(
      '(courseType === "group" || courseType === "kids") && ` ${t.paymentAlternativesUnpaidSeat}`',
    );
  });

  it("carries both halves of the wording in both languages", () => {
    for (const key of ["paymentAlternativesUnpaid", "paymentAlternativesUnpaidSeat"]) {
      expect(
        i18n.split(`${key}:`).length - 1,
        `${key} needs a Romanian and an English string`,
      ).toBe(2);
    }
  });
});
