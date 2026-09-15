import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/blog/learn-lebanese-arabic")({
  beforeLoad: () => {
    throw redirect({ href: "/blog/cum-inveti-araba-libaneza", statusCode: 301 });
  },
});
