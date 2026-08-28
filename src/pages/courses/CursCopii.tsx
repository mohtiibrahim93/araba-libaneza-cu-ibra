import CourseLayout from "@/components/course/CourseLayout";
import RegistrationFormSection from "@/components/RegistrationFormSection";
import NotifyMeForm from "@/components/NotifyMeForm";
import { useI18n } from "@/lib/i18n";
import { ONLINE_PRICES, physicalPrice, formatLei } from "@/lib/pricing";
import { Users, User, CheckCircle2, Music, BookOpen, Palette, Pencil, Globe } from "lucide-react";
import { useState } from "react";
import kidsImg from "@/assets/kids-course.jpg";

const CursCopii = () => {
  const { t, lang } = useI18n();
  // Kids private lessons are available; kids GROUP courses are not open yet
  // (notify-only), so default to the available option.
  const [track, setTrack] = useState<"private" | "group">("private");
  const privOnline = ONLINE_PRICES.kidsPrivateLesson;
  const privFizic = physicalPrice(privOnline);
  const grpOnline = ONLINE_PRICES.kidsGroupMonthly;
  const grpFizic = physicalPrice(grpOnline);

  const courseSchema = {
    name: t.courseCopiiH1,
    description: t.courseCopiiMetaDesc,
    courseMode: ["onsite", "online"],
    educationalLevel: "Beginner — Kids ages 6–10",
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
      priceLine={`${t.copiiFormatPrivateTitle}: ${formatLei(privOnline)}/${formatLei(privFizic)} ${t.priceLeiPerLesson}`}
      features={[t.courseCopiiFeat1, t.courseCopiiFeat2, t.courseCopiiFeat3, t.courseCopiiFeat4]}
      primaryCtaLabel={t.courseCtaSeeForm}
      primaryCtaHref="#register"
      otherCourses={[
        { to: "/cursuri/grup", label: t.courseGrupH1 },
        { to: "/cursuri/private", label: t.coursePrivateH1 },
      ]}
    >
      {/* Format choice */}
      <section className="mt-4 mb-10">
        <h2 className="text-display-md font-bold text-foreground mb-4">{t.copiiFormatChoiceTitle}</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => {
              setTrack("private");
              document.getElementById("register")?.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
            aria-pressed={track === "private"}
            className={
              "text-left rounded-2xl border bg-card p-5 transition-all " +
              (track === "private"
                ? "border-primary shadow-md ring-2 ring-primary/20"
                : "border-border hover:border-primary/50 hover:shadow-md")
            }
          >
            <User className="w-5 h-5 text-primary mb-2" />
            <h3 className="text-base font-bold text-foreground mb-1">{t.copiiFormatPrivateTitle}</h3>
            <p className="text-sm text-muted-foreground mb-3">{t.copiiFormatPrivateDesc}</p>
            <p className="text-sm">
              <span className="font-semibold text-foreground">{formatLei(privOnline)}</span> {t.priceOnlineShort} · <span className="font-semibold text-foreground">{formatLei(privFizic)}</span> {t.priceFizicShort} <span className="text-muted-foreground">{t.priceLeiPerLesson}</span>
            </p>
          </button>
          <button
            type="button"
            onClick={() => {
              setTrack("group");
              document.getElementById("register")?.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
            aria-pressed={track === "group"}
            className={
              "text-left rounded-2xl border bg-card p-5 transition-all " +
              (track === "group"
                ? "border-primary shadow-md ring-2 ring-primary/20"
                : "border-border hover:border-primary/50 hover:shadow-md")
            }
          >
            <Users className="w-5 h-5 text-primary mb-2" />
            <h3 className="text-base font-bold text-foreground mb-1">{t.copiiFormatGroupTitle}</h3>
            <p className="text-sm text-muted-foreground mb-3">{t.copiiFormatGroupDesc}</p>
            <p className="text-sm">
              <span className="font-semibold text-foreground">{formatLei(grpOnline)}</span> {t.priceOnlineShort} · <span className="font-semibold text-foreground">{formatLei(grpFizic)}</span> {t.priceFizicShort} <span className="text-muted-foreground">{t.priceLeiPerMonth}</span>
            </p>
          </button>
        </div>
        <p className="text-xs text-muted-foreground mt-4">{t.priceSurchargeNote}</p>
      </section>

      {/* Curriculum — adapts to selected track */}
      <section className="mb-10">
        <h2 className="text-display-md font-bold text-foreground mb-5">
          {t.copiiCurriculumTitle}
        </h2>
        <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 mb-5">
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
              className="flex items-start gap-3 rounded-xl border border-border bg-card px-4 py-3"
            >
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mt-0.5 text-primary">
                {item.icon}
              </span>
              <span className="text-sm text-foreground pt-1">{item.label}</span>
            </li>
          ))}
        </ul>
      </section>

      <section id="register" className="scroll-mt-24 mt-4">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          {track === "group"
            ? (lang === "en" ? "Kids' group — not open yet" : "Grupă copii — încă indisponibilă")
            : t.coursePageRegisterTitle}
        </h2>
        <p className="text-sm text-muted-foreground mb-6">
          {track === "group"
            ? (lang === "en"
                ? "Kids' group courses aren't open yet — leave your details and we'll tell you when one starts. Private lessons for kids are available now (switch above)."
                : "Grupele pentru copii nu sunt încă deschise — lasă-ne datele și îți spunem când pornește una. Lecțiile private pentru copii sunt disponibile acum (schimbă mai sus).")
            : t.coursePageRegisterDesc}
        </p>
        <div className="rounded-2xl border border-border bg-card p-4 sm:p-6">
          {track === "group" ? (
            <NotifyMeForm context="Grupă copii (6–10 ani)" />
          ) : (
            <RegistrationFormSection
              key={track}
              defaultCourseType="kids"
              lessonType={track}
              lockSelection
              embedded
            />
          )}
        </div>
      </section>
    </CourseLayout>
  );
};

export default CursCopii;