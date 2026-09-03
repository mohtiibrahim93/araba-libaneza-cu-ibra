import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import type { Plugin } from "vite";
import { BLOG_POSTS } from "../src/lib/blogPosts";
import { getCurriculum } from "../src/data/curriculum";
import { LEVEL_TITLE_RO } from "../src/lib/levelMeta";
import { LEARN_CLUSTER, LEARN_X_DEFAULT, isLearnClusterPath } from "../src/lib/hreflangCluster";

/**
 * Build-time SEO prerender.
 *
 * The app is a client-rendered SPA, so every route ships the same near-empty
 * index.html shell and the real <head> (title, description, canonical, Open
 * Graph, JSON-LD) is only injected once React runs. Search crawlers handle
 * that unevenly and social scrapers (Facebook, WhatsApp, Twitter/X, LinkedIn)
 * do not run JS at all — so shared inner-page links fall back to the homepage
 * preview and inner pages carry weak indexing signals.
 *
 * This plugin runs AFTER the client build and writes a static
 * dist/<route>/index.html per marketing route, with that route's <head> baked
 * into the shell. The <body> is untouched — React still hydrates into the
 * normal interactive app on load. It never renders components (no browser, no
 * SSR), so it cannot break the build; on any error it logs and leaves the SPA
 * shell as-is.
 *
 * Strings below mirror what each page already emits (see the referenced i18n
 * keys / page constants) so the static head matches the runtime head. Blog
 * routes are derived from BLOG_POSTS, the same source the pages use, so they
 * never drift. Default language is Romanian (the site's default); the /en/*
 * routes are English. The in-page language toggle still updates the head at
 * runtime for the other language.
 */

const BASE = "https://centruldearabalibaneza.com";

interface Route {
  path: string;
  title: string;
  description: string;
  /** Canonical override (root-relative) when this page consolidates into another. */
  canonical?: string;
  /** Exclude a retired client-side redirect from indexing until hosting can return a real 301. */
  noindex?: boolean;
  /** og:locale language. Defaults to ro, or en for /en/* paths. */
  lang?: "ro" | "en" | "de";
  /** og:type — "article" for blog posts, "website" everywhere else. */
  type?: "website" | "article";
  /** ISO publish date; blog posts only (drives article:published_time + JSON-LD). */
  published?: string;
}

