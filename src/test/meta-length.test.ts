import { describe, expect, it } from "vitest";
import { allRoutes } from "../../scripts/seoPrerender";

/**
 * Title and description lengths, asserted where failure is visible.
 *
 * seoPrerender already checks the upper bounds, but it reports them through
 * this.warn() — a Rollup warning that scrolls past in a successful build. That
 * is how a 220-character description reached production: the guard fired and
 * nobody saw it. The build is deliberately never failed by that plugin, so the
 * check belongs here too, where a breach stops the suite.
 *
 * The lower bound is new. Nine pages had shipped with descriptions too short to
 * say anything useful — 70 characters on the privacy pages — which Google
 * either pads from the body or ignores.
 */
const TITLE_MAX = 60;
const DESC_MAX = 160;
const DESC_MIN = 110;

const routes = allRoutes();

describe("prerendered meta lengths", () => {
  it("has routes to check", () => {
    expect(routes.length).toBeGreaterThan(100);
  });

  it("keeps every title within the truncation limit", () => {
    const over = routes
      .filter((r) => r.title.length > TITLE_MAX)
      .map((r) => `${r.path} (${r.title.length}) "${r.title}"`);
    expect(over).toEqual([]);
  });

  it("keeps every description within the truncation limit", () => {
    const over = routes
      .filter((r) => r.description.length > DESC_MAX)
      .map((r) => `${r.path} (${r.description.length})`);
    expect(over).toEqual([]);
  });

  it("gives every description enough room to say something", () => {
    const under = routes
      .filter((r) => r.description.length < DESC_MIN)
      .map((r) => `${r.path} (${r.description.length})`);
    expect(under).toEqual([]);
  });

  it("never ships an empty title or description", () => {
    const empty = routes
      .filter((r) => !r.title.trim() || !r.description.trim())
      .map((r) => r.path);
    expect(empty).toEqual([]);
  });
});
