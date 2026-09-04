import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { ARABIZI_DIGITS, arabiziDigitList, arabiziMarkdownTable } from "@/data/arabizi";

/**
 * The arabizi digit table used to exist as six independent copies — /arabizi,
 * the blog article, both language variants of the seeded blog body, the PDF and
 * the prose that lists the digits. Corrections landed in some and not others:
 * 9 (ق) survived in the seed bodies and the PDF for weeks after being removed
 * from the pages, and 6 (ط) survived in the PDF.
 *
 * Everything now reads src/data/arabizi.ts. These assert the copies are gone
 * and that no file states a digit the table does not contain.
 */
const DIGITS = ARABIZI_DIGITS.map((d) => d.digit);
const read = (f: string) => readFileSync(resolve(process.cwd(), f), "utf8");

describe("arabizi digits have a single source", () => {
  it("teaches 2, 3, 5, 7, 8 and nothing else", () => {
    expect(DIGITS).toEqual(["2", "3", "5", "7", "8"]);
  });

  it("never reintroduces 6 (ط) or 9 (ق)", () => {
    expect(DIGITS).not.toContain("6");
    expect(DIGITS).not.toContain("9");
    for (const d of ARABIZI_DIGITS) {
      expect(d.letter).not.toContain("ط");
      // ق is legitimate on 2 (Lebanese pronounces it as a glottal stop); it
      // must never appear as a row of its own.
      if (d.digit !== "2") expect(d.letter).not.toContain("ق");
    }
  });

  it.each([
    "src/pages/seo/Arabizi.tsx",
    "src/pages/blog/CeEsteArabizi.tsx",
    "src/lib/blogSeedBodies.ts",
    "scripts/buildCheatSheet.ts",
  ])("%s holds no second copy of the table", (file) => {
    const src = read(file);
    expect(src).toMatch(/ARABIZI_DIGITS|arabiziMarkdownTable/);
    // A local array literal pairing a digit with an Arabic letter is a copy.
    expect(src).not.toMatch(/\["[23456789]",\s*"[؀-ۿ]/);
  });

  it("states no digit in prose that the table lacks", () => {
    const files = [
      "src/pages/seo/Arabizi.tsx",
      "src/pages/seo/Resurse.tsx",
      "src/components/ArabiziCheatSheetForm.tsx",
      "src/data/pageSeeds.ts",
      "src/pages/blog/CeEsteArabizi.tsx",
    ];
    for (const f of files) {
      for (const [, list] of read(f).matchAll(/cifre(?:le)?\s*\(?([\d,\s șiand]+)\)?/gi)) {
        const stated = (list.match(/\d/g) ?? []).filter((d) => d !== "0");
        for (const d of stated) {
          expect(DIGITS, `${f} lists digit ${d}, which is not in the table`).toContain(d);
        }
      }
    }
  });

  it("has a PDF that was rebuilt after the last change to the table", async () => {
    // The PDF is generated, not hand-made, but generating it needs Chromium —
    // too heavy and too fragile to run on every production build. So instead of
    // regenerating it here, this compares a fingerprint of the data the file
    // was built from with the data as it stands now. If they differ, the PDF on
    // disk is stale and the fix is one command.
    const { createHash } = await import("node:crypto");
    const script = read("scripts/buildCheatSheet.ts");
    const phrases = JSON.parse(
      "[" +
        script
          .slice(script.indexOf("const PHRASES"), script.indexOf("];", script.indexOf("const PHRASES")))
          .split("\n")
          .filter((l) => l.trim().startsWith("["))
          .join("")
          .replace(/,\s*$/, "") +
        "]",
    );
    const expected = createHash("sha256")
      .update(JSON.stringify({ ARABIZI_DIGITS, PHRASES: phrases }))
      .digest("hex");
    const onDisk = read("public/arabizi-cheat-sheet.hash").trim();
    expect(
      onDisk,
      "public/arabizi-cheat-sheet.pdf is out of date — run: npx vite-node scripts/buildCheatSheet.ts",
    ).toBe(expected);
  });

  it("builds the same markdown the seed bodies embed", () => {
    expect(arabiziMarkdownTable("ro")).toContain("| 2 | ء / ق |");
    expect(arabiziMarkdownTable("ro")).not.toContain("| 9 |");
    expect(arabiziMarkdownTable("en")).not.toContain("| 6 |");
    expect(arabiziDigitList("ro")).toBe("2, 3, 5, 7 și 8");
  });
});
