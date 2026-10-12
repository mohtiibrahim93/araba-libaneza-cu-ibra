/**
 * WhatsApp chat link for a stored phone number.
 *
 * On desktop this goes straight to web.whatsapp.com, saving the wa.me ->
 * api.whatsapp.com redirect. On mobile wa.me is right — it opens the app.
 *
 * "web.whatsapp.com is blocked … ERR_BLOCKED_BY_RESPONSE" is not this link:
 * WhatsApp sends Cross-Origin-Opener-Policy: same-origin (api.whatsapp.com:
 * same-origin-allow-popups), and Chrome refuses such a page in a tab opened
 * from a sandboxed iframe, such as the Lovable editor preview. From the
 * site in its own tab the link works.
 */
export function buildWhatsAppUrl(rawPhone: string, text?: string): string {
  // 1. Strip non-digits
  let digits = rawPhone.replace(/\D/g, "");

  // 2. Romanian habit: leading 0 (e.g. 0735...) -> country code 40 (40735...)
  if (digits.startsWith("00")) {
    digits = digits.slice(2);
  } else if (digits.startsWith("0")) {
    digits = "40" + digits.slice(1);
  }

  const params = new URLSearchParams();
  if (text) params.set("text", text);
  const query = params.toString();

  // 3. Desktop check: link directly to WhatsApp Web to bypass api.whatsapp.com
  const isMobile =
    typeof navigator !== "undefined" &&
    /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent,
    );

  if (!isMobile) {
    const textParam = text ? `&text=${encodeURIComponent(text)}` : "";
    return `https://web.whatsapp.com/send?phone=${digits}${textParam}`;
  }

  // Mobile: wa.me opens the installed WhatsApp application
  return `https://wa.me/${digits}${query ? `?${query}` : ""}`;
}
