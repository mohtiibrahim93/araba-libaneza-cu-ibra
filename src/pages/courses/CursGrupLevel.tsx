import { useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useParams, Navigate, useSearchParams } from "react-router-dom";
import { ChevronRight, MessageCircle, CheckCircle2, BookOpen, Clock, GraduationCap } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import ScrollToTop from "@/components/ScrollToTop";
import RegistrationFormSection from "@/components/RegistrationFormSection";
import NotifyMeForm from "@/components/NotifyMeForm";
import { useI18n } from "@/lib/i18n";
import { getCurriculum } from "@/data/curriculum";
import { ONLINE_PRICES, physicalPrice, formatLei } from "@/lib/pricing";
import type { LevelType } from "@/components/RegistrationForm/types";
import posterA1Fizic from "@/assets/poster-a1-fizic-sep2026.webp";
import posterA1Online from "@/assets/poster-a1-online.webp.asset.json";
import posterA2Fizic from "@/assets/poster-a2-fizic-sep2026.webp";
import { levelTitle } from "@/lib/levelMeta";

// Cohort posters per level — only A1/A2 have announced cohorts.
// `started` marks a cohort that is already running: enrolment is closed, so the
// page collects interest for the next one instead of taking sign-ups, and the
// poster is hidden because it advertises a start date that has passed.
type PosterFormat = "online" | "fizic";
const LEVEL_POSTERS: Partial<
  Record<string, { src: string; alt: string; format: PosterFormat; started?: boolean }[]>
> = {
  a1: [
    { src: posterA1Fizic, alt: "Poster curs A1 de arabă libaneză, fizic la Raduga Creative Center — start miercuri, 2 septembrie 2026 · lecții luni și miercuri, 19:00–20:30, Strada Icoanei 80", format: "fizic" },
    { src: posterA1Online.url, alt: "Poster A1 online — sâmbătă 12:00–13:30 și duminică 17:30–19:00", format: "online", started: true },
  ],
  a2: [
    { src: posterA2Fizic, alt: "Poster curs A2 de arabă libaneză, fizic la Raduga Creative Center — start marți, 1 septembrie 2026 · lecții marți și joi, 19:00–20:30, Strada Icoanei 80", format: "fizic" },
  ],
};

const BASE_URL = "https://centruldearabalibaneza.com";
const WHATSAPP_URL = "https://wa.me/40763124514";
const VALID = ["a1", "a2", "b1", "b2", "c1", "c2"] as const;
const isAvailable = (level: LevelType) => level === "A1" || level === "A2";

