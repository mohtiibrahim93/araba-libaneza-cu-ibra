// GA4 event helpers. Consent is handled by the consentmanager.net CMP via
// Google Consent Mode: index.html sets consent "default: denied" and the CMP
// flips it to "granted" when the visitor accepts, so we send events
// unconditionally and let Consent Mode gate them. Meta Pixel isn't set up yet.

export function trackEvent(eventName: string, params?: Record<string, unknown>) {
  if (typeof (window as any).gtag !== "function") return;

  (window as any).gtag("event", eventName, params);

  // Legacy form code sends `Lead`. Mirror it to GA4's recommended lead event
  // so the Lead acquisition report and a future key-event rule work without
  // rewriting every form. Keep the original event for reporting continuity.
  if (eventName === "Lead") {
    (window as any).gtag("event", "generate_lead", {
      method: "website_form",
      page_path: window.location.pathname,
      ...params,
    });
  }
}

// Convenience: track a successful form submission.
export function trackFormSubmit(formType: "group" | "private" | "kids" | "trial") {
  trackEvent("Lead", {
    content_name: `${formType}_registration`,
    content_category: "registration",
    form_type: formType,
  });
}

// Convenience: track Stripe checkout initiation.
export function trackCheckoutStart(courseType: "group" | "private" | "kids") {
  trackEvent("InitiateCheckout", { content_name: courseType });
  trackEvent("begin_checkout", { course_type: courseType });
}

let contactTrackingInitialized = false;

/**
 * Track high-intent contact clicks across the entire site, including links
 * rendered inside landing pages, the footer and scheduler fallbacks.
 */
export function initContactClickTracking() {
  if (contactTrackingInitialized || typeof document === "undefined") return;
  contactTrackingInitialized = true;

  document.addEventListener("click", (event) => {
    if (!(event.target instanceof Element)) return;
    const anchor = event.target.closest<HTMLAnchorElement>("a[href]");
    if (!anchor) return;

    const href = anchor.href;
    const common = {
      link_url: href,
      link_text: anchor.textContent?.trim().slice(0, 100) || undefined,
      page_path: window.location.pathname,
    };

    if (/^(https?:\/\/)?(wa\.me|api\.whatsapp\.com)\//i.test(href)) {
      trackEvent("whatsapp_click", common);
    } else if (href.startsWith("tel:")) {
      trackEvent("phone_click", common);
    }
  });
}
