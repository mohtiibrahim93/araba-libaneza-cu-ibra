import { createFileRoute } from "@tanstack/react-router";
import BlogIndex from "@/pages/blog/BlogIndex";

export const Route = createFileRoute("/blog/")({
  component: BlogIndex,
});
