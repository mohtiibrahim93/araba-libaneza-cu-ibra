import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  ONLINE_PRICES,
  PRIVATE_DISCOUNT_TIERS,
  PRIVATE_PACKAGE_DISCOUNT,
  PRIVATE_PACKAGE_SIZE,
  nextPrivateTier,
  physicalPrice,
  privateDiscountFor,
  privatePackageDiscounted,
  privatePackageFull,
} from "@/lib/pricing";
import {
  KIDS_DEPOSIT_SHARE,
  KIDS_GROUP_MONTHLY,
  PRIVATE_DISCOUNT_TIERS as SERVER_TIERS,
  PRIVATE_LESSON,
  kidsDepositUnitAmount,
  kidsGroupMonthlyUnitAmount,
  privateDiscountFor as serverDiscountFor,
  privateLessonUnitAmount,
} from "../../supabase/functions/_shared/prices";

/**
 * server-prices.test.ts already asserts the two price TABLES agree. This covers
 * the other half — that what the pages say matches what the checkout charges.
 *
 * That gap was live and it cost money in both directions: the form quoted -10%
 * from 10 lessons while create-checkout only discounted from 20 (quoted 1.350,
 * charged 1.500), and in-person private lessons displayed 210/lesson while the
 * checkout billed the online 150.
 */
const read = (f: string) => readFileSync(resolve(process.cwd(), f), "utf8");

describe("displayed prices match what is charged", () => {
  it("uses one discount ladder on both sides", () => {
    expect(PRIVATE_DISCOUNT_TIERS).toEqual(SERVER_TIERS);
    for (const q of [1, 4, 9, 10, 11, 19, 20, 21, 50]) {
      expect(privateDiscountFor(q)).toBe(serverDiscountFor(q));
    }
  });

  it("has exactly two tiers — 10 and 20, no 5", () => {
    expect(PRIVATE_DISCOUNT_TIERS.map((t) => t.from).sort((a, b) => a - b)).toEqual([10, 20]);
    expect(privateDiscountFor(5)).toBe(0);
    expect(privateDiscountFor(9)).toBe(0);
    expect(privateDiscountFor(10)).toBe(0.1);
    expect(privateDiscountFor(19)).toBe(0.1);
    expect(privateDiscountFor(20)).toBe(0.2);
  });

  it("points at the next real tier, never at a 5-lesson one", () => {
    expect(nextPrivateTier(1)).toEqual({ needed: 9, pct: 10 });
    expect(nextPrivateTier(10)).toEqual({ needed: 10, pct: 20 });
    expect(nextPrivateTier(20)).toBeNull();
  });

  it("states no 5-lesson discount anywhere in the source", () => {
    // The -5%-at-5-lessons tier was advertised in fourteen places while no code
    // path ever applied it below 20. Nothing may reintroduce it.
    const files = [
      "src/lib/i18n.tsx",
      "src/lib/blogSeedBodies.ts",
      "src/pages/seo/MeditatiiAraba.tsx",
      "src/pages/seo/CursuriAraba.tsx",
      "src/pages/seo/CursuriArabaAdolescenti.tsx",
      "src/pages/seo/CelMaiBunCursAraba.tsx",
      "src/pages/en/ArabicTutor.tsx",
      "src/pages/en/ArabicForTeenagers.tsx",
      "src/pages/en/BestArabicCourse.tsx",
      "src/pages/blog/CatCostaCursurile.tsx",
      "src/components/RegistrationForm/PrivateFields.tsx",
    ];
    for (const f of files) {
      const src = read(f).replace(/^\s*(\/\/|\*|\/\*).*$/gm, ""); // ignore comments
      expect(src, f).not.toMatch(/[−-]?5%\s*(de la|from)\s*5|de la 5 lecții|from 5 lessons/);
    }
  });

  it("derives the package price rather than stating it", () => {
    const src = read("src/components/ProgramsSection.tsx");
    expect(src).not.toMatch(/3\.000 LEI|2\.400 LEI/);
    expect(src).toContain("privatePackageFull()");
    expect(src).toContain("privatePackageDiscounted()");
  });

  it("computes the package from the per-lesson price", () => {
    expect(PRIVATE_PACKAGE_DISCOUNT).toBe(privateDiscountFor(PRIVATE_PACKAGE_SIZE));
    expect(privatePackageFull()).toBe(ONLINE_PRICES.privateLesson * PRIVATE_PACKAGE_SIZE);
    expect(privatePackageDiscounted()).toBe(
      Math.round(privatePackageFull() * (1 - PRIVATE_PACKAGE_DISCOUNT)),
    );
    expect(privatePackageFull()).toBe(3000);
    expect(privatePackageDiscounted()).toBe(2400);
  });

  it("keeps the display and server per-lesson price equal, in both formats", () => {
    expect(ONLINE_PRICES.privateLesson).toBe(PRIVATE_LESSON);
    expect(privateLessonUnitAmount("online")).toBe(ONLINE_PRICES.privateLesson * 100);
    expect(privateLessonUnitAmount("fizic")).toBe(physicalPrice(ONLINE_PRICES.privateLesson) * 100);
    expect(privateLessonUnitAmount("fizic")).toBe(21000);
    // An unknown format must fall back to the cheaper online rate.
    expect(privateLessonUnitAmount(null)).toBe(ONLINE_PRICES.privateLesson * 100);
  });

  it("charges the kids deposit as a real share of the kids month", () => {
    expect(ONLINE_PRICES.kidsGroupMonthly).toBe(KIDS_GROUP_MONTHLY);
    expect(KIDS_GROUP_MONTHLY).toBe(500);
    // In person takes the same +40% as every other course.
    expect(kidsGroupMonthlyUnitAmount("online")).toBe(500 * 100);
    expect(kidsGroupMonthlyUnitAmount("fizic")).toBe(physicalPrice(500) * 100);
    expect(kidsGroupMonthlyUnitAmount("fizic")).toBe(70000);
    expect(kidsGroupMonthlyUnitAmount(null)).toBe(500 * 100);

    expect(kidsDepositUnitAmount("online")).toBe(KIDS_GROUP_MONTHLY * KIDS_DEPOSIT_SHARE * 100);
    expect(kidsDepositUnitAmount("online")).toBe(12500); // 125 LEI
    expect(kidsDepositUnitAmount("fizic")).toBe(17500); // 25% of 700
    // The copy quotes the online deposit and remainder; both follow the fee.
    const i18n = read("src/lib/i18n.tsx");
    expect(i18n).toContain("125 LEI");
    expect(i18n).toContain("375 LEI");
  });

  it("derives in-centre prices at +40% rounded to 10", () => {
    expect(physicalPrice(500)).toBe(700);
    expect(physicalPrice(150)).toBe(210);
    expect(physicalPrice(ONLINE_PRICES.groupMonthly.C2)).toBe(1400);
  });
});
