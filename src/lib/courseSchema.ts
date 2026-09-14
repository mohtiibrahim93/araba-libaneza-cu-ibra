/**
 * Shared Schema.org building blocks for the /cursuri/* pages.
 *
 * These pages used to put `courseMode` directly on the `Course`. That property
 * is defined on `CourseInstance`, not on `Course`, so a crawl reported a
 * "Schema.org validation error" on /cursuri/grup, /cursuri/copii and
 * /cursuri/private. Google's Course rich result reads delivery mode and
 * workload from `hasCourseInstance` too, so the fix and the enhancement are
 * the same change.
 *
 * Everything here mirrors what the pages actually say — the workloads come from
 * the site's own copy ("90 min, de 2 ori pe săptămână" for group lessons,
 * "60 minute / lecție" for 1:1) — so the markup cannot drift into claiming a
 * schedule the site does not offer.
 */

const BASE_URL = "https://centruldearabalibaneza.com";

export type CourseMode = "onsite" | "online";

/**
 * Profiles that identify this organisation elsewhere on the web.
 *
 * sameAs used to be `${BASE_URL}/` — the markup said "this organisation is
 * also itself", which is a tautology and tells Google nothing. The field
 * exists to connect the site to independent profiles so they can be read as
 * one entity, and a self-reference connects it to nothing.
 *
 * Only real, verifiable profiles belong here. A sameAs pointing at a page
 * that does not exist, or does not clearly belong to this business, is worse
 * than an empty list. Add social and directory profiles as they are
 * confirmed.
 */
export const ORGANIZATION_SAME_AS: readonly string[] = [
  // Tutoring platforms and directories, where the business is listed under its
  // own name with reviews attached.
  "https://preply.com/en/tutor/471612",
  "https://www.superprof.com.ro/profesor-care-preda-limba-romana-celor-care-vorbesc-limba-araba.html",
  "https://meditatii.ro/meditatii/limba-araba-ibrahim-gabriel-moaty-26623",
  "https://anunturi-meditatii.ro/araba/meditator-ibrahim-gabriel_52392",
  "https://www.olx.ro/d/oferta/araba-libaneza-cu-ibra-IDgE526.html",
  // Social profiles.
  "https://www.instagram.com/culturalibanezaro",
  "https://www.tiktok.com/@lebanesewithibra",
] as const;

export const COURSE_PROVIDER = {
  "@type": "Organization",
  name: "Centrul de Arabă Libaneză cu Ibra",
  url: `${BASE_URL}/`,
  sameAs: ORGANIZATION_SAME_AS,
} as const;

/** The one physical venue, matching the address shown in the footer. */
export const ONSITE_LOCATION = {
  "@type": "Place",
  name: "Raduga Creative Center",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Strada Icoanei 80",
    addressLocality: "București",
    addressCountry: "RO",
  },
} as const;

/** Two 90-minute group sessions a week. */
export const GROUP_WEEKLY_WORKLOAD = "PT3H";
/** A single 1:1 lesson. */
export const PRIVATE_LESSON_WORKLOAD = "PT1H";

interface InstanceOptions {
  /** ISO 8601 duration of expected work per repeat, e.g. "PT3H" a week. */
  workload?: string;
  /** e.g. "Weekly". Omit when the schedule is arranged per student. */
  repeatFrequency?: string;
  /** Defaults to both delivery modes. */
  modes?: readonly CourseMode[];
}

/** "Weekly" and friends as the ISO 8601 durations Schedule expects. */
const REPEAT_AS_DURATION: Record<string, string> = {
  Weekly: "P1W",
  Daily: "P1D",
  Monthly: "P1M",
};

/**
 * Builds the `hasCourseInstance` array. One entry per delivery mode, because
 * `courseMode` describes an instance and the onsite one also carries a place.
 *
 * The cadence goes inside a `Schedule` under `courseSchedule`, not straight on
 * the instance. `repeatFrequency` belongs to Schedule — putting it directly on
 * a CourseInstance is an undefined property for that type, which is what a
 * schema.org validator flags, and it was doing so on all eight pages that
 * describe a course.
 */
export function courseInstances({
  workload,
  repeatFrequency,
  modes = ["onsite", "online"],
}: InstanceOptions = {}): Record<string, unknown>[] {
  const schedule = repeatFrequency
    ? {
        courseSchedule: {
          "@type": "Schedule",
          repeatFrequency: REPEAT_AS_DURATION[repeatFrequency] ?? repeatFrequency,
        },
      }
    : {};
  return modes.map((mode) => ({
    "@type": "CourseInstance",
    courseMode: mode,
    ...(workload ? { courseWorkload: workload } : {}),
    ...schedule,
    ...(mode === "onsite" ? { location: ONSITE_LOCATION } : {}),
    instructor: {
      "@type": "Person",
      name: "Ibra",
      description: "Profesor nativ de arabă libaneză",
    },
  }));
}
