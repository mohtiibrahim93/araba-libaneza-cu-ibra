import { useI18n } from "@/lib/i18n";
import CedarTree from "@/components/CedarTree";
import heroBanner from "@/assets/hero-banner.jpg";

const HeroSection = () => {
  const { t } = useI18n();

  return (
    <section className="relative min-h-screen flex items-center justify-center pt-20">
      {/* Background image */}
      <img
        src={heroBanner}
        alt="Lebanese landscape"
        className="absolute inset-0 w-full h-full object-cover"
      />
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70" />

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-3xl mx-auto">
        <CedarTree className="text-secondary mx-auto mb-8 drop-shadow-lg" size={56} />

        <p className="text-sm md:text-base tracking-[0.35em] uppercase mb-6 font-medium" style={{ color: "hsl(152, 65%, 55%)" }}>
          {t.heroSubtitle}
        </p>

        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-8 leading-[0.95] tracking-tight" style={{ color: "white" }}>
          Curs Arabă
          <br />
          <span style={{ color: "hsl(0, 72%, 58%)" }}>Libaneză</span>
        </h1>

        <p className="text-lg md:text-xl max-w-lg mx-auto mb-12 font-light leading-relaxed" style={{ color: "hsla(0, 0%, 100%, 0.8)" }}>
          {t.heroDesc}
        </p>

        <a
          href="#inscriere"
          className="inline-block px-10 py-4 rounded font-semibold text-lg bg-primary text-primary-foreground transition-all duration-300 hover:brightness-110 hover:scale-[1.03]"
          style={{ boxShadow: "0 8px 30px hsla(0, 72%, 45%, 0.4)" }}
        >
          {t.heroCta}
        </a>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};

export default HeroSection;
