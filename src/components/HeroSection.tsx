import { useI18n } from "@/lib/i18n";
import { MessageCircle } from "lucide-react";
import AnchorLink from "@/components/AnchorLink";
import HeroConversation from "@/components/HeroConversation";
import { Link } from "@/components/LocalizedLink";

const WHATSAPP_URL =
  "https://wa.me/40763124514?text=" +
  encodeURIComponent("Salut! Sunt interesat(ă) de cursurile de arabă libaneză.");

const HeroSection = () => {
  const { t } = useI18n();

  return (
    <section className="pt-28 pb-16 px-gutter bg-cream">
      {/* Two columns: the text, then the two-phone card. Ibra's photo used to
          sit between them; the owner kept it only in the teacher section
          ("Mar7aba! Sunt Ibra"), where it introduces him. */}
      <div className="w-full max-w-content mx-auto grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,30rem)] lg:gap-16 items-center">
        {/* Left: Text */}
        <div className="order-1">
          <span className="mb-6 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
            ⭐ {t.heroBadge}
          </span>

          <h1 className="font-display text-display-xl lg:text-[3.6rem] xl:text-[4rem] font-bold leading-[1.12] tracking-tight text-foreground mb-6">
            {t.heroTitle1}
            <br />
            <span className="text-primary">{t.heroTitle2}</span>
          </h1>

          <p className="text-lg text-muted-foreground max-w-lg mb-8 leading-relaxed">
            {t.heroDesc}
          </p>

          <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 mb-4">
            {/* The free trial is the step a new visitor should take, so it is
                the primary button; the courses are the secondary route for
                those who want to compare levels and prices first. */}
            <Link
              to="/trial"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 text-sm font-semibold bg-primary text-primary-foreground rounded-lg shadow-xs transition-all hover:bg-primary/90"
            >
              {t.heroCta} →
            </Link>
            <AnchorLink
              to="#programs"
              className="inline-flex items-center justify-center px-7 py-3.5 text-sm font-semibold border border-primary/40 text-primary rounded-lg transition-colors hover:bg-primary/5"
            >
              {t.heroTrialCta}
            </AnchorLink>
          </div>

          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <MessageCircle className="w-4 h-4 text-[#25D366]" />
            {t.heroExplore}
          </a>

        </div>

        <HeroConversation className="order-2 w-full max-w-md mx-auto lg:max-w-none" />

      </div>
    </section>
  );
};

export default HeroSection;
