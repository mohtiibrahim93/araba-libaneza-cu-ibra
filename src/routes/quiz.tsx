import { createFileRoute } from "@tanstack/react-router";
import Quiz from "@/pages/Quiz";

export const Route = createFileRoute("/quiz")({
  component: Quiz,
});
