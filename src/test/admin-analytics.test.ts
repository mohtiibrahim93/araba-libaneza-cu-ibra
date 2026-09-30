import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

/**
 * The admin panel's analytics tab.
 *
 * Every other number in the admin counts all of time — the four stat cards,
 * the trial funnel, the student journey — so "is this month better than last
 * month" was unanswerable from inside the panel. This tab is the time
 * dimension.
 *
 * Most of what is asserted here is restraint rather than behaviour, because
 * the ways this screen can go wrong are ways it can quietly start lying:
 *
 *   - A revenue figure. There is no amount column on `registrations`. Deriving
 *     one from cohort list prices times months would ignore every discount and
 *     would look exactly as authoritative as the counts beside it.
 *   - A second cohort-fill calculation. "Grupe" already computes it including
 *     `manual_offset`; a second derivation drifts and then two screens
 *     disagree about the same cohort.
 *   - Counting anonymized rows. A GDPR-erased registration still has a
 *     `created_at`, so it inflates every total unless excluded.
 *
 * The chart's colours are also checked, because they were validated once (CVD
 * separation and contrast against each surface) and re-stepping one by hand
 * silently voids that.
 */
const read = (p: string) => readFileSync(resolve(process.cwd(), p), "utf8");

describe("the analytics tab", () => {
  const fn = read("supabase/functions/admin-registrations/index.ts");
  const page = read("src/components/admin/AnalyticsAdmin.tsx");
  const admin = read("src/pages/Admin.tsx");
  const css = read("src/styles.css");

  const action = fn.slice(
    fn.indexOf('if (action === "list_analytics")'),
    fn.indexOf('if (action === "list_trial_funnel")'),
  );

  it("has an action that answers over a window", () => {
    expect(action.length).toBeGreaterThan(500);
    expect(action).toContain("Number(body?.days)");
    // Clamped: an unbounded window would scan the whole table.
    expect(action).toContain("Math.min(Math.max(");
    expect(action).toContain('.gte("created_at", fromISO)');
  });

  it("leaves erased people out of the counts", () => {
    expect(action).toContain('.is("anonymized_at", null)');
  });

  it("windows lessons on when they happen, not when they were booked", () => {
    // "How did this month's lessons go" is the question; a lesson booked in
    // January for June belongs to June.
    expect(action).toContain('.gte("start_at", fromISO)');
  });

  it("counts a late cancellation the way the rule defines it", () => {
    expect(action).toContain("lateCancels");
    expect(action).toContain("86_400_000");
    expect(action).toMatch(/Date\.parse\(b\.start_at as string\) - Date\.parse\(b\.cancelled_at as string\)/);
  });

  it("reports a median, not a mean, for days to payment", () => {
    // One person who paid four months late drags an average into fiction.
    expect(action).toContain("medianDaysToPay");
    expect(action).toContain("const median =");
  });

  it("invents no revenue figure", () => {
    // Refunds are real amounts off Stripe and are reported; a derived total is
    // not, and must not appear.
    expect(action).toContain("refunded_amount");
    for (const banned of ["GROUP_MONTHLY", "groupMonthlyUnitAmount", "PRIVATE_LESSON", "price_lei"]) {
      expect(action, `${banned} would make revenue a guess`).not.toContain(banned);
    }
  });

  it("does not compute cohort fill a second time", () => {
    expect(action).not.toContain("group_capacities");
    expect(action).not.toContain("max_seats");
  });

  it("is reachable from the admin nav", () => {
    expect(admin).toContain('value: "analytics"');
    expect(admin).toContain('<TabsContent value="analytics"');
    expect(admin).toContain("<AnalyticsAdmin />");
    expect(admin).toContain('import AnalyticsAdmin from "@/components/admin/AnalyticsAdmin"');
  });

  it("keeps the validated series colours in both modes", () => {
    // Checked with the palette validator against #ffffff and the dark surface:
    // worst adjacent pair is yellow-aqua, CVD ΔE 9.1 light / 8.4 dark.
    for (const hex of ["#2a78d6", "#eb6834", "#1baf7a", "#eda100"]) {
      expect(css, `light series colour ${hex} was changed`).toContain(hex);
    }
    for (const hex of ["#3987e5", "#d95926", "#199e70", "#c98500"]) {
      expect(css, `dark series colour ${hex} was changed`).toContain(hex);
    }
    // Dark is a selected set of steps, not an automatic flip of the light one.
    const dark = css.slice(css.indexOf(".dark {"));
    expect(dark).toContain("--series-1: #3987e5");
  });

  it("never leaves the reader with colour alone", () => {
    // Two of the four series fall under 3:1 on the light surface, so the
    // legend and the table of exact numbers are the relief, not decoration.
    expect(page).toContain("Aceleași cifre, exacte");
    expect(page).toContain("<table");
    expect(page).toContain("aria-label");
  });

  it("gives the bars a parent height to resolve against", () => {
    // The bar height is a percentage of the track. On an auto-height column
    // every bar collapses to its min-height, which is what the first render
    // actually did.
    expect(page).toContain("flex h-full min-w-[14px] flex-1 flex-col justify-end");
  });

  it("says plainly that traffic lives in Google Analytics", () => {
    expect(page).toContain("G-F167Y815JL");
    expect(page).toContain("analytics.google.com");
    expect(page).toContain("search.google.com/search-console");
  });
});
