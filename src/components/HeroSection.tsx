import { useI18n } from "@/lib/i18n";
import { MessageCircle } from "lucide-react";
import heroImg from "@/assets/hero-lebanon-cedar.jpg";
import heroImgWebp from "@/assets/hero-lebanon-cedar.webp";
import AnchorLink from "@/components/AnchorLink";
import HeroConversation from "@/components/HeroConversation";
import { Link } from "@/components/LocalizedLink";

const WHATSAPP_URL =
  "https://wa.me/40763124514?text=" +
  encodeURIComponent("Salut! Sunt interesat(ă) de cursurile de arabă libaneză.");

// React 19 supports the camelCase `fetchPriority` prop natively (the old
// lowercase spelling now logs an "Invalid DOM property" warning).
const imgPriorityProps: Record<string, string> = { fetchPriority: "high" };

const HeroSection = () => {
  const { t } = useI18n();

  return (
    <section className="pt-28 pb-16 px-gutter bg-cream">
      {/* Three columns from xl: text, photo, then the two-phone card. On
          phones the card comes straight after the text, before the photo;
          between lg and xl it sits under text and photo, centred. */}
      <div className="w-full max-w-content mx-auto grid gap-10 lg:grid-cols-2 lg:gap-12 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)_minmax(0,26rem)] xl:gap-8 items-center">
        {/* Left: Text */}
        <div className="order-1">
          <span className="mb-6 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
            ⭐ {t.heroBadge}
          </span>

          <h1 className="font-display text-display-xl lg:text-[3.4rem] xl:text-[2.9rem] 2xl:text-[3.4rem] font-bold leading-[1.12] tracking-tight text-foreground mb-6">
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

        <HeroConversation className="order-2 w-full max-w-md mx-auto lg:order-3 lg:col-span-2 xl:col-span-1 xl:max-w-none" />

        {/* Ibra above Beirut — real Lebanese photography + the teacher */}
        <div className="relative order-3 lg:order-2">
          <div className="w-full max-h-[34rem] xl:max-h-[38rem] mx-auto rounded-[2rem] overflow-hidden shadow-xl aspect-square lg:aspect-[4/4.4]">
            <picture>
              <source srcSet={heroImgWebp} type="image/webp" />
              <img
                src={heroImg}
                alt="Ibra, profesor nativ de arabă libaneză, deasupra Beirutului"
                width={1024}
                height={1024}
                {...imgPriorityProps}
                decoding="async"
                className="w-full h-full object-cover"
              />
            </picture>
          </div>

          {/* The Preply rating is shown once, under the phones (HeroConversation);
              the owner asked for it only once in the hero. The "370+ lessons"
              card moved to the teacher section's figures, next to the rating. */}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
