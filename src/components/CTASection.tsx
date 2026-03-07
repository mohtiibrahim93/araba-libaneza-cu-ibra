import { useI18n } from "@/lib/i18n";

const CTASection = () => {
  const { t } = useI18n();

  return (
    <section className="py-20 px-6 bg-secondary text-secondary-foreground">
      <div className="max-w-2xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          {t.ctaTitle}
        </h2>
        <p className="text-secondary-foreground/70 mb-8 text-lg">{t.ctaDesc}</p>
        <a
          href="#inscriere"
          className="inline-flex items-center gap-2 px-10 py-3.5 rounded font-semibold text-base bg-card text-secondary transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
        >
          {t.heroCta}
        </a>
      </div>
    </section>
  );
};

export default CTASection;
