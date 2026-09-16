import { createFileRoute } from "@tanstack/react-router";
import { seoHead } from "@/lib/seoHead";
import { blogPageFrom } from "@/lib/blogPagination";
import BlogIndex from "@/pages/blog/BlogIndex";

export const Route = createFileRoute("/blog/")({
  // Each page of the index is its own canonical. Read through the same
  // clamping the component uses, so the head and the body never disagree about
  // which page this is.
  head: ({ match }) => {
    const page = blogPageFrom((match.search as { page?: unknown } | undefined)?.page);
    return seoHead("/blog", page > 1 ? { canonicalSearch: `?page=${page}` } : undefined);
  },
  component: BlogIndex,
});
