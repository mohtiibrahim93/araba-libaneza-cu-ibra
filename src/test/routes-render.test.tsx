import { screen, cleanup, waitFor } from "@testing-library/react";
import { describe, expect, it, afterEach, beforeAll, vi } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { renderRoute, currentPath } from "./helpers/appRouter";
import { routeFiles, redirectsTo } from "./helpers/routes";

/**
 * Smoke test for every publicly reachable content route.
 *
 * The site is a prerendered SPA: if a page throws on render, the build still
 * succeeds and the static <head> is still written, so a broken page ships
 * looking perfectly healthy to every check we have except an actual visit.
 * This mounts each route through the real route tree — same providers, same
 * lazy imports, same router — and asserts it paints an <h1>.
 *
 * Routes are read from the sitemap so a new page is covered the moment it is
 * published, without anyone remembering to add it here.
 */
const BASE = "https://centruldearabalibaneza.com";

const routes = (() => {
  const xml = readFileSync(resolve(process.cwd(), "public/sitemap.xml"), "utf8");
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)]
    .map((m) => (m[1] ?? "").replace(BASE, "") || "/")
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
    renderRoute(route);
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
  ["/cursuri/tineri", "adolescen"],
];

/**
 * Retired URLs that serve content instead of redirecting. Consolidation then
 * rests entirely on the canonical, so that is what gets asserted — the earlier
 * version of this test checked for a redirect, which pinned the mechanism
 * rather than the outcome and broke the moment the mechanism changed.
 */
const CANONICALISED_ALIASES: [from: string, canonical: string][] = [
  // The hub moved: /cursuri-limba-araba carries the content because its slug
  // matches far more of the site's real query set, and /cursuri-araba is now
  // the retired URL kept alive for old inbound links.
  ["/cursuri-araba", "https://centruldearabalibaneza.com/cursuri-limba-araba"],
];

describe("retired URLs still redirect", () => {
  it.each(REDIRECTS)("%s lands on a real page", async (from, expected) => {
    window.localStorage.setItem("site-language", from.startsWith("/en/") ? "en" : "ro");
    const { router } = renderRoute(from);
    const h1 = await screen.findByRole("heading", { level: 1 }, { timeout: 8000 });
    expect(h1.textContent).toContain(expected);
    expect(currentPath(router)).not.toBe(from);
  });
});

/**
 * The dialect maps are Creative Commons licensed, and both CC BY and CC BY-SA
 * permit reuse only with attribution. The credit is a required prop on
 * CreditedFigure, but a required prop still can't stop someone deleting the
 * whole figure; this asserts the rendered page actually carries the image and
 * its credit.
 */
describe("licensed images keep their attribution", () => {
  it.each([
    ["/en/arabic-dialects-guide", "en", "Rafy"],
    ["/dialecte-arabe", "ro", "Rafy"],
  ])("%s credits the dialect map", async (route, lang, author) => {
    window.localStorage.setItem("site-language", lang);
    const { container } = renderRoute(route);
    await screen.findByRole("heading", { level: 1 }, { timeout: 8000 });
    const img = container.querySelector('img[src*="arabic-dialects-map"]');
    expect(img).toBeTruthy();
    expect(img?.getAttribute("alt")?.length ?? 0).toBeGreaterThan(20);
    const fig = img?.closest("figure");
    expect(fig?.textContent).toContain(author);
    expect(fig?.querySelector('a[href*="creativecommons.org"]')).toBeTruthy();
    expect(fig?.querySelector('a[href*="commons.wikimedia.org"]')).toBeTruthy();
  });
});

/**
 * The outline reads headings from the rendered DOM and assigns ids to any that
 * lack them, so it works across twenty articles that were written by hand and
 * across CMS-published Markdown bodies. If the scan ever stops finding
 * headings, articles quietly lose their navigation with nothing else failing.
 */
