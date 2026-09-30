import { describe, expect, it } from "vitest";
import { readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { BLOG_POSTS } from "@/lib/blogPosts";
import { languageCounterpart } from "@/lib/languageRoutes";

/**
 * BLOG_POSTS is the registry the index and the related-posts lists read, while
 * each article owns its own body and route file. Nothing ties the two together
 * at build time, so they can drift apart silently and in both directions: an
 * article with no registry entry is live but unreachable from the index, and a
 * registry entry with no route file is a card linking to a 404.
 *
 * Neither failure shows up in a type check or a render test, and both are the
 * kind of thing that happens while moving posts around rather than while
 * writing one.
 *
 * Redirect stubs are excluded deliberately. /blog/learn-lebanese-arabic is a
 * route file that only throws a 301 to the article that replaced it — it keeps
 * an indexed URL alive and correctly has no registry entry, no head and no
 * sitemap row. A check that does not know about them reports the redirect as a
 * missing article, which is what this one did on its first run.
 */
const ROUTE_DIR = "src/routes/blog";

const routeSlugs = readdirSync(resolve(process.cwd(), ROUTE_DIR))
  .filter((f) => f.endsWith(".tsx") && f !== "index.tsx")
  .filter((f) => !readFileSync(resolve(process.cwd(), ROUTE_DIR, f), "utf8").includes("throw redirect("))
  .map((f) => f.replace(/\.tsx$/, ""));

describe("the blog registry and the routes agree", () => {
  it("has posts to check", () => {
    expect(BLOG_POSTS.length).toBeGreaterThan(10);
    expect(routeSlugs.length).toBeGreaterThan(10);
  });

  it("gives every article a route file", () => {
    const missing = BLOG_POSTS.map((p) => p.slug).filter((s) => !routeSlugs.includes(s));
    expect(missing, `registry entries with no page: ${missing.join(", ")}`).toEqual([]);
  });

  it("gives every article page a registry entry", () => {
    const slugs = BLOG_POSTS.map((p) => p.slug);
    const orphans = routeSlugs.filter((s) => !slugs.includes(s));
    expect(orphans, `pages missing from the index: ${orphans.join(", ")}`).toEqual([]);
  });

  it("keeps slugs unique", () => {
    const slugs = BLOG_POSTS.map((p) => p.slug);
    const dupes = [...new Set(slugs.filter((s, i) => slugs.indexOf(s) !== i))];
    expect(dupes, `duplicate slugs: ${dupes.join(", ")}`).toEqual([]);
  });

  it("writes every card in both languages", () => {
    const bad: string[] = [];
    for (const p of BLOG_POSTS) {
      for (const field of ["title", "description", "tag"] as const) {
        const v = p[field];
        if (!v?.ro?.trim()) bad.push(`${p.slug}: ${field}.ro is empty`);
        if (!v?.en?.trim()) bad.push(`${p.slug}: ${field}.en is empty`);
        // A tag may legitimately be the same word in both languages; a title or
        // a description that matches is a translation nobody wrote.
        if (field !== "tag" && v?.ro && v.ro === v.en) bad.push(`${p.slug}: ${field} is untranslated`);
      }
    }
    expect(bad, bad.join("\n")).toEqual([]);
  });

  it("dates every article, in the past", () => {
    const bad = BLOG_POSTS.filter(
      (p) => !/^\d{4}-\d{2}-\d{2}/.test(p.published) || new Date(p.published) > new Date(),
    ).map((p) => `${p.slug} (${p.published})`);
    expect(bad, `bad or future publish dates: ${bad.join(", ")}`).toEqual([]);
  });

  it("points every consolidation at a real article, once", () => {
    const slugs = BLOG_POSTS.map((p) => p.slug);
    const bad: string[] = [];
    for (const p of BLOG_POSTS) {
      if (!p.canonicalTo) continue;
      if (p.canonicalTo === p.slug) bad.push(`${p.slug} canonicalises to itself`);
      else if (!slugs.includes(p.canonicalTo)) bad.push(`${p.slug} -> unknown ${p.canonicalTo}`);
      else if (BLOG_POSTS.find((x) => x.slug === p.canonicalTo)?.canonicalTo) {
        // A chain means search engines are handed two hops to resolve, and the
        // middle article's signals land nowhere.
        bad.push(`${p.slug} -> ${p.canonicalTo} -> (another)`);
      }
    }
    expect(bad, bad.join("\n")).toEqual([]);
  });

  it("gives every article an English URL", () => {
    const missing = BLOG_POSTS.filter((p) => !languageCounterpart(`/blog/${p.slug}`, "en")).map((p) => p.slug);
    expect(missing, `no English counterpart: ${missing.join(", ")}`).toEqual([]);
  });
});
