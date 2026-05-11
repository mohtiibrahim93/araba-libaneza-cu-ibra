import { useI18n } from "@/lib/i18n";
import { Calendar, MessageCircle } from "lucide-react";

// Two Calendly event types — availability is managed once in Calendly and
// inherited by both. The site picks which one to show based on context.
export const CALENDLY_TRIAL_URL = "https://calendly.com/learnwithibra/lectia-de-proba";
export const CALENDLY_PAID_URL = "https://calendly.com/learnwithibra/lectia-individuala";
// Back-compat alias (used elsewhere — defaults to trial).
export const CALENDLY_URL = CALENDLY_TRIAL_URL;

const WHATSAPP_URL =
  "https://wa.me/40763124514?text=" +
  encodeURIComponent("Salut! Vreau să rezerv sesiunea gratuită de probă.");

interface CalendlyEmbedProps {
  prefill?: { name?: string; email?: string };
  compact?: boolean;
  eventType?: "trial" | "paid";
}

const CalendlyEmbed = ({ prefill, compact = false, eventType = "trial" }: CalendlyEmbedProps) => {
  const { t } = useI18n();

  const url = (() => {
    const base = eventType === "paid" ? CALENDLY_PAID_URL : CALENDLY_TRIAL_URL;
    if (!base) return "";
    const u = new URL(base);
    if (prefill?.name) u.searchParams.set("name", prefill.name);
    if (prefill?.email) u.searchParams.set("email", prefill.email);
    u.searchParams.set("hide_gdpr_banner", "1");
    return u.toString();
  })();

  if (url) {
    return (
      <div
        className="overflow-hidden rounded-lg border border-border"
        style={{ minHeight: compact ? 560 : 640 }}
      >
        <iframe
          src={url}
          title="Calendly"
          className="w-full"
          style={{ minHeight: compact ? 560 : 640, border: 0 }}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center text-center gap-3 py-6 px-4 rounded-lg border border-dashed border-border bg-muted/30">
      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
        <Calendar className="w-5 h-5 text-primary" />
      </div>
      <p className="text-sm text-muted-foreground max-w-md">{t.bookingPlaceholder}</p>
      <a
        href={WHATSAPP_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
      >
        <MessageCircle className="w-4 h-4" />
        WhatsApp
      </a>
    </div>
  );
};

export default CalendlyEmbed;