/**
 * Per-page <head> data, server-rendered.
 *
 * scripts/seoPrerender.ts used to bake each page's title, description,
 * canonical, Open Graph tags, hreflang and JSON-LD into its own static HTML
 * file. Under TanStack Start the server renders every route on request, so the
 * same head belongs in each route's `head()` instead — otherwise the HTML a
 * crawler reads carries the site-wide head from src/routes/__root.tsx and only
 * the browser ever sees the page's own.
 *
 * The table below is copied from that script, value for value: no SEO copy was
 * rewritten in the move. src/test/route-heads.test.ts compares this module
 * against the script's own `allRoutes()` on every run, so the two cannot drift.
 *
 * Every tag carries data-rh="true", the attribute react-helmet-async uses to
 * mark tags it owns. The pages still render their heads through Helmet after
 * hydration; without the stamp Helmet would append a second <title>,
 * description and canonical next to the server-rendered ones instead of
 * replacing them — exactly what the old script's RH stamp prevented.
 */
import { BLOG_POSTS } from "@/lib/blogPosts";
import { getCurriculum } from "@/data/curriculum";
import { LEVEL_TITLE_RO, LEVEL_TITLE_EN } from "@/lib/levelMeta";
import { LEARN_CLUSTER, LEARN_X_DEFAULT, isLearnClusterPath } from "@/lib/hreflangCluster";
import { allFaqs, faqJsonLd, featuredFaqs } from "@/data/faq";
import { CURSURI_ARABA_META, HOME_META, JOACA_META } from "@/lib/pageMeta";

const BASE = "https://centruldearabalibaneza.com";

