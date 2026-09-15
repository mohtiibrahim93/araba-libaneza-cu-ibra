import { createFileRoute } from "@tanstack/react-router";
import { seoHead } from "@/lib/seoHead";
import Quiz from "@/pages/Quiz";

export const Route = createFileRoute("/quiz")({
  head: () => seoHead("/quiz"),
  component: Quiz,
});
