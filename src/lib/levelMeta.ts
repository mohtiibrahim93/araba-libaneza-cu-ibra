/**
 * Meta titles for the /cursuri/grup/:level pages.
 *
 * These used to be written twice — once in scripts/seoPrerender.ts for the
 * static head and once in CursGrupLevel.tsx for the runtime head — and the two
 * had drifted. Since the runtime tags now replace the prerendered ones rather
 * than duplicating them, whatever the component says is what a crawler that
 * executes JavaScript ends up reading; the C2 page was serving a 76-character
 * title that way, and A1 a 66-character one, past the point Google truncates.
 *
 * One map, imported by both, so they cannot disagree again. The build asserts
 * every entry is at most 60 characters.
 */
export type GroupLevel = "a1" | "a2" | "b1" | "b2" | "c1" | "c2";

export const LEVEL_TITLE_MAX = 60;

/** Romanian meta titles, all within the SERP limit. */
export const LEVEL_TITLE_RO: Record<GroupLevel, string> = {
  a1: "Curs Arabă A1 în București și Online | Arabă Libaneză",
  a2: "Curs de Arabă Libaneză A2 — Grup, București & Online",
  b1: "Curs de Arabă Libaneză B1 – Grup | Ibra",
  b2: "Curs B2 de Arabă Libaneză — Grup, București & Online",
  c1: "Curs de Arabă Libaneză C1 — Nivel Avansat",
  c2: "Curs C2 de Arabă Libaneză — Academic și Specializat",
};

/**
 * English titles for the language toggle. These routes are Romanian-only in the
 * sitemap, so this is UI polish rather than an SEO surface.
 */
export const LEVEL_TITLE_EN: Record<GroupLevel, string> = {
  a1: "Beginner Arabic Course Bucharest & Online — A1",
  a2: "Lebanese Arabic A2 Group Course — Bucharest & Online",
  b1: "Lebanese Arabic B1 Group Course | Ibra",
  b2: "Lebanese Arabic B2 Group Course — Bucharest & Online",
  c1: "Lebanese Arabic C1 Course — Advanced",
  c2: "Lebanese Arabic C2 Course — Academic & Specialised",
};

/**
 * A1's description, in both languages.
 *
 * A1 is the highest-intent entry point ("curs araba incepatori bucuresti"), so
 * it gets commercial copy where the other levels fall back to the CEFR
 * objective. That copy lived in CursGrupLevel.tsx only, and the English half
 * never reached the route table — so /en/courses/group/a1 served the objective
 * to a crawler that does not run JavaScript and this to one that does.
 */
export const LEVEL_A1_DESCRIPTION: Record<"ro" | "en", string> = {
  ro: "Învață araba libaneză la nivel A1, în București sau online. Vorbești din primele lecții cu profesor nativ. Înscrie-te la o lecție de probă gratuită.",
  en: "Beginner (A1) Lebanese Arabic group course — in person in Bucharest (Strada Icoanei 80) or online. Speak from lesson one. Two 90-min sessions/week. Free trial.",
};

export const levelTitle = (level: string, lang: string): string => {
  const key = level.toLowerCase() as GroupLevel;
  const table = lang === "en" ? LEVEL_TITLE_EN : LEVEL_TITLE_RO;
  return table[key] ?? LEVEL_TITLE_RO[key] ?? "";
};
