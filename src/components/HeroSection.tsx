import { useI18n } from "@/lib/i18n";
import heroBanner from "@/assets/hero-banner.jpg";
import { CheckCircle2 } from "lucide-react";

const HeroSection = () => {
  const { t } = useI18n();

  return (
    <section className="relative min-h-screen flex items-center justify-center pt-20">
      {/* Background image */}
      <img
        src={heroBanner}
        alt="Beirut coastline with Lebanese flag"
        className="absolute inset-0 w-full h-full object-cover"
      />
      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/50 to-black/70" />

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
        <p className="text-sm md:text-base tracking-[0.3em] uppercase mb-6 font-medium text-white/70">
          {t.heroSubtitle}
        </p>

        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-6 leading-[0.95] tracking-tight text-white" style={{ fontFamily: "var(--font-display)" }}>
          Arabă libaneză
        </h1>

        <p className="text-lg md:text-xl max-w-xl mx-auto mb-10 font-light leading-relaxed text-white/80">
          {t.heroDesc}
        </p>

        {/* Checkmarks */}
        <div className="flex flex-wrap justify-center gap-x-8 gap-y-3 mb-12">
          {[t.heroBullet1, t.heroBullet2, t.heroBullet3].map((item) => (
            <div key={item} className="flex items-center gap-2 text-white/90 text-sm md:text-base">
              <CheckCircle2 className="w-5 h-5 text-secondary shrink-0" />
              <span>{item}</span>
            </div>
          ))}
        </div>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="#inscriere"
            className="inline-flex items-center gap-2 px-10 py-4 rounded-lg font-semibold text-lg bg-secondary text-secondary-foreground transition-all duration-300 hover:brightness-110 hover:scale-[1.02]"
          >
            ✦ {t.heroCta}
          </a>
          <a
            href="#inscriere"
            className="inline-flex items-center gap-2 px-10 py-4 rounded-lg font-semibold text-lg bg-white/15 backdrop-blur-sm text-white border border-white/25 transition-all duration-300 hover:bg-white/25"
          >
            {t.heroCtaSecondary}
          </a>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};

export default HeroSection;
