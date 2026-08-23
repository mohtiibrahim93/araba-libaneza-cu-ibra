import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface SiteTextRow {
  key: string;
  value_ro: string;
  value_en: string;
}

/**
 * Owner-edited overrides for the shared UI dictionary (`src/lib/i18n.tsx`).
 * Fails soft: any error (offline, RLS, table missing) → empty list, so the
 * code-shipped strings always render.
 */
export function useSiteTexts() {
  const { data } = useQuery({
    queryKey: ["site-texts"],
    queryFn: async (): Promise<SiteTextRow[]> => {
      const { data, error } = await supabase
        .from("site_texts")
        .select("key, value_ro, value_en");
      if (error) return [];
      return data ?? [];
    },
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
  return data ?? [];
}
