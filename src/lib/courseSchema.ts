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

export const COURSE_PROVIDER = {
  "@type": "Organization",
  name: "Centrul de Arabă Libaneză cu Ibra",
  sameAs: `${BASE_URL}/`,
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
  /** ISO 8601 duration of expected work per `repeatFrequency`. */
  workload?: string;
  /** e.g. "Weekly". Omit when the schedule is arranged per student. */
  repeatFrequency?: string;
  /** Defaults to both delivery modes. */
  modes?: readonly CourseMode[];
}

/**
 * Builds the `hasCourseInstance` array. One entry per delivery mode, because
 * `courseMode` describes an instance and the onsite one also carries a place.
 */
export function courseInstances({
  workload,
  repeatFrequency,
  modes = ["onsite", "online"],
}: InstanceOptions = {}): Record<string, unknown>[] {
  return modes.map((mode) => ({
    "@type": "CourseInstance",
    courseMode: mode,
    ...(workload ? { courseWorkload: workload } : {}),
    ...(repeatFrequency ? { repeatFrequency } : {}),
    ...(mode === "onsite" ? { location: ONSITE_LOCATION } : {}),
    instructor: {
      "@type": "Person",
      name: "Ibra",
      description: "Profesor nativ de arabă libaneză",
    },
  }));
}
