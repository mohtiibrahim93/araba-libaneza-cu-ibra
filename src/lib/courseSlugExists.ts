import { isNotFound, notFound } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { fallbackCourseBySlug } from "@/data/fallbackGroups";

/** What a group page's head needs (null: no row read, generic head). */
export interface GroupHeadData {
  level: string | null;
  format: string | null;
  teaching_language: string | null;
  start_date: string | null;
  schedule_label_ro: string | null;
  schedule_label_en: string | null;
}

/**
 * Loader for /cursuri/curs/$slug and /en/courses/course/$slug.
 *
 * An address that names no group answers 404, not a 200 "not found" page
 * (audit P1 #5, soft 404s). It mirrors useCourseBySlug: the owner's slug,
 * the "<level>-<format>" form, or a built-in fallback course. Only a clear
 * "no such group" from the database is a 404; when the database cannot be
 * reached the page renders as before and handles it itself.
 *
 * It also returns the group's details, so the page is shared on social media
 * with its own title and description (owner, 3 Nov 2026: one link per
 * upcoming group for Facebook/Instagram/WhatsApp).
 */
export async function loadGroupForPage(
  slug: string,
): Promise<GroupHeadData | null> {
  if (/^[a-cA-C][12]-(online|fizic)$/.test(slug)) return null;
  // A built-in fallback course is never a 404, but its head still comes from
  // the database when the row is there.
  const hasFallback = !!fallbackCourseBySlug(slug);
  try {
    const table = supabase.from("group_cohorts") as unknown as {
      select: (c: string) => {
        eq: (
          k: string,
          v: unknown,
        ) => {
          limit: (
            n: number,
          ) => PromiseLike<{ data: GroupHeadData[] | null; error: unknown }>;
        };
      };
    };
    const { data, error } = await table
      .select(
        "level, format, teaching_language, start_date, schedule_label_ro, schedule_label_en",
      )
      .eq("slug", slug)
      .limit(1);
    if (error) return null;
    if (!data || data.length === 0) {
      if (hasFallback) return null;
      throw notFound();
    }
    return data[0] ?? null;
  } catch (e) {
    // Re-throw only our own not-found; a network failure renders the page.
    if (isNotFound(e)) throw e;
    return null;
  }
}

/** Kept for callers that only need the 404 check. */
export async function assertCourseSlugExists(slug: string): Promise<void> {
  await loadGroupForPage(slug);
}

const BASE = "https://centruldearabalibaneza.com";
const MONTHS = {
  ro: [
    "ianuarie",
    "februarie",
    "martie",
    "aprilie",
    "mai",
    "iunie",
    "iulie",
    "august",
    "septembrie",
    "octombrie",
    "noiembrie",
    "decembrie",
  ],
  en: [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ],
};

/**
 * The head of a group page: "Grupa A1 online, în română — începe pe 7
 * noiembrie 2026". noindex stays (the level page is the one to rank); the
 * Open Graph and Twitter tags are what Facebook, Instagram and WhatsApp show.
 */
export function groupPageHead(
  g: GroupHeadData | null | undefined,
  lang: "ro" | "en",
  path: string,
) {
  if (!g) return { meta: [{ name: "robots", content: "noindex, follow" }] };
  const en = lang === "en";
  const fmt = g.format === "fizic" ? (en ? "in person" : "fizic") : "online";
  const taught =
    g.teaching_language === "en"
      ? en
        ? "taught in English"
        : "în engleză"
      : en
        ? "taught in Romanian"
        : "în română";
  let when = "";
  if (g.start_date) {
    const [y, m, d] = g.start_date.split("-").map(Number);
    if (y && m && d)
      when = en
        ? ` — starts ${d} ${MONTHS.en[m - 1]} ${y}`
        : ` — începe pe ${d} ${MONTHS.ro[m - 1]} ${y}`;
  }
  const title = en
    ? `Lebanese Arabic ${g.level ?? ""} group, ${fmt}, ${taught}${when}`
    : `Grupa ${g.level ?? ""} de arabă libaneză, ${fmt}, ${taught}${when}`;
  // The start date is already in the title; drop it from the schedule text.
  const schedule = ((en ? g.schedule_label_en : g.schedule_label_ro) ?? "")
    .split(" · ")
    .filter((part) => !/^(start|starts|starting)\b/i.test(part.trim()))
    .join(" · ");
  const description = en
    ? `${schedule ? `${schedule}. ` : ""}Small group with Ibra, a native teacher. See free places and sign up.`
    : `${schedule ? `${schedule}. ` : ""}Grupă mică, cu Ibra, profesor nativ. Vezi locurile libere și înscrie-te.`;
  const url = `${BASE}${path}`;
  return {
    meta: [
      { title: `${title} | Arabă Libaneză cu Ibra` },
      { name: "description", content: description },
      { name: "robots", content: "noindex, follow" },
      { property: "og:type", content: "website" },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:url", content: url },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
    ],
  };
}
