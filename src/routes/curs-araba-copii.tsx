import { createFileRoute } from "@tanstack/react-router";
import { seoHead } from "@/lib/seoHead";
import SeoCursArabaCopii from "@/pages/seo/CursArabaCopii";

export const Route = createFileRoute("/curs-araba-copii")({
  head: () => seoHead("/curs-araba-copii"),
  component: SeoCursArabaCopii,
});
