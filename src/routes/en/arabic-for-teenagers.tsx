import { createFileRoute } from "@tanstack/react-router";
import { seoHead } from "@/lib/seoHead";
import ArabicForTeenagers from "@/pages/en/ArabicForTeenagers";

export const Route = createFileRoute("/en/arabic-for-teenagers")({
  head: () => seoHead("/en/arabic-for-teenagers"),
  component: ArabicForTeenagers,
});
