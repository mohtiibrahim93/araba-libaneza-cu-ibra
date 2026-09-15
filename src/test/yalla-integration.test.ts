import { describe, expect, it } from "vitest";
import { readFileSync, existsSync, statSync } from "node:fs";
import { resolve } from "node:path";
import { JOACA_META, TITLE_MAX, DESC_MAX } from "@/lib/pageMeta";
import { hasRoute } from "./helpers/routes";

/**
 * The Yalla practice game, served from this domain rather than embedded from
 * somewhere else.
 *
 * The game is a static app with its own content bank and learning engine. It
 * is not built by Vite — it is copied verbatim into public/yalla — so nothing
 * in the normal build would notice if a module went missing, and the failure
 * would be a blank iframe in production rather than a build error.
 *
 * These assertions pin the parts that have no other guard.
 */
const read = (p: string) => readFileSync(resolve(process.cwd(), p), "utf8");
const seoHeadSrc = read("src/lib/seoHead.ts");
const robots = read("public/robots.txt");

/** Exactly what public/yalla/index.html loads, in the order it loads it. */
const MODULES = [
  "content.js",
  "romanian.js",
  "curriculum.js",
  "synthesis.js",
  "engine.js",
  "plus.js",
  "academy.js",
  "transfer.js",
  "app.js",
];

describe("Yalla game assets", () => {
  it("ships every module index.html asks for", () => {
    for (const f of [...MODULES, "index.html", "styles.css", "beirut-cafe.png"]) {
      expect(existsSync(resolve(process.cwd(), `public/yalla/${f}`)), `public/yalla/${f} is missing`).toBe(true);
    }
  });

  it("loads the modules in dependency order", () => {
    // content → romanian → curriculum → synthesis → engine → plus → academy →
    // transfer → app. Each module reads globals the previous one defined, so a
    // reordered tag is a TypeError at start-up, not a subtle bug.
    const html = read("public/yalla/index.html");
    const loaded = [...html.matchAll(/<script src="\.\/([^"]+)"/g)].map((m) => m[1]);
    expect(loaded).toEqual(MODULES);
  });

  it("keeps the packaged content bank, not the rebuild source", () => {
    // The package ships two copies of content.js. They are identical except
    // that the one belonging in public/yalla carries this flag, which is how
    // the game knows it is running from the site rather than from a rebuild
    // checkout. Copying the wrong one is silent.
    expect(read("public/yalla/content.js").startsWith("window.YALLA_PACKAGED = true;")).toBe(true);
  });

  it("references its artwork by a path that exists", () => {
    // app.js loads ./beirut-cafe.png relative to public/yalla. The file is
    // recovered artwork; a zero-length or truncated copy still passes an
    // existence check, so assert it is a real PNG.
    expect(read("public/yalla/app.js")).toContain("./beirut-cafe.png");
    const png = readFileSync(resolve(process.cwd(), "public/yalla/beirut-cafe.png"));
    expect(png.subarray(0, 8).toString("hex")).toBe("89504e470d0a1a0a");
    expect(statSync(resolve(process.cwd(), "public/yalla/beirut-cafe.png")).size).toBeGreaterThan(1000);
  });
});

describe("/joaca", () => {
  it("is routed and has its own head", () => {
    expect(hasRoute("/joaca"), "no route for /joaca").toBe(true);
    // Without a STATIC_ROUTES entry the route serves the site-wide head to
    // crawlers instead of its own.
    expect(seoHeadSrc).toContain('{ path: "/joaca"');
  });

  it("keeps its head inside the length limits", () => {
    expect(JOACA_META.title.length).toBeLessThanOrEqual(TITLE_MAX);
    expect(JOACA_META.description.length).toBeLessThanOrEqual(DESC_MAX);
  });

  it("takes its head from the shared registry, not a second copy", () => {
    // The failure this prevents: the server-rendered <title> and the runtime
    // one drifting apart, so a crawler that runs JavaScript reads a different
    // page from one that does not.
    expect(read("src/pages/Joaca.tsx")).toContain("JOACA_META");
    expect(seoHeadSrc).toContain("JOACA_META");
  });

  it("is linked from the footer, not only the navbar dropdown", () => {
    // The dropdown mounts its contents when opened, so its links never reach
    // the server-rendered HTML. A footer link is what makes it crawlable.
    expect(read("src/components/Footer.tsx")).toContain('to="/joaca"');
  });

  it("declares no English twin", () => {
    // The card bank carries Romanian meanings only, so an /en/ URL would
    // advertise a translation that does not exist. A route with no twin emits
    // no hreflang, which is correct here rather than an omission.
    expect(hasRoute("/en/joaca"), "/joaca has no English twin by design").toBe(false);
    expect(read("src/lib/languageRoutes.ts")).not.toContain("/joaca");
  });
});

describe("the game's own URL stays out of the index", () => {
  it("disallows /yalla/ in robots.txt", () => {
    // /yalla/index.html renders the same game with no header, footer or prose.
    // Indexed, it would compete with /joaca for the same queries as the worse
    // result. Nothing is lost: iframe content never counts toward the page
    // that embeds it.
    expect(robots).toContain("Disallow: /yalla/");
  });

  it("still ships the key file and the sitemap line above it", () => {
    // Guard against a careless edit to robots.txt taking these with it.
    expect(robots).toContain("Sitemap: https://centruldearabalibaneza.com/sitemap.xml");
    expect(existsSync(resolve(process.cwd(), "public/4ce740356d5ab7d75677bda846853184.txt"))).toBe(true);
  });

  it("keeps one wildcard user-agent group", () => {
    // Per the robots.txt spec a crawler obeys only its most specific matching
    // group, so a second group would stop reading these disallows entirely.
    expect(robots.match(/^User-agent:/gm)).toHaveLength(1);
  });
});
