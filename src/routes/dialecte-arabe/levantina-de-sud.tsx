import { createFileRoute } from "@tanstack/react-router";
import { seoHead } from "@/lib/seoHead";
import LevantinaDeSud from "@/pages/seo/dialecte/LevantinaDeSud";

export const Route = createFileRoute(
  "/dialecte-arabe/levantina-de-sud",
)({
  head: () => seoHead("/dialecte-arabe/levantina-de-sud"),
  component: LevantinaDeSud,
});
