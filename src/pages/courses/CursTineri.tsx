import CourseLayout from "@/components/course/CourseLayout";
import { Link } from "react-router-dom";
import { ChevronRight, User, MessageCircle } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import groupImg from "@/assets/group-course.jpg";

const WHATSAPP_URL = "https://wa.me/40763124514";

const CursTineri = () => {
  const { t } = useI18n();

  const courseSchema = {
    name: t.cursTineriH1,
    description: t.cursTineriMetaDesc,
    courseMode: ["onsite", "online"],
    educationalLevel: "A1, A2, B1, B2",
    audience: { "@type": "EducationalAudience", educationalRole: "student", audienceType: "Teens 11-17" },
  };

  return (
    <CourseLayout
      path="/cursuri/tineri"
      metaTitle={t.cursTineriMetaTitle}
      metaDescription={t.cursTineriMetaDesc}
      courseSchema={courseSchema}
      heroImage={groupImg}
      heroImageAlt={t.cursTineriH1}
      badge={t.trackTineriTitle}
      h1={t.cursTineriH1}
      intro={t.cursTineriIntro}
      features={[t.coursePrivateFeat1, t.coursePrivateFeat2, t.coursePrivateFeat3, t.coursePrivateFeat4]}
      primaryCtaLabel={t.courseCtaSeeOptions}
      primaryCtaHref="#options"
      otherCourses={[
        { to: "/cursuri/adulti", label: t.trackAdultiTitle },
        { to: "/cursuri/copii", label: t.trackCopiiTitle },
        { to: "/cursuri", label: t.cursuriH1 },
      ]}
    >
      <section id="options" className="scroll-mt-24 mt-4">
        <div className="rounded-2xl border border-primary/30 bg-primary/5 p-6 mb-6">
          <p className="text-sm text-foreground">{t.cursTineriNote}</p>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <Link to="/cursuri/private" className="group rounded-2xl border border-border bg-card p-6 hover:border-primary/50 hover:shadow-md transition-all">
            <User className="w-6 h-6 text-primary mb-3" />
            <h3 className="text-lg font-bold text-foreground mb-1">{t.coursePrivateH1}</h3>
            <p className="text-sm text-muted-foreground mb-3">{t.coursePrivateIntro}</p>
            <span className="inline-flex items-center gap-1 text-sm font-medium text-primary group-hover:underline">
              {t.programsSeeFullPage} <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </Link>
          <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="group rounded-2xl border border-border bg-card p-6 hover:border-primary/50 hover:shadow-md transition-all">
            <MessageCircle className="w-6 h-6 text-primary mb-3" />
            <h3 className="text-lg font-bold text-foreground mb-1">{t.dontKnowOptWhatsAppTitle}</h3>
            <p className="text-sm text-muted-foreground mb-3">{t.dontKnowOptWhatsAppDesc}</p>
            <span className="inline-flex items-center gap-1 text-sm font-medium text-primary group-hover:underline">
              WhatsApp <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </a>
        </div>
      </section>
    </CourseLayout>
  );
};

export default CursTineri;