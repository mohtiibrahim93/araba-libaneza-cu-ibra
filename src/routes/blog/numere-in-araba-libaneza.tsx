import { createFileRoute } from "@tanstack/react-router";
import { seoHead } from "@/lib/seoHead";
import NumereInLibaneza from "@/pages/blog/NumereInLibaneza";

export const Route = createFileRoute("/blog/numere-in-araba-libaneza")({
  head: () => seoHead("/blog/numere-in-araba-libaneza"),
  component: NumereInLibaneza,
});
