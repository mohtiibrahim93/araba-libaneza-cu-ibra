import { useI18n } from "@/lib/i18n";

const FeaturesSection = () => {
  const { t } = useI18n();

  const features = [
    { num: "01", title: t.feat1Title, desc: t.feat1Desc },
    { num: "02", title: t.feat2Title, desc: t.feat2Desc },
    { num: "03", title: t.feat3Title, desc: t.feat3Desc },
    { num: "04", title: t.feat4Title, desc: t.feat4Desc },
  ];

  return (
    <section id="despre" className="py-24 px-6 scroll-mt-20">
      <div className="max-w-4xl mx-auto">
        <p className="text-[11px] tracking-[0.4em] uppercase text-muted-foreground font-medium text-center mb-4">—</p>
        <h2 className="text-3xl md:text-5xl font-bold text-center mb-16 tracking-tight">
          {t.featTitle}
        </h2>

        <div className="grid sm:grid-cols-2 gap-x-16 gap-y-12">
          {features.map(({ num, title, desc }) => (
            <div key={num} className="group">
              <span className="text-[11px] tracking-[0.3em] text-primary font-semibold">{num}</span>
              <h3 className="text-lg font-semibold mt-1 mb-2 tracking-tight">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
