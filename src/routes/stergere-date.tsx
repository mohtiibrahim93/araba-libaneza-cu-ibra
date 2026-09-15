import { createFileRoute } from "@tanstack/react-router";
import { seoHead } from "@/lib/seoHead";
import DataDeletion from "@/pages/DataDeletion";

export const Route = createFileRoute("/stergere-date")({
  head: () => seoHead("/stergere-date"),
  component: DataDeletion,
});
