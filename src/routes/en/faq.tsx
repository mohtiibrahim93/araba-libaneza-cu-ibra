import { createFileRoute } from "@tanstack/react-router";
import { seoHead } from "@/lib/seoHead";
import EnFaq from "@/pages/en/Faq";

export const Route = createFileRoute("/en/faq")({
  head: () => seoHead("/en/faq"),
  component: EnFaq,
});
