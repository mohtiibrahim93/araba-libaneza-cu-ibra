import { useState, useEffect } from "react";
import { useI18n } from "@/lib/i18n";
import { X } from "lucide-react";
import { initTracking } from "@/lib/tracking";

const COOKIE_KEY = "cookie_consent";

const CookieConsent = () => {
  const { t } = useI18n();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_KEY);
    if (!consent) {
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const accept = () => {
    localStorage.setItem(COOKIE_KEY, "accepted");
    setVisible(false);
    initTracking();
  };

  const dismiss = () => {
    localStorage.setItem(COOKIE_KEY, "dismissed");
    setVisible(false);
  };

  if (!visible) return null;

  // On mobile, sit ABOVE the fixed MobileEnrollmentCTA (~72px tall) so the floating Enroll CTA stays tappable.
  return (
    <div className="fixed inset-x-0 bottom-[76px] z-[60] border-t border-border bg-background/95 backdrop-blur-md shadow-lg animate-in slide-in-from-bottom-2 duration-300 md:bottom-4 md:left-1/2 md:right-auto md:-translate-x-1/2 md:inset-x-auto md:rounded-full md:border md:max-w-2xl md:w-[calc(100%-2rem)]">
      <div className="mx-auto max-w-6xl px-4 py-2.5 md:px-5 flex items-center gap-3">
        <p className="flex-1 text-xs text-muted-foreground leading-snug truncate sm:whitespace-normal">
          <span className="font-medium text-foreground">{t.cookieTitle}</span>{" "}
          <span className="hidden sm:inline">{t.cookieDesc}{" "}</span>
          <a href="/privacy" className="text-primary underline">{t.cookieLink}</a>
        </p>
        <button
          onClick={accept}
          className="shrink-0 px-3 py-1.5 text-xs font-semibold bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          {t.cookieAccept}
        </button>
        <button
          onClick={dismiss}
          className="shrink-0 px-2 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          {t.cookieDecline}
        </button>
        <button onClick={dismiss} aria-label={t.cookieClose} className="shrink-0 text-muted-foreground hover:text-foreground p-1 hidden sm:block">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default CookieConsent;
