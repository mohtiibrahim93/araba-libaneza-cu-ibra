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
        <h2
          className="text-3xl md:text-4xl font-bold text-center mb-14 tracking-tight"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {t.featTitle}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {features.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="rounded-2xl p-7 bg-white border border-border text-center transition-all duration-300 hover:-translate-y-1"
              style={{ boxShadow: "0 4px 24px hsla(25, 20%, 15%, 0.07)" }}
            >
              <div className="w-14 h-14 rounded-xl bg-secondary/10 flex items-center justify-center mx-auto mb-5">
                <Icon className="w-7 h-7 text-secondary" />
              </div>
              <h3 className="font-bold text-sm mb-2" style={{ fontFamily: "var(--font-display)" }}>
                {title}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
