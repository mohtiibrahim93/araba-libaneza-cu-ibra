import CourseLayout from "@/components/course/CourseLayout";
import RegistrationFormSection from "@/components/RegistrationFormSection";
import { useI18n } from "@/lib/i18n";
import privateImg from "@/assets/private-course.jpg";

const CursPrivate = () => {
  const { t } = useI18n();

  const courseSchema = {
    name: t.coursePrivateH1,
    description: t.coursePrivateMetaDesc,
    courseMode: ["onsite", "online"],
    educationalLevel: "A1, A2, B1, B2, C1, C2",
    offers: {
      "@type": "Offer",
      price: "150",
      priceCurrency: "RON",
      availability: "https://schema.org/InStock",
    },
  };

  return (
    <CourseLayout
      path="/cursuri/private"
      metaTitle={t.coursePrivateMetaTitle}
      metaDescription={t.coursePrivateMetaDesc}
      courseSchema={courseSchema}
      heroImage={privateImg}
      heroImageAlt={t.coursePrivateH1}
      badge={t.privateBadge}
      h1={t.coursePrivateH1}
      intro={t.coursePrivateIntro}
      priceLine={t.coursePrivatePriceLine}
      features={[t.coursePrivateFeat1, t.coursePrivateFeat2, t.coursePrivateFeat3, t.coursePrivateFeat4]}
      primaryCtaLabel={t.courseCtaSeeForm}
      primaryCtaHref="#register"
      otherCourses={[
        { to: "/cursuri/grup", label: t.courseGrupH1 },
        { to: "/cursuri/copii", label: t.courseCopiiH1 },
        { to: "/cursuri/online", label: t.courseOnlineH1 },
      ]}
    >
      <section id="register" className="scroll-mt-24 mt-4">
        <h2 className="text-2xl font-bold text-foreground mb-2">{t.coursePageRegisterTitle}</h2>
        <p className="text-sm text-muted-foreground mb-6">{t.coursePageRegisterDesc}</p>
        <div className="rounded-2xl border border-border bg-card p-4 sm:p-6">
          <RegistrationFormSection defaultCourseType="private" embedded />
        </div>
      </section>
    </CourseLayout>
  );
};

export default CursPrivate;