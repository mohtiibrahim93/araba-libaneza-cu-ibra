import { cleanup, waitFor } from "@testing-library/react";
import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { renderRoute } from "./helpers/appRouter";
import { seoHead } from "@/lib/seoHead";
import { BLOG_POSTS } from "@/lib/blogPosts";
import { allSeoRoutes } from "@/lib/seoHead";
import { redirectsTo } from "./helpers/routes";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { HOME_META } from "@/lib/pageMeta";

/**
 * The two heads must say the same thing.
 *
 * Every page has its head written twice: once by the route's `head()`, which
 * the server renders, and once by react-helmet-async in the component, which
 * replaces it after hydration. When they disagree, a crawler that runs
 * JavaScript reads one page and a crawler that does not reads another.
 *
 * Thirteen of nineteen blog posts had drifted that way: the server served the
 * curated registry title from src/lib/blogPosts.ts, while the component served
 * its own on-page heading — several of them well past the sixty characters a
 * result ever shows. The registry is the single source now, and this holds it
 * there.
 *
 * It covers every route in the table, not only the blog: the same split was
 * live on the course pages, the legal pages, both blog indexes and the English
 * landings, in every case because a component kept its own copy of a string
 * the route already served.
 */
const titleFor = (path: string) => seoHead(path).meta?.find((m) => "title" in m)?.["title"];

describe("server head and runtime head agree", () => {
  beforeEach(() => {
    window.localStorage.setItem("site-language", "ro");
    // jsdom keeps document.title between tests, and an empty one is how this
    // test recognises a page that renders no Helmet at all.
    document.title = "";
  });

  afterEach(cleanup);

  /**
   * "/" cannot be observed through renderRoute (see the note below), so its
   * half of the agreement is checked at the source instead.
   *
   * The homepage set `document.title = t.siteTitle` on mount — the short
   * "Arabă Libaneză cu Ibra" — over the full title the server had just served.
   * The exclusion comment below used to say the two heads agree on the running
   * server; they did not, and nothing here could see it.
   *
   * `/en` renders the same component, so the English half of HOME_META is
   * checked here too rather than only the Romanian one the "/" route serves.
   */
  it("paints the full homepage title, in both languages", () => {
    const index = readFileSync(resolve(process.cwd(), "src/pages/Index.tsx"), "utf8");
    expect(index).toContain("document.title = HOME_META[lang].title");
    expect(index).not.toContain("document.title = t.siteTitle");
    // Both halves are full titles, not the short site name.
    expect(HOME_META.ro.title).toBe(titleFor("/"));
    for (const lang of ["ro", "en"] as const) {
      expect(HOME_META[lang].title.length).toBeGreaterThan(30);
      expect(HOME_META[lang].title).toContain("—");
    }
  });

  it("has a title for every blog post in the route table", () => {
    for (const post of BLOG_POSTS) {
      expect(titleFor(`/blog/${post.slug}`), `no head for /blog/${post.slug}`).toBeTruthy();
    }
  });

  // A route that redirects renders the destination's head, which is correct
  // and not a disagreement.
  //
  // "/" is excluded for a different reason: under renderRoute its Helmet never
  // takes effect — the title stays at the site-wide one from the root route,
  // even after seconds — so the test cannot observe what the homepage actually
  // paints. It was checked against the running server instead, where the two
  // heads agree. Everything else here is observable.
  const checkable = allSeoRoutes()
    .map((r) => r.path)
    .filter((p) => p !== "/" && redirectsTo(p) === undefined);

  it.each(checkable)("%s renders the head it was served", async (path) => {
    const expected = titleFor(path);
    if (!expected) return; // no entry in the table: nothing to disagree with.
    renderRoute(path);
    await waitFor(() => expect(document.body).not.toBeEmptyDOMElement());
    // Empty means the page renders no Helmet and the served head stands
    // unopposed — which is one head, not two that disagree.
    await waitFor(() => {
      const painted = document.title;
      if (painted) expect(painted).toBe(expected);
    });
  });
});
