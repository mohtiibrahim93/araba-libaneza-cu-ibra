import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/araba-online")({
  beforeLoad: () => {
    throw redirect({ href: "/cursuri-limba-araba", statusCode: 301 });
  },
});
