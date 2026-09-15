import { createFileRoute } from "@tanstack/react-router";
import SeoIntrebariFrecvente from "@/pages/seo/IntrebariFrecvente";

export const Route = createFileRoute("/intrebari-frecvente")({
  component: SeoIntrebariFrecvente,
});
