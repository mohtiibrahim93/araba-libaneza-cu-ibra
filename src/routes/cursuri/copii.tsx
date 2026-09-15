import { createFileRoute } from "@tanstack/react-router";
import { seoHead } from "@/lib/seoHead";
import CursCopii from "@/pages/courses/CursCopii";

export const Route = createFileRoute("/cursuri/copii")({
  head: () => seoHead("/cursuri/copii"),
  component: CursCopii,
});