describe("blog articles get a working outline", () => {
  it.each([
    ["/blog/cum-inveti-araba-libaneza", "ro"],
  ])("%s builds an outline whose links resolve", async (route, lang) => {
    window.localStorage.setItem("site-language", lang);
    const { container } = renderRoute(route);
    await screen.findByRole("heading", { level: 1 }, { timeout: 8000 });
    // The outline is built in an effect after paint, so it lands a tick later
    // than the h1 the wait above resolves on.
    const nav = await waitFor(() => {
      const n = container.querySelector('nav[aria-label="Cuprins"], nav[aria-label="On this page"]');
      expect(n).toBeTruthy();
      return n!;
    });
    const links = [...nav.querySelectorAll("a[href^='#']")];
    expect(links.length).toBeGreaterThan(1);
    // Every entry must point at a heading that actually exists on the page.
    for (const a of links) {
      const id = a.getAttribute("href")!.slice(1);
      expect(container.querySelector(`[id="${id}"]`)).toBeTruthy();
    }
  });
});

/**
 * The Organization and WebSite nodes ship in index.html, so they are in the
 * static HTML. Every other entity — LocalBusiness, Course, BreadcrumbList,
 * FAQPage — is emitted by Helmet at runtime, which means this relationship is
 * only ever visible to a crawler that executes JavaScript. Asserting it here is
 * the only place it can be checked.
 */
describe("structured data links the business to the organisation", () => {
  it.each([
    ["/", "https://centruldearabalibaneza.com/#localbusiness"],
    ["/cursuri-araba-bucuresti", "https://centruldearabalibaneza.com/cursuri-araba-bucuresti#localbusiness"],
  ])("%s declares a LocalBusiness owned by #organization", async (route, expectedId) => {
    window.localStorage.setItem("site-language", "ro");
    const { container } = renderRoute(route);
    await screen.findByRole("heading", { level: 1 }, { timeout: 8000 });

    const local = await waitFor(() => {
      const found = [...document.querySelectorAll('script[type="application/ld+json"]')]
        .map((s) => {
          try { return JSON.parse(s.textContent || "{}"); } catch { return {}; }
        })
        .find((d) => d["@type"] === "LocalBusiness");
      expect(found).toBeTruthy();
      return found!;
    });

    expect(local["@id"]).toBe(expectedId);
    expect(local.parentOrganization?.["@id"]).toBe("https://centruldearabalibaneza.com/#organization");
  });
});

describe("retired URLs that render instead of redirecting", () => {
  it.each(CANONICALISED_ALIASES)("%s serves content but canonicalises away", async (from, canonical) => {
    window.localStorage.setItem("site-language", "ro");
    const { container } = renderRoute(from);
    const h1 = await screen.findByRole("heading", { level: 1 }, { timeout: 8000 });
    expect(h1.textContent?.trim().length ?? 0).toBeGreaterThan(0);

    const link = await waitFor(() => {
      const el = document.querySelector('link[rel="canonical"]');
      expect(el).toBeTruthy();
      return el!;
    });
    expect(link.getAttribute("href")).toBe(canonical);
  });
});

/**
 * A trial is only real once a slot is chosen. Step 1 records the person as
 * "incomplete" so the record is kept without polluting the bookings list, and
 * booking-create promotes them once they pick a time. Both halves of that
 * contract are easy to break silently — the previous version used a marker
 * string in a free-text notes field, which is exactly how abandoned step-1
 * entries ended up looking like genuine bookings.
 */
