import { useI18n } from "@/lib/i18n";
import { Check } from "lucide-react";

const PricingSection = () => {
  const { t } = useI18n();

  const plans = [
    {
      label: t.pricingPrivateLabel,
      sub: t.pricingPrivateSub,
      price: t.pricingPrivatePrice,
      per: t.pricingPrivatePer,
      feats: [t.pricingPrivateFeat1, t.pricingPrivateFeat2, t.pricingPrivateFeat3, t.pricingPrivateFeat4],
      popular: false,
    },
    {
      label: t.pricingGroupLabel,
      sub: t.pricingGroupSub,
      price: t.pricingGroupPrice,
      per: t.pricingGroupPer,
      feats: [t.pricingGroupFeat1, t.pricingGroupFeat2, t.pricingGroupFeat3, t.pricingGroupFeat4],
      popular: true,
    },
  ];

  return (
    <section id="pricing" className="py-20 px-6 scroll-mt-20">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-sm font-medium text-primary mb-2 block">{t.pricingBadge}</span>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-3">{t.pricingTitle}</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">{t.pricingDesc}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {plans.map((p) => (
            <div
              key={p.label}
              className={`relative rounded-2xl border p-8 transition-shadow ${
                p.popular
                  ? "border-primary shadow-lg ring-1 ring-primary/20"
                  : "border-border shadow-sm"
              }`}
            >
              {p.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-semibold px-4 py-1 rounded-full">
                  {t.pricingPopular}
                </span>
              )}

              <h3 className="text-lg font-bold text-foreground">{p.label}</h3>
              <p className="text-sm text-muted-foreground mb-4">{p.sub}</p>

              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-4xl font-extrabold text-foreground">{p.price}</span>
                <span className="text-base font-semibold text-foreground">LEI</span>
              </div>
              <p className="text-sm text-muted-foreground mb-6">{p.per}</p>

              <ul className="space-y-3 mb-8">
                {p.feats.map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-foreground">
                    <Check className="w-4 h-4 text-primary flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              <a
                href="#inscriere"
                className={`block w-full text-center py-3 text-sm font-semibold rounded-lg transition-colors ${
                  p.popular
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "border border-border text-foreground hover:bg-muted"
                }`}
              >
                {t.pricingStart}
              </a>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">{t.pricingNote}</p>
      </div>
    </section>
  );
};

export default PricingSection;
