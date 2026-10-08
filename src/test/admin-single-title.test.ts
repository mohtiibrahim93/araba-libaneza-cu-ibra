import { describe, expect, it } from "vitest";
import { readdirSync, readFileSync } from "node:fs";
import { resolve, join } from "node:path";

/**
 * Every admin screen used to be titled twice, and on a phone three times.
 *
 * The shell printed the section label and its hint in the sticky top bar, then
 * printed both again as an h1 above the content, and then five screens drew a
 * third heading of their own through ScreenHeader. On Analiză that read
 * "Analiză / Cifrele pe o perioadă…" immediately followed by
 * "Analiză / Cifrele tale, pe o perioadă…" — two subtitles saying one thing.
 *
 * The shell is the single owner now: it heads every screen from the navigation
 * entry, so all twenty are titled the same way and a new screen cannot forget.
 * Screens contribute controls through ScreenToolbar and nothing else.
 */
const adminDir = resolve(process.cwd(), "src/components/admin");
const screens = readdirSync(adminDir)
  .filter((f) => f.endsWith(".tsx") && f !== "AdminShell.tsx" && f !== "AdminLogin.tsx")
  .map((f) => ({ name: f, src: readFileSync(join(adminDir, f), "utf8") }));

const shell = readFileSync(join(adminDir, "AdminShell.tsx"), "utf8");

describe("the admin names each screen exactly once", () => {
  it("has screens to check", () => {
    expect(screens.length).toBeGreaterThan(15);
  });

  it("gives the shell the only page heading", () => {
    expect(shell.match(/<h1/g) ?? []).toHaveLength(1);
    // Driven by the navigation entry, so the heading and the sidebar can never
    // disagree about what the screen is called.
    expect(shell).toContain("{current?.label}");
  });

  it("leaves no screen titling itself", () => {
    const offenders = screens
      .filter(({ src }) => /<h1/.test(src))
      .map(({ name }) => name);
    expect(offenders, `these screens draw their own page title: ${offenders.join(", ")}`).toEqual(
      [],
    );
  });

  it("keeps ScreenToolbar free of a title", () => {
    const ui = readFileSync(join(adminDir, "ui.tsx"), "utf8");
    const at = ui.indexOf("export function ScreenToolbar");
    expect(at, "ScreenToolbar is gone").toBeGreaterThan(-1);
    const body = ui.slice(at, at + 400);
    expect(body).not.toContain("title");
    expect(body).not.toMatch(/<h[1-3]/);
  });

  it("stops the top bar repeating the heading on desktop", () => {
    // The bar still names the screen on phones, where the rail is hidden and
    // the heading scrolls away — but only there.
    const at = shell.indexOf("{current?.label}");
    const line = shell.slice(shell.lastIndexOf("<p", at), at);
    expect(line).toContain("lg:hidden");
  });
});
