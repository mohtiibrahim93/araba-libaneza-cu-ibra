import { useI18n } from "@/lib/i18n";
import {
  MessageCircle,
  Type,
  MapPin,
  Sparkles,
  TrendingUp,
  HeartHandshake,
} from "lucide-react";

/**
 * "De ce să înveți cu Ibra?" — six-benefit grid. Absorbs the old checklist
 * (WhySection) and the CulturalValueSection cards into one section; the raw
 * stats moved to the trust band under the hero.
 */
const WhySection = () => {
  const { t } = useI18n();

  const benefits = [
    { Icon: MessageCircle, title: t.benefit1Title, desc: t.benefit1Desc },
    { Icon: Type, title: t.benefit2Title, desc: t.benefit2Desc },
    { Icon: MapPin, title: t.benefit3Title, desc: t.benefit3Desc },
    { Icon: Sparkles, title: t.benefit4Title, desc: t.benefit4Desc },
    { Icon: TrendingUp, title: t.benefit5Title, desc: t.benefit5Desc },
    { Icon: HeartHandshake, title: t.benefit6Title, desc: t.benefit6Desc },
  ];

  return (
    <section id="about" className="py-section px-gutter bg-cream scroll-mt-20">
      <div className="w-full max-w-content mx-auto">
        <div className="text-center mb-12">
          <span className="text-sm font-medium text-primary mb-2 block">{t.whyBadge}</span>
          <h2 className="font-display text-display-lg font-bold tracking-tight text-foreground mb-3">
            {t.whyTitle}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">{t.whyDesc}</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map(({ Icon, title, desc }) => (
            <div
              key={title}
              className="bg-background rounded-2xl border border-border/60 p-6 shadow-xs"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-green/10 mb-4">
                <Icon className="w-5 h-5 text-brand-green" aria-hidden="true" />
              </div>
              <h3 className="font-display text-lg font-bold text-foreground mb-2">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhySection;
