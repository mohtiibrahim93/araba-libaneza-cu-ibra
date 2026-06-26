import CourseLayout from "@/components/course/CourseLayout";
import { useI18n } from "@/lib/i18n";
import { Link } from "react-router-dom";
import { ChevronRight, Users, User, Baby } from "lucide-react";
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
      primaryCtaLabel={t.onlineLandingPickCourse}
      primaryCtaHref="#pick-course"
      otherCourses={[
        { to: "/cursuri/grup", label: t.courseGrupH1 },
        { to: "/cursuri/private", label: t.coursePrivateH1 },
        { to: "/cursuri/copii", label: t.courseCopiiH1 },
      ]}
    >
      <section id="pick-course" className="scroll-mt-24 mt-4">
        <h2 className="text-2xl font-bold text-foreground mb-2">{t.onlineLandingTitle}</h2>
        <p className="text-sm text-muted-foreground mb-6 max-w-3xl">{t.onlineLandingDesc}</p>
        <p className="text-sm font-medium text-foreground mb-3">{t.onlineLandingPickCourse}</p>
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { to: "/cursuri/grup", label: t.courseGrupH1, icon: Users },
            { to: "/cursuri/private", label: t.coursePrivateH1, icon: User },
            { to: "/cursuri/copii", label: t.courseCopiiH1, icon: Baby },
          ].map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className="group rounded-2xl border border-border bg-card p-5 hover:border-primary/50 hover:shadow-md transition-all"
            >
              <Icon className="w-5 h-5 text-primary mb-2" />
              <h3 className="text-base font-bold text-foreground mb-1">{label}</h3>
              <span className="text-sm font-medium text-primary inline-flex items-center gap-1 group-hover:underline underline-offset-4">
                {t.programsSeeFullPage} <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </Link>
          ))}
        </div>
      </section>
    </CourseLayout>
  );
};

export default CursOnline;