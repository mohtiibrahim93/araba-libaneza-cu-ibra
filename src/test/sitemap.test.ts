import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { allSeoRoutes } from "@/lib/seoHead";
import { buildSitemap, belongsInSitemap, blogIndexPages } from "@/lib/sitemap";

/**
 * The sitemap is generated from the route registry, not maintained by hand.
 *
 * It used to be written by the prerender pipeline. That retired with the move
 * to SSR and nothing replaced it, so the file silently became a manual
 * artefact: a new page was only listed if someone remembered, and nothing
 * failed when they didn't. These assertions are what "nothing enforces it"
 * was missing.
 */
const committed = () => readFileSync(resolve(process.cwd(), "public/sitemap.xml"), "utf8");
const locs = (xml: string) =>
  [...xml.matchAll(/<loc>https:\/\/centruldearabalibaneza\.com([^<]*)<\/loc>/g)].map((m) => m[1] ?? "");

describe("sitemap", () => {
  /**
   * Compared without <lastmod>. The dates come from git, which only
   * scripts/generateSitemap.ts can read, so the pure builder cannot reproduce
   * them — and a committed date is stale the moment someone edits a page
   * without regenerating the file. The deployed sitemap is always fresh anyway:
   * the build regenerates it before every deploy. Structure is what this holds.
   */
  const withoutDates = (xml: string) => xml.replace(/^ {4}<lastmod>[^<]*<\/lastmod>\n/gm, "");

  it("matches what the generator produces", () => {
    // Fails when a page was added without running the build. Run `bun run sitemap`.
    expect(withoutDates(committed())).toBe(withoutDates(buildSitemap()));
  });

  it("dates the pages it lists, and dates them differently", () => {
    // A lastmod on every URL with the same value is what a crawler ignores.
    const dates = [...committed().matchAll(/^ {4}<lastmod>([^<]*)<\/lastmod>$/gm)].map((m) => m[1]!);
    expect(dates.length).toBeGreaterThan(100);
    expect(new Set(dates).size).toBeGreaterThan(10);
    for (const d of dates) expect(d).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it("lists the blog index beyond page one", () => {
    // Nine of the twenty articles are listed together only there.
    for (const path of ["/blog?page=2", "/en/blog?page=2"]) {
      expect(locs(committed()), `${path} missing`).toContain(path);
    }
  });

  it("lists every indexable route", () => {
    const listed = new Set(locs(committed()));
    const missing = allSeoRoutes().filter((r) => belongsInSitemap(r) && !listed.has(r.path));
    expect(missing.map((r) => r.path)).toEqual([]);
  });

  it("excludes routes that canonicalise elsewhere, and noindex routes", () => {
    // A retired alias in the sitemap asks to be indexed and then points away;
    // a noindex page in the sitemap asks to be indexed and then refuses.
    const listed = new Set(locs(committed()));
    const wrong = allSeoRoutes().filter((r) => !belongsInSitemap(r) && listed.has(r.path));
    expect(wrong.map((r) => r.path)).toEqual([]);
  });

  it("lists nothing that is not a route", () => {
    const paths = new Set(allSeoRoutes().map((r) => r.path));
    // The paginated blog index is not a route of its own — /blog and ?page= are
    // one route — but each page is self-canonical and lists articles nothing
    // else lists together, so it is listed deliberately.
    for (const extra of blogIndexPages()) paths.add(extra);
    expect(locs(committed()).filter((p) => !paths.has(p))).toEqual([]);
  });
});
