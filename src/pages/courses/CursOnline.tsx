import CourseLayout from "@/components/course/CourseLayout";
import RegistrationFormSection from "@/components/RegistrationFormSection";
import { useI18n } from "@/lib/i18n";
import groupImg from "@/assets/group-course.jpg";

const CursOnline = () => {
  const { t } = useI18n();

  const courseSchema = {
    name: t.courseOnlineH1,
    description: t.courseOnlineMetaDesc,
    courseMode: ["online"],
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
      path="/cursuri/online"
      metaTitle={t.courseOnlineMetaTitle}
      metaDescription={t.courseOnlineMetaDesc}
      courseSchema={courseSchema}
      heroImage={groupImg}
      heroImageAlt={t.courseOnlineH1}
      badge={t.programsBadge}
      h1={t.courseOnlineH1}
      intro={t.courseOnlineIntro}
      priceLine={t.courseOnlinePriceLine}
      features={[t.courseOnlineFeat1, t.courseOnlineFeat2, t.courseOnlineFeat3, t.courseOnlineFeat4]}
      primaryCtaLabel={t.courseCtaSeeForm}
      primaryCtaHref="#register"
      otherCourses={[
        { to: "/cursuri/grup", label: t.courseGrupH1 },
        { to: "/cursuri/private", label: t.coursePrivateH1 },
        { to: "/cursuri/copii", label: t.courseCopiiH1 },
      ]}
    >
      <section id="register" className="scroll-mt-24 mt-4">
        <h2 className="text-2xl font-bold text-foreground mb-2">{t.coursePageRegisterTitle}</h2>
        <p className="text-sm text-muted-foreground mb-6">{t.coursePageRegisterDesc}</p>
        <div className="rounded-2xl border border-border bg-card p-4 sm:p-6">
          <RegistrationFormSection defaultCourseType="group" defaultFormat="online" embedded />
        </div>
      </section>
    </CourseLayout>
  );
};

export default CursOnline;