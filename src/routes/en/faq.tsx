import { createFileRoute } from "@tanstack/react-router";
import EnFaq from "@/pages/en/Faq";

export const Route = createFileRoute("/en/faq")({
  component: EnFaq,
});
