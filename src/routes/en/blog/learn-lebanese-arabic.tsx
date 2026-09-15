import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/en/blog/learn-lebanese-arabic")({
  beforeLoad: () => {
    throw redirect({ href: "/en/blog/cum-inveti-araba-libaneza", statusCode: 301 });
  },
});
