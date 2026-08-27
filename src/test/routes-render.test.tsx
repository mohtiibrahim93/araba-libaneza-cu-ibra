import { render, screen, cleanup } from "@testing-library/react";
import { describe, expect, it, afterEach, beforeAll, vi } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { HelmetProvider } from "react-helmet-async";
import App from "@/App";

/**
 * Smoke test for every publicly reachable content route.
 *
 * The site is a prerendered SPA: if a page throws on render, the build still
 * succeeds and the static <head> is still written, so a broken page ships
 * looking perfectly healthy to every check we have except an actual visit.
 * This renders each route through the real App tree — same providers, same
 * lazy imports, same router — and asserts it paints an <h1>.
 *
 * Routes are read from the sitemap so a new page is covered the moment it is
 * published, without anyone remembering to add it here.
 */
const BASE = "https://centruldearabalibaneza.com";

const routes = (() => {
  const xml = readFileSync(resolve(process.cwd(), "public/sitemap.xml"), "utf8");
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)]
    .map((m) => m[1].replace(BASE, "") || "/")
    .map((p) => (p.length > 1 ? p.replace(/\/$/, "") : p));
})();

beforeAll(() => {
  // Every page is offline here; keep failed queries quiet and instant.
  vi.spyOn(console, "error").mockImplementation(() => {});
  window.localStorage.setItem("site-language", "ro");
});

afterEach(cleanup);

describe("every sitemap route renders", () => {
  it("covers a realistic number of routes", () => {
    expect(routes.length).toBeGreaterThan(50);
  });

  it.each(routes)("%s paints an h1", async (route) => {
    window.history.pushState({}, "", route);
    // HelmetProvider lives in main.tsx, above App — mirror that nesting.
    render(
      <HelmetProvider>
        <App />
      </HelmetProvider>,
    );
    const h1 = await screen.findByRole("heading", { level: 1 }, { timeout: 8000 });
    expect(h1).toBeInTheDocument();
    expect(h1.textContent?.trim().length ?? 0).toBeGreaterThan(0);
  });
});

/**
 * Retired URLs are kept alive as client-side redirects so old inbound links and
 * bookmarks still land somewhere useful. If one of these silently stops
 * redirecting, the URL 404s into the SPA catch-all and nothing else notices.
 */
const REDIRECTS: [from: string, toHeadingContains: string][] = [
  ["/en/learn-levantine-arabic", "Lebanese Arabic"],
  ["/en/levantine-arabic-dialects-map", "Arabic dialects"],
  ["/cursuri/privat", "Private"],
  ["/cursuri-limba-araba", "arabă"],
  ["/cursuri/tineri", "adolescen"],
];

describe("retired URLs still redirect", () => {
  it.each(REDIRECTS)("%s lands on a real page", async (from, expected) => {
    window.localStorage.setItem("site-language", from.startsWith("/en/") ? "en" : "ro");
    window.history.pushState({}, "", from);
    render(
      <HelmetProvider>
        <App />
      </HelmetProvider>,
    );
    const h1 = await screen.findByRole("heading", { level: 1 }, { timeout: 8000 });
    expect(h1.textContent).toContain(expected);
    expect(window.location.pathname).not.toBe(from);
  });
});
