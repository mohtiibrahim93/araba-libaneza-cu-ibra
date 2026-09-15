import { createFileRoute } from "@tanstack/react-router";
import { seoHead } from "@/lib/seoHead";
import CumInvetiArabaLibaneza from "@/pages/blog/CumInvetiArabaLibaneza";

export const Route = createFileRoute("/blog/cum-inveti-araba-libaneza")({
  head: () => seoHead("/blog/cum-inveti-araba-libaneza"),
  component: CumInvetiArabaLibaneza,
});
