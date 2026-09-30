import { createFileRoute } from "@tanstack/react-router";
import Checkout from "@/pages/Checkout";

// The head is served here rather than from the component: a <Helmet> title in
// the page renders a *second* <title> next to the one the server already sent
// (React 19 hoists it into <head> on the server too), which is what the crawl
// reported as a duplicate title. This route is not in src/lib/seoHead.ts —
// that table mirrors the prerender script's indexable routes, and a payment
// step is not one of them.
export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Finalizează plata — Centrul de Arabă Libaneză" },
      {
        name: "description",
        content:
          "Plată securizată prin Stripe pentru cursul de arabă libaneză. Datele cardului nu sunt stocate pe acest site.",
      },
      // The other two steps of this flow, /thank-you and /payment-status, both
      // carry noindex and this one did not. robots.txt disallows all three, but
      // a disallowed URL can still be indexed without a snippet when something
      // links to it — the crawler cannot fetch the page to learn otherwise.
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: "https://centruldearabalibaneza.com/checkout" }],
  }),
  component: Checkout,
});