// Non-blog marketing routes. Values copied from the pages' existing SEO props
// (src/lib/i18n.tsx course/home keys, src/pages/seo/*, src/pages/en/*).
const STATIC_ROUTES: Route[] = [
  { path: "/", title: "Cursuri de Arabă Libaneză în București și Online — Ibra", description: "Cursuri de arabă libaneză în București și online, pentru toate nivelurile, cu Ibra, profesor nativ din Liban. Vorbești din primele lecții." },
  { path: "/cursuri", title: "Cursuri Arabă Libaneză — Adulți, Tineri, Copii | Online", description: "Cursuri de arabă libaneză pentru adulți (18+), tineri (11–17) și copii (6–10). Grup sau 1:1, online sau fizic în București. Profesor nativ." },
  { path: "/cursuri/grup", title: "Curs de Grup de Arabă Libaneză (A1–C2) — București & online", description: "Curs de grup de arabă libaneză cu profesor nativ. Niveluri A1–C2, grupuri de 4–10 cursanți, fizic în București sau online. De la 500 LEI / lună." },
  { path: "/cursuri/private", title: "Lecții Private de Arabă Libaneză 1:1 — București & online", description: "Lecții 1:1 de arabă libaneză cu profesor nativ. Program flexibil, curriculum adaptat ție, fizic în București sau online. 150 LEI / lecție." },
  { path: "/cursuri/copii", title: "Cursuri de Arabă Libaneză pentru Copii — București", description: "Cursuri de arabă libaneză pentru copii 6–10 ani, în București. Învățare prin jocuri, activități și povești, cu profesor nativ libanez." },
  { path: "/cursuri/adulti", title: "Cursuri Arabă Libaneză — Adulți (18+)", description: "Cursuri de arabă libaneză pentru adulți: grup A1–C2 sau lecții 1:1, online sau fizic în București." },
  { path: "/cursuri/tineri", title: "Curs de Arabă pentru Adolescenți | Pagina Actualizată", description: "Pagina cursului pentru adolescenți s-a mutat. Vezi programul actual, opțiunile din București și online și rezervă o lecție de probă.", canonical: "/cursuri-araba-adolescenti", noindex: true },
  { path: "/cursuri-araba", title: "Cursuri de Arabă Libaneză cu Profesor Nativ | A1–C2", description: "Alege cursul de arabă libaneză potrivit: grupe A1–C2, lecții 1:1 sau cursuri pentru copii, în București și online. Începi cu o probă gratuită." },
  { path: "/cursuri-limba-araba", title: "Cursuri de Arabă Libaneză | București și Online", description: "Alege cursul potrivit: grupă A1–C2, lecții private sau cursuri pentru copii, în București și online, cu profesor nativ libanez.", canonical: "/cursuri-araba", noindex: true },
  { path: "/araba-pentru-incepatori", title: "Arabă Libaneză pentru Începători | Curs de la Zero", description: "Învață arabă libaneză de la zero cu profesor nativ. Cursuri pentru începători, în București sau online. Vorbești din primele lecții." },
  { path: "/araba-online", title: "Cursuri de Arabă Libaneză Online | Profesor Nativ", description: "Cursuri live de arabă libaneză online cu profesor nativ. Grupe A1–C2 și lecții private 1:1. Vorbești din primele lecții. Probă gratuită." },
  { path: "/meditatii-araba", title: "Meditații Arabă 1:1 București & Online | 150 lei/oră", description: "Meditații de arabă libaneză 1:1 cu profesor nativ, în București sau online. 150 lei/lecție de 60 min, pachete −20%, prima lecție de probă gratuită." },
  { path: "/invata-araba", title: "Învață Arabă Libaneză de la Zero | Ghid și Cursuri", description: "Ghid pas cu pas pentru a învăța araba libaneză de la zero: ce dialect alegi, cât durează, ce metodă folosești. Plus cursuri cu profesor nativ, online sau fizic." },
  { path: "/cursuri-araba-bucuresti", title: "Cursuri Arabă București 2026 | Prima Lecție Gratuită", description: "Cursuri de arabă în București, str. Icoanei 80: grupe mici A1–C2 de la 700 lei/lună, meditații 1:1 și curs pentru copii. Prima lecție de probă e gratuită." },
  { path: "/curs-araba-copii", title: "Curs de Arabă pentru Copii în București | 6–10 ani", description: "Curs de arabă libaneză pentru copii de 6–10 ani în București. Lecții prin joc, cântece și povești, în grupă mică, cu profesor nativ libanez." },
  { path: "/arabizi", title: "Arabizi: ce înseamnă 2, 3, 5 și 7 în arabă", description: "Învață ce înseamnă cifrele 2, 3, 5, 6, 7 și 8 în Arabizi, cu tabel complet, exemple din mesaje și cheat-sheet PDF gratuit." },
  { path: "/invata-araba-gratis", title: "Învață Arabă Libaneză Gratis: PDF-uri și Lecții", description: "Învață arabă libaneză gratuit cu PDF-uri, 100 de expresii utile, un plan de 30 de zile și o mini-lecție de pronunție pentru începători." },
  { path: "/resurse", title: "Resurse Gratuite Arabă Libaneză | PDF-uri de Descărcat", description: "Descarcă gratuit fișe Arabizi, 100 de expresii libaneze și un plan de 30 de zile. Primești PDF-urile pe email, fără costuri ascunse." },
  { path: "/fara-alfabet-arab", title: "Pot Învăța Araba Fără Alfabet? Ghid Practic", description: "Învață araba libaneză fără alfabet: vorbești din prima lecție cu arabizi. Vezi ce înveți în 4 săptămâni și când merită alfabetul." },
  { path: "/dialecte-arabe", title: "Dialecte Arabe: Levantin, Egiptean, Golf și Maghreb", description: "Ghid clar al dialectelor arabe: levantin, egiptean, din Golf, maghrebin și irakian. Vezi cine pe cine înțelege și ce dialect merită învățat." },
  { path: "/ce-araba-sa-inveti", title: "Ce Arabă Să Înveți în 2026: Libaneză, Standard sau Egipteană", description: "Compară araba libaneză, standard și egipteană. Vezi ce se vorbește în familie, la muncă sau în călătorii și alege varianta potrivită în 5 minute." },
  { path: "/araba-pentru-partener", title: "Arabă Libaneză pentru Partener și Familie | Curs 1:1", description: "Învață expresii libaneze pentru partener și familie, de la alintări la urări la masă. Curs 1:1 cu profesor nativ, online sau în București." },
  { path: "/araba-in-familie", title: "Arabă Libaneză în Familie — Copii Bilingvi și Părinți | Ghid", description: "Cum crești un copil bilingv româno-libanez: rutine zilnice, expresii de acasă și cursuri pentru copii și părinți, în București sau online." },
  { path: "/cel-mai-bun-curs-de-araba", title: "Cel mai bun curs de arabă în 2026 | Ghid de alegere", description: "Compară cursurile de arabă: libaneză sau standard, grup, privat, online ori aplicații. Vezi prețuri, criterii și greșeli de evitat înainte să alegi." },
  { path: "/cursuri-araba-adolescenti", title: "Arabă Libaneză pentru Adolescenți | Curs 11–17 ani", description: "Adolescenții de 11–17 ani învață arabă libaneză prin conversație, muzică și social media, online sau în București. Lecție de probă gratuită." },
  { path: "/blog", title: "Blog — ghiduri și articole despre araba libaneză", description: "Articole despre învățarea arabei libaneze: alfabet, expresii uzuale, cultură, cât durează să înveți și cum alegi un profesor de arabă." },
  { path: "/en/learn-lebanese-arabic", title: "Learn Lebanese Arabic Online | Native Teacher & Free Trial", description: "Learn Lebanese (Levantine) Arabic online with a native teacher. Live 1-on-1 and small-group lessons from A1 to C2. Speak from lesson one—book a free trial." },
  { path: "/en/learn-levantine-arabic", title: "Learn Levantine Arabic Online | Native Lebanese Teacher", description: "Learn Levantine Arabic online with native Lebanese teacher Ibra. Join live private or small-group lessons and start speaking from lesson one.", lang: "en", canonical: "/en/learn-lebanese-arabic", noindex: true },
  { path: "/en/arabic-tutor", title: "Arabic Tutor Online — 1-on-1 Lessons | Native Teacher", description: "Private Lebanese Arabic (Levantine) tutor — 1-on-1 lessons with a native teacher, 5+ years experience. CEFR A1–C2, flexible hours, free trial. 150 LEI / 60 min." },
  { path: "/en/arabic-dialects-guide", title: "Arabic Dialects & Map: Levantine, Egyptian, Gulf & More", description: "Explore Arabic dialects with a clear map of Levantine, Egyptian, Gulf, Maghrebi and Iraqi Arabic, plus MSA, explained by a native Lebanese teacher." },
  { path: "/en/levantine-arabic-dialects-map", title: "Arabic Dialects & Map: Levantine, Egyptian, Gulf & More", description: "Explore Arabic dialects with a clear map of Levantine, Egyptian, Gulf, Maghrebi and Iraqi Arabic, plus MSA, explained by a native Lebanese teacher.", lang: "en", canonical: "/en/arabic-dialects-guide", noindex: true },
  { path: "/en/arabic-classes-near-me", title: "Arabic Classes Near Me — Bucharest & Online | Native Teacher", description: "Arabic classes in Bucharest or live online with a native Lebanese teacher. Small groups, CEFR A1–C2, practical conversation, free trial. From €100/month." },
  { path: "/en/lebanese-arabic-vs-msa-vs-egyptian", title: "Lebanese vs MSA vs Egyptian Arabic — Full Comparison (2026)", description: "Compare Lebanese Arabic, MSA/Fusha, and Egyptian Arabic by pronunciation, grammar, reach, and learning goals. A practical guide from a native teacher." },
  { path: "/en/how-to-learn-lebanese-arabic", title: "How to Learn Lebanese Arabic — Step-by-Step Guide (2026)", description: "Learn Lebanese Arabic step by step in 2026 with a weekly routine, level-by-level timeline, and practical guidance from native Lebanese teacher Ibra." },
  { path: "/en/best-arabic-course", title: "Best Arabic Course 2026 — How to Choose | Lebanese vs MSA", description: "Compare Lebanese Arabic, MSA, group, private and online courses. See prices, common mistakes and choose the best Arabic course for your goals." },
  { path: "/en/arabic-for-teenagers", title: "Lebanese Arabic Classes for Teenagers | Bucharest & Online", description: "Lebanese Arabic classes for ages 11–17 with a native teacher, online or in Bucharest. Build real conversation skills from the first lesson. Free trial." },
  { path: "/de/arabisch-lernen", lang: "de", title: "Arabisch lernen online — Libanesisch mit Muttersprachler", description: "Arabisch lernen online — libanesischer Dialekt mit Muttersprachler. Sprich ab Lektion eins. Einzel- & Gruppenkurse, A1–C2. Kostenlose Probestunde." },
  // Retired alias, like the four below it. It was the only one without
  // noindex, which also made it the only indexable page missing from the
  // sitemap — an inconsistency, not a decision.
  { path: "/cursuri/privat", title: "Lecții Private de Arabă Libaneză 1:1 — București & online", description: "Lecții 1:1 de arabă libaneză cu profesor nativ. Program flexibil, curriculum adaptat ție, fizic în București sau online. 150 LEI / lecție.", canonical: "/cursuri/private", noindex: true },
  { path: "/trial", title: "Lecție gratuită de arabă libaneză | Ibra", description: "Rezervă o lecție de probă gratuită de arabă libaneză cu profesor nativ — online sau fizic în București. Fără nicio obligație." },
  { path: "/booking", title: "Rezervă o lecție — Arabă Libaneză cu Ibra", description: "Rezervă o lecție de probă gratuită sau înscrie-te la un curs de arabă libaneză — online sau în București." },
  { path: "/quiz", title: "Test de nivel gratuit — Arabă Libaneză cu Ibra", description: "Află în 2 minute ce nivel de arabă libaneză ai (A1–C2) și ce curs ți se potrivește. Test gratuit, fără înregistrare." },
  { path: "/privacy", title: "Politica de confidențialitate — Arabă Libaneză cu Ibra", description: "Cum colectăm, folosim și protejăm datele tale personale, conform GDPR." },
  // Both of these are app routes that had no prerendered page. Anything not
  // prerendered falls back to the SPA shell, which is the homepage's HTML —
  // so a crawler asking for them got the homepage's <head>, canonical and
  // body under a different URL. /stergere-date is the worse of the two: it is
  // linked from the footer of all 62 pages, so it was guaranteed to be
  // crawled. Neither is an SEO target, hence noindex.
  { path: "/stergere-date", title: "Ștergerea datelor (GDPR) — Arabă Libaneză cu Ibra", description: "Cere ștergerea datelor tale personale din evidențele centrului, conform GDPR.", noindex: true },
  { path: "/cursuri/online", title: "Cursuri de Arabă Libaneză Online — Arabă Libaneză cu Ibra", description: "Pagina s-a mutat. Vezi toate cursurile de arabă libaneză, online și fizic în București.", canonical: "/cursuri", noindex: true },
  { path: "/terms", title: "Termeni și condiții — Arabă Libaneză cu Ibra", description: "Termenii și condițiile de utilizare a serviciilor Centrului de Arabă Libaneză cu Ibra." },
];

