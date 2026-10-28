import { createFileRoute } from "@tanstack/react-router";
import TrialConfirmed from "@/pages/TrialConfirmed";

// Where Stripe returns a visitor after saving the card for a free trial. A
// personal confirmation, so not for search engines; the head lives on the
// route, like /thank-you. English: /en/trial-confirmed.
export const Route = createFileRoute("/proba-confirmata")({
  head: () => ({
    meta: [
      { title: "Lecția de probă e rezervată" },
      {
        name: "description",
        content:
          "Lecția ta de probă gratuită e rezervată. Confirmarea vine pe email în câteva minute.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: TrialConfirmed,
});
