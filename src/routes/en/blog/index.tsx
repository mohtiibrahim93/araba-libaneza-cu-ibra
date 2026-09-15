import { createFileRoute } from "@tanstack/react-router";
import { seoHead } from "@/lib/seoHead";
import BlogIndex from "@/pages/blog/BlogIndex";

export const Route = createFileRoute("/en/blog/")({
  head: () => seoHead("/en/blog"),
  component: BlogIndex,
});
