import { useI18n } from "@/lib/i18n";
import { MessageCircle, Mail, MapPin } from "lucide-react";

const CTASection = () => {
  const { t } = useI18n();

  return (
    <section id="contact" className="py-20 px-6 bg-muted/50 scroll-mt-20">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-sm font-medium text-primary mb-2 block">{t.ctaBadge}</span>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-3">{t.ctaTitle}</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">{t.ctaDesc}</p>
        </div>

        <div className="grid sm:grid-cols-3 gap-6 mb-10">
          <div className="bg-background rounded-2xl border border-border p-6 text-center">
            <MessageCircle className="w-6 h-6 text-primary mx-auto mb-3" />
            <h3 className="font-semibold text-foreground text-sm">{t.ctaWhatsapp}</h3>
            <p className="text-xs text-muted-foreground mt-1">{t.ctaWhatsappDesc}</p>
          </div>
          <div className="bg-background rounded-2xl border border-border p-6 text-center">
            <Mail className="w-6 h-6 text-primary mx-auto mb-3" />
            <h3 className="font-semibold text-foreground text-sm">{t.ctaEmail}</h3>
            <p className="text-xs text-muted-foreground mt-1">{t.ctaEmailVal}</p>
          </div>
          <div className="bg-background rounded-2xl border border-border p-6 text-center">
            <MapPin className="w-6 h-6 text-primary mx-auto mb-3" />
            <h3 className="font-semibold text-foreground text-sm">{t.ctaLocation}</h3>
            <p className="text-xs text-muted-foreground mt-1">{t.ctaLocationVal}</p>
          </div>
        </div>

        <div className="text-center">
          <a
            href="#"
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
