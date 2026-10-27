import { createFileRoute } from "@tanstack/react-router";
import TrialConfirmed from "@/pages/TrialConfirmed";

// Where Stripe returns a visitor after saving the card for a free trial. A
// personal confirmation, so not for search engines; the head lives on the
// route, like /thank-you. Romanian: /proba-confirmata.
export const Route = createFileRoute("/en/trial-confirmed")({
  head: () => ({
    meta: [
      { title: "Your trial lesson is booked" },
      {
        name: "description",
        content:
          "Your free trial lesson is booked. The confirmation arrives by email in a few minutes.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: TrialConfirmed,
});
