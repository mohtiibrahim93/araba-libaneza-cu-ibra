import { createFileRoute } from "@tanstack/react-router";
import CursGrup from "@/pages/courses/CursGrup";

export const Route = createFileRoute("/cursuri/grup/")({
  component: CursGrup,
});
