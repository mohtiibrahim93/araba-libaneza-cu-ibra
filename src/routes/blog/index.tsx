import { createFileRoute } from "@tanstack/react-router";
import { seoHead } from "@/lib/seoHead";
import BlogIndex from "@/pages/blog/BlogIndex";

export const Route = createFileRoute("/blog/")({
  head: () => seoHead("/blog"),
  component: BlogIndex,
});
