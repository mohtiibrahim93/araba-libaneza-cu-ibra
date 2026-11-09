import { createFileRoute, redirect } from "@tanstack/react-router";

// The German page was removed on 8 November 2026 (no German site yet).
export const Route = createFileRoute("/de/arabisch-lernen")({
  beforeLoad: () => {
    throw redirect({ href: "/cursuri-limba-araba", statusCode: 301 });
  },
});
