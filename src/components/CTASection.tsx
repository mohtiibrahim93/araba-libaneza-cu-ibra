import { useI18n } from "@/lib/i18n";
import { CalendarDays, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import SocialLinks from "@/components/SocialLinks";
import CohortEnrollmentNote from "@/components/CohortEnrollmentNote";

const WHATSAPP_URL = "https://wa.me/40763124514";
const PHONE_URL = "tel:+40763124514";
const EMAIL = "marhaba@centruldearabalibaneza.com";

const CTASection = () => {
  const { t } = useI18n();

  return (
    <section id="contact" className="py-section px-6 bg-muted/50 scroll-mt-20">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-sm font-medium text-primary mb-2 block">{t.ctaBadge}</span>
          <h2 className="font-display text-display-lg font-bold tracking-tight text-foreground mb-3">{t.ctaTitle}</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">{t.ctaDesc}</p>
        </div>

        <div className="grid gap-6 mb-10 sm:grid-cols-2 lg:grid-cols-4">
          <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="min-w-0 [overflow-wrap:anywhere] bg-background rounded-2xl border border-border p-5 sm:p-6 text-center hover:border-primary/40 transition-colors">
            <MessageCircle className="w-6 h-6 text-primary mx-auto mb-3" />
            <h3 className="font-semibold text-foreground text-sm">{t.ctaWhatsapp}</h3>
            <p className="text-sm text-muted-foreground mt-1">{t.ctaWhatsappDesc}</p>
          </a>
          <a href={PHONE_URL} className="min-w-0 [overflow-wrap:anywhere] bg-background rounded-2xl border border-border p-5 sm:p-6 text-center hover:border-primary/40 transition-colors">
            <Phone className="w-6 h-6 text-primary mx-auto mb-3" />
            <h3 className="font-semibold text-foreground text-sm">{t.ctaPhone}</h3>
            <p className="text-sm text-muted-foreground mt-1">{t.ctaPhoneVal}</p>
          </a>
          <a href={`mailto:${EMAIL}`} className="min-w-0 [overflow-wrap:anywhere] bg-background rounded-2xl border border-border p-5 sm:p-6 text-center hover:border-primary/40 transition-colors">
            <Mail className="w-6 h-6 text-primary mx-auto mb-3" />
            <h3 className="font-semibold text-foreground text-sm">{t.ctaEmail}</h3>
            <p className="text-sm text-muted-foreground mt-1">{t.ctaEmailVal}</p>
          </a>
          <div className="min-w-0 [overflow-wrap:anywhere] bg-background rounded-2xl border border-border p-5 sm:p-6 text-center">
            <MapPin className="w-6 h-6 text-primary mx-auto mb-3" />
            <h3 className="font-semibold text-foreground text-sm">{t.ctaLocation}</h3>
            <p className="text-sm text-muted-foreground mt-1">{t.ctaLocationVal}</p>
          </div>
        </div>

        <div className="bg-background rounded-2xl border border-border p-6 sm:p-8 mb-10">
          <div className="flex items-start gap-4 mb-6">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <CalendarDays className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-foreground">{t.ctaScheduleTitle}</h3>
              <p className="text-sm text-muted-foreground mt-1">{t.ctaScheduleDesc}</p>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg border border-border p-4">
              <p className="text-sm font-semibold text-foreground">{t.ctaScheduleGroupLabel}</p>
              <CohortEnrollmentNote className="text-sm text-muted-foreground mt-1" />
            </div>
            <div className="rounded-lg border border-border p-4">
              <p className="text-sm font-semibold text-foreground">{t.ctaSchedulePrivateLabel}</p>
              <p className="text-sm text-muted-foreground mt-1">{t.ctaSchedulePrivateValue}</p>
            </div>
            <div className="rounded-lg border border-border p-4">
              <p className="text-sm font-semibold text-foreground">{t.ctaScheduleKidsLabel}</p>
              <p className="text-sm text-muted-foreground mt-1">{t.ctaScheduleKidsValue}</p>
            </div>
          </div>
        </div>

        {/* Official social channels — renders only the configured ones. */}
        <SocialLinks variant="cards" className="mb-10" />

        <div className="text-center">
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:bg-primary/90 transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            {t.ctaButton}
          </a>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
