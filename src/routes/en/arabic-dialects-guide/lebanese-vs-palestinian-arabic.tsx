import { createFileRoute } from "@tanstack/react-router";
import { seoHead } from "@/lib/seoHead";
import LebaneseVsPalestinian from "@/pages/en/dialects/LebaneseVsPalestinian";

export const Route = createFileRoute(
  "/en/arabic-dialects-guide/lebanese-vs-palestinian-arabic",
)({
  head: () =>
    seoHead("/en/arabic-dialects-guide/lebanese-vs-palestinian-arabic"),
  component: LebaneseVsPalestinian,
});
