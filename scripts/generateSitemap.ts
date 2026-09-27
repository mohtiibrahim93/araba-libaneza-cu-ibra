/**
 * Writes public/sitemap.xml. The content is built by src/lib/sitemap.ts; this
 * script exists so the build can regenerate the file, and so importing the
 * builder (in tests) never has the side effect of writing it.
 *
 * It also supplies the <lastmod> dates, because only a script can read git. For
 * each URL that is the date of the last commit touching that page's own files —
 * its route file and the component the route renders — and deliberately not the
 * shared layouts: a date that moves on all 121 URLs at once whenever a layout
 * changes is the kind of blanket lastmod a crawler learns to ignore.
 *
 * A file with no git history, or no git at all (a shallow checkout, an export),
 * yields no date for that URL rather than a guess.
 */
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { buildSitemap, blogIndexPages } from "../src/lib/sitemap";
import { allSeoRoutes } from "../src/lib/seoHead";
import { belongsInSitemap } from "../src/lib/sitemap";

const root = process.cwd();

/** Last commit date for a set of files, newest wins, ISO 8601. */
function lastCommit(files: string[]): string | undefined {
  let newest: string | undefined;
  for (const file of files) {
    if (!existsSync(resolve(root, file))) continue;
    try {
      const out = execFileSync("git", ["log", "-1", "--format=%cI", "--", file], {
        cwd: root,
        encoding: "utf8",
        stdio: ["ignore", "pipe", "ignore"],
      }).trim();
      if (out && (!newest || out > newest)) newest = out;
    } catch {
      return undefined; // no git here; the sitemap simply carries no dates
    }
  }
  return newest;
}

/** Every route file, with the path it serves and the components it imports. */
function routeSources(): Map<string, string[]> {
  const byPath = new Map<string, string[]>();
  const walk = (dir: string) => {
    for (const entry of readdirSync(resolve(root, dir), { withFileTypes: true })) {
      if (entry.isDirectory()) {
        walk(`${dir}/${entry.name}`);
        continue;
      }
      if (!/\.tsx?$/.test(entry.name) || entry.name === "__root.tsx") continue;
      const file = `${dir}/${entry.name}`;
      const src = readFileSync(resolve(root, file), "utf8");
      const id = src.match(/createFileRoute\("([^"]+)"\)/)?.[1];
      if (!id) continue;
      const path = id === "/" ? id : id.replace(/\/$/, "");
      // The page component this route renders, when it lives in src/pages.
      const pages = [...src.matchAll(/from "@\/(pages\/[^"]+)"/g)]
        .map((m) => `src/${m[1]}`)
        .flatMap((base) => [`${base}.tsx`, `${base}.ts`]);
      byPath.set(path, [file, ...pages]);
    }
  };
  walk("src/routes");
  return byPath;
}

const sources = routeSources();
const lastmods = new Map<string, string>();

for (const route of allSeoRoutes().filter(belongsInSitemap)) {
  // A blog post or a course level is served by a dynamic route, so its own
  // article component is what dates it; fall back to the route file.
  const files = sources.get(route.path) ?? [];
  const date = lastCommit(files.length ? files : ["src/lib/seoHead.ts"]);
  if (date) lastmods.set(route.path, date);
}

// The paginated index changes when the registry of articles does.
const blogDate = lastCommit(["src/lib/blogPosts.ts", "src/pages/blog/BlogIndex.tsx"]);
if (blogDate) for (const path of blogIndexPages()) lastmods.set(path, blogDate);

const xml = buildSitemap(lastmods);
writeFileSync(resolve(root, "public/sitemap.xml"), xml, "utf8");
const dated = (xml.match(/^ {4}<lastmod>/gm) || []).length;
console.log(
  `[sitemap] wrote ${(xml.match(/<loc>/g) || []).length} URLs, ${dated} with a lastmod`,
);
