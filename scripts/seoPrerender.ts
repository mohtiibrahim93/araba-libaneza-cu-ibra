import fs from "node:fs";
import path from "node:path";
import type { Plugin } from "vite";
import { BLOG_POSTS } from "../src/lib/blogPosts";

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
}

// Non-blog marketing routes. Values copied from the pages' existing SEO props
// (src/lib/i18n.tsx course/home keys, src/pages/seo/*, src/pages/en/*).
const STATIC_ROUTES: Route[] = [
  { path: "/", title: "Arabă Libaneză cu Ibra — Cursuri Online & București", description: "Învață arabă libaneză cu profesor nativ. Cursuri de grup, private și pentru copii — fizic în București sau online. Toate nivelurile CEFR (A1–C2)." },
  { path: "/cursuri", title: "Cursuri Arabă (Libaneză) — Adulți, Tineri, Copii | București & Online", description: "Cursuri de arabă (dialect libanez) pentru toate vârstele: adulți (18+), tineri (11–17) și copii (6–10). Grup sau 1:1, online sau fizic în București. Profesor nativ." },
  { path: "/cursuri/grup", title: "Curs de Grup de Arabă Libaneză (A1–C2) — București & online", description: "Curs de grup de arabă libaneză cu profesor nativ. Niveluri A1–C2, grupuri de 4–10 cursanți, fizic în București sau online. De la 500 LEI / lună." },
  { path: "/cursuri/private", title: "Lecții Private de Arabă Libaneză 1:1 — București & online", description: "Lecții 1:1 de arabă libaneză cu profesor nativ. Program flexibil, curriculum adaptat ție, fizic în București sau online. 150 LEI / lecție." },
  { path: "/cursuri/copii", title: "Cursuri de Arabă Libaneză pentru Copii — București", description: "Cursuri interactive de arabă libaneză pentru copii (4–14 ani), fizic în București. Activități, jocuri și povești în arabă libaneză. Online disponibil de la 10 ani." },
  { path: "/cursuri/adulti", title: "Cursuri Arabă Libaneză — Adulți (18+)", description: "Cursuri de arabă libaneză pentru adulți: grup A1–C2 sau lecții 1:1, online sau fizic în București." },
  { path: "/cursuri/tineri", title: "Cursuri Arabă Libaneză — Tineri 11–17", description: "Cursuri de arabă libaneză pentru adolescenți 11–17 ani, în grup sau 1:1, online sau fizic." },
  { path: "/cursuri-araba", title: "Cursuri de Arabă 2026 — Grup, Private & Copii | București și Online", description: "Cursuri de arabă libaneză cu profesor nativ: grup (A1–C2), lecții private 1:1 și curs pentru copii — fizic în București sau online. Prima lecție de probă e gratuită.", canonical: "/cursuri-limba-araba" },
  { path: "/araba-pentru-incepatori", title: "Arabă pentru Începători — Cursuri de la Zero | Vorbești din Prima Lecție", description: "Învață arabă de la zero cu profesor nativ: metoda Oral First, fără blocajul alfabetului, grupe A1 pentru începători — fizic în București sau online. Probă gratuită." },
  { path: "/araba-online", title: "Arabă Online — Cursuri Live pe Zoom cu Profesor Nativ | De Oriunde", description: "Cursuri de arabă libaneză online: lecții live pe Zoom cu profesor nativ, grupe A1–C2 și lecții private 1:1, de oriunde. Grupa A1 online începe pe 15 august — probă gratuită." },
  { path: "/cursuri-limba-araba", title: "Cursuri de Limba Arabă — Grup, Private, Online | București 2026", description: "Cursuri de limba arabă cu profesor nativ, structurate pe niveluri CEFR (A1–C2). Grup, private și pentru copii, fizic în București sau online. Lecție de probă gratuită." },
  { path: "/meditatii-araba", title: "Meditații Arabă 1:1 cu Profesor Nativ | București & Online", description: "Meditații de limba arabă cu profesor nativ libanez, 1:1, ritm personalizat. Fizic în București sau online pe Zoom. 150 lei/lecție, primă lecție gratuită." },
  { path: "/invata-araba", title: "Învață Araba de la Zero — Metodă, Timp & Cursuri | 2026", description: "Ghid pas cu pas pentru a învăța araba de la zero: ce dialect alegi, cât durează, ce metodă folosești. Plus cursuri cu profesor nativ, online sau fizic." },
  { path: "/cursuri-araba-bucuresti", title: "Cursuri de Arabă București — Adulți, Copii, 1:1 | Sector 2", description: "Cursuri de arabă în București cu profesor nativ libanez, la Raduga Creative Center (Str. Icoanei 80). Grupe mici, niveluri A1–C2, adulți și copii. Probă gratuită." },
  { path: "/curs-araba-copii", title: "Curs Arabă pentru Copii (6–10 ani) | București, prin Joc", description: "Curs de arabă pentru copii 6–10 ani în București: învățare prin joc, cântece și povești, cu profesor nativ libanez. Grupă mică, sâmbătă dimineața." },
  { path: "/blog", title: "Blog — articole despre araba libaneză | Arabă Libaneză cu Ibra", description: "Articole despre învățarea arabei libaneze: alfabet, expresii uzuale, cultură, cât durează să înveți și cum alegi un profesor de arabă." },
  { path: "/en/learn-lebanese-arabic", title: "Learn Lebanese Arabic Online — 1-on-1 & Group Courses with a Native Teacher", description: "Learn Lebanese Arabic (Levantine dialect) with a native instructor. Live 1-on-1 and small-group courses online worldwide, from beginner (A1) to advanced. Speak from lesson one — free trial." },
  { path: "/en/learn-levantine-arabic", title: "Learn Levantine Arabic Online — Native Teacher | A1–C2", description: "Learn Levantine Arabic (Lebanese, Syrian, Jordanian, Palestinian) with a native teacher. Live 1-on-1 and small-group courses online, A1–C2. Oral-first method — speak from lesson one." },
  { path: "/en/arabic-tutor", title: "Arabic Tutor Online — Private 1-on-1 Lessons | Native Teacher", description: "Private Arabic tutor online — 1-on-1 lessons with a native Lebanese teacher (5+ years experience). CEFR A1–C2, flexible schedule, free trial. €30 / 90 min." },
  { path: "/en/arabic-dialects-guide", title: "Arabic Dialects Guide — Levantine, Egyptian, Gulf, Maghrebi | 2026", description: "Complete guide to Arabic dialects: Levantine (Lebanese, Syrian, Jordanian, Palestinian), Egyptian–Sudanese, Maghrebi, Peninsular (Gulf, Saudi, Yemeni), Mesopotamian, plus MSA. Written by a native Lebanese teacher." },
];

