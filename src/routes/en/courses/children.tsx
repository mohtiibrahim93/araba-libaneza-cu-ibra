import { createFileRoute } from "@tanstack/react-router";
import { seoHead } from "@/lib/seoHead";
import CursCopii from "@/pages/courses/CursCopii";

export const Route = createFileRoute("/en/courses/children")({
  head: () => seoHead("/en/courses/children"),
  component: CursCopii,
});
