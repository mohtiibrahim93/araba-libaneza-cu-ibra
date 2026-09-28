import { createFileRoute } from "@tanstack/react-router";
import { seoHead } from "@/lib/seoHead";
import DataDeletion from "@/pages/DataDeletion";

export const Route = createFileRoute("/en/data-deletion")({
  head: () => seoHead("/en/data-deletion"),
  component: DataDeletion,
});
