import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type BlogOverride = Database["public"]["Tables"]["blog_articles"]["Row"];

/**
 * Owner-edited version of an article (blog CMS, override model). Returns the
 * published DB row for the slug, or null when the article still uses its
 * code-shipped version. Fails soft: any error (offline, table missing, RLS)
 * → null, so the code version always renders as a fallback.
 */
export function useBlogOverride(slug: string) {
  const { data } = useQuery({
    queryKey: ["blog-override", slug],
    queryFn: async (): Promise<BlogOverride | null> => {
      const { data, error } = await supabase
        .from("blog_articles")
        .select("*")
        .eq("slug", slug)
        .eq("is_published", true)
        .maybeSingle();
      if (error) return null;
      return data;
    },
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
  return data ?? null;
}
