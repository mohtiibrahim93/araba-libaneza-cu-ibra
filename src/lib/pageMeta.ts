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

/**
 * /joc — the Yalla practice game.
 *
 * A fifth intent, and deliberately not a sixth course page: nobody searching
 * "cursuri de arabă" should land here, and nothing here competes for that term.
 * It targets free practice ("exerciții", "joc") — people who want to drill
 * rather than enrol — and its job is to send them on to a course once they do.
 *
 * The game itself is a static app under /public/yalla, embedded on this page.
 * Its own /yalla/index.html is kept out of the index via robots.txt so it
 * cannot become a second, chrome-less crawl destination for the same content.
 *
 * Romanian only, and there is no English twin on purpose: the learner content
 * is written in Romanian throughout (Romanian is the only translation language
 * the card bank carries), so an /en/ URL would promise a translation that does
 * not exist. A route with no declared twin emits no hreflang, which is correct
 * here rather than a gap.
 */
export const JOACA_META: PageMeta = {
  title: "Joacă și învață arabă libaneză — exerciții gratuite",
  description:
    "Exersează araba libaneză gratuit: peste 4.300 de expresii cu sens în română, exerciții, potriviri și recapitulări programate. Fără cont, direct în browser.",
};

/**
 * /test-de-nivel — the placement test, on a page that is the test.
 *
 * Split out from /quiz, which promised "test de nivel gratuit" in its title and
 * then asked the visitor to declare their own level from a list. The two were
 * competing for one query while neither served it: the chooser could not test
 * anyone, and the real 24-question test sat inside the game with no page of its
 * own. This page is the test; /quiz is now titled as the 30-second chooser it
 * is, so they stop cannibalising each other.
 *
 * Romanian only, like /joc: the test reads situations and takes answers in
 * Arabizi against a card bank whose meanings are Romanian, so an /en/ URL would
 * advertise a translation that does not exist.
 */
export const TEST_NIVEL_META: PageMeta = {
  title: "Test de nivel gratuit la arabă libaneză | Ibra",
  description:
    "Test gratuit de nivel la araba libaneză: 24 de întrebări, aproximativ 15 minute, fără cronometru. Rezultatul îți arată de unde să începi.",
};
