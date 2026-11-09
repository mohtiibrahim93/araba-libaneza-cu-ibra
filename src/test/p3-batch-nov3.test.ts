import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { seoHead } from "@/lib/seoHead";

// P3 findings (docs/SITE_AUDIT_2026-10.md), fixed 3 Nov 2026.
const read = (p: string) => readFileSync(p, "utf8");
const titleOf = (h: ReturnType<typeof seoHead>) =>
  (h.meta.find((m) => "title" in m) as { title?: string } | undefined)?.title ??
  "";

describe("P3 fixes", () => {
  it("blog page 2 has its own title (SEO #5)", () => {
    const p1 = titleOf(seoHead("/blog"));
    const p2 = titleOf(
      seoHead("/blog", { canonicalSearch: "?page=2", page: 2 }),
    );
    expect(p2).toBe(`${p1} — Pagina 2`);
  });

  it("one Article block per article, breadcrumbs in the reader's language (SEO #1, #2)", () => {
    const layout = read("src/components/blog/BlogArticleLayout.tsx");
    expect(layout).toMatch(
      /\{!served && \(\s*<script type="application\/ld\+json">\s*\{JSON\.stringify\(articleJsonLd\)\}/,
    );
    expect(layout).toContain(
      'lang === "en" ? `${BASE}/en/blog` : `${BASE}/blog`',
    );
  });

  it("HowTo steps have their anchors (SEO #4)", () => {
    expect(read("src/components/blog/ArticleKit.tsx")).toContain(
      "id={`step-${i + 1}`}",
    );
  });

  it("public pages link in the reader's language (i18n #1)", () => {
    for (const f of [
      "src/components/FAQSection.tsx",
      "src/components/courses/CourseCard.tsx",
      "src/pages/courses/CourseDetail.tsx",
    ])
      expect(read(f)).toContain(
        'import { Link } from "@/components/LocalizedLink";',
      );
  });

  it("contrast: WhatsApp pill and top-bar gold (a11y #1)", () => {
    const nav = read("src/components/Navbar.tsx");
    expect(nav).not.toContain("bg-[#25D366]");
    // The gold is a colour setting since 9 Nov 2026; same value as #F3DDA8.
    expect(nav).toContain("text-top-bar-gold");
    expect(read("src/styles.css")).toContain(
      "--top-bar-gold: 42.4 75.8% 80.6%;",
    );
  });

  it("reduced motion stops decorative pulses (a11y #7)", () => {
    expect(read("src/styles.css")).toContain("prefers-reduced-motion: reduce");
  });

  it("resources teaser goes to /resurse; banner shows free seats (design #7, #9)", () => {
    expect(read("src/components/ResourcesTeaser.tsx")).toContain(
      'to="/resurse"',
    );
    expect(read("src/components/ActiveCoursesBanner.tsx")).toContain(
      "locuri libere",
    );
  });
});
