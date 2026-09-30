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
      <section className="mt-4 rounded-3xl bg-cream p-6 sm:p-10">
        <h2 className="font-display text-display-md font-bold text-foreground mb-3">{t.privatePersonalizedTitle}</h2>
        <p className="text-base text-foreground/80 leading-relaxed max-w-3xl">{t.privatePersonalizedDesc}</p>
        <p className="text-xs text-muted-foreground mt-4">{t.priceSurchargeNote}</p>
      </section>

      {/* Absorbed from the retired /cursuri/privat duplicate: the private-vs-group
          comparison and the three-step process, which that page had and this one
          did not. The steps now read as steps, right before the form. */}
      <section className="mt-section grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
        <div className="rounded-3xl border border-[#E7E1D6] bg-card p-6 sm:p-7 dark:border-border">
          <h2 className="mb-3 font-display text-xl font-bold text-foreground">{t.privateVsGroupTitle}</h2>
          <p className="text-[15px] text-foreground/75 leading-relaxed">{t.privateVsGroupDesc}</p>
        </div>
        <div>
          <h2 className="mb-4 font-display text-xl font-bold text-foreground">{t.privateProcessTitle}</h2>
          <ol className="grid gap-4 sm:grid-cols-3">
            {[t.privateProcessStep1, t.privateProcessStep2, t.privateProcessStep3].map((step, i) => (
              <li key={i} className="flex flex-col gap-3 rounded-3xl border border-[#E7E1D6] bg-card p-5 dark:border-border">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-brand-green text-sm font-bold text-white">
                  {i + 1}
                </span>
                <span className="text-[15px] leading-relaxed text-foreground/85">{step}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="register" className="scroll-mt-24 mt-section">
        <h2 className="font-display text-display-md font-bold text-foreground mb-2">{t.coursePageRegisterTitle}</h2>
        <p className="text-base text-muted-foreground mb-6">{t.coursePageRegisterDesc}</p>
        <div className="rounded-3xl border border-[#E7E1D6] bg-card p-4 sm:p-8 dark:border-border">
          <RegistrationFormSection defaultCourseType="private" lockSelection embedded />
        </div>
      </section>
    </CourseLayout>
  );
};

export default CursPrivate;