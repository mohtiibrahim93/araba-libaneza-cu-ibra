import { createFileRoute } from "@tanstack/react-router";
import { seoHead } from "@/lib/seoHead";
import CursAdulti from "@/pages/courses/CursAdulti";

export const Route = createFileRoute("/cursuri/adulti")({
  head: () => seoHead("/cursuri/adulti"),
  component: CursAdulti,
});
