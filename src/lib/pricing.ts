// Single source of truth for course pricing.
// Online prices are stored explicitly; physical (in-center) prices are auto-derived
// at +40%, rounded to the nearest 10 LEI.

import type { LevelType } from "@/components/RegistrationForm/types";

export type CourseFormat = "online" | "fizic";

export const PHYSICAL_MULTIPLIER = 1.4;

/** Round to the nearest 10 LEI. */
const round10 = (n: number): number => Math.round(n / 10) * 10;

/** Physical (in-center) price derived from the online price. */
export const physicalPrice = (online: number): number =>
  round10(online * PHYSICAL_MULTIPLIER);

export const priceFor = (online: number, format: CourseFormat): number =>
  format === "fizic" ? physicalPrice(online) : online;

export const ONLINE_PRICES = {
  /** Group course — monthly fee per CEFR level (online). */
  groupMonthly: {
    A1: 500,
    A2: 600,
    B1: 700,
    B2: 800,
    C1: 900,
    C2: 1000,
  } as Record<LevelType, number>,
  /** Private 1:1 lesson (single session, online). */
  privateLesson: 150,
  /** Kids private 1:1 lesson (online). */
  kidsPrivateLesson: 150,
  /** Kids group — monthly fee per child, minimum 4 (online). In person takes
   *  the same +40% as every other course. */
  kidsGroupMonthly: 500,
};

/**
 * Number of monthly charges for a group course, per CEFR level (display side).
 *
 * A group "month" = 8 lessons (2×/week × ~4 weeks), so months = ceil(lessons/8)
 * from the curriculum lesson totals (src/data/curriculum.ts). Mirrors GROUP_MONTHS
 * in supabase/functions/_shared/prices.ts (the value Stripe actually bills against)
 * — change both together; server-prices.test.ts asserts they stay equal.
 */
export const GROUP_COURSE_MONTHS: Record<LevelType, number> = {
  A1: 4,
  A2: 7,
  B1: 9,
  B2: 9,
  C1: 9,
  C2: 10,
};

/**
 * Private-lesson volume discount — the whole ladder, in one place.
 *
 * There are exactly two tiers: 10 lessons and 20 lessons. A -5% tier at 5
 * lessons used to be advertised in fourteen places across the site, the form,
 * the blog and the seeded article bodies; it was never a real offer and has
 * been removed. Ordered highest-first so `find` returns the best tier.
 *
 * The server mirrors this in supabase/functions/_shared/prices.ts, and
 * pricing-display.test.ts asserts the two ladders stay identical — the site
 * quoting a discount the checkout does not apply is a billing bug, and it was
 * a live one: 10 lessons displayed 1.350 and Stripe charged 1.500.
 */
export const PRIVATE_DISCOUNT_TIERS: ReadonlyArray<{ from: number; rate: number }> = [
  { from: 20, rate: 0.2 },
  { from: 10, rate: 0.1 },
];

/** Discount fraction for a lesson count: 0 below 10, .1 from 10, .2 from 20. */
export const privateDiscountFor = (quantity: number): number =>
  PRIVATE_DISCOUNT_TIERS.find((tier) => quantity >= tier.from)?.rate ?? 0;

/** The next tier a buyer has not reached yet, for "N more to unlock -X%". */
export const nextPrivateTier = (
  quantity: number,
): { needed: number; pct: number } | null => {
  const upcoming = [...PRIVATE_DISCOUNT_TIERS]
    .reverse()
    .find((tier) => quantity < tier.from);
  return upcoming
    ? { needed: upcoming.from - quantity, pct: Math.round(upcoming.rate * 100) }
    : null;
};

/** The package headlined on the price card: the top tier. */
export const PRIVATE_PACKAGE_SIZE = 20;
export const PRIVATE_PACKAGE_DISCOUNT = privateDiscountFor(PRIVATE_PACKAGE_SIZE);

/** Full price of the package before the discount. */
export const privatePackageFull = (): number =>
  ONLINE_PRICES.privateLesson * PRIVATE_PACKAGE_SIZE;

/** What the package actually costs. */
export const privatePackageDiscounted = (): number =>
  Math.round(privatePackageFull() * (1 - PRIVATE_PACKAGE_DISCOUNT));

export const formatLei = (n: number): string => n.toLocaleString("ro-RO");

/** Compact dual-price string, e.g. "Online 500 · Fizic 700 LEI / lună". */
export const dualPriceLabel = (
  online: number,
  unit: string,
  labels: { online: string; fizic: string },
): string =>
  `${labels.online} ${formatLei(online)} · ${labels.fizic} ${formatLei(
    physicalPrice(online),
  )} ${unit}`;