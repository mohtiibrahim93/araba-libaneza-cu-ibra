import CourseLayout from "@/components/course/CourseLayout";
import { useI18n } from "@/lib/i18n";
import { Link } from "@/lib/router-compat";
import { ChevronRight, MessageCircle, Sparkles, Building2 } from "lucide-react";
import { getCurriculum } from "@/data/curriculum";
import {
  GROUP_COURSE_MONTHS,
  GROUP_FULL_COURSE_DISCOUNT,
  discountLabel,
  ONLINE_PRICES,
  formatLei,
  physicalPrice,
} from "@/lib/pricing";
import groupImg from "@/assets/group-course.jpg";
import { courseInstances, GROUP_WEEKLY_WORKLOAD } from "@/lib/courseSchema";
import CohortEnrollmentNote from "@/components/CohortEnrollmentNote";

const WHATSAPP_URL = "https://wa.me/40763124514";
const LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;
const isAvailable = (l: string) => l === "A1" || l === "A2";

const CursGrup = () => {
  const { t, lang } = useI18n();
  const curriculum = getCurriculum(lang);

  const courseSchema = {
    name: t.courseGrupH1,
    description: t.courseGrupMetaDesc,
    hasCourseInstance: courseInstances({
      workload: GROUP_WEEKLY_WORKLOAD,
      repeatFrequency: "Weekly",
    }),
    educationalLevel: "A1, A2, B1, B2, C1, C2",
    offers: {
      "@type": "Offer",
      price: "500",
      priceCurrency: "RON",
      availability: "https://schema.org/InStock",
    },
  };

  return (
    <CourseLayout
      path="/cursuri/grup"
      metaTitle={t.courseGrupMetaTitle}
      metaDescription={t.courseGrupMetaDesc}
      courseSchema={courseSchema}
      heroImage={groupImg}
      heroImageAlt={t.courseGrupH1}
      badge={t.groupBadge}
      h1={t.courseGrupH1}
      intro={t.courseGrupIntro}
      priceLine={t.courseGrupPriceLine}
      features={[t.courseGrupFeat1, t.courseGrupFeat2, t.courseGrupFeat3, t.courseGrupFeat4]}
      primaryCtaLabel={t.grupChooseLevelTitle}
      primaryCtaHref="#choose-level"
      otherCourses={[
        { to: "/cursuri/private", label: t.coursePrivateH1 },
        { to: "/cursuri/copii", label: t.courseCopiiH1 },
      ]}
    >
      {/* Level grid */}
      <section id="choose-level" className="scroll-mt-24 mt-4">
        <h2 className="font-display text-display-lg font-bold tracking-tight text-foreground mb-2">{t.grupChooseLevelTitle}</h2>
        <p className="text-base text-muted-foreground mb-2 max-w-2xl">{t.grupChooseLevelDesc}</p>
        <CohortEnrollmentNote className="text-sm font-medium text-primary mb-6 max-w-2xl" />

        {/* These groups are for adults. Search engines were landing teen
            queries on this page, so send that intent to the page that answers
            it, with the anchor those searches actually use. */}
        <p className="text-sm text-muted-foreground mb-6 max-w-2xl">
          {lang === "en" ? (
            <>Under 18? See <Link to="/cursuri-araba-adolescenti" className="text-primary hover:underline underline-offset-4">Arabic courses for teenagers (12–17)</Link> or <Link to="/cursuri/copii" className="text-primary hover:underline underline-offset-4">courses for children (6–11)</Link>.</>
          ) : (
            <>Ai sub 18 ani? Vezi <Link to="/cursuri-araba-adolescenti" className="text-primary hover:underline underline-offset-4">cursurile de arabă pentru adolescenți (12–17 ani)</Link> sau <Link to="/cursuri/copii" className="text-primary hover:underline underline-offset-4">cursul pentru copii (6–11 ani)</Link>.</>
          )}
        </p>

        {/* All six levels side by side.
            The cards below say everything this table says, but one level at a
            time — someone deciding between A2 and B1, or working out what the
            whole path costs, had to open six of them and hold the numbers in
            their head. Every figure is derived: prices from pricing.ts, lesson
            counts and hours from curriculum.ts, months from GROUP_COURSE_MONTHS
            (which is also what Stripe bills against), so none of it can go
            stale the way a hand-written table would. */}
        <div className="not-prose mb-8 overflow-x-auto rounded-2xl border border-border">
          <table className="w-full text-sm border-collapse min-w-[46rem]">
            <caption className="sr-only">
              {lang === "en"
                ? "Lebanese Arabic group courses: level, length, monthly price and full-course price"
                : "Cursuri de grup de arabă libaneză: nivel, durată, preț lunar și preț pe tot nivelul"}
            </caption>
            <thead>
              <tr className="border-b border-border bg-muted/40 text-left text-muted-foreground">
                <th scope="col" className="py-2.5 px-3 font-semibold">{lang === "en" ? "Level" : "Nivel"}</th>
                <th scope="col" className="py-2.5 px-3 font-semibold">{lang === "en" ? "Lessons" : "Lecții"}</th>
                <th scope="col" className="py-2.5 px-3 font-semibold">{lang === "en" ? "Length" : "Durată"}</th>
                <th scope="col" className="py-2.5 px-3 font-semibold">{lang === "en" ? "Per month" : "Pe lună"}</th>
                <th scope="col" className="py-2.5 px-3 font-semibold">
                  {lang === "en" ? `Whole level, paid upfront (${discountLabel(GROUP_FULL_COURSE_DISCOUNT)})` : `Tot nivelul, plătit integral (${discountLabel(GROUP_FULL_COURSE_DISCOUNT)})`}
                </th>
                <th scope="col" className="py-2.5 px-3 font-semibold">{lang === "en" ? "Enrolment" : "Înscrieri"}</th>
              </tr>
            </thead>
            <tbody>
              {LEVELS.map((lvl) => {
                const data = curriculum.find((c) => c.id === lvl.toLowerCase())!;
                const online = ONLINE_PRICES.groupMonthly[lvl];
                const fizic = physicalPrice(online);
                const months = GROUP_COURSE_MONTHS[lvl];
                // The pay-in-full price the checkout actually charges:
                // monthly x months, less the upfront discount.
                const fullOnline = Math.round(online * months * (1 - GROUP_FULL_COURSE_DISCOUNT));
                const fullFizic = Math.round(fizic * months * (1 - GROUP_FULL_COURSE_DISCOUNT));
                const available = isAvailable(lvl);
                return (
                  <tr key={lvl} className="border-b border-border/60 last:border-0 align-top">
                    <th scope="row" className="py-2.5 px-3 text-left font-bold text-foreground whitespace-nowrap">
                      <Link to={`${lang === "en" ? "/en/courses/group" : "/cursuri/grup"}/${lvl.toLowerCase()}`} className="text-primary hover:underline underline-offset-4">
                        {lvl}
                      </Link>
                    </th>
                    <td className="py-2.5 px-3 whitespace-nowrap">{data.lessons}</td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      {months} {lang === "en" ? (months === 1 ? "month" : "months") : "luni"}
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span className="font-semibold text-foreground">{formatLei(online)}</span>{" "}
                      <span className="text-muted-foreground">{t.priceOnlineShort}</span>
                      {" · "}
                      <span className="font-semibold text-foreground">{formatLei(fizic)}</span>{" "}
                      <span className="text-muted-foreground">{t.priceFizicShort}</span>
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span className="font-semibold text-foreground">{formatLei(fullOnline)}</span>{" "}
                      <span className="text-muted-foreground">{t.priceOnlineShort}</span>
                      {" · "}
                      <span className="font-semibold text-foreground">{formatLei(fullFizic)}</span>{" "}
                      <span className="text-muted-foreground">{t.priceFizicShort}</span>
                    </td>
                    <td className="py-2.5 px-3">
                      {available ? (
                        <span className="font-medium text-primary">
                          {lang === "en" ? "Open now" : "Deschise acum"}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">
                          {lang === "en" ? "After the previous level" : "După nivelul anterior"}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-muted-foreground mb-8 max-w-2xl">
          {lang === "en"
            ? "All prices are per person. Two 90-minute lessons a week. Monthly payment stops automatically at the end of the level; paying the whole level upfront takes 15% off. The first 30-minute trial lesson is free."
            : "Prețurile sunt de persoană. Două lecții de 90 de minute pe săptămână. Plata lunară se oprește automat la finalul nivelului; plata integrală a nivelului are 15% reducere. Prima lecție de probă, de 30 de minute, este gratuită."}
        </p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {LEVELS.map((lvl) => {
            const data = curriculum.find((c) => c.id === lvl.toLowerCase())!;
            const online = ONLINE_PRICES.groupMonthly[lvl];
            const fizic = physicalPrice(online);
            const available = isAvailable(lvl);
            return (
              <Link
                key={lvl}
                to={`${lang === "en" ? "/en/courses/group" : "/cursuri/grup"}/${lvl.toLowerCase()}`}
                className="group rounded-3xl border border-[#E7E1D6] bg-card p-6 hover:border-brand-green/50 transition-colors flex flex-col dark:border-border"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-display text-3xl font-bold text-foreground">{lvl}</span>
                  {available ? (
                    <span className="rounded-full bg-brand-green/10 px-2.5 py-0.5 text-[11px] font-bold text-brand-green">
                      {lang === "en" ? "Open" : "Înscrieri deschise"}
                    </span>
                  ) : (
                    <span className="rounded-full bg-cream px-2.5 py-0.5 text-[11px] font-bold text-muted-foreground">
                      {t.grupLevelInPrepBadge}
                    </span>
                  )}
                </div>
                <p className="font-semibold text-foreground mb-2 line-clamp-2">{data.title.replace(/^Nivel \w+ — /, "").replace(/^Level \w+ — /, "")}</p>
                <p className="text-sm leading-relaxed text-foreground/75 mb-4 line-clamp-3 flex-1">{data.objective}</p>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground mb-3">
                  <span><strong className="text-foreground">{data.lessons}</strong> {t.grupLevelCardLessons}</span>
                  <span>·</span>
                  <span><strong className="text-foreground">{data.hours}</strong> {t.grupLevelCardHours}</span>
                </div>
                {data.schedule && (
                  <div className="mb-3 space-y-0.5">
                    {data.schedule.map((line, i) => (
                      <p key={i} className="text-xs text-muted-foreground">{line}</p>
                    ))}
                  </div>
                )}
                <div className="text-xs text-muted-foreground mb-3">
                  <span className="font-semibold text-foreground">{formatLei(online)}</span> {t.priceOnlineShort} · <span className="font-semibold text-foreground">{formatLei(fizic)}</span> {t.priceFizicShort} {t.priceLeiPerMonth}
                </div>
                <span className="inline-flex items-center gap-1 text-sm font-semibold text-brand-green group-hover:underline underline-offset-4">
                  {t.grupLevelCardViewFull}
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="mt-section">
        <span className="mb-2 block text-sm font-bold uppercase tracking-[0.1em] text-foreground">
          {lang === "en" ? "Groups in progress" : "Grupe în desfășurare"}
        </span>
        <p className="mb-5 max-w-2xl text-base text-muted-foreground">
          {lang === "en"
            ? "A1 and A2 in person at Raduga Creative Center, started in September. For the next start dates, see the enrolment note above."
            : "A1 și A2 fizic, la Raduga Creative Center, începute în septembrie. Pentru următoarele date de start, vezi nota de înscriere de mai sus."}
        </p>
      </section>

      {/* Don't know your level? */}
      <section className="mt-section rounded-3xl bg-cream p-6 sm:p-10">
        <h2 className="font-display text-display-md font-bold text-foreground mb-2">{t.dontKnowLevelTitle}</h2>
        <p className="text-sm text-muted-foreground mb-6 max-w-2xl">{t.dontKnowLevelDesc}</p>
        <div className="grid sm:grid-cols-3 gap-4">
          <Link to="/quiz" className="rounded-2xl border border-[#E7E1D6] bg-card p-5 hover:border-brand-green/50 transition-colors dark:border-border">
            <Sparkles className="w-5 h-5 text-primary mb-2" />
            <h3 className="text-sm font-bold text-foreground mb-1">{t.dontKnowOptQuizTitle}</h3>
            <p className="text-xs text-muted-foreground mb-3">{t.dontKnowOptQuizDesc}</p>
            <span className="text-xs font-medium text-primary inline-flex items-center gap-1">
              {t.dontKnowOptQuizTitle} <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </Link>
          <Link to="/trial" className="rounded-2xl border border-[#E7E1D6] bg-card p-5 hover:border-brand-green/50 transition-colors dark:border-border">
            <Building2 className="w-5 h-5 text-primary mb-2" />
            <h3 className="text-sm font-bold text-foreground mb-1">{t.dontKnowOptTestTitle}</h3>
            <p className="text-xs text-muted-foreground mb-3">{t.dontKnowOptTestDesc}</p>
            <span className="text-xs font-medium text-primary inline-flex items-center gap-1">
              {t.dontKnowOptTestTitle} <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </Link>
          <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="rounded-2xl border border-[#E7E1D6] bg-card p-5 hover:border-brand-green/50 transition-colors dark:border-border">
            <MessageCircle className="w-5 h-5 text-primary mb-2" />
            <h3 className="text-sm font-bold text-foreground mb-1">{t.dontKnowOptWhatsAppTitle}</h3>
            <p className="text-xs text-muted-foreground mb-3">{t.dontKnowOptWhatsAppDesc}</p>
            <span className="text-xs font-medium text-primary inline-flex items-center gap-1">
              WhatsApp <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </a>
        </div>
      </section>
    </CourseLayout>
  );
};

export default CursGrup;