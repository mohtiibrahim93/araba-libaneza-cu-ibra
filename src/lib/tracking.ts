// Tracking utility — fires GA4 + Meta Pixel events only if cookie consent was accepted

const COOKIE_KEY = "cookie_consent";

export function hasConsent(): boolean {
  return localStorage.getItem(COOKIE_KEY) === "accepted";
}

export function initTracking() {
  if (!hasConsent()) return;

  // GA4
  const gaId = document.querySelector<HTMLScriptElement>('script[src*="googletagmanager"]')?.src;
  if (!gaId && typeof window !== "undefined") {
    // Scripts are already in index.html but we can ensure gtag is active
    if (typeof (window as any).gtag === "function") {
      (window as any).gtag("consent", "update", {
        analytics_storage: "granted",
        ad_storage: "granted",
      });
    }
  }

  // Meta Pixel
  if (typeof (window as any).fbq === "function") {
    (window as any).fbq("consent", "grant");
  }
}

export function trackEvent(eventName: string, params?: Record<string, any>) {
  if (!hasConsent()) return;

  // GA4 event
  if (typeof (window as any).gtag === "function") {
    (window as any).gtag("event", eventName, params);
  }

  // Meta Pixel event
  if (typeof (window as any).fbq === "function") {
    (window as any).fbq("track", eventName, params);
  }
}

// Convenience: track form submission
export function trackFormSubmit(formType: "group" | "private" | "kids") {
  trackEvent("Lead", { content_name: `${formType}_registration`, content_category: "registration" });
  trackEvent("generate_lead", { form_type: formType });
}

// Convenience: track Stripe checkout initiation
export function trackCheckoutStart(courseType: "group" | "private") {
  trackEvent("InitiateCheckout", { content_name: courseType });
  trackEvent("begin_checkout", { course_type: courseType });
}
