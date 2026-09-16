/**
 * Search params are serialised verbatim.
 *
 * TanStack's default stringifier JSON-encodes any string value that happens to
 * parse as JSON, so that it round-trips back as a string. `page=2` therefore
 * became `?page=%222%22`, and the blog's own "2" button led to a URL whose
 * page parameter was the three characters `"2"`. Number.parseInt could not read
 * it, so page two silently rendered page one — and the ugly URL was what got
 * shared and crawled.
 *
 * Nothing here reads search through `useSearch` or `validateSearch`: every call
 * site goes through the react-router shim in src/lib/router-compat.tsx, which
 * deals in plain strings and reads them back off the raw query string. Dropping
 * the parser argument keeps objects JSON-encoded and leaves strings alone,
 * which is the react-router behaviour the shim exists to reproduce.
 */
import { QueryClient } from "@tanstack/react-query";
import { createRouter, stringifySearchWith } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  const queryClient = new QueryClient();

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    stringifySearch: stringifySearchWith(JSON.stringify),
    defaultPreloadStaleTime: 0,
  });

  return router;
};
