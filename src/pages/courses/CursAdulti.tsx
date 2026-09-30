import CourseLayout from "@/components/course/CourseLayout";
import { Link } from "@/lib/router-compat";
import { ChevronRight, Users, User } from "lucide-react";
import { useGroupCohorts } from "@/hooks/useGroupCohorts";
import { cohortHref, longDate } from "@/lib/nextCohort";
import { useI18n } from "@/lib/i18n";
import groupImg from "@/assets/group-course.jpg";
import { courseInstances, GROUP_WEEKLY_WORKLOAD } from "@/lib/courseSchema";

const CursAdulti = () => {
  const { t, lang } = useI18n();
  const en = lang === "en";
  // The groups an adult can join now: the same list the sign-up form offers.
  const { cohorts } = useGroupCohorts("group", null, null, en ? "en" : "ro");
  const open = cohorts.filter((c) => !c.full);

  const courseSchema = {
    name: t.cursAdultiH1,
    description: t.cursAdultiMetaDesc,
    hasCourseInstance: courseInstances({
      workload: GROUP_WEEKLY_WORKLOAD,
      repeatFrequency: "Weekly",
    }),
    educationalLevel: "A1, A2, B1, B2, C1, C2",
    audience: { "@type": "EducationalAudience", educationalRole: "student", audienceType: "Adults" },
  };

  return (
    <CourseLayout
      path="/cursuri/adulti"
      metaTitle={t.cursAdultiMetaTitle}
      metaDescription={t.cursAdultiMetaDesc}
      courseSchema={courseSchema}
      heroImage={groupImg}
      heroImageAlt={t.cursAdultiH1}
      badge={t.trackAdultiTitle}
      h1={t.cursAdultiH1}
      intro={t.cursAdultiIntro}
      features={[t.courseGrupFeat1, t.courseGrupFeat2, t.coursePrivateFeat2, t.courseGrupFeat4]}
      primaryCtaLabel={t.courseCtaSeeOptions}
      primaryCtaHref="#options"
      otherCourses={[
        { to: "/cursuri-araba-adolescenti", label: t.trackTineriTitle },
        { to: "/cursuri/copii", label: t.trackCopiiTitle },
        { to: "/cursuri", label: t.cursuriH1 },
      ]}
    >
      <section id="options" className="scroll-mt-24 mt-4">
        <h2 className="font-display text-display-lg font-bold tracking-tight text-foreground mb-6">{t.courseCtaSeeOptions}</h2>
        <div className="grid sm:grid-cols-2 gap-5">
          <Link to="/cursuri/grup" className="group rounded-3xl border border-[#E7E1D6] bg-card p-6 sm:p-7 hover:border-brand-green/50 transition-colors dark:border-border">
            <span className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-green/10 text-brand-green">
              <Users className="w-5 h-5" aria-hidden="true" />
            </span>
            <h3 className="font-display text-xl font-bold text-foreground mb-2">{t.courseGrupH1}</h3>
            <p className="text-[15px] leading-relaxed text-foreground/75 mb-4">{t.courseGrupIntro}</p>
            <span className="inline-flex items-center gap-1 text-sm font-semibold text-brand-green group-hover:underline">
              {t.programsSeeFullPage} <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </Link>
          <Link to="/cursuri/private" className="group rounded-3xl border border-[#E7E1D6] bg-card p-6 sm:p-7 hover:border-brand-green/50 transition-colors dark:border-border">
            <span className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-green/10 text-brand-green">
              <User className="w-5 h-5" aria-hidden="true" />
            </span>
            <h3 className="font-display text-xl font-bold text-foreground mb-2">{t.coursePrivateH1}</h3>
            <p className="text-[15px] leading-relaxed text-foreground/75 mb-4">{t.coursePrivateIntro}</p>
            <span className="inline-flex items-center gap-1 text-sm font-semibold text-brand-green group-hover:underline">
              {t.programsSeeFullPage} <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </Link>
        </div>
      </section>

      {/* Who the adult courses are for, in the owner's words from the
          homepage's "Pentru cine?" band. */}
      <section className="mt-section rounded-3xl bg-brand-green px-6 py-8 text-white sm:px-10">
        <span className="mb-2 block text-sm font-bold uppercase tracking-[0.1em] text-white/80">
          {en ? "Who it's for" : "Pentru cine"}
        </span>
        <p className="max-w-3xl text-lg leading-relaxed text-white/90">
          {en
            ? "Lebanese roots, a Lebanese partner or family, or work: official papers are in Standard Arabic, but daily life happens in dialect."
            : "Rădăcini libaneze, partener sau familie din Liban, ori carieră: actele oficiale sunt în araba standard, dar viața de zi cu zi e în dialect."}
        </p>
      </section>

      {open.length > 0 && (
        <section className="mt-section">
          <span className="mb-2 block text-sm font-bold uppercase tracking-[0.1em] text-foreground">
            {en ? "Open for sign-up" : "Înscrieri deschise"}
          </span>
          <h2 className="font-display text-display-md font-bold text-foreground mb-5">
            {en ? "The next groups" : "Următoarele grupe"}
          </h2>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {open.map((c) => (
              <li key={c.id}>
                <Link
                  to={`${cohortHref(c)}#register`}
                  className="flex h-full flex-col gap-1 rounded-2xl border border-[#E7E1D6] bg-card p-5 hover:border-brand-green/50 transition-colors dark:border-border"
                >
                  <span className="text-sm font-bold text-brand-green">
                    {c.level} · {c.format === "fizic" ? (en ? "in person" : "fizic") : "online"}
                  </span>
                  <span className="font-display text-lg font-bold text-foreground">
                    {en ? "Starts " : "Începe pe "}{longDate(c.start_date, en ? "en" : "ro")}
                  </span>
                  <span className="text-sm text-foreground/70">{en ? c.schedule_label_en : c.schedule_label_ro}</span>
                  <span className="mt-auto pt-2 text-sm font-semibold text-foreground">
                    {en ? `${c.seatsLeft} of ${c.max_seats} seats free` : `${c.seatsLeft} din ${c.max_seats} locuri libere`}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-section flex flex-col gap-5 rounded-3xl bg-cream px-6 py-8 sm:px-10 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-foreground">
            {en ? "Not sure yet? Start with the free trial." : "Nu ești sigur? Începe cu lecția gratuită."}
          </h2>
          <p className="mt-1 text-foreground/75">
            {en ? "30 minutes, 0 lei: we meet and find your level." : "30 de minute, 0 lei: ne cunoaștem și îți aflăm nivelul."}
          </p>
        </div>
        <Link
          to="/trial"
          className="inline-flex h-12 shrink-0 items-center justify-center rounded-xl bg-primary px-6 font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          {en ? "Book the free trial →" : "Rezervă lecția gratuită →"}
        </Link>
      </section>
    </CourseLayout>
  );
};

export default CursAdulti;