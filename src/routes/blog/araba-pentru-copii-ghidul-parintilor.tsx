import { createFileRoute } from "@tanstack/react-router";
import { seoHead } from "@/lib/seoHead";
import ArabaPentruCopii from "@/pages/blog/ArabaPentruCopii";

export const Route = createFileRoute("/blog/araba-pentru-copii-ghidul-parintilor")({
  head: () => seoHead("/blog/araba-pentru-copii-ghidul-parintilor"),
  component: ArabaPentruCopii,
});
