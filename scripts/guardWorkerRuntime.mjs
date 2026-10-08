#!/usr/bin/env node
/**
 * Makes the built worker survive a runtime where `import.meta.url` is undefined.
 *
 * Nitro emits `createRequire(import.meta.url)` into the server bundle. Node and
 * `wrangler dev` both define `import.meta.url`, so that call is harmless there.
 * Lovable's hosting does not, and `node:module`'s createRequire rejects
 * undefined:
 *
 *   TypeError: The argument 'path' must be a file URL object, a file URL
 *   string, or an absolute path string. Received 'undefined'
 *       at createRequire (node:module:34:15)
 *       at _runtime.mjs:1:818
 *
 * It throws while the server module is still loading, before any request is
 * handled, so every server-rendered route 500s while static assets keep
 * serving — which is exactly how the site failed on 2026-10-07.
 *
 * Some versions of the build toolchain already emit the guarded form and some
 * do not, so whether the site boots depended on which version a fresh install
 * happened to resolve. This runs after the build and settles it either way.
 *
 * Idempotent: an already-guarded call is left alone, so running twice is safe.
 */
import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

/** The bare call, not one that already carries a fallback. */
const UNGUARDED = /createRequire\(\s*import\.meta\.url\s*\)/g;
const GUARDED = 'createRequire(import.meta.url || "file:///")';

/** Returns the patched source and how many call sites changed. */
export function guardSource(source) {
  let count = 0;
  const out = source.replace(UNGUARDED, () => {
    count += 1;
    return GUARDED;
  });
  return { source: out, count };
}

function* walk(dir) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) yield* walk(full);
    else if (full.endsWith(".mjs") || full.endsWith(".js")) yield full;
  }
}

function main() {
  const root = join(process.cwd(), ".output", "server");
  if (!existsSync(root)) {
    // A build that did not produce a worker (a different target, or the script
    // run on its own) is not an error.
    console.log("guard-worker-runtime: no .output/server, nothing to do");
    return;
  }

  let files = 0;
  let sites = 0;
  for (const file of walk(root)) {
    const src = readFileSync(file, "utf8");
    if (!UNGUARDED.test(src)) {
      UNGUARDED.lastIndex = 0;
      continue;
    }
    UNGUARDED.lastIndex = 0;
    const { source, count } = guardSource(src);
    writeFileSync(file, source);
    files += 1;
    sites += count;
  }

  console.log(
    sites === 0
      ? "guard-worker-runtime: already guarded, no changes"
      : `guard-worker-runtime: guarded ${sites} call site(s) across ${files} file(s)`,
  );
}

// Only run when invoked directly, so the test can import guardSource.
if (process.argv[1] && process.argv[1].endsWith("guardWorkerRuntime.mjs")) main();
