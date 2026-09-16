import { render } from "@testing-library/react";
import { RouterProvider, createMemoryHistory, createRouter, stringifySearchWith } from "@tanstack/react-router";
import { QueryClient } from "@tanstack/react-query";
import { routeTree } from "@/routeTree.gen";
import type { ReactNode } from "react";

/**
 * Mounts the real app at one URL.
 *
 * The routes are the ones the site ships, so a page that throws on render fails
 * here the way it would fail in a browser. History is in-memory, which is what
 * lets one test file visit ninety URLs in a row without a server; read the
 * landing path back from the returned router rather than window.location.
 */
/**
 * The root route renders the document shell (<html><head><body>) around the
 * page. jsdom already has a document, and React refuses to put an <html> inside
 * the container div — which renders nothing at all. The shell is replaced by a
 * pass-through so the page below it mounts; head tags are asserted elsewhere.
 */
function withoutDocumentShell() {
  const root = routeTree as unknown as { options: { shellComponent?: unknown } };
  root.options.shellComponent = ({ children }: { children: ReactNode }) => <>{children}</>;
  return routeTree;
}

export function renderRoute(path: string) {
  const router = createRouter({
    routeTree: withoutDocumentShell(),
    context: { queryClient: new QueryClient({ defaultOptions: { queries: { retry: false } } }) },
    history: createMemoryHistory({ initialEntries: [path] }),
    // Same search serialisation as src/router.tsx, or the tests would exercise
    // a router the site does not ship.
    stringifySearch: stringifySearchWith(JSON.stringify),
  });
  // HelmetProvider also lives inside the root route; a second one here would
  // give the page two heads to write into.
  const result = render(<RouterProvider router={router as never} />);
  return { ...result, router };
}

export function currentPath(router: { state: { location: { pathname: string } } }) {
  return router.state.location.pathname;
}
