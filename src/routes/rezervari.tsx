import { createFileRoute } from "@tanstack/react-router";
import { seoHead } from "@/lib/seoHead";
import MyBookings from "@/pages/MyBookings";

export const Route = createFileRoute("/rezervari")({
  head: () => seoHead("/rezervari"),
  component: () => <MyBookings lang="ro" />,
});