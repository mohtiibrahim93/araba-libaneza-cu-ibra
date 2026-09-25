import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { routeFiles, redirectsTo } from "./helpers/routes";

/**
 * One title and one description per page.
 *
 * Every page's head is served by its route (`head: () => seoHead(path)`), and
 * React 19 hoists whatever a component renders into the same <head> — on the
 * server as well as in the browser. So a component that renders its own
 * <title> through <Helmet> does not *replace* the served one, it adds a second:
 * the crawl found two titles, two descriptions and two canonicals on all 115
 * pages, and the `data-rh` stamp that used to prevent that does nothing under
 * React 19 (react-helmet-async renders through React instead of patching the
 * DOM itself).
 *
 * A component may still write a head tag in two cases, and both are visible in
 * the source as a condition:
 *   - `!served` — the route table has no entry for this page, so nothing was
 *     served and the component is the only source;
 *   - an owner's edit (`titleOverride` / `descriptionOverride` from the admin
 *     "Pagini" screen), which is fetched in the browser and therefore cannot be
 *     in the served HTML.
 */

// Tags the route's head() already serves — see src/lib/seoHead.ts.
const SERVED = [
  "<title",
  'name="description"',
  'rel="canonical"',
  'rel="alternate"',
  'property="og:type"',
  'property="og:title"',
  'property="og:description"',
  'property="og:url"',
  'property="og:locale"',
  'name="twitter:title"',
  'name="twitter:description"',
  'property="article:published_time"',
  'property="article:author"',
  // Served for a blog article that has a cover, and by the root route otherwise.
  'property="og:image"',
  'property="og:image:alt"',
  'name="twitter:image"',
];

// A line that carries one of those tags has to say why it is allowed to.
const GUARDS = ["!served", "Override ?"];

/**
 * Two pages have no served head to duplicate, so they write their own:
 *   - CourseDetail renders a course row fetched from the database, and returns
 *     early on the server where there is no row yet, so its head only ever
 *     exists in the browser;
 *   - NotFound is the 404 body, which no route serves a head for.
 */
const NO_SERVED_HEAD = ["src/pages/courses/CourseDetail.tsx", "src/pages/NotFound.tsx"];

function walk(dir: string, out: string[]) {
  for (const entry of readdirSync(resolve(process.cwd(), dir), { withFileTypes: true })) {
    if (entry.isDirectory()) walk(`${dir}/${entry.name}`, out);
    else if (/\.tsx$/.test(entry.name)) out.push(`${dir}/${entry.name}`);
  }
  return out;
}

const componentFiles = [...walk("src/pages", []), ...walk("src/components", [])].filter(
  (f) => !NO_SERVED_HEAD.includes(f),
);

describe("the served head is the only head", () => {
  it("finds the components to check", () => {
    expect(componentFiles.length).toBeGreaterThan(50);
  });

  it("has no component writing a head tag the route already serves", () => {
    const offenders: string[] = [];
    for (const file of componentFiles) {
      const src = readFileSync(resolve(process.cwd(), file), "utf8");
      if (!src.includes("<Helmet")) continue;
      const blocks = src.match(/<Helmet>[\s\S]*?<\/Helmet>/g) ?? [];
      for (const block of blocks) {
        // One segment per tag, each ending at the tag that closes it, so a
        // condition written on the line above still reads as part of it.
        const segments = block
          .replace(/\{\/\*[\s\S]*?\*\/\}/g, " ")
          .replace(/\s*\n\s*/g, " ")
          .split(/(?<=\/>)|(?<=<\/title>)/);
        for (const segment of segments) {
          if (!SERVED.some((tag) => segment.includes(tag))) continue;
          if (GUARDS.some((g) => segment.includes(g))) continue;
          offenders.push(`${file}: ${segment.trim()}`);
        }
      }
    }
    expect(offenders, offenders.join("\n")).toEqual([]);
  });

  it("gives every page route a head of its own", () => {
    const missing = routeFiles()
      .filter((r) => redirectsTo(r.path) === undefined)
      .filter((r) => /\.tsx$/.test(r.file))
      .filter((r) => !r.source.includes("head:"))
      .map((r) => r.path);
    // What is left has no indexable head to serve: the admin and auth screens,
    // the two token-guarded private pages, the database-driven course page, and
    // /joc, which is a layout whose leaves carry the head.
    expect(missing.sort()).toEqual([
      "/admin",
      "/admin/notifications",
      "/admin/private-leads/$id",
      "/auth",
      "/booking/manage/$token",
      "/cursuri/curs/$slug",
      "/joc",
      "/private-status/$id",
    ]);
  });
});
