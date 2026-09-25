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

import { ONLINE_PRICES, physicalPrice } from "@/lib/pricing";
import type { LevelType } from "@/components/RegistrationForm/types";

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
  "https://www.superprof.com.ro/vorbitor-nativ-araba-libaneza-experiente-peste-ani-predarea-dialectul-libanez.html",
  "https://meditatii.ro/meditatii/limba-araba-ibrahim-gabriel-moaty-26623",
  "https://anunturi-meditatii.ro/araba/meditator-ibrahim-gabriel_52392",
  "https://www.olx.ro/d/oferta/araba-libaneza-cu-ibra-IDgE526.html",
  // Social profiles.
  "https://www.instagram.com/culturalibanezaro",
  "https://www.tiktok.com/@lebanesewithibra",
  "https://www.facebook.com/share/1FKpnqyggC/",
] as const;

/**
 * The teacher, as one identifiable person rather than a first name.
 *
 * "Ibra" is what the site calls him and what visitors search for, so it stays
 * as alternateName — but a Person node with only a nickname cannot be matched
 * to anything. The full name plus his own tutor profiles let Google and the
 * answer engines read the courses, the Preply reviews and the Superprof listing
 * as one teacher instead of three unrelated pages.
 *
 * The @id is the same node the Organization's founder points at in
 * src/routes/__root.tsx, so both blocks on a page describe one person.
 */
export const INSTRUCTOR_ID = `${BASE_URL}/#ibra`;

export const COURSE_INSTRUCTOR = {
  "@type": "Person",
  "@id": INSTRUCTOR_ID,
  name: "Ibrahim Gabriel Moaty",
  alternateName: "Ibra",
  jobTitle: "Profesor de arabă libaneză",
  description: "Profesor nativ de arabă libaneză",
  sameAs: [
    "https://preply.com/en/tutor/471612",
    "https://www.superprof.com.ro/vorbitor-nativ-araba-libaneza-experiente-peste-ani-predarea-dialectul-libanez.html",
    "https://meditatii.ro/meditatii/limba-araba-ibrahim-gabriel-moaty-26623",
    "https://anunturi-meditatii.ro/araba/meditator-ibrahim-gabriel_52392",
  ],
} as const;

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
    instructor: COURSE_INSTRUCTOR,
  }));
}

/**
 * The group course's monthly fee, as offers Google can read.
 *
 * Both numbers come from src/lib/pricing.ts — the same module the page prints
 * them from — so a price change cannot leave the markup quoting last term's
 * fee. It is a fee per month, not a total, and UnitPriceSpecification is what
 * says so: a bare `price` would read as the whole course.
 */
export function groupMonthlyOffers(level: LevelType, url: string): Record<string, unknown>[] {
  const online = ONLINE_PRICES.groupMonthly[level];
  return (
    [
      { mode: "online" as const, price: online },
      { mode: "onsite" as const, price: physicalPrice(online) },
    ] satisfies { mode: CourseMode; price: number }[]
  ).map(({ mode, price }) => ({
    "@type": "Offer",
    name: mode === "online" ? "Online" : "Fizic, în București",
    category: mode,
    url,
    availability: "https://schema.org/InStock",
    priceSpecification: {
      "@type": "UnitPriceSpecification",
      price,
      priceCurrency: "RON",
      billingDuration: "P1M",
      referenceQuantity: { "@type": "QuantitativeValue", value: 1, unitCode: "MON" },
    },
  }));
}
