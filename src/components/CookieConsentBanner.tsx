import { useEffect, useState } from "react";
import { Link } from "@/components/LocalizedLink";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { OPEN_CONSENT_EVENT, readConsent, saveConsent, type ConsentChoice } from "@/lib/cookieConsent";

/**
 * Bottom card asking for cookie consent (Google Consent Mode v2). Shown only
 * in the browser, after hydration, when no choice is stored — or when the
 * footer's "Setări cookies" reopens it. Off under Vitest unless `force` is
 * set, so page tests don't all gain an extra dialog. On phones it sits above
 * the sticky enrol bar at the bottom edge rather than on top of it.
 */
const CookieConsentBanner = ({ force = false }: { force?: boolean }) => {
  const { t, lang } = useI18n();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.localStorage === "undefined") return;
    if (!force && import.meta.env.MODE === "test") return;
    if (readConsent() === null) setOpen(true);
    const reopen = () => setOpen(true);
    window.addEventListener(OPEN_CONSENT_EVENT, reopen);
    return () => window.removeEventListener(OPEN_CONSENT_EVENT, reopen);
  }, [force]);

  if (!open) return null;

  const choose = (choice: ConsentChoice) => {
    saveConsent(choice);
    setOpen(false);
  };

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label={t.cookieTitle}
      /* The bottom-right corner is crowded: WhatsApp and phone are pinned
         there (`hidden md:flex`, so from 768px up), and at z-60 this card
         covers both of them until it is dismissed — the one CTA the site
         most wants tapped, hidden behind a consent prompt. The mobile offset
         already clears that corner; `md:bottom-32` does the same from the
         width where the buttons actually appear, rather than at `sm`, where
         there is nothing to clear and the card would just float high. */
      className="fixed inset-x-3 bottom-[calc(5rem+env(safe-area-inset-bottom))] z-[60] sm:inset-x-auto sm:right-5 sm:bottom-5 sm:max-w-md md:bottom-32"
    >
      <div className="rounded-2xl border border-border bg-card p-4 text-card-foreground shadow-lg sm:p-5">
        <p className="text-sm font-semibold">{t.cookieTitle}</p>
        <p className="mt-1 text-sm text-muted-foreground">
          {t.cookieMessage}{" "}
          <Link to={lang === "en" ? "/en/privacy" : "/privacy"} className="text-primary underline">
            {t.cookiePrivacyLink}
          </Link>
        </p>
        <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" className="rounded-xl" onClick={() => choose("essential")}>
            {t.cookieEssentialOnly}
          </Button>
          <Button type="button" className="rounded-xl" onClick={() => choose("all")}>
            {t.cookieAcceptAll}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CookieConsentBanner;