describe("trial step 1 does not look like a booking", () => {
  it("records the lead as incomplete, not as a new lead", () => {
    const trial = readFileSync(resolve(process.cwd(), "src/pages/Trial.tsx"), "utf8");
    expect(trial).toContain('lead_status: "incomplete"');
    expect(trial).not.toContain("NEALES");
  });

  it("promotes the lead to a real one only when a slot is booked", () => {
    const fn = readFileSync(
      resolve(process.cwd(), "supabase/functions/booking-create/index.ts"),
      "utf8",
    );
    expect(fn).toContain('.eq("lead_status", "incomplete")');
    expect(fn).toMatch(/update\(\{\s*lead_status:\s*"new"/);
  });

  it("keeps incomplete leads out of the admin's default list", () => {
    const admin = readFileSync(resolve(process.cwd(), "src/pages/Admin.tsx"), "utf8");
    expect(admin).toContain('status !== "incomplete"');
  });
});

/**
 * Every public page must be reachable from the site chrome, not only from a
 * link buried in some other page's body. A page that exists, is indexed and is
 * linked from nowhere in the nav or footer is a page visitors cannot find.
 *
 * The exceptions are listed explicitly rather than pattern-matched, so adding
 * one is a deliberate act that shows up in review.
 */
describe("site structure", () => {
  it("links every public page from the nav or the footer", () => {
    const read = (p: string) => readFileSync(resolve(process.cwd(), p), "utf8");
    // siteNav.ts counts as chrome: the navbar menus render from it, and they
    // render into the served HTML now, so a page listed there is as reachable
    // as one written into the footer by hand. Before that was true the footer
    // had to duplicate all seventeen of those links to satisfy this guard.
    const chrome = new Set(
      [...read("src/components/Navbar.tsx").matchAll(/"(\/[a-z0-9\-/]+)"/g),
       ...read("src/lib/siteNav.ts").matchAll(/"(\/[a-z0-9\-/]+)"/g),
       ...read("src/components/Footer.tsx").matchAll(/"(\/[a-z0-9\-/]+)"/g)].map((m) => m[1]),
    );
    const routes = routeFiles()
      .map((r) => r.path)
      .filter((p) => !p.includes("$") && !p.startsWith("/lovable/"));
    const redirects = new Set(routes.filter((p) => redirectsTo(p) !== undefined));

    // Admin, auth and pages you only reach by completing an action.
    const PRIVATE = new Set([
      "/admin", "/admin/notifications", "/auth", "/checkout", "/thank-you",
      "/payment-status", "/unsubscribe", "/stergere-date", "/private-status", "/booking/manage",
    ]);
    // Kept alive for old inbound links; canonicalises to /cursuri-limba-araba,
    // so linking it from the chrome would promote a URL that disclaims itself.
    // The two swapped roles when the hub moved: the slug carrying "limba araba"
    // matches far more of the site's real query set.
    const ALIASES = new Set(["/cursuri-araba"]);

    const orphans = routes.filter(
      (p) =>
        p !== "/" &&
        p.split("/").length === 2 &&
        !redirects.has(p) &&
        !PRIVATE.has(p) &&
        !ALIASES.has(p) &&
        !chrome.has(p),
    );
    expect(orphans).toEqual([]);
  });

  it("does not link the same destination twice in the footer", () => {
    const foot = readFileSync(resolve(process.cwd(), "src/components/Footer.tsx"), "utf8");
    const links = [...foot.matchAll(/"(\/[a-z0-9\-/]+)"/g)].map((m) => m[1]);
    const dupes = links.filter((l, i) => links.indexOf(l) !== i);
    expect([...new Set(dupes)]).toEqual([]);
  });
});

describe("hreflang is only announced for a real reciprocal twin", () => {
  // A page that names itself as its own English version tells Google the two
  // languages are the same URL. CourseLayout used to do exactly that on the
  // four /cursuri/* pages, and a crawl flagged it as "One page is linked for
  // more than one language".
  const emitters = [
    "src/components/course/CourseLayout.tsx",
    "src/components/seo/LandingLayout.tsx",
  ];

  it.each(emitters)("%s never points ro and en at the same href", (file) => {
    const src = readFileSync(resolve(process.cwd(), file), "utf8");
    const hrefFor = (lang: string) =>
      src.match(new RegExp(`hrefLang="${lang}"\\s+href=\\{([^}]+)\\}`))?.[1]?.trim();
    const ro = hrefFor("ro");
    const en = hrefFor("en");
    if (!ro && !en) return; // emits no hreflang at all — fine.
    expect(ro).toBeDefined();
    expect(en).toBeDefined();
    expect(en).not.toBe(ro);
  });
});
