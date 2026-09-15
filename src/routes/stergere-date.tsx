import { createFileRoute } from "@tanstack/react-router";
import DataDeletion from "@/pages/DataDeletion";

export const Route = createFileRoute("/stergere-date")({
  component: DataDeletion,
});
