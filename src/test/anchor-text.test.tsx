import { cleanup, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { renderRoute } from "./helpers/appRouter";

/**
 * Every link says where it goes.
 *
 * A link whose only content is an icon reads as "link" to a screen reader and
 * as nothing at all to a crawler weighing anchor text, so an audit reports it
 * as a link without text. The site has none today — the crawl of all 96 pages,
 * served and rendered, found zero — and this keeps it that way: an icon-only
 * link added later fails here until it carries a name.
 *
 * The rendered page is checked rather than the source, because a link's text
 * often comes from a child component or a translation, and only the rendered
 * result shows what a crawler actually reads.
 */
const ROUTES = [
  "/",
  "/blog",
  "/dialecte-arabe",
  "/cursuri/grup",
  "/blog/ce-este-arabizi",
  "/en/learn-lebanese-arabic",
];

/** Text, aria-label, or a labelled child (an svg title, an image alt). */
function accessibleName(a: HTMLAnchorElement): string {
  const own = a.textContent?.trim();
  if (own) return own;
  const label = a.getAttribute("aria-label")?.trim();
  if (label) return label;
  const child = a.querySelector("[aria-label], img[alt]:not([alt='']), title");
  if (child) {
    return (
      child.getAttribute("aria-label")?.trim() ||
      child.getAttribute("alt")?.trim() ||
      child.textContent?.trim() ||
      ""
    );
  }
  return "";
}

describe("links a crawler and a screen reader can both read", () => {
  beforeEach(() => {
    window.localStorage.setItem("site-language", "ro");
  });
  afterEach(cleanup);

  it.each(ROUTES)("%s names every link it renders", async (path) => {
    renderRoute(path);
    await screen.findByRole("heading", { level: 1 }, { timeout: 8000 });

    const anchors = [...document.querySelectorAll("a")] as HTMLAnchorElement[];
    expect(anchors.length).toBeGreaterThan(10);

    const nameless = anchors
      .filter((a) => !accessibleName(a))
      .map((a) => `${a.getAttribute("href")} (class="${a.getAttribute("class") ?? ""}")`);
    expect(nameless, nameless.join("\n")).toEqual([]);

    // An icon-only link is named but still carries no anchor text. None exist
    // today; one added later should be a deliberate choice, not a surprise.
    const textless = anchors
      .filter((a) => !a.textContent?.trim())
      .map((a) => `${a.getAttribute("href")} — named "${accessibleName(a)}"`);
    expect(textless, textless.join("\n")).toEqual([]);
  });
});
