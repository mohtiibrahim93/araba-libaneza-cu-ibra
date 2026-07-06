import { useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useParams, Navigate } from "react-router-dom";
import { ChevronRight, MessageCircle, CheckCircle2, BookOpen, Clock, GraduationCap } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import ScrollToTop from "@/components/ScrollToTop";
import CookieConsent from "@/components/CookieConsent";
import RegistrationFormSection from "@/components/RegistrationFormSection";
import { useI18n } from "@/lib/i18n";
import { getCurriculum } from "@/data/curriculum";
import { ONLINE_PRICES, physicalPrice, formatLei } from "@/lib/pricing";
import type { LevelType } from "@/components/RegistrationForm/types";

const BASE_URL = "https://centruldearabalibaneza.com";
const WHATSAPP_URL = "https://wa.me/40763124514";
const VALID = ["a1", "a2", "b1", "b2", "c1", "c2"] as const;
const isAvailable = (level: LevelType) => level === "A1" || level === "A2";

const CursGrupLevel = () => {
  const { t, lang } = useI18n();
  const { level } = useParams<{ level: string }>();
  const slug = (level || "").toLowerCase();

  // Hooks must run on every render (before any early return) so the hook
  // order stays stable. Otherwise navigating from a valid level to an invalid
  // one while this route stays mounted throws "rendered fewer hooks than
  // expected" and blanks the whole app.
  const curriculum = useMemo(
    () => getCurriculum(lang).find((l) => l.id === slug),
    [lang, slug],
  );

  if (!VALID.includes(slug as (typeof VALID)[number]) || !curriculum) {
    return <Navigate to="/cursuri/grup" replace />;
  }
  const upperLevel = slug.toUpperCase() as LevelType;
  const online = ONLINE_PRICES.groupMonthly[upperLevel];
  const fizic = physicalPrice(online);
  const available = isAvailable(upperLevel);

  const canonical = `${BASE_URL}/cursuri/grup/${slug}`;
  const metaTitle = `${curriculum.title} — ${t.courseGrupH1}`;
  const metaDesc = curriculum.objective.slice(0, 155);

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: t.courseBreadcrumbHome, item: `${BASE_URL}/` },
      { "@type": "ListItem", position: 2, name: t.courseBreadcrumbCourses, item: `${BASE_URL}/#programs` },
      { "@type": "ListItem", position: 3, name: t.courseGrupH1, item: `${BASE_URL}/cursuri/grup` },
      { "@type": "ListItem", position: 4, name: curriculum.title, item: canonical },
    ],
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{metaTitle}</title>
        <meta name="description" content={metaDesc} />
        <link rel="canonical" href={canonical} />
        <meta property="og:title" content={metaTitle} />
        <meta property="og:description" content={metaDesc} />
        <meta property="og:url" content={canonical} />
        <script type="application/ld+json">{JSON.stringify(breadcrumbJsonLd)}</script>
      </Helmet>
      <Navbar />

      <main className="pt-16">
        {/* Breadcrumb */}
        <nav className="max-w-6xl mx-auto px-6 pt-6 pb-2 text-xs text-muted-foreground">
          <ol className="flex flex-wrap items-center gap-1">
            <li><Link to="/" className="hover:text-foreground">{t.courseBreadcrumbHome}</Link></li>
            <li aria-hidden><ChevronRight className="w-3.5 h-3.5 inline -mt-0.5" /></li>
            <li><Link to="/cursuri/grup" className="hover:text-foreground">{t.courseGrupH1}</Link></li>
            <li aria-hidden><ChevronRight className="w-3.5 h-3.5 inline -mt-0.5" /></li>
            <li className="text-foreground font-medium" aria-current="page">{upperLevel}</li>
          </ol>
        </nav>

        {/* Hero */}
        <section className="max-w-6xl mx-auto px-6 pt-4 pb-8">
          <span className="inline-block text-xs font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full mb-3">
            CEFR {upperLevel}
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground mb-4">
            {curriculum.title}
          </h1>
          <p className="text-base text-muted-foreground leading-relaxed max-w-3xl mb-6">
            {curriculum.objective}
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 max-w-2xl mb-6">
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center gap-2 text-xs uppercase text-muted-foreground font-semibold mb-1">
                <BookOpen className="w-3.5 h-3.5" /> {t.levelPageStatLessons}
              </div>
              <p className="text-xl font-bold text-foreground">{curriculum.lessons}</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center gap-2 text-xs uppercase text-muted-foreground font-semibold mb-1">
                <Clock className="w-3.5 h-3.5" /> {t.levelPageStatHours}
              </div>
              <p className="text-xl font-bold text-foreground">{curriculum.hours}</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center gap-2 text-xs uppercase text-muted-foreground font-semibold mb-1">
                <GraduationCap className="w-3.5 h-3.5" /> {t.levelPageStatTrack}
              </div>
              <p className="text-sm font-semibold text-foreground leading-tight">{curriculum.trackLabel}</p>
            </div>
          </div>

          {curriculum.schedule && (
            <p className="text-sm text-foreground font-medium mb-6 max-w-2xl">
              <span className="text-xs uppercase font-semibold text-muted-foreground mr-2">{t.levelPageScheduleLabel}</span>
              {curriculum.schedule}
            </p>
          )}

          {/* Dual price */}
          <div className="inline-flex flex-wrap items-baseline gap-4 rounded-xl border border-border bg-muted/40 px-4 py-3 mb-2">
            <span>
              <span className="text-xs uppercase font-semibold text-muted-foreground mr-2">{t.priceOnlineShort}</span>
              <span className="text-xl font-bold text-foreground">{formatLei(online)}</span>
              <span className="text-sm text-muted-foreground"> {t.priceLeiPerMonth}</span>
            </span>
            <span className="text-muted-foreground">·</span>
            <span>
              <span className="text-xs uppercase font-semibold text-muted-foreground mr-2">{t.priceFizicShort}</span>
              <span className="text-xl font-bold text-foreground">{formatLei(fizic)}</span>
              <span className="text-sm text-muted-foreground"> {t.priceLeiPerMonth}</span>
            </span>
          </div>
          <p className="text-xs text-muted-foreground max-w-2xl">{t.priceSurchargeNote}</p>
        </section>

        {/* Body: curriculum + form */}
        <section className="max-w-6xl mx-auto px-6 pb-16">
          <div className="grid lg:grid-cols-5 gap-8">
            {/* Curriculum */}
            <div className="lg:col-span-3">
              <h2 className="text-2xl font-bold text-foreground mb-4">{t.levelPageCurriculumTitle}</h2>

              {/* Flat list (A1, A2, B1, B2) */}
              {curriculum.items && (
                <ol className="grid sm:grid-cols-2 gap-x-6 gap-y-2 rounded-2xl border border-border bg-card p-5">
                  {curriculum.items.map((it, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-foreground">{it}</span>
                    </li>
                  ))}
                </ol>
              )}

              {/* C1: two strands */}
              {curriculum.spokenCore && (
                <div className="space-y-4">
                  <div className="rounded-2xl border border-border bg-card p-5">
                    <h3 className="text-sm font-bold text-foreground mb-3">{curriculum.spokenCore.intro}</h3>
                    <ol className="grid sm:grid-cols-2 gap-x-6 gap-y-2">
                      {curriculum.spokenCore.items.map((it, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                          <span className="text-foreground">{it}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                  {curriculum.writingStrand && (
                    <div className="rounded-2xl border border-primary/30 bg-primary/5 p-5">
                      <h3 className="text-sm font-bold text-foreground mb-3">{curriculum.writingStrand.intro}</h3>
                      <ol className="grid sm:grid-cols-2 gap-x-6 gap-y-2">
                        {curriculum.writingStrand.items.map((it, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                            <span className="text-foreground">{it}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}
                </div>
              )}

              {/* C2: blocks */}
              {curriculum.blocks && (
                <div className="space-y-4">
                  {curriculum.blocks.map((b, i) => (
                    <div key={i} className="rounded-2xl border border-border bg-card p-5">
                      <h3 className="text-sm font-bold text-foreground mb-3">{b.title}</h3>
                      <ul className="space-y-2">
                        {b.items.map((it, j) => (
                          <li key={j} className="flex items-start gap-2 text-sm">
                            <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                            <span className="text-foreground">{it}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}

              {curriculum.note && (
                <p className="mt-4 text-xs text-muted-foreground italic">{curriculum.note}</p>
              )}
            </div>

            {/* Sticky form */}
            <aside id="register" className="lg:col-span-2 scroll-mt-24">
              <div className="lg:sticky lg:top-24">
                <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
                  <h2 className="text-xl font-bold text-foreground mb-1">
                    {available ? t.levelPageRegisterTitle : t.levelPageInPrepTitle}
                  </h2>
                  <p className="text-sm text-muted-foreground mb-4">
                    {available ? t.levelPageRegisterDesc : t.levelPageInPrepDesc}
                  </p>
                  <RegistrationFormSection
                    defaultCourseType="group"
                    defaultLevel={upperLevel}
                    lockSelection
                    embedded
                  />
                </div>
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center justify-center gap-2 w-full px-4 py-2.5 text-sm font-medium rounded-lg border border-border text-foreground hover:bg-muted transition-colors"
                >
                  <MessageCircle className="w-4 h-4 text-primary" /> WhatsApp
                </a>
              </div>
            </aside>
          </div>
        </section>
      </main>

      <Footer />
      <WhatsAppButton />
      <ScrollToTop />
      <CookieConsent />
    </div>
  );
};

export default CursGrupLevel;