import { useI18n } from "@/lib/i18n";
import { GraduationCap, BookOpen, Globe, Award } from "lucide-react";

const FeaturesSection = () => {
  const { t } = useI18n();

  const features = [
    { icon: GraduationCap, title: t.feat1Title, desc: t.feat1Desc },
    { icon: BookOpen, title: t.feat2Title, desc: t.feat2Desc },
    { icon: Globe, title: t.feat3Title, desc: t.feat3Desc },
    { icon: Award, title: t.feat4Title, desc: t.feat4Desc },
  ];

  return (
    <section id="despre" className="py-20 px-6 scroll-mt-20">
      <div className="max-w-5xl mx-auto">
        <p className="text-xs tracking-[0.3em] uppercase text-primary font-semibold text-center mb-2">—</p>
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
          {t.featTitle}
        </h2>
        <p className="text-center text-muted-foreground mb-14 max-w-lg mx-auto">
          {t.heroDesc}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="rounded-lg p-6 bg-card border border-border text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
            >
              <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-4">
                <Icon className="w-5 h-5 text-secondary" />
              </div>
              <h3 className="font-bold text-base mb-2">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
