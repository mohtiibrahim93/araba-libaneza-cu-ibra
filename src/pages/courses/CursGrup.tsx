import CourseLayout from "@/components/course/CourseLayout";
import RegistrationFormSection from "@/components/RegistrationFormSection";
import { useI18n } from "@/lib/i18n";
import groupImg from "@/assets/group-course.jpg";

const CursGrup = () => {
  const { t } = useI18n();

  const courseSchema = {
    name: t.courseGrupH1,
    description: t.courseGrupMetaDesc,
    courseMode: ["onsite", "online"],
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
      primaryCtaLabel={t.courseCtaSeeForm}
      primaryCtaHref="#register"
      otherCourses={[
        { to: "/cursuri/private", label: t.coursePrivateH1 },
        { to: "/cursuri/copii", label: t.courseCopiiH1 },
        { to: "/cursuri/online", label: t.courseOnlineH1 },
      ]}
    >
      <section id="register" className="scroll-mt-24 mt-4">
        <h2 className="text-2xl font-bold text-foreground mb-2">{t.coursePageRegisterTitle}</h2>
        <p className="text-sm text-muted-foreground mb-6">{t.coursePageRegisterDesc}</p>
        <div className="rounded-2xl border border-border bg-card p-4 sm:p-6">
          <RegistrationFormSection defaultCourseType="group" embedded />
        </div>
      </section>
    </CourseLayout>
  );
};

export default CursGrup;