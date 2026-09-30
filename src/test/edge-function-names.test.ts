import { describe, expect, it } from "vitest";
import { execFileSync } from "node:child_process";

/**
 * No edge function may use a name that does not exist.
 *
 * This shipped. A commit that added course discounts deleted the
 * `discountApplied` declaration from create-subscription and left both of its
 * uses behind. Nothing caught it: the functions are not in the app's tsconfig,
 * esbuild parses them happily because it never resolves identifiers, and
 * `node --check` only looks at syntax. The first thing that noticed was
 * production.
 *
 * The failure was expensive and silent in exactly the wrong way. The
 * ReferenceError is thrown while building the success response — AFTER the
 * Stripe subscription has been created and after the registration row has been
 * updated with its id. So every group sign-up created a real subscription in
 * Stripe, recorded it, and then handed the visitor a 500. From the outside it
 * looked like "the Stripe page doesn't load"; in the database it looked like
 * the call had worked. Two orphaned subscriptions were left behind before
 * anyone understood why.
 *
 * Module resolution genuinely cannot work here — the imports are `npm:` and
 * `https://esm.sh` specifiers that only Deno resolves — so TS2307 and friends
 * are expected and ignored. Only the two codes that mean "this name does not
 * exist" are read:
 *
 *   TS2304  Cannot find name 'x'
 *   TS18004 No value exists in scope for the shorthand property 'x'
 *
 * TS18004 is the one that matters here: `discountApplied` was used as an object
 * shorthand, which is how it slipped past a check for TS2304 alone.
 */
describe("the edge functions only use names that exist", () => {
  it("resolves every identifier", () => {
    let output = "";
    try {
      output = execFileSync(
        "npx",
        ["tsc", "-p", "supabase/functions/tsconfig.check.json"],
        { cwd: process.cwd(), encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] },
      );
    } catch (err) {
      // tsc exits non-zero for the expected module-resolution errors too.
      const e = err as { stdout?: string; stderr?: string };
      output = `${e.stdout ?? ""}${e.stderr ?? ""}`;
    }

    const undeclared = output
      .split("\n")
      .filter((line) => /error TS(2304|18004):/.test(line))
      .map((line) => line.trim());

    expect(undeclared, `undeclared names in edge functions:\n${undeclared.join("\n")}`).toEqual([]);
  }, 120_000);
});
