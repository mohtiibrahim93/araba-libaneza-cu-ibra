import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { hasRoute, redirectsTo } from "./helpers/routes";

/**
 * The four URLs that used to be second copies of the courses hub.
 *
 * /cursuri-araba rendered a byte-identical body (an audit put the two at
 * Jaccard 1.00). The other three each covered a slice the hub already covers —
 * learning from zero, starting as a beginner, learning online — and all three
 * named /en/learn-lebanese-arabic as their English twin, which is the page the
 * hub itself pairs with. By the site's own language mapping they were the hub
 * under other names, so they were competing with it on the same queries.
 *
 * Their unique answers were merged into src/data/faq.ts and the hub's own
 * "București vs online" section before the pages were deleted. The URLs stay
 * alive as redirects, keeping whatever links they had earned.
 *
 * This guards the deletion: re-adding any of them as a rendered page would
 * quietly recreate the duplication.
 */
const RETIRED = [
  "/cursuri-araba",
  "/invata-araba",
  "/araba-pentru-incepatori",
  "/araba-online",
];

const prerender = readFileSync(resolve(process.cwd(), "src/lib/seoHead.ts"), "utf8");
const sitemap = readFileSync(resolve(process.cwd(), "public/sitemap.xml"), "utf8");

describe("retired duplicates of the courses hub", () => {
  it.each(RETIRED)("%s redirects instead of rendering a page", (path) => {
    expect(hasRoute(path), `no route declared for ${path}`).toBe(true);
    expect(redirectsTo(path), `${path} should redirect to the hub`).toBe("/cursuri-limba-araba");
  });

  it.each(RETIRED)("%s canonicalises to the hub", (path) => {
    const line = prerender
      .split("\n")
      .find((l) => l.trimStart().startsWith(`{ path: "${path}"`));
    expect(line, `no head entry for ${path}`).toBeDefined();
    expect(line).toContain('canonical: "/cursuri-limba-araba"');
  });

  it.each(RETIRED)("%s stays out of the sitemap", (path) => {
    expect(sitemap).not.toContain(`<loc>https://centruldearabalibaneza.com${path}</loc>`);
  });

  it("the hub itself is self-canonical and in the sitemap", () => {
    const line = prerender
      .split("\n")
      .find((l) => l.trimStart().startsWith('{ path: "/cursuri-limba-araba"'));
    expect(line).toBeDefined();
    expect(line).not.toContain("canonical:");
    expect(sitemap).toContain("<loc>https://centruldearabalibaneza.com/cursuri-limba-araba</loc>");
  });

  it("no surviving page still links to a retired URL", () => {
    // A link to a redirect costs the visitor a hop and tells Google the URL is
    // still a destination. The merge repointed them all at the hub.
    const pages = import.meta.glob("../pages/**/*.tsx", { eager: true, query: "?raw", import: "default" });
    // Guard the guard: an empty glob would make this assertion vacuous.
    expect(Object.keys(pages).length).toBeGreaterThan(50);
    const offenders: string[] = [];
    for (const [file, body] of Object.entries(pages as Record<string, string>)) {
      for (const path of RETIRED) {
        if ((body as string).includes(`to="${path}"`)) offenders.push(`${file} -> ${path}`);
      }
    }
    expect(offenders).toEqual([]);
  });
});

describe("other retired addresses", () => {
  /**
   * /arabizi-pentru-incepatori was the Arabizi guide's first URL. Its redirect
   * lived only in the old prerender script, so disconnecting that script left
   * the address rendering the 404 view — invisible on the site (nothing links
   * to it, it is not in the sitemap) but a dead end for old external links.
   */
  it("/arabizi-pentru-incepatori redirects to the Arabizi guide", () => {
    expect(hasRoute("/arabizi-pentru-incepatori")).toBe(true);
    expect(redirectsTo("/arabizi-pentru-incepatori")).toBe("/arabizi");
  });

  it("/arabizi-pentru-incepatori stays out of the sitemap", () => {
    expect(sitemap).not.toContain(
      "<loc>https://centruldearabalibaneza.com/arabizi-pentru-incepatori</loc>",
    );
  });
});