/**
 * Retired URLs (/cursuri/privat, /cursuri-limba-araba,
 * /en/learn-levantine-arabic, /en/levantine-arabic-dialects-map) stay listed
 * with a canonical pointing at the target: the route redirects visitors
 * client-side, and the canonical gives crawlers the consolidation signal a
 * client-side redirect cannot. They are deliberately absent from the sitemap;
 * /cursuri-limba-araba is also noindex because the audit found it indexable.
 *
 * The six CEFR level pages derive their head from the same curriculum data the
 * page component uses, so they can't drift. A1 keeps its keyword-optimised
 * title (highest-intent Romanian entry point).
 */
function levelRoutes(): Route[] {
  const ro = getCurriculum("ro");
  return (["a1", "a2", "b1", "b2", "c1", "c2"] as const)
    .map((id) => {
      const lvl = ro.find((l) => l.id === id);
      if (!lvl) return null;
      return id === "a1"
        ? {
            path: "/cursuri/grup/a1",
            title: LEVEL_TITLE_RO.a1,
            description:
              "Învață araba libaneză la nivel A1, în București sau online. Vorbești din primele lecții cu profesor nativ. Înscrie-te la o lecție de probă gratuită.",
          }
        : {
            path: `/cursuri/grup/${id}`,
            // Shared with CursGrupLevel.tsx so the static head and the head
            // React renders cannot disagree.
            title: LEVEL_TITLE_RO[id],
            description: lvl.objective.slice(0, 155),
          };
    })
    .filter((r): r is Route => r !== null);
}

