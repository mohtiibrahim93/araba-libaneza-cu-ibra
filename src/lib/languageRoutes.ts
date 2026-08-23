// RO <-> EN route pairs for the language toggle.
//
// Most of the site is single-URL bilingual (the toggle just swaps strings in
// place). The exceptions are the dedicated English pages (/en/*, English blog
// posts) and their Romanian-only counterparts (the SEO landings built on
// LandingLayout and the Romanian blog): their bodies are written in one
// language, so switching language has to *navigate* to the closest twin route
// rather than translate in place.
//
// These maps drive navigation only. They are intentionally broader than the
// hreflang annotations (LandingLayout `enHref` / EnLandingLayout `roHref`),
// which must stay reserved for true equivalents.

const EN_FOR_RO: Record<string, string> = {
  // Course / offer landings
  "/meditatii-araba": "/en/arabic-tutor",
  "/cursuri-araba": "/en/learn-lebanese-arabic",
  "/araba-online": "/en/learn-lebanese-arabic",
  "/cursuri-limba-araba": "/en/learn-lebanese-arabic",
  "/araba-pentru-incepatori": "/en/learn-lebanese-arabic",
  "/invata-araba": "/en/learn-lebanese-arabic",
  "/cursuri-araba-bucuresti": "/en/arabic-classes-near-me",
  "/curs-araba-copii": "/en/learn-lebanese-arabic",
  "/araba-pentru-partener": "/en/learn-lebanese-arabic",
  "/araba-in-familie": "/en/learn-lebanese-arabic",
  // Dialect cluster
  "/dialecte-arabe": "/en/arabic-dialects-guide",
  "/ce-araba-sa-inveti": "/en/lebanese-arabic-vs-msa-vs-egyptian",
  // Resources / method
  "/resurse": "/blog/lebanese-arabic-learning-resources",
  "/invata-araba-gratis": "/blog/lebanese-arabic-learning-resources",
  "/arabizi": "/blog/lebanese-arabic-learning-resources",
  "/fara-alfabet-arab": "/en/how-to-learn-lebanese-arabic",
  // Romanian blog -> closest English article
  "/blog/cum-inveti-araba-libaneza": "/en/how-to-learn-lebanese-arabic",
  "/blog/araba-libaneza-vs-araba-standard": "/en/lebanese-arabic-vs-msa-vs-egyptian",
  "/blog/primele-20-de-expresii-libaneze": "/blog/lebanese-arabic-phrases",
  "/blog/cum-saluti-in-libaneza": "/blog/lebanese-arabic-phrases",
  "/blog/numere-in-araba-libaneza": "/blog/lebanese-arabic-phrases",
  "/blog/gramatica-arabei-libaneze": "/blog/learn-lebanese-arabic",
  "/blog/alfabetul-arab-pentru-incepatori": "/en/how-to-learn-lebanese-arabic",
  "/blog/cat-dureaza-sa-inveti-araba-libaneza": "/en/how-to-learn-lebanese-arabic",
  "/blog/ce-este-arabizi": "/blog/lebanese-arabic-learning-resources",
  "/blog/cultura-libaneza-obiceiuri-mancare-traditii": "/blog/lebanese-family-vocabulary",
  "/blog/araba-pentru-copii-ghidul-parintilor": "/blog/lebanese-family-vocabulary",
  "/blog/cum-alegi-profesor-de-araba": "/en/arabic-tutor",
  "/blog/invata-araba-libaneza-online": "/en/learn-lebanese-arabic",
  "/blog/cat-costa-cursurile-de-araba-libaneza": "/en/learn-lebanese-arabic",
  "/blog/de-ce-invatam-araba-in-2026": "/blog/learn-lebanese-arabic",
  "/blog/limbile-vorbite-in-liban": "/en/arabic-dialects-guide",
  // German landing: send English speakers to the English hub
  "/de/arabisch-lernen": "/en/learn-lebanese-arabic",
};

const RO_FOR_EN: Record<string, string> = {
  "/en/arabic-tutor": "/meditatii-araba",
  "/en/learn-lebanese-arabic": "/cursuri-limba-araba",
  "/en/learn-levantine-arabic": "/cursuri-limba-araba",
  "/en/arabic-dialects-guide": "/dialecte-arabe",
  "/en/levantine-arabic-dialects-map": "/dialecte-arabe",
  "/en/arabic-classes-near-me": "/cursuri-araba-bucuresti",
  "/en/lebanese-arabic-vs-msa-vs-egyptian": "/ce-araba-sa-inveti",
  "/en/how-to-learn-lebanese-arabic": "/blog/cum-inveti-araba-libaneza",
  // English blog -> closest Romanian article / hub
  "/blog/learn-lebanese-arabic": "/blog/cum-inveti-araba-libaneza",
  "/blog/lebanese-arabic-phrases": "/blog/primele-20-de-expresii-libaneze",
  "/blog/lebanese-family-vocabulary": "/blog/cultura-libaneza-obiceiuri-mancare-traditii",
  "/blog/lebanese-arabic-learning-resources": "/resurse",
  "/de/arabisch-lernen": "/cursuri-limba-araba",
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
