import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// The owner re-added the Search Console tag on 13 October 2026; it was lost
// once when Lovable's workspace was reset to main, so a test now guards it.
describe("Search Console verification", () => {
  it("is in the site-wide head", () => {
    const root = readFileSync(resolve(process.cwd(), "src/routes/__root.tsx"), "utf8");
    expect(root).toContain('{ name: "google-site-verification", content: "O4lPkW4s-d2rF0NNhpyeNU-6yhLxvox4c73Hz2lcoKU" }');
  });
});