function allRoutes(): Route[] {
  // Blog articles: RO title/description straight from the shared registry.
  const blog: Route[] = BLOG_POSTS.map((p) => ({
    path: `/blog/${p.slug}`,
    title: p.title.ro,
    description: p.description.ro,
  }));
  return [...STATIC_ROUTES, ...blog];
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
  const isEn = route.path.startsWith("/en/");
  const title = escAttr(route.title);
  const desc = escAttr(route.description);
  // Canonical (and og:url) point at the consolidation target when set.
  const canonicalHref = escAttr(route.canonical ? BASE + route.canonical : url);

  let html = template;
  html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${title}</title>`);
  html = setMeta(html, "property", "og:title", title);
  html = setMeta(html, "property", "og:description", desc);
  html = setMeta(html, "property", "og:url", canonicalHref);
  html = setMeta(html, "name", "twitter:title", title);
  html = setMeta(html, "name", "twitter:description", desc);

  // The shell ships no <meta name="description"> or canonical — inject them,
  // plus a per-route og:locale, right before </head>.
  const inject =
    `    <meta name="description" content="${desc}" />\n` +
    `    <link rel="canonical" href="${canonicalHref}" />\n` +
    `    <meta property="og:locale" content="${isEn ? "en_US" : "ro_RO"}" />\n`;
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
      } catch (err) {
        this.warn(`[seo-prerender] skipped (${(err as Error).message}). SPA shell left intact.`);
      }
    },
  };
}
