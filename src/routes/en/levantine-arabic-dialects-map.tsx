import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/en/levantine-arabic-dialects-map")({
  beforeLoad: () => {
    throw redirect({ href: "/en/arabic-dialects-guide", statusCode: 301 });
  },
});
