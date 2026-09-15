import { createFileRoute } from "@tanstack/react-router";
import { seoHead } from "@/lib/seoHead";
import CumSalutiInLibaneza from "@/pages/blog/CumSalutiInLibaneza";

export const Route = createFileRoute("/blog/cum-saluti-in-libaneza")({
  head: () => seoHead("/blog/cum-saluti-in-libaneza"),
  component: CumSalutiInLibaneza,
});
