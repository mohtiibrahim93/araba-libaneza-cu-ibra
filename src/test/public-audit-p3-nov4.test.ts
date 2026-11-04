import { readFileSync, existsSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { seoHead } from "@/lib/seoHead";
import { BLOG_POSTS } from "@/lib/blogPosts";

// P3 items from docs/SITE_AUDIT_2026-10.md and the owner's answers of
// 4 Nov 2026 (hours 09:00–18:00, no MSA, ANPC link).
const read = (p: string) => readFileSync(p, "utf8");

describe("owner facts, 4 Nov 2026", () => {
  it("one set of opening hours, 09:00–18:00 every day", () => {
    for (const f of [
      "src/pages/Index.tsx",
      "src/pages/seo/CursuriArabaBucuresti.tsx",
    ]) {
      const src = read(f);
      expect(src).toContain('opens: "09:00"');
      expect(src).toContain('closes: "18:00"');
    }
  });

  it("no page offers MSA, the German one included", () => {
    expect(read("src/pages/de/ArabischLernen.tsx")).not.toContain(
      "MSA können wir später ergänzen",
    );
  });

  it("the footer links to ANPC's dispute platform, and the terms name it", () => {
    expect(read("src/components/Footer.tsx")).toContain(
      "https://reclamatiisal.anpc.ro/",
    );
    const terms = read("src/pages/Terms.tsx");
    expect(terms).toContain("10. Soluționarea litigiilor");
    expect(terms).toContain("10. Dispute resolution");
  });
});

describe("i18n on English and German pages", () => {
  it("WhatsApp messages have an English version", () => {
    for (const f of [
      "src/components/HeroSection.tsx",
      "src/components/WhatsAppButton.tsx",
      "src/components/NativeScheduler.tsx",
      "src/components/ProgramsSection.tsx",
    ])
      expect(read(f)).toMatch(/Hi! I/);
  });

  it("the error page and the game frame follow the language", () => {
    expect(read("src/routes/__root.tsx")).toContain("Pagina nu s-a încărcat");
    expect(read("src/components/YallaGame.tsx")).toContain(
      "title={TITLES[lang][mode]}",
    );
  });

  it("the German page leads to the English trial, not the Romanian one", () => {
    const de = read("src/pages/de/ArabischLernen.tsx");
    expect(de).toContain('to="/en/trial"');
    expect(de).not.toContain('to="/trial"');
  });
});

describe("SEO and accessibility", () => {
  it("dateModified uses an article's updated date when it has one", () => {
    const post = BLOG_POSTS.find((p) => !p.updated)!;
    const json = seoHead(`/blog/${post.slug}`)
      .scripts.map((s) => s.children)
      .find((c) => c.includes('"Article"'));
    expect(JSON.parse(json ?? "{}").dateModified).toBe(post.published);
    expect(read("src/lib/seoHead.ts")).toContain(
      "dateModified: route.modified ?? route.published",
    );
  });

  it("/invata-araba-gratis does not jump from h1 to h3", () => {
    expect(read("src/pages/seo/InvataArabaGratis.tsx")).toContain(
      "headingLevel={2}",
    );
  });
});

describe("code clean-up", () => {
  it("unused admin GroupOverview is gone", () => {
    expect(existsSync("src/components/admin/GroupOverview.tsx")).toBe(false);
  });

  it("seat badges share one realtime channel per set of tables", () => {
    for (const f of [
      "src/hooks/useGroupCohorts.ts",
      "src/hooks/useGroupCapacity.ts",
      "src/hooks/useKidsSlots.ts",
    ]) {
      const src = read(f);
      expect(src).toContain("subscribeToTables(");
      expect(src).not.toContain(".channel(");
    }
  });

  it("drizzle is pinned to a minor version", () => {
    const pkg = read("package.json");
    expect(pkg).not.toContain('"drizzle-kit": "0.x"');
    expect(pkg).not.toContain('"drizzle-orm": "0.x"');
  });
});
