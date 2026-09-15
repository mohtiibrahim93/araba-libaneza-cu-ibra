import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";

/**
 * The site's routes, read from the route files themselves.
 *
 * These checks used to read one src/App.tsx that listed every `<Route>` in a
 * single table. Routes are now one file per page, so the same questions — does
 * this page have a URL, does that URL only redirect — are answered by scanning
 * src/routes instead. A dynamic segment keeps its `$` form ("/en/blog/$slug"),
 * and an index file's trailing slash is dropped so "/blog/" reads as "/blog".
 */
export interface RouteFile {
  /** The route's URL path, e.g. "/en/courses/group/$level". */
  path: string;
  /** The route file, relative to the project root. */
  file: string;
  source: string;
}

const ROUTES_DIR = "src/routes";

function collect(dir: string, out: RouteFile[]) {
  for (const entry of readdirSync(resolve(process.cwd(), dir), { withFileTypes: true })) {
    if (entry.isDirectory()) {
      collect(`${dir}/${entry.name}`, out);
      continue;
    }
    if (!/\.tsx?$/.test(entry.name) || entry.name === "__root.tsx") continue;
    const file = `${dir}/${entry.name}`;
    const source = readFileSync(resolve(process.cwd(), file), "utf8");
    const id = source.match(/createFileRoute\("([^"]+)"\)/)?.[1];
    if (!id) continue;
    out.push({ path: id === "/" ? id : id.replace(/\/$/, ""), file, source });
  }
}

let cache: RouteFile[] | null = null;

export function routeFiles(): RouteFile[] {
  if (!cache) {
    const out: RouteFile[] = [];
    collect(ROUTES_DIR, out);
    cache = out;
  }
  return cache;
}

export function routeFor(path: string): RouteFile | undefined {
  return routeFiles().find((r) => r.path === path);
}

export function hasRoute(path: string): boolean {
  return routeFor(path) !== undefined;
}

/** True when the route exists only to send the visitor somewhere else. */
export function redirectsTo(path: string): string | undefined {
  const route = routeFor(path);
  if (!route || !route.source.includes("throw redirect(")) return undefined;
  return route.source.match(/redirect\(\{\s*href:\s*"([^"]+)"/)?.[1];
}
