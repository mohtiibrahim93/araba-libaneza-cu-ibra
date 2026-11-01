import { createFileRoute, redirect } from "@tanstack/react-router";

// Marketing links were shared with /lectie-gratuita (1 Nov 2026); the free
// lesson lives at /trial. The query (utm_*) is kept.
export const Route = createFileRoute("/lectie-gratuita")({
  beforeLoad: ({ location }) => {
    throw redirect({
      href: "/trial" + location.searchStr,
      statusCode: 301,
    });
  },
});
