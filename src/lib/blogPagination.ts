import { blogPostsNewestFirst } from "@/lib/blogPosts";

/**
 * Where the blog index splits into pages, in one place.
 *
 * The page number is read twice — once by the component, which decides what to
 * render and writes the runtime canonical, and once by the route's `head()`,
 * which writes the server-rendered one. They have to agree: when the head said
 * /blog and the component said /blog?page=2, page two shipped two conflicting
 * canonicals and asked Google both to index it and to fold it into page one.
 *
 * Clamping lives here for the same reason. ?page=0, ?page=99 and ?page=abc are
 * all things a stray link or a crawler will ask for, and the head must land on
 * the same clamped page the reader is actually shown.
 */
export const BLOG_PER_PAGE = 12;

export const blogTotalPages = (): number =>
  Math.max(1, Math.ceil(blogPostsNewestFirst.length / BLOG_PER_PAGE));

/** Parses and clamps whatever arrived as ?page=. Anything unusable is page 1. */
export function blogPageFrom(raw: unknown): number {
  const n = Number.parseInt(String(raw ?? "1"), 10);
  if (!Number.isFinite(n)) return 1;
  return Math.min(Math.max(n, 1), blogTotalPages());
}

/** Page one lives at the bare index; the rest carry ?page=. */
export const blogPageHref = (base: string, page: number): string =>
  page === 1 ? base : `${base}?page=${page}`;
