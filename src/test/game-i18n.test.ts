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
 * This file guards the mechanism. Coverage of the game's CONTENT — cards,
 * drills, lessons, topics — is asserted in game-english-coverage.test.ts, which
 * runs the whole content pipeline. Coverage of the interface is still batch
 * work: an unconverted T() call site deliberately stays Romanian rather than
 * rendering blank, and is found by crawling the views in a browser.
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

  it("leaves the content to deck-language.js", () => {
    // i18n.js is the interface only. Card meanings, drills, lessons and topics
    // are switched by deck-language.js, after synthesis.js has generated its
    // share of them — coverage is asserted in game-english-coverage.test.ts.
    const i18n = read("public/yalla/i18n.js");
    expect(i18n).not.toContain("YALLA.cards");
    expect(read("public/yalla/deck-language.js")).toContain("root.YALLA.cards");
  });
});

describe("training draws by level, not by lesson group", () => {
  const app = read("public/yalla/app.js");

  it("filters the training pool on the card's level", () => {
    // The lesson groups mislabelled difficulty: group "A1" held 288 A2 cards and
    // 11 B1 ones, group "A2" held 223 A1 cards. Selecting on the level the owner
    // gave each card is the honest filter, and it must stay a ceiling — an A2
    // round includes A1 cards, because an A2 conversation needs A1 words.
    expect(app).toContain("D.cards.filter(upToLevel(trainingLevel))");
    expect(app).toContain("i<=top");
    expect(app).not.toContain("trainingGroup");
  });

  it("gives the runtime-generated cards a level so they stay in the pool", () => {
    // synthesis.js appends ~845 cards with no level. The ceiling only keeps a
    // level it recognises, so without inheritance they would silently drop out
    // of practice — the old group-based pool included them.
    expect(app).toContain("levelTheSynthesised");
  });
});
