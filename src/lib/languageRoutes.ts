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
  "/cursuri-limba-araba": "/en/learn-lebanese-arabic",
  "/cursuri-araba-bucuresti": "/en/arabic-classes-near-me",
  "/curs-araba-copii": "/en/learn-lebanese-arabic",
  "/araba-pentru-partener": "/en/learn-lebanese-arabic",
  "/araba-in-familie": "/en/learn-lebanese-arabic",
  "/cel-mai-bun-curs-de-araba": "/en/best-arabic-course",
  "/cursuri-araba-adolescenti": "/en/arabic-for-teenagers",
  // Dialect cluster
  "/dialecte-arabe": "/en/arabic-dialects-guide",
  "/ce-araba-sa-inveti": "/en/lebanese-arabic-vs-msa-vs-egyptian",
  // Resources / method
  "/resurse": "/blog/lebanese-arabic-learning-resources",
  "/invata-araba-gratis": "/blog/lebanese-arabic-learning-resources",
  "/arabizi": "/blog/lebanese-arabic-learning-resources",
  "/fara-alfabet-arab": "/en/how-to-learn-lebanese-arabic",
  // Blog: every article has an exact English twin at the same slug.
  "/blog": "/en/blog",
  "/blog/lebanese-arabic-learning-resources": "/en/blog/lebanese-arabic-learning-resources",
  "/blog/limbile-vorbite-in-liban": "/en/blog/limbile-vorbite-in-liban",
  "/blog/de-ce-invatam-araba-in-2026": "/en/blog/de-ce-invatam-araba-in-2026",
  "/blog/lebanese-arabic-phrases": "/en/blog/lebanese-arabic-phrases",
  "/blog/lebanese-family-vocabulary": "/en/blog/lebanese-family-vocabulary",
  "/blog/invata-araba-libaneza-online": "/en/blog/invata-araba-libaneza-online",
  "/blog/numere-in-araba-libaneza": "/en/blog/numere-in-araba-libaneza",
  "/blog/cum-alegi-profesor-de-araba": "/en/blog/cum-alegi-profesor-de-araba",
  "/blog/cat-dureaza-sa-inveti-araba-libaneza": "/en/blog/cat-dureaza-sa-inveti-araba-libaneza",
  "/blog/araba-pentru-copii-ghidul-parintilor": "/en/blog/araba-pentru-copii-ghidul-parintilor",
  "/blog/cat-costa-cursurile-de-araba-libaneza": "/en/blog/cat-costa-cursurile-de-araba-libaneza",
  "/blog/alfabetul-arab-pentru-incepatori": "/en/blog/alfabetul-arab-pentru-incepatori",
  "/blog/ce-este-arabizi": "/en/blog/ce-este-arabizi",
  "/blog/cultura-libaneza-obiceiuri-mancare-traditii": "/en/blog/cultura-libaneza-obiceiuri-mancare-traditii",
  "/blog/cum-saluti-in-libaneza": "/en/blog/cum-saluti-in-libaneza",
  "/blog/primele-20-de-expresii-libaneze": "/en/blog/primele-20-de-expresii-libaneze",
  "/blog/araba-libaneza-vs-araba-standard": "/en/blog/araba-libaneza-vs-araba-standard",
  "/blog/cum-inveti-araba-libaneza": "/en/blog/cum-inveti-araba-libaneza",
  "/blog/gramatica-arabei-libaneze": "/en/blog/gramatica-arabei-libaneze",
  // German landing: send English speakers to the English hub
  "/de/arabisch-lernen": "/en/learn-lebanese-arabic",
};

const RO_FOR_EN: Record<string, string> = {
  "/en/arabic-tutor": "/meditatii-araba",
  "/en/best-arabic-course": "/cel-mai-bun-curs-de-araba",
  "/en/arabic-for-teenagers": "/cursuri-araba-adolescenti",
  "/en/learn-lebanese-arabic": "/cursuri-limba-araba",
  "/en/arabic-dialects-guide": "/dialecte-arabe",
  "/en/arabic-classes-near-me": "/cursuri-araba-bucuresti",
  "/en/lebanese-arabic-vs-msa-vs-egyptian": "/ce-araba-sa-inveti",
  "/en/how-to-learn-lebanese-arabic": "/blog/cum-inveti-araba-libaneza",
  "/de/arabisch-lernen": "/cursuri-limba-araba",
  // Blog twins, the other way round.
  "/en/blog": "/blog",
  "/en/blog/lebanese-arabic-learning-resources": "/blog/lebanese-arabic-learning-resources",
  "/en/blog/limbile-vorbite-in-liban": "/blog/limbile-vorbite-in-liban",
  "/en/blog/de-ce-invatam-araba-in-2026": "/blog/de-ce-invatam-araba-in-2026",
  "/en/blog/lebanese-arabic-phrases": "/blog/lebanese-arabic-phrases",
  "/en/blog/lebanese-family-vocabulary": "/blog/lebanese-family-vocabulary",
  "/en/blog/invata-araba-libaneza-online": "/blog/invata-araba-libaneza-online",
  "/en/blog/numere-in-araba-libaneza": "/blog/numere-in-araba-libaneza",
  "/en/blog/cum-alegi-profesor-de-araba": "/blog/cum-alegi-profesor-de-araba",
  "/en/blog/cat-dureaza-sa-inveti-araba-libaneza": "/blog/cat-dureaza-sa-inveti-araba-libaneza",
  "/en/blog/araba-pentru-copii-ghidul-parintilor": "/blog/araba-pentru-copii-ghidul-parintilor",
  "/en/blog/cat-costa-cursurile-de-araba-libaneza": "/blog/cat-costa-cursurile-de-araba-libaneza",
  "/en/blog/alfabetul-arab-pentru-incepatori": "/blog/alfabetul-arab-pentru-incepatori",
  "/en/blog/ce-este-arabizi": "/blog/ce-este-arabizi",
  "/en/blog/cultura-libaneza-obiceiuri-mancare-traditii": "/blog/cultura-libaneza-obiceiuri-mancare-traditii",
  "/en/blog/cum-saluti-in-libaneza": "/blog/cum-saluti-in-libaneza",
  "/en/blog/primele-20-de-expresii-libaneze": "/blog/primele-20-de-expresii-libaneze",
  "/en/blog/araba-libaneza-vs-araba-standard": "/blog/araba-libaneza-vs-araba-standard",
  "/en/blog/cum-inveti-araba-libaneza": "/blog/cum-inveti-araba-libaneza",
  "/en/blog/gramatica-arabei-libaneze": "/blog/gramatica-arabei-libaneze",
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
