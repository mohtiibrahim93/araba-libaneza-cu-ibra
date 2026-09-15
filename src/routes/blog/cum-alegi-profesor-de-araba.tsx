import { createFileRoute } from "@tanstack/react-router";
import { seoHead } from "@/lib/seoHead";
import CumAlegiProfesor from "@/pages/blog/CumAlegiProfesor";

export const Route = createFileRoute("/blog/cum-alegi-profesor-de-araba")({
  head: () => seoHead("/blog/cum-alegi-profesor-de-araba"),
  component: CumAlegiProfesor,
});
