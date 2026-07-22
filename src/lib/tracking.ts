// GA4 event helpers. Consent is handled by the consentmanager.net CMP via
// Google Consent Mode: index.html sets consent "default: denied" and the CMP
// flips it to "granted" when the visitor accepts, so we send events
// unconditionally and let Consent Mode gate them. Meta Pixel isn't set up yet.

export function trackEvent(eventName: string, params?: Record<string, any>) {
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