const CursGrupLevel = () => {
  const { t, lang } = useI18n();
  const { level } = useParams<{ level: string }>();
  const slug = (level || "").toLowerCase();
  const [searchParams, setSearchParams] = useSearchParams();
  const modeParam = searchParams.get("mod");
  const paramFormat: PosterFormat | null =
    modeParam === "online" || modeParam === "fizic" ? modeParam : null;

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

  // Format toggle: exactly one cohort/poster is shown at a time. Defaults to
  // ?mod= when present, otherwise "fizic" (both A1 and A2 have a fizic cohort).
  const availableFormats: PosterFormat[] = (LEVEL_POSTERS[slug] || []).map((p) => p.format);
  const selectedFormat: PosterFormat =
    paramFormat && availableFormats.includes(paramFormat)
      ? paramFormat
      : availableFormats[0] ?? "fizic";
  // A cohort that has already started cannot be joined, even though the level
  // itself is "available" (A1 still has an open in-person group).
  const cohortStarted = Boolean(
    LEVEL_POSTERS[slug]?.find((p) => p.format === selectedFormat)?.started,
  );
  const canEnrol = available && !cohortStarted;

  const pickFormat = (fmt: PosterFormat) => {
    const next = new URLSearchParams(searchParams);
    next.set("mod", fmt);
    setSearchParams(next, { replace: true });
  };

  const canonical = `${BASE_URL}/cursuri/grup/${slug}`;
  // A1 is the highest-intent SERP entry point ("curs araba incepatori
  // bucuresti"). Give it a keyword-optimised meta title/description; other
  // levels keep the generic pattern.
  const isA1 = slug === "a1";
  // One shared table with the prerender (src/lib/levelMeta.ts). The old inline
  // ladder only special-cased A1, B1 and B2; A2, C1 and C2 fell through to
  // `${curriculum.title} — ${t.courseGrupH1}`, which ran to 76 characters on
  // C2 and disagreed with the title the static head already carried.
  const metaTitle = levelTitle(slug, lang);
  const metaDesc = isA1
    ? (lang === "en"
        ? "Beginner (A1) Lebanese Arabic group course — in person in Bucharest (Strada Icoanei 80) or online. Speak from lesson one. Two 90-min sessions/week. Free trial."
        : "Învață araba libaneză la nivel A1, în București sau online. Vorbești din primele lecții cu profesor nativ. Înscrie-te la o lecție de probă gratuită.")
    : curriculum.objective.slice(0, 155);

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

      <main id="main-content" className="pt-16">
        {/* Breadcrumb */}
        <nav className="w-full max-w-content mx-auto px-gutter pt-6 pb-2 text-xs text-muted-foreground">
          <ol className="flex flex-wrap items-center gap-1">
            <li><Link to="/" className="hover:text-foreground">{t.courseBreadcrumbHome}</Link></li>
            <li aria-hidden><ChevronRight className="w-3.5 h-3.5 inline -mt-0.5" /></li>
            <li><Link to="/cursuri/grup" className="hover:text-foreground">{t.courseGrupH1}</Link></li>
            <li aria-hidden><ChevronRight className="w-3.5 h-3.5 inline -mt-0.5" /></li>
            <li className="text-foreground font-medium" aria-current="page">{upperLevel}</li>
          </ol>
        </nav>

        {/* Hero */}
        <section className="w-full max-w-content mx-auto px-gutter pt-4 pb-8">
          <span className="inline-block text-xs font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full mb-3">
            CEFR {upperLevel}
          </span>
          <h1 className="text-display-xl font-bold tracking-tight text-foreground mb-4">
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
            <div className="mb-6 max-w-2xl">
              <span className="text-xs uppercase font-semibold text-muted-foreground">{t.levelPageScheduleLabel}</span>
              {curriculum.schedule.map((line, i) => (
                <p key={i} className="text-sm text-foreground font-medium mt-1">{line}</p>
              ))}
            </div>
          )}

          {/* Dual price */}
          <div className="inline-flex flex-wrap items-baseline gap-4 rounded-xl border border-border bg-muted/40 px-gutter py-3 mb-2">
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
        <section className="w-full max-w-content mx-auto px-gutter pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Curriculum */}
            <div className="min-w-0 lg:col-span-3">
              {/* Prose above the curriculum. The pages used to be stats plus a
                  bullet list, which reads as provisional for a course of this
                  length — B1 and B2 were the two thinnest pages on the site. */}
              {curriculum.intro && (
                <div className="mb-8 space-y-3 text-foreground/80 leading-relaxed">
                  {curriculum.intro.map((para, i) => (
                    <p key={i} className="text-sm">{para}</p>
                  ))}
                </div>
              )}

              {curriculum.outcomes && (
                <div className="mb-8 rounded-2xl border border-border bg-muted/30 p-5">
                  <h2 className="text-lg font-bold text-foreground mb-3">
                    {t.levelPageOutcomesTitle}
                  </h2>
                  <ul className="space-y-2">
                    {curriculum.outcomes.map((o, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                        <span className="min-w-0 text-foreground">{o}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <h2 className="text-2xl font-bold text-foreground mb-4">{t.levelPageCurriculumTitle}</h2>

              {/* Flat list (A1, A2, B1, B2) */}
              {curriculum.items && (
                <ol className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 rounded-2xl border border-border bg-card p-5">
                  {curriculum.items.map((it, i) => (
                    <li key={i} className="flex min-w-0 items-start gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span className="min-w-0 text-foreground [overflow-wrap:anywhere]">{it}</span>
                    </li>
                  ))}
                </ol>
              )}

              {/* C1: two strands */}
              {curriculum.spokenCore && (
                <div className="space-y-4">
                  <div className="rounded-2xl border border-border bg-card p-5">
                    <h3 className="text-sm font-bold text-foreground mb-3">{curriculum.spokenCore.intro}</h3>
                    <ol className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                      {curriculum.spokenCore.items.map((it, i) => (
                        <li key={i} className="flex min-w-0 items-start gap-2 text-sm">
                          <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                          <span className="min-w-0 text-foreground [overflow-wrap:anywhere]">{it}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                  {curriculum.writingStrand && (
                    <div className="rounded-2xl border border-primary/30 bg-primary/5 p-5">
                      <h3 className="text-sm font-bold text-foreground mb-3">{curriculum.writingStrand.intro}</h3>
                      <ol className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                        {curriculum.writingStrand.items.map((it, i) => (
                          <li key={i} className="flex min-w-0 items-start gap-2 text-sm">
                            <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                            <span className="min-w-0 text-foreground [overflow-wrap:anywhere]">{it}</span>
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
                            <span className="min-w-0 text-foreground [overflow-wrap:anywhere]">{it}</span>
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

              {LEVEL_POSTERS[slug] && availableFormats.length > 0 && (
                <div className="mt-6">
                  <div className="mb-3 inline-flex rounded-full border border-border bg-muted/40 p-1 text-sm">
                    {(["fizic", "online"] as PosterFormat[]).map((fmt) => {
                      const enabled = availableFormats.includes(fmt);
                      const active = selectedFormat === fmt;
                      const label = fmt === "fizic"
                        ? (lang === "en" ? "In person" : "Fizic")
                        : "Online";
                      return (
                        <button
                          key={fmt}
                          type="button"
                          disabled={!enabled}
                          onClick={() => enabled && pickFormat(fmt)}
                          className={`rounded-full px-4 py-1.5 font-semibold transition ${
                            active
                              ? "bg-primary text-primary-foreground"
                              : enabled
                              ? "text-foreground hover:bg-background"
                              : "text-muted-foreground cursor-not-allowed"
                          }`}
                          aria-pressed={active}
                        >
                          {label}
                          {!enabled && (
                            <span className="ml-1 text-xs font-normal">
                              ({lang === "en" ? "soon" : "în curând"})
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                  {(() => {
                    const poster = LEVEL_POSTERS[slug]!.find((p) => p.format === selectedFormat);
                    // A started cohort's poster still advertises its old start
                    // date, so showing it would contradict the notice below.
                    if (!poster || poster.started) return null;
                    return (
                      <img
                        src={poster.src}
                        alt={poster.alt}
                        width={800}
                        height={800}
                        loading="lazy"
                        decoding="async"
                        className="w-full max-w-md rounded-2xl border border-border shadow-sm"
                      />
                    );
                  })()}
                </div>
              )}
            </div>

            {/* Sticky form */}
            <aside id="register" className="lg:col-span-2 scroll-mt-24">
              <div className="lg:sticky lg:top-24">
                <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
                  <h2 className="text-xl font-bold text-foreground mb-1">
                    {cohortStarted
                      ? lang === "en"
                        ? "This group has already started"
                        : "Această grupă a început deja"
                      : available
                        ? t.levelPageRegisterTitle
                        : t.levelPageInPrepTitle}
                  </h2>
                  <p className="text-sm text-muted-foreground mb-4">
                    {cohortStarted
                      ? lang === "en"
                        ? "All 10 seats are taken and the lessons are under way, so it can no longer be joined. Leave your details and we'll email you first when the next online group opens — we start one as soon as enough people are waiting. You can also begin right away with private 1:1 lessons."
                        : "Toate cele 10 locuri sunt ocupate, iar lecțiile sunt deja în desfășurare, așa că nu se mai poate intra în ea. Lasă-ți datele și te anunțăm primul pe email când deschidem următoarea grupă online — pornim una imediat ce sunt suficienți înscriși. Poți începe oricând și cu lecții private 1:1."
                      : available
                        ? t.levelPageRegisterDesc
                        : t.levelPageInPrepDesc}
                  </p>
                  {canEnrol ? (
                    <RegistrationFormSection
                      defaultCourseType="group"
                      defaultLevel={upperLevel}
                      defaultFormat={selectedFormat}
                      lockSelection
                      embedded
                    />
                  ) : (
                    // No joinable cohort — either none is scheduled yet, or this
                    // one has already started. Collect interest instead of
                    // showing a payment plan for a group nobody can join.
                    <NotifyMeForm
                      context={
                        cohortStarted
                          ? `Grupă ${upperLevel} ${selectedFormat} — următoarea serie`
                          : `Grupă ${upperLevel}`
                      }
                      level={upperLevel}
                    />
                  )}
                </div>
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center justify-center gap-2 w-full px-gutter py-2.5 text-sm font-medium rounded-lg border border-border text-foreground hover:bg-muted transition-colors"
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
    </div>
  );
};

export default CursGrupLevel;