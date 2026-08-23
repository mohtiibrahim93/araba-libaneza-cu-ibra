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
  { path: "/cursuri/copii", title: "Cursuri de Arabă Libaneză pentru Copii — București", description: "Cursuri interactive de arabă libaneză pentru copii (4–14 ani), fizic în București. Activități, jocuri și povești în arabă libaneză. Online disponibil de la 10 ani." },
  { path: "/cursuri/adulti", title: "Cursuri Arabă Libaneză — Adulți (18+)", description: "Cursuri de arabă libaneză pentru adulți: grup A1–C2 sau lecții 1:1, online sau fizic în București." },
  { path: "/cursuri/tineri", title: "Cursuri Arabă Libaneză — Tineri 11–17", description: "Cursuri de arabă libaneză pentru adolescenți 11–17 ani, în grup sau 1:1, online sau fizic." },
  { path: "/cursuri-araba", title: "Cursuri de Arabă Libaneză 2026 — Grup, Private & Copii | București și Online", description: "Cursuri de arabă libaneză cu profesor nativ: grup (A1–C2), lecții private 1:1 și curs pentru copii — fizic în București sau online. Prima lecție de probă e gratuită.", canonical: "/cursuri-limba-araba" },
  { path: "/araba-pentru-incepatori", title: "Arabă Libaneză pentru Începători — Cursuri de la Zero | Vorbești din Prima Lecție", description: "Învață arabă libaneză de la zero cu profesor nativ: metoda Oral First, fără blocajul alfabetului, grupe A1 pentru începători — fizic în București sau online. Probă gratuită." },
  { path: "/araba-online", title: "Arabă Libaneză Online — Cursuri Live pe Zoom cu Profesor Nativ | De Oriunde", description: "Cursuri de arabă libaneză online: lecții live pe Zoom cu profesor nativ, grupe A1–C2 și lecții private 1:1, de oriunde. Grupa A1 online începe pe 15 august — probă gratuită." },
  { path: "/cursuri-limba-araba", title: "Cursuri de Arabă Libaneză — Grup, Private, Online | București 2026", description: "Cursuri de arabă libaneză cu profesor nativ, structurate pe niveluri CEFR (A1–C2). Grup, private și pentru copii, fizic în București sau online. Lecție de probă gratuită." },
  { path: "/meditatii-araba", title: "Meditații Arabă Libaneză 1:1 cu Profesor Nativ | București & Online", description: "Meditații de arabă libaneză cu profesor nativ libanez, 1:1, ritm personalizat. Fizic în București sau online pe Zoom. 150 lei/lecție, primă lecție gratuită." },
  { path: "/invata-araba", title: "Învață Araba Libaneză de la Zero — Metodă, Timp & Cursuri | 2026", description: "Ghid pas cu pas pentru a învăța araba libaneză de la zero: ce dialect alegi, cât durează, ce metodă folosești. Plus cursuri cu profesor nativ, online sau fizic." },
  { path: "/cursuri-araba-bucuresti", title: "Cursuri de Arabă Libaneză București — Adulți, Copii, 1:1 | Sector 2", description: "Cursuri de arabă libaneză în București cu profesor nativ libanez, la Raduga Creative Center (Str. Icoanei 80). Grupe mici, niveluri A1–C2, adulți și copii. Probă gratuită." },
  { path: "/curs-araba-copii", title: "Curs Arabă Libaneză pentru Copii (6–10 ani) | București, prin Joc", description: "Curs de arabă libaneză pentru copii 6–10 ani în București: învățare prin joc, cântece și povești, cu profesor nativ libanez. Grupă mică, sâmbătă dimineața." },
  { path: "/arabizi", title: "Arabizi — Ce Înseamnă 2, 3, 5, 7 în Arabă | Ghid Complet cu Tabel", description: "Ghid complet Arabizi: tabelul cifrelor (2, 3, 5, 6, 7, 8, 9) și literele arabe pe care le înlocuiesc, exemple reale din WhatsApp și TikTok, plus cheat-sheet PDF gratuit." },
  { path: "/invata-araba-gratis", title: "Învață Arabă Libaneză Gratis — Resurse, PDF-uri și Lecții | 2026", description: "Resurse gratuite pentru arabă libaneză: cheat-sheet arabizi, 100 de expresii esențiale în PDF, plan de 30 de zile, canale YouTube și o mini-lecție cu pronunție. Fără costuri." },
  { path: "/resurse", title: "Resurse Gratuite Arabă Libaneză — PDF-uri, Expresii, Plan 30 Zile", description: "Descarcă gratuit materialele noastre pentru arabă libaneză: cheat-sheet arabizi, 100 de expresii esențiale și planul de învățare de 30 de zile. PDF pe email, fără costuri." },
  { path: "/fara-alfabet-arab", title: "Pot Învăța Araba Fără Alfabet? Da — Iată Cum | Metoda Oral First", description: "Poți învăța araba libaneză fără alfabetul arab: vorbești din prima lecție folosind arabizi. Ce e greu de fapt la arabă, ce înveți în 4 săptămâni și când merită alfabetul." },
  { path: "/dialecte-arabe", title: "Dialectele Arabe — Levantin, Egiptean, Golf, Maghreb | Ghid 2026", description: "Ghid clar al dialectelor arabe: levantin (libanez, sirian, palestinian, iordanian), egiptean, maghrebin, din Golf și irakian, plus araba standard. Cine pe cine înțelege și ce dialect merită învățat." },
  { path: "/ce-araba-sa-inveti", title: "Ce Arabă Să Înveți — Libaneză vs Standard vs Egipteană | Ghid", description: "Compară araba libaneză, araba standard (fusha) și egipteana: ce vorbesc oamenii, ce e mai ușor, ce îți trebuie pentru familie, muncă sau călătorii. Alegi în 5 minute." },
  { path: "/blog", title: "Blog — articole despre araba libaneză | Arabă Libaneză cu Ibra", description: "Articole despre învățarea arabei libaneze: alfabet, expresii uzuale, cultură, cât durează să înveți și cum alegi un profesor de arabă." },
  { path: "/en/learn-lebanese-arabic", title: "Learn Lebanese Arabic Online — 1-on-1 & Group Courses with a Native Teacher", description: "Learn Lebanese Arabic (Levantine dialect) with a native instructor. Live 1-on-1 and small-group courses online worldwide, from beginner (A1) to advanced. Speak from lesson one — free trial." },
  { path: "/en/learn-levantine-arabic", title: "Learn Levantine Arabic Online — Native Teacher | A1–C2", description: "Learn Levantine Arabic (Lebanese, Syrian, Jordanian, Palestinian) with a native teacher. Live 1-on-1 and small-group courses online, A1–C2. Oral-first method — speak from lesson one." },
  { path: "/en/arabic-tutor", title: "Arabic Tutor Online — Private 1-on-1 Lessons | Native Teacher", description: "Private Arabic tutor online — 1-on-1 lessons with a native Lebanese teacher (5+ years experience). CEFR A1–C2, flexible schedule, free trial. €30 / 90 min." },
  { path: "/en/arabic-dialects-guide", title: "Arabic Dialects Guide — Levantine, Egyptian, Gulf, Maghrebi | 2026", description: "Complete guide to Arabic dialects: Levantine (Lebanese, Syrian, Jordanian, Palestinian), Egyptian–Sudanese, Maghrebi, Peninsular (Gulf, Saudi, Yemeni), Mesopotamian, plus MSA. Written by a native Lebanese teacher." },
  { path: "/en/levantine-arabic-dialects-map", title: "Levantine Arabic Dialects Map — North vs South Shami", description: "Map of the Levantine Arabic dialects: North Levantine (Lebanese, Syrian) vs South Levantine (Palestinian, Jordanian) — sounds, differences, and where Lebanese fits in." },
  { path: "/en/arabic-classes-near-me", title: "Arabic Classes Near Me — Bucharest & Online | Native Teacher", description: "Arabic classes with a native Lebanese teacher — in person in Bucharest (Strada Icoanei 80) or live online worldwide. Small groups, CEFR A1–C2, free trial. From €100/month." },
  { path: "/en/lebanese-arabic-vs-msa-vs-egyptian", title: "Lebanese vs MSA vs Egyptian Arabic — Full Comparison (2026)", description: "Lebanese Arabic vs Modern Standard Arabic (MSA/Fusha) vs Egyptian Arabic: differences in pronunciation, grammar, media reach, and which dialect to learn based on your goal. Written by a native Lebanese teacher." },
  { path: "/en/how-to-learn-lebanese-arabic", title: "How to Learn Lebanese Arabic — Step-by-Step Guide (2026)", description: "The complete step-by-step guide to learning Lebanese Arabic in 2026: recommended learning path, weekly lesson structure, level-by-level timeline (A1→C1), and the exact study routine that works. Written by a native Lebanese teacher." },
  { path: "/de/arabisch-lernen", lang: "de", title: "Arabisch lernen online — libanesisch mit Muttersprachler | A1–C2", description: "Arabisch lernen online — libanesischer Dialekt mit Muttersprachler. Sprich ab Lektion eins, ohne Alphabet-Hürde. Einzel- & Gruppenkurse, A1–C2. Kostenlose Probestunde." },
  { path: "/cursuri/privat", title: "Lecții private de arabă libaneză (1:1) | București & Online", description: "Lecții private 1:1 de arabă libaneză cu profesor nativ — online sau în București, ritm și program adaptate. Solicită o lecție privată." },
  { path: "/trial", title: "Lecție de probă gratuită — Arabă Libaneză cu Ibra", description: "Rezervă o lecție de probă gratuită de arabă libaneză cu profesor nativ — online sau fizic în București. Fără nicio obligație." },
  { path: "/booking", title: "Rezervă o lecție — Arabă Libaneză cu Ibra", description: "Rezervă o lecție de probă gratuită sau înscrie-te la un curs de arabă libaneză — online sau în București." },
  { path: "/quiz", title: "Test de nivel gratuit — Arabă Libaneză cu Ibra", description: "Află în 2 minute ce nivel de arabă libaneză ai (A1–C2) și ce curs ți se potrivește. Test gratuit, fără înregistrare." },
  { path: "/privacy", title: "Politica de confidențialitate — Arabă Libaneză cu Ibra", description: "Cum colectăm, folosim și protejăm datele tale personale, conform GDPR." },
  { path: "/terms", title: "Termeni și condiții — Arabă Libaneză cu Ibra", description: "Termenii și condițiile de utilizare a serviciilor Centrului de Arabă Libaneză cu Ibra." },
];

