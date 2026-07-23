// RO <-> EN route pairs for the language toggle.
//
// Most of the site is single-URL bilingual (the toggle just swaps strings in
// place). The exceptions are the dedicated English SEO pages under /en/* and
// their Romanian-only counterparts (the /pages built on LandingLayout): their
// bodies are written in one language, so switching language has to *navigate*
// to the twin route rather than translate in place.
//
// Keep these in sync with the visible "English version" / "Versiune română"
// links (LandingLayout `enHref`, EnLandingLayout `roHref`).

const EN_FOR_RO: Record<string, string> = {
  "/meditatii-araba": "/en/arabic-tutor",
  "/cursuri-araba": "/en/learn-lebanese-arabic",
  "/araba-online": "/en/learn-lebanese-arabic",
  "/cursuri-limba-araba": "/en/learn-lebanese-arabic",
  "/araba-pentru-incepatori": "/en/learn-lebanese-arabic",
  "/invata-araba": "/en/learn-lebanese-arabic",
  "/cursuri-araba-bucuresti": "/en/arabic-classes-near-me",
  "/blog/araba-libaneza-vs-araba-standard": "/en/lebanese-arabic-vs-msa-vs-egyptian",
  "/blog/cum-inveti-araba-libaneza": "/en/how-to-learn-lebanese-arabic",
};

const RO_FOR_EN: Record<string, string> = {
  "/en/arabic-tutor": "/meditatii-araba",
  "/en/learn-lebanese-arabic": "/cursuri-araba",
  "/en/learn-levantine-arabic": "/cursuri-araba",
  "/en/arabic-dialects-guide": "/cursuri-araba",
  "/en/arabic-classes-near-me": "/cursuri-araba-bucuresti",
  "/en/lebanese-arabic-vs-msa-vs-egyptian": "/blog/araba-libaneza-vs-araba-standard",
  "/en/how-to-learn-lebanese-arabic": "/blog/cum-inveti-araba-libaneza",
};

/**
 * The counterpart route for `path` in the target language, or null when the
 * current page has no dedicated twin (the toggle then just swaps strings in
 * place, as everywhere else on the site).
 */
export function languageCounterpart(path: string, target: "ro" | "en"): string | null {
  const clean = path.replace(/\/+$/, "") || "/";
  return (target === "en" ? EN_FOR_RO : RO_FOR_EN)[clean] ?? null;
}
