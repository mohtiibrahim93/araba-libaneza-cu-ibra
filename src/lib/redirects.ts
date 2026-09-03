// Legacy / guessed URL aliases.
//
// The site is a SPA, so any unknown path renders the 404 view. People (and
// Google) reach us on plenty of "obvious" URLs that never existed here —
// /contact, /preturi, /en/courses, /faq, … — and every one of those was a dead
// end. This map redirects them to the closest real page instead.
//
// Keys must be lowercase, without a trailing slash. Values must be real routes
// declared in src/App.tsx (a hash target lands on the matching homepage
// section).

const ALIASES: Record<string, string> = {
  // Home
  "/home": "/",
  "/index": "/",
  "/index.html": "/",
  "/acasa": "/",
  "/ro": "/",
  "/ro/": "/",

  // Homepage sections
  "/contact": "/#contact",
  "/contacte": "/#contact",
  "/despre": "/#about",
  "/despre-noi": "/#about",
  "/about": "/#about",
  "/faq": "/#faq",
  "/intrebari": "/#faq",
  "/intrebari-frecvente": "/#faq",
  "/testimoniale": "/#testimonials",
  "/recenzii": "/#testimonials",
  "/pareri": "/#testimonials",

  // Courses & pricing
  "/preturi": "/cursuri",
  "/pret": "/cursuri",
  "/tarife": "/cursuri",
  "/costuri": "/cursuri",
  "/pricing": "/cursuri",
  "/courses": "/cursuri",
  "/curs": "/cursuri",
  "/curs-araba": "/cursuri-araba",
  "/curs-de-araba": "/cursuri-araba",
  "/curs-araba-online": "/araba-online",
  "/cursuri-araba-online": "/araba-online",
  "/araba": "/cursuri-araba",
  "/limba-araba": "/cursuri-araba",
  "/araba-libaneza": "/cursuri-araba",
  "/cursuri-araba-libaneza": "/cursuri-araba",
  "/grup": "/cursuri/grup",
  "/cursuri-grup": "/cursuri/grup",
  "/lectii-private": "/cursuri/private",
  "/lectii-individuale": "/cursuri/private",
  "/meditatii": "/meditatii-araba",
  "/meditatii-araba-bucuresti": "/meditatii-araba",
  "/cursuri-copii": "/curs-araba-copii",
  "/curs-copii": "/curs-araba-copii",
  "/araba-copii": "/curs-araba-copii",
  "/copii": "/cursuri/copii",
  "/cursuri-adolescenti": "/cursuri-araba-adolescenti",
  "/araba-adolescenti": "/cursuri-araba-adolescenti",
  "/cursuri-araba-tineri": "/cursuri-araba-adolescenti",
  "/adulti": "/cursuri/adulti",

  // Conversion
  "/inscriere": "/cursuri/grup",
  "/inscrieri": "/cursuri/grup",
  "/inregistrare": "/cursuri/grup",
  "/rezervare": "/trial",
  "/programare": "/trial",
  "/proba": "/trial",
  "/lectie-gratuita": "/trial",
  "/lectie-de-proba": "/trial",
  "/free-trial": "/trial",
  "/trial-lesson": "/trial",
  "/test": "/quiz",
  "/test-nivel": "/quiz",

  // Content
  "/articole": "/blog",
  "/noutati": "/blog",
  "/resurse-gratuite": "/resurse",
  "/materiale": "/resurse",
  "/resources": "/resurse",
  "/alfabet-arab": "/blog/alfabetul-arab-pentru-incepatori",
  "/alfabetul-arab": "/blog/alfabetul-arab-pentru-incepatori",
  "/dialecte": "/dialecte-arabe",
  "/dialect-arab": "/dialecte-arabe",
  "/expresii-libaneze": "/blog/primele-20-de-expresii-libaneze",
  "/gramatica": "/blog/gramatica-arabei-libaneze",

  // Legal
  "/politica-de-confidentialitate": "/privacy",
  "/confidentialitate": "/privacy",
  "/cookies": "/privacy",
  "/politica-cookies": "/privacy",
  "/termeni": "/terms",
  "/termeni-si-conditii": "/terms",

  // English
  "/en": "/en/learn-lebanese-arabic",
  "/english": "/en/learn-lebanese-arabic",
  "/en/home": "/en/learn-lebanese-arabic",
  "/en/course": "/en/learn-lebanese-arabic",
  "/en/courses": "/en/learn-lebanese-arabic",
  "/en/arabic-course": "/en/learn-lebanese-arabic",
  "/en/arabic-courses": "/en/learn-lebanese-arabic",
  "/en/learn-arabic": "/en/learn-lebanese-arabic",
  "/en/lebanese-arabic": "/en/learn-lebanese-arabic",
  "/en/arabic-lessons": "/en/learn-lebanese-arabic",
  "/en/blog": "/blog",
  "/en/articles": "/blog",
  "/en/contact": "/#contact",
  "/en/about": "/#about",
  "/en/faq": "/#faq",
  "/en/reviews": "/#testimonials",
  "/en/pricing": "/cursuri",
  "/en/prices": "/cursuri",
  "/en/tutor": "/en/arabic-tutor",
  "/en/private-lessons": "/cursuri/private",
  "/en/group-courses": "/cursuri/grup",
  "/en/kids": "/curs-araba-copii",
  "/en/arabic-for-kids": "/curs-araba-copii",
  "/en/teens": "/en/arabic-for-teenagers",
  "/en/teenagers": "/en/arabic-for-teenagers",
  "/en/dialects": "/en/arabic-dialects-guide",
  "/en/arabic-dialects": "/en/arabic-dialects-guide",
  "/en/resources": "/resurse",
  "/en/trial": "/trial",
  "/en/free-lesson": "/trial",
  "/en/booking": "/booking",
  "/en/quiz": "/quiz",
  "/en/privacy": "/privacy",
  "/en/terms": "/terms",
};

/**
 * The canonical destination for an unmatched path, or null when we have no
 * sensible guess (the visitor then gets the 404 page).
 *
 * Handles trailing slashes, mixed case and accidental `index.html` suffixes.
 */
export function resolveRedirect(pathname: string): string | null {
  // Malformed percent-escapes (e.g. "/50%off") make decodeURIComponent throw;
  // fall back to the raw path so a bad link still renders the 404 page.
  let decoded: string;
  try {
    decoded = decodeURIComponent(pathname);
  } catch {
    decoded = pathname;
  }
  const clean = decoded.toLowerCase().replace(/\/+$/, "") || "/";
  if (ALIASES[clean]) return ALIASES[clean];
  // `/Blog/` style casing on an otherwise valid path: retry the lowercase form.
  if (clean !== pathname.replace(/\/+$/, "")) return clean;
  return null;
}
