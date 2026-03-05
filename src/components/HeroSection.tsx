import { useI18n } from "@/lib/i18n";
import CedarTree from "@/components/CedarTree";

const HeroSection = () => {
  const { t } = useI18n();

  return (
    <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
      {/* Lebanese flag background */}
      <div className="absolute inset-0 flex flex-col">
        <div className="flex-1 bg-primary" />
        <div className="flex-[2] bg-card flex items-center justify-center">
          <CedarTree className="text-secondary opacity-10" size={300} />
        </div>
        <div className="flex-1 bg-primary" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-3 mb-6">
          <CedarTree className="text-secondary" size={40} />
        </div>

        <p className="text-secondary text-sm tracking-[0.3em] uppercase mb-4 font-medium">
          {t.heroSubtitle}
        </p>
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold mb-6 leading-tight text-foreground">
          Curs Arabă{" "}
          <span className="text-primary">Libaneză</span>
        </h1>
        <p className="text-muted-foreground text-lg md:text-xl max-w-xl mx-auto mb-10 font-light leading-relaxed">
          {t.heroDesc}
        </p>
        <a
          href="#inscriere"
          className="inline-block px-10 py-4 rounded-lg font-semibold bg-primary text-primary-foreground transition-all duration-300 hover:scale-105 text-lg"
          style={{ boxShadow: "var(--shadow-warm)" }}
        >
          {t.heroCta}
        </a>
      </div>
    </section>
  );
};

export default HeroSection;
