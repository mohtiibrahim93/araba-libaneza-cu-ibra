/**
 * "Did you mean this page?" — recommendations built from the route registry.
 *
 * Two entry points share one index:
 *  - suggestFor(pathname) — someone landed on an address that does not exist
 *    (an old search result, a mistyped or truncated link). The wrong slug is
 *    usually a decent description of what they wanted, so it is matched against
 *    every real page instead of dead-ending on a fixed list of links.
 *  - searchPages(query, lang) — the visitor types what they are looking for.
 *
 * The index is derived from src/lib/seoHead.ts (path + title + description) and
 * src/lib/blogPosts.ts, so a new page is searchable the moment it is
 * registered. Nothing is hardcoded here and nothing can go stale.
 *
 * Pure functions, no network: they run the same in SSR and in the browser.
 */
import { allSeoRoutes } from "@/lib/seoHead";
import { BLOG_POSTS, type Localized } from "@/lib/blogPosts";

export interface FoundPage {
  path: string;
  title: string;
  description: string;
  lang: "ro" | "en";
  /** True for blog articles, so the UI can show a cover and a different label. */
  article: boolean;
}

/** Never recommended: private, transactional or dead-end routes. */
const EXCLUDED = /^\/(admin|auth|checkout|booking\/|plata|payment|thank-you|multumesc|unsubscribe|dezabonare|stergere-date)/;

const STOPWORDS = new Set([
  // Romanian
  "de", "la", "in", "cu", "si", "pe", "pentru", "din", "un", "o", "un", "ale", "al", "a", "ce",
  "cum", "sa", "se", "te", "mai", "cel", "cea", "este", "sunt", "va", "vor", "fara", "prin",
  // English
  "the", "a", "an", "of", "for", "and", "to", "in", "on", "with", "your", "you", "how", "what",
  "is", "are", "best", "learn",
]);

/** Lowercase, strip diacritics, split into comparable word stems. */
export function tokenize(input: string): string[] {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length > 2 && !STOPWORDS.has(w))
    .map(stem);
}

/**
 * Crude stemming, enough to make "cursuri"/"curs", "lessons"/"lesson" and
 * "copiii"/"copii" match. A real stemmer would be a dependency and a
 * maintenance burden for a helper that only ranks a hundred short strings.
 */
function stem(word: string): string {
  let w = word;
  if (w.length > 5 && w.endsWith("urile")) w = w.slice(0, -5);
  else if (w.length > 4 && (w.endsWith("uri") || w.endsWith("ile") || w.endsWith("ing"))) w = w.slice(0, -3);
  else if (w.length > 3 && (w.endsWith("le") || w.endsWith("ul") || w.endsWith("ii") || w.endsWith("es"))) w = w.slice(0, -2);
  else if (w.length > 3 && (w.endsWith("i") || w.endsWith("e") || w.endsWith("s") || w.endsWith("a"))) w = w.slice(0, -1);
  return w;
}

let index: FoundPage[] | null = null;

