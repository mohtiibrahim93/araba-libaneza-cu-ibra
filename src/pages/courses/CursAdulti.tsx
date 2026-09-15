import CourseLayout from "@/components/course/CourseLayout";
import { Link } from "@/lib/router-compat";
import { ChevronRight, Users, User } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import groupImg from "@/assets/group-course.jpg";
import { courseInstances, GROUP_WEEKLY_WORKLOAD } from "@/lib/courseSchema";

const CursAdulti = () => {
  const { t } = useI18n();

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
        <h2 className="text-2xl font-bold text-foreground mb-6">{t.courseCtaSeeOptions}</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <Link to="/cursuri/grup" className="group rounded-2xl border border-border bg-card p-6 hover:border-primary/50 hover:shadow-md transition-all">
            <Users className="w-6 h-6 text-primary mb-3" />
            <h3 className="text-lg font-bold text-foreground mb-1">{t.courseGrupH1}</h3>
            <p className="text-sm text-muted-foreground mb-3">{t.courseGrupIntro}</p>
            <span className="inline-flex items-center gap-1 text-sm font-medium text-primary group-hover:underline">
              {t.programsSeeFullPage} <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </Link>
          <Link to="/cursuri/private" className="group rounded-2xl border border-border bg-card p-6 hover:border-primary/50 hover:shadow-md transition-all">
            <User className="w-6 h-6 text-primary mb-3" />
            <h3 className="text-lg font-bold text-foreground mb-1">{t.coursePrivateH1}</h3>
            <p className="text-sm text-muted-foreground mb-3">{t.coursePrivateIntro}</p>
            <span className="inline-flex items-center gap-1 text-sm font-medium text-primary group-hover:underline">
              {t.programsSeeFullPage} <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </Link>
        </div>
      </section>
    </CourseLayout>
  );
};

export default CursAdulti;