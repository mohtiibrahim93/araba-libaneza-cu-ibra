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
  /** Kids group — monthly fee per child, minimum 4 (online). */
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