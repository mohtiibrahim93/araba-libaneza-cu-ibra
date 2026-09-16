import { createFileRoute } from "@tanstack/react-router";
import { seoHead } from "@/lib/seoHead";
import LevantinaVsGolf from "@/pages/seo/dialecte/LevantinaVsGolf";

export const Route = createFileRoute("/dialecte-arabe/levantina-vs-golf")({
  head: () => seoHead("/dialecte-arabe/levantina-vs-golf"),
  component: LevantinaVsGolf,
});
