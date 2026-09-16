import { fireEvent, screen, cleanup } from "@testing-library/react";
import { describe, expect, it, beforeEach, afterEach } from "vitest";
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
