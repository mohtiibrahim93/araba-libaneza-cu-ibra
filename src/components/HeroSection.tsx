import { useI18n } from "@/lib/i18n";

const HeroSection = () => {
  const { t } = useI18n();

  return (
    <section className="min-h-[85vh] flex items-center justify-center pt-20 px-6">
      <div className="max-w-3xl mx-auto text-center">
        <p className="text-[11px] tracking-[0.4em] uppercase text-muted-foreground font-medium mb-8">
          {t.heroSubtitle}
        </p>

        <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold leading-[0.9] tracking-tight text-foreground mb-4">
          {t.heroTitle}
        </h1>

        <p className="text-xl md:text-2xl font-light italic text-primary mb-6" style={{ fontFamily: "var(--font-display)" }}>
          {t.heroCulture}
        </p>

        <p className="text-base text-muted-foreground max-w-md mx-auto mb-12 leading-relaxed font-light">
          {t.heroDesc}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="#inscriere"
            className="px-8 py-3.5 text-sm font-semibold tracking-wide bg-foreground text-background rounded-full transition-all hover:opacity-90"
          >
            {t.heroCta}
          </a>
          <a
            href="#despre"
            className="px-8 py-3.5 text-sm font-medium tracking-wide text-muted-foreground hover:text-foreground transition-colors"
          >
            {t.heroAboutCourse} →
          </a>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
