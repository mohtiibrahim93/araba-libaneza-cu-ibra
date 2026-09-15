import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/cursuri/online")({
  beforeLoad: () => {
    throw redirect({ href: "/cursuri", statusCode: 301 });
  },
});
