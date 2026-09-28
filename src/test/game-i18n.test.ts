import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

/**
 * The game frame must follow the language the visitor reads the site in.
 *
 * The game under public/yalla/ is a standalone app with no build step and no
 * tests of its own, so the mechanism is what gets guarded here: the site
 * passes ?lang= on the iframe src, i18n.js reads it, and app.js resolves every
 * converted string through T(). Each of those three can be broken silently —
 * a dropped query parameter renders a Romanian game to an English reader and
 * nothing fails.
 *
 * What this cannot check is translation coverage: strings are converted in
 * batches, and an unconverted one deliberately stays Romanian rather than
 * rendering blank. Coverage is verified by loading the game in a browser.
 */
const read = (p: string) => readFileSync(resolve(process.cwd(), p), "utf8");

describe("the game follows the site's language", () => {
  it("passes the reader's language to the frame", () => {
    const src = read("src/components/YallaGame.tsx");
    expect(src).toContain("lang=${lang}");
  });

  it("loads i18n.js before the code that calls T()", () => {
    const html = read("public/yalla/index.html");
    expect(html).toContain("./i18n.js");
    expect(html.indexOf("./i18n.js")).toBeLessThan(html.indexOf("./app.js"));
  });

  it("defaults to Romanian and only accepts a known language", () => {
    const src = read("public/yalla/i18n.js");
    expect(src).toContain("var lang = 'ro'");
    // Anything other than 'en' must leave Romanian in place rather than
    // reaching the DOM as an attribute value.
    expect(src).toContain("if (q === 'en') lang = 'en'");
  });

  it("resolves converted strings through the helper", () => {
    const app = read("public/yalla/app.js");
    expect(app).toContain("const T=(ro,en)=>window.YallaI18n");
    // A meaningful batch is converted; this is a floor, not a target.
    expect((app.match(/T\('/g) ?? []).length).toBeGreaterThan(100);
  });

  it("leaves card meanings out of it", () => {
    // The deck stays Romanian until the drafted English glosses are reviewed;
    // i18n.js must not start switching card text behind that decision.
    const i18n = read("public/yalla/i18n.js");
    expect(i18n).not.toContain("YALLA.cards");
  });
});
