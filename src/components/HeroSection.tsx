import { useI18n } from "@/lib/i18n";
import heroBanner from "@/assets/hero-banner.jpg";

const HeroSection = () => {
  const { t } = useI18n();

  return (
    <section className="relative min-h-screen flex items-center pt-20">
      {/* Background image */}
      <img
        src={heroBanner}
        alt="Baalbek ruins with Lebanese flag"
        className="absolute inset-0 w-full h-full object-cover"
      />
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />

      {/* Content — left-aligned */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <p className="text-sm tracking-[0.25em] uppercase mb-4 font-medium text-white/60">
            {t.heroSubtitle}
          </p>

          <h1
            className="text-5xl md:text-6xl lg:text-7xl font-black mb-3 leading-[0.95] tracking-tight text-white"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {t.heroTitle}
          </h1>

          <p className="text-lg md:text-xl text-secondary font-semibold mb-6" style={{ fontFamily: "var(--font-display)" }}>
            {t.heroCulture}
          </p>

          <p className="text-base md:text-lg max-w-md mb-10 font-light leading-relaxed text-white/80">
            {t.heroDesc}
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row items-start gap-4">
            <a
              href="#inscriere"
              className="inline-flex items-center gap-2 px-10 py-4 rounded-lg font-semibold text-lg bg-secondary text-secondary-foreground transition-all duration-300 hover:brightness-110 hover:scale-[1.02]"
            >
              ✦ {t.heroCta}
            </a>
            <a
              href="#despre"
              className="inline-flex items-center gap-2 px-10 py-4 rounded-lg font-semibold text-lg bg-white/15 backdrop-blur-sm text-white border border-white/25 transition-all duration-300 hover:bg-white/25"
            >
              {t.heroAboutCourse}
            </a>
          </div>
        </div>

        {/* Right side — placeholder for portrait photo */}
        <div className="hidden md:flex items-center justify-center">
          <div className="w-80 h-96 rounded-2xl border-2 border-dashed border-white/20 flex items-center justify-center bg-white/5 backdrop-blur-sm">
            <p className="text-white/40 text-sm text-center px-6">
              {t.heroPhotoPlaceholder}
            </p>
          </div>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};

export default HeroSection;
