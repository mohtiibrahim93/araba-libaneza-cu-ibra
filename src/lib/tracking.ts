// GA4 event helpers. Consent is handled by the Adopt CMP via Google Consent
// Mode: index.html sets consent "default: denied" and Adopt flips it to
// "granted" when the visitor accepts, so we send events unconditionally and
// let Consent Mode gate them. Meta Pixel isn't set up yet.


export function trackEvent(eventName: string, params?: Record<string, unknown>) {
  if (typeof (window as any).gtag !== "function") return;
  (window as any).gtag("event", eventName, params);
}

// ---------------------------------------------------------------------------
// Conversions
//
// Three events, each fired at exactly one point, none of them a button click:
//
//   generate_lead           a lead form was accepted by the server
//   trial_booking_complete  booking-create returned ok
//   purchase                a payment was confirmed paid
//
// Booking and payment stay separate because a trial can be booked without
// paying. A paid booking legitimately fires both.
//
// These used to be `Lead` and `Purchase` — the Meta Pixel spellings — with
// trackEvent silently mirroring each to its GA4 name. That meant one action
// sent two events, and the mirrors were invisible at the call site. The call
// sites now name the GA4 event directly and nothing is duplicated.
// ---------------------------------------------------------------------------

/**
 * A genuine enquiry reached the database. Call only after the insert or the
 * edge function has succeeded, never on submit.
 */
export function trackGenerateLead(
  source: string,
  params?: Record<string, unknown>,
) {
  trackEvent("generate_lead", {
    method: "website_form",
    content_name: source,
    page_path: window.location.pathname,
    ...params,
  });
}

export interface PurchaseDetails {
  /** Stripe session or payment-intent id — GA4 dedupes repeat sends on this. */
  transactionId: string;
  /** Major units, not bani. */
  value: number;
  currency: string;
  courseType?: string | null;
}

/**
 * A payment is confirmed settled.
 *
 * Never call this from a checkout button, a redirect parameter or page mount.
 * The two call sites both hold a real confirmation: PaymentStatus polls the
 * server until the registration reads paid, and ThankYou reads Stripe's
 * session.payment_status. `transaction_id` matters beyond reporting — GA4 uses
 * it to discard a duplicate purchase if a user reloads the page.
 */
export function trackPurchase({
  transactionId,
  value,
  currency,
  courseType,
}: PurchaseDetails) {
  trackEvent("purchase", {
    transaction_id: transactionId,
    value,
    currency: (currency || "RON").toUpperCase(),
    items: [
      {
        item_id: courseType || "course",
        item_name: courseType || "Curs arabă libaneză",
        item_category: "course",
        price: value,
        quantity: 1,
      },
    ],
  });
}

// ---------------------------------------------------------------------------
// Registration funnel
//
// GA4's enhanced measurement emits an automatic `form_start` on first
// interaction with ANY form on the site — the resource-download boxes, the
// trial booker, the newsletter field — while `Lead` fires only on a completed
// course registration. Comparing the two ("27 form_start, 14 leads") therefore
// compares two different populations, and any drop-off read from it is an
// artefact rather than a measurement.
//
// These events cover one form, name the step, and say which field rejected the
// submission, so the funnel can be read as a funnel.
// ---------------------------------------------------------------------------

export type RegistrationFormType = "group" | "private" | "kids";

/** First real interaction with the registration form, once per mount. */
export function trackRegistrationStart(formType: RegistrationFormType | "unknown") {
  trackEvent("registration_start", { form_type: formType });
}

/** A required choice was made — course type, format, level, cohort. */
export function trackRegistrationStep(
  step: "course_type" | "format" | "level" | "cohort" | "quantity",
  formType: RegistrationFormType | "unknown",
  value?: string | number | null,
) {
  trackEvent("registration_step", {
    step,
    form_type: formType,
    value: value ?? undefined,
  });
}

/**
 * Submit was pressed and rejected. `field` is the point of the event: without
 * it we know people fail, not what they fail on.
 */
export function trackRegistrationValidationFailed(
  field: "course_type" | "format" | "level" | "center" | "gdpr" | "phone" | "email",
  formType: RegistrationFormType | "unknown",
) {
  trackEvent("registration_validation_failed", { field, form_type: formType });
}

/** Submit passed validation and the insert was attempted. */
export function trackRegistrationSubmit(formType: RegistrationFormType) {
  trackEvent("registration_submit", { form_type: formType });
}

// Convenience: track Stripe checkout initiation.
export function trackCheckoutStart(courseType: "group" | "private" | "kids") {
  trackEvent("InitiateCheckout", { content_name: courseType });
  trackEvent("begin_checkout", { course_type: courseType });
}

let trackingInitialized = false;

/**
 * Track high-intent contact clicks across the entire site and confirmed
 * bookings at the successful booking-create response boundary.
 */
export function initContactClickTracking() {
  if (trackingInitialized || typeof document === "undefined") return;
  trackingInitialized = true;

  // A booking event must only fire after the backend confirms the reservation.
  // Intercepting this single endpoint avoids false positives from button clicks
  // and covers every scheduler entry point without duplicating component logic.
  const originalFetch = window.fetch.bind(window);
  window.fetch = async (...args: Parameters<typeof fetch>): Promise<Response> => {
    const [input, init] = args;
    const url =
      typeof input === "string"
        ? input
        : input instanceof URL
          ? input.toString()
          : input.url;
    const isBookingCreate = url.includes("/functions/v1/booking-create");
    let bookingType: string | undefined;

    if (isBookingCreate) {
      try {
        const rawBody =
          typeof init?.body === "string"
            ? init.body
            : input instanceof Request
              ? await input.clone().text()
              : "";
        bookingType = rawBody ? JSON.parse(rawBody)?.event_type : undefined;
      } catch {
        bookingType = undefined;
      }
    }

    const response = await originalFetch(...args);

    if (isBookingCreate && response.ok) {
      void response
        .clone()
        .json()
        .then((payload) => {
          if (!payload?.ok) return;
          trackEvent(bookingType === "trial" ? "trial_booking_complete" : "paid_booking_complete", {
            booking_type: bookingType || "unknown",
            booking_format: payload?.format,
            page_path: window.location.pathname,
          });
        })
        .catch(() => undefined);
    }

    return response;
  };

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
    } else if (href.startsWith("mailto:")) {
      trackEvent("email_click", common);
    } else {
      // Internal CTAs toward the commercial funnel. Path-based so every
      // entry point counts without touching each component.
      const path = anchor.getAttribute("href") || "";
      if (/^\/(trial|inscriere|checkout|booking)(\/|$|\?)/.test(path)) {
        trackEvent("cta_click", {
          ...common,
          cta_target: path.split(/[?#]/)[0],
        });
      }
    }
  });
}

