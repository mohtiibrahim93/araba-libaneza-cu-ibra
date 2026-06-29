import CourseLayout from "@/components/course/CourseLayout";
import RegistrationFormSection from "@/components/RegistrationFormSection";
import { useI18n } from "@/lib/i18n";
import { ONLINE_PRICES, physicalPrice, formatLei } from "@/lib/pricing";
import { Users, User, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import kidsImg from "@/assets/kids-course.jpg";

const CursCopii = () => {
  const { t } = useI18n();
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
        { to: "/cursuri/online", label: t.courseOnlineH1 },
      ]}
    >
      {/* Format choice */}
      <section className="mt-4 mb-10">
        <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-4">{t.copiiFormatChoiceTitle}</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <Link to="/cursuri/private" className="group rounded-2xl border border-border bg-card p-5 hover:border-primary/50 hover:shadow-md transition-all">
            <User className="w-5 h-5 text-primary mb-2" />
            <h3 className="text-base font-bold text-foreground mb-1">{t.copiiFormatPrivateTitle}</h3>
            <p className="text-sm text-muted-foreground mb-3">{t.copiiFormatPrivateDesc}</p>
            <p className="text-sm mb-3">
              <span className="font-semibold text-foreground">{formatLei(privOnline)}</span> {t.priceOnlineShort} · <span className="font-semibold text-foreground">{formatLei(privFizic)}</span> {t.priceFizicShort} <span className="text-muted-foreground">{t.priceLeiPerLesson}</span>
            </p>
            <span className="inline-flex items-center gap-1 text-sm font-medium text-primary group-hover:underline">
              {t.programsSeeFullPage} <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </Link>
          <Link to="/cursuri/grup" className="group rounded-2xl border border-border bg-card p-5 hover:border-primary/50 hover:shadow-md transition-all">
            <Users className="w-5 h-5 text-primary mb-2" />
            <h3 className="text-base font-bold text-foreground mb-1">{t.copiiFormatGroupTitle}</h3>
            <p className="text-sm text-muted-foreground mb-3">{t.copiiFormatGroupDesc}</p>
            <p className="text-sm mb-3">
              <span className="font-semibold text-foreground">{formatLei(grpOnline)}</span> {t.priceOnlineShort} · <span className="font-semibold text-foreground">{formatLei(grpFizic)}</span> {t.priceFizicShort} <span className="text-muted-foreground">{t.priceLeiPerMonth}</span>
            </p>
            <span className="inline-flex items-center gap-1 text-sm font-medium text-primary group-hover:underline">
              {t.programsSeeFullPage} <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </Link>
        </div>
        <p className="text-xs text-muted-foreground mt-4">{t.priceSurchargeNote}</p>
      </section>

      <section id="register" className="scroll-mt-24 mt-4">
        <h2 className="text-2xl font-bold text-foreground mb-2">{t.coursePageRegisterTitle}</h2>
        <p className="text-sm text-muted-foreground mb-6">{t.coursePageRegisterDesc}</p>
        <div className="rounded-2xl border border-border bg-card p-4 sm:p-6">
          <RegistrationFormSection defaultCourseType="kids" lockSelection embedded />
        </div>
      </section>
    </CourseLayout>
  );
};

export default CursCopii;