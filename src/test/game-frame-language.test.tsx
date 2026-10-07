import { screen, cleanup } from "@testing-library/react";
import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { renderRoute } from "./helpers/appRouter";

/**
 * The game frame must be rebuilt when the reader's language changes.
 *
 * The game reads ?lang= from its query string once, at start-up — the same way
 * it reads ?view=. So a language change has to remount the iframe, not merely
 * rewrite its src: an already-loaded frame keeps the language it booted with.
 *
 * This shipped broken. The iframe was keyed on the mode alone, so an English
 * visitor reaching /joc got a Romanian game and toggling the language did
 * nothing. /joc is not under /en/, so the server renders it in Romanian and the
 * saved language is adopted just after hydration — which means the English path
 * ALWAYS went through the change this key has to catch.
 *
 * The remount itself cannot be observed from the DOM (React reuses the tag name
 * and jsdom happily updates a src attribute that a real browser would have had
 * to reload), so the key is asserted at the source and the plumbing is asserted
 * by rendering the page the way an English visitor meets it.
 */
const read = (p: string) => readFileSync(resolve(process.cwd(), p), "utf8");

describe("the game frame follows the reader's language", () => {
  afterEach(cleanup);

  it("keys the frame on the language as well as the mode", () => {
    const src = read("src/components/YallaGame.tsx");
    // Mode, language and the level test's "test only" choice all remount it.
    expect(src).toContain('key={`${mode}-${lang}-${focus ? "focus" : "full"}`}');
  });

  it("passes the language on the frame's query string", () => {
    expect(read("src/components/YallaGame.tsx")).toContain("&lang=${lang}");
  });

  describe("an English visitor on /joc", () => {
    beforeEach(() => {
      window.localStorage.setItem("site-language", "en");
    });

    it("gets a frame asking the game for English", async () => {
      renderRoute("/joc");
      const frame = await screen.findByTitle(/Yalla/i, {}, { timeout: 5000 });
      expect(frame.getAttribute("src") ?? "").toContain("lang=en");
    });
  });

  describe("a Romanian visitor on /joc", () => {
    beforeEach(() => {
      window.localStorage.setItem("site-language", "ro");
    });

    it("is left in Romanian", async () => {
      renderRoute("/joc");
      const frame = await screen.findByTitle(/Yalla/i, {}, { timeout: 5000 });
      expect(frame.getAttribute("src") ?? "").toContain("lang=ro");
    });
  });
});
