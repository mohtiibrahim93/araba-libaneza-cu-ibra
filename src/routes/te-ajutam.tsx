import { createFileRoute } from "@tanstack/react-router";
import { seoHead } from "@/lib/seoHead";
import FindYourPage from "@/pages/FindYourPage";

export const Route = createFileRoute("/te-ajutam")({
  head: () => seoHead("/te-ajutam"),
  component: () => <FindYourPage lang="ro" />,
});
