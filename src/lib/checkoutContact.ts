/**
 * The email and name a checkout needs, handed from the page that sends the
 * visitor to /checkout through this browser tab's sessionStorage instead of
 * the address (audit, 1 Nov 2026: /checkout?email=&name= put personal data in
 * every URL, browser history and server log).
 *
 * sessionStorage belongs to one tab and survives the round trip to Stripe's
 * page and back in that tab. A visitor who opens a payment link from an email
 * in a new tab has nothing stored and types their email in the verification
 * step, which they have to pass anyway.
 */
export interface CheckoutContact {
  email: string;
  name: string;
}

const key = (registrationId: string) => `checkout-contact:${registrationId}`;

export function saveCheckoutContact(
  registrationId: string,
  contact: CheckoutContact,
): void {
  if (!registrationId) return;
  try {
    window.sessionStorage.setItem(
      key(registrationId),
      JSON.stringify({ email: contact.email, name: contact.name }),
    );
  } catch {
    // Private mode or storage blocked: the visitor types the email instead.
  }
}

export function readCheckoutContact(
  registrationId: string,
): CheckoutContact | null {
  if (!registrationId) return null;
  try {
    const raw = window.sessionStorage.getItem(key(registrationId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<CheckoutContact>;
    return typeof parsed.email === "string"
      ? { email: parsed.email, name: String(parsed.name ?? "") }
      : null;
  } catch {
    return null;
  }
}
