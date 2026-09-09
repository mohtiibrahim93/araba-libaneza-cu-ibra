import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

/**
 * Structured data declared through <Helmet> has to reach the built HTML.
 *
 * scripts/prerenderBody.tsx rendered every route inside
 * `<HelmetProvider context={{}}>` — an inline object literal. Helmet writes the
 * head it collects into that object during render, and nothing kept a reference
 * to it, so all of it was dropped on the floor. The visible symptom was that 23
 * pages rendered an FAQ on screen and shipped no FAQPage markup at all: the
 * schema existed only in the client-side DOM, which is precisely where a
 * crawler that does not execute JavaScript cannot see it. Course and
 * BreadcrumbList went the same way. One build now folds in 135 blocks that were
 * previously discarded.
 *
 * This asserts the wiring rather than the output, so it runs without a build.
 */
const read = (f: string) => readFileSync(resolve(process.cwd(), f), "utf8");
const prerender = read("scripts/prerenderBody.tsx");

describe("Helmet structured data reaches the built HTML", () => {
  it("holds a reference to the Helmet context instead of inlining it", () => {
    // The bug, exactly: an object literal passed straight into the prop.
    expect(prerender).not.toMatch(/<HelmetProvider\s+context=\{\{\s*\}\}>/);
    expect(prerender).toContain("const helmetContext");
    expect(prerender).toContain("context={helmetContext}");
  });

  it("extracts the JSON-LD Helmet collected", () => {
    expect(prerender).toContain("jsonLdFrom");
    expect(prerender).toContain("application");
    expect(prerender).toMatch(/helmet\?\.script/);
  });

  it("injects it into the head, not the body", () => {
    expect(prerender).toMatch(/replace\("<\/head>"/);
  });

  it("skips a block whose @type the head already carries", () => {
    // seoPrerender emits FAQPage by name for /, /intrebari-frecvente and
    // /en/faq. Folding Helmet's copy in on top of those would ship the same
    // block twice — the duplicate-head-tag bug this project already had once.
    expect(prerender).toContain("@type");
    expect(prerender).toMatch(/fresh|already present|twice/i);
  });

  it("only touches structured data, leaving title/meta/link to seoPrerender", () => {
    // seoPrerender owns those: it holds the length guards and the hreflang
    // reciprocity check. Emitting them from both sides duplicates them.
    const fn = prerender.slice(prerender.indexOf("function jsonLdFrom"));
    const body = fn.slice(0, fn.indexOf("\n}"));
    for (const tag of ["meta", "link", "title"]) {
      expect(body, `jsonLdFrom should not pull <${tag}>`).not.toMatch(
        new RegExp(`<${tag}[^a-z]`),
      );
    }
  });
});
