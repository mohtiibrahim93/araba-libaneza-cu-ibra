import CourseLayout from "@/components/course/CourseLayout";
import RegistrationFormSection from "@/components/RegistrationFormSection";
import { useI18n } from "@/lib/i18n";
import { ONLINE_PRICES, physicalPrice, formatLei } from "@/lib/pricing";
import { Users, User, CheckCircle2, Music, BookOpen, Palette, Pencil, Globe } from "lucide-react";
import { useState } from "react";
import kidsImg from "@/assets/kids-course.jpg";

const CursCopii = () => {
  const { t } = useI18n();
  const [track, setTrack] = useState<"private" | "group">("group");
  const privOnline = ONLINE_PRICES.kidsPrivateLesson;
  const privFizic = physicalPrice(privOnline);
  const grpOnline = ONLINE_PRICES.kidsGroupMonthly;
  const grpFizic = physicalPrice(grpOnline);

  const courseSchema = {
    name: t.courseCopiiH1,
    description: t.courseCopiiMetaDesc,
    courseMode: ["onsite", "online"],
    educationalLevel: "Beginner — Kids ages 4–14",
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
      priceLine={`${t.copiiFormatPrivateTitle}: ${formatLei(privOnline)}/${formatLei(privFizic)} ${t.priceLeiPerLesson} · ${t.copiiFormatGroupTitle}: ${formatLei(grpOnline)}/${formatLei(grpFizic)} ${t.priceLeiPerMonth}`}
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
        <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-4">{t.copiiFormatChoiceTitle}</h2>
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

      <section id="register" className="scroll-mt-24 mt-4">
        <h2 className="text-2xl font-bold text-foreground mb-2">{t.coursePageRegisterTitle}</h2>
        <p className="text-sm text-muted-foreground mb-6">{t.coursePageRegisterDesc}</p>
        <div className="rounded-2xl border border-border bg-card p-4 sm:p-6">
          <RegistrationFormSection
            key={track}
            defaultCourseType="kids"
            lessonType={track}
            lockSelection
            embedded
          />
        </div>
      </section>
    </CourseLayout>
  );
};

export default CursCopii;