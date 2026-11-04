import { createFileRoute } from "@tanstack/react-router";
import { seoHead } from "@/lib/seoHead";
import Reviews from "@/pages/Reviews";

export const Route = createFileRoute("/recenzii")({
  head: () => seoHead("/recenzii"),
  component: () => <Reviews lang="ro" />,
});
