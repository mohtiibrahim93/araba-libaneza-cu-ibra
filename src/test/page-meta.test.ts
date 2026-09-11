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

  it("keeps the four course-intent pages off each other's query", () => {
    // Four pages, four intents (see the note in src/lib/pageMeta.ts):
    //   /                        brand, teacher, overview
    //   /cursuri-limba-araba     the category term — courses, levels, prices
    //   /cursuri/grup            the list of group cohorts
    //   /cursuri-araba-bucuresti the local query
    //
    // This used to compare only the first two, and the homepage title drifted
    // onto "Cursuri de arabă în București" — the Bucharest page's entire
    // reason to exist — without a single test failing. Hence all four.
    const prerender = read("scripts/seoPrerender.ts");
    const titleOf = (path: string) => {
      const line = prerender
        .split("\n")
        .find((l) => l.trimStart().startsWith(`{ path: "${path}"`));
      expect(line, `no prerender entry for ${path}`).toBeDefined();
      return (line!.match(/title: "([^"]*)"/)?.[1] ?? "").toLowerCase();
    };

    const home = HOME_META.ro.title.toLowerCase();
    const hub = CURSURI_ARABA_META.title.toLowerCase();
    const local = titleOf("/cursuri-araba-bucuresti");
    const list = titleOf("/cursuri/grup");

    // All four distinct.
    expect(new Set([home, hub, local, list]).size).toBe(4);

    // The local query belongs to the Bucharest page, and leads its title.
    expect(local.startsWith("cursuri arabă bucurești")).toBe(true);

    // The homepage leads on the brand, not on the course or the city.
    expect(home.startsWith("arabă libaneză cu ibra")).toBe(true);
    expect(home.startsWith("cursuri")).toBe(false);

    // The hub leads on the category term and stays off the city.
    expect(hub.startsWith("cursuri")).toBe(true);
    expect(hub).not.toContain("bucurești");

    // Only one of them may open on the city.
    const leadsOnCity = [home, hub, local, list].filter((t) => t.startsWith("cursuri arabă bucurești"));
    expect(leadsOnCity).toEqual([local]);
  });
});
