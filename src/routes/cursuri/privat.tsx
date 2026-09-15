import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/cursuri/privat")({
  beforeLoad: () => {
    throw redirect({ href: "/cursuri/private", statusCode: 301 });
  },
});
