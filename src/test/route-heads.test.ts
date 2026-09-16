import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { allSeoRoutes, hreflangPairs, seoHead } from "@/lib/seoHead";
import { TITLE_MAX, DESC_MAX } from "@/lib/pageMeta";

/**
 * The per-page head lives in src/lib/seoHead.ts, read by each route's head()
 * and rendered into the server HTML. It is the single source for titles,
 * descriptions, canonicals, hreflang and JSON-LD — nothing bakes heads into
 * static files any more.
 */
const read = (p: string) => readFileSync(resolve(process.cwd(), p), "utf8");

describe("per-page heads", () => {
  it("declares every page once", () => {
    const paths = allSeoRoutes().map((r) => r.path);
    expect(paths.length).toBeGreaterThan(100);
    expect(new Set(paths).size).toBe(paths.length);
  });

  it("stays inside the title and description limits", () => {
    for (const route of allSeoRoutes()) {
      expect(route.title.length, `${route.path} title`).toBeLessThanOrEqual(TITLE_MAX);
      expect(route.description.length, `${route.path} description`).toBeLessThanOrEqual(DESC_MAX);
    }
  });

  it("gives every page a title, a description and a self-canonical", () => {
    const head = seoHead("/cursuri-limba-araba");
    expect(head.meta).toContainEqual({
      "data-rh": "true",
      title: "Cursuri Arabă Libaneză A1–C2 | Prețuri și Niveluri",
    });
    expect(head.links).toContainEqual({
      "data-rh": "true",
      rel: "canonical",
      href: "https://centruldearabalibaneza.com/cursuri-limba-araba",
    });
  });

  it("points a consolidated page's canonical at the survivor", () => {
    // /cursuri-araba is a retired alias. Its canonical belongs to the page it
    // consolidates into, or the two compete for one query.
    const head = seoHead("/cursuri-araba");
    expect(head.links).toContainEqual({
      "data-rh": "true",
      rel: "canonical",
      href: "https://centruldearabalibaneza.com/cursuri-limba-araba",
    });
    // A canonicalised URL must not head its own language cluster.
    expect(head.links.filter((l) => l["rel"] === "alternate")).toHaveLength(0);
  });

  it("noindexes the retired redirects", () => {
    expect(seoHead("/stergere-date").meta).toContainEqual({
      "data-rh": "true",
      name: "robots",
      content: "noindex,follow",
    });
  });

  it("emits reciprocal hreflang with Romanian as x-default", () => {
    const links = seoHead("/intrebari-frecvente").links.filter((l) => l["rel"] === "alternate");
    expect(links.map((l) => `${l["hreflang"]} ${l["href"]}`)).toEqual([
      "ro https://centruldearabalibaneza.com/intrebari-frecvente",
      "en https://centruldearabalibaneza.com/en/faq",
      "x-default https://centruldearabalibaneza.com/intrebari-frecvente",
    ]);
  });

  it("marks up the FAQ pages and the blog posts", () => {
    const faq = seoHead("/en/faq").scripts.map((s) => JSON.parse(s.children));
    expect(faq.some((j) => j["@type"] === "FAQPage")).toBe(true);
    const post = seoHead("/blog/ce-este-arabizi");
    expect(post.meta).toContainEqual({ "data-rh": "true", property: "og:type", content: "article" });
    expect(post.scripts.map((s) => JSON.parse(s.children)).some((j) => j["@type"] === "Article")).toBe(true);
  });

  it("leaves an unknown path to the site-wide head rather than half a page's", () => {
    expect(seoHead("/nu-exista")).toEqual({ meta: [], links: [], scripts: [] });
  });

  it("stamps every tag so Helmet replaces it instead of duplicating it", () => {
    // The pages still render their own head through react-helmet-async after
    // hydration. Without data-rh, Helmet appends a second title, description
    // and canonical next to the server-rendered ones.
    const head = seoHead("/joc");
    for (const tag of [...head.meta, ...head.links]) {
      expect(tag["data-rh"]).toBe("true");
    }
    const root = read("src/routes/__root.tsx");
    for (const key of ['name: "description"', 'property: "og:image"', 'name: "twitter:card"']) {
      const at = root.indexOf(key);
      expect(root.slice(Math.max(0, at - 120), at)).toContain('"data-rh": "true"');
    }
  });

  it("wires the head into every route that has one", () => {
    // A route file without head() serves the site-wide title instead of its
    // own — the regression that porting these heads fixed.
    const wired = new Set<string>();
    const walk = (dir: string) => {
      for (const entry of readdirSync(resolve(process.cwd(), dir), { withFileTypes: true })) {
        if (entry.isDirectory()) walk(`${dir}/${entry.name}`);
        else if (entry.name.endsWith(".tsx")) {
          const src = read(`${dir}/${entry.name}`);
          // [,)] rather than ) alone: the blog index routes pass a second
          // argument to canonicalise page two at itself, and the head is just
          // as wired for it.
          for (const m of src.matchAll(/seoHead\("([^"]+)"[,)]/g)) wired.add(m[1]!);
          // A route that only 301s never renders a head; its title lives on
          // the page it redirects to.
          if (src.includes("throw redirect(")) {
            const id = src.match(/createFileRoute\("([^"]+)"\)/)?.[1];
            if (id) wired.add(id === "/" ? id : id.replace(/\/$/, ""));
          }
          // The dynamic level and blog routes build their path from params.
          if (/seoHead\(`\/cursuri\/grup\/\$\{/.test(src)) {
            for (const id of ["a1", "a2", "b1", "b2", "c1", "c2"]) wired.add(`/cursuri/grup/${id}`);
          }
          if (/seoHead\(`\/en\/courses\/group\/\$\{/.test(src)) {
            for (const id of ["a1", "a2", "b1", "b2", "c1", "c2"]) wired.add(`/en/courses/group/${id}`);
          }
          if (/seoHead\(`\/en\/blog\/\$\{/.test(src)) {
            for (const r of allSeoRoutes()) if (r.path.startsWith("/en/blog/")) wired.add(r.path);
          }
        }
      }
    };
    walk("src/routes");
    const missing = allSeoRoutes()
      .map((r) => r.path)
      .filter((p) => !wired.has(p));
    expect(missing).toEqual([]);
  });

  it("keeps every hreflang pair reciprocal in the pages themselves", () => {
    // The prerender script derived these pairs by reading enHref/roHref out of
    // the page sources. A browser bundle cannot do that, so src/lib/seoHead.ts
    // lists them — and this check re-reads the pages, so a pair that stops
    // being mutual, or a new mutual pair, cannot go unnoticed.
    const declared = new Map<string, string | null>();
    for (const [dir, prefix, prop] of [
      ["src/pages/seo", "/", "enHref"],
      ["src/pages/en", "/en/", "roHref"],
    ] as const) {
      for (const file of readdirSync(resolve(process.cwd(), dir)).filter((f) => f.endsWith(".tsx"))) {
        const src = read(`${dir}/${file}`);
        const slug = src.match(/slug="([^"]+)"/);
        if (!slug) continue;
        if (/canonicalHref="/.test(src)) continue;
        const twin = src.match(new RegExp(`${prop}="([^"]+)"`));
        declared.set(prefix + slug[1]!, twin ? twin[1]! : null);
      }
    }
    const mutual: Array<[string, string]> = [];
    for (const [path, twin] of declared) {
      if (path.startsWith("/en/") || !twin) continue;
      if (declared.get(twin) === path) mutual.push([path, twin]);
    }
    const pairs = hreflangPairs();
    for (const [ro, en] of mutual) {
      expect(pairs.get(ro), `${ro} should be paired with ${en}`).toEqual({ ro, en });
    }
    // And nothing listed as a landing pair may have lost its reciprocity.
    for (const [ro, twin] of declared) {
      if (ro.startsWith("/en/") || !twin) continue;
      const pair = pairs.get(ro);
      if (pair && !pair.ro.startsWith("/cursuri") && pair.ro !== "/blog" && !pair.ro.startsWith("/blog/")) {
        expect(declared.get(pair.en)).toBe(ro);
      }
    }
  });
});
