import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ResourceRow {
  slug: string;
  title_ro: string;
  title_en: string;
  description_ro: string;
  description_en: string;
  file_url: string;
  is_active: boolean;
  sort_order: number;
}

/**
 * Admin-editable free resources (lead magnets). Rows override the copy and file
 * link hardcoded on the SEO pages; if the table is unreachable the pages simply
 * fall back to their static props.
 */
export const useResources = () =>
  useQuery({
    queryKey: ["resources"],
    staleTime: 5 * 60 * 1000,
    queryFn: async (): Promise<ResourceRow[]> => {
      const { data, error } = await supabase
        .from("resources")
        .select("slug, title_ro, title_en, description_ro, description_en, file_url, is_active, sort_order")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data ?? []) as ResourceRow[];
    },
  });

export const useResource = (slug: string) => {
  const { data, isLoading } = useResources();
  return { resource: data?.find((r) => r.slug === slug) ?? null, isLoading, loaded: !!data };
};
