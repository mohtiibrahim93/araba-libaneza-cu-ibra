import { useI18n } from "@/lib/i18n";

const CTASection = () => {
  const { t } = useI18n();

  return (
    <section className="py-28 px-6">
      <div className="max-w-2xl mx-auto text-center">
        <h2 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
          {t.ctaTitle}
        </h2>
        <p className="text-muted-foreground mb-10 text-base max-w-md mx-auto">{t.ctaDesc}</p>
        <a
          href="#inscriere"
          className="inline-flex px-10 py-4 text-sm font-semibold tracking-wide bg-foreground text-background rounded-full transition-all hover:opacity-90"
        >
          {t.heroCta}
        </a>
      </div>
    </section>
  );
};

export default CTASection;
