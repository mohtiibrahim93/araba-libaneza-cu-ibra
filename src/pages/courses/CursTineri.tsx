import CourseLayout from "@/components/course/CourseLayout";
import { Link } from "react-router-dom";
import { ChevronRight, User, MessageCircle, GraduationCap } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import NotifyMeForm from "@/components/NotifyMeForm";
import groupImg from "@/assets/group-course.jpg";

const WHATSAPP_URL = "https://wa.me/40763124514";

const CursTineri = () => {
  const { t, lang } = useI18n();

  const courseSchema = {
    name: t.cursTineriH1,
    description: t.cursTineriMetaDesc,
    courseMode: ["onsite", "online"],
    educationalLevel: "A1, A2, B1, B2",
    audience: { "@type": "EducationalAudience", educationalRole: "student", audienceType: "Teens 11-18" },
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
          <p className="mt-2 text-sm text-muted-foreground">
            {lang === "en" ? (
              <>Full details on method, prices and schedule: <Link to="/cursuri-araba-adolescenti" className="text-primary hover:underline underline-offset-4">Arabic courses for teenagers (11–17)</Link>.</>
            ) : (
              <>Detalii complete despre metodă, prețuri și program: <Link to="/cursuri-araba-adolescenti" className="text-primary hover:underline underline-offset-4">cursuri de arabă pentru adolescenți (11–17 ani)</Link>.</>
            )}
          </p>
        </div>
        {/* Dedicated teen groups (11–17): forming — capture interest as a real
            course_request that lands in the admin, not a WhatsApp thread. */}
        <div className="grid md:grid-cols-[1fr_1.1fr] gap-4 items-start mb-4">
          <div className="rounded-2xl border border-primary/30 bg-primary/5 p-6">
            <h3 className="font-display text-lg font-bold text-foreground mb-1">{t.cursTineriGroupTitle}</h3>
            <p className="text-sm text-muted-foreground">{t.cursTineriGroupDesc}</p>
          </div>
          <NotifyMeForm context={t.cursTineriGroupTitle} />
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          {/* 16–18: straight into the adult groups, with parental consent. */}
          <Link to="/cursuri/grup" className="group rounded-2xl border border-border bg-card p-6 hover:border-primary/50 hover:shadow-md transition-all">
            <GraduationCap className="w-6 h-6 text-primary mb-3" />
            <h3 className="text-base font-bold text-foreground mb-1">{t.cursTineriAdultTitle}</h3>
            <p className="text-sm text-muted-foreground mb-3">{t.cursTineriAdultDesc}</p>
            <span className="inline-flex items-center gap-1 text-sm font-medium text-primary group-hover:underline">
              {t.cursTineriAdultCta} <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </Link>
          <Link to="/cursuri/private" className="group rounded-2xl border border-border bg-card p-6 hover:border-primary/50 hover:shadow-md transition-all">
            <User className="w-6 h-6 text-primary mb-3" />
            <h3 className="text-base font-bold text-foreground mb-1">{t.coursePrivateH1}</h3>
            <p className="text-sm text-muted-foreground mb-3">{t.coursePrivateIntro}</p>
            <span className="inline-flex items-center gap-1 text-sm font-medium text-primary group-hover:underline">
              {t.programsSeeFullPage} <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </Link>
          <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="group rounded-2xl border border-border bg-card p-6 hover:border-primary/50 hover:shadow-md transition-all">
            <MessageCircle className="w-6 h-6 text-primary mb-3" />
            <h3 className="text-base font-bold text-foreground mb-1">{t.dontKnowOptWhatsAppTitle}</h3>
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