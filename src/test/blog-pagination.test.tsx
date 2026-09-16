import { screen, cleanup, within } from "@testing-library/react";
import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { renderRoute } from "./helpers/appRouter";
import { blogPostsNewestFirst } from "@/lib/blogPosts";
import { BLOG_PER_PAGE } from "@/lib/blogPagination";
import { seoHead } from "@/lib/seoHead";

/**
 * Page two of the blog, which did not work.
 *
 * The pager's "2" button produced `/blog?page=%222%22`: TanStack's default
 * search stringifier JSON-encodes any string that parses as JSON, so the page
 * number arrived as the three characters `"2"`. Number.parseInt read NaN,
 * clamped to page one, and the button appeared to do nothing — while the URL
 * that got shared and crawled carried the encoded quotes.
 *
 * Two assertions, because the two halves failed independently: the href the
 * pager writes, and what the page renders when that href is opened.
 */
const PER_PAGE = BLOG_PER_PAGE;

describe("the server-rendered head follows the page", () => {
  // The component wrote a self-canonical for page two while the route head
  // still pointed at page one, so page two shipped two conflicting canonicals:
  // one asking to be indexed, one asking to be folded away.
  const canonicalOf = (head: ReturnType<typeof seoHead>) =>
    head.links?.find((l) => l["rel"] === "canonical")?.["href"];

  it("canonicalises page one at the bare index", () => {
    expect(canonicalOf(seoHead("/blog"))).toBe("https://centruldearabalibaneza.com/blog");
  });

  it("canonicalises page two at itself, in both languages", () => {
    expect(canonicalOf(seoHead("/blog", { canonicalSearch: "?page=2" }))).toBe(
      "https://centruldearabalibaneza.com/blog?page=2",
    );
    expect(canonicalOf(seoHead("/en/blog", { canonicalSearch: "?page=2" }))).toBe(
      "https://centruldearabalibaneza.com/en/blog?page=2",
    );
  });
});

describe("blog pagination", () => {
  beforeEach(() => {
    window.localStorage.setItem("site-language", "ro");
  });

  afterEach(cleanup);

  it("links page two at a plain ?page=2", async () => {
    renderRoute("/blog");
    const pager = await screen.findByRole("navigation", { name: "Paginare" });
    const two = within(pager).getByRole("link", { name: "Pagina 2" });
    expect(two).toHaveAttribute("href", "/blog?page=2");
  });

  it("renders the remaining articles on page two, not the first page again", async () => {
    renderRoute("/blog?page=2");
    // Wait for the grid rather than the pager: the pager exists on page one too.
    const pager = await screen.findByRole("navigation", { name: "Paginare" });
    expect(within(pager).getByRole("link", { name: "Pagina 2" })).toHaveAttribute(
      "aria-current",
      "page",
    );

    const onPageOne = blogPostsNewestFirst[0];
    const onPageTwo = blogPostsNewestFirst[PER_PAGE];
    expect(onPageOne, "the blog has no articles").toBeDefined();
    expect(onPageTwo, "the blog no longer spills onto a second page").toBeDefined();
    // The newest article heads page one; it must not also head page two.
    expect(screen.queryByRole("heading", { name: onPageOne!.title.ro })).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: onPageTwo!.title.ro })).toBeInTheDocument();
  });
});
