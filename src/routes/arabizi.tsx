import { createFileRoute } from "@tanstack/react-router";
import SeoArabizi from "@/pages/seo/Arabizi";

export const Route = createFileRoute("/arabizi")({
  component: SeoArabizi,
});
