import { createFileRoute } from "@tanstack/react-router";
import { seoHead } from "@/lib/seoHead";
import CatCostaCursurile from "@/pages/blog/CatCostaCursurile";

export const Route = createFileRoute("/blog/cat-costa-cursurile-de-araba-libaneza")({
  head: () => seoHead("/blog/cat-costa-cursurile-de-araba-libaneza"),
  component: CatCostaCursurile,
});
