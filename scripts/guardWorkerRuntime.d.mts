/**
 * Types for the post-build worker guard.
 *
 * The implementation is plain JavaScript (scripts/guardWorkerRuntime.mjs) so it
 * can run as the last step of the build with no toolchain in the way. This
 * declaration is what lets src/test/worker-runtime-guard.test.ts import it under
 * "strict" without the build failing on TS7016.
 */

/** The rewritten source and how many call sites it changed. */
export interface GuardResult {
  /** The source with every bare `createRequire(import.meta.url)` guarded. */
  source: string;
  /** How many call sites were rewritten; 0 when the file was already guarded. */
  count: number;
}

/**
 * Rewrites every bare `createRequire(import.meta.url)` in `source` to the
 * guarded form that falls back to `"file:///"`, so the bundle loads on a runtime
 * where `import.meta.url` is undefined. Idempotent: an already-guarded call is
 * returned untouched, so running the guard twice is safe.
 */
export function guardSource(source: string): GuardResult;
