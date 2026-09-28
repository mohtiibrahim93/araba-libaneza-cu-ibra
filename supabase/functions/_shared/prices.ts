// Server-side course pricing — single source of truth for what Stripe charges.
// Mirrors src/lib/pricing.ts (which drives what the site DISPLAYS); if one
// changes, change both. Amounts are returned in bani (RON x100) as Stripe
// expects. Dependency-free on purpose so it can be unit-tested outside Deno.

export type GroupLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

/** Group course — monthly fee per CEFR level, online, in whole RON. */
export const GROUP_MONTHLY_ONLINE: Record<GroupLevel, number> = {
  A1: 500,
  A2: 600,
  B1: 700,
  B2: 800,
  C1: 900,
  C2: 1000,
};

/**
 * Number of monthly charges for a group course, per CEFR level.
 *
 * A group "month" is 8 lessons (classes run 2×/week × ~4 weeks), so the number
 * of monthly subscription charges is ceil(total_lessons / 8). Lesson totals come
 * from the curriculum (src/data/curriculum.ts): A1 32, A2 54, B1–C2 72 each (9 × 8).
 * The final month may hold fewer than 8 lessons but is billed as a normal month.
 * Mirrors GROUP_COURSE_MONTHS in src/lib/pricing.ts — change both together.
 */
export const GROUP_MONTHS: Record<GroupLevel, number> = {
  A1: 4,
  A2: 7,
  B1: 9,
  B2: 9,
  C1: 9,
  C2: 9,
};

/** Private 1:1 lesson, flat for all levels, in whole RON (online). */
export const PRIVATE_LESSON = 150;

/**
 * Private-lesson volume discount. One tier only: -15% from 20 lessons.
 *
 * Mirrors PRIVATE_DISCOUNT_TIERS in src/lib/pricing.ts, which is what the site
 * DISPLAYS; pricing-display.test.ts asserts the two agree, so the site can never
 * quote a discount the checkout does not apply. (There used to be a -10% tier
 * at 10 and -20% at 20; the owner replaced both with this one.)
 * Ordered highest-first so `find` returns the best applicable tier.
 */
export const PRIVATE_DISCOUNT_TIERS: ReadonlyArray<{ from: number; rate: number }> = [
  { from: 20, rate: 0.15 },
];

/**
 * Discount for paying a whole group course upfront (adult or kids, online or
 * in person). The only group discount there is. Mirrors
 * GROUP_FULL_COURSE_DISCOUNT in src/lib/pricing.ts.
 */
export const GROUP_FULL_COURSE_DISCOUNT = 0.15;

/** Discount fraction for a lesson count: 0 below 20, .15 from 20. */
export function privateDiscountFor(quantity: number): number {
  return PRIVATE_DISCOUNT_TIERS.find((tier) => quantity >= tier.from)?.rate ?? 0;
}

/** In-center classes cost +40%, rounded to the nearest 10 RON. */
const PHYSICAL_MULTIPLIER = 1.4;
const round10 = (n: number): number => Math.round(n / 10) * 10;

/**
 * Monthly unit amount in bani for a group registration.
 *
 * Level and format must come from the registration ROW (persisted at
 * submission time), never from the request body — a client-supplied value
 * would let the charged amount be manipulated. Unknown/missing values fall
 * back to the cheapest option (A1, online) so a data gap can never
 * overcharge a student.
 */
export function groupMonthlyUnitAmount(
  level: string | null | undefined,
  format: string | null | undefined,
): number {
  const lvl = (level ?? "").toUpperCase() as GroupLevel;
  const monthlyRon = GROUP_MONTHLY_ONLINE[lvl] ?? GROUP_MONTHLY_ONLINE.A1;
  const withFormat = format === "fizic" ? round10(monthlyRon * PHYSICAL_MULTIPLIER) : monthlyRon;
  return withFormat * 100;
}

/**
 * Private lesson unit amount in bani.
 *
 * In-center lessons carry the same +40% as group classes (150 -> 210). The
 * format must come from the registration ROW, never the request body; an
 * unknown value falls back to online, the cheaper of the two, so a data gap
 * can never overcharge.
 */
export function privateLessonUnitAmount(format?: string | null): number {
  const ron = format === "fizic" ? round10(PRIVATE_LESSON * PHYSICAL_MULTIPLIER) : PRIVATE_LESSON;
  return ron * 100;
}

/**
 * Full-course amount in bani for a group registration that pays upfront in one
 * charge instead of the monthly subscription: the whole course (monthly ×
 * course-months) less GROUP_FULL_COURSE_DISCOUNT. Level+format come from the row.
 */
export function groupFullCourseUnitAmount(
  level: string | null | undefined,
  format: string | null | undefined,
): number {
  const monthly = groupMonthlyUnitAmount(level, format);
  return Math.round(monthly * groupMonthsFor(level) * (1 - GROUP_FULL_COURSE_DISCOUNT));
}

/**
 * How many monthly charges a group subscription bills before it auto-stops.
 *
 * Keyed by the level persisted on the registration row. Unknown/missing level
 * falls back to the shortest course (A1) so a data gap can never bill a student
 * for more months than the cheapest course would.
 */
export function groupMonthsFor(level: string | null | undefined): number {
  const lvl = (level ?? "").toUpperCase() as GroupLevel;
  return GROUP_MONTHS[lvl] ?? GROUP_MONTHS.A1;
}

// ---------------------------------------------------------------------------
// Kids group course pricing
//
// Kids in this app = group course, 3 months, 500 LEI / month online and the
// usual +40% in person. The group is not open yet; this is the shape it takes
// when it is.
// No CEFR level, no online/fizic split, no volume discount. Mirrors the price
// card displayed on the site (500 / month online, 1.500 total, 1.275 LEI with
// the -15% upfront discount).
// ---------------------------------------------------------------------------

/** Kids group course — monthly fee per child, whole RON. */
export const KIDS_GROUP_MONTHLY = 500;

/** Total number of monthly charges for the kids group course. */
export const KIDS_GROUP_MONTHS = 3;

/**
 * Kids group monthly unit amount, in bani.
 *
 * Takes the same +40% in person as every other course. Format comes from the
 * registration row; an unknown value falls back to online, the cheaper of the
 * two, so a data gap can never overcharge.
 */
export function kidsGroupMonthlyUnitAmount(format?: string | null): number {
  const ron = format === "fizic"
    ? round10(KIDS_GROUP_MONTHLY * PHYSICAL_MULTIPLIER)
    : KIDS_GROUP_MONTHLY;
  return ron * 100;
}

/**
 * Kids group full-course amount in bani for the pay-in-full path: the whole
 * course (monthly × months) less GROUP_FULL_COURSE_DISCOUNT.
 */
export function kidsGroupFullCourseUnitAmount(format?: string | null): number {
  return Math.round(kidsGroupMonthlyUnitAmount(format) * KIDS_GROUP_MONTHS * (1 - GROUP_FULL_COURSE_DISCOUNT));
}

/** Share of one month held as a refundable deposit to reserve a kids seat. */
export const KIDS_DEPOSIT_SHARE = 0.25;

/**
 * Refundable kids-seat deposit, in bani. Derived rather than written down: it
 * was hard-coded as 12500 in create-checkout while the copy said "25%", so
 * raising the monthly fee would have quietly turned 25% into something else.
 */
export function kidsDepositUnitAmount(format?: string | null): number {
  return Math.round(kidsGroupMonthlyUnitAmount(format) * KIDS_DEPOSIT_SHARE);
}
