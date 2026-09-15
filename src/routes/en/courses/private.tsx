import { createFileRoute } from "@tanstack/react-router";
import CursPrivate from "@/pages/courses/CursPrivate";

export const Route = createFileRoute("/en/courses/private")({
  component: CursPrivate,
});
