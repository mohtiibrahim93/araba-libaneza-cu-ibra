import { useI18n } from "@/lib/i18n";
import { Check } from "lucide-react";

const GROUP_LEVEL_PRICES = [500, 600, 700, 800] as const;

const PricingSection = () => {
  const { t } = useI18n();

  const plans = [
    {
      label: t.pricingPrivateLabel,
      sub: t.pricingPrivateSub,
      price: t.pricingPrivatePrice as string | undefined,
      per: t.pricingPerSessionSuffix as string | undefined,
      perNote: t.pricingPrivateRateNote as string | undefined,
      priceByLevelLabel: undefined as string | undefined,
      priceByLevelText: undefined as string | undefined,
      feats: [t.pricingPrivateFeat1, t.pricingPrivateFeat2, t.pricingPrivateFeat3, t.pricingPrivateFeat4],
      popular: false,
      discount: t.pricingPrivateDiscount,
      allLevelsLabel: t.pricingPrivateAllLevels,
      seeLevelsHref: undefined as string | undefined,
      seeLevelsLabel: undefined as string | undefined,
      totals: undefined as { level: string; total: number; discounted: number }[] | undefined,
      levelPills: undefined as { level: string; monthly: number }[] | undefined,
      fromPrefix: undefined as string | undefined,
    },
    {
      label: t.pricingGroupLabel,
      sub: t.pricingGroupSub,
      price: t.pricingGroupPriceRange as string | undefined,
      per: t.pricingPerMonthSuffix as string | undefined,
      perNote: t.pricingGroupRangeNote as string | undefined,
      priceByLevelLabel: undefined as string | undefined,
      priceByLevelText: undefined as string | undefined,
      feats: [t.pricingGroupFeat1, t.pricingGroupFeat2, t.pricingGroupFeat3, t.pricingGroupFeat4],
      popular: true,
      discount: t.pricingGroupDiscount,
      seeLevelsHref: "#group-levels",
      seeLevelsLabel: t.pricingGroupSeeLevels,
      allLevelsLabel: undefined as string | undefined,
      totals: GROUP_LEVEL_PRICES.map((m) => ({
        level: ["A1", "A2", "B1", "B2"][GROUP_LEVEL_PRICES.indexOf(m)],
        total: m * 3,
        discounted: m * 3 * 0.9,
      })),
      levelPills: GROUP_LEVEL_PRICES.map((m, i) => ({
        level: ["A1", "A2", "B1", "B2"][i],
        monthly: m,
      })),
      fromPrefix: t.pricingFromPrefix as string | undefined,
    },
  ];

  const formatLei = (n: number) =>
    n % 1 === 0 ? n.toLocaleString("ro-RO") : n.toFixed(1).replace(".", ",");

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
              <p className="text-sm text-muted-foreground mb-5">{p.sub}</p>

              <div className="mb-2">
                <div className="flex items-baseline flex-wrap gap-x-2 gap-y-1">
                  {p.fromPrefix && (
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {p.fromPrefix}
                    </span>
                  )}
                  <span className="text-4xl sm:text-5xl font-extrabold text-foreground leading-none tracking-tight">
                    {p.price}
                  </span>
                  <span className="text-sm font-semibold text-muted-foreground">{p.per}</span>
                </div>
                {p.perNote && (
                  <p className="text-xs text-muted-foreground mt-1.5">{p.perNote}</p>
                )}
              </div>

              {p.levelPills && (
                <div className="mt-4 mb-4 flex flex-wrap gap-1.5">
                  {p.levelPills.map((pill) => (
                    <span
                      key={pill.level}
                      className="inline-flex items-baseline gap-1 rounded-full border border-border bg-muted/50 px-2.5 py-1 text-[11px] font-medium text-foreground"
                    >
                      <span className="font-bold text-primary">{pill.level}</span>
                      <span className="text-muted-foreground">·</span>
                      <span>{formatLei(pill.monthly)} LEI</span>
                    </span>
                  ))}
                </div>
              )}

              {p.seeLevelsHref && (
                <a
                  href={p.seeLevelsHref}
                  className="inline-block text-xs font-semibold text-primary hover:underline mb-5"
                >
                  {p.seeLevelsLabel}
                </a>
              )}
              {p.allLevelsLabel ? (
                <span className="inline-block text-xs font-semibold text-primary mb-5">
                  ✓ {p.allLevelsLabel}
                </span>
              ) : !p.seeLevelsHref ? (
                <div className="mb-5" />
              ) : null}

              <ul className="space-y-3 mb-8">
                {p.feats.map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-foreground">
                    <Check className="w-4 h-4 text-primary flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              {p.totals && (
                <div className="mb-6 rounded-lg border border-border bg-muted/40 p-4">
                  <p className="text-xs font-semibold uppercase text-muted-foreground mb-2">
                    {t.pricingGroup3MonthsLabel}
                  </p>
                  <ul className="space-y-1.5 text-sm">
                    {p.totals.map((row) => (
                      <li key={row.level} className="flex items-baseline justify-between gap-3">
                        <span className="font-semibold text-foreground">{row.level}</span>
                        <span className="text-muted-foreground">
                          <span className="font-medium text-foreground">{formatLei(row.total)} LEI</span>
                          <span className="mx-1.5">→</span>
                          <span className="font-bold text-primary">{formatLei(row.discounted)} LEI</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {p.discount && (
                <div className="mb-6 rounded-lg border border-primary/30 bg-primary/5 px-4 py-3 text-sm font-medium text-primary">
                  {p.discount}
                </div>
              )}

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
