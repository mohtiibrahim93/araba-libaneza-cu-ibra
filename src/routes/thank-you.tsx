import { createFileRoute } from "@tanstack/react-router";
import ThankYou from "@/pages/ThankYou";

// Head served from the route, not from a <Helmet> in the page: the component's
// copy was rendered next to the server's and showed up as a duplicate title.
// The page keeps the tab title in the visitor's language through an effect.
export const Route = createFileRoute("/thank-you")({
  head: () => ({
    meta: [
      { title: "Mulțumim! — Înregistrare confirmată" },
      {
        name: "description",
        content:
          "Înregistrarea ta a fost confirmată. Verifică-ți emailul pentru detalii despre cursul de arabă libaneză.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ThankYou,
});