/** Every recommendable page, with its searchable text. */
export function searchablePages(): FoundPage[] {
  if (index) return index;
  const articles = new Set(BLOG_POSTS.map((p) => p.slug));
  index = allSeoRoutes()
    .filter((r) => !r.canonical && !r.noindex && r.lang !== "de" && !EXCLUDED.test(r.path))
    .map((r) => ({
      path: r.path,
      title: r.title,
      description: r.description,
      lang: (r.lang === "en" ? "en" : "ro") as "ro" | "en",
      article: articles.has(r.path.replace(/^\/(en\/)?blog\//, "")) && r.path.includes("/blog/"),
    }));
  return index;
}

interface Scored {
  page: FoundPage;
  score: number;
}

/** Token overlap, weighted: the URL says most, the description least. */
function score(page: FoundPage, wanted: string[]): number {
  if (wanted.length === 0) return 0;
  const path = new Set(tokenize(page.path));
  const title = new Set(tokenize(page.title));
  const desc = new Set(tokenize(page.description));
  let s = 0;
  for (const w of wanted) {
    if (path.has(w)) s += 5;
    else if ([...path].some((p) => p.startsWith(w) || w.startsWith(p))) s += 3;
    if (title.has(w)) s += 3;
    if (desc.has(w)) s += 1;
  }
  // Shallow pages win ties: /cursuri/copii over /blog/araba-pentru-copii-….
  return s - page.path.split("/").length * 0.1;
}

function rank(pages: FoundPage[], wanted: string[], limit: number): FoundPage[] {
  const scored: Scored[] = pages
    .map((page) => ({ page, score: score(page, wanted) }))
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((s) => s.page);
}

/**
 * The pages most likely meant by an address that does not exist.
 *
 * Language is taken from the wrong URL itself (/en/… asks in English), so an
 * English visitor is not handed Romanian pages.
 */
export function suggestFor(pathname: string, limit = 3): FoundPage[] {
  const lang: "ro" | "en" = pathname.startsWith("/en/") || pathname === "/en" ? "en" : "ro";
  const wanted = tokenize(pathname.replace(/^\/en\//, "/"));
  const sameLang = searchablePages().filter((p) => p.lang === lang);
  const hits = rank(sameLang, wanted, limit);
  // A Romanian-only page (the game, the resources) is still the right answer
  // for an English reader when nothing English matches.
  if (hits.length === 0 && lang === "en") return rank(searchablePages(), wanted, limit);
  return hits;
}

/** Free-text search over the same index, filtered to one language. */
export function searchPages(query: string, lang: "ro" | "en", limit = 8): FoundPage[] {
  const wanted = tokenize(query);
  if (wanted.length === 0) return [];
  return rank(
    searchablePages().filter((p) => p.lang === lang),
    wanted,
    limit,
  );
}

/** Curated shortlists for the recommendation sections, by language. */
export interface Recommendation {
  to: string;
  label: Localized;
  note: Localized;
}

export const COURSE_PICKS: Recommendation[] = [
  {
    to: "/cursuri/grup",
    label: { ro: "Curs de grup (A1–C2)", en: "Group course (A1–C2)" },
    note: { ro: "Grupe mici, București sau online", en: "Small groups, Bucharest or online" },
  },
  {
    to: "/cursuri/private",
    label: { ro: "Lecții private", en: "Private lessons" },
    note: { ro: "Program flexibil, 1:1 cu Ibrahim", en: "Flexible schedule, 1-on-1 with Ibrahim" },
  },
  {
    to: "/cursuri/copii",
    label: { ro: "Copii (6–11 ani)", en: "Kids (6–11)" },
    note: { ro: "Doar fizic, prin joc și povești", en: "In person only, through play and stories" },
  },
  {
    to: "/cursuri-araba-adolescenti",
    label: { ro: "Adolescenți (12–17 ani)", en: "Teens (12–17)" },
    note: { ro: "Ritm adaptat vârstei", en: "Pace adapted to their age" },
  },
  {
    to: "/trial",
    label: { ro: "Lecție de probă gratuită", en: "Free trial lesson" },
    note: { ro: "30 de minute, 0 lei", en: "30 minutes, 0 LEI" },
  },
];

export const RESOURCE_PICKS: Recommendation[] = [
  {
    to: "/joc",
    label: { ro: "Jocul Yalla", en: "The Yalla game" },
    note: {
      ro: "Peste 4.300 de expresii, cu test de nivel orientativ",
      en: "Over 4,300 phrases, with a placement check",
    },
  },
  {
    to: "/test-de-nivel",
    label: { ro: "Test de nivel", en: "Level test" },
    note: { ro: "~15 minute, îți spune de unde pornești", en: "~15 minutes, tells you where to start" },
  },
  {
    to: "/resurse",
    label: { ro: "Resurse gratuite (PDF)", en: "Free resources (PDF)" },
    note: { ro: "Arabizi, 100 de expresii, plan de 30 de zile", en: "Arabizi, 100 phrases, 30-day plan" },
  },
  {
    to: "/arabizi",
    label: { ro: "Ghidul arabizi", en: "The arabizi guide" },
    note: { ro: "Citește libaneza fără alfabetul arab", en: "Read Lebanese without the Arabic script" },
  },
];
