import { describe, expect, it } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

/**
 * The Supabase client must stay off the first-load path.
 *
 * It is 216 KB (56 KB gzipped). It reached the critical path of *every* route
 * — not just the homepage — because src/lib/i18n.tsx wraps the whole app and
 * imported useSiteTexts, which imported the client at module scope. The
 * browser was told to modulepreload it before first paint, to serve a query
 * that cannot run until after mount.
 *
 * Removing it took the homepage from 1,069 KB to 644 KB raw, and from 314 KB
 * to 200 KB gzipped.
 *
 * Two things keep it out, and both are easy to undo by accident:
 *   - useSiteTexts imports the client inside its query function
 *   - the two homepage sections that read Supabase are lazy boundaries
 *
 * A plain `import { supabase } from ...` added to either place puts the whole
 * chunk back on the critical path of the entire site, silently — the page
 * still works, it is just slower for everyone. Hence this file.
 */
const read = (p: string) => readFileSync(resolve(process.cwd(), p), "utf8");

describe("Supabase stays out of the first-load bundle", () => {
  it("loads the client inside useSiteTexts' query, not at module scope", () => {
    const src = read("src/hooks/useSiteTexts.ts");
    expect(src).toContain('await import("@/integrations/supabase/client")');
    // The static form is what this test exists to prevent.
    expect(src).not.toMatch(/^import\s+\{[^}]*supabase[^}]*\}\s+from/m);
  });

  it("keeps i18n free of any static Supabase import", () => {
    // i18n wraps every route, so anything it pulls in eagerly is on the
    // critical path of the entire site.
    expect(read("src/lib/i18n.tsx")).not.toContain("integrations/supabase/client");
  });

  it("lazy-loads the two homepage sections that read Supabase", () => {
    const src = read("src/pages/Index.tsx");
    for (const c of ["ActiveCoursesBanner", "ProgramsSection"]) {
      expect(src, `${c} should be a lazy boundary`).toContain(
        `const ${c} = lazy(() => import("@/components/${c}"));`,
      );
      // A leftover eager import would defeat the split.
      expect(src).not.toContain(`import ${c} from "@/components/${c}";`);
    }
    expect(src).toContain("<Suspense");
  });

  it("reserves height for each lazy section so the page does not jump", () => {
    // Without a sized fallback these swap in below the hero and shove the page
    // down — trading load time for layout shift, which is not a win.
    const src = read("src/pages/Index.tsx");
    expect(src).toMatch(/fallback=\{<div className="min-h-\[\d+rem\]"/);
  });
});

/**
 * These two used to read dist/index.html. Under SSR there is no static
 * index.html to read — the homepage HTML is produced per request — so they were
 * skipped in every tree, which is worse than not having them. They now assert
 * the same two facts from what is always available:
 *
 *   - nothing on the homepage's static import graph reaches the Supabase
 *     client, which is what put its chunk in front of first paint;
 *   - the lazy sections still contribute their text to the rendered page, so
 *     the split costs no indexable copy.
 */
describe("the homepage's critical path", () => {
  const importsOf = (source: string) =>
    [...source.matchAll(/^\s*import\s[^;]*?from\s+"(@\/[^"]+)"/gm)].map((m) => m[1]!);

  const resolveModule = (spec: string) => {
    const base = `src/${spec.slice(2)}`;
    for (const candidate of [`${base}.tsx`, `${base}.ts`, `${base}/index.tsx`, `${base}/index.ts`]) {
      if (existsSync(resolve(process.cwd(), candidate))) return candidate;
    }
    return undefined;
  };

  it("never reaches the Supabase client through a static import", () => {
    const seen = new Set<string>();
    const queue = ["src/routes/index.tsx", "src/routes/__root.tsx"];
    const offenders: string[] = [];
    while (queue.length) {
      const file = queue.shift()!;
      if (seen.has(file)) continue;
      seen.add(file);
      const source = read(file);
      for (const spec of importsOf(source)) {
        if (spec.startsWith("@/integrations/supabase/client")) {
          offenders.push(`${file} -> ${spec}`);
          continue;
        }
        const next = resolveModule(spec);
        if (next) queue.push(next);
      }
    }
    // Guard the guard: an empty walk would make this vacuous.
    expect(seen.size).toBeGreaterThan(20);
    expect(offenders).toEqual([]);
  });

  it("still renders the text of the lazy sections", async () => {
    renderRoute("/");
    // Inside ProgramsSection, which is a lazy boundary.
    expect(
      await screen.findByText("Meditații arabă 1:1 — cum funcționează", {}, { timeout: 10000 }),
    ).toBeTruthy();
  });
});

