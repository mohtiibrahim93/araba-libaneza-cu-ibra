import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/cursuri/tineri")({
  beforeLoad: () => {
    throw redirect({ href: "/cursuri-araba-adolescenti", statusCode: 301 });
  },
});
