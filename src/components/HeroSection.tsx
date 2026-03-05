import heroBanner from "@/assets/hero-banner.jpg";

const HeroSection = () => {
  return (
    <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
      <img
        src={heroBanner}
        alt="Lebanese Arabic Course Banner"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div
        className="absolute inset-0"
        style={{ background: "var(--gradient-hero)" }}
      />
      <div className="relative z-10 text-center px-4 max-w-3xl mx-auto">
        <p className="text-primary-foreground/80 text-lg tracking-[0.3em] uppercase mb-4 font-light">
          Raduga • Cursuri de limbă
        </p>
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-primary-foreground mb-6 leading-tight">
          Curs de Arabă{" "}
          <span className="text-primary">Libaneză</span>
        </h1>
        <p className="text-primary-foreground/90 text-lg md:text-xl max-w-xl mx-auto mb-8 font-light">
          Începe călătoria ta lingvistică. Cursuri de grup, lecții private și
          cursuri pentru copii — toate disponibile acum.
        </p>
        <a
          href="#inscriere"
          className="inline-block px-8 py-4 rounded-lg font-semibold text-primary-foreground transition-all duration-300 hover:scale-105 hover:shadow-lg"
          style={{ background: "var(--gradient-warm)" }}
        >
          Înscrie-te acum ↓
        </a>
      </div>
    </section>
  );
};

export default HeroSection;
