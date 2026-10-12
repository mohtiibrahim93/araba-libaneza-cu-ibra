import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { guardSource } from "../../scripts/guardWorkerRuntime.mjs";

/**
 * On 2026-10-07 every server-rendered route returned 500 while static assets
 * kept serving. The cause was in the built worker, not in any source file:
 *
 *   TypeError: The argument 'path' must be a file URL object, a file URL
 *   string, or an absolute path string. Received 'undefined'
 *       at createRequire (node:module:34:15)
 *
 * Nitro emits `createRequire(import.meta.url)` into the server bundle. Node and
 * `wrangler dev` define `import.meta.url`; the production host does not, so the
 * call threw while the module was still loading — before any request, which is
 * why assets were unaffected and every page failed.
 *
 * It was invisible locally for that reason: the same commit renders fine under
 * `wrangler dev --local`. Some toolchain versions emit the guarded form and
 * some do not, so whether the site booted came down to which version a fresh
 * install resolved. The build now guards it unconditionally.
 */
describe("the built worker tolerates an undefined import.meta.url", () => {
  it("guards a bare createRequire call", () => {
    const { source, count } = guardSource("const r = createRequire(import.meta.url);");
    expect(count).toBe(1);
    expect(source).toBe('const r = createRequire(import.meta.url || "file:///");');
  });

  it("leaves an already-guarded call alone, so running twice is safe", () => {
    const already = 'const r = createRequire(import.meta.url || "file:///");';
    const once = guardSource(already);
    expect(once.count).toBe(0);
    expect(once.source).toBe(already);
    expect(guardSource(once.source).source).toBe(already);
  });

  it("guards every call site in a file", () => {
    const { count } = guardSource(
      "createRequire(import.meta.url); x(); createRequire( import.meta.url )",
    );
    expect(count).toBe(2);
  });

  it("does not touch other uses of import.meta.url", () => {
    const src = "const base = import.meta.url; fetch(new URL('./a', import.meta.url));";
    expect(guardSource(src).count).toBe(0);
  });

  it("runs as part of the build, after the bundle is written", () => {
    // A vite plugin is not enough: nitro writes .output/server after vite's
    // hooks have run, so the guard has to be a step of its own, last.
    const pkg = JSON.parse(readFileSync(resolve(process.cwd(), "package.json"), "utf8"));
    for (const script of ["build", "build:dev"] as const) {
      expect(pkg.scripts[script], `${script} must run the guard`).toContain(
        "node scripts/guardWorkerRuntime.mjs",
      );
      expect(
        pkg.scripts[script].indexOf("vite build"),
        `${script} must guard after the build, not before`,
      ).toBeLessThan(pkg.scripts[script].indexOf("guardWorkerRuntime"));
    }
  });
});
