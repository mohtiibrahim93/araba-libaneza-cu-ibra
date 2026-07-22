// Tracking utility — fires GA4 events only if cookie consent was accepted.
// (Meta Pixel is not set up yet; add its loader + calls here when it is.)

const COOKIE_KEY = "cookie_consent";

export function hasConsent(): boolean {
  return localStorage.getItem(COOKIE_KEY) === "accepted";
}

export function initTracking() {
  if (!hasConsent()) return;

  // GA4 — grant consent and force a page_view for the first hit
  if (typeof window !== "undefined" && typeof (window as any).gtag === "function") {
    (window as any).gtag("consent", "update", {
      analytics_storage: "granted",
      ad_storage: "granted",
    });
    (window as any).gtag("event", "page_view", {
      page_path: window.location.pathname + window.location.search,
      page_location: window.location.href,
      page_title: document.title,
    });
  }
}

export function trackEvent(eventName: string, params?: Record<string, any>) {
  if (!hasConsent()) return;

  // GA4 event
  if (typeof (window as any).gtag === "function") {
    (window as any).gtag("event", eventName, params);
  }
}

// Convenience: track form submission
export function trackFormSubmit(formType: "group" | "private" | "kids") {
  trackEvent("Lead", { content_name: `${formType}_registration`, content_category: "registration" });
  trackEvent("generate_lead", { form_type: formType });
}

// Convenience: track Stripe checkout initiation
export function trackCheckoutStart(courseType: "group" | "private" | "kids") {
  trackEvent("InitiateCheckout", { content_name: courseType });
  trackEvent("begin_checkout", { course_type: courseType });
}
