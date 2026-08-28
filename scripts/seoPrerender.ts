import fs from "node:fs";
import path from "node:path";
import type { Plugin } from "vite";
import { BLOG_POSTS } from "../src/lib/blogPosts";
import { getCurriculum } from "../src/data/curriculum";

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
  { path: "/cursuri", title: "Cursuri Arabă (Libaneză) — Adulți, Tineri, Copii | București & Online", description: "Cursuri de arabă (dialect libanez) pentru toate vârstele: adulți (18+), tineri (11–17) și copii (6–10). Grup sau 1:1, online sau fizic în București. Profesor nativ." },
  { path: "/cursuri/grup", title: "Curs de Grup de Arabă Libaneză (A1–C2) — București & online", description: "Curs de grup de arabă libaneză cu profesor nativ. Niveluri A1–C2, grupuri de 4–10 cursanți, fizic în București sau online. De la 500 LEI / lună." },
  { path: "/cursuri/private", title: "Lecții Private de Arabă Libaneză 1:1 — București & online", description: "Lecții 1:1 de arabă libaneză cu profesor nativ. Program flexibil, curriculum adaptat ție, fizic în București sau online. 150 LEI / lecție." },
  { path: "/cursuri/copii", title: "Cursuri de Arabă Libaneză pentru Copii — București", description: "Cursuri interactive de arabă libaneză pentru copii (6–10 ani), fizic în București. Activități, jocuri și povești în arabă libaneză. Online disponibil de la 10 ani." },
  { path: "/cursuri/adulti", title: "Cursuri Arabă Libaneză — Adulți (18+)", description: "Cursuri de arabă libaneză pentru adulți: grup A1–C2 sau lecții 1:1, online sau fizic în București." },
  { path: "/cursuri/tineri", title: "Curs de Arabă pentru Adolescenți | Pagina Actualizată", description: "Pagina cursului pentru adolescenți s-a mutat. Vezi programul actual, opțiunile din București și online și rezervă o lecție de probă.", canonical: "/cursuri-araba-adolescenti", noindex: true },
  { path: "/cursuri-araba", title: "Cursuri Arabă Libaneză A1–C2 | București și Online", description: "Cursuri de arabă libaneză A1–C2 în București și online: grupe, lecții private 1:1 și cursuri pentru copii, toate cu profesor nativ. Probă gratuită." },
  { path: "/cursuri-limba-araba", title: "Cursuri de Arabă Libaneză | București și Online", description: "Alege cursul potrivit: grupă A1–C2, lecții private sau cursuri pentru copii, în București și online, cu profesor nativ libanez.", canonical: "/cursuri-araba", noindex: true },
  { path: "/araba-pentru-incepatori", title: "Arabă Libaneză pentru Începători — Cursuri de la Zero | Vorbești din Prima Lecție", description: "Învață arabă libaneză de la zero cu profesor nativ: metoda Oral First, fără blocajul alfabetului, grupe A1 pentru începători — fizic în București sau online. Probă gratuită." },
  { path: "/araba-online", title: "Arabă Libaneză Online — Cursuri Live pe Zoom cu Profesor Nativ | De Oriunde", description: "Cursuri de arabă libaneză online: lecții live pe Zoom cu profesor nativ, grupe A1–C2 și lecții private 1:1, de oriunde. Grupa A1 online e completă — înscrie-te la lista pentru următoarea. Probă gratuită." },
  { path: "/meditatii-araba", title: "Meditații Arabă în București și Online | Profesor Nativ", description: "Meditații de arabă libaneză (dialect levantin) 1:1 cu profesor nativ libanez, în București sau online. 150 lei/lecție de 60 min, pachete −20%, prima lecție de probă gratuită." },
  { path: "/invata-araba", title: "Învață Araba Libaneză de la Zero — Metodă, Timp & Cursuri | 2026", description: "Ghid pas cu pas pentru a învăța araba libaneză de la zero: ce dialect alegi, cât durează, ce metodă folosești. Plus cursuri cu profesor nativ, online sau fizic." },
  { path: "/cursuri-araba-bucuresti", title: "Cursuri de Arabă în București | Profesor Nativ", description: "Cursuri de arabă libaneză în București cu profesor nativ. Grupe mici pentru adulți și copii, niveluri A1–C2. Lecție de probă gratuită." },
  { path: "/curs-araba-copii", title: "Cursuri Limba Arabă pentru Copii 6–10 ani | București, prin Joc", description: "Cursuri de limba arabă (libaneză / levantină) pentru copii 6–10 ani în București: învățare prin joc, cântece și povești, cu profesor nativ libanez. Grupă mică, sâmbătă dimineața." },
  { path: "/arabizi", title: "Arabizi — Ce Înseamnă 2, 3, 5, 7 în Arabă | Ghid Complet cu Tabel", description: "Ghid complet Arabizi: tabelul cifrelor (2, 3, 5, 6, 7, 8, 9) și literele arabe pe care le înlocuiesc, exemple reale din WhatsApp și TikTok, plus cheat-sheet PDF gratuit." },
  { path: "/invata-araba-gratis", title: "Învață Arabă Libaneză Gratis — Resurse, PDF-uri și Lecții | 2026", description: "Resurse gratuite pentru arabă libaneză: cheat-sheet arabizi, 100 de expresii esențiale în PDF, plan de 30 de zile, canale YouTube și o mini-lecție cu pronunție. Fără costuri." },
  { path: "/resurse", title: "Resurse Gratuite Arabă Libaneză — PDF-uri, Expresii, Plan 30 Zile", description: "Descarcă gratuit materialele noastre pentru arabă libaneză: cheat-sheet arabizi, 100 de expresii esențiale și planul de învățare de 30 de zile. PDF pe email, fără costuri." },
  { path: "/fara-alfabet-arab", title: "Pot Învăța Araba Fără Alfabet? Da — Iată Cum | Metoda Oral First", description: "Poți învăța araba libaneză fără alfabetul arab: vorbești din prima lecție folosind arabizi. Ce e greu de fapt la arabă, ce înveți în 4 săptămâni și când merită alfabetul." },
  { path: "/dialecte-arabe", title: "Dialectele Arabe — Hartă & Ghid: Levantin, Egiptean, Golf, Maghreb | 2026", description: "Ghid și hartă a dialectelor arabe: levantin (nord vs. sud — libanez, sirian, palestinian, iordanian), egiptean, maghrebin, din Golf și irakian, plus araba standard. Cine pe cine înțelege și ce dialect merită învățat." },
  { path: "/ce-araba-sa-inveti", title: "Ce Arabă Să Înveți — Libaneză vs Standard vs Egipteană | Ghid", description: "Compară araba libaneză, araba standard (fusha) și egipteana: ce vorbesc oamenii, ce e mai ușor, ce îți trebuie pentru familie, muncă sau călătorii. Alegi în 5 minute." },
  { path: "/araba-pentru-partener", title: "Arabă Libaneză pentru Partener și Familie | Curs 1:1", description: "Învață expresii libaneze pentru partener și familie, de la alintări la urări la masă. Curs 1:1 cu profesor nativ, online sau în București." },
  { path: "/araba-in-familie", title: "Arabă Libaneză în Familie — Copii Bilingvi și Părinți | Ghid", description: "Cum crești un copil bilingv româno-libanez: rutine zilnice, expresii de acasă și cursuri pentru copii și părinți, în București sau online." },
  { path: "/cel-mai-bun-curs-de-araba", title: "Cel Mai Bun Curs de Arabă: Ghid de Comparație 2026 | Libaneză", description: "Cum alegi cel mai bun curs de limba arabă: dialect libanez (levantin) vs arabă standard, grup vs privat vs online vs aplicații. Comparație de prețuri, criterii și greșeli frecvente." },
  { path: "/cursuri-araba-adolescenti", title: "Cursuri Arabă pentru Adolescenți 11–17 ani | București & Online", description: "Cursuri de arabă libaneză (levantină) pentru adolescenți 11–17 ani, cu profesor nativ: fizic în București sau online. Conversație din prima lecție, fără tocit alfabet. Probă gratuită." },
  { path: "/blog", title: "Blog — articole despre araba libaneză | Arabă Libaneză cu Ibra", description: "Articole despre învățarea arabei libaneze: alfabet, expresii uzuale, cultură, cât durează să înveți și cum alegi un profesor de arabă." },
  { path: "/en/learn-lebanese-arabic", title: "Learn Lebanese & Levantine Arabic Online | Native Teacher, Free Trial", description: "Learn Lebanese Arabic — the Levantine dialect — with a native instructor. One dialect, ~90% comprehension across Lebanon, Syria, Jordan and Palestine. Live 1-on-1 and small-group courses online, A1–C2. Speak from lesson one, free trial." },
  { path: "/en/learn-levantine-arabic", title: "Learn Levantine Arabic Online | Native Lebanese Teacher", description: "Learn Levantine Arabic online with native Lebanese teacher Ibra. Join live private or small-group lessons and start speaking from lesson one.", lang: "en", canonical: "/en/learn-lebanese-arabic", noindex: true },
  { path: "/en/arabic-tutor", title: "Arabic Tutor Online — 1-on-1 Lessons | Native Teacher", description: "Private Lebanese Arabic (Levantine) tutor — 1-on-1 lessons with a native teacher, 5+ years experience. CEFR A1–C2, flexible hours, free trial. 150 LEI / 60 min." },
  { path: "/en/arabic-dialects-guide", title: "Arabic Dialects & Map: Levantine, Egyptian, Gulf & More", description: "Explore Arabic dialects with a clear map of Levantine, Egyptian, Gulf, Maghrebi and Iraqi Arabic, plus MSA, explained by a native Lebanese teacher." },
  { path: "/en/levantine-arabic-dialects-map", title: "Arabic Dialects & Map: Levantine, Egyptian, Gulf & More", description: "Complete guide and map of the Arabic dialects: Levantine (North vs South Shami — Lebanese, Syrian, Jordanian, Palestinian), Egyptian–Sudanese, Maghrebi, Peninsular (Gulf, Saudi, Yemeni), Mesopotamian, plus MSA. Written by a native Lebanese teacher.", lang: "en", canonical: "/en/arabic-dialects-guide" },
  { path: "/en/arabic-classes-near-me", title: "Arabic Classes Near Me — Bucharest & Online | Native Teacher", description: "Arabic classes in Bucharest or live online with a native Lebanese teacher. Small groups, CEFR A1–C2, practical conversation, free trial. From €100/month." },
  { path: "/en/lebanese-arabic-vs-msa-vs-egyptian", title: "Lebanese vs MSA vs Egyptian Arabic — Full Comparison (2026)", description: "Compare Lebanese Arabic, MSA/Fusha, and Egyptian Arabic by pronunciation, grammar, reach, and learning goals. A practical guide from a native teacher." },
  { path: "/en/how-to-learn-lebanese-arabic", title: "How to Learn Lebanese Arabic — Step-by-Step Guide (2026)", description: "Learn Lebanese Arabic step by step in 2026 with a weekly routine, level-by-level timeline, and practical guidance from native Lebanese teacher Ibra." },
  { path: "/en/best-arabic-course", title: "Best Arabic Course 2026 — How to Choose | Lebanese vs MSA", description: "Compare Lebanese Arabic, MSA, group, private and online courses. See prices, common mistakes and choose the best Arabic course for your goals." },
  { path: "/en/arabic-for-teenagers", title: "Arabic Classes for Teenagers (11–17) | Lebanese, Online & Bucharest", description: "Lebanese Arabic (Levantine) classes for teenagers aged 11–17 with a native teacher — in person in Bucharest or online. Conversation from lesson one, no alphabet drills. Free trial." },
  { path: "/de/arabisch-lernen", lang: "de", title: "Arabisch lernen online — libanesisch mit Muttersprachler | A1–C2", description: "Arabisch lernen online — libanesischer Dialekt mit Muttersprachler. Sprich ab Lektion eins, ohne Alphabet-Hürde. Einzel- & Gruppenkurse, A1–C2. Kostenlose Probestunde." },
  { path: "/cursuri/privat", title: "Lecții Private de Arabă Libaneză 1:1 — București & online", description: "Lecții 1:1 de arabă libaneză cu profesor nativ. Program flexibil, curriculum adaptat ție, fizic în București sau online. 150 LEI / lecție.", canonical: "/cursuri/private" },
  { path: "/trial", title: "Lecție de probă gratuită — Arabă Libaneză cu Ibra", description: "Rezervă o lecție de probă gratuită de arabă libaneză cu profesor nativ — online sau fizic în București. Fără nicio obligație." },
  { path: "/booking", title: "Rezervă o lecție — Arabă Libaneză cu Ibra", description: "Rezervă o lecție de probă gratuită sau înscrie-te la un curs de arabă libaneză — online sau în București." },
  { path: "/quiz", title: "Test de nivel gratuit — Arabă Libaneză cu Ibra", description: "Află în 2 minute ce nivel de arabă libaneză ai (A1–C2) și ce curs ți se potrivește. Test gratuit, fără înregistrare." },
  { path: "/privacy", title: "Politica de confidențialitate — Arabă Libaneză cu Ibra", description: "Cum colectăm, folosim și protejăm datele tale personale, conform GDPR." },
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
            title: "Curs Arabă A1 în București și Online | Arabă Libaneză",
            description:
              "Învață araba libaneză la nivel A1, în București sau online. Vorbești din primele lecții cu profesor nativ. Înscrie-te la o lecție de probă gratuită.",
          }
        : {
            path: `/cursuri/grup/${id}`,
            title:
              id === "c1"
                ? "Curs de Arabă Libaneză C1 — Nivel Avansat"
                : id === "c2"
                  ? "Curs C2 de Arabă Libaneză — Academic și Specializat"
                  : `${lvl.title} — Curs de Grup de Arabă Libaneză`,
            description: lvl.objective.slice(0, 155),
          };
    })
    .filter((r): r is Route => r !== null);
}

