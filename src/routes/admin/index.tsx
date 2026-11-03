import { createFileRoute } from "@tanstack/react-router";
import Admin from "@/pages/Admin";

export const Route = createFileRoute("/admin/")({
  // The admin's body face, Instrument Sans, is self-hosted (src/styles.css);
  // the head keeps the panel out of search engines.
  head: () => ({ meta: [{ name: "robots", content: "noindex, nofollow" }] }),
  component: Admin,
});
