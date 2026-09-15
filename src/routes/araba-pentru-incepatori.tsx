import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/araba-pentru-incepatori")({
  beforeLoad: () => {
    throw redirect({ href: "/cursuri-limba-araba", statusCode: 301 });
  },
});
