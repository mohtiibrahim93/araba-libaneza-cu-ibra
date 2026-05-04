import { useI18n } from "@/lib/i18n";
import { Calendar, MessageCircle } from "lucide-react";

// TODO: Replace with your Calendly event URL when ready, e.g. "https://calendly.com/ibra/30min"
const CALENDLY_URL = "";

const WHATSAPP_URL =
  "https://wa.me/40763124514?text=" +
  encodeURIComponent("Salut! Vreau să rezerv o sesiune pe Zoom.");

const BookingSection = () => {
  const { t } = useI18n();

  return (
    <section id="booking" className="py-20 px-6 bg-muted/40 scroll-mt-20">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <span className="text-sm font-medium text-primary mb-2 block">{t.bookingBadge}</span>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-3">
            {t.bookingTitle}
          </h2>
          <p className="text-muted-foreground">{t.bookingDesc}</p>
        </div>

        <div className="rounded-2xl border border-border bg-background p-8 shadow-sm">
          {CALENDLY_URL ? (
            <div className="overflow-hidden rounded-lg" style={{ minHeight: 640 }}>
              <iframe
                src={CALENDLY_URL}
                title="Calendly"
                className="w-full"
                style={{ minHeight: 640, border: 0 }}
              />
            </div>
          ) : (
            <div className="flex flex-col items-center text-center gap-4 py-8">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground max-w-md">{t.bookingPlaceholder}</p>
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                WhatsApp
              </a>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default BookingSection;
