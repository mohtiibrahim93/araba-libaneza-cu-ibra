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
 * from the curriculum (src/data/curriculum.ts): A1 32, A2 54, B1/B2/C1 70, C2 80.
 * The final month may hold fewer than 8 lessons but is billed as a normal month.
 * Mirrors GROUP_COURSE_MONTHS in src/lib/pricing.ts — change both together.
 */
export const GROUP_MONTHS: Record<GroupLevel, number> = {
  A1: 4,
  A2: 7,
  B1: 9,
  B2: 9,
  C1: 9,
  C2: 10,
};

/** Private 1:1 lesson, flat for all levels and formats, in whole RON. */
export const PRIVATE_LESSON = 150;

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

/** Private lesson unit amount in bani (flat across levels and formats). */
export function privateLessonUnitAmount(): number {
  return PRIVATE_LESSON * 100;
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
