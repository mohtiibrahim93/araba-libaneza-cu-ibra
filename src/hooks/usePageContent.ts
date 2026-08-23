import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface PageContent {
  path: string;
  meta_title: string;
  meta_description: string;
  h1: string;
  lead: string;
  body_md: string;
  faq: { q: string; a: string }[];
  is_published: boolean;
}

/**
 * Owner-edited version of a page (`/arabizi`, `/resurse`…). Returns the
 * published row for the path, or null when the page still renders the
 * code-shipped version. Fails soft so a backend error never blanks a page.
 */
export function usePageContent(path: string) {
  const { data } = useQuery({
    queryKey: ["page-content", path],
    queryFn: async (): Promise<PageContent | null> => {
      const { data, error } = await supabase
        .from("page_contents")
        .select("*")
        .eq("path", path)
        .eq("is_published", true)
        .maybeSingle();
      if (error || !data) return null;
      return {
        ...data,
        faq: Array.isArray(data.faq) ? (data.faq as { q: string; a: string }[]) : [],
      };
    },
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
  return data ?? null;
}
