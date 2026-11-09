import { createFileRoute, redirect } from "@tanstack/react-router";

// The German page was removed on 8 November 2026 (no German site yet). Its
// address sends visitors to the Romanian homepage (owner, 9 Nov 2026).
export const Route = createFileRoute("/de/arabisch-lernen")({
  beforeLoad: () => {
    throw redirect({ href: "/", statusCode: 301 });
  },
});