function allRoutes(): Route[] {
  // Blog articles: RO title/description straight from the shared registry.
  const blog: Route[] = BLOG_POSTS.map((p) => ({
    path: `/blog/${p.slug}`,
    title: p.title.ro,
    description: p.description.ro,
    type: "article" as const,
    published: p.published,
  }));
  return [...STATIC_ROUTES, ...levelRoutes(), ...blog];
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

const attr = (src: string, name: string): string | undefined =>
  src.match(new RegExp(`${name}="((?:[^"\\\\]|\\\\.)*)"`))?.[1];

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
      const slug = attr(src, "slug");
      if (!slug) continue; // the shared layout itself has no slug
      out.push({
        file,
        routePath: prefix + slug,
        metaTitle: attr(src, "metaTitle"),
        description: attr(src, "description"),
        twin: attr(src, twinProp) ?? (src.includes(`${twinProp}={null}`) ? null : undefined),
        canonicalOverride: /canonicalHref="/.test(src),
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

const escAttr = (s: string): string =>
  s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Replace the content="" of a specific <meta> tag if present. */
function setMeta(html: string, attr: "property" | "name", key: string, value: string): string {
  const re = new RegExp(`(<meta ${attr}="${key}" content=")[^"]*(")`);
  return html.replace(re, `$1${value}$2`);
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

  // The shell ships no canonical — inject it plus a per-route og:locale (and,
  // for blog posts, the Article JSON-LD + article:* tags) before </head>, so
  // non-JS crawlers see the same head React would render at runtime.
  let inject =
    (route.noindex ? `    <meta name="robots" content="noindex,follow" />\n` : "") +
    `    <link rel="canonical" href="${canonicalHref}" />\n` +
    `    <meta property="og:locale" content="${ogLocale}" />\n`;
  // hreflang for reciprocal RO/EN twins only, matching what the layouts render
  // at runtime tag for tag. Romanian is x-default: it is the site's primary
  // language, and the RO page is the right landing spot for unmatched locales.
  const pair = pairs.get(route.path);
  if (pair && !route.canonical) {
    inject +=
      `    <link rel="alternate" hreflang="ro" href="${escAttr(BASE + pair.ro)}" />\n` +
      `    <link rel="alternate" hreflang="en" href="${escAttr(BASE + pair.en)}" />\n` +
      `    <link rel="alternate" hreflang="x-default" href="${escAttr(BASE + pair.ro)}" />\n`;
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
        ? `    <meta property="article:published_time" content="${escAttr(route.published)}" />\n`
        : "") +
      `    <meta property="article:author" content="Ibra — Centrul de Arabă Libaneză" />\n` +
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
        // eslint-disable-next-line no-console
        console.log(
          `[seo-prerender] wrote static <head> for ${count} routes ` +
            `(${pairs.size / 2} reciprocal RO/EN hreflang pairs).`,
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
