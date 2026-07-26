import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import { Check, MessageCircle, ChevronRight } from "lucide-react";

import RegistrationFormSection, { STORAGE_KEY } from "@/components/RegistrationFormSection";
import { useGroupCapacities } from "@/hooks/useGroupCapacity";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ONLINE_PRICES, physicalPrice, formatLei } from "@/lib/pricing";
import { getCurriculum } from "@/data/curriculum";
import groupImg from "@/assets/group-course.jpg";
import privateImg from "@/assets/private-course.jpg";
import kidsImg from "@/assets/kids-course.jpg";
import posterA1Fizic from "@/assets/poster-a1-fizic.webp.asset.json";
import posterA1Online from "@/assets/poster-a1-online.webp.asset.json";
import posterA2Fizic from "@/assets/poster-a2-fizic.webp.asset.json";

// Cohort posters shown in the inline level summary — only A1/A2 have announced cohorts.
const LEVEL_POSTERS: Partial<Record<string, { src: string; alt: string }[]>> = {
  A1: [
    { src: posterA1Fizic.url, alt: "Poster A1 fizic — start 10 august 2026, luni și miercuri 19:00–20:30, Strada Icoanei 80" },
    { src: posterA1Online.url, alt: "Poster A1 online — start 15 august 2026, sâmbătă și duminică 12:00–13:30" },
  ],
  A2: [
    { src: posterA2Fizic.url, alt: "Poster A2 fizic — start 11 august 2026, marți și joi 19:00–20:30, Strada Icoanei 80" },
  ],
};

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

  // RegistrationFormSection persists its field data (name/phone/etc) to
  // sessionStorage regardless of whether it's mounted, but that data is only
  // visible while a matching card is open. Without this, a reload while
  // mid-form makes the whole form appear to vanish — the data is still
  // there, but the user has no way to know to re-click the same card.
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const draft = JSON.parse(raw);
      if (!draft?.name && !draft?.phone && !draft?.email) return; // nothing worth restoring
      if (draft.courseType === "group") setInlineForm("group");
      else if (draft.courseType === "private") setInlineForm("private");
      // Kids group enrollment is closed (notify-only); don't auto-open it.
    } catch {
      // ignore corrupted drafts
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const { get: getCapacity, getFormats } = useGroupCapacities();
  const a1Formats = getFormats("A1");
  const kidsCap = getCapacity("kids", null);

  // Per-format status text + tone for the A1 card — fizic and online shown
  // apart, never summed into a single "12 locuri".
  const capStatus = (cap: NonNullable<ReturnType<typeof getCapacity>>) => {
    const text = cap.full
      ? t.capFull
      : cap.taken === 0
        ? t.capForming.replace("{n}", String(cap.needToStart || 4))
        : cap.belowMin
          ? t.capNeedToStart.replace("{n}", String(cap.needToStart))
          : t.capSpotsLeft.replace("{n}", String(cap.seatsLeft));
    const tone =
      cap.full || cap.belowMin
        ? "text-amber-600 dark:text-amber-500 font-medium"
        : "text-muted-foreground";
    return { text, tone };
  };
  const a1Segments = [
    { key: "fizic", label: t.spotsFizic, cap: a1Formats.fizic },
    { key: "online", label: t.spotsOnline, cap: a1Formats.online },
  ].filter((s) => s.cap);

  const isAvailable = (level: Level) => level === "A1" || level === "A2";
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
          <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-3">{t.programsTitle}</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">{t.programsDesc}</p>
          <a
            href="/quiz"
            className="inline-block mt-3 text-sm font-medium text-primary hover:underline underline-offset-4"
          >
            {t.programsQuizLink}
          </a>
        </div>

        <Tabs defaultValue="adults" className="w-full">
          <TabsList className="mx-auto mb-8 grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="adults">{t.tabAdults}</TabsTrigger>
            <TabsTrigger value="tineri">{lang === "en" ? "Teens" : "Tineri"}</TabsTrigger>
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
                  lockCourseType
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
              <p className="text-xs font-medium text-primary mb-4">{t.groupEnrollmentOpenNote}</p>

              {/* A1 capacity — fizic and online counted separately */}
              {a1Segments.length > 0 && (
                <div className="mb-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs rounded-lg border border-border bg-muted/40 px-3 py-2">
                  <span className="font-semibold text-foreground">A1</span>
                  {a1Segments.map((seg) => {
                    const { text, tone } = capStatus(seg.cap!);
                    return (
                      <span key={seg.key} className="flex items-center gap-1.5">
                        <span className="text-muted-foreground">·</span>
                        <span className="font-medium text-foreground">{seg.label}:</span>
                        <span className={tone}>{text}</span>
                      </span>
                    );
                  })}
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
                  {activeLevelData.schedule && (
                    <div className="mb-3 space-y-0.5">
                      {activeLevelData.schedule.map((line, i) => (
                        <p key={i} className="text-xs text-muted-foreground">{line}</p>
                      ))}
                    </div>
                  )}
                  {LEVEL_POSTERS[activeLevel] && (
                    <div className="mb-3 grid grid-cols-2 gap-2 max-w-sm">
                      {LEVEL_POSTERS[activeLevel]!.map((p) => (
                        <img
                          key={p.src}
                          src={p.src}
                          alt={p.alt}
                          width={800}
                          height={800}
                          loading="lazy"
                          decoding="async"
                          className="w-full rounded-lg border border-border"
                        />
                      ))}
                    </div>
                  )}
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
                      lockCourseType
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
                        lockCourseType
                        embedded
                        onBack={() => setInlineForm(null)}
                      />
                    </div>
                  ) : (
                    <>
                      <img src={kidsImg} alt={t.kidsGroupCardTitle} className="w-full h-52 object-cover" />
                      <div className="p-6 flex flex-col flex-1">
                        <span className="inline-block text-xs font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full mb-3">
                          {lang === "en" ? "Coming soon" : "În curând"}
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

                        {/* Kids group isn't open yet — notify instead of enroll */}
                        <div className="mb-4 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-200">
                          {lang === "en"
                            ? "Kids' group courses aren't open yet — leave your details on the kids page and we'll tell you when one starts. Private lessons for kids are available now."
                            : "Grupele pentru copii nu sunt încă deschise — lasă-ne datele pe pagina pentru copii și îți spunem când pornește una. Lecțiile private pentru copii sunt disponibile acum."}
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

                        {/* CTA — no inline group enrollment; route to the kids page */}
                        <div className="mt-auto">
                          <Link
                            to="/cursuri/copii"
                            className="block w-full text-center py-3 text-sm font-semibold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                          >
                            {lang === "en" ? "Details · notify me" : "Detalii · anunță-mă"}
                          </Link>
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
                        lockCourseType
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

          <TabsContent value="tineri">
            <div className="mx-auto max-w-2xl rounded-2xl border border-border bg-background p-8 text-center shadow-sm">
              <span className="mb-3 inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                {lang === "en" ? "Teens · 11–18" : "Adolescenți · 11–18 ani"}
              </span>
              <h3 className="mb-2 text-xl font-bold text-foreground">
                {lang === "en" ? "Lebanese Arabic for teens (11–18)" : "Arabă libaneză pentru adolescenți (11–18 ani)"}
              </h3>
              <p className="mx-auto mb-6 max-w-md text-sm text-muted-foreground">
                {lang === "en"
                  ? "Group and private lessons adapted for teenagers — same CEFR curriculum, a pace and topics that fit their age. See options or ask us."
                  : "Cursuri de grup și private adaptate pentru adolescenți — același curriculum CEFR, într-un ritm și cu teme potrivite vârstei. Vezi opțiunile sau întreabă-ne."}
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Link to="/cursuri/tineri" className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
                  {lang === "en" ? "See teen courses" : "Vezi cursurile pentru adolescenți"}
                </Link>
                <a href={wa("Salut! Sunt interesat(ă) de cursul de arabă libaneză pentru adolescenți.")} target="_blank" rel="noopener noreferrer" className="rounded-lg border border-border px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-muted">
                  WhatsApp
                </a>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
};

export default ProgramsSection;
