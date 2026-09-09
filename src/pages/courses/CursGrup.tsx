import CourseLayout from "@/components/course/CourseLayout";
import { useI18n } from "@/lib/i18n";
import { Link } from "react-router-dom";
import { ChevronRight, MessageCircle, Sparkles, Building2 } from "lucide-react";
import { getCurriculum } from "@/data/curriculum";
import {
  GROUP_COURSE_MONTHS,
  ONLINE_PRICES,
  formatLei,
  physicalPrice,
} from "@/lib/pricing";
import groupImg from "@/assets/group-course.jpg";
import posterCursuriGrup from "@/assets/poster-cursuri-grup-sep2026.webp";
import { courseInstances, GROUP_WEEKLY_WORKLOAD } from "@/lib/courseSchema";

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
        <h2 className="text-2xl font-bold text-foreground mb-2">{t.grupChooseLevelTitle}</h2>
        <p className="text-sm text-muted-foreground mb-2 max-w-2xl">{t.grupChooseLevelDesc}</p>
        <p className="text-sm font-medium text-primary mb-6 max-w-2xl">{t.groupEnrollmentOpenNote}</p>

        {/* These groups are for adults. Search engines were landing teen
            queries on this page, so send that intent to the page that answers
            it, with the anchor those searches actually use. */}
        <p className="text-sm text-muted-foreground mb-6 max-w-2xl">
          {lang === "en" ? (
            <>Under 18? See <Link to="/cursuri-araba-adolescenti" className="text-primary hover:underline underline-offset-4">Arabic courses for teenagers (11–17)</Link> or <Link to="/cursuri/copii" className="text-primary hover:underline underline-offset-4">courses for children (6–10)</Link>.</>
          ) : (
            <>Ai sub 18 ani? Vezi <Link to="/cursuri-araba-adolescenti" className="text-primary hover:underline underline-offset-4">cursurile de arabă pentru adolescenți (11–17 ani)</Link> sau <Link to="/cursuri/copii" className="text-primary hover:underline underline-offset-4">cursul pentru copii (6–10 ani)</Link>.</>
          )}
        </p>

        {/* The two cohorts the note above refers to, shown together. Sits here
            rather than at the top of the page so it illustrates the note
            instead of competing with the hero. */}
        <img
          src={posterCursuriGrup}
          alt="Poster cursuri de arabă libaneză, fizic la Raduga Creative Center — A2 start marți, 1 septembrie 2026, marți și joi; A1 start miercuri, 2 septembrie 2026, luni și miercuri; 19:00–20:30, Strada Icoanei 80"
          width={1024}
          height={1024}
          loading="lazy"
          decoding="async"
          className="w-full max-w-md rounded-2xl border border-border shadow-sm mb-8"
        />

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
                  {lang === "en" ? "Whole level, paid upfront (−10%)" : "Tot nivelul, plătit integral (−10%)"}
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
                // monthly x months, less the 10% upfront discount.
                const fullOnline = Math.round(online * months * 0.9);
                const fullFizic = Math.round(fizic * months * 0.9);
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
            ? "All prices are per person. Two 90-minute lessons a week. Monthly payment stops automatically at the end of the level; paying the whole level upfront takes 10% off. The first 30-minute trial lesson is free."
            : "Prețurile sunt de persoană. Două lecții de 90 de minute pe săptămână. Plata lunară se oprește automat la finalul nivelului; plata integrală a nivelului are 10% reducere. Prima lecție de probă, de 30 de minute, este gratuită."}
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
                className="group rounded-2xl border border-border bg-card p-5 hover:border-primary/50 hover:shadow-md transition-all flex flex-col"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl font-extrabold text-foreground">{lvl}</span>
                  {!available && (
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground bg-muted px-2 py-0.5 rounded">
                      {t.grupLevelInPrepBadge}
                    </span>
                  )}
                </div>
                <p className="text-sm font-semibold text-foreground mb-2 line-clamp-2">{data.title.replace(/^Nivel \w+ — /, "").replace(/^Level \w+ — /, "")}</p>
                <p className="text-xs text-muted-foreground mb-3 line-clamp-3 flex-1">{data.objective}</p>
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
                <span className="inline-flex items-center gap-1 text-sm font-medium text-primary group-hover:underline underline-offset-4">
                  {t.grupLevelCardViewFull}
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Don't know your level? */}
      <section className="mt-12 rounded-2xl border border-border bg-muted/40 p-6 sm:p-8">
        <h2 className="text-display-md font-bold text-foreground mb-2">{t.dontKnowLevelTitle}</h2>
        <p className="text-sm text-muted-foreground mb-6 max-w-2xl">{t.dontKnowLevelDesc}</p>
        <div className="grid sm:grid-cols-3 gap-4">
          <Link to="/quiz" className="rounded-xl border border-border bg-background p-5 hover:border-primary/50 transition-colors">
            <Sparkles className="w-5 h-5 text-primary mb-2" />
            <h3 className="text-sm font-bold text-foreground mb-1">{t.dontKnowOptQuizTitle}</h3>
            <p className="text-xs text-muted-foreground mb-3">{t.dontKnowOptQuizDesc}</p>
            <span className="text-xs font-medium text-primary inline-flex items-center gap-1">
              {t.dontKnowOptQuizTitle} <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </Link>
          <Link to="/trial" className="rounded-xl border border-border bg-background p-5 hover:border-primary/50 transition-colors">
            <Building2 className="w-5 h-5 text-primary mb-2" />
            <h3 className="text-sm font-bold text-foreground mb-1">{t.dontKnowOptTestTitle}</h3>
            <p className="text-xs text-muted-foreground mb-3">{t.dontKnowOptTestDesc}</p>
            <span className="text-xs font-medium text-primary inline-flex items-center gap-1">
              {t.dontKnowOptTestTitle} <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </Link>
          <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="rounded-xl border border-border bg-background p-5 hover:border-primary/50 transition-colors">
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