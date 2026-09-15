import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/invata-araba")({
  beforeLoad: () => {
    throw redirect({ href: "/cursuri-limba-araba", statusCode: 301 });
  },
});
