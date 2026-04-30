import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { Check, Clock, MessageCircle } from "lucide-react";
import groupImg from "@/assets/group-course.jpg";
import privateImg from "@/assets/private-course.jpg";
import kidsImg from "@/assets/kids-course.jpg";

const LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;
type Level = (typeof LEVELS)[number];

const ProgramsSection = () => {
  const { t } = useI18n();
  const [activeLevel, setActiveLevel] = useState<Level>("A1");

  const levelSubtitles: Record<Level, string> = {
    A1: t.levelA1Subtitle,
    A2: t.levelA2Subtitle,
    B1: t.levelB1Subtitle,
    B2: t.levelB2Subtitle,
    C1: t.levelC1Subtitle,
    C2: t.levelC2Subtitle,
  };

  const isAvailable = (level: Level) => level === "A1";

  const levelPrices: Partial<Record<Level, string>> = {
    A1: "500",
    A2: "600",
    B1: "700",
    B2: "800",
  };

  const formatLei = (n: number) =>
    n % 1 === 0 ? n.toLocaleString("ro-RO") : n.toFixed(1).replace(".", ",");

  const otherPrograms = [
    {
      badge: t.privateBadge,
      title: t.privateCardTitle,
      desc: t.privateCardDesc,
      meta: [
        { label: t.programFormatLabel, value: t.privateFormat },
        { label: t.programDurationLabel, value: t.privateDuration },
        { label: t.programConditionsLabel, value: t.privateConditions },
      ],
      feats: [t.privateFeat1, t.privateFeat2, t.privateFeat3, t.privateFeat4],
      cta: t.privateRegister,
      href: "#private",
      img: privateImg,
      price: t.pricingPrivatePrice,
      per: t.pricingPrivatePer,
      discount: t.pricingPrivateDiscount,
    },
    {
      badge: t.kidsBadgeCard,
      title: t.kidsCardTitle,
      desc: t.kidsCardDesc,
      meta: [
        { label: t.programFormatLabel, value: t.kidsFormat },
        { label: t.programDurationLabel, value: t.kidsDuration },
        { label: t.programConditionsLabel, value: t.kidsConditions },
      ],
      feats: [t.kidsFeat1, t.kidsFeat2, t.kidsFeat3, t.kidsFeat4],
      cta: t.kidsRegister,
      href: "#kids",
      img: kidsImg,
      price: undefined as string | undefined,
      per: undefined as string | undefined,
      discount: undefined as string | undefined,
    },
  ];

  return (
    <section id="courses" className="py-20 px-6 bg-muted/50 scroll-mt-20">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-sm font-medium text-primary mb-2 block">{t.programsBadge}</span>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-3">{t.programsTitle}</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">{t.programsDesc}</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Group Course Card with Level Tabs */}
          <div className="bg-background rounded-2xl border border-border overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col">
            <img src={groupImg} alt={t.groupCardTitle} className="w-full h-52 object-cover" />
            <div className="p-6 flex flex-col flex-1">
              <span className="inline-block text-xs font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full mb-3">
                {t.groupBadge}
              </span>
              <h3 className="text-xl font-bold text-foreground mb-4">{t.groupCardTitle}</h3>

              {/* Level Pills */}
              <div className="flex flex-wrap gap-2 mb-5">
                {LEVELS.map((level) => (
                  <button
                    key={level}
                    onClick={() => setActiveLevel(level)}
                    className={`px-3.5 py-1.5 text-xs font-semibold rounded-full border transition-colors ${
                      activeLevel === level
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background text-muted-foreground border-border hover:border-primary/50"
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>

              {/* Level subtitle */}
              <p className="text-sm font-medium text-foreground mb-2">{levelSubtitles[activeLevel]}</p>

              {levelPrices[activeLevel] && (
                <p className="text-sm text-muted-foreground mb-2">
                  <span className="text-base font-bold text-foreground">{levelPrices[activeLevel]} LEI</span>
                  <span className="ml-1">/ {t.pricingGroupPerMonth}</span>
                </p>
              )}

              {levelPrices[activeLevel] && (() => {
                const monthly = Number(levelPrices[activeLevel]);
                const total = monthly * 3;
                const discounted = total * 0.9;
                return (
                  <div className="mb-4 rounded-lg border border-primary/30 bg-primary/5 px-4 py-3 text-sm">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="text-muted-foreground">{t.pricingGroup3MonthsLabel}</span>
                      <span className="font-semibold text-foreground">{formatLei(total)} LEI</span>
                    </div>
                    <div className="mt-1 flex items-baseline justify-between gap-2 text-primary">
                      <span className="font-medium">{t.pricingGroupDiscount}</span>
                      <span className="font-bold whitespace-nowrap">{formatLei(discounted)} LEI</span>
                    </div>
                  </div>
                );
              })()}

              {isAvailable(activeLevel) ? (
                <>
                  <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{t.groupCardDesc}</p>
                  <dl className="space-y-3 rounded-lg border border-border bg-muted/40 p-4 mb-5">
                    {[
                      { label: t.programFormatLabel, value: t.groupFormat },
                      { label: t.programDurationLabel, value: t.programGroupDuration },
                      { label: t.programConditionsLabel, value: t.groupConditions },
                    ].map((item) => (
                      <div key={item.label}>
                        <dt className="text-xs font-semibold uppercase text-muted-foreground">{item.label}</dt>
                        <dd className="text-sm font-medium text-foreground">{item.value}</dd>
                      </div>
                    ))}
                  </dl>
                  <ul className="space-y-2 mb-6">
                    {[t.groupFeat1, t.groupFeat2, t.groupFeat3, t.groupFeat4].map((f, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-foreground">
                        <Check className="w-4 h-4 text-primary flex-shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <a
                    href="#inscriere"
                    className="block w-full text-center py-3 text-sm font-semibold border border-primary text-primary rounded-lg hover:bg-primary hover:text-primary-foreground transition-colors"
                  >
                    {t.groupRegister}
                  </a>
                </>
              ) : (
                <div className="mt-2">
                  <div className="flex items-center gap-2 text-muted-foreground mb-3">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm font-medium">{t.levelComingSoon}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-5 leading-relaxed">{t.levelComingSoonDesc}</p>
                  <a
                    href="https://wa.me/40763124514"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-lg bg-[#25D366] text-white hover:bg-[#1fb855] transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                    {t.levelContactUs}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Private & Kids Cards */}
          {otherPrograms.map((p) => (
            <div key={p.title} className="bg-background rounded-2xl border border-border overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col">
              <img src={p.img} alt={p.title} className="w-full h-52 object-cover" />
              <div className="p-6 flex flex-col flex-1">
                <span className="inline-block text-xs font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full mb-3">
                  {p.badge}
                </span>
                <h3 className="text-xl font-bold text-foreground mb-2">{p.title}</h3>
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{p.desc}</p>
                {p.price && (
                  <p className="text-sm text-muted-foreground mb-2">
                    <span className="text-base font-bold text-foreground">{p.price} LEI</span>
                    {p.per && <span className="ml-1">· {p.per.replace(/^LEI\s*\/?\s*/i, "")}</span>}
                  </p>
                )}
                {p.discount && (
                  <p className="text-xs font-medium text-primary mb-4">{p.discount}</p>
                )}
                <dl className="space-y-3 rounded-lg border border-border bg-muted/40 p-4 mb-5">
                  {p.meta.map((item) => (
                    <div key={item.label}>
                      <dt className="text-xs font-semibold uppercase text-muted-foreground">{item.label}</dt>
                      <dd className="text-sm font-medium text-foreground">{item.value}</dd>
                    </div>
                  ))}
                </dl>
                <ul className="space-y-2 mb-6">
                  {p.feats.map((f, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-foreground">
                      <Check className="w-4 h-4 text-primary flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <a
                  href={p.href}
                  className="block w-full text-center py-3 text-sm font-semibold border border-primary text-primary rounded-lg hover:bg-primary hover:text-primary-foreground transition-colors mt-auto"
                >
                  {p.cta}
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProgramsSection;
