import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { BLOG_POSTS } from "@/lib/blogPosts";
import { languageCounterpart } from "@/lib/languageRoutes";

/**
 * Every bilingual page needs a URL per language.
 *
 * The components have always rendered both languages, but for a long time only
 * the Romanian URL existed. An English reader could reach the English text by
 * toggling; a search engine could not reach it at all, because there was no
 * address to index and nothing to point an hreflang at. Twenty blog articles
 * and eleven course pages were invisible in English.
 *
 * These assertions pin the two halves together so a new article or course page
 * cannot ship with only one of them.
 */
const app = readFileSync(resolve(process.cwd(), "src/App.tsx"), "utf8");
const prerender = readFileSync(resolve(process.cwd(), "scripts/seoPrerender.ts"), "utf8");
const sitemap = readFileSync(resolve(process.cwd(), "public/sitemap.xml"), "utf8");

const COURSE_PAIRS: Array<[string, string]> = [
  ["/cursuri", "/en/courses"],
  ["/cursuri/grup", "/en/courses/group"],
  ["/cursuri/private", "/en/courses/private"],
  ["/cursuri/copii", "/en/courses/children"],
  ["/cursuri/adulti", "/en/courses/adults"],
  ...(["a1", "a2", "b1", "b2", "c1", "c2"] as const).map(
    (id) => [`/cursuri/grup/${id}`, `/en/courses/group/${id}`] as [string, string],
  ),
];

describe("English twins", () => {
  it("routes the English blog and course pages", () => {
    expect(app).toContain('<Route path="/en/blog" element={<BlogIndex />} />');
    expect(app).toContain('<Route path="/en/blog/:slug"');
    for (const [, en] of COURSE_PAIRS) {
      // Level pages are served by one parameterised route.
      if (/\/group\/[a-c]\d$/.test(en)) continue;
      expect(app, `no route for ${en}`).toContain(`<Route path="${en}"`);
    }
    expect(app).toContain('<Route path="/en/courses/group/:level"');
  });

  it("maps every blog post to an English URL in both directions", () => {
    for (const p of BLOG_POSTS) {
      expect(languageCounterpart(`/blog/${p.slug}`, "en")).toBe(`/en/blog/${p.slug}`);
      expect(languageCounterpart(`/en/blog/${p.slug}`, "ro")).toBe(`/blog/${p.slug}`);
    }
  });

  it.each(COURSE_PAIRS)("%s <-> %s toggles both ways", (ro, en) => {
    expect(languageCounterpart(ro, "en")).toBe(en);
    expect(languageCounterpart(en, "ro")).toBe(ro);
  });

  it("prerenders the English course pages and lists them in the sitemap", () => {
    for (const [, en] of COURSE_PAIRS) {
      const generated = /\/group\/[a-c]\d$/.test(en); // built by levelRoutesEn()
      if (!generated) {
        expect(prerender, `no prerender entry for ${en}`).toContain(`{ path: "${en}"`);
      }
      expect(sitemap, `${en} missing from sitemap`).toContain(
        `<loc>https://centruldearabalibaneza.com${en}</loc>`,
      );
    }
    expect(prerender).toContain("function levelRoutesEn()");
  });

  it("gives the English blog a crawlable path in, not just the JS toggle", () => {
    // The toggle is a click handler. Without a real anchor the English index is
    // unreachable for anything that does not run JavaScript.
    const index = readFileSync(resolve(process.cwd(), "src/pages/blog/BlogIndex.tsx"), "utf8");
    expect(index).toContain('to={lang === "en" ? "/blog" : "/en/blog"}');
    const footer = readFileSync(resolve(process.cwd(), "src/components/Footer.tsx"), "utf8");
    expect(footer).toContain('to={lang === "en" ? "/en/blog" : "/blog"}');
  });

  it("forces English on /en/ URLs so the body matches the address", () => {
    // Language used to come from localStorage alone, which would have served
    // the Romanian half of a bilingual component at an /en/ URL.
    const i18n = readFileSync(resolve(process.cwd(), "src/lib/i18n.tsx"), "utf8");
    expect(i18n).toContain('window.location.pathname.startsWith("/en/")');
    expect(app).toContain("const LanguageFromPath");
    expect(app).toContain("<LanguageFromPath />");
  });

  it("stamps the route's own language on <html>", () => {
    // The shell is checked in as lang="ro"; every English page used to claim
    // Romanian to any crawler reading the static file.
    expect(prerender).toContain("<html[^>]*\\blang=\"");
  });
});
