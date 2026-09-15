import { createFileRoute } from "@tanstack/react-router";
import { seoHead } from "@/lib/seoHead";
import SeoIntrebariFrecvente from "@/pages/seo/IntrebariFrecvente";

export const Route = createFileRoute("/intrebari-frecvente")({
  head: () => seoHead("/intrebari-frecvente"),
  component: SeoIntrebariFrecvente,
});
