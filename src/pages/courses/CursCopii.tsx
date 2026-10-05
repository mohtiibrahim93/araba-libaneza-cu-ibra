import CourseLayout from "@/components/course/CourseLayout";
import NotifyMeForm from "@/components/NotifyMeForm";
import { useI18n } from "@/lib/i18n";
import { ONLINE_PRICES, physicalPrice, formatLei } from "@/lib/pricing";
import { Users, User, Music, BookOpen, Palette, Pencil, Globe } from "lucide-react";
import { useState } from "react";
import kidsImg from "@/assets/kids-course.jpg";
import { courseInstances, GROUP_WEEKLY_WORKLOAD } from "@/lib/courseSchema";

const CursCopii = () => {
  const { t, lang } = useI18n();
  // No kids' courses are offered at the moment — neither groups nor private
  // lessons — so both tracks collect interest (see the register section).
  const [track, setTrack] = useState<"private" | "group">("private");
  // Kids' courses are in person only (online comes later), so only the
  // in-person prices are shown — the online figures used to sit next to them.
  const en = lang === "en";
  const privFizic = physicalPrice(ONLINE_PRICES.kidsPrivateLesson);
  const grpFizic = physicalPrice(ONLINE_PRICES.kidsGroupMonthly);
  const deposit = Math.round(grpFizic * 0.25);
  const soon = en ? "Coming soon" : "În curând";
  const card = "rounded-3xl border border-[#E7E1D6] bg-card dark:border-border";

  const courseSchema = {
    name: t.courseCopiiH1,
    description: t.courseCopiiMetaDesc,
    hasCourseInstance: courseInstances({ workload: GROUP_WEEKLY_WORKLOAD, repeatFrequency: "Weekly" }),
    educationalLevel: "Beginner — Kids ages 6–11",
    audience: { "@type": "EducationalAudience", educationalRole: "student", audienceType: "Children" },
  };

  return (
    <CourseLayout
      path="/cursuri/copii"
      metaTitle={t.courseCopiiMetaTitle}
      metaDescription={t.courseCopiiMetaDesc}
      courseSchema={courseSchema}
      heroImage={kidsImg}
      heroImageAlt={t.courseCopiiH1}
      badge={t.tabKids}
      h1={t.courseCopiiH1}
      intro={t.courseCopiiIntro}
      priceLine={
        en
          ? `Coming soon · in person in Bucharest · group ${formatLei(grpFizic)} lei/month`
          : `În curând · fizic, în București · grupă ${formatLei(grpFizic)} lei/lună`
      }
      features={[t.courseCopiiFeat1, t.courseCopiiFeat2, t.courseCopiiFeat3, t.courseCopiiFeat4]}
      primaryCtaLabel={en ? "Notify me when it starts" : "Anunță-mă când pornește"}
      primaryCtaHref="#register"
      otherCourses={[
        { to: "/cursuri/grup", label: t.courseGrupH1 },
        { to: "/cursuri/private", label: t.coursePrivateH1 },
      ]}
    >
      {/* Format choice — both coming soon, in person only */}
      <section className="mt-4 mb-section">
        <h2 className="font-display text-display-md font-bold text-foreground mb-5">{t.copiiFormatChoiceTitle}</h2>
        <div className="grid sm:grid-cols-2 gap-5">
          {[
            {
              id: "group" as const,
              Icon: Users,
              title: t.copiiFormatGroupTitle,
              desc: t.copiiFormatGroupDesc,
              price: `${formatLei(grpFizic)} lei / ${en ? "month" : "lună"}`,
              note: en
                ? `When a group opens, a refundable ${formatLei(deposit)} lei deposit (25%) keeps the place.`
                : `Când se deschide o grupă, un avans rambursabil de ${formatLei(deposit)} lei (25%) păstrează locul.`,
            },
            {
              id: "private" as const,
              Icon: User,
              title: t.copiiFormatPrivateTitle,
              desc: t.copiiFormatPrivateDesc,
              price: `${formatLei(privFizic)} lei / ${en ? "lesson" : "lecție"}`,
              note: en ? "60-minute lessons, in person." : "Lecții de 60 de minute, fizic.",
            },
          ].map(({ id, Icon, title, desc, price, note }) => (
            <button
              key={id}
              type="button"
              onClick={() => {
                setTrack(id);
                document.getElementById("register")?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              aria-pressed={track === id}
              className={`${card} flex flex-col gap-3 p-6 text-left transition-colors ${
                track === id ? "border-brand-green ring-2 ring-brand-green" : "hover:border-brand-green/50"
              }`}
            >
              <span className="flex items-center justify-between">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-green/10 text-brand-green">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <span className="rounded-full bg-cream px-2.5 py-0.5 text-[11px] font-bold text-muted-foreground">{soon}</span>
              </span>
              <span className="font-display text-xl font-bold text-foreground">{title}</span>
              <span className="text-[15px] leading-relaxed text-foreground/75">{desc}</span>
              <span className="font-display text-2xl font-bold text-foreground">
                {price} <span className="text-sm font-normal text-muted-foreground">{en ? "in person" : "fizic"}</span>
              </span>
              <span className="text-sm text-muted-foreground">{note}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Curriculum — adapts to selected track */}
      <section className="mb-10">
        <h2 className="font-display text-display-md font-bold text-foreground mb-5">
          {t.copiiCurriculumTitle}
        </h2>
        <div className="rounded-3xl bg-cream p-6 sm:p-7 mb-5">
          <h3 className="text-base font-semibold text-foreground mb-2">
            {track === "group" ? t.copiiCurriculumGroupTitle : t.copiiCurriculumPrivateTitle}
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {track === "group" ? t.copiiCurriculumGroupDesc : t.copiiCurriculumPrivateDesc}
          </p>
        </div>
        <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { label: t.copiiCurriculumItemGames, icon: <Palette className="w-4 h-4" /> },
            { label: t.copiiCurriculumItemMusic, icon: <Music className="w-4 h-4" /> },
            { label: t.copiiCurriculumItemVocab, icon: <BookOpen className="w-4 h-4" /> },
            { label: t.copiiCurriculumItemStories, icon: <BookOpen className="w-4 h-4" /> },
            { label: t.copiiCurriculumItemWriting, icon: <Pencil className="w-4 h-4" /> },
            { label: t.copiiCurriculumItemCulture, icon: <Globe className="w-4 h-4" /> },
          ].map((item, i) => (
            <li
              key={i}
              className="flex items-start gap-3 rounded-2xl border border-[#E7E1D6] bg-card px-4 py-3 dark:border-border"
            >
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-green/10 flex items-center justify-center mt-0.5 text-brand-green">
                {item.icon}
              </span>
              <span className="text-sm text-foreground pt-1">{item.label}</span>
            </li>
          ))}
        </ul>
      </section>

      <section id="register" className="scroll-mt-24 mt-section">
        <span className="mb-2 block text-sm font-bold uppercase tracking-[0.1em] text-foreground">{soon}</span>
        <h2 className="font-display text-display-md font-bold text-foreground mb-2">
          {lang === "en" ? "Kids' courses — not available right now" : "Cursuri pentru copii — momentan indisponibile"}
        </h2>
        <p className="text-base text-muted-foreground mb-6">
          {lang === "en" ? "We don't have kids' courses at the moment — neither groups nor private lessons. Leave your details and we'll let you know." : "Momentan nu avem cursuri pentru copii — nici grupe, nici lecții private. Lasă-ți datele și te anunțăm."}
        </p>
        <div className="rounded-3xl bg-brand-green/5 p-4 sm:p-6">
          {/* Neither kids' groups nor kids' private lessons are offered at the
              moment, so both tracks collect interest instead of sign-ups. */}
          <NotifyMeForm
            context={track === "group" ? "Grupă copii (6–11 ani)" : "Lecții private copii (6–11 ani)"}
            label={
              lang === "en"
                ? track === "group" ? "Kids' group (ages 6–11)" : "Private lessons for kids (ages 6–11)"
                : undefined
            }
          />
        </div>
      </section>
    </CourseLayout>
  );
};

export default CursCopii;