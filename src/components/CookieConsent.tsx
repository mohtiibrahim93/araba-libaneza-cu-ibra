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

  return (
    <div className="fixed bottom-20 left-4 right-4 sm:left-6 sm:right-auto sm:max-w-sm z-50 animate-in slide-in-from-bottom-4 duration-300">
      <div className="bg-card border border-border rounded-xl shadow-lg p-4">
        <div className="flex items-start gap-3">
          <div className="flex-1">
            <p className="text-sm text-foreground font-medium mb-1">{t.cookieTitle}</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {t.cookieDesc}{" "}
              <a href="/privacy" className="text-primary underline">{t.cookieLink}</a>
            </p>
          </div>
          <button onClick={dismiss} className="text-muted-foreground hover:text-foreground p-1">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex gap-2 mt-3">
          <button
            onClick={accept}
            className="flex-1 py-2 text-xs font-semibold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            {t.cookieAccept}
          </button>
          <button
            onClick={dismiss}
            className="flex-1 py-2 text-xs font-semibold border border-border text-muted-foreground rounded-lg hover:text-foreground transition-colors"
          >
            {t.cookieDecline}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;
