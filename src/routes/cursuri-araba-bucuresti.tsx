import { createFileRoute } from "@tanstack/react-router";
import { seoHead } from "@/lib/seoHead";
import SeoCursuriArabaBucuresti from "@/pages/seo/CursuriArabaBucuresti";

export const Route = createFileRoute("/cursuri-araba-bucuresti")({
  head: () => seoHead("/cursuri-araba-bucuresti"),
  component: SeoCursuriArabaBucuresti,
});
