import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { seoHead } from "@/lib/seoHead";

/**
 * Structured data has to reach the HTML the server sends.
 *
 * It used to be collected by Helmet during a build-time render and dropped on
 * the floor, so 23 pages rendered an FAQ on screen and shipped no FAQPage
 * markup at all — the schema existed only in the client-side DOM, precisely
 * where a crawler that does not execute JavaScript cannot see it.
 *
 * The server now renders each route's head from src/lib/seoHead.ts, so the
 * JSON-LD is in the first byte of HTML. These read the head itself.
 */
const read = (f: string) => readFileSync(resolve(process.cwd(), f), "utf8");
const typesAt = (path: string) =>
  seoHead(path).scripts.map((s) => JSON.parse(s.children)["@type"] as string);

describe("structured data reaches the server-rendered HTML", () => {
  it("marks up the FAQ pages", () => {
    for (const path of ["/", "/intrebari-frecvente", "/en/faq"]) {
      expect(typesAt(path), `${path} ships no FAQPage`).toContain("FAQPage");
    }
  });

  it("marks up the blog posts as articles", () => {
    expect(typesAt("/blog/ce-este-arabizi")).toContain("Article");
  });

  it("never ships the same block twice on one page", () => {
    for (const path of ["/", "/en/faq", "/blog/ce-este-arabizi"]) {
      const types = typesAt(path);
      expect(new Set(types).size, `${path} repeats a block`).toBe(types.length);
    }
  });

  it("emits valid JSON-LD with a schema.org context", () => {
    for (const script of seoHead("/en/faq").scripts) {
      const json = JSON.parse(script.children) as Record<string, unknown>;
      expect(script.type).toBe("application/ld+json");
      expect(json["@context"]).toBe("https://schema.org");
    }
  });
});


/**
 * sameAs has to point somewhere other than this site.
 *
 * It read `${BASE_URL}/` on every page carrying the provider schema, which
 * says "this organisation is also itself". The field exists to tie the site
 * to independent profiles so search engines can read them as one entity, and
 * a self-reference ties it to nothing — the markup was present, valid, and
 * doing no work at all.
 */
describe("Organization sameAs", () => {
  const schema = readFileSync(resolve(process.cwd(), "src/lib/courseSchema.ts"), "utf8");

  it("is defined once and reused, not copied per page", () => {
    expect(schema).toContain("export const ORGANIZATION_SAME_AS");
    for (const f of [
      "src/components/course/CourseLayout.tsx",
      "src/pages/courses/CourseDetail.tsx",
    ]) {
      const src = readFileSync(resolve(process.cwd(), f), "utf8");
      expect(src, `${f} should reuse the shared list`).toContain("sameAs: ORGANIZATION_SAME_AS");
      expect(src, `${f} still has a hand-rolled sameAs`).not.toMatch(/sameAs: `\$\{BASE_URL\}/);
    }
  });

  it("never lists this site as its own sameAs", () => {
    const block = schema.slice(
      schema.indexOf("ORGANIZATION_SAME_AS"),
      schema.indexOf("COURSE_PROVIDER"),
    );
    expect(block).not.toContain("BASE_URL");
    expect(block).not.toContain("centruldearabalibaneza.com");
  });

  it("lists at least one real external profile", () => {
    const block = schema.slice(
      schema.indexOf("ORGANIZATION_SAME_AS"),
      schema.indexOf("COURSE_PROVIDER"),
    );
    expect(block).toMatch(/https:\/\/[a-z0-9.-]+\.[a-z]{2,}/);
  });
});
