/**
 * How many people fit in a group, by format — the single source for every
 * sentence on the site that states a class size.
 *
 * These numbers were written out by hand in eighteen places (i18n strings, the
 * comparison table, five SEO pages, the German landing page, the page seeds).
 * They disagreed: most said "4–10", three English pages said "max 8", and the
 * cohorts in the database were all created with 10 seats. When online groups
 * were capped at 6 there was no one place to change.
 *
 * The owner's rule (October 2026): online groups take at most 6 people,
 * in-person-only groups at most 8, and a group starts once half its places
 * are taken — 3 online, 4 in person. The same rule is stated everywhere.
 *
 * group-size-copy.test.ts greps the source for class-size claims that
 * contradict these numbers, so a stale "4–10" cannot come back unnoticed.
 */
export const MAX_GROUP_SIZE = {
  online: 6,
  fizic: 8,
} as const;

/** A group starts once half its places are taken (rounded up). */
export const minGroupSize = (maxSeats: number): number => Math.ceil(maxSeats / 2);

/** Kids groups are in person, so they take the in-person cap (8, from 4). */
export const MAX_KIDS_GROUP_SIZE = MAX_GROUP_SIZE.fizic;

/** e.g. "max. 6 cursanți online, 8 fizic" — for prose that covers both formats. */
export const groupSizeLabel = (lang: "ro" | "en" = "ro"): string =>
  lang === "en"
    ? `max ${MAX_GROUP_SIZE.online} students online, ${MAX_GROUP_SIZE.fizic} in person`
    : `max. ${MAX_GROUP_SIZE.online} cursanți online, ${MAX_GROUP_SIZE.fizic} fizic`;
