import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { Check, Clock, MessageCircle, CheckCircle2 } from "lucide-react";
import AnchorLink from "@/components/AnchorLink";
import RegistrationFormSection from "@/components/RegistrationFormSection";
import { useGroupCapacities } from "@/hooks/useGroupCapacity";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import groupImg from "@/assets/group-course.jpg";
import privateImg from "@/assets/private-course.jpg";
import kidsImg from "@/assets/kids-course.jpg";

const wa = (msg: string) =>
  "https://wa.me/40763124514?text=" + encodeURIComponent(msg);
const WA_GROUP = wa("Salut! Vreau să mă înscriu la cursul de grup de arabă libaneză.");
const WA_PRIVATE = wa("Salut! Sunt interesat(ă) de lecții private de arabă libaneză.");
const WA_KIDS = wa("Salut! Sunt interesat(ă) de cursul de arabă libaneză pentru copii.");

const LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;
type Level = (typeof LEVELS)[number];

const ProgramsSection = () => {
  const { t } = useI18n();
  const [activeLevel, setActiveLevel] = useState<Level>("A1");
  const [inlineForm, setInlineForm] = useState<null | "group" | "private" | "kids">(null);
  const { get: getCapacity } = useGroupCapacities();
  const activeCap = getCapacity("group", activeLevel);
  const kidsCap = getCapacity("kids", null);

  const levelSubtitles: Record<Level, string> = {
    A1: t.levelA1Subtitle,
    A2: t.levelA2Subtitle,
    B1: t.levelB1Subtitle,
    B2: t.levelB2Subtitle,
    C1: t.levelC1Subtitle,
    C2: t.levelC2Subtitle,
  };

  const levelCurriculum: Record<Level, { obj: string; mods: string[] }> = {
    A1: { obj: t.curriculumA1Obj, mods: [t.curriculumA1M1, t.curriculumA1M2, t.curriculumA1M3] },
    A2: { obj: t.curriculumA2Obj, mods: [t.curriculumA2M1, t.curriculumA2M2, t.curriculumA2M3] },
    B1: { obj: t.curriculumB1Obj, mods: [t.curriculumB1M1, t.curriculumB1M2, t.curriculumB1M3] },
    B2: { obj: t.curriculumB2Obj, mods: [t.curriculumB2M1, t.curriculumB2M2, t.curriculumB2M3] },
    C1: { obj: t.curriculumC1Obj, mods: [t.curriculumC1M1, t.curriculumC1M2, t.curriculumC1M3] },
    C2: { obj: t.curriculumC2Obj, mods: [t.curriculumC2M1, t.curriculumC2M2, t.curriculumC2M3] },
  };

  const isAvailable = (level: Level) => level === "A1";

  const levelPrices: Record<Level, string> = {
    A1: "500",
    A2: "600",
    B1: "700",
    B2: "800",
    C1: "900",
    C2: "1000",
  };

  const formatLei = (n: number) =>
    n % 1 === 0 ? n.toLocaleString("ro-RO") : n.toFixed(1).replace(".", ",");

  const privateProgram = {
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
      href: WA_PRIVATE,
      img: privateImg,
      price: t.pricingPrivatePrice,
      per: t.pricingPerSessionSuffix,
      perNote: t.pricingPrivateRateNote,
      discount: t.pricingPrivateDiscount,
  };
  const kidsProgram = {
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
      href: WA_KIDS,
      img: kidsImg,
      price: undefined as string | undefined,
      per: undefined as string | undefined,
      perNote: undefined as string | undefined,
      discount: undefined as string | undefined,
  };

  return (
    <section id="courses" className="py-20 px-6 bg-muted/50 scroll-mt-20">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-sm font-medium text-primary mb-2 block">{t.programsBadge}</span>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-3">{t.programsTitle}</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">{t.programsDesc}</p>
        </div>

        <Tabs defaultValue="adults" className="w-full">
          <TabsList className="mx-auto mb-8 grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="adults">{t.tabAdults}</TabsTrigger>
            <TabsTrigger value="kids">{t.tabKids}</TabsTrigger>
          </TabsList>

          <TabsContent value="adults">
            <div className="grid md:grid-cols-2 gap-8">
              {(inlineForm === null || inlineForm === "group") && (
          <div
            id="group-levels"
            className={`scroll-mt-24 bg-background rounded-2xl border border-border overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col ${
              inlineForm === "group" ? "md:col-span-3" : ""
            }`}
          >
            {inlineForm === "group" ? (
              <div className="p-6">
                <RegistrationFormSection
                  defaultCourseType="group"
                  embedded
                  onBack={() => setInlineForm(null)}
                />
              </div>
            ) : (
            <>
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

              {activeCap && (
                <div className="mb-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
                  <span className="font-semibold text-foreground">
                    {activeCap.taken}/{activeCap.max} {t.capSeatsLabel}
                  </span>
                  <span className="text-muted-foreground">·</span>
                  <span className={activeCap.belowMin ? "text-amber-600 dark:text-amber-500 font-medium" : "text-muted-foreground"}>
                    {activeCap.full
                      ? t.capFull
                      : activeCap.belowMin
                        ? t.capNeedToStart.replace("{n}", String(activeCap.needToStart))
                        : t.capSpotsLeft.replace("{n}", String(activeCap.seatsLeft))}
                  </span>
                </div>
              )}

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

              <div className="mb-4 rounded-lg border border-border bg-muted/30 p-4">
                <p className="text-xs font-semibold uppercase text-muted-foreground mb-1">
                  {t.curriculumObjective}
                </p>
                <p className="text-sm text-foreground mb-3">{levelCurriculum[activeLevel].obj}</p>
                <ul className="space-y-2">
                  {levelCurriculum[activeLevel].mods.map((m, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{m}</span>
                    </li>
                  ))}
                </ul>
              </div>
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
                  <button
                    type="button"
                    onClick={() => setInlineForm("group")}
                    className="block w-full text-center py-3 text-sm font-semibold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    {t.groupRegister}
                  </button>
                  <a
                    href={WA_GROUP}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center justify-center gap-1.5 w-full text-center text-xs text-muted-foreground hover:text-primary transition-colors"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    WhatsApp
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
            </>
            )}
          </div>
          )}

          {/* Private Card (adults tab) */}
          {[privateProgram].map((p) => {
            const key = "private" as const;
            if (inlineForm !== null && inlineForm !== key) return null;
            if (inlineForm === key) {
              return (
                <div key={p.title} className="bg-background rounded-2xl border border-border overflow-hidden shadow-sm flex flex-col md:col-span-3">
                  <div className="p-6">
                    <RegistrationFormSection
                      defaultCourseType={key}
                      embedded
                      onBack={() => setInlineForm(null)}
                    />
                  </div>
                </div>
              );
            }
            return (
            <div key={p.title} className="bg-background rounded-2xl border border-border overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col">
              <img src={p.img} alt={p.title} className="w-full h-52 object-cover" />
              <div className="p-6 flex flex-col flex-1">
                <span className="inline-block text-xs font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full mb-3">
                  {p.badge}
                </span>
                <h3 className="text-xl font-bold text-foreground mb-2">{p.title}</h3>
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{p.desc}</p>
                {p.price && (
                  <div className="mb-3">
                    <div className="flex items-baseline flex-wrap gap-x-2">
                      <span className="text-2xl font-extrabold text-foreground leading-none">{p.price}</span>
                      {p.per && (
                        <span className="text-sm font-semibold text-muted-foreground">{p.per}</span>
                      )}
                    </div>
                    {p.perNote && (
                      <p className="text-xs text-muted-foreground mt-1">{p.perNote}</p>
                    )}
                  </div>
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
                <div className="mt-auto">
                  <button
                    type="button"
                    onClick={() => setInlineForm(key)}
                    className="block w-full text-center py-3 text-sm font-semibold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    {p.cta}
                  </button>
                  <a
                    href={p.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center justify-center gap-1.5 w-full text-xs text-muted-foreground hover:text-primary transition-colors"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    WhatsApp
                  </a>
                </div>
              </div>
            </div>
            );
          })}
            </div>
          </TabsContent>

          <TabsContent value="kids">
            <div className="grid md:grid-cols-2 gap-8">
              {[kidsProgram].map((p) => {
                const key = "kids" as const;
                if (inlineForm !== null && inlineForm !== key) return null;
                if (inlineForm === key) {
                  return (
                    <div key={p.title} className="bg-background rounded-2xl border border-border overflow-hidden shadow-sm flex flex-col md:col-span-2">
                      <div className="p-6">
                        <RegistrationFormSection
                          defaultCourseType={key}
                          embedded
                          onBack={() => setInlineForm(null)}
                        />
                      </div>
                    </div>
                  );
                }
                return (
                  <div key={p.title} className="bg-background rounded-2xl border border-border overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col">
                    <img src={p.img} alt={p.title} className="w-full h-52 object-cover" />
                    <div className="p-6 flex flex-col flex-1">
                      <span className="inline-block text-xs font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full mb-3">
                        {p.badge}
                      </span>
                      <h3 className="text-xl font-bold text-foreground mb-2">{p.title}</h3>
                      <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{p.desc}</p>
                      {kidsCap && (
                        <div className="mb-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs rounded-lg border border-border bg-muted/40 px-3 py-2">
                          <span className="font-semibold text-foreground">
                            {kidsCap.taken}/{kidsCap.max} {t.capSeatsLabel}
                          </span>
                          <span className="text-muted-foreground">·</span>
                          <span className={kidsCap.belowMin ? "text-amber-600 dark:text-amber-500 font-medium" : "text-muted-foreground"}>
                            {kidsCap.full
                              ? t.capFull
                              : kidsCap.belowMin
                                ? t.capNeedToStart.replace("{n}", String(kidsCap.needToStart))
                                : t.capSpotsLeft.replace("{n}", String(kidsCap.seatsLeft))}
                          </span>
                        </div>
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
                      <div className="mt-auto">
                        <button
                          type="button"
                          onClick={() => setInlineForm(key)}
                          className="block w-full text-center py-3 text-sm font-semibold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                        >
                          {p.cta}
                        </button>
                        <a
                          href={p.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2 inline-flex items-center justify-center gap-1.5 w-full text-xs text-muted-foreground hover:text-primary transition-colors"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          WhatsApp
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
};

export default ProgramsSection;
