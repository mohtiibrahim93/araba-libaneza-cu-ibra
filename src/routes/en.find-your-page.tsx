import { createFileRoute } from "@tanstack/react-router";
import { seoHead } from "@/lib/seoHead";
import FindYourPage from "@/pages/FindYourPage";

export const Route = createFileRoute("/en/find-your-page")({
  head: () => seoHead("/en/find-your-page"),
  component: () => <FindYourPage lang="en" />,
});
