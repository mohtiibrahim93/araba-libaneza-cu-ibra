import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

/**
 * A page must never carry both rel=canonical and noindex.
 *
 * The two are contradictory instructions. A canonical says "this URL and the
 * target are the same page, merge their signals into the target"; noindex says
 * "drop this URL". Google honours the noindex, and a page it has dropped is a
 * page whose canonical it never processes — so the consolidation is lost along
 * with any links the retired URL had earned. Google has also documented the
 * noindex propagating along the canonical to the target, which would put the
 * live page at risk from its own alias.
 *
 * Retired aliases keep the canonical and are kept out of the sitemap instead.
 * Genuinely private pages (/stergere-date) keep noindex and have no canonical.
 */
const src = readFileSync(resolve(process.cwd(), "scripts/seoPrerender.ts"), "utf8");

describe("canonical and noindex are never combined", () => {
  const routeLines = src
    .split("\n")
    .filter((l) => /^\s*\{ path: "/.test(l));

  it("finds the route table", () => {
    expect(routeLines.length).toBeGreaterThan(40);
  });

  it("has no route declaring both", () => {
    const both = routeLines
      .filter((l) => l.includes("canonical:") && l.includes("noindex: true"))
      .map((l) => l.match(/path: "([^"]+)"/)?.[1] ?? l.trim());
    expect(both, both.join(", ")).toEqual([]);
  });

  it("keeps noindex only where there is no canonical to contradict", () => {
    const noindexed = routeLines
      .filter((l) => l.includes("noindex: true"))
      .map((l) => l.match(/path: "([^"]+)"/)?.[1] ?? "?");
    // Private pages only — never a duplicate that should consolidate elsewhere.
    expect(noindexed).toEqual(["/stergere-date"]);
  });

  it("still gives every retired alias a canonical", () => {
    for (const alias of [
      "/cursuri/privat",
      "/cursuri/tineri",
      "/cursuri/online",
      "/cursuri-limba-araba",
      "/en/learn-levantine-arabic",
      "/en/levantine-arabic-dialects-map",
    ]) {
      const line = routeLines.find((l) => l.includes(`path: "${alias}"`));
      expect(line, `${alias} missing from the route table`).toBeTruthy();
      expect(line, `${alias} lost its canonical`).toContain("canonical:");
    }
  });
});
