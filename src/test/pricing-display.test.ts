import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  ONLINE_PRICES,
  PRIVATE_PACKAGE_DISCOUNT,
  PRIVATE_PACKAGE_SIZE,
  physicalPrice,
  privatePackageDiscounted,
  privatePackageFull,
} from "@/lib/pricing";
import { PRIVATE_LESSON } from "../../supabase/functions/_shared/prices";

/**
 * server-prices.test.ts already asserts the two price tables agree. This covers
 * the other half: that what the pages *say* matches what the checkout charges.
 *
 * The 20-lesson package card used to hard-code "3.000 LEI" and "2.400 LEI".
 * Correct arithmetic at 150/lesson, and silently wrong at any other price.
 */
const read = (f: string) => readFileSync(resolve(process.cwd(), f), "utf8");

describe("displayed prices match what is charged", () => {
  it("derives the package price rather than stating it", () => {
    const src = read("src/components/ProgramsSection.tsx");
    expect(src).not.toMatch(/3\.000 LEI|2\.400 LEI/);
    expect(src).toContain("privatePackageFull()");
    expect(src).toContain("privatePackageDiscounted()");
  });

  it("computes the package from the per-lesson price", () => {
    expect(privatePackageFull()).toBe(ONLINE_PRICES.privateLesson * PRIVATE_PACKAGE_SIZE);
    expect(privatePackageDiscounted()).toBe(
      Math.round(privatePackageFull() * (1 - PRIVATE_PACKAGE_DISCOUNT)),
    );
    // The numbers currently on the card.
    expect(privatePackageFull()).toBe(3000);
    expect(privatePackageDiscounted()).toBe(2400);
  });

  it("uses the same package discount create-checkout applies", () => {
    const checkout = read("supabase/functions/create-checkout/index.ts");
    // create-checkout multiplies the unit amount by 0.8 at quantity >= 20.
    expect(checkout).toMatch(/quantity >= 20\s*\n?\s*\?\s*0\.8/);
    expect(1 - PRIVATE_PACKAGE_DISCOUNT).toBe(0.8);
    const m = checkout.match(/courseType === "private" && quantity >= (\d+)/);
    expect(Number(m?.[1])).toBe(PRIVATE_PACKAGE_SIZE);
  });

  it("keeps the display and server per-lesson price equal", () => {
    expect(ONLINE_PRICES.privateLesson).toBe(PRIVATE_LESSON);
  });

  it("derives in-centre prices at +40% rounded to 10", () => {
    expect(physicalPrice(500)).toBe(700);
    expect(physicalPrice(150)).toBe(210);
    expect(physicalPrice(ONLINE_PRICES.groupMonthly.C2)).toBe(1400);
  });
});
