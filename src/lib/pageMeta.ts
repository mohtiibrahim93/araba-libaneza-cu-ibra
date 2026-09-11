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
 *   /                         brand, teacher and overview — someone looking for
 *                             Ibra, or wanting to see who teaches, what starts
 *                             now and how to begin. No per-level detail: it
 *                             sends people onward rather than ranking for the
 *                             course query itself.
 *   /cursuri-limba-araba      the transactional query — courses, levels,
 *                             prices, all formats in one place. The hub the
 *                             homepage links to and the blog points at.
 *   /cursuri/grup             the actual list of group cohorts A1–C2. Where
 *                             someone searching for a course to join lands.
 *   /cursuri-araba-bucuresti  local intent ("cursuri arabă București").
 *
 * Four pages, four intents, and none of them may lead on another's term. The
 * homepage title drifted onto "Cursuri de arabă în București" once, which is
 * the Bucharest page's whole reason to exist — src/test/page-meta.test.ts now
 * asserts the separation on all four rather than two, because checking only
 * two is what let that through.
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
    title: "Arabă Libaneză cu Ibra — Profesor Nativ în București",
    description:
      "Ibra, profesor nativ de arabă libaneză: cine sunt, cum predau, ce grupe încep acum și resurse gratuite ca să începi. Prima lecție de probă e gratuită.",
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
