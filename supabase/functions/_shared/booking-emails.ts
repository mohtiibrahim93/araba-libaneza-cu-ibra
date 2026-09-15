import { utcToZonedParts, SITE_URL } from "./booking.ts";
import { sendTemplateEmail } from "./managed-email.ts";


export function fmtBookingLocal(iso: string, lang: "ro" | "en" = "ro") {
  const p = utcToZonedParts(new Date(iso));
  const months: Record<"ro" | "en", string[]> = {
    ro: ["ian.","feb.","mar.","apr.","mai","iun.","iul.","aug.","sep.","oct.","noi.","dec."],
    en: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
  };
  const hh = String(p.hour).padStart(2, "0");
  const mm = String(p.minute).padStart(2, "0");
  return `${p.day} ${months[lang][p.month - 1]} ${p.year}, ${hh}:${mm}`;
}

export function manageUrl(token: string) {
  return `${SITE_URL}/booking/manage/${token}`;
}

export const ADMIN_RECIPIENT = "marhaba@centruldearabalibaneza.com";

export function sendAdminBookingEmail(
  action: "new" | "cancelled" | "rescheduled",
  data: Record<string, unknown>,
  idempotencyKey: string,
): void {
  void sendBookingEmail("admin-booking", ADMIN_RECIPIENT, { action, ...data }, idempotencyKey);
}

export async function sendBookingEmail(
  templateName: string,
  recipientEmail: string,
  templateData: Record<string, unknown>,
  idempotencyKey: string,
): Promise<void> {
  try {
    const result = await sendTemplateEmail(templateName, recipientEmail, {
      templateData,
      idempotencyKey,
    });
    if (!result.sent) {
      console.log("[booking-emails] recipient suppressed", templateName);
    }
  } catch (err) {
    console.error("[booking-emails] send error", templateName, err);

  }
}