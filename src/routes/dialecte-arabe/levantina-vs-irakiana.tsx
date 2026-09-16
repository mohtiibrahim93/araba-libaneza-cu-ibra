import { createFileRoute } from "@tanstack/react-router";
import { seoHead } from "@/lib/seoHead";
import LevantinaVsIrakiana from "@/pages/seo/dialecte/LevantinaVsIrakiana";

export const Route = createFileRoute("/dialecte-arabe/levantina-vs-irakiana")({
  head: () => seoHead("/dialecte-arabe/levantina-vs-irakiana"),
  component: LevantinaVsIrakiana,
});
