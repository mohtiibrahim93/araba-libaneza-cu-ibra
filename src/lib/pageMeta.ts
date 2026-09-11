/**
 * Meta titles and descriptions for the two pages that were fighting each other.
 *
 * Same problem src/lib/levelMeta.ts was created to solve, in a different place.
 * `/cursuri-araba` had its head written twice — once in scripts/seoPrerender.ts
 * for the static file and once in src/pages/seo/CursuriAraba.tsx for the runtime
 * head — and the two had drifted apart in both title and description. Because
 * the runtime tags replace the prerendered ones, a crawler that executes
 * JavaScript read one page and a crawler that didn't read another.
 *
 * The second problem was that the homepage and /cursuri-araba were chasing the
 * identical head term ("cursuri de arabă libaneză în București și online"),
 * which forces Google to pick one and splits the signals between them. They now
 * target different intents:
 *
 *   /               brand and teacher — someone looking for Ibra, or for a
 *                   native Lebanese teacher in Bucharest.
 *   /cursuri-araba  the transactional query — courses, levels, prices. This is
 *                   the hub the homepage links to, and the page the blog should
 *                   point at.
 *
 * Local intent ("cursuri arabă București") deliberately stays with
 * /cursuri-araba-bucuresti rather than being claimed a third time here.
 *
 * One entry per page, imported by both the build script and the component, so
 * they cannot disagree again. The build asserts every title is at most
 * TITLE_MAX characters and every description at most DESC_MAX.
 */
export const TITLE_MAX = 60;
export const DESC_MAX = 160;

export interface PageMeta {
  title: string;
  description: string;
}

export const HOME_META: Record<"ro" | "en", PageMeta> = {
  ro: {
    title: "Cursuri de arabă în București — Arabă libaneză cu Ibra",
    description:
      "Cursuri de arabă în București, în dialect libanez, cu Ibra — profesor nativ. Adulți, adolescenți și copii, fizic sau online. Prima lecție de probă e gratuită.",
  },
  en: {
    title: "Lebanese Arabic with Ibra — Native Teacher, Bucharest",
    description:
      "Ibra is a native Lebanese Arabic teacher in Bucharest, teaching adults, teenagers and children in person or online. The first trial lesson is free.",
  },
};

export const CURSURI_ARABA_META: PageMeta = {
  title: "Cursuri Arabă Libaneză A1–C2 | Prețuri și Niveluri",
  description:
    "Toate cursurile de arabă libaneză într-un loc: grupe A1–C2, lecții private 1:1 și curs pentru copii, cu prețuri afișate. Probă gratuită de 30 de minute.",
};
