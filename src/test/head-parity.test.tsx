import { cleanup, waitFor } from "@testing-library/react";
import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { renderRoute } from "./helpers/appRouter";
import { seoHead } from "@/lib/seoHead";
import { BLOG_POSTS } from "@/lib/blogPosts";

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
 * Blog posts only, because that is where the duplication lived. The bilingual
 * pages resolve their head from the UI language and are checked elsewhere.
 */
const titleFor = (path: string) => seoHead(path).meta?.find((m) => "title" in m)?.["title"];

describe("server head and runtime head agree", () => {
  beforeEach(() => {
    window.localStorage.setItem("site-language", "ro");
  });

  afterEach(cleanup);

  it("has a title for every blog post in the route table", () => {
    for (const post of BLOG_POSTS) {
      expect(titleFor(`/blog/${post.slug}`), `no head for /blog/${post.slug}`).toBeTruthy();
    }
  });

  it.each(BLOG_POSTS.map((p) => p.slug))("/blog/%s renders the head it was served", async (slug) => {
    const expected = titleFor(`/blog/${slug}`);
    renderRoute(`/blog/${slug}`);
    await waitFor(() => expect(document.title).toBe(expected));
  });
});
