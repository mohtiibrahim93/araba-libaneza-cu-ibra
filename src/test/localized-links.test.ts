import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";

/**
 * In-article links must stay in the reader's language.
 *
 * The blog articles are bilingual components served at two URLs each, but all
 * forty-three of their in-body links were written as Romanian paths. An English
 * reader following one landed on /blog/<slug> — the Romanian address, still
 * rendering English, because nothing resets the language leaving /en/. That is
 * the duplicate-content problem the English URLs exist to prevent, and it also
 * left every English article with exactly one route in: its own index.
 */
const read = (p: string) => readFileSync(resolve(process.cwd(), p), "utf8");
const blogDir = resolve(process.cwd(), "src/pages/blog");
const articles = readdirSync(blogDir).filter((f) => f.endsWith(".tsx") && f !== "BlogIndex.tsx");

describe("localized in-article links", () => {
  it("has articles to check", () => {
    expect(articles.length).toBeGreaterThan(15);
  });

  it("routes every article's links through LocalizedLink", () => {
    const offenders = articles.filter((f) => {
      const src = read(`src/pages/blog/${f}`);
      return src.includes('from "react-router-dom"');
    });
    expect(offenders).toEqual([]);
  });

  it("maps a Romanian path to its English twin only when one exists", () => {
    const src = read("src/components/LocalizedLink.tsx");
    // Falling back to the original matters: a Romanian-only guide must stay
    // reachable rather than being silently dropped from the English pages.
    expect(src).toContain("languageCounterpart(path, \"en\")");
    expect(src).toContain("if (counterpart) dest = counterpart + tail;");
    // Already-English paths are left alone rather than mapped twice.
    expect(src).toContain('!to.startsWith("/en/")');
  });

  it("preserves query strings and hashes", () => {
    const src = read("src/components/LocalizedLink.tsx");
    expect(src).toContain("to.search(/[?#]/)");
  });

  it("leaves the blog index's cross-language link alone", () => {
    // That link is meant to cross languages. Routed through LocalizedLink it
    // would map /blog back to /en/blog and strand the reader where they were.
    const src = read("src/pages/blog/BlogIndex.tsx");
    expect(src).toContain('import { Link as CrossLanguageLink } from "react-router-dom"');
    expect(src).toMatch(/<CrossLanguageLink\s+to=\{lang === "en" \? "\/blog" : "\/en\/blog"\}/);
  });

  it("routes the shared blog chrome through LocalizedLink too", () => {
    // The article components were only half the story: the related-posts block,
    // the inline CTAs and the breadcrumb live in shared components, and those
    // were still emitting Romanian paths on English pages. Four Romanian links
    // per English article came from here, not from the articles.
    for (const f of [
      "src/components/blog/BlogArticleLayout.tsx",
      "src/components/blog/ArticleKit.tsx",
      "src/components/blog/RelatedPosts.tsx",
      "src/components/ResourcesTeaser.tsx",
    ]) {
      expect(read(f), `${f} still imports the plain router Link`).not.toContain(
        'import { Link } from "react-router-dom"',
      );
    }
  });

  it("never maps an English destination to a Romanian URL", () => {
    // /arabizi mapped to /blog/lebanese-arabic-learning-resources — the
    // Romanian address — so a localised link sent English readers back into
    // Romanian while looking like it had done its job.
    const src = read("src/lib/languageRoutes.ts");
    const block = src.split("const EN_FOR_RO")[1].split("};")[0];
    const offenders = [...block.matchAll(/"([^"]+)":\s*"([^"]+)"/g)]
      .filter(([, , target]) => !target.startsWith("/en/"))
      .map(([, from, to]) => `${from} -> ${to}`);
    expect(offenders).toEqual([]);
  });
});
