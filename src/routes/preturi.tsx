import { createFileRoute } from "@tanstack/react-router";
import { seoHead } from "@/lib/seoHead";
import Preturi from "@/pages/Preturi";

export const Route = createFileRoute("/preturi")({
  head: () => seoHead("/preturi"),
  component: Preturi,
});
