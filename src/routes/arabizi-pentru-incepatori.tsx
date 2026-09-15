import { createFileRoute, redirect } from "@tanstack/react-router";

/**
 * Legacy address for the Arabizi guide. It was retired in favour of /arabizi
 * and lost its redirect when the old prerender script was disconnected, so it
 * fell through to the 404 view. Restored here as a permanent redirect for old
 * external links and stale search results.
 */
export const Route = createFileRoute("/arabizi-pentru-incepatori")({
  beforeLoad: () => {
    throw redirect({ href: "/arabizi", statusCode: 301 });
  },
});
