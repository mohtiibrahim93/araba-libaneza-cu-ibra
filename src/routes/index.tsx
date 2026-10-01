import { useEffect } from "react";
import { createFileRoute, useLocation, useNavigate } from "@tanstack/react-router";
import { seoHead } from "@/lib/seoHead";
import Index from "@/pages/Index";

/**
 * The Romanian homepage — and, for a reader who has chosen English, the door
 * to the English one.
 *
 * `/` is the canonical Romanian URL and the RO half of the hreflang pair. The
 * i18n provider adopts `site-language` from localStorage after hydration, so
 * before `/en` existed a returning English reader got English copy here, at an
 * address declaring itself Romanian: `/en`'s content served at `/`'s URL, the
 * same page at two addresses, one of them mislabelled.
 *
 * Now that `/en` exists there is a correct place for them to be, so send them
 * there instead of repainting this one. The alternative — pinning `/` to
 * Romanian and leaving them to find the toggle — keeps the URL honest too, but
 * silently drops a choice they made on purpose.
 *
 * Two deliberate limits:
 *
 *   - Only when there is no query string. `?payment=success`, `?payment=canceled`
 *     and `?trial_card=…` are read by Index.tsx to raise the post-Stripe toast,
 *     and a redirect would drop both the parameter and the toast.
 *   - `replace`, so the back button returns to wherever they came from rather
 *     than to `/` and straight back out to `/en` again.
 *
 * A crawler has no localStorage, so it never redirects: it reads the Romanian
 * page this route serves, which is what the canonical and the hreflang pair
 * both promise.
 */
function Home() {
  const navigate = useNavigate();
  // The router's own search string, not window.location's: under memory
  // history they disagree, and the router is the one that matches the route
  // actually being rendered.
  const search = useLocation({ select: (l) => l.searchStr });

  useEffect(() => {
    if (search) return;
    let saved: string | null = null;
    try {
      saved = window.localStorage.getItem("site-language");
    } catch {
      // Private mode, or storage blocked: no stored preference to honour.
      return;
    }
    if (saved === "en") void navigate({ to: "/en", replace: true });
  }, [navigate, search]);

  return <Index />;
}

export const Route = createFileRoute("/")({
  head: () => seoHead("/"),
  component: Home,
});
