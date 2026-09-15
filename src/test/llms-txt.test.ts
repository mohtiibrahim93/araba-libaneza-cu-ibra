import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

/**
 * llms.txt has to describe the site, not its legal notices.
 *
 * The hand-written version listed four pages: the homepage, the privacy
 * policy, the terms and the unsubscribe page. Three of the four were pages
 * nobody would ever ask an assistant about, and not one course, guide or
 * article appeared. It is generated from the route registry now, and this
 * holds it to covering the actual offer.
 */
const txt = readFileSync(resolve(process.cwd(), "public/llms.txt"), "utf8");

describe("llms.txt", () => {
  it("lists the site, not a handful of legal pages", () => {
    const entries = txt.match(/^- \[/gm) ?? [];
    expect(entries.length).toBeGreaterThan(50);
  });

  it("covers courses, guides, blog and English", () => {
    for (const heading of ["## Cursuri", "## Ghiduri și resurse", "## Blog", "## English"]) {
      expect(txt).toContain(heading);
    }
  });

  it("names the pages that actually sell the courses", () => {
    for (const path of ["(/cursuri/grup)", "(/cursuri-limba-araba)", "(/cursuri/private)"]) {
      expect(txt).toContain(path);
    }
  });

  it("leaves out redirects and noindex pages", () => {
    // Signposts, not answers — same reason they stay out of the sitemap.
    for (const path of ["(/cursuri-araba)", "(/invata-araba)", "(/stergere-date)"]) {
      expect(txt).not.toContain(path);
    }
  });
});
