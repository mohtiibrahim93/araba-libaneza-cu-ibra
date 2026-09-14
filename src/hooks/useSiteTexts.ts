import { useQuery } from "@tanstack/react-query";

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
      // Imported here rather than at the top of the file, and that placement is
      // load-bearing. This hook is called from src/lib/i18n.tsx, which wraps
      // every page on the site, so a static import put the Supabase client —
      // 216 KB, 56 KB gzipped — on the critical path of every route,
      // modulepreloaded ahead of first paint, to serve a request that cannot
      // run until after mount. Importing it inside the query keeps it out of
      // the static graph without changing when the fetch happens.
      const { supabase } = await import("@/integrations/supabase/client");
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
