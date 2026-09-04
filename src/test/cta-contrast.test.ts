import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

/**
 * The article and landing wrappers repaint every descendant link with
 * `[&_a]:text-primary`. That selector has higher specificity than a utility
 * class on the link itself, so it overrode `text-primary-foreground` on the
 * call-to-action buttons nested inside — white-on-red became red-on-red, and
 * six buttons across the blog, the EN pages and the DE page rendered as solid
 * blocks with invisible labels.
 *
 * The rule now excludes anything marked `data-cta`. This asserts the exclusion
 * stays, since the failure is invisible in code review and looks fine in the
 * DOM — only the computed colour gives it away.
 */
const WRAPPERS = [
  "src/components/blog/BlogArticleLayout.tsx",
  "src/components/seo/LandingLayout.tsx",
  "src/pages/de/ArabischLernen.tsx",
  "src/pages/en/EnLandingLayout.tsx",
];

describe("call-to-action buttons keep their own colours", () => {
  it.each(WRAPPERS)("%s scopes its descendant link colour", (file) => {
    const src = readFileSync(resolve(process.cwd(), file), "utf8");
    expect(src).not.toMatch(/\[&_a\]:text-primary/);
    expect(src).toContain("[&_a:not([data-cta])]:text-primary");
  });

  it("every button-styled link inside those wrappers opts out", () => {
    const files = [
      "src/components/blog/ArticleKit.tsx",
      "src/pages/seo/CursuriArabaAdolescenti.tsx",
      "src/pages/en/LearnLebaneseArabic.tsx",
      "src/pages/de/ArabischLernen.tsx",
    ];
    for (const f of files) {
      const src = readFileSync(resolve(process.cwd(), f), "utf8");
      // Each solid-background link must carry the opt-out marker.
      const solid = src.match(/className="[^"]*bg-primary[^"]*text-primary-foreground[^"]*"/g) ?? [];
      const marked = (src.match(/data-cta/g) ?? []).length;
      expect(marked, `${f} has ${solid.length} solid button(s) but ${marked} data-cta marker(s)`)
        .toBeGreaterThanOrEqual(solid.length);
    }
  });
});
