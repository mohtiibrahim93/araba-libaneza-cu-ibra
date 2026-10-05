import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

/**
 * Every section in the admin nav has to lead somewhere, and every screen has
 * to be reachable from the nav.
 *
 * The two halves are joined by a bare string: a nav item's `value` and a
 * `<TabsContent value="...">`. Nothing checks they agree. Change one and the
 * nav item becomes a button that does nothing, or the screen becomes code that
 * nothing can open — with no type error, no runtime error, and no failing
 * test. You find out when you go looking for a screen and it is not there.
 *
 * That risk was tolerable at ten sections written by one person in one sitting.
 * The re-think split "Grupe" and "Programări" — which were five and three
 * separate screens stacked on a single scrolling page — into sub-items, so
 * there are eighteen now, and more of them move around.
 *
 * This is the check that makes rearranging the nav safe to do.
 */
const admin = readFileSync(resolve(process.cwd(), "src/pages/Admin.tsx"), "utf8");

/** Nav item values, read from the navGroups block only. */
const navValues = (() => {
  const block = admin.slice(admin.indexOf("const navGroups = ["), admin.indexOf("return (\n    <AdminShell"));
  return [...block.matchAll(/value: "([a-z-]+)"/g)].map((m) => m[1]);
})();

const tabValues = [...admin.matchAll(/<TabsContent value="([a-z-]+)"/g)].map((m) => m[1]);

describe("the admin nav and its screens agree", () => {
  it("found both halves", () => {
    expect(navValues.length).toBeGreaterThan(10);
    expect(tabValues.length).toBeGreaterThan(10);
  });

  it("gives every nav item a screen", () => {
    const dead = navValues.filter((v) => !tabValues.includes(v));
    expect(dead, `nav items that open nothing: ${dead.join(", ")}`).toEqual([]);
  });

  it("gives every screen a way in", () => {
    const orphans = tabValues.filter((v) => !navValues.includes(v));
    expect(orphans, `screens with no nav item: ${orphans.join(", ")}`).toEqual([]);
  });

  it("opens on a section that exists", () => {
    const initial = admin.match(/useState\("([a-z-]+)"\)/)?.[1];
    expect(initial, "could not find the initial tab").toBeTruthy();
    expect(navValues, `the panel opens on "${initial}", which is not in the nav`).toContain(initial);
  });

  it("keeps every section's value unique", () => {
    const dupes = [...new Set(navValues.filter((v, i) => navValues.indexOf(v) !== i))];
    expect(dupes, `duplicate nav values: ${dupes.join(", ")}`).toEqual([]);
  });

  it("still reaches the screens that used to be stacked", () => {
    // Grupe was GroupOverview + Capacities + CourseRequests + ManualSignups +
    // Cohorts on one page; Programări was CalendarHealth + Availability +
    // Bookings. Each is its own section now, and each must still render.
    for (const c of [
      "GroupOverview",
      "CapacitiesAdmin",
      "CourseRequestsAdmin",
      "ManualSignupsAdmin",
      "CohortsAdmin",
      "CalendarHealth",
      "AvailabilityAdmin",
      "BookingsAdmin",
      "StudentJourneyAdmin",
      "TrialFunnelAdmin",
      "AnalyticsAdmin",
      "BlogAdmin",
      "ResourcesAdmin",
      "PagesAdmin",
      "SiteTextsAdmin",
      "BacklinksAdmin",
      "PrivateLeadStats",
    ]) {
      expect(admin, `${c} is no longer rendered anywhere`).toContain(`<${c}`);
    }
  });
});
