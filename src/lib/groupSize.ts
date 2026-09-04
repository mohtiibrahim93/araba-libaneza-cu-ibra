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
 * Online is capped at 6 so everyone still gets speaking time over Zoom;
 * in-person keeps 10, which is what the room holds. A cohort starts only once
 * MIN_GROUP_SIZE people have confirmed.
 *
 * group-size-copy.test.ts greps the source for class-size claims that
 * contradict these numbers, so a stale "4–10" cannot come back unnoticed.
 */
export const MIN_GROUP_SIZE = 4;

export const MAX_GROUP_SIZE = {
  online: 6,
  fizic: 10,
} as const;

/** Kids run in person only, so they take the in-person cap. */
export const MAX_KIDS_GROUP_SIZE = MAX_GROUP_SIZE.fizic;

/** e.g. "max. 6 online, 10 fizic" — for prose that covers both formats. */
export const groupSizeLabel = (lang: "ro" | "en" = "ro"): string =>
  lang === "en"
    ? `max ${MAX_GROUP_SIZE.online} online, ${MAX_GROUP_SIZE.fizic} in person`
    : `max. ${MAX_GROUP_SIZE.online} online, ${MAX_GROUP_SIZE.fizic} fizic`;
