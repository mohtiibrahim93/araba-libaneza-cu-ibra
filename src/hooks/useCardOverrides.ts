import { useQuery } from "@tanstack/react-query";

export interface CardOverride {
  ar: string;
  ro: string;
  variants: string[];
}

/** The shape the game's own workspace stores and applies. */
export type CardOverrides = Record<string, CardOverride>;

/**
 * Teacher corrections to the Yalla card bank, shared with every learner.
 *
 * The game's teacher workspace writes corrections to the browser it was used
 * in. These rows are the published set: corrections the teacher promoted, that
 * every visitor's game applies over the bundled cards at start-up.
 *
 * Fails soft, like useSiteTexts: any error — offline, RLS, table missing —
 * yields an empty set, so the game falls back to its bundled text rather than
 * failing to start. A correction not arriving is a small problem; a blank game
 * is a large one.
 *
 * The Supabase client is imported inside the query rather than at module
 * scope. /joc is a public page, and a static import would put 216 KB back on
 * its critical path — the same mistake src/hooks/useSiteTexts.ts documents.
 */
export function useCardOverrides() {
  const { data } = useQuery({
    queryKey: ["yalla-card-overrides"],
    queryFn: async (): Promise<CardOverrides> => {
      const { supabase } = await import("@/integrations/supabase/client");
      // The generated Supabase types don't yet include yalla_card_overrides,
      // so the query chain is loosened while the row shape stays explicit.
      interface Row { card_id: string; ar: string; ro: string; variants: unknown }
      const { data, error } = await (supabase as unknown as {
        from: (t: string) => { select: (c: string) => Promise<{ data: Row[] | null; error: unknown }> };
      })
        .from("yalla_card_overrides")
        .select("card_id, ar, ro, variants");
      if (error || !data) return {};
      const out: CardOverrides = {};
      for (const row of data) {
        out[row.card_id] = {
          ar: row.ar,
          ro: row.ro,
          variants: Array.isArray(row.variants) ? (row.variants as string[]) : [],
        };
      }

      return out;
    },
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
  return data ?? {};
}
