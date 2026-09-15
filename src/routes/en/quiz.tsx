import { createFileRoute } from "@tanstack/react-router";
import { seoHead } from "@/lib/seoHead";
import Quiz from "@/pages/Quiz";

export const Route = createFileRoute("/en/quiz")({
  head: () => seoHead("/en/quiz"),
  component: Quiz,
});
