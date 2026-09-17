import { describe, expect, it } from "vitest";
import { searchPages, searchablePages, suggestFor } from "@/lib/pageFinder";
import { resolveRedirect } from "@/lib/redirects";
import { languageCounterpart } from "@/lib/languageRoutes";
import { seoRouteFor, hreflangPairs } from "@/lib/seoHead";
import { hasRoute } from "./helpers/routes";

/**
 * The 404 page and /te-ajutam guess what a lost visitor wanted. These
 * assertions pin the two things that would silently break the guess: the index
 * quietly losing pages, and a private route leaking into a recommendation.
 */
describe("page finder", () => {
  it("indexes a useful number of pages in both languages", () => {
    const pages = searchablePages();
    expect(pages.length).toBeGreaterThan(50);
    expect(pages.some((p) => p.lang === "ro")).toBe(true);
    expect(pages.some((p) => p.lang === "en")).toBe(true);
  });

  it("never recommends an admin, auth or checkout route", () => {
    const forbidden = /^\/(admin|auth|checkout)/;
    for (const p of searchablePages()) {
      expect(forbidden.test(p.path), `${p.path} is recommendable`).toBe(false);
    }
    for (const q of ["admin", "login", "checkout", "plata", "cont"]) {
      for (const lang of ["ro", "en"] as const) {
        for (const hit of searchPages(q, lang)) {
          expect(forbidden.test(hit.path), `search "${q}" returned ${hit.path}`).toBe(false);
        }
      }
    }
  });

  it("guesses the right page from addresses people actually mistype", () => {
    const cases: Array<[string, string]> = [
      ["/cursuri-pentru-copii", "/cursuri/copii"],
      ["/lectii-private", "/cursuri/private"],
      ["/blog/arabizi", "/arabizi"],
      ["/joaca-yalla", "/joc"],
    ];
    for (const [wrong, expected] of cases) {
      const hits = suggestFor(wrong).map((h) => h.path);
      expect(hits, `no suggestion for ${wrong}`).not.toHaveLength(0);
      expect(hits, `${wrong} did not suggest ${expected}`).toContain(expected);
    }
  });

  it("answers an English address in English", () => {
    const hits = suggestFor("/en/kids-arabic-course");
    expect(hits).not.toHaveLength(0);
    expect(hits.every((h) => h.lang === "en")).toBe(true);
  });

  it("searches by plain words", () => {
    expect(searchPages("copii", "ro").map((p) => p.path)).toContain("/cursuri/copii");
    expect(searchPages("private lessons", "en").length).toBeGreaterThan(0);
    expect(searchPages("", "ro")).toEqual([]);
  });
});

describe("the dedicated help page", () => {
  it("exists in both languages and pairs with itself", () => {
    expect(hasRoute("/te-ajutam")).toBe(true);
    expect(hasRoute("/en/find-your-page")).toBe(true);
    expect(languageCounterpart("/te-ajutam", "en")).toBe("/en/find-your-page");
    expect(languageCounterpart("/en/find-your-page", "ro")).toBe("/te-ajutam");
    expect(hreflangPairs().get("/te-ajutam")).toEqual({ ro: "/te-ajutam", en: "/en/find-your-page" });
  });

  it("carries indexable metadata", () => {
    for (const path of ["/te-ajutam", "/en/find-your-page"]) {
      const route = seoRouteFor(path);
      expect(route, `${path} has no metadata`).toBeTruthy();
      expect(route!.title.length).toBeGreaterThan(10);
      expect(route!.description.length).toBeGreaterThan(50);
      expect(route!.noindex).toBeFalsy();
      expect(route!.canonical).toBeFalsy();
    }
  });

  it("is a real page, not a redirect", () => {
    expect(resolveRedirect("/te-ajutam")).toBeFalsy();
    expect(resolveRedirect("/en/find-your-page")).toBeFalsy();
  });
});

describe("the 301 aliases still redirect", () => {
  it.each([
    ["/cursuri-araba", "/cursuri-limba-araba"],
    ["/joaca", "/joc"],
    ["/cursuri/online", "/cursuri"],
  ])("%s -> %s", (from, to) => {
    expect(resolveRedirect(from)).toBe(to);
  });
});
