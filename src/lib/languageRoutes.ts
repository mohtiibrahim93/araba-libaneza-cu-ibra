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
  "/dialecte-arabe/libaneza-vs-egipteana": "/en/arabic-dialects-guide/lebanese-vs-egyptian-arabic",
  "/dialecte-arabe/libaneza-vs-siriana": "/en/arabic-dialects-guide/lebanese-vs-syrian-arabic",
  "/dialecte-arabe/levantina-vs-golf": "/en/arabic-dialects-guide/levantine-vs-gulf-arabic",
  "/dialecte-arabe/levantina-vs-irakiana": "/en/arabic-dialects-guide/levantine-vs-iraqi-arabic",
  "/dialecte-arabe/levantina-vs-maghrebina": "/en/arabic-dialects-guide/levantine-vs-maghrebi-arabic",
  "/dialecte-arabe/levantina-vs-peninsulara": "/en/arabic-dialects-guide/levantine-vs-peninsular-arabic",
  "/ce-araba-sa-inveti": "/en/lebanese-arabic-vs-msa-vs-egyptian",
  // Resources / method
  // These three point at the resources article, which now has an English URL
  // of its own. They used to send an English reader to /blog/<slug> — the
  // Romanian address — which the localised links then treated as the correct
  // English destination, so a reader clicking "Arabizi guide" on an English
  // page landed back in Romanian.
  "/resurse": "/en/blog/lebanese-arabic-learning-resources",
  "/invata-araba-gratis": "/en/blog/lebanese-arabic-learning-resources",
  "/arabizi": "/en/blog/lebanese-arabic-learning-resources",
  "/fara-alfabet-arab": "/en/how-to-learn-lebanese-arabic",
  // Conversion and legal pages: bilingual components, one URL per language.
  "/trial": "/en/trial",
  "/booking": "/en/booking",
  "/quiz": "/en/quiz",
  "/te-ajutam": "/en/find-your-page",
  "/contact": "/en/contact",
  "/rezervari": "/en/my-bookings",
  "/privacy": "/en/privacy",
  "/terms": "/en/terms",
  // Course pages: same bilingual component, one URL per language.
  "/cursuri": "/en/courses",
  "/cursuri/grup": "/en/courses/group",
  "/cursuri/private": "/en/courses/private",
  "/cursuri/copii": "/en/courses/children",
  "/cursuri/adulti": "/en/courses/adults",
  "/cursuri/grup/a1": "/en/courses/group/a1",
  "/cursuri/grup/a2": "/en/courses/group/a2",
  "/cursuri/grup/b1": "/en/courses/group/b1",
  "/cursuri/grup/b2": "/en/courses/group/b2",
  "/cursuri/grup/c1": "/en/courses/group/c1",
  "/cursuri/grup/c2": "/en/courses/group/c2",
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
  "/en/arabic-dialects-guide/lebanese-vs-egyptian-arabic": "/dialecte-arabe/libaneza-vs-egipteana",
  "/en/arabic-dialects-guide/lebanese-vs-syrian-arabic": "/dialecte-arabe/libaneza-vs-siriana",
  "/en/arabic-dialects-guide/levantine-vs-gulf-arabic": "/dialecte-arabe/levantina-vs-golf",
  "/en/arabic-dialects-guide/levantine-vs-iraqi-arabic": "/dialecte-arabe/levantina-vs-irakiana",
  "/en/arabic-dialects-guide/levantine-vs-maghrebi-arabic": "/dialecte-arabe/levantina-vs-maghrebina",
  "/en/arabic-dialects-guide/levantine-vs-peninsular-arabic": "/dialecte-arabe/levantina-vs-peninsulara",
  "/en/arabic-classes-near-me": "/cursuri-araba-bucuresti",
  "/en/lebanese-arabic-vs-msa-vs-egyptian": "/ce-araba-sa-inveti",
  "/en/how-to-learn-lebanese-arabic": "/blog/cum-inveti-araba-libaneza",
  "/de/arabisch-lernen": "/cursuri-limba-araba",
  "/en/trial": "/trial",
  "/en/booking": "/booking",
  "/en/quiz": "/quiz",
  "/en/find-your-page": "/te-ajutam",
  "/en/contact": "/contact",
  "/en/my-bookings": "/rezervari",
  "/en/privacy": "/privacy",
  "/en/terms": "/terms",
  // Course pages, the other way round.
  "/en/courses": "/cursuri",
  "/en/courses/group": "/cursuri/grup",
  "/en/courses/private": "/cursuri/private",
  "/en/courses/children": "/cursuri/copii",
  "/en/courses/adults": "/cursuri/adulti",
  "/en/courses/group/a1": "/cursuri/grup/a1",
  "/en/courses/group/a2": "/cursuri/grup/a2",
  "/en/courses/group/b1": "/cursuri/grup/b1",
  "/en/courses/group/b2": "/cursuri/grup/b2",
  "/en/courses/group/c1": "/cursuri/grup/c1",
  "/en/courses/group/c2": "/cursuri/grup/c2",
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

/**
 * The canonical path for a page currently rendering in `lang`.
 *
 * Every bilingual page on this site renders from one component at two URLs —
 * /trial and /en/trial, /blog/<slug> and /en/blog/<slug> — and the canonical
 * has to name the URL the reader actually arrived on. Hardcoding the Romanian
 * one, which is what most pages did, tells Google the English URL is a
 * duplicate of the Romanian page and should be dropped: the English half
 * existed, served English, and asked not to be indexed.
 *
 * Pass the Romanian path; in Romanian it comes back unchanged, and in English
 * it becomes that page's own /en/ URL. A page with no English twin has no
 * counterpart and keeps its single URL, so this is safe to apply everywhere —
 * which is the point, since the bug came from each page deciding for itself.
 */
export function canonicalPath(roPath: string, lang: "ro" | "en"): string {
  if (lang !== "en") return roPath;
  return languageCounterpart(roPath, "en") ?? roPath;
}
