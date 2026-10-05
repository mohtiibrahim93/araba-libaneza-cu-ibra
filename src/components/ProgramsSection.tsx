import { useEffect, useState } from "react";
import { Link } from "@/lib/router-compat";
import { useI18n } from "@/lib/i18n";
import { Check, MessageCircle, ChevronRight } from "lucide-react";

import RegistrationFormSection, { STORAGE_KEY } from "@/components/RegistrationFormSection";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  ONLINE_PRICES,
  physicalPrice,
  formatLei,
  privatePackageFull,
  privatePackageDiscounted,
  PRIVATE_DISCOUNT_TIERS,
} from "@/lib/pricing";
import { getCurriculum } from "@/data/curriculum";
import groupImg from "@/assets/group-course.jpg";
import privateImg from "@/assets/private-course.jpg";
import kidsImg from "@/assets/kids-course.jpg";
import CohortEnrollmentNote from "@/components/CohortEnrollmentNote";
import YallaGameBand from "@/components/YallaGameBand";

const wa = (msg: string) =>
  "https://wa.me/40763124514?text=" + encodeURIComponent(msg);
const WA_GROUP = wa("Salut! Vreau să mă înscriu la cursul de grup de arabă libaneză.");
const WA_PRIVATE = wa("Salut! Sunt interesat(ă) de lecții private de arabă libaneză.");
const WA_KIDS = wa("Salut! Sunt interesat(ă) de cursul de arabă libaneză pentru copii.");

// Card look shared by every tab: white card (photo kept) on the cream band, green label,
// serif title, prices as big numbers (the "Ibra, sharpened" design).
const CARD = "bg-card rounded-3xl border border-[#E7E1D6] dark:border-border overflow-hidden flex flex-col";
const BADGE = "inline-block self-start text-xs font-semibold text-brand-green bg-brand-green/10 px-3 py-1 rounded-full mb-3";
const CARD_TITLE = "font-display text-2xl sm:text-[1.75rem] font-bold leading-tight text-foreground mb-2";

