import { useState } from "react";
import { Link } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import { Check, MessageCircle, ChevronRight } from "lucide-react";

import RegistrationFormSection from "@/components/RegistrationFormSection";
import { useGroupCapacities } from "@/hooks/useGroupCapacity";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ONLINE_PRICES, physicalPrice, formatLei } from "@/lib/pricing";
import { getCurriculum } from "@/data/curriculum";
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
  const [inlineForm, setInlineForm] = useState<
    null | "group" | "private" | "kids" | "kids-private"
  >(null);
  const [activeLevel, setActiveLevel] = useState<Level | null>(null);
  const { get: getCapacity } = useGroupCapacities();
  const a1Cap = getCapacity("group", "A1");
  const kidsCap = getCapacity("kids", null);

  const isAvailable = (level: Level) => level === "A1";
  const a1Online = ONLINE_PRICES.groupMonthly.A1;
  const a1Fizic = physicalPrice(a1Online);
  const curriculum = getCurriculum(lang);
  const activeLevelData = activeLevel
    ? curriculum.find((c) => c.id === activeLevel.toLowerCase())
    : null;
  const activeOnline = activeLevel ? ONLINE_PRICES.groupMonthly[activeLevel] : 0;
  const activeFizic = activeLevel ? physicalPrice(activeOnline) : 0;

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
              <h3 className="text-xl font-bold text-foreground mb-2">{t.groupCardTitle}</h3>
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{t.groupCardDesc}</p>

              {/* Dual price line */}
              <div className="mb-4">
                <div className="flex items-baseline flex-wrap gap-x-2">
                  <span className="text-xs uppercase font-semibold text-muted-foreground">{t.priceFromLabel}</span>
                  <span className="text-2xl font-extrabold text-foreground leading-none">{formatLei(a1Online)}</span>
                  <span className="text-sm text-muted-foreground">{t.priceOnlineShort}</span>
                  <span className="text-muted-foreground">·</span>
                  <span className="text-2xl font-extrabold text-foreground leading-none">{formatLei(a1Fizic)}</span>
                  <span className="text-sm text-muted-foreground">{t.priceFizicShort}</span>
                  <span className="text-sm text-muted-foreground"> {t.priceLeiPerMonth}</span>
                </div>
              </div>

              {/* A1 capacity */}
              {a1Cap && (
                <div className="mb-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs rounded-lg border border-border bg-muted/40 px-3 py-2">
                  {a1Cap.taken === 0 ? (
                    <span className="text-primary font-medium">
                      {t.capForming.replace("{n}", String(a1Cap.needToStart || 4))}
                    </span>
                  ) : (
                    <>
                      <span className="font-semibold text-foreground">
                        A1 · {a1Cap.taken}/{a1Cap.max} {t.capSeatsLabel}
                      </span>
                      <span className="text-muted-foreground">·</span>
                      <span className={a1Cap.belowMin ? "text-amber-600 dark:text-amber-500 font-medium" : "text-muted-foreground"}>
                        {a1Cap.full
                          ? t.capFull
                          : a1Cap.belowMin
                            ? t.capNeedToStart.replace("{n}", String(a1Cap.needToStart))
                            : t.capSpotsLeft.replace("{n}", String(a1Cap.seatsLeft))}
                      </span>
                    </>
                  )}
                </div>
              )}

              {/* 3 bullets */}
              <ul className="space-y-2 mb-5">
                {[t.groupFeat1, t.groupFeat2, t.groupFeat3].map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-foreground">
                    <Check className="w-4 h-4 text-primary flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              {/* Level pills → link to each level page */}
              <div className="flex flex-wrap gap-2 mb-5">
                {LEVELS.map((level) => {
                  const available = isAvailable(level);
                  const isActive = activeLevel === level;
                  return (
                    <button
                      key={level}
                      type="button"
                      onClick={() =>
                        setActiveLevel(isActive ? null : level)
                      }
                      aria-pressed={isActive}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-full border transition-colors ${
                        isActive
                          ? "bg-primary text-primary-foreground border-primary"
                          : available
                            ? "bg-background text-foreground border-border hover:border-primary hover:text-primary"
                            : "bg-muted/60 text-muted-foreground border-border hover:border-primary/50"
                      }`}
                      title={available ? level : t.levelInPrep}
                    >
                      {level}
                      {!available && <span className="ml-1 opacity-60">·</span>}
                    </button>
                  );
                })}
              </div>

              <Link to="/cursuri/grup" className="text-sm font-medium text-primary hover:underline underline-offset-4 mb-5 inline-block">
                {t.programsSeeFullPage}
              </Link>

              {/* Inline level summary */}
              {activeLevelData && activeLevel && (
                <div className="mb-5 rounded-lg border border-primary/30 bg-primary/5 p-4">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h4 className="text-sm font-bold text-foreground">
                      {activeLevelData.title}
                    </h4>
                    {!isAvailable(activeLevel) && (
                      <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground bg-muted px-2 py-0.5 rounded flex-shrink-0">
                        {t.grupLevelInPrepBadge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                    {activeLevelData.objective}
                  </p>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground mb-3">
                    <span>
                      <strong className="text-foreground">{activeLevelData.lessons}</strong>{" "}
                      {t.grupLevelCardLessons}
                    </span>
                    <span>·</span>
                    <span>
                      <strong className="text-foreground">{activeLevelData.hours}</strong>{" "}
                      {t.grupLevelCardHours}
                    </span>
                    <span>·</span>
                    <span>
                      <strong className="text-foreground">{formatLei(activeOnline)}</strong>{" "}
                      {t.priceOnlineShort} ·{" "}
                      <strong className="text-foreground">{formatLei(activeFizic)}</strong>{" "}
                      {t.priceFizicShort} {t.priceLeiPerMonth}
                    </span>
                  </div>
                  <Link
                    to={`/cursuri/grup/${activeLevel.toLowerCase()}`}
                    className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline underline-offset-4"
                  >
                    {t.grupLevelCardViewFull}
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              )}

              {/* CTA */}
              <div className="mt-auto">
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
                    <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{t.privateCardSubtitle}</p>
                    <Link to="/cursuri/private" className="text-sm font-medium text-primary hover:underline underline-offset-4 mb-3 inline-block">
                      {t.programsSeeFullPage}
                    </Link>

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
                        <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{t.kidsGroupCardSubtitle}</p>
                        <Link to="/cursuri/copii" className="text-sm font-medium text-primary hover:underline underline-offset-4 mb-3 inline-block">
                          {t.programsSeeFullPage}
                        </Link>

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
                        <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{t.kidsPrivateCardSubtitle}</p>
                        <Link to="/cursuri/copii" className="text-sm font-medium text-primary hover:underline underline-offset-4 mb-3 inline-block">
                          {t.programsSeeFullPage}
                        </Link>

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
