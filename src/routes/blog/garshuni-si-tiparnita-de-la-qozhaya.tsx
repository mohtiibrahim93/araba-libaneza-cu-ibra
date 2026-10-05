import { createFileRoute } from "@tanstack/react-router";
import { seoHead } from "@/lib/seoHead";
import GarshuniTiparnitaQozhaya from "@/pages/blog/GarshuniTiparnitaQozhaya";

export const Route = createFileRoute("/blog/garshuni-si-tiparnita-de-la-qozhaya")({
  head: () => seoHead("/blog/garshuni-si-tiparnita-de-la-qozhaya"),
  component: GarshuniTiparnitaQozhaya,
});
