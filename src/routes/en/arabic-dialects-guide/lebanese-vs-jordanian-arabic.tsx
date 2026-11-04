import { createFileRoute } from "@tanstack/react-router";
import { seoHead } from "@/lib/seoHead";
import LebaneseVsJordanian from "@/pages/en/dialects/LebaneseVsJordanian";

export const Route = createFileRoute(
  "/en/arabic-dialects-guide/lebanese-vs-jordanian-arabic",
)({
  head: () =>
    seoHead("/en/arabic-dialects-guide/lebanese-vs-jordanian-arabic"),
  component: LebaneseVsJordanian,
});
