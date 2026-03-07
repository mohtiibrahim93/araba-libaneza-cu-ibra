import { useI18n } from "@/lib/i18n";
import instructorPhoto from "@/assets/instructor-photo.png";

const HeroSection = () => {
  const { t } = useI18n();

  return (
    <section className="relative min-h-[90vh] flex items-center pt-20 overflow-hidden bg-foreground">
      {/* Content */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-8 items-center">
        {/* Left — text */}
        <div className="py-12 md:py-0">
          <div className="inline-flex items-center gap-2 mb-6">
            <span className="w-8 h-[2px] bg-primary" />
            <span className="text-xs tracking-[0.3em] uppercase font-semibold text-primary">
              {t.heroSubtitle}
            </span>
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-2 leading-[1] tracking-tight text-background">
            {t.heroTitle}
          </h1>

          <p className="text-xl md:text-2xl text-primary font-semibold mb-6 italic">
            {t.heroCulture}
          </p>

          <p className="text-base md:text-lg max-w-md mb-10 font-light leading-relaxed text-background/70">
            {t.heroDesc}
          </p>

          <div className="flex flex-col sm:flex-row items-start gap-3">
            <a
              href="#inscriere"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded font-semibold text-base bg-primary text-primary-foreground transition-all duration-300 hover:brightness-110 hover:translate-y-[-1px]"
            >
              {t.heroCta}
            </a>
            <a
              href="#despre"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded font-semibold text-base border border-background/30 text-background/80 transition-all duration-300 hover:bg-background/10"
            >
              {t.heroAboutCourse}
            </a>
          </div>
        </div>

        {/* Right — instructor photo */}
        <div className="hidden md:flex items-center justify-center">
          <div className="relative">
            <div className="w-[340px] h-[440px] rounded-lg overflow-hidden border-4 border-background/10 shadow-2xl">
              <img
                src={instructorPhoto}
                alt="Instructor"
                className="w-full h-full object-cover object-top"
              />
            </div>
            {/* Decorative accent */}
            <div className="absolute -bottom-3 -right-3 w-full h-full rounded-lg border-2 border-primary/30 -z-10" />
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};

export default HeroSection;
