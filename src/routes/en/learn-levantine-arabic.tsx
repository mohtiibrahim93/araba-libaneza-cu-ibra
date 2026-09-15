import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/en/learn-levantine-arabic")({
  beforeLoad: () => {
    throw redirect({ href: "/en/learn-lebanese-arabic", statusCode: 301 });
  },
});
