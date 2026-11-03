import { isNotFound, notFound } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { fallbackCourseBySlug } from "@/data/fallbackGroups";

/**
 * Loader check for /cursuri/curs/$slug and /en/courses/course/$slug: an
 * address that names no group answers 404, not a 200 "not found" page
 * (audit P1 #5, soft 404s). It mirrors useCourseBySlug: the owner's slug,
 * the "<level>-<format>" form, or a built-in fallback course. Only a clear
 * "no such group" from the database is a 404; when the database cannot be
 * reached the page renders as before and handles it itself.
 */
export async function assertCourseSlugExists(slug: string): Promise<void> {
  if (fallbackCourseBySlug(slug)) return;
  if (/^[a-cA-C][12]-(online|fizic)$/.test(slug)) return;
  try {
    const { data, error } = await (
      supabase.from("group_cohorts") as unknown as {
        select: (c: string) => {
          eq: (
            k: string,
            v: unknown,
          ) => {
            limit: (
              n: number,
            ) => Promise<{ data: unknown[] | null; error: unknown }>;
          };
        };
      }
    )
      .select("id")
      .eq("slug", slug)
      .limit(1);
    if (error) return;
    if (!data || data.length === 0) throw notFound();
  } catch (e) {
    // Re-throw only our own not-found; a network failure renders the page.
    if (isNotFound(e)) throw e;
  }
}
