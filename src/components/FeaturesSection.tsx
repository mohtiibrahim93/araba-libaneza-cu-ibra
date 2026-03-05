import { useI18n } from "@/lib/i18n";
import { BookOpen, MessageSquare, Smartphone, Award } from "lucide-react";

const FeaturesSection = () => {
  const { t } = useI18n();

  const features = [
    { icon: BookOpen, title: t.feat1Title, desc: t.feat1Desc },
    { icon: MessageSquare, title: t.feat2Title, desc: t.feat2Desc },
    { icon: Smartphone, title: t.feat3Title, desc: t.feat3Desc },
    { icon: Award, title: t.feat4Title, desc: t.feat4Desc },
  ];

  return (
    <section className="py-20 px-6">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-14 tracking-tight">
          {t.featTitle}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {features.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="rounded-2xl p-6 bg-card border border-border text-center transition-shadow hover:shadow-lg"
              style={{ boxShadow: "var(--shadow-sm)" }}
            >
              <div className="w-14 h-14 rounded-xl bg-secondary/10 flex items-center justify-center mx-auto mb-4">
                <Icon className="w-7 h-7 text-secondary" />
              </div>
              <h3 className="font-bold text-sm mb-2">{title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
