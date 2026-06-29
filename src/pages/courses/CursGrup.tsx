import CourseLayout from "@/components/course/CourseLayout";
import { useI18n } from "@/lib/i18n";
import { Link } from "react-router-dom";
import { ChevronRight, MessageCircle, Sparkles, Building2 } from "lucide-react";
import { getCurriculum } from "@/data/curriculum";
import { ONLINE_PRICES, physicalPrice, formatLei } from "@/lib/pricing";
import groupImg from "@/assets/group-course.jpg";

const WHATSAPP_URL = "https://wa.me/40763124514";
const LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;
const isAvailable = (l: string) => l === "A1";

const CursGrup = () => {
  const { t, lang } = useI18n();
  const curriculum = getCurriculum(lang);

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
      primaryCtaLabel={t.grupChooseLevelTitle}
      primaryCtaHref="#choose-level"
      otherCourses={[
        { to: "/cursuri/private", label: t.coursePrivateH1 },
        { to: "/cursuri/copii", label: t.courseCopiiH1 },
      ]}
    >
      {/* Level grid */}
      <section id="choose-level" className="scroll-mt-24 mt-4">
        <h2 className="text-2xl font-bold text-foreground mb-2">{t.grupChooseLevelTitle}</h2>
        <p className="text-sm text-muted-foreground mb-6 max-w-2xl">{t.grupChooseLevelDesc}</p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {LEVELS.map((lvl) => {
            const data = curriculum.find((c) => c.id === lvl.toLowerCase())!;
            const online = ONLINE_PRICES.groupMonthly[lvl];
            const fizic = physicalPrice(online);
            const available = isAvailable(lvl);
            return (
              <Link
                key={lvl}
                to={`/cursuri/grup/${lvl.toLowerCase()}`}
                className="group rounded-2xl border border-border bg-card p-5 hover:border-primary/50 hover:shadow-md transition-all flex flex-col"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl font-extrabold text-foreground">{lvl}</span>
                  {!available && (
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground bg-muted px-2 py-0.5 rounded">
                      {t.grupLevelInPrepBadge}
                    </span>
                  )}
                </div>
                <p className="text-sm font-semibold text-foreground mb-2 line-clamp-2">{data.title.replace(/^Nivel \w+ — /, "").replace(/^Level \w+ — /, "")}</p>
                <p className="text-xs text-muted-foreground mb-3 line-clamp-3 flex-1">{data.objective}</p>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground mb-3">
                  <span><strong className="text-foreground">{data.lessons}</strong> {t.grupLevelCardLessons}</span>
                  <span>·</span>
                  <span><strong className="text-foreground">{data.hours}</strong> {t.grupLevelCardHours}</span>
                </div>
                <div className="text-xs text-muted-foreground mb-3">
                  <span className="font-semibold text-foreground">{formatLei(online)}</span> {t.priceOnlineShort} · <span className="font-semibold text-foreground">{formatLei(fizic)}</span> {t.priceFizicShort} {t.priceLeiPerMonth}
                </div>
                <span className="inline-flex items-center gap-1 text-sm font-medium text-primary group-hover:underline underline-offset-4">
                  {t.grupLevelCardViewFull}
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Don't know your level? */}
      <section className="mt-12 rounded-2xl border border-border bg-muted/40 p-6 sm:p-8">
        <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">{t.dontKnowLevelTitle}</h2>
        <p className="text-sm text-muted-foreground mb-6 max-w-2xl">{t.dontKnowLevelDesc}</p>
        <div className="grid sm:grid-cols-3 gap-4">
          <Link to="/quiz" className="rounded-xl border border-border bg-background p-5 hover:border-primary/50 transition-colors">
            <Sparkles className="w-5 h-5 text-primary mb-2" />
            <h3 className="text-sm font-bold text-foreground mb-1">{t.dontKnowOptQuizTitle}</h3>
            <p className="text-xs text-muted-foreground mb-3">{t.dontKnowOptQuizDesc}</p>
            <span className="text-xs font-medium text-primary inline-flex items-center gap-1">
              {t.dontKnowOptQuizTitle} <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </Link>
          <Link to="/trial" className="rounded-xl border border-border bg-background p-5 hover:border-primary/50 transition-colors">
            <Building2 className="w-5 h-5 text-primary mb-2" />
            <h3 className="text-sm font-bold text-foreground mb-1">{t.dontKnowOptTestTitle}</h3>
            <p className="text-xs text-muted-foreground mb-3">{t.dontKnowOptTestDesc}</p>
            <span className="text-xs font-medium text-primary inline-flex items-center gap-1">
              {t.dontKnowOptTestTitle} <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </Link>
          <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="rounded-xl border border-border bg-background p-5 hover:border-primary/50 transition-colors">
            <MessageCircle className="w-5 h-5 text-primary mb-2" />
            <h3 className="text-sm font-bold text-foreground mb-1">{t.dontKnowOptWhatsAppTitle}</h3>
            <p className="text-xs text-muted-foreground mb-3">{t.dontKnowOptWhatsAppDesc}</p>
            <span className="text-xs font-medium text-primary inline-flex items-center gap-1">
              WhatsApp <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </a>
        </div>
      </section>
    </CourseLayout>
  );
};

export default CursGrup;