/** One big number with its unit under it. */
const Stat = ({ value, label }: { value: string; label: string }) => (
  <div className="flex flex-col">
    <span className="text-3xl sm:text-4xl font-bold leading-none tracking-tight text-foreground">{value}</span>
    <span className="mt-1 text-sm text-muted-foreground">{label}</span>
  </div>
);

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
    <section id="programs" className="py-section px-gutter bg-cream scroll-mt-20">
      <div className="w-full max-w-content mx-auto">
        <Tabs defaultValue="adults" className="w-full">
          <div className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <span className="mb-2 block text-sm font-bold uppercase tracking-[0.1em] text-foreground">{lang === "en" ? "How to start" : "Cum începi"}</span>
              <h2 className="font-display text-display-lg font-bold tracking-tight text-foreground mb-3">{t.programsTitle}</h2>
              <p className="text-muted-foreground max-w-xl">{t.programsDesc}</p>
            </div>
          <TabsList className="grid w-full max-w-md shrink-0 grid-cols-3 lg:w-auto">
            <TabsTrigger value="adults">{t.tabAdults}</TabsTrigger>
            <TabsTrigger value="tineri">{lang === "en" ? "Teens" : "Adolescenți"}</TabsTrigger>
            <TabsTrigger value="kids">{t.tabKids}</TabsTrigger>
          </TabsList>
          </div>

          {/* The path in four steps, as the owner laid it out: choose, check
              if unsure, read the details, sign up. Steps 3 and 4 live on the
              course cards (level details, curriculum link, the sign-up form). */}
          <ol className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {(lang === "en"
              ? [
                  ["Choose your course", "Group or private, below."],
                  ["Not sure?", "Take the quiz or find your level in the game.", "#not-sure"],
                  ["Read the details", "Tap a level: curriculum, schedule, price."],
                  ["Sign up and pay", "Online, in a few minutes."],
                ]
              : [
                  ["Alege cursul", "De grup sau privat, mai jos."],
                  ["Nu ești sigur?", "Fă quiz-ul sau află-ți nivelul în joc.", "#not-sure"],
                  ["Citește detaliile", "Apasă pe un nivel: curriculum, orar, preț."],
                  ["Înscrie-te și plătește", "Online, în câteva minute."],
                ]
            ).map(([title, text, href], i) => {
              const body = (
                <>
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                    {i + 1}
                  </span>
                  <span className="flex flex-col">
                    <span className="font-semibold text-foreground">{title}</span>
                    <span className="text-sm text-foreground/70">{text}</span>
                  </span>
                </>
              );
              return (
                <li key={title}>
                  {href ? (
                    <a href={href} className="flex h-full items-start gap-3 rounded-2xl border border-[#E7E1D6] bg-card p-4 transition-colors hover:border-brand-green dark:border-border">
                      {body}
                    </a>
                  ) : (
                    <div className="flex h-full items-start gap-3 rounded-2xl border border-[#E7E1D6] bg-card p-4 dark:border-border">{body}</div>
                  )}
                </li>
              );
            })}
          </ol>

          <TabsContent value="adults">
            <div className="grid md:grid-cols-2 gap-8">
              {(inlineForm === null || inlineForm === "group") && (
          <div
            id="group-levels"
            className={`scroll-mt-24 ${CARD} ${
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
            <div className="p-6 sm:p-9 flex flex-col flex-1">
              <span className={BADGE}>
                {t.groupBadge}
              </span>
              <h3 className={CARD_TITLE}>{t.groupCardTitle}</h3>
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{t.groupCardDesc}</p>

              {/* Dual price: "from", because A1 is the cheapest level */}
              <div className="mb-5">
                <span className="mb-1.5 block text-xs font-semibold uppercase text-muted-foreground">{t.priceFromLabel}</span>
                <div className="flex flex-wrap gap-x-10 gap-y-3">
                  <Stat value={formatLei(a1Online)} label={`${t.priceLeiPerMonth} · ${t.priceOnlineShort.toLowerCase()}`} />
                  <Stat value={formatLei(a1Fizic)} label={`${t.priceLeiPerMonth} · ${t.priceFizicShort.toLowerCase()}`} />
                </div>
              </div>
              <CohortEnrollmentNote className="text-xs font-medium text-primary mb-4" />

              {/* 3 bullets */}
              <ul className="space-y-2 mb-5">
                {[t.groupFeat1, t.groupFeat2, t.groupFeat3].map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-foreground">
                    <Check className="w-4 h-4 text-brand-green flex-shrink-0" />
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
                      <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground bg-muted px-2 py-0.5 rounded-[4px] flex-shrink-0">
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
                <div className="bg-background rounded-2xl border border-border overflow-hidden shadow-xs flex flex-col md:col-span-2">
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
                <div className={CARD}>
                  <img src={privateImg} alt={t.privateCardTitle} className="w-full h-52 object-cover" />
                  <div className="p-6 sm:p-9 flex flex-col flex-1">
                    <span className={BADGE}>
                      {t.privateBadge}
                    </span>
                    <h3 className={CARD_TITLE}>{t.privateCardTitle}</h3>
                    <Link to="/cursuri/private" className="text-sm font-medium text-primary hover:underline underline-offset-4 mb-1 inline-block">
                      {t.programsSeeFullPage}
                    </Link>
                    {/* Second, keyword-bearing link: the homepage is the site's
                        strongest page and previously passed no authority at all
                        to /meditatii-araba, the page that ranks for "meditatii
                        araba" (the site's highest-volume commercial query). */}
                    <Link to="/meditatii-araba" className="text-sm text-muted-foreground hover:text-primary hover:underline underline-offset-4 mb-3 inline-block">
                      {lang === "en"
                        ? "Arabic tutoring 1-on-1 — how it works"
                        : "Meditații arabă 1:1 — cum funcționează"}
                    </Link>

                    {/* Price and the two volume discounts, as big numbers */}
                    <div className="mb-5 mt-2 grid grid-cols-3 gap-4 sm:flex sm:flex-wrap sm:gap-x-10 sm:gap-y-3">
                      <Stat value={formatLei(ONLINE_PRICES.privateLesson)} label={t.privatePricePerLesson} />
                      {[...PRIVATE_DISCOUNT_TIERS].reverse().map((tier) => (
                        <Stat
                          key={tier.from}
                          value={`−${Math.round(tier.rate * 100)}%`}
                          label={lang === "en" ? `for ${tier.from} lessons` : `la ${tier.from} lecții`}
                        />
                      ))}
                    </div>

                    {/* Features */}
                    <ul className="space-y-2 mb-6">
                      {[
                        t.privateFeat1v2,
                        t.privateFeat2v2,
                        lang === "en" ? "Online or in person (at the centre)" : "Online sau fizic (la centru)",
                      ].map((f, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-foreground">
                          <Check className="w-4 h-4 text-brand-green flex-shrink-0" />
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
            {/* One notice for both kids cards (it used to repeat on each). */}
            <div className="mb-6 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-200">
              {lang === "en"
                ? "We don't have kids' courses at the moment — neither groups nor private lessons. Leave your details and we'll let you know."
                : "Momentan nu avem cursuri pentru copii — nici grupe, nici lecții private. Lasă-ți datele și te anunțăm."}
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              {(inlineForm === null || inlineForm === "kids") && (
                <div
                  id="kids-group"
                  className={`${CARD} ${
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
                      <div className="p-6 sm:p-9 flex flex-col flex-1">
                        <span className={BADGE}>
                          {lang === "en" ? "Coming soon" : "În curând"}
                        </span>
                        <h3 className={CARD_TITLE}>{t.kidsGroupCardTitle}</h3>
                        <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{t.kidsGroupCardSubtitle}</p>
                        <Link to="/cursuri/copii" className="text-sm font-medium text-primary hover:underline underline-offset-4 mb-3 inline-block">
                          {t.programsSeeFullPage}
                        </Link>

                        
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
                        </dl>

                        {/* Features */}
                        <ul className="space-y-2 mb-6">
                          {[t.kidsGroupFeat1, t.kidsGroupFeat3, t.kidsGroupFeat4].map((f, i) => (
                            <li key={i} className="flex items-center gap-2 text-sm text-foreground">
                              <Check className="w-4 h-4 text-brand-green flex-shrink-0" />
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
                  className={`${CARD} ${
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
                      <div className="p-6 sm:p-9 flex flex-col flex-1">
                        <span className={BADGE}>
                          {lang === "en" ? "Coming soon" : "În curând"}
                        </span>
                        <h3 className={CARD_TITLE}>{t.kidsPrivateCardTitle}</h3>
                        <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{t.kidsPrivateCardSubtitle}</p>
                        <Link to="/cursuri/copii" className="text-sm font-medium text-primary hover:underline underline-offset-4 mb-3 inline-block">
                          {t.programsSeeFullPage}
                        </Link>

                        {/* Price */}
                        <div className="mb-3">
                          <div className="flex items-baseline flex-wrap gap-x-2">
                            {/* Kids courses start in person, so the card quotes the in-person price. */}
                            <span className="text-4xl font-bold leading-none tracking-tight text-foreground">{formatLei(physicalPrice(ONLINE_PRICES.kidsPrivateLesson))}</span>
                            <span className="text-sm text-muted-foreground">{t.kidsPrivatePricePerLesson}</span>
                          </div>
                        </div>
                        <div className="mb-4 rounded-lg border border-primary/30 bg-primary/5 px-4 py-3 text-sm">
                          <div className="flex items-baseline justify-between gap-2">
                            <span className="text-muted-foreground">{t.kidsPrivatePrice20Label}</span>
                            <span>
                              <span className="line-through text-muted-foreground">{formatLei(physicalPrice(privatePackageFull()))} LEI</span>
                              <span className="ml-2 font-bold text-primary">{formatLei(physicalPrice(privatePackageDiscounted()))} LEI</span>
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
                        </dl>

                        {/* Features */}
                        <ul className="space-y-2 mb-6">
                          {[t.kidsPrivateFeat1, t.kidsPrivateFeat2].map((f, i) => (
                            <li key={i} className="flex items-center gap-2 text-sm text-foreground">
                              <Check className="w-4 h-4 text-brand-green flex-shrink-0" />
                              {f}
                            </li>
                          ))}
                        </ul>

                        {/* CTA */}
                        <div className="mt-auto">
                          <Link
                            to="/cursuri/copii#register"
                            className="block w-full text-center py-3 text-sm font-semibold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                          >
                            {lang === "en" ? "Notify me" : "Anunță-mă"}
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
            </div>
          </TabsContent>

          <TabsContent value="tineri">
            <div className={`${CARD} mx-auto max-w-2xl items-center p-8 sm:p-9 text-center`}>
              <h3 className={CARD_TITLE}>
                {lang === "en" ? "Lebanese Arabic for teens (12–17)" : "Arabă libaneză pentru adolescenți (12–17 ani)"}
              </h3>
              <p className="mx-auto mb-6 max-w-md text-sm text-muted-foreground">
                {lang === "en"
                  ? "Group and private lessons adapted for teenagers — same CEFR curriculum, a pace and topics that fit their age. See options or ask us."
                  : "Cursuri de grup și private adaptate pentru adolescenți — același curriculum CEFR, într-un ritm și cu teme potrivite vârstei. Vezi opțiunile sau întreabă-ne."}
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Link to="/cursuri-araba-adolescenti" className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
                  {lang === "en" ? "See teen courses" : "Vezi cursurile pentru adolescenți"}
                </Link>
                <a href={wa("Salut! Sunt interesat(ă) de cursul de arabă libaneză pentru adolescenți.")} target="_blank" rel="noopener noreferrer" className="rounded-lg border border-border px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-muted">
                  WhatsApp
                </a>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* "Nu ești sigur?" — step 2: the quiz (which course suits me) and the
            game (what level am I), side by side. The quiz shows its first
            question here; any answer opens the full quiz on its own page. */}
        <div id="not-sure" className="mt-12 scroll-mt-24">
          <h3 className="mb-5 font-display text-2xl sm:text-3xl font-bold text-foreground">
            {lang === "en" ? "Not sure which course?" : "Nu ești sigur ce curs ți se potrivește?"}
          </h3>
          <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
            <div className="flex flex-col gap-4 rounded-[28px] border border-[#E7E1D6] bg-card px-6 py-8 sm:px-8 dark:border-border">
              <span className="text-sm font-bold uppercase tracking-[0.1em] text-primary">
                {lang === "en" ? "Quiz · 30 seconds" : "Quiz · 30 de secunde"}
              </span>
              <p className="font-display text-2xl sm:text-[1.75rem] font-bold leading-tight text-foreground">{t.quizQ1}</p>
              <div className="flex flex-col gap-3">
                {[
                  [t.quizQ1OptSelf, t.quizQ1OptSelfDesc],
                  [t.quizQ1OptKids, t.quizQ1OptKidsDesc],
                ].map(([title, desc]) => (
                  <a
                    key={title}
                    href="/quiz"
                    className="flex flex-col rounded-xl border border-[#E7E1D6] bg-background px-5 py-4 transition-colors hover:border-brand-green dark:border-border"
                  >
                    <span className="font-semibold text-foreground">{title}</span>
                    <span className="text-sm text-foreground/70">{desc}</span>
                  </a>
                ))}
              </div>
              <a href="/quiz" className="mt-1 text-sm font-semibold text-brand-green underline underline-offset-4 hover:opacity-80">
                {lang === "en" ? "Take the full quiz →" : "Fă tot quiz-ul →"}
              </a>
            </div>
            <YallaGameBand compact />
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProgramsSection;
