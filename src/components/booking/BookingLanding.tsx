import { useState } from "react";
import { CalendarDays, Check, Gift, UserRound, Users } from "lucide-react";
import { useSearchParams } from "@/lib/router-compat";
import { Link } from "@/components/LocalizedLink";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import NativeScheduler from "@/components/NativeScheduler";
import { useGroupCohorts } from "@/hooks/useGroupCohorts";
import { useTrialRegistration } from "@/hooks/useTrialRegistration";
import { useI18n } from "@/lib/i18n";
import { cohortHref, longDate } from "@/lib/nextCohort";
import { ONLINE_PRICES, formatLei, physicalPrice } from "@/lib/pricing";
import { cn } from "@/lib/utils";

/**
 * Programare (/booking with no registration): three steps on one screen —
 * choose the course, choose the date, book.
 *
 * Each course keeps the flow it already had, so nothing new reaches the
 * backend:
 * - the free trial books a slot right here, through the same scheduler and
 *   registration insert as /trial;
 * - a group course is a cohort with a fixed start date, so the date is the
 *   cohort, and booking is the registration form on its level page;
 * - private lessons are paid first, and the times are picked after payment
 *   (the thank-you page links to /booking?type=paid).
 *
 * The explanations below the steps are the ones the page had before; they
 * keep it from being too thin to index.
 */

type Choice = "proba" | "grup" | "privat";
const CHOICES: Choice[] = ["proba", "grup", "privat"];