export function allRoutes(): Route[] {
  // Blog articles: RO title/description straight from the shared registry.
  const blog: Route[] = BLOG_POSTS.map((p) => ({
    path: `/blog/${p.slug}`,
    title: p.title.ro,
    description: p.description.ro,
    type: "article" as const,
    published: p.published,
  }));
  return [...STATIC_ROUTES, ...levelRoutes(), ...blog]
    .map((route) =>
      route.path === "/cursuri/grup/b2"
        ? { ...route, title: "Curs B2 de Arabă Libaneză — Grup, București & Online" }
        : route,
    )
    // Everything under /en/ is English whether or not the entry says so — only
    // two of the ten did. Deriving it here means the body prerender picks the
    // right UI language too, instead of wrapping English copy in Romanian
    // navigation.
    .map((route) =>
      route.lang ? route : { ...route, lang: route.path.startsWith("/en/") ? "en" : "ro" },
    );
}

/**
 * SEO props read straight from the landing-page sources at build time.
 *
 * Parsing is deliberately literal — a plain `prop="..."` attribute — and any
 * page it cannot parse is skipped rather than guessed at. This is what lets the
 * guards below compare what a visitor renders against what we prerender without
 * importing React components into a Node build script.
 */
interface Annotation {
  file: string;
  /** Root-relative route this page serves. */
  routePath: string;
  metaTitle?: string;
  description?: string;
  /** `enHref` on RO pages, `roHref` on EN ones: undefined if absent, null if `{null}`. */
  twin?: string | null;
  /** True when the page canonicalises elsewhere, so it must not head a language cluster. */
  canonicalOverride: boolean;
}

const STR = `"((?:[^"\\\\]|\\\\.)*)"`;

/**
 * Values a prop can take, in branch order.
 *
 * A page may serve more than one route and pick its props with a ternary — the
 * courses hub does this to give the legacy /cursuri-limba-araba URL its own
 * metadata. Reading only the first literal would silently drop the second
 * route, which is how a real hreflang pair went missing: the parser stopped
 * recognising the page at all and reported it as "not a landing page".
 *
 * `null` is kept as a value rather than dropped, so `x ? null : "/en/..."`
 * lines up branch-for-branch with the slugs.
 */
const attrAll = (src: string, name: string): (string | null)[] => {
  const ternary = src.match(
    new RegExp(`${name}=\\{[^?{}]*\\?\\s*(?:${STR}|null)\\s*:\\s*(?:${STR}|null)\\s*\\}`),
  );
  if (ternary) return [ternary[1] ?? null, ternary[2] ?? null];
  const literal = src.match(new RegExp(`${name}=${STR}`));
  if (literal) return [literal[1]];
  if (src.includes(`${name}={null}`)) return [null];
  return [];
};

const attr = (src: string, name: string): string | undefined =>
  attrAll(src, name)[0] ?? undefined;

function landingAnnotations(): Annotation[] {
  const out: Annotation[] = [];
  for (const [dir, prefix, twinProp] of [
    ["src/pages/seo", "/", "enHref"],
    ["src/pages/en", "/en/", "roHref"],
  ] as const) {
    const abs = path.resolve(dir);
    if (!fs.existsSync(abs)) continue;
    for (const file of fs.readdirSync(abs).filter((f) => f.endsWith(".tsx"))) {
      const src = fs.readFileSync(path.join(abs, file), "utf8");
      const slugs = attrAll(src, "slug");
      if (!slugs.length) continue; // the shared layout itself has no slug
      const titles = attrAll(src, "metaTitle");
      const descriptions = attrAll(src, "description");
      const twins = attrAll(src, twinProp);
      // One entry per route the file serves; a prop with a single value applies
      // to every branch, which is the common case.
      const at = (v: (string | null)[], i: number) => (v.length > 1 ? v[i] : v[0]);
      slugs.forEach((slug, i) => {
        if (!slug) return;
        out.push({
          file,
          routePath: prefix + slug,
          metaTitle: at(titles, i) ?? undefined,
          description: at(descriptions, i) ?? undefined,
          twin: twins.length ? at(twins, i) : undefined,
          canonicalOverride: /canonicalHref="/.test(src),
        });
      });
    }
  }
  return out;
}

