import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { blogPostsNewestFirst } from "@/lib/blogPosts";

/**
 * Every article must be linked from other articles, not just from the index.
 *
 * "Read next" used to show the three newest posts on every article, so those
 * three held a link from all nineteen and the remaining sixteen had exactly
 * one internal link each — the blog index. A live crawl of all 121 sitemap
 * URLs found them at 1 to 3 inbound links, which is the shape Search Console
 * files under "Discovered, currently not indexed".
 *
 * The component now walks a ring, so this reproduces that arithmetic rather
 * than rendering nineteen pages: whatever the rule becomes, no post may fall
 * below three inbound links, and none may hoard them.
 */
const ring = (slug: string) => {
  const all = blogPostsNewestFirst;
  const here = all.findIndex((p) => p.slug === slug);
  const start = here === -1 ? 0 : here + 1;
  return Array.from({ length: Math.min(3, Math.max(all.length - 1, 0)) }, (_, i) => all[(start + i) % all.length]!)
    .filter((p) => p.slug !== slug)
    .map((p) => p.slug);
};

describe("related posts spread their links", () => {
  const slugs = blogPostsNewestFirst.map((p) => p.slug);

  it("has posts to work with", () => {
    expect(slugs.length).toBeGreaterThan(10);
  });

  it("links every post from at least three others", () => {
    const inbound = new Map(slugs.map((s) => [s, 0]));
    for (const s of slugs) for (const t of ring(s)) inbound.set(t, (inbound.get(t) ?? 0) + 1);
    const starved = [...inbound.entries()].filter(([, n]) => n < 3);
    expect(starved.map(([s, n]) => `${s} (${n})`)).toEqual([]);
  });

  it("gives no post more than its share", () => {
    const inbound = new Map(slugs.map((s) => [s, 0]));
    for (const s of slugs) for (const t of ring(s)) inbound.set(t, (inbound.get(t) ?? 0) + 1);
    // A ring is exactly even; the cap leaves room for a future tag-aware tweak
    // without letting the old "three newest for everyone" pattern back in.
    expect(Math.max(...inbound.values())).toBeLessThanOrEqual(6);
  });

  it("never links an article to itself", () => {
    for (const s of slugs) expect(ring(s), s).not.toContain(s);
  });

  it("reads the ring off the component, not a copy of the list", () => {
    // If the component stops using the registry this test stops being evidence.
    const src = readFileSync(resolve(process.cwd(), "src/components/blog/RelatedPosts.tsx"), "utf8");
    expect(src).toContain("blogPostsNewestFirst");
    expect(src).toContain("% all.length");
  });
});
