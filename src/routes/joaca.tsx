import { createFileRoute, redirect } from "@tanstack/react-router";

/**
 * The game moved to /joc — the shorter word people actually search for, and the
 * one the game is named with on the site ("Jocul Yalla"). The old address is
 * kept as a permanent redirect: it was indexed and linked from the sitemap.
 */
export const Route = createFileRoute("/joaca")({
  beforeLoad: () => {
    throw redirect({ href: "/joc", statusCode: 301 });
  },
});
