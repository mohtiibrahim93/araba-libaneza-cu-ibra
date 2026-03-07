import { useI18n } from "@/lib/i18n";
import CedarTree from "@/components/CedarTree";

const CTASection = () => {
  const { t } = useI18n();

  return (
    <section className="py-20 px-6 bg-secondary text-secondary-foreground relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <CedarTree className="absolute -right-10 -bottom-10 text-white" size={200} />
        <CedarTree className="absolute -left-5 top-5 text-white" size={100} />
      </div>
      <div className="max-w-2xl mx-auto text-center relative z-10">
        <h2
          className="text-3xl md:text-4xl font-bold mb-4 tracking-tight"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {t.ctaTitle}
        </h2>
        <p className="text-white/80 mb-8 text-lg">{t.ctaDesc}</p>
        <a
          href="#inscriere"
          className="inline-flex items-center gap-2 px-12 py-4 rounded-lg font-semibold text-lg bg-white text-secondary transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
        >
          ✦ {t.heroCta}
        </a>
      </div>
    </section>
  );
};

export default CTASection;
