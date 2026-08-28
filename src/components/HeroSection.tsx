import { useI18n } from "@/lib/i18n";
import { GraduationCap, BookOpen, Star, Tag, CheckCircle2, MessageCircle } from "lucide-react";
import heroImg from "@/assets/hero-lebanon-cedar.jpg";
import heroImgWebp from "@/assets/hero-lebanon-cedar.webp";
import AnchorLink from "@/components/AnchorLink";

const WHATSAPP_URL =
  "https://wa.me/40763124514?text=" +
  encodeURIComponent("Salut! Sunt interesat(ă) de cursurile de arabă libaneză.");

// React's DOM typings still only recognize the camelCase `fetchPriority`,
// but at runtime it needs to be spelled lowercase on the actual <img>
// element or React logs an "unrecognized DOM prop" warning. Spreading a
// separately-typed object sidesteps the excess-property check that a
// literal `fetchpriority="high"` prop would otherwise fail.
const imgPriorityProps: Record<string, string> = { fetchpriority: "high" };

const HeroSection = () => {
  const { t } = useI18n();

  const checks = [t.heroCheck1, t.heroCheck2, t.heroCheck3, t.heroCheck4];

  return (
    <section className="pt-28 pb-16 px-gutter bg-cream">
      <div className="w-full max-w-content mx-auto grid lg:grid-cols-2 gap-12 items-center">
        {/* Left: Text */}
        <div>
          <span className="mb-6 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
            ⭐ {t.heroBadge}
          </span>

          <h1 className="font-display text-display-xl lg:text-[3.4rem] font-bold leading-[1.12] tracking-tight text-foreground mb-6">
            {t.heroTitle1}
            <br />
            <span className="text-primary">{t.heroTitle2}</span>
          </h1>

          <p className="text-lg text-muted-foreground max-w-lg mb-6 leading-relaxed">
            {t.heroDesc}
          </p>

          {/* Verified benefit checks (Ref A) */}
          <div className="mb-8 grid grid-cols-2 gap-x-6 gap-y-2 max-w-md text-sm text-foreground">
            {checks.map((c) => (
              <span key={c} className="inline-flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-brand-green shrink-0" />
                {c}
              </span>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <AnchorLink
              to="#programs"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 text-sm font-semibold bg-primary text-primary-foreground rounded-lg shadow-sm transition-all hover:bg-primary/90"
            >
              {t.heroCta} →
            </AnchorLink>
            <a
              href="/trial"
              className="inline-flex items-center justify-center px-7 py-3.5 text-sm font-semibold border border-primary/40 text-primary rounded-lg transition-colors hover:bg-primary/5"
            >
              {t.heroTrialCta} →
            </a>
          </div>

          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <MessageCircle className="w-4 h-4 text-[#25D366]" />
            {t.heroExplore}
          </a>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground border-t border-border/60 pt-5">
            <span className="flex items-center gap-2"><Star className="w-4 h-4 fill-primary text-primary" /> {t.heroStat1}</span>
            <span className="flex items-center gap-2"><GraduationCap className="w-4 h-4 text-primary" /> {t.heroStat2}</span>
            <span className="flex items-center gap-2"><Tag className="w-4 h-4 text-primary" /> {t.heroTrustStudents}</span>
          </div>
        </div>

        {/* Right: Ibra above Beirut — real Lebanese photography + the teacher */}
        <div className="relative">
          <div className="w-full rounded-[2rem] overflow-hidden shadow-xl aspect-square lg:aspect-[4/4.4]">
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

          {/* Floating card: real Preply rating */}
          <div className="absolute top-4 right-4 bg-background/95 backdrop-blur-sm rounded-xl shadow-lg px-4 py-3">
            <p className="text-sm font-bold text-foreground">{t.heroJoin}</p>
            <p className="text-xs text-muted-foreground">{t.heroHappy}</p>
          </div>

          {/* Floating card: lessons */}
          <div className="absolute bottom-4 left-4 bg-background/95 backdrop-blur-sm rounded-xl shadow-lg px-4 py-3 flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">{t.heroLessons}</p>
              <p className="text-xs text-muted-foreground">{t.heroComplete}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