/**
 * RO <-> EN pairs where *both* pages name each other. hreflang must be 1:1 and
 * reciprocal: a one-way or many-to-one annotation is ignored by search engines
 * and can invalidate the whole cluster, so only mutual pairs are emitted. The
 * looser nearest-relative mapping used by the in-page language toggle lives in
 * src/lib/languageRoutes.ts and deliberately does not feed this.
 */
function hreflangPairs(): Map<string, { ro: string; en: string }> {
  const byPath = new Map(landingAnnotations().map((a) => [a.routePath, a]));
  const pairs = new Map<string, { ro: string; en: string }>();
  for (const a of byPath.values()) {
    if (a.routePath.startsWith("/en/") || !a.twin || a.canonicalOverride) continue;
    const twin = byPath.get(a.twin);
    if (!twin || twin.twin !== a.routePath || twin.canonicalOverride) continue;
    const pair = { ro: a.routePath, en: twin.routePath };
    pairs.set(pair.ro, pair);
    pairs.set(pair.en, pair);
  }
  return pairs;
}


/**
 * Last commit date for a file, as YYYY-MM-DD. Null when git is unavailable —
 * a build from a tarball or a clone without history has to fall back.
 */
const gitDateCache = new Map<string, string | null>();

function gitDate(file: string): string | null {
  if (gitDateCache.has(file)) return gitDateCache.get(file)!;
  let out: string | null = null;
  try {
    const r = execFileSync("git", ["log", "-1", "--format=%cs", "--", file], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(r)) out = r;
  } catch {
    out = null;
  }
  gitDateCache.set(file, out);
  return out;
}

/**
 * Files whose content ends up on every page: the prerender itself, the router,
 * and the dictionary that holds most of the copy. When one of them changes,
 * every page's served HTML really does change, so they set a floor under every
 * lastmod rather than each page claiming an older date than is true.
 */
const SITE_WIDE_SOURCES = [
  "scripts/prerenderBody.tsx",
  "scripts/seoPrerender.ts",
  "src/App.tsx",
  "src/lib/i18n.tsx",
];

