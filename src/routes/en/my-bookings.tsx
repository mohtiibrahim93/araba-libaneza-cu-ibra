import { createFileRoute } from "@tanstack/react-router";
import { seoHead } from "@/lib/seoHead";
import MyBookings from "@/pages/MyBookings";

export const Route = createFileRoute("/en/my-bookings")({
  head: () => seoHead("/en/my-bookings"),
  component: () => <MyBookings lang="en" />,
});