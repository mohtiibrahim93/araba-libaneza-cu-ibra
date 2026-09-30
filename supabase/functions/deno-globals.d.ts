/**
 * Just enough of the Deno globals for a name-resolution check.
 *
 * The edge functions are not in the app's tsconfig — they run on Deno, import
 * from `npm:` and `https://esm.sh`, and pulling Deno's real types through the
 * network on every test run is not worth it. Without this, `Deno` alone
 * accounts for 112 "cannot find name" errors and buries the ones that matter.
 *
 * Deliberately minimal: this exists to make `Deno.env.get` resolve, not to
 * type-check it.
 */
declare const Deno: {
  env: { get(key: string): string | undefined };
  serve(handler: unknown): unknown;
};
declare const EdgeRuntime: unknown;
