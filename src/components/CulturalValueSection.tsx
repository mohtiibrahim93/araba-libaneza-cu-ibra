import { useI18n } from "@/lib/i18n";
import { Heart, Briefcase, Sparkles } from "lucide-react";
import AnchorLink from "@/components/AnchorLink";

const CulturalValueSection = () => {
  const { t } = useI18n();
  const cards = [
    { Icon: Heart, title: t.culture1Title, desc: t.culture1Desc },
    { Icon: Briefcase, title: t.culture2Title, desc: t.culture2Desc },
    { Icon: Sparkles, title: t.culture3Title, desc: t.culture3Desc },
  ];
  return (
    <section id="culture" className="py-20 px-6 bg-muted/30 scroll-mt-20">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-sm font-medium text-primary mb-2 block">{t.cultureBadge}</span>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-3">
            {t.cultureTitle}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">{t.cultureDesc}</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6 mb-10">
          {cards.map(({ Icon, title, desc }) => (
            <div
              key={title}
              className="rounded-2xl border border-border bg-background p-6 shadow-sm"
            >
              <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
        <div className="text-center">
          <AnchorLink
            to="#inscriere"
            className="inline-flex items-center justify-center gap-2 px-7 py-3 text-sm font-semibold bg-primary text-primary-foreground rounded-lg transition-all hover:bg-primary/90"
          >
            {t.cultureCta} →
          </AnchorLink>
        </div>
      </div>
    </section>
  );
};

export default CulturalValueSection;