import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { screen } from "@testing-library/react";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";
import { renderRoute } from "./helpers/appRouter";
import { seoHead } from "@/lib/seoHead";
import { COURSE_INSTRUCTOR } from "@/lib/courseSchema";
import { ONLINE_PRICES, physicalPrice } from "@/lib/pricing";

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

  /**
   * Just the array literal. It used to be "everything up to COURSE_PROVIDER",
   * which swept in whatever was declared in between — the teacher's Person node
   * sits there now, and its @id is built from BASE_URL, so the check failed on a
   * list that was perfectly fine.
   */
  const sameAsList = () => {
    const start = schema.indexOf("ORGANIZATION_SAME_AS");
    // "= [", not the first "[" — that one belongs to `readonly string[]`.
    const open = schema.indexOf("= [", start) + 2;
    return schema.slice(open, schema.indexOf("]", open) + 1);
  };

  it("never lists this site as its own sameAs", () => {
    expect(sameAsList()).not.toContain("BASE_URL");
    expect(sameAsList()).not.toContain("centruldearabalibaneza.com");
  });

  it("lists at least one real external profile", () => {
    expect(sameAsList()).toMatch(/https:\/\/[a-z0-9.-]+\.[a-z]{2,}/);
  });
});

/**
 * The teacher is one person, named, and the levels are courses with a price.
 *
 * An answer engine asked "who teaches Lebanese Arabic in Bucharest, and what
 * does it cost" reads exactly this. It used to find an instructor called "Ibra"
 * with nothing to match him to, and — on the six level pages, the ones those
 * questions actually land on — no Course markup at all, only a breadcrumb.
 */
describe("the teacher and the levels are identifiable", () => {
  afterEach(cleanup);

  it("names the instructor in full, keeping Ibra as the alternate", () => {
    expect(COURSE_INSTRUCTOR.name).toBe("Ibrahim Gabriel Moaty");
    expect(COURSE_INSTRUCTOR.alternateName).toBe("Ibra");
    // Profiles that carry his own name, so the person can be matched.
    expect(COURSE_INSTRUCTOR.sameAs.length).toBeGreaterThan(1);
    for (const url of COURSE_INSTRUCTOR.sameAs) {
      expect(url, `${url} should be an external profile`).not.toContain(
        "centruldearabalibaneza.com",
      );
    }
  });

  it("declares him site-wide as the organisation's founder", () => {
    // Same @id in both blocks, or they describe two different people.
    const root = read("src/routes/__root.tsx");
    expect(root).toContain('founder: { "@id": COURSE_INSTRUCTOR["@id"] }');
    expect(root).toContain("COURSE_INSTRUCTOR,");
  });

  it("marks up a level page as a Course, priced from the pricing module", async () => {
    window.localStorage.setItem("site-language", "ro");
    renderRoute("/cursuri/grup/a1");
    await screen.findByRole("heading", { level: 1 }, { timeout: 8000 });

    const course = [...document.querySelectorAll('script[type="application/ld+json"]')]
      .map((el) => {
        try {
          return JSON.parse(el.textContent || "{}") as Record<string, unknown>;
        } catch {
          return {};
        }
      })
      .find((json) => json["@type"] === "Course");

    expect(course, "/cursuri/grup/a1 should carry Course markup").toBeTruthy();
    expect(course!["educationalLevel"]).toBe("CEFR A1");

    const instructor = (course!["hasCourseInstance"] as Record<string, unknown>[])[0]![
      "instructor"
    ] as Record<string, unknown>;
    expect(instructor["name"]).toBe("Ibrahim Gabriel Moaty");

    // The numbers are the page's own, not a second copy that can go stale.
    const online = ONLINE_PRICES.groupMonthly.A1;
    const prices = (course!["offers"] as Record<string, unknown>[]).map(
      (offer) => (offer["priceSpecification"] as Record<string, unknown>)["price"],
    );
    expect(prices).toEqual([online, physicalPrice(online)]);
    // A monthly fee has to say so, or it reads as the price of the whole course.
    for (const offer of course!["offers"] as Record<string, unknown>[]) {
      expect((offer["priceSpecification"] as Record<string, unknown>)["billingDuration"]).toBe("P1M");
    }
  });
});