/**
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
            title: "Curs de Arabă pentru Începători București & Online — A1 (Libaneză)",
            description:
              "Curs de arabă pentru începători (A1) în araba libaneză — fizic în București (Strada Icoanei 80) sau online. Vorbești de la prima lecție. Două sesiuni de 90 min/săpt. Probă gratuită.",
          }
        : {
            path: `/cursuri/grup/${id}`,
            title: `${lvl.title} — Curs de Grup de Arabă Libaneză`,
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

const escAttr = (s: string): string =>
  s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Replace the content="" of a specific <meta> tag if present. */
function setMeta(html: string, attr: "property" | "name", key: string, value: string): string {
  const re = new RegExp(`(<meta ${attr}="${key}" content=")[^"]*(")`);
  return html.replace(re, `$1${value}$2`);
}

function renderRoute(template: string, route: Route): string {
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
    `    <link rel="canonical" href="${canonicalHref}" />\n` +
    `    <meta property="og:locale" content="${ogLocale}" />\n`;
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

export function seoPrerenderPlugin(): Plugin {
  let outDir = "dist";
  return {
    name: "seo-prerender",
    apply: "build",
    configResolved(config) {
      outDir = config.build.outDir || "dist";
    },
    closeBundle() {
      try {
        const root = path.resolve(outDir);
        const shellPath = path.join(root, "index.html");
        if (!fs.existsSync(shellPath)) {
          this.warn(`[seo-prerender] ${shellPath} not found — skipping.`);
          return;
        }
        const template = fs.readFileSync(shellPath, "utf8");
        let count = 0;
        for (const route of allRoutes()) {
          const html = renderRoute(template, route);
          const outFile =
            route.path === "/"
              ? shellPath
              : path.join(root, route.path.replace(/^\//, ""), "index.html");
          fs.mkdirSync(path.dirname(outFile), { recursive: true });
          fs.writeFileSync(outFile, html);
          count++;
        }
        // eslint-disable-next-line no-console
        console.log(`[seo-prerender] wrote static <head> for ${count} routes.`);

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
      } catch (err) {
        this.warn(`[seo-prerender] skipped (${(err as Error).message}). SPA shell left intact.`);
      }
    },
  };
}