export interface SeoRoute {
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

const STATIC_ROUTES: SeoRoute[] = [
  // Head from src/lib/pageMeta.ts, shared with the component so the static and
  // runtime <title> cannot drift apart. Brand-first: the transactional "cursuri
  // de arabă libaneză" query belongs to /cursuri-araba, not here.
  { path: "/", title: HOME_META.ro.title, description: HOME_META.ro.description },
  // Not a listing — a three-step chooser (who it is for, how to attend, group
  // or private) ending on the courses that match. Titled as the tool it is, so
  // it stops reading like a second copy of /cursuri-limba-araba, which is the
  // guide that covers the same ground in prose.
  { path: "/cursuri", title: "Găsește cursul de arabă potrivit pentru tine", description: "Răspunde la trei întrebări scurte — pentru cine, online sau fizic, grup sau privat — și îți arătăm cursurile de arabă libaneză care ți se potrivesc." },
  { path: "/cursuri/grup", title: "Curs de Grup de Arabă Libaneză (A1–C2) — București & online", description: "Curs de grup de arabă libaneză cu profesor nativ. Niveluri A1–C2, grupe mici (max. 6 online, 10 fizic), fizic în București sau online. De la 500 LEI / lună." },
  { path: "/cursuri/private", title: "Lecții Private de Arabă Libaneză 1:1 — București & online", description: "Lecții 1:1 de arabă libaneză cu profesor nativ. Program flexibil, curriculum adaptat ție, fizic în București sau online. 150 LEI / lecție." },
  { path: "/cursuri/copii", title: "Cursuri de Arabă Libaneză pentru Copii — București", description: "Cursuri de arabă libaneză pentru copii 6–10 ani, în București. Învățare prin jocuri, activități și povești, cu profesor nativ libanez." },
  { path: "/cursuri/adulti", title: "Cursuri Arabă Libaneză — Adulți (18+)", description: "Cursuri de arabă libaneză pentru adulți (18+): grupe mici A1–C2 de la 500 lei/lună sau lecții private 1:1, online sau fizic în București." },
  { path: "/cursuri/tineri", title: "Curs de Arabă pentru Adolescenți | Pagina Actualizată", description: "Pagina cursului pentru adolescenți s-a mutat. Vezi programul actual, opțiunile din București și online și rezervă o lecție de probă.", canonical: "/cursuri-araba-adolescenti" },
  { path: "/cursuri-araba", title: "Cursuri de arabă: pagina s-a mutat | Ibra", description: "Adresa /cursuri-araba s-a mutat. Vezi pagina actualizată cu niveluri A1–C2, prețuri, grupe și lecții private de arabă libaneză.", canonical: "/cursuri-limba-araba" },
  { path: "/cursuri-limba-araba", title: CURSURI_ARABA_META.title, description: CURSURI_ARABA_META.description },
  // Free practice, not a sixth course page. No twin: the card bank is Romanian
  // only, so an /en URL would advertise a translation that does not exist.
  { path: "/joaca", title: JOACA_META.title, description: JOACA_META.description },
  { path: "/araba-pentru-incepatori", title: "Arabă Libaneză pentru Începători | Curs de la Zero", description: "Învață arabă libaneză de la zero cu profesor nativ. Cursuri pentru începători, în București sau online. Vorbești din primele lecții.", canonical: "/cursuri-limba-araba" },
  { path: "/araba-online", title: "Cursuri de Arabă Libaneză Online | Profesor Nativ", description: "Cursuri live de arabă libaneză online cu profesor nativ. Grupe A1–C2 și lecții private 1:1. Vorbești din primele lecții. Probă gratuită.", canonical: "/cursuri-limba-araba" },
  { path: "/meditatii-araba", title: "Meditații Arabă 1:1 București & Online | 150 lei/oră", description: "Meditații de arabă libaneză 1:1 cu profesor nativ, în București sau online. 150 lei/lecție de 60 min, pachete −20%, prima lecție de probă gratuită." },
  { path: "/intrebari-frecvente", title: "Întrebări frecvente — cursuri de arabă libaneză | Ibra", description: "Răspunsuri despre araba libaneză: preț, orar, format online sau fizic, cât durează până vorbești, ce dialect să înveți și cum arată gramatica." },
  { path: "/invata-araba", title: "Învață Arabă Libaneză de la Zero | Ghid și Cursuri", description: "Ghid pas cu pas pentru a învăța araba libaneză de la zero: ce dialect alegi, cât durează, ce metodă folosești. Plus cursuri cu profesor nativ, online sau fizic.", canonical: "/cursuri-limba-araba" },
  { path: "/cursuri-araba-bucuresti", title: "Cursuri Arabă București 2026 | Prima Lecție Gratuită", description: "Cursuri de arabă în București, str. Icoanei 80: grupe mici A1–C2 de la 700 lei/lună, meditații 1:1 și curs pentru copii. Prima lecție de probă e gratuită." },
  { path: "/curs-araba-copii", title: "Curs de Arabă pentru Copii în București | 6–10 ani", description: "Curs de arabă libaneză pentru copii de 6–10 ani în București. Lecții prin joc, cântece și povești, în grupă mică, cu profesor nativ libanez." },
  { path: "/arabizi", title: "Arabizi: ce înseamnă 2, 3, 5 și 7 în arabă", description: "Învață ce înseamnă cifrele 2, 3, 5, 7 și 8 în Arabizi, cu tabel complet, exemple din mesaje și cheat-sheet PDF gratuit." },
  { path: "/invata-araba-gratis", title: "Învață Arabă Libaneză Gratis: PDF-uri și Lecții", description: "Învață arabă libaneză gratuit cu PDF-uri, 100 de expresii utile, un plan de 30 de zile și o mini-lecție de pronunție pentru începători." },
  { path: "/resurse", title: "Resurse Gratuite Arabă Libaneză | PDF-uri de Descărcat", description: "Descarcă gratuit fișe Arabizi, 100 de expresii libaneze și un plan de 30 de zile. Primești PDF-urile pe email, fără costuri ascunse." },
  { path: "/fara-alfabet-arab", title: "Pot Învăța Araba Fără Alfabet? Ghid Practic", description: "Învață araba libaneză fără alfabet: vorbești din prima lecție cu arabizi. Vezi ce înveți în 4 săptămâni și când merită alfabetul." },
  { path: "/dialecte-arabe", title: "Dialecte Arabe: Levantin, Egiptean, Golf și Maghreb", description: "Ghid clar al dialectelor arabe: levantin, egiptean, din Golf, maghrebin și irakian. Vezi cine pe cine înțelege și ce dialect merită învățat." },
  { path: "/ce-araba-sa-inveti", title: "Ce Arabă Să Înveți în 2026: Libaneză, Standard sau Egipteană", description: "Compară araba libaneză, standard și egipteană. Vezi ce se vorbește în familie, la muncă sau în călătorii și alege varianta potrivită în 5 minute." },
  { path: "/araba-pentru-partener", title: "Arabă Libaneză pentru Partener și Familie | Curs 1:1", description: "Învață expresii libaneze pentru partener și familie, de la alintări la urări la masă. Curs 1:1 cu profesor nativ, online sau în București." },
  { path: "/araba-in-familie", title: "Arabă Libaneză în Familie — Copii Bilingvi și Părinți | Ghid", description: "Cum crești un copil bilingv româno-libanez: rutine zilnice, expresii de acasă și cursuri pentru copii și părinți, în București sau online." },
  // Self-canonical, unlike the retired aliases above. This is a comparison
  // guide ("which course should I pick"), not another way to say "Arabic
  // courses": it carries its own tables, competitor price ranges and criteria,
  // and it is the reciprocal half of /en/best-arabic-course. Canonicalising it
  // into the hub meant it could never rank for the comparison queries it was
  // written for, while still costing a crawl.
  { path: "/cel-mai-bun-curs-de-araba", title: "Cel mai bun curs de arabă în 2026 | Ghid de alegere", description: "Compară cursurile de arabă: libaneză sau standard, grup, privat, online ori aplicații. Vezi prețuri, criterii și greșeli de evitat înainte să alegi." },
  { path: "/cursuri-araba-adolescenti", title: "Arabă Libaneză pentru Adolescenți | Curs 11–17 ani", description: "Adolescenții de 11–17 ani învață arabă libaneză prin conversație, muzică și social media, online sau în București. Lecție de probă gratuită." },
  { path: "/blog", title: "Blog — ghiduri și articole despre araba libaneză", description: "Articole despre învățarea arabei libaneze: alfabet, expresii uzuale, cultură, cât durează să înveți și cum alegi un profesor de arabă." },
  // English twins of the course pages. The components are the same bilingual
  // ones the Romanian URLs render; only the URL and this head differ.
  // English twins of the remaining bilingual pages. The components already
  // carry both languages; these give the English side an address.
  { path: "/en/trial", title: "Free Lebanese Arabic Trial Lesson | Ibra", description: "Book a free Lebanese Arabic trial lesson with a native teacher — online or in person in Bucharest. 30 minutes, no obligation.", lang: "en" },
  { path: "/en/booking", title: "Book a Lesson — Lebanese Arabic with Ibra", description: "Book a free 30-minute trial lesson or enrol on a Lebanese Arabic course with a native teacher — online, or in person in Bucharest. No card needed.", lang: "en" },
  { path: "/en/quiz", title: "Free Level Test — Lebanese Arabic with Ibra", description: "Find out your Lebanese Arabic level (A1–C2) in two minutes and see which course fits. Free, no sign-up needed.", lang: "en" },
  { path: "/en/privacy", title: "Privacy Policy — Lebanese Arabic with Ibra", description: "How the Lebanese Arabic Center collects, uses, stores and protects your personal data, in line with GDPR — and how to ask for a copy or its deletion.", lang: "en" },
  { path: "/en/terms", title: "Terms and Conditions — Lebanese Arabic with Ibra", description: "The terms for enrolling on a Lebanese Arabic course with Ibra: bookings, payment, rescheduling, cancellations and refunds, and how the lessons run.", lang: "en" },
  { path: "/en/courses", title: "Lebanese Arabic Courses — Group, 1-on-1 & Kids", description: "Lebanese Arabic courses with a native teacher: small groups A1–C2, private 1-on-1 lessons and a children's course. Online or in person in Bucharest.", lang: "en" },
  { path: "/en/courses/group", title: "Lebanese Arabic Group Course (A1–C2) — Online & Bucharest", description: "Small-group Lebanese Arabic classes with a native teacher. Levels A1 to C2, max 6 online and 10 in person, from 500 LEI a month. Free trial lesson.", lang: "en" },
  { path: "/en/courses/private", title: "Private 1-on-1 Lebanese Arabic Lessons — Online & Bucharest", description: "One-to-one Lebanese Arabic lessons with a native teacher. Flexible schedule, a curriculum built around you, online or in Bucharest. 150 LEI per lesson.", lang: "en" },
  { path: "/en/courses/children", title: "Lebanese Arabic for Children (6–10) — Bucharest", description: "Lebanese Arabic classes for children aged 6 to 10 in Bucharest. Learning through games, songs and stories with a native Lebanese teacher.", lang: "en" },
  { path: "/en/courses/adults", title: "Lebanese Arabic Courses for Adults (18+)", description: "Lebanese Arabic for adults: A1–C2 group classes or private 1-on-1 lessons, online or in person in Bucharest, with a native teacher.", lang: "en" },
  { path: "/en/blog", title: "Blog — guides and articles about Lebanese Arabic", description: "Articles about learning Lebanese Arabic: the alphabet, everyday phrases, culture, how long it takes and how to choose an Arabic teacher.", lang: "en" },
  { path: "/en/learn-lebanese-arabic", title: "Learn Lebanese Arabic Online | Native Teacher & Free Trial", description: "Learn Lebanese (Levantine) Arabic online with a native teacher. Live 1-on-1 and small-group lessons from A1 to C2. Speak from lesson one—book a free trial." },
  { path: "/en/learn-levantine-arabic", title: "Learn Levantine Arabic Online | Native Lebanese Teacher", description: "Learn Levantine Arabic online with native Lebanese teacher Ibra. Join live private or small-group lessons and start speaking from lesson one.", lang: "en", canonical: "/en/learn-lebanese-arabic" },
  { path: "/en/arabic-tutor", title: "Arabic Tutor Online — 1-on-1 Lessons | Native Teacher", description: "Private Lebanese Arabic (Levantine) tutor — 1-on-1 lessons with a native teacher, 5+ years experience. CEFR A1–C2, flexible hours, free trial. 150 LEI / 60 min." },
  { path: "/en/faq", title: "Lebanese Arabic Course FAQ | Price, Schedule, Levels", description: "Answers about learning Lebanese Arabic: price, schedule, online or in person, how long until you can hold a conversation, and which dialect to learn." },
  { path: "/en/arabic-dialects-guide", title: "Arabic Dialects & Map: Levantine, Egyptian, Gulf & More", description: "Explore Arabic dialects with a clear map of Levantine, Egyptian, Gulf, Maghrebi and Iraqi Arabic, plus MSA, explained by a native Lebanese teacher." },
  { path: "/en/levantine-arabic-dialects-map", title: "Arabic Dialects & Map: Levantine, Egyptian, Gulf & More", description: "Explore Arabic dialects with a clear map of Levantine, Egyptian, Gulf, Maghrebi and Iraqi Arabic, plus MSA, explained by a native Lebanese teacher.", lang: "en", canonical: "/en/arabic-dialects-guide" },
  { path: "/en/arabic-classes-near-me", title: "Arabic Classes Near Me — Bucharest & Online | Native Teacher", description: "Arabic classes in Bucharest or live online with a native Lebanese teacher. Small groups, CEFR A1–C2, practical conversation, free trial. From €100/month." },
  { path: "/en/lebanese-arabic-vs-msa-vs-egyptian", title: "Lebanese vs MSA vs Egyptian Arabic — Full Comparison (2026)", description: "Compare Lebanese Arabic, MSA/Fusha, and Egyptian Arabic by pronunciation, grammar, reach, and learning goals. A practical guide from a native teacher." },
  { path: "/en/how-to-learn-lebanese-arabic", title: "How to Learn Lebanese Arabic — Step-by-Step Guide (2026)", description: "Learn Lebanese Arabic step by step in 2026 with a weekly routine, level-by-level timeline, and practical guidance from native Lebanese teacher Ibra." },
  { path: "/en/best-arabic-course", title: "Best Arabic Course 2026 — How to Choose | Lebanese vs MSA", description: "Compare Lebanese Arabic, MSA, group, private and online courses. See prices, common mistakes and choose the best Arabic course for your goals." },
  { path: "/en/arabic-for-teenagers", title: "Lebanese Arabic Classes for Teenagers | Bucharest & Online", description: "Lebanese Arabic classes for ages 11–17 with a native teacher, online or in Bucharest. Build real conversation skills from the first lesson. Free trial." },
  { path: "/de/arabisch-lernen", lang: "de", title: "Arabisch lernen online — Libanesisch mit Muttersprachler", description: "Arabisch lernen online — libanesischer Dialekt mit Muttersprachler. Sprich ab Lektion eins. Einzel- & Gruppenkurse, A1–C2. Kostenlose Probestunde." },
  // Retired alias, like the four below it. It was the only one without
  // noindex, which also made it the only indexable page missing from the
  // sitemap — an inconsistency, not a decision.
  { path: "/cursuri/privat", title: "Lecții Private de Arabă Libaneză 1:1 — București & online", description: "Lecții 1:1 de arabă libaneză cu profesor nativ. Program flexibil, curriculum adaptat ție, fizic în București sau online. 150 LEI / lecție.", canonical: "/cursuri/private" },
  { path: "/trial", title: "Lecție gratuită de arabă libaneză | Ibra", description: "Rezervă o lecție de probă gratuită de arabă libaneză cu profesor nativ — online sau fizic în București. Fără nicio obligație." },
  { path: "/booking", title: "Rezervă o lecție — Arabă Libaneză cu Ibra", description: "Rezervă o lecție de probă gratuită de 30 de minute sau înscrie-te la un curs de arabă libaneză cu profesor nativ — online sau fizic în București." },
  { path: "/quiz", title: "Test de nivel gratuit — Arabă Libaneză cu Ibra", description: "Află în 2 minute ce nivel de arabă libaneză ai (A1–C2) și ce curs ți se potrivește. Test gratuit, fără înregistrare." },
  { path: "/privacy", title: "Politica de confidențialitate — Arabă Libaneză cu Ibra", description: "Cum colectează, folosește, stochează și protejează Centrul de Arabă Libaneză datele tale personale, conform GDPR — și cum ceri o copie sau ștergerea lor." },
  // Both of these are app routes that had no prerendered page. Anything not
  // prerendered falls back to the SPA shell, which is the homepage's HTML —
  // so a crawler asking for them got the homepage's <head>, canonical and
  // body under a different URL. /stergere-date is the worse of the two: it is
  // linked from the footer of all 62 pages, so it was guaranteed to be
  // crawled. Neither is an SEO target, hence noindex.
  { path: "/stergere-date", title: "Ștergerea datelor (GDPR) — Arabă Libaneză cu Ibra", description: "Cere ștergerea datelor tale personale din evidențele Centrului de Arabă Libaneză, conform GDPR. Îți confirmăm pe email în cel mult 30 de zile.", noindex: true },
  { path: "/cursuri/online", title: "Cursuri de Arabă Libaneză Online — Arabă Libaneză cu Ibra", description: "Pagina cursurilor online s-a mutat. Vezi toate cursurile de arabă libaneză — grup A1–C2, lecții private și curs pentru copii, online sau în București.", canonical: "/cursuri" },
  { path: "/terms", title: "Termeni și condiții — Arabă Libaneză cu Ibra", description: "Termenii înscrierii la cursurile de arabă libaneză cu Ibra: rezervări, plată, reprogramare, anulare și politica de rambursare, plus cum se desfășoară lecțiile." },
];

function levelRoutes(): SeoRoute[] {
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
    .filter((r): r is SeoRoute => r !== null);
}

/**
 * The same six level pages in English, at /en/courses/group/<id>.
 *
 * Title and objective come from LEVEL_TITLE_EN and the English curriculum —
 * the same data the component renders — so these cannot drift from the page
 * any more than the Romanian ones can.
 */
function levelRoutesEn(): SeoRoute[] {
  const en = getCurriculum("en");
  return (["a1", "a2", "b1", "b2", "c1", "c2"] as const)
    .map((id): SeoRoute | null => {
      const lvl = en.find((l) => l.id === id);
      if (!lvl) return null;
      return {
        path: `/en/courses/group/${id}`,
        title: LEVEL_TITLE_EN[id],
        description: lvl.objective.slice(0, 155),
        lang: "en" as const,
      };
    })
    .filter((r): r is SeoRoute => r !== null);
}

export function allSeoRoutes(): SeoRoute[] {
  // Blog articles: RO title/description straight from the shared registry.
  const blog: SeoRoute[] = BLOG_POSTS.map((p) => ({
    path: `/blog/${p.slug}`,
    title: p.title.ro,
    description: p.description.ro,
    type: "article" as const,
    published: p.published,
    // A post that consolidates into another keeps its URL but points its
    // canonical at the survivor, so the two stop competing for one query.
    ...(p.canonicalTo ? { canonical: `/blog/${p.canonicalTo}` } : {}),
  }));
  // The English half of the same articles, at /en/blog/<slug>. The components
  // have always rendered both languages; only the Romanian URL was ever
  // prerendered, so every English translation on the blog was unreachable —
  // twenty articles that could not be indexed, linked to, or paired by
  // hreflang. Titles and descriptions come from the same registry, English
  // side. A post consolidated into another follows it in English too.
  const blogEn: SeoRoute[] = BLOG_POSTS.map((p) => ({
    path: `/en/blog/${p.slug}`,
    title: p.title.en,
    description: p.description.en,
    type: "article" as const,
    published: p.published,
    lang: "en" as const,
    ...(p.canonicalTo ? { canonical: `/en/blog/${p.canonicalTo}` } : {}),
  }));
  return [...STATIC_ROUTES, ...levelRoutes(), ...levelRoutesEn(), ...blog, ...blogEn]
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
 * RO <-> EN pairs that get reciprocal hreflang, matching what the old script
 * emitted tag for tag.
 *
 * The script derived the landing-page pairs by parsing `enHref`/`roHref` out of
 * src/pages/seo/* and src/pages/en/* at build time, which a browser bundle
 * cannot do. They are listed literally instead; src/test/route-heads.test.ts
 * re-parses the pages and fails if a pair here stops being reciprocal, or a new
 * reciprocal pair is missing from the list.
 */
const LANDING_PAIRS: Array<[string, string]> = [
  ["/ce-araba-sa-inveti", "/en/lebanese-arabic-vs-msa-vs-egyptian"],
  ["/cel-mai-bun-curs-de-araba", "/en/best-arabic-course"],
  ["/cursuri-limba-araba", "/en/learn-lebanese-arabic"],
  ["/cursuri-araba-adolescenti", "/en/arabic-for-teenagers"],
  ["/cursuri-araba-bucuresti", "/en/arabic-classes-near-me"],
  ["/dialecte-arabe", "/en/arabic-dialects-guide"],
  ["/intrebari-frecvente", "/en/faq"],
  ["/meditatii-araba", "/en/arabic-tutor"],
];

/** Course pages: one bilingual component, two URLs, generated together. */
const COURSE_PAIRS: Array<[string, string]> = [
  ["/trial", "/en/trial"],
  ["/booking", "/en/booking"],
  ["/quiz", "/en/quiz"],
  ["/privacy", "/en/privacy"],
  ["/terms", "/en/terms"],
  ["/cursuri", "/en/courses"],
  ["/cursuri/grup", "/en/courses/group"],
  ["/cursuri/private", "/en/courses/private"],
  ["/cursuri/copii", "/en/courses/children"],
  ["/cursuri/adulti", "/en/courses/adults"],
  ...(["a1", "a2", "b1", "b2", "c1", "c2"] as const).map(
    (id) => [`/cursuri/grup/${id}`, `/en/courses/group/${id}`] as [string, string],
  ),
];

export function hreflangPairs(): Map<string, { ro: string; en: string }> {
  const pairs = new Map<string, { ro: string; en: string }>();
  const add = (ro: string, en: string) => {
    const pair = { ro, en };
    pairs.set(ro, pair);
    pairs.set(en, pair);
  };
  for (const [ro, en] of LANDING_PAIRS) add(ro, en);
  // A consolidated post is left out — its canonical already points at the
  // survivor, and hreflang on a canonicalised URL is the contradiction this
  // file avoids everywhere else.
  for (const p of BLOG_POSTS) {
    if (p.canonicalTo) continue;
    add(`/blog/${p.slug}`, `/en/blog/${p.slug}`);
  }
  add("/blog", "/en/blog");
  for (const [ro, en] of COURSE_PAIRS) add(ro, en);
  return pairs;
}

/**
 * FAQPage JSON-LD, on the three pages that show the questions. Only what the
 * page actually shows is marked up, because Google requires the structured data
 * to match the visible content.
 */
const FAQ_ROUTES: Record<string, () => { q: string; a: string }[]> = {
  "/": () => featuredFaqs("ro"),
  "/intrebari-frecvente": () => allFaqs("ro"),
  "/en/faq": () => allFaqs("en"),
};

let routeIndex: Map<string, SeoRoute> | null = null;

/** The route table, keyed by path. */
export function seoRouteFor(path: string): SeoRoute | undefined {
  if (!routeIndex) routeIndex = new Map(allSeoRoutes().map((r) => [r.path, r]));
  return routeIndex.get(path);
}

const RH = { "data-rh": "true" } as const;

interface HeadResult {
  meta: Record<string, string>[];
  links: Record<string, string>[];
  scripts: { type: string; children: string }[];
}

/**
 * The head for one route, in the shape TanStack Router's `head()` returns.
 *
 * An unknown path yields nothing, which leaves the site-wide head from
 * src/routes/__root.tsx in place rather than a half-built one.
 */
export function seoHead(path: string): HeadResult {
  const route = seoRouteFor(path);
  if (!route) return { meta: [], links: [], scripts: [] };

  const url = BASE + (route.path === "/" ? "/" : route.path);
  const lang = route.lang ?? (route.path.startsWith("/en/") ? "en" : "ro");
  const ogLocale = lang === "en" ? "en_US" : lang === "de" ? "de_DE" : "ro_RO";
  const { title, description } = route;
  // Canonical (and og:url) point at the consolidation target when set.
  const canonicalHref = route.canonical ? BASE + route.canonical : url;

  const meta: Record<string, string>[] = [
    { ...RH, title },
    { ...RH, name: "description", content: description },
    { ...RH, property: "og:type", content: route.type ?? "website" },
    { ...RH, property: "og:title", content: title },
    { ...RH, property: "og:description", content: description },
    { ...RH, property: "og:url", content: canonicalHref },
    { ...RH, property: "og:locale", content: ogLocale },
    { ...RH, name: "twitter:title", content: title },
    { ...RH, name: "twitter:description", content: description },
  ];
  if (route.noindex) meta.push({ ...RH, name: "robots", content: "noindex,follow" });

  const links: Record<string, string>[] = [{ ...RH, rel: "canonical", href: canonicalHref }];

  // hreflang for reciprocal RO/EN twins only, matching what the layouts render
  // at runtime tag for tag. Romanian is x-default: it is the site's primary
  // language, and the RO page is the right landing spot for unmatched locales.
  const pair = hreflangPairs().get(route.path);
  const alt = (hreflang: string, href: string) => links.push({ ...RH, rel: "alternate", hreflang, href });
  if (pair && !route.canonical) {
    alt("ro", BASE + pair.ro);
    alt("en", BASE + pair.en);
    // One group also has a German member.
    if (isLearnClusterPath(route.path)) alt("de", BASE + LEARN_CLUSTER.de);
    alt("x-default", BASE + pair.ro);
  } else if (isLearnClusterPath(route.path) && !route.canonical) {
    // The German page is not part of an RO/EN annotation pair, but it is a full
    // member of the cluster.
    alt("ro", BASE + LEARN_CLUSTER.ro);
    alt("en", BASE + LEARN_CLUSTER.en);
    alt("de", BASE + LEARN_CLUSTER.de);
    alt("x-default", BASE + LEARN_X_DEFAULT);
  }

  const scripts: { type: string; children: string }[] = [];
  const faq = FAQ_ROUTES[route.path];
  if (faq) {
    scripts.push({ type: "application/ld+json", children: JSON.stringify(faqJsonLd(faq())) });
  }

  if (route.type === "article") {
    if (route.published) {
      meta.push({ ...RH, property: "article:published_time", content: route.published });
    }
    meta.push({ ...RH, property: "article:author", content: "Ibra — Centrul de Arabă Libaneză" });
    scripts.push({
      type: "application/ld+json",
      children: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Article",
        headline: route.title,
        description: route.description,
        datePublished: route.published,
        dateModified: route.published,
        inLanguage: lang,
        mainEntityOfPage: canonicalHref,
        image: `${BASE}/og-image.png`,
        author: { "@type": "Person", name: "Ibra — Centrul de Arabă Libaneză" },
        publisher: {
          "@type": "Organization",
          name: "Centrul de Arabă Libaneză cu Ibra",
          url: `${BASE}/`,
          logo: { "@type": "ImageObject", url: `${BASE}/favicon.png` },
        },
      }),
    });
  }

  return { meta, links, scripts };
}
