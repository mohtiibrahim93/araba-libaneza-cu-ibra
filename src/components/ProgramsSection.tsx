import { useState } from "react";
import { Link } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import { Check, Clock, MessageCircle, CheckCircle2 } from "lucide-react";

import RegistrationFormSection from "@/components/RegistrationFormSection";
import { useGroupCapacities } from "@/hooks/useGroupCapacity";
import { getCurriculumPreview } from "@/data/curriculum";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
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
  const { t, lang } = useI18n();
  const [activeLevel, setActiveLevel] = useState<Level>("A1");
  const [inlineForm, setInlineForm] = useState<
    null | "group" | "private" | "kids" | "kids-private"
  >(null);
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
    A1: getCurriculumPreview(lang, "a1"),
    A2: getCurriculumPreview(lang, "a2"),
    B1: getCurriculumPreview(lang, "b1"),
    B2: getCurriculumPreview(lang, "b2"),
    C1: getCurriculumPreview(lang, "c1"),
    C2: getCurriculumPreview(lang, "c2"),
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


  return (
    <section id="programs" className="py-20 px-6 bg-muted/50 scroll-mt-20">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-sm font-medium text-primary mb-2 block">{t.programsBadge}</span>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-3">{t.programsTitle}</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">{t.programsDesc}</p>
          <a
            href="/quiz"
            className="inline-block mt-3 text-sm font-medium text-primary hover:underline underline-offset-4"
          >
            {t.programsQuizLink}
          </a>
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
              <h3 className="text-xl font-bold text-foreground mb-1">{t.groupCardTitle}</h3>
              <Link to="/cursuri/grup" className="text-xs font-medium text-primary hover:underline underline-offset-4 mb-4 inline-block">
                {t.programsSeeFullPage}
              </Link>

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
                  {activeCap.taken === 0 ? (
                    <span className="text-primary font-medium">
                      {t.capForming.replace("{n}", String(activeCap.needToStart || 4))}
                    </span>
                  ) : (
                    <>
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
                    </>
                  )}
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

                  {/* Price table */}
                  <div className="mb-3 rounded-lg border border-border overflow-hidden">
                    {/* Header row */}
                    <div className="grid grid-cols-[1fr_1fr_1fr_1fr] gap-2 bg-muted/40 border-b border-border px-3 py-2 text-xs font-semibold uppercase text-muted-foreground">
                      <span className="text-left">{t.groupPriceTableLevel}</span>
                      <span className="text-right">{t.groupPriceTableMonth}</span>
                      <span className="text-right hidden sm:block">{t.groupPriceTableTotal}</span>
                      <span className="text-right">{t.groupPriceTableDiscount}</span>
                    </div>
                    <Accordion type="single" collapsible className="w-full">
                      {LEVELS.map((level) => {
                        const monthly = Number(levelPrices[level]);
                        const total = monthly * 3;
                        const discounted = total * 0.9;
                        const available = isAvailable(level);
                        return (
                          <AccordionItem key={level} value={level} className="border-b border-border last:border-b-0">
                            <AccordionTrigger className="px-3 py-2 text-sm hover:no-underline hover:bg-muted/30 [&[data-state=open]]:bg-muted/30">
                              <div className="grid grid-cols-[1fr_1fr_1fr_1fr] gap-2 w-full items-center pr-2">
                                <span className="text-left font-medium text-foreground inline-flex items-center gap-1.5">
                                  {level}
                                  {!available && (
                                    <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                                      {t.levelInPrep}
                                    </span>
                                  )}
                                </span>
                                <span className="text-right text-muted-foreground whitespace-nowrap">{formatLei(monthly)} LEI</span>
                                <span className="text-right text-muted-foreground line-through whitespace-nowrap hidden sm:block">{formatLei(total)} LEI</span>
                                <span className="text-right font-bold text-primary whitespace-nowrap">{formatLei(discounted)} LEI</span>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent className="px-3 pb-4 pt-1">
                              <div className="rounded-lg border border-border bg-muted/30 p-4">
                                <p className="text-sm font-medium text-foreground mb-2">{levelSubtitles[level]}</p>
                                <p className="text-xs font-semibold uppercase text-muted-foreground mb-1">
                                  {t.curriculumObjective}
                                </p>
                                <p className="text-sm text-foreground mb-3">{levelCurriculum[level].obj}</p>
                                <ul className="space-y-2">
                                  {levelCurriculum[level].mods.map((m, i) => (
                                    <li key={i} className="flex items-start gap-2 text-sm">
                                      <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                                      <span className="text-muted-foreground">{m}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        );
                      })}
                    </Accordion>
                  </div>
                  <p className="text-xs font-medium text-primary mb-5">{t.groupPriceTableNote}</p>

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
          {(inlineForm === null || inlineForm === "private") && (
            <>
              {inlineForm === "private" ? (
                <div className="bg-background rounded-2xl border border-border overflow-hidden shadow-sm flex flex-col md:col-span-2">
                  <div className="p-6">
                    <RegistrationFormSection
                      defaultCourseType="private"
                      embedded
                      onBack={() => setInlineForm(null)}
                    />
                  </div>
                </div>
              ) : (
                <div className="bg-background rounded-2xl border border-border overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col">
                  <img src={privateImg} alt={t.privateCardTitle} className="w-full h-52 object-cover" />
                  <div className="p-6 flex flex-col flex-1">
                    <span className="inline-block text-xs font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full mb-3">
                      {t.privateBadge}
                    </span>
                    <h3 className="text-xl font-bold text-foreground mb-2">{t.privateCardTitle}</h3>
                    <Link to="/cursuri/private" className="text-xs font-medium text-primary hover:underline underline-offset-4 mb-3 inline-block">
                      {t.programsSeeFullPage}
                    </Link>
                    <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{t.privateCardSubtitle}</p>

                    {/* Price */}
                    <div className="mb-3">
                      <div className="flex items-baseline flex-wrap gap-x-2">
                        <span className="text-2xl font-extrabold text-foreground leading-none">150</span>
                        <span className="text-sm font-semibold text-muted-foreground">{t.privatePricePerLesson}</span>
                      </div>
                    </div>
                    <p className="text-xs font-medium text-primary mb-3">{t.privatePriceDiscountNote}</p>
                    <div className="mb-4 rounded-lg border border-primary/30 bg-primary/5 px-4 py-3 text-sm">
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="text-muted-foreground">{t.privatePrice20Label}</span>
                        <span>
                          <span className="line-through text-muted-foreground">3.000 LEI</span>
                          <span className="ml-2 font-bold text-primary">2.550 LEI</span>
                        </span>
                      </div>
                    </div>

                    {/* Details */}
                    <dl className="space-y-3 rounded-lg border border-border bg-muted/40 p-4 mb-5">
                      {[
                        { label: t.programFormatLabel, value: t.privateFormat },
                        { label: t.programDurationLabel, value: t.privateDurationV2 },
                        { label: t.programScheduleLabel, value: t.privateSchedule },
                        { label: t.programConditionsLabel, value: t.privateConditionsV2 },
                      ].map((item) => (
                        <div key={item.label}>
                          <dt className="text-xs font-semibold uppercase text-muted-foreground">{item.label}</dt>
                          <dd className="text-sm font-medium text-foreground">{item.value}</dd>
                        </div>
                      ))}
                    </dl>

                    {/* Features */}
                    <ul className="space-y-2 mb-6">
                      {[t.privateFeat1v2, t.privateFeat2v2, t.privateFeat3v2, t.privateFeat4v2, t.privateFeat5v2].map((f, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-foreground">
                          <Check className="w-4 h-4 text-primary flex-shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>

                    {/* CTA */}
                    <div className="mt-auto">
                      <button
                        type="button"
                        onClick={() => setInlineForm("private")}
                        className="block w-full text-center py-3 text-sm font-semibold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                      >
                        {t.privateRegisterV2}
                      </button>
                      <a
                        href={WA_PRIVATE}
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
              )}
            </>
          )}
            </div>
          </TabsContent>

          <TabsContent value="kids">
            <div className="grid md:grid-cols-2 gap-8">
              {(inlineForm === null || inlineForm === "kids") && (
                <div
                  id="kids-group"
                  className={`bg-background rounded-2xl border border-border overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col ${
                    inlineForm === "kids" ? "md:col-span-2" : ""
                  }`}
                >
                  {inlineForm === "kids" ? (
                    <div className="p-6">
                      <RegistrationFormSection
                        defaultCourseType="kids"
                        defaultFormat="fizic"
                        embedded
                        onBack={() => setInlineForm(null)}
                      />
                    </div>
                  ) : (
                    <>
                      <img src={kidsImg} alt={t.kidsGroupCardTitle} className="w-full h-52 object-cover" />
                      <div className="p-6 flex flex-col flex-1">
                        <span className="inline-block text-xs font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full mb-3">
                          {t.kidsGroupBadge}
                        </span>
                        <h3 className="text-xl font-bold text-foreground mb-2">{t.kidsGroupCardTitle}</h3>
                        <Link to="/cursuri/copii" className="text-xs font-medium text-primary hover:underline underline-offset-4 mb-3 inline-block">
                          {t.programsSeeFullPage}
                        </Link>
                        <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{t.kidsGroupCardSubtitle}</p>

                        {kidsCap && (
                          <div className="mb-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs rounded-lg border border-border bg-muted/40 px-3 py-2">
                            {kidsCap.taken === 0 ? (
                              <span className="text-primary font-medium">
                                {t.capForming.replace("{n}", String(kidsCap.needToStart || 4))}
                              </span>
                            ) : (
                              <>
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
                              </>
                            )}
                          </div>
                        )}

                        {/* Price */}
                        <div className="mb-3">
                          <div className="flex items-baseline flex-wrap gap-x-2">
                            <span className="text-2xl font-extrabold text-foreground leading-none">500</span>
                            <span className="text-sm font-semibold text-muted-foreground">{t.kidsGroupPricePerMonth}</span>
                          </div>
                        </div>
                        <p className="text-xs font-medium text-primary mb-3">{t.kidsGroupPriceNote}</p>
                        <div className="mb-4 rounded-lg border border-primary/30 bg-primary/5 px-4 py-3 text-sm">
                          <div className="flex items-baseline justify-between gap-2">
                            <span className="text-muted-foreground">{t.kidsGroupPriceTotalLabel}</span>
                            <span>
                              <span className="line-through text-muted-foreground">1.500 LEI</span>
                              <span className="ml-2 font-bold text-primary">1.350 LEI</span>
                            </span>
                          </div>
                        </div>

                        {/* Details */}
                        <dl className="space-y-3 rounded-lg border border-border bg-muted/40 p-4 mb-5">
                          <div>
                            <dt className="text-xs font-semibold uppercase text-muted-foreground">{t.programFormatLabel}</dt>
                            <dd className="text-sm font-medium text-foreground">{t.kidsGroupFormat}</dd>
                            <dd className="text-xs text-muted-foreground mt-0.5">{t.kidsGroupFormatNote}</dd>
                          </div>
                          <div>
                            <dt className="text-xs font-semibold uppercase text-muted-foreground">{t.programDurationLabel}</dt>
                            <dd className="text-sm font-medium text-foreground">{t.kidsGroupDuration}</dd>
                          </div>
                          <div>
                            <dt className="text-xs font-semibold uppercase text-muted-foreground">{t.programConditionsLabel}</dt>
                            <dd className="text-sm font-medium text-foreground">{t.kidsGroupConditions}</dd>
                          </div>
                          <div>
                            <dt className="text-xs font-semibold uppercase text-muted-foreground">{t.kidsGroupAgeGroupsLabel}</dt>
                            <dd className="text-sm font-medium text-foreground">{t.kidsGroupAgeGroupsValue}</dd>
                          </div>
                        </dl>

                        {/* Features */}
                        <ul className="space-y-2 mb-6">
                          {[t.kidsGroupFeat1, t.kidsGroupFeat2, t.kidsGroupFeat3, t.kidsGroupFeat4].map((f, i) => (
                            <li key={i} className="flex items-center gap-2 text-sm text-foreground">
                              <Check className="w-4 h-4 text-primary flex-shrink-0" />
                              {f}
                            </li>
                          ))}
                        </ul>

                        {/* CTA */}
                        <div className="mt-auto">
                          <button
                            type="button"
                            onClick={() => setInlineForm("kids")}
                            className="block w-full text-center py-3 text-sm font-semibold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                          >
                            {t.kidsGroupRegister}
                          </button>
                          <a
                            href={WA_KIDS}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-2 inline-flex items-center justify-center gap-1.5 w-full text-xs text-muted-foreground hover:text-primary transition-colors"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            WhatsApp
                          </a>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Kids Private Card */}
              {(inlineForm === null || inlineForm === "kids-private") && (
                <div
                  id="kids-private"
                  className={`bg-background rounded-2xl border border-border overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col ${
                    inlineForm === "kids-private" ? "md:col-span-2" : ""
                  }`}
                >
                  {inlineForm === "kids-private" ? (
                    <div className="p-6">
                      <RegistrationFormSection
                        defaultCourseType="kids"
                        defaultFormat="online"
                        lessonType="private"
                        embedded
                        onBack={() => setInlineForm(null)}
                      />
                    </div>
                  ) : (
                    <>
                      <img src={privateImg} alt={t.kidsPrivateCardTitle} className="w-full h-52 object-cover" />
                      <div className="p-6 flex flex-col flex-1">
                        <span className="inline-block text-xs font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full mb-3">
                          {t.kidsPrivateBadge}
                        </span>
                        <h3 className="text-xl font-bold text-foreground mb-2">{t.kidsPrivateCardTitle}</h3>
                        <Link to="/cursuri/copii" className="text-xs font-medium text-primary hover:underline underline-offset-4 mb-3 inline-block">
                          {t.programsSeeFullPage}
                        </Link>
                        <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{t.kidsPrivateCardSubtitle}</p>

                        {/* Price */}
                        <div className="mb-3">
                          <div className="flex items-baseline flex-wrap gap-x-2">
                            <span className="text-2xl font-extrabold text-foreground leading-none">150</span>
                            <span className="text-sm font-semibold text-muted-foreground">{t.kidsPrivatePricePerLesson}</span>
                          </div>
                        </div>
                        <p className="text-xs font-medium text-primary mb-3">{t.kidsPrivatePriceDiscountNote}</p>
                        <div className="mb-4 rounded-lg border border-primary/30 bg-primary/5 px-4 py-3 text-sm">
                          <div className="flex items-baseline justify-between gap-2">
                            <span className="text-muted-foreground">{t.kidsPrivatePrice20Label}</span>
                            <span>
                              <span className="line-through text-muted-foreground">3.000 LEI</span>
                              <span className="ml-2 font-bold text-primary">2.550 LEI</span>
                            </span>
                          </div>
                        </div>

                        {/* Details */}
                        <dl className="space-y-3 rounded-lg border border-border bg-muted/40 p-4 mb-5">
                          <div>
                            <dt className="text-xs font-semibold uppercase text-muted-foreground">{t.programFormatLabel}</dt>
                            <dd className="text-sm font-medium text-foreground">{t.kidsPrivateFormat}</dd>
                            <dd className="text-xs text-muted-foreground mt-0.5">{t.kidsPrivateFormatNote}</dd>
                          </div>
                          <div>
                            <dt className="text-xs font-semibold uppercase text-muted-foreground">{t.programDurationLabel}</dt>
                            <dd className="text-sm font-medium text-foreground">{t.kidsPrivateDuration}</dd>
                          </div>
                          <div>
                            <dt className="text-xs font-semibold uppercase text-muted-foreground">{t.programConditionsLabel}</dt>
                            <dd className="text-sm font-medium text-foreground">{t.kidsPrivateConditions}</dd>
                          </div>
                        </dl>

                        {/* Features */}
                        <ul className="space-y-2 mb-6">
                          {[t.kidsPrivateFeat1, t.kidsPrivateFeat2, t.kidsPrivateFeat3, t.kidsPrivateFeat4].map((f, i) => (
                            <li key={i} className="flex items-center gap-2 text-sm text-foreground">
                              <Check className="w-4 h-4 text-primary flex-shrink-0" />
                              {f}
                            </li>
                          ))}
                        </ul>

                        {/* CTA */}
                        <div className="mt-auto">
                          <button
                            type="button"
                            onClick={() => setInlineForm("kids-private")}
                            className="block w-full text-center py-3 text-sm font-semibold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                          >
                            {t.kidsPrivateRegister}
                          </button>
                          <a
                            href={WA_KIDS}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-2 inline-flex items-center justify-center gap-1.5 w-full text-xs text-muted-foreground hover:text-primary transition-colors"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            WhatsApp
                          </a>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
};

export default ProgramsSection;
