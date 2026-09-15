import { RouterProvider, createMemoryHistory, createRootRoute, createRouter } from "@tanstack/react-router";
import type { ReactNode } from "react";

/**
 * Renders a component tree inside a real router, the way a page does.
 *
 * Components reach for the router through @/lib/router-compat (Link,
 * useLocation, useNavigate), so they cannot render outside one. This mounts the
 * children as the whole route tree at a chosen path — enough for links to build
 * their hrefs and for location reads to answer, without pulling in the app's
 * ~90 routes.
 */
export function MemoryRouter({ children, initialPath = "/" }: { children: ReactNode; initialPath?: string }) {
  const rootRoute = createRootRoute({ component: () => <>{children}</> });
  const router = createRouter({
    routeTree: rootRoute,
    history: createMemoryHistory({ initialEntries: [initialPath] }),
  });
  return <RouterProvider router={router as never} />;
}