/** Maps each static route to the page component that renders it, via App.tsx. */
function routeSourceFiles(): Map<string, string> {
  const map = new Map<string, string>();
  let src = "";
  try {
    src = fs.readFileSync(path.resolve("src/App.tsx"), "utf8");
  } catch {
    return map;
  }
  const byName = new Map<string, string>();
  for (const m of src.matchAll(/(?:const\s+(\w+)\s*=\s*lazyWithRetry\(\(\)\s*=>\s*import|import\s+(\w+)\s+from)\s*\(?["']\.\/([^"']+)["']/g)) {
    const name = m[1] ?? m[2];
    if (name) byName.set(name, `src/${m[3]}.tsx`);
  }
  for (const m of src.matchAll(/<Route\s+path="([^"]+)"\s+element=\{<(\w+)/g)) {
    const file = byName.get(m[2]);
    if (file && fs.existsSync(path.resolve(file))) map.set(m[1], file);
  }
  return map;
}

/**
 * Writes sitemap.xml into the build with a real <lastmod> per URL.
 *
 * The checked-in public/sitemap.xml carries only <changefreq> and <priority>,
 * both of which Google ignores, which left the file with no freshness signal at
 * all. lastmod is the one field Google does read, and it matters here: 17 URLs
 * sat in "Discovered - currently not indexed" having never been fetched once.
 *
 * Dates are derived, not invented: an article uses its publication date, every
 * other page the last commit that touched its component, and all of them are
 * floored by the last change to the shared sources above.
 */
function writeSitemap(root: string, routes: Route[]): number {
  const files = routeSourceFiles();
  const floor = SITE_WIDE_SOURCES.map(gitDate).filter(Boolean).sort().pop() ?? null;
  const today = new Date().toISOString().slice(0, 10);

  const entries = routes
    .filter((r) => !r.noindex && !r.canonical)
    .map((r) => {
      const own = r.published?.slice(0, 10) ?? (files.has(r.path) ? gitDate(files.get(r.path)!) : null);
      const lastmod = [own, floor].filter(Boolean).sort().pop() ?? today;
      return `  <url>\n    <loc>${BASE}${r.path === "/" ? "/" : r.path}</loc>\n    <lastmod>${lastmod}</lastmod>\n  </url>`;
    });

  const xml =
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    "<!-- Generated at build time from the route registry in scripts/seoPrerender.ts.\n" +
    "     Do not edit: public/sitemap.xml is the checked-in reference, this is what\n" +
    "     ships. changefreq and priority are omitted on purpose - Google ignores\n" +
    "     both. -->\n" +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    entries.join("\n") +
    "\n</urlset>\n";

  fs.writeFileSync(path.join(root, "sitemap.xml"), xml);
  return entries.length;
}

const escAttr = (s: string): string =>
  s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/**
 * Replace the content="" of a specific <meta> tag if present, and hand the tag
 * over to react-helmet-async by stamping it with the attribute Helmet uses to
 * mark tags it owns.
 *
 * Without the stamp, Helmet does not know the prerendered tag exists and simply
 * appends its own on mount — so the rendered page carried two <meta
 * name="description"> with different text, two og:url, two canonicals. A crawl
 * that executes JavaScript sees both and has to guess. With the stamp Helmet
 * replaces the tag instead of duplicating it.
 */
const RH = 'data-rh="true"';

function setMeta(html: string, attr: "property" | "name", key: string, value: string): string {
  const re = new RegExp(`<meta ${attr}="${key}" content="[^"]*"`);
  return html.replace(re, `<meta ${RH} ${attr}="${key}" content="${value}"`);
}

/** Same stamp, for tags the shell ships that Helmet also re-renders per route. */
function ownByHelmet(html: string, selectors: string[]): string {
  let out = html;
  for (const sel of selectors) {
    out = out.replace(new RegExp(`<meta ${sel}`), `<meta ${RH} ${sel}`);
  }
  return out;
}

function renderRoute(
  template: string,
  route: Route,
  pairs: Map<string, { ro: string; en: string }>,
): string {
  const url = BASE + (route.path === "/" ? "/" : route.path);
  const lang = route.lang ?? (route.path.startsWith("/en/") ? "en" : "ro");
  const ogLocale = lang === "en" ? "en_US" : lang === "de" ? "de_DE" : "ro_RO";
  const title = escAttr(route.title);
  const desc = escAttr(route.description);
  // Canonical (and og:url) point at the consolidation target when set.
  const canonicalHref = escAttr(route.canonical ? BASE + route.canonical : url);

  let html = template;
  html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${title}</title>`);
  html = setMeta(html, "name", "description", desc);
  html = setMeta(html, "property", "og:type", route.type ?? "website");
  html = setMeta(html, "property", "og:title", title);
  html = setMeta(html, "property", "og:description", desc);
  html = setMeta(html, "property", "og:url", canonicalHref);
  html = setMeta(html, "name", "twitter:title", title);
  html = setMeta(html, "name", "twitter:description", desc);
  // These three keep the shell's values but must still be owned by Helmet, or
  // they duplicate exactly like the ones above did.
  html = ownByHelmet(html, [
    'property="og:image"',
    'name="twitter:card"',
    'name="twitter:image"',
  ]);

  // The shell ships no canonical — inject it plus a per-route og:locale (and,
  // for blog posts, the Article JSON-LD + article:* tags) before </head>, so
  // non-JS crawlers see the same head React would render at runtime.
  let inject =
    (route.noindex ? `    <meta ${RH} name="robots" content="noindex,follow" />\n` : "") +
    `    <link ${RH} rel="canonical" href="${canonicalHref}" />\n` +
    `    <meta ${RH} property="og:locale" content="${ogLocale}" />\n`;
  // hreflang for reciprocal RO/EN twins only, matching what the layouts render
  // at runtime tag for tag. Romanian is x-default: it is the site's primary
  // language, and the RO page is the right landing spot for unmatched locales.
  const pair = pairs.get(route.path);
  if (pair && !route.canonical) {
    inject +=
      `    <link ${RH} rel="alternate" hreflang="ro" href="${escAttr(BASE + pair.ro)}" />\n` +
      `    <link ${RH} rel="alternate" hreflang="en" href="${escAttr(BASE + pair.en)}" />\n`;
    // One group also has a German member. Emitting it here keeps the static
    // head identical to what the layouts render, which is what the reciprocity
    // guard below compares.
    if (isLearnClusterPath(route.path)) {
      inject += `    <link ${RH} rel="alternate" hreflang="de" href="${escAttr(BASE + LEARN_CLUSTER.de)}" />\n`;
    }
    inject += `    <link ${RH} rel="alternate" hreflang="x-default" href="${escAttr(BASE + pair.ro)}" />\n`;
  } else if (isLearnClusterPath(route.path) && !route.canonical) {
    // The German page is not part of an RO/EN annotation pair, so it never
    // reaches the branch above — but it is a full member of the cluster.
    inject +=
      `    <link ${RH} rel="alternate" hreflang="ro" href="${escAttr(BASE + LEARN_CLUSTER.ro)}" />\n` +
      `    <link ${RH} rel="alternate" hreflang="en" href="${escAttr(BASE + LEARN_CLUSTER.en)}" />\n` +
      `    <link ${RH} rel="alternate" hreflang="de" href="${escAttr(BASE + LEARN_CLUSTER.de)}" />\n` +
      `    <link ${RH} rel="alternate" hreflang="x-default" href="${escAttr(BASE + LEARN_X_DEFAULT)}" />\n`;
  }
  if (route.type === "article") {
    const articleJsonLd = {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: route.title,
      description: route.description,
      datePublished: route.published,
      dateModified: route.published,
      inLanguage: lang,
      mainEntityOfPage: route.canonical ? BASE + route.canonical : url,
      image: `${BASE}/og-image.png`,
      author: { "@type": "Person", name: "Ibra — Centrul de Arabă Libaneză" },
      publisher: {
        "@type": "Organization",
        name: "Centrul de Arabă Libaneză cu Ibra",
        url: `${BASE}/`,
        logo: { "@type": "ImageObject", url: `${BASE}/favicon.png` },
      },
    };
    inject +=
      (route.published
        ? `    <meta ${RH} property="article:published_time" content="${escAttr(route.published)}" />\n`
        : "") +
      `    <meta ${RH} property="article:author" content="Ibra — Centrul de Arabă Libaneză" />\n` +
      `    <script type="application/ld+json">${JSON.stringify(articleJsonLd).replace(/</g, "\\u003c")}</script>\n`;
  }
  html = html.replace(/<\/head>/, `${inject}  </head>`);
  return html;
}

/**
 * Reads the published page overrides from the database at build time. Fails
 * soft: on any error the code-shipped meta is used.
 */
async function fetchCmsMeta(): Promise<Record<string, { meta_title: string; meta_description: string }>> {
  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return {};
  try {
    const res = await fetch(
      `${url}/rest/v1/page_contents?select=path,meta_title,meta_description&is_published=eq.true`,
      { headers: { apikey: key, Authorization: `Bearer ${key}` } },
    );
    if (!res.ok) return {};
    const rows = (await res.json()) as { path: string; meta_title: string; meta_description: string }[];
    const map: Record<string, { meta_title: string; meta_description: string }> = {};
    for (const r of rows) map[r.path] = r;
    return map;
  } catch {
    return {};
  }
}

export function seoPrerenderPlugin(): Plugin {
  let outDir = "dist";
  return {
    name: "seo-prerender",
    apply: "build",
    configResolved(config) {
      outDir = config.build.outDir || "dist";
    },
    async closeBundle() {
      // Owner-edited meta (admin -> "Pagini") wins over the values hardcoded
      // here, so the static <head> crawlers see matches what visitors see.
      const cmsMeta = await fetchCmsMeta();
      try {
        const root = path.resolve(outDir);
        const shellPath = path.join(root, "index.html");
        if (!fs.existsSync(shellPath)) {
          this.warn(`[seo-prerender] ${shellPath} not found — skipping.`);
          return;
        }
        const template = fs.readFileSync(shellPath, "utf8");
        const pairs = hreflangPairs();
        let count = 0;
        for (const route of allRoutes()) {
          const cms = cmsMeta[route.path];
          const merged = cms
            ? {
                ...route,
                title: cms.meta_title?.trim() || route.title,
                description: cms.meta_description?.trim() || route.description,
              }
            : route;
          const html = renderRoute(template, merged, pairs);
          const outFile =
            route.path === "/"
              ? shellPath
              : path.join(root, route.path.replace(/^\//, ""), "index.html");
          fs.mkdirSync(path.dirname(outFile), { recursive: true });
          fs.writeFileSync(outFile, html);
          count++;
        }
        const sitemapCount = writeSitemap(root, allRoutes());
        // eslint-disable-next-line no-console
        console.log(
          `[seo-prerender] wrote static <head> for ${count} routes ` +
            `(${pairs.size / 2} reciprocal RO/EN hreflang pairs), ` +
            `sitemap.xml with ${sitemapCount} URLs and real lastmod dates.`,
        );

        // Drift guard: any URL in the sitemap that we don't prerender ships the
        // bare SPA shell to crawlers. That silently happened when new pages were
        // added to the sitemap but not here, so surface it loudly at build time.
        try {
          const sitemap = fs.readFileSync(path.resolve("public/sitemap.xml"), "utf8");
          const known = new Set(allRoutes().map((r) => r.path));
          const missing = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)]
            .map((m) => m[1].replace(BASE, "").replace(/\/$/, "") || "/")
            .filter((p) => !known.has(p));
          if (missing.length) {
            this.warn(
              `[seo-prerender] ${missing.length} sitemap URL(s) are NOT prerendered and will ` +
                `serve the empty SPA shell to crawlers — add them to STATIC_ROUTES: ${missing.join(", ")}`,
            );
          }
        } catch {
          /* sitemap missing is not fatal */
        }

        // Second drift guard: the titles and descriptions in STATIC_ROUTES are
        // hand-copied from each page's own SEO props, so editing a page without
        // editing this file makes a crawler and a visitor see different things
        // for the same URL — exactly what this plugin exists to prevent. Re-read
        // the pages and compare, and check the hreflang annotations while we are
        // in there, since a one-way annotation silently emits no hreflang at all.
        try {
          const problems: string[] = [];

          // Shell-fallback guard. A route that is not prerendered falls back to
          // the SPA shell, which is the homepage's HTML — so the URL answers
          // 200 with the homepage's head, canonical and body. /stergere-date
          // reached production that way while being linked from every footer.
          // A route is allowed to skip prerendering only if robots.txt keeps
          // crawlers off it.
          {
            const appSrc = fs.readFileSync(path.join(root, "src/App.tsx"), "utf8");
            const robots = fs.readFileSync(path.join(root, "public/robots.txt"), "utf8");
            const disallowed = robots
              .split("\n")
              .filter((l) => l.trim().toLowerCase().startsWith("disallow:"))
              .map((l) => l.split(":")[1].trim())
              .filter(Boolean);
            const known = new Set(allRoutes().map((r) => r.path));
            for (const m of appSrc.matchAll(/<Route\s+path="([^"]+)"/g)) {
              const routePath = m[1];
              if (routePath.includes(":") || routePath === "*") continue;
              if (known.has(routePath)) continue;
              if (disallowed.some((d) => routePath === d || routePath.startsWith(d))) continue;
              problems.push(
                `${routePath}: routed in App.tsx but not prerendered and not disallowed in robots.txt — ` +
                  "it will serve the homepage shell to crawlers",
              );
            }
          }

          // Duplicate guard. Two indexable URLs sharing a title or a
          // description are two crawl destinations competing for the same
          // query. Retired aliases are exempt: they are noindex and carry a
          // canonical to their replacement, so sharing its metadata is the
          // point.
          {
            const live = allRoutes().filter((r) => !r.noindex && !r.canonical);
            for (const field of ["title", "description"] as const) {
              const seen = new Map<string, string>();
              for (const r of live) {
                const prev = seen.get(r[field]);
                if (prev) {
                  problems.push(
                    `duplicate ${field}: ${prev} and ${r.path} both use "${r[field].slice(0, 60)}…"`,
                  );
                }
                seen.set(r[field], r.path);
              }
            }
          }

          // Length guard. Google truncates past roughly these limits, and the
          // registry being within them is not enough on its own — the head a
          // crawler reads is whatever the page renders, and a 76-character C2
          // title reached production that way.
          const TITLE_MAX = 60;
          const DESC_MAX = 160;
          for (const route of allRoutes()) {
            if (route.title.length > TITLE_MAX) {
              problems.push(
                `${route.path}: <title> is ${route.title.length} chars, over ${TITLE_MAX} — "${route.title}"`,
              );
            }
            if (route.description.length > DESC_MAX) {
              problems.push(
                `${route.path}: description is ${route.description.length} chars, over ${DESC_MAX}`,
              );
            }
          }
          const routes = allRoutes();
          const annotations = landingAnnotations();

          const compare = (routePath: string, file: string, title?: string, desc?: string) => {
            const route = routes.find((r) => r.path === routePath);
            if (!route) {
              problems.push(`${routePath} (${file}): page exists but is not prerendered — add it to STATIC_ROUTES`);
              return;
            }
            if (title && route.title !== title) {
              problems.push(`${routePath} (${file}): <title> — prerender "${route.title}" vs page "${title}"`);
            }
            if (desc && route.description !== desc) {
              problems.push(`${routePath} (${file}): description — prerender "${route.description}" vs page "${desc}"`);
            }
          };

          for (const a of annotations) compare(a.routePath, a.file, a.metaTitle, a.description);

          // The /cursuri/* funnel pages build their head from i18n keys instead
          // of literal props, so resolve the key against the Romanian dictionary
          // (the first of the two in i18n.tsx) before comparing.
          try {
            const i18n = fs.readFileSync(path.resolve("src/lib/i18n.tsx"), "utf8");
            const ro = (key: string): string | undefined =>
              i18n.match(new RegExp(`\\b${key}: "((?:[^"\\\\]|\\\\.)*)"`))?.[1];
            const dir = path.resolve("src/pages/courses");
            for (const file of fs.readdirSync(dir).filter((f) => f.endsWith(".tsx"))) {
              const src = fs.readFileSync(path.join(dir, file), "utf8");
              const routePath = src.match(/path="(\/cursuri[^"]*)"/)?.[1];
              if (!routePath) continue;
              const titleKey = src.match(/metaTitle=\{t\.(\w+)\}/)?.[1];
              const descKey = src.match(/metaDescription=\{t\.(\w+)\}/)?.[1];
              compare(routePath, file, titleKey && ro(titleKey), descKey && ro(descKey));
            }
          } catch {
            /* i18n-backed pages are best-effort */
          }

          // Blog posts carry their head twice: BLOG_POSTS feeds the index and
          // the prerender, while the article component passes its own title and
          // description to BlogArticleLayout. Nothing kept the two in step, and
          // they had drifted on eight posts — the crawler read one title and the
          // visitor another. Compare them here so it cannot happen quietly again.
          try {
            const dir = path.resolve("src/pages/blog");
            const bySlug = new Map(BLOG_POSTS.map((b) => [b.slug, b]));
            for (const file of fs.readdirSync(dir).filter((f) => f.endsWith(".tsx"))) {
              const src = fs.readFileSync(path.join(dir, file), "utf8");
              const slug = attr(src, "slug");
              const post = slug ? bySlug.get(slug) : undefined;
              if (!post) continue;
              const roOf = (prop: string) =>
                src.match(new RegExp(`${prop}=\\{\\{\\s*ro:\\s*${STR}`))?.[1];
              const title = roOf("title");
              const description = roOf("description");
              if (title && title !== post.title.ro) {
                problems.push(
                  `/blog/${slug} (${file}): <title> — registry "${post.title.ro}" vs page "${title}"`,
                );
              }
              if (description && description !== post.description.ro) {
                problems.push(
                  `/blog/${slug} (${file}): description — registry "${post.description.ro}" vs page "${description}"`,
                );
              }
            }
          } catch {
            /* blog comparison is best-effort */
          }

          // hreflang reciprocity: every declared twin must name this page back,
          // and no two pages may claim the same twin.
          const byPath = new Map(annotations.map((a) => [a.routePath, a]));
          const claimed = new Map<string, string>();
          for (const a of annotations) {
            if (!a.twin) continue;
            const prev = claimed.get(a.twin);
            if (prev) problems.push(`hreflang: ${a.twin} is claimed by both ${prev} and ${a.routePath} — it must be 1:1`);
            else claimed.set(a.twin, a.routePath);

            const twin = byPath.get(a.twin);
            if (!twin) {
              problems.push(`hreflang: ${a.routePath} points at ${a.twin}, which is not a landing page — no hreflang will be emitted`);
            } else if (twin.twin !== a.routePath) {
              problems.push(
                `hreflang: ${a.routePath} -> ${a.twin}, but ${a.twin} -> ${twin.twin ?? "(none)"} — ` +
                  `the pair is not reciprocal, so neither page gets hreflang`,
              );
            }
          }

          if (problems.length) {
            this.warn(
              `[seo-prerender] ${problems.length} SEO drift / hreflang problem(s):\n  ${problems.join("\n  ")}`,
            );
          }
        } catch {
          /* guard must never fail the build */
        }
      } catch (err) {
        this.warn(`[seo-prerender] skipped (${(err as Error).message}). SPA shell left intact.`);
      }
    },
  };
}
