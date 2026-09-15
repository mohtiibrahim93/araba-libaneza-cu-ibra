import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { allSeoRoutes } from "@/lib/seoHead";
import { buildSitemap, belongsInSitemap } from "@/lib/sitemap";

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
  it("matches what the generator produces", () => {
    // Fails when a page was added without running the build. Run `bun run sitemap`.
    expect(committed()).toBe(buildSitemap());
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
    expect(locs(committed()).filter((p) => !paths.has(p))).toEqual([]);
  });
});
