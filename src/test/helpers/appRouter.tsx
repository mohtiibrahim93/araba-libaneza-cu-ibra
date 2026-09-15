import { render } from "@testing-library/react";
import { RouterProvider, createMemoryHistory, createRouter } from "@tanstack/react-router";
import { QueryClient } from "@tanstack/react-query";
import { HelmetProvider } from "react-helmet-async";
import { routeTree } from "@/routeTree.gen";

/**
 * Mounts the real app at one URL.
 *
 * The routes are the ones the site ships, so a page that throws on render fails
 * here the way it would fail in a browser. History is in-memory, which is what
 * lets one test file visit ninety URLs in a row without a server; read the
 * landing path back from the returned router rather than window.location.
 */
export function renderRoute(path: string) {
  const router = createRouter({
    routeTree,
    context: { queryClient: new QueryClient({ defaultOptions: { queries: { retry: false } } }) },
    history: createMemoryHistory({ initialEntries: [path] }),
  });
  const result = render(
    <HelmetProvider>
      <RouterProvider router={router as never} />
    </HelmetProvider>,
  );
  return { ...result, router };
}

export function currentPath(router: { state: { location: { pathname: string } } }) {
  return router.state.location.pathname;
}
