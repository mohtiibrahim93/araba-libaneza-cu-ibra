import { fireEvent, screen, cleanup } from "@testing-library/react";
import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { renderRoute } from "./helpers/appRouter";
import { courseMenu, resourceMenu } from "@/lib/siteNav";

// The navbar reads the URL, the UI language and the owner's text overrides, so
// it is mounted the way a visitor meets it: on the homepage, inside the real
// route tree, with the providers the root route supplies.
const renderNavbar = async () => {
  renderRoute("/");
  // The router resolves its first match asynchronously, so the chrome lands a
  // tick after render.
  return screen.findByRole("navigation");
};

describe("Navbar accessibility", () => {
  beforeEach(() => {
    window.localStorage.setItem("site-language", "ro");
  });

  afterEach(cleanup);

  it("renders aria-labels for the brand link, language switcher, and menu button", async () => {
    await renderNavbar();

    expect(screen.getByLabelText("Centrul de Arabă Libaneză — arabă libaneză cu Ibra")).toBeInTheDocument();
    expect(screen.getByLabelText("Alege limba site-ului")).toBeInTheDocument();
    expect(screen.getByLabelText("Deschide meniul de navigare")).toBeInTheDocument();
  });

  it("toggles the mobile menu open and closed", async () => {
    const nav = await renderNavbar();

    const menuButton = screen.getByLabelText("Deschide meniul de navigare");
    fireEvent.click(menuButton);
    expect(screen.getByLabelText("Închide meniul de navigare")).toBeInTheDocument();
    expect(nav.querySelector("#mobile-navigation")).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText("Închide meniul de navigare"));
    expect(screen.getByLabelText("Deschide meniul de navigare")).toBeInTheDocument();
  });
});

/**
 * The bar and the hamburger have to swap at the same width.
 *
 * With eight links plus the brand, the enrol button, the theme toggle and the
 * language switcher, the desktop bar did not fit its container anywhere below
 * about 1400px, and nothing scrolls — so at 1280px the enrol button, the theme
 * toggle and the language switcher were simply unreachable, and at 900px it
 * started cutting from "Testimoniale". It shows from lg now, with the
 * homepage-anchor links held back to 2xl.
 *
 * Layout cannot be measured in jsdom, so this asserts the thing that actually
 * broke: three classes that have to agree. If one moves and the others do not,
 * a band of widths gets either two navigations or none.
 */
describe("Navbar breakpoints", () => {
  const src = readFileSync(resolve(process.cwd(), "src/components/Navbar.tsx"), "utf8");

  it("shows the full bar from lg up", () => {
    expect(src).toContain('className="hidden lg:flex items-center gap-3');
  });

  it("hands over to the hamburger at exactly the same width", () => {
    expect(src).toMatch(/className="lg:hidden flex items-center justify-center/);
    expect(src).toContain('<div id="mobile-navigation" className="lg:hidden');
  });

  it("holds the homepage anchors back until there is room for them", () => {
    expect(src).toContain('className="hidden 2xl:inline hover:text-foreground');
  });
});

/**
 * The Cursuri and Resurse menus used to be Radix dropdowns, which render
 * through a portal and mount only while open. Every link under them was
 * therefore missing from the HTML the server sends, and the footer had to
 * carry forty-odd links to compensate. These two tests hold the fix in place
 * from both sides: the links are in the markup before anyone clicks, and the
 * menus still open when someone does.
 */
describe("Navbar menus", () => {
  beforeEach(() => {
    window.localStorage.setItem("site-language", "ro");
  });

  afterEach(cleanup);

  it("renders every menu link without the menu being opened", async () => {
    const nav = await renderNavbar();

    for (const item of [...courseMenu("ro"), ...resourceMenu("ro")]) {
      expect(
        nav.querySelector(`a[href="${item.to}"]`),
        `${item.to} is missing from the navbar markup`,
      ).toBeTruthy();
    }
  });

  it("opens a menu on click and closes it on Escape", async () => {
    await renderNavbar();

    const trigger = screen.getByRole("button", { name: /Resurse/ });
    expect(trigger).toHaveAttribute("aria-expanded", "false");

    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");

    fireEvent.keyDown(document, { key: "Escape" });
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });
});