const BookingLanding = () => {
  const { t, lang } = useI18n();
  const en = lang === "en";
  const [params] = useSearchParams();
  const initial = params.get("curs");
  const [choice, setChoice] = useState<Choice | null>(
    CHOICES.includes(initial as Choice) ? (initial as Choice) : null,
  );
  const [cohortId, setCohortId] = useState<string | null>(null);
  const ensureRegistration = useTrialRegistration();
  const { cohorts, loading } = useGroupCohorts("group", null, null, en ? "en" : "ro");
  const cohort = cohorts.find((c) => c.id === cohortId) ?? null;

  const options: { id: Choice; Icon: typeof Gift; title: string; meta: string; text: string }[] = [
    {
      id: "proba",
      Icon: Gift,
      title: en ? "Free trial lesson" : "Lecție de probă gratuită",
      meta: en ? "30 min · 0 lei" : "30 min · 0 lei",
      text: en
        ? "We meet, you ask anything, and we find your level. Online any day, in person at weekends."
        : "Ne cunoaștem, întrebi orice și îți aflăm nivelul. Online în orice zi, fizic în weekend.",
    },
    {
      id: "grup",
      Icon: Users,
      title: en ? "Group course (A1–C2)" : "Curs de grup (A1–C2)",
      meta: en
        ? `from ${formatLei(ONLINE_PRICES.groupMonthly.A1)} lei/month`
        : `de la ${formatLei(ONLINE_PRICES.groupMonthly.A1)} lei/lună`,
      text: en
        ? "Up to 6 students, two 90-minute sessions a week, online or in Bucharest."
        : "Maximum 6 cursanți, două ședințe de 90 de minute pe săptămână, online sau în București.",
    },
    {
      id: "privat",
      Icon: UserRound,
      title: en ? "Private lessons 1:1" : "Lecții private 1:1",
      meta: en
        ? `${formatLei(ONLINE_PRICES.privateLesson)} lei / 60 min`
        : `${formatLei(ONLINE_PRICES.privateLesson)} lei / 60 min`,
      text: en
        ? "At your pace and on your goal. −15% on a package of 20 lessons."
        : "În ritmul tău, pe obiectivul tău. −15% la pachetul de 20 de lecții.",
    },
  ];

  const steps = [en ? "Choose the course" : "Alege cursul", en ? "Choose the date" : "Alege data", en ? "Book" : "Rezervă"];
  const current = !choice ? 0 : choice === "grup" && cohort ? 2 : 1;

  const heading = "mb-2 block text-sm font-bold uppercase tracking-[0.1em] text-foreground";
  const stepTitle = "mb-4 flex items-center gap-3 font-display text-xl font-bold text-foreground";
  const stepNo = "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-green text-sm font-bold text-white";
  const card = "rounded-3xl border border-[#E7E1D6] bg-card dark:border-border";
  const primaryBtn =
    "inline-flex h-12 items-center justify-center rounded-xl bg-primary px-6 font-semibold text-primary-foreground transition-colors hover:bg-primary/90";

  return (
    <>
    <Navbar />
    <main id="main-content" className="min-h-screen bg-background px-gutter pb-section pt-28">
      <div className="mx-auto w-full max-w-content">
        <div className="mb-8 max-w-3xl">
          <span className={heading}>{en ? "Booking" : "Programare"}</span>
          <h1 className="font-display text-display-lg font-bold tracking-tight text-foreground">
            {en ? "Book your place in three steps" : "Rezervă-ți locul în trei pași"}
          </h1>
        </div>

        <ol className="mb-10 flex flex-wrap gap-x-8 gap-y-3" aria-label={en ? "Steps" : "Pași"}>
          {steps.map((s, i) => (
            <li
              key={s}
              aria-current={i === current ? "step" : undefined}
              className={cn(
                "flex items-center gap-2 text-sm font-semibold",
                i <= current ? "text-brand-green" : "text-muted-foreground",
              )}
            >
              <span
                className={cn(
                  "inline-flex h-7 w-7 items-center justify-center rounded-full border text-xs font-bold",
                  i < current
                    ? "border-brand-green bg-brand-green text-white"
                    : i === current
                      ? "border-brand-green text-brand-green"
                      : "border-border text-muted-foreground",
                )}
              >
                {i < current ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : i + 1}
              </span>
              {s}
            </li>
          ))}
        </ol>

        {/* Step 1 */}
        <section aria-labelledby="step-course">
          <h2 id="step-course" className={stepTitle}>
            <span className={stepNo}>1</span>
            {en ? "Which course?" : "Ce curs?"}
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            {options.map(({ id, Icon, title, meta, text }) => {
              const active = choice === id;
              return (
                <button
                  key={id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => {
                    setChoice(id);
                    setCohortId(null);
                  }}
                  className={cn(
                    card,
                    "flex flex-col gap-3 p-6 text-left transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
                    active ? "border-brand-green ring-2 ring-brand-green" : "hover:border-brand-green/50",
                  )}
                >
                  <span className="flex items-center justify-between">
                    <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-green/10 text-brand-green">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <span
                      className={cn(
                        "inline-flex h-6 w-6 items-center justify-center rounded-full border",
                        active ? "border-brand-green bg-brand-green text-white" : "border-border",
                      )}
                      aria-hidden="true"
                    >
                      {active && <Check className="h-3.5 w-3.5" />}
                    </span>
                  </span>
                  <span className="font-display text-xl font-bold leading-snug text-foreground">{title}</span>
                  <span className="text-sm font-semibold text-brand-green">{meta}</span>
                  <span className="text-[15px] leading-relaxed text-foreground/80">{text}</span>
                </button>
              );
            })}
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            {en ? "Not sure yet? " : "Nu știi încă? "}
            <a href="/quiz" className="font-semibold text-brand-green hover:underline">
              {en ? "Take the 30-second quiz" : "Fă quiz-ul de 30 de secunde"}
            </a>
            {en ? " or " : " sau "}
            <Link to="/test-de-nivel" className="font-semibold text-brand-green hover:underline">
              {en ? "the level test" : "testul de nivel"}
            </Link>
            .
          </p>
        </section>

        {/* Steps 2 and 3 */}
        <section aria-labelledby="step-date" className="mt-12">
          <h2 id="step-date" className={cn(stepTitle, !choice && "text-muted-foreground")}>
            <span className={cn(stepNo, !choice && "bg-muted text-muted-foreground")}>2</span>
            {en ? "When?" : "Când?"}
          </h2>

          {!choice && (
            <div className={cn(card, "flex items-center gap-3 p-6 text-muted-foreground")}>
              <CalendarDays className="h-5 w-5 shrink-0" aria-hidden="true" />
              {en ? "Choose a course above and the available dates appear here." : "Alege un curs mai sus și aici apar datele disponibile."}
            </div>
          )}

          {choice === "proba" && (
            <div className={cn(card, "p-6")}>
              <p className="mb-4 text-[15px] text-foreground/80">{t.trialPageSubtitle}</p>
              <NativeScheduler eventType="trial" ensureRegistration={ensureRegistration} />
            </div>
          )}

          {choice === "grup" && (
            <div className={cn(card, "p-6")}>
              {loading ? (
                <p className="text-muted-foreground">{en ? "Loading the dates…" : "Se încarcă datele…"}</p>
              ) : cohorts.length === 0 ? (
                <div className="flex flex-col gap-4">
                  <p className="text-foreground/80">
                    {en
                      ? "No group has a date set right now. Leave your details on the group course page and you'll hear first when the next one opens."
                      : "Nicio grupă nu are încă o dată stabilită. Lasă-ți datele pe pagina cursului de grup și afli primul când se deschide următoarea."}
                  </p>
                  <Link to="/cursuri/grup" className={cn(primaryBtn, "w-fit")}>
                    {en ? "Group course →" : "Cursul de grup →"}
                  </Link>
                </div>
              ) : (
                <>
                  <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {cohorts.map((c) => {
                      const active = c.id === cohortId;
                      return (
                        <li key={c.id}>
                          <button
                            type="button"
                            disabled={c.full}
                            aria-pressed={active}
                            onClick={() => setCohortId(c.id)}
                            className={cn(
                              "flex h-full w-full flex-col gap-1 rounded-2xl border p-4 text-left transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
                              active
                                ? "border-brand-green bg-brand-green/5 ring-2 ring-brand-green"
                                : "border-[#E7E1D6] hover:border-brand-green/50 dark:border-border",
                              c.full && "cursor-not-allowed opacity-60",
                            )}
                          >
                            <span className="text-sm font-bold text-brand-green">
                              {c.level} · {c.format === "fizic" ? (en ? "in person" : "fizic") : "online"}
                            </span>
                            <span className="font-display text-lg font-bold text-foreground">
                              {en ? "Starts " : "Începe pe "}
                              {longDate(c.start_date, lang === "en" ? "en" : "ro")}
                            </span>
                            <span className="text-sm text-foreground/70">{en ? c.schedule_label_en : c.schedule_label_ro}</span>
                            <span className={cn("text-sm font-semibold", c.full ? "text-muted-foreground" : "text-foreground")}>
                              {c.full
                                ? en ? "Full" : "Complet"
                                : en
                                  ? `${c.seatsLeft} of ${c.max_seats} seats free`
                                  : `${c.seatsLeft} din ${c.max_seats} locuri libere`}
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                  <p className="mt-4 text-sm text-muted-foreground">
                    {en ? "Other level? " : "Alt nivel? "}
                    <Link to="/cursuri/grup" className="font-semibold text-brand-green hover:underline">
                      {en ? "See every level and join the waiting list" : "Vezi toate nivelurile și lista de așteptare"}
                    </Link>
                  </p>
                </>
              )}
            </div>
          )}

          {choice === "privat" && (
            <div className={cn(card, "flex flex-col gap-4 p-6")}>
              <p className="text-foreground/80">
                {en
                  ? "With private lessons you choose the times after you book the lessons: you fill in the form, pay, and then pick your times from Ibra's calendar."
                  : "La lecțiile private îți alegi orele după ce rezervi lecțiile: completezi formularul, plătești, apoi îți alegi orele din calendarul lui Ibra."}
              </p>
              <p className="text-sm text-muted-foreground">
                {en
                  ? `${formatLei(ONLINE_PRICES.privateLesson)} lei online, ${formatLei(physicalPrice(ONLINE_PRICES.privateLesson))} lei in person, per 60-minute lesson.`
                  : `${formatLei(ONLINE_PRICES.privateLesson)} lei online, ${formatLei(physicalPrice(ONLINE_PRICES.privateLesson))} lei fizic, lecția de 60 de minute.`}
              </p>
            </div>
          )}
        </section>

        {(choice === "grup" || choice === "privat") && (
          <section aria-labelledby="step-book" className="mt-12">
            <h2 id="step-book" className={cn(stepTitle, choice === "grup" && !cohort && "text-muted-foreground")}>
              <span className={cn(stepNo, choice === "grup" && !cohort && "bg-muted text-muted-foreground")}>3</span>
              {en ? "Book" : "Rezervă"}
            </h2>
            <div className="flex flex-col gap-5 rounded-3xl bg-brand-green px-6 py-6 text-white sm:px-8 md:flex-row md:items-center md:justify-between">
              <p className="max-w-3xl text-base leading-relaxed text-white/90">
                {choice === "privat"
                  ? en
                    ? "Fill in the form on the private lessons page. After payment you pick your lesson times."
                    : "Completezi formularul de pe pagina lecțiilor private. După plată îți alegi orele lecțiilor."
                  : cohort
                    ? en
                      ? `${cohort.level} ${cohort.format === "fizic" ? "in person" : "online"}, from ${longDate(cohort.start_date, "en")}. Your place is confirmed by the payment.`
                      : `${cohort.level} ${cohort.format === "fizic" ? "fizic" : "online"}, din ${longDate(cohort.start_date, "ro")}. Locul se confirmă prin plată.`
                    : en
                      ? "Choose a date above."
                      : "Alege o dată mai sus."}
              </p>
              {(choice === "privat" || cohort) && (
                <Link
                  to={choice === "privat" ? "/cursuri/private#register" : `${cohortHref(cohort!)}#register`}
                  className="inline-flex h-12 shrink-0 items-center justify-center rounded-xl bg-white px-6 font-semibold text-brand-green transition-opacity hover:opacity-90"
                >
                  {en ? "Continue to sign-up →" : "Continuă la înscriere →"}
                </Link>
              )}
            </div>
          </section>
        )}

        {/* What the page said before, grouped into cards. Every price comes
            from pricing.ts, so the page cannot quote a figure the checkout
            would not charge. */}
        <section className="mt-section" aria-labelledby="booking-info">
          <span id="booking-info" className={heading}>
            {en ? "Good to know" : "Bine de știut"}
          </span>
          <div className="mt-4 grid gap-5 md:grid-cols-2">
            <div className={cn(card, "p-6 md:col-span-2")}>
              <h3 className="mb-2 font-display text-xl font-bold text-foreground">{t.bookingLandingWhichH2}</h3>
              <p className="mb-4 leading-relaxed text-foreground/80">{t.bookingLandingWhichP}</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl bg-cream p-4">
                  <h4 className="mb-2 font-semibold text-foreground">{t.bookingLandingTrialH3}</h4>
                  <ul className="list-disc space-y-1.5 pl-5 text-sm text-foreground/75">
                    <li>{t.bookingLandingTrialLi1}</li>
                    <li>{t.bookingLandingTrialLi2}</li>
                    <li>{t.bookingLandingTrialLi3}</li>
                  </ul>
                </div>
                <div className="rounded-2xl bg-cream p-4">
                  <h4 className="mb-2 font-semibold text-foreground">{t.bookingLandingEnrollH3}</h4>
                  <ul className="list-disc space-y-1.5 pl-5 text-sm text-foreground/75">
                    <li>{t.bookingLandingEnrollLi1}</li>
                    <li>{t.bookingLandingEnrollLi2}</li>
                    <li>{t.bookingLandingEnrollLi3}</li>
                  </ul>
                </div>
              </div>
            </div>
            {[
              [t.bookingLandingFormatsH2, t.bookingLandingFormatsP],
              [
                t.bookingLandingPricesH2,
                t.bookingLandingPricesP
                  .replace("{groupOnline}", formatLei(ONLINE_PRICES.groupMonthly.A1))
                  .replace("{groupFizic}", formatLei(physicalPrice(ONLINE_PRICES.groupMonthly.A1)))
                  .replace("{priv}", formatLei(ONLINE_PRICES.privateLesson))
                  .replace("{privFizic}", formatLei(physicalPrice(ONLINE_PRICES.privateLesson))),
              ],
              [t.bookingLandingWhereH2, t.bookingLandingWhereP],
              [t.bookingLandingWhenH2, t.bookingLandingWhenP],
            ].map(([h, p]) => (
              <div key={h} className={cn(card, "p-6")}>
                <h3 className="mb-2 font-display text-xl font-bold text-foreground">{h}</h3>
                <p className="leading-relaxed text-foreground/80">{p}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
    <Footer />
    </>
  );
};

export default BookingLanding;
