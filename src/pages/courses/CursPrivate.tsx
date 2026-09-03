import CourseLayout from "@/components/course/CourseLayout";
import RegistrationFormSection from "@/components/RegistrationFormSection";
import { useI18n } from "@/lib/i18n";
import { ONLINE_PRICES, physicalPrice, formatLei } from "@/lib/pricing";
import privateImg from "@/assets/private-course.jpg";
import { courseInstances, PRIVATE_LESSON_WORKLOAD } from "@/lib/courseSchema";

const CursPrivate = () => {
  const { t } = useI18n();
  const online = ONLINE_PRICES.privateLesson;
  const fizic = physicalPrice(online);

  const courseSchema = {
    name: t.coursePrivateH1,
    description: t.coursePrivateMetaDesc,
    // No repeatFrequency: 1:1 lessons are scheduled per student, so claiming
    // a cadence here would be inventing one.
    hasCourseInstance: courseInstances({ workload: PRIVATE_LESSON_WORKLOAD }),
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
      priceLine={`${t.priceOnlineShort} ${formatLei(online)} · ${t.priceFizicShort} ${formatLei(fizic)} ${t.priceLeiPer90Min}`}
      features={[t.coursePrivateFeat1, t.coursePrivateFeat2, t.coursePrivateFeat3, t.coursePrivateFeat4]}
      primaryCtaLabel={t.courseCtaSeeForm}
      primaryCtaHref="#register"
      otherCourses={[
        { to: "/cursuri/grup", label: t.courseGrupH1 },
        { to: "/cursuri/copii", label: t.courseCopiiH1 },
      ]}
    >
      {/* Personalized + MSA partners */}
      <section className="mt-4 mb-10 rounded-2xl border border-border bg-muted/40 p-6 sm:p-8">
        <h2 className="text-display-md font-bold text-foreground mb-2">{t.privatePersonalizedTitle}</h2>
        <p className="text-sm text-muted-foreground leading-relaxed max-w-3xl">{t.privatePersonalizedDesc}</p>
        <p className="text-xs text-muted-foreground mt-4">{t.priceSurchargeNote}</p>
      </section>

      {/* Absorbed from the retired /cursuri/privat duplicate: the private-vs-group
          comparison and the three-step process, which that page had and this one
          did not. */}
      <section className="mb-10 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="mb-2 text-base font-bold text-foreground">{t.privateVsGroupTitle}</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">{t.privateVsGroupDesc}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="mb-2 text-base font-bold text-foreground">{t.privateProcessTitle}</h2>
          <ol className="list-decimal space-y-1 pl-5 text-sm text-muted-foreground leading-relaxed">
            <li>{t.privateProcessStep1}</li>
            <li>{t.privateProcessStep2}</li>
            <li>{t.privateProcessStep3}</li>
          </ol>
        </div>
      </section>

      <section id="register" className="scroll-mt-24 mt-4">
        <h2 className="text-2xl font-bold text-foreground mb-2">{t.coursePageRegisterTitle}</h2>
        <p className="text-sm text-muted-foreground mb-6">{t.coursePageRegisterDesc}</p>
        <div className="rounded-2xl border border-border bg-card p-4 sm:p-6">
          <RegistrationFormSection defaultCourseType="private" lockSelection embedded />
        </div>
      </section>
    </CourseLayout>
  );
};

export default CursPrivate;