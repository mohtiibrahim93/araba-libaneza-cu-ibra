import { useI18n } from "@/lib/i18n";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import SocialLinks from "@/components/SocialLinks";
import { Link } from "@/components/LocalizedLink";

const WHATSAPP_URL = "https://wa.me/40763124514";
const PHONE_URL = "tel:+40763124514";
const EMAIL = "marhaba@centruldearabalibaneza.com";

const CTASection = () => {
  const { t, lang } = useI18n();
  const en = lang === "en";

  return (
    <section id="contact" className="py-section px-gutter bg-background scroll-mt-20">
      <div className="max-w-content mx-auto">
        {/* The closing invitation, as in the design: a greeting, the free
            trial, and the two ways to act on it. */}
        <div className="mb-14 flex flex-col gap-8 rounded-[28px] border border-[#E7E1D6] bg-card px-6 py-10 sm:px-12 md:flex-row md:items-center md:justify-between md:gap-10 lg:px-16 lg:py-14 dark:border-border">
          <div className="flex flex-col gap-2.5">
            <span className="text-lg sm:text-xl font-bold text-brand-green">
              <span lang="apc-Latn">Ahla w sahla!</span>{" "}
              <span dir="rtl" lang="ar" className="font-arabic font-medium text-muted-foreground">أهلا وسهلا</span>
            </span>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-[2.75rem] font-bold leading-tight tracking-tight text-foreground">
              {en ? "The first trial lesson is free." : "Prima lecție de probă e gratuită."}
            </h2>
          </div>
          <div className="flex flex-wrap gap-3 md:shrink-0">
            <Link
              to="/trial"
              className="inline-flex h-14 items-center rounded-xl bg-primary px-7 text-[17px] font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              {en ? "Book now →" : "Rezervă acum →"}
            </Link>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-14 items-center gap-2 rounded-xl border-[1.5px] border-brand-green px-6 text-[17px] font-semibold text-brand-green transition-colors hover:bg-brand-green/5"
            >
              <MessageCircle className="w-4 h-4" />
              WhatsApp
            </a>
          </div>
        </div>

        {/* The four contact cards were boxed to max-w-4xl (896px), half the
            width of the invitation card directly above them, so a lg:grid-cols-4
            row rendered as four cramped columns. The prose below keeps its own
            reading width. */}
        <div className="max-w-content mx-auto">
        <div className="mb-6">
          <span className="text-sm font-bold uppercase tracking-[0.1em] text-foreground block">{t.ctaBadge}</span>
        </div>

        <div className="grid gap-6 mb-10 sm:grid-cols-2 lg:grid-cols-4">
          <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="min-w-0 [overflow-wrap:anywhere] bg-card rounded-2xl border border-[#E7E1D6] p-5 sm:p-6 text-center hover:border-brand-green/50 transition-colors dark:border-border">
            <MessageCircle className="w-6 h-6 text-brand-green mx-auto mb-3" />
            <h3 className="font-semibold text-foreground text-sm">{t.ctaWhatsapp}</h3>
            <p className="text-sm text-muted-foreground mt-1">{t.ctaWhatsappDesc}</p>
          </a>
          <a href={PHONE_URL} className="min-w-0 [overflow-wrap:anywhere] bg-card rounded-2xl border border-[#E7E1D6] p-5 sm:p-6 text-center hover:border-brand-green/50 transition-colors dark:border-border">
            <Phone className="w-6 h-6 text-brand-green mx-auto mb-3" />
            <h3 className="font-semibold text-foreground text-sm">{t.ctaPhone}</h3>
            <p className="text-sm text-muted-foreground mt-1">{t.ctaPhoneVal}</p>
          </a>
          <a href={`mailto:${EMAIL}`} className="min-w-0 [overflow-wrap:anywhere] bg-card rounded-2xl border border-[#E7E1D6] p-5 sm:p-6 text-center hover:border-brand-green/50 transition-colors dark:border-border">
            <Mail className="w-6 h-6 text-brand-green mx-auto mb-3" />
            <h3 className="font-semibold text-foreground text-sm">{t.ctaEmail}</h3>
            <p className="text-sm text-muted-foreground mt-1">{t.ctaEmailVal}</p>
          </a>
          <div className="min-w-0 [overflow-wrap:anywhere] bg-card rounded-2xl border border-[#E7E1D6] p-5 sm:p-6 text-center dark:border-border">
            <MapPin className="w-6 h-6 text-brand-green mx-auto mb-3" />
            <h3 className="font-semibold text-foreground text-sm">{t.ctaLocation}</h3>
            <p className="text-sm text-muted-foreground mt-1">{t.ctaLocationVal}</p>
          </div>
        </div>

        {/* The course schedule box that used to sit here repeated the start
            dates a third time (they are in "Cursuri care încep acum" and on the
            group card), so it was removed with the owner's agreement. */}
        {/* Official social channels — renders only the configured ones. */}
        <SocialLinks variant="cards" />
        </div>
      </div>
    </section>
  );
};

export default CTASection;
