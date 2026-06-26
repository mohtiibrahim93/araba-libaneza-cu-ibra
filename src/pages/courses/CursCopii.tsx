import CourseLayout from "@/components/course/CourseLayout";
import RegistrationFormSection from "@/components/RegistrationFormSection";
import { useI18n } from "@/lib/i18n";
import kidsImg from "@/assets/kids-course.jpg";

const CursCopii = () => {
  const { t } = useI18n();

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
      priceLine={t.courseCopiiPriceLine}
      features={[t.courseCopiiFeat1, t.courseCopiiFeat2, t.courseCopiiFeat3, t.courseCopiiFeat4]}
      primaryCtaLabel={t.courseCtaSeeForm}
      primaryCtaHref="#register"
      otherCourses={[
        { to: "/cursuri/grup", label: t.courseGrupH1 },
        { to: "/cursuri/private", label: t.coursePrivateH1 },
        { to: "/cursuri/online", label: t.courseOnlineH1 },
      ]}
    >
      <section id="register" className="scroll-mt-24 mt-4">
        <h2 className="text-2xl font-bold text-foreground mb-2">{t.coursePageRegisterTitle}</h2>
        <p className="text-sm text-muted-foreground mb-6">{t.coursePageRegisterDesc}</p>
        <div className="rounded-2xl border border-border bg-card p-4 sm:p-6">
          <RegistrationFormSection defaultCourseType="kids" embedded />
        </div>
      </section>
    </CourseLayout>
  );
};

export default CursCopii;