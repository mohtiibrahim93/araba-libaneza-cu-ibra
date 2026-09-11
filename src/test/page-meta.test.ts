import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  CURSURI_ARABA_META,
  DESC_MAX,
  HOME_META,
  TITLE_MAX,
} from "@/lib/pageMeta";

/**
 * The homepage and /cursuri-araba were competing for the same query, and
 * /cursuri-araba was serving two different heads depending on whether the
 * crawler ran JavaScript. Both are structural mistakes that come back the
 * moment someone edits one copy of a string that exists twice.
 */
const read = (f: string) => readFileSync(resolve(process.cwd(), f), "utf8");

describe("page meta", () => {
  it("fits the SERP limits", () => {
    for (const [name, meta] of [
      ["home ro", HOME_META.ro],
      ["home en", HOME_META.en],
      ["cursuri-araba", CURSURI_ARABA_META],
    ] as const) {
      expect(meta.title.length, `${name} title`).toBeLessThanOrEqual(TITLE_MAX);
      expect(meta.description.length, `${name} description`).toBeLessThanOrEqual(DESC_MAX);
      expect(meta.title.length, `${name} title is empty`).toBeGreaterThan(10);
    }
  });

  it("is imported by the build script rather than written out again", () => {
    const src = read("scripts/seoPrerender.ts");
    expect(src).toContain('from "../src/lib/pageMeta"');
    expect(src).toContain("HOME_META.ro.title");
    expect(src).toContain("CURSURI_ARABA_META.title");
    // The old hard-coded strings must not survive anywhere in the route table.
    expect(src).not.toContain("Cursuri de Arabă Libaneză cu Profesor Nativ");
    expect(src).not.toContain("Cursuri de Arabă Libaneză în București și Online — Ibra");
  });

  it("is imported by the components rather than written out again", () => {
    expect(read("src/pages/seo/CursuriAraba.tsx")).toContain("CURSURI_ARABA_META.title");
    expect(read("src/lib/i18n.tsx")).toContain("HOME_META.ro.title");
  });

  it("stops the homepage and /cursuri-araba chasing the same query", () => {
    // Not a keyword rule — just that one of them is not a copy of the other,
    // which is what made Google choose between them.
    const home = HOME_META.ro.title.toLowerCase();
    const hub = CURSURI_ARABA_META.title.toLowerCase();
    expect(home).not.toBe(hub);
    // The homepage targets the local query and still carries the brand;
    // the hub stays on the generic category term.
    expect(home).toContain("bucurești");
    expect(home).toContain("ibra");
    expect(hub.startsWith("cursuri")).toBe(true);
    expect(hub).not.toContain("bucurești");
  });
});
