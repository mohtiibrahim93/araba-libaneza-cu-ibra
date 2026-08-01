import { Helmet } from "react-helmet-async";
import { Link, useParams } from "react-router-dom";
import { ChevronRight, CalendarDays, Clock, Users, MapPin, Wifi, Loader2, GraduationCap } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import ScrollToTop from "@/components/ScrollToTop";
import RegistrationFormSection from "@/components/RegistrationFormSection";
import { useCourseBySlug } from "@/hooks/useCourses";
import { useI18n } from "@/lib/i18n";
import { courseStatusBadge, courseTitle, MODALITY_LABELS, type CourseContent } from "@/lib/courses";
import { courseFallback } from "@/lib/courseFallback";
import type { FormatType, LevelType } from "@/components/RegistrationForm/types";

const BASE_URL = "https://centruldearabalibaneza.com";
const WHATSAPP_URL = "https://wa.me/40763124514";

const fmtDate = (iso: string | null, lang: "ro" | "en") => {
  if (!iso) return null;
  try {
    return new Date(iso + "T00:00:00").toLocaleDateString(lang === "en" ? "en-GB" : "ro-RO", { day: "numeric", month: "long", year: "numeric" });
  } catch {
    return iso;
  }
};

const CourseDetail = () => {
  const { slug } = useParams();
  const { lang } = useI18n();
  const { course, loading } = useCourseBySlug(slug);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex min-h-[60vh] items-center justify-center gap-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" /> {lang === "en" ? "Loading…" : "Se încarcă…"}
        </div>
        <Footer />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main id="main-content" className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-6 text-center">
          <h2 className="mb-2 text-2xl font-bold text-foreground">{lang === "en" ? "Course not found" : "Cursul nu a fost găsit"}</h2>
          <p className="mb-6 text-muted-foreground">{lang === "en" ? "This course may have ended or moved." : "Cursul poate fi încheiat sau mutat."}</p>
          <Link to="/cursuri" className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90">{lang === "en" ? "Browse all courses" : "Vezi toate cursurile"}</Link>
        </main>
        <Footer />
      </div>
    );
  }

  const c = course;
  const content: CourseContent = c.content ?? {};
  // Fall back to the per-level curriculum (src/data/curriculum.ts) when the
  // course row hasn't been filled in yet, so nothing renders empty.
  const fb = courseFallback(c.level, lang);
  const title = (lang === "en" ? c.title_en : c.title_ro) || fb.title || courseTitle(c, lang);
  const badge = courseStatusBadge(c.status, c.seatsLeft);
  const url = `${BASE_URL}/cursuri/curs/${c.slug}`;
  const sessionN = c.session_count ?? fb.sessionCount;
  const hoursN = c.total_hours ?? fb.totalHours;
  const cf = (base: string): string | undefined => {
    const en = (content as Record<string, unknown>)[`${base}_en`] as string | undefined;
    const ro = (content as Record<string, unknown>)[`${base}_ro`] as string | undefined;
    const db = lang === "en" ? en || ro : ro;
    if (db) return db;
    if (base === "objectives") return fb.objective;
    if (base === "curriculum") return fb.curriculum;
    return undefined;
  };
  const desc = cf("short") || cf("long") || `${title} — ${lang === "en" ? "Lebanese Arabic course" : "curs de arabă libaneză"}.`;

  const facts: { icon: typeof CalendarDays; label: string; value: string | null }[] = [
    { icon: c.format === "online" ? Wifi : MapPin, label: lang === "en" ? "Format" : "Format", value: c.format ? MODALITY_LABELS[c.format][lang === "en" ? "en" : "ro"] : null },
    { icon: GraduationCap, label: lang === "en" ? "Level" : "Nivel", value: c.level ? c.level.toUpperCase() : null },
    { icon: CalendarDays, label: lang === "en" ? "Starts" : "Începe", value: fmtDate(c.start_date, lang) },
    { icon: CalendarDays, label: lang === "en" ? "Ends" : "Se termină", value: fmtDate(c.end_date, lang) },
    { icon: Clock, label: lang === "en" ? "Schedule" : "Program", value: lang === "en" ? c.schedule_label_en : c.schedule_label_ro },
    { icon: Clock, label: lang === "en" ? "Sessions" : "Ședințe", value: sessionN ? `${sessionN}${hoursN ? ` · ${hoursN}h` : ""}` : null },
    { icon: Users, label: lang === "en" ? "Seats" : "Locuri", value: c.full ? (lang === "en" ? "Waitlist" : "Listă de așteptare") : `${c.seatsLeft ?? c.max_seats} ${lang === "en" ? "left" : "libere"}` },
  ];

  const PROSE: { base: string; label: { ro: string; en: string } }[] = [
    { base: "long", label: { ro: "Despre curs", en: "About the course" } },
    { base: "audience", label: { ro: "Pentru cine este", en: "Who it's for" } },
    { base: "prerequisites", label: { ro: "Cerințe", en: "Prerequisites" } },
    { base: "objectives", label: { ro: "Ce vei putea face", en: "What you'll be able to do" } },
    { base: "curriculum", label: { ro: "Curriculum", en: "Curriculum" } },
    { base: "method", label: { ro: "Metoda de predare", en: "Teaching method" } },
    { base: "materials", label: { ro: "Materiale incluse", en: "Materials included" } },
    { base: "teacher", label: { ro: "Profesor", en: "Teacher" } },
    { base: "policies", label: { ro: "Politici", en: "Policies" } },
    { base: "payment", label: { ro: "Plată", en: "Payment" } },
  ];

  const faq = (content.faq ?? []).map((f) => ({
    q: lang === "en" ? f.q_en || f.q_ro : f.q_ro,
    a: lang === "en" ? f.a_en || f.a_ro : f.a_ro,
  })).filter((f) => f.q && f.a);

  // Keep the rendered <title> under the ~60-char SERP limit: add the brand
  // suffix only when it still fits, otherwise ship the bare course title.
  const SUFFIX = " | Ibra";
  const metaTitle =
    title.length + SUFFIX.length <= 60 ? `${title}${SUFFIX}` : title.slice(0, 60);

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{metaTitle}</title>
        <meta name="description" content={desc} />
        <link rel="canonical" href={url} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={desc} />
        <meta property="og:url" content={url} />
      </Helmet>
      <Navbar />

      <main id="main-content" className="pt-16">
        <div className="mx-auto max-w-5xl px-6">
          <nav aria-label="Breadcrumb" className="pt-6 pb-2 text-xs text-muted-foreground">
            <ol className="flex flex-wrap items-center gap-1">
              <li><Link to="/" className="hover:text-foreground">{lang === "en" ? "Home" : "Acasă"}</Link></li>
              <li aria-hidden><ChevronRight className="w-3.5 h-3.5 inline -mt-0.5" /></li>
              <li><Link to="/cursuri" className="hover:text-foreground">{lang === "en" ? "Courses" : "Cursuri"}</Link></li>
              <li aria-hidden><ChevronRight className="w-3.5 h-3.5 inline -mt-0.5" /></li>
              <li className="text-foreground font-medium" aria-current="page">{title}</li>
            </ol>
          </nav>

          <header className="mb-6">
            <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${badge.tone === "open" ? "bg-emerald-500/10 text-emerald-600" : "bg-muted text-muted-foreground"}`}>
              {lang === "en" ? badge.en : badge.ro}
            </span>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">{title}</h1>
            {cf("short") && <p className="mt-3 max-w-2xl text-lg text-muted-foreground">{cf("short")}</p>}
          </header>

          {/* Facts + price */}
          <div className="mb-8 grid gap-4 lg:grid-cols-[1fr_280px]">
            <dl className="grid gap-3 rounded-2xl border border-border bg-card p-5 sm:grid-cols-2">
              {facts.filter((f) => f.value).map((f) => (
                <div key={f.label} className="flex items-start gap-2">
                  <f.icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-muted-foreground">{f.label}</dt>
                    <dd className="text-sm font-medium text-foreground">{f.value}</dd>
                  </div>
                </div>
              ))}
            </dl>
            <div className="flex flex-col justify-center rounded-2xl border border-border bg-primary/5 p-5 text-center">
              {c.price_lei != null && <p className="text-3xl font-bold text-foreground">{c.price_lei} <span className="text-base font-medium text-muted-foreground">LEI</span></p>}
              {cf("payment") && <p className="mt-1 text-xs text-muted-foreground">{cf("payment")}</p>}
              <a href="#inscriere" className="mt-4 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90">{lang === "en" ? "Enroll" : "Înscrie-te"}</a>
            </div>
          </div>

          {/* Prose sections */}
          <div className="space-y-8 [&_p]:leading-relaxed">
            {PROSE.map(({ base, label }) => {
              const val = cf(base);
              if (!val) return null;
              return (
                <section key={base}>
                  <h2 className="mb-2 text-xl font-bold text-foreground">{lang === "en" ? label.en : label.ro}</h2>
                  <p className="whitespace-pre-line text-foreground/80">{val}</p>
                </section>
              );
            })}

            {faq.length > 0 && (
              <section>
                <h2 className="mb-3 text-xl font-bold text-foreground">{lang === "en" ? "FAQ" : "Întrebări frecvente"}</h2>
                <div className="space-y-3">
                  {faq.map((f, i) => (
                    <div key={i} className="rounded-lg border border-border bg-muted/30 p-4">
                      <h3 className="font-semibold text-foreground">{f.q}</h3>
                      <p className="mt-1 whitespace-pre-line text-sm text-foreground/80">{f.a}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Enroll */}
          <section id="inscriere" className="my-12 scroll-mt-20 rounded-2xl border border-border bg-card p-5 sm:p-8">
            <h2 className="mb-1 text-2xl font-bold text-foreground">{lang === "en" ? "Enroll in this course" : "Înscrie-te la acest curs"}</h2>
            <p className="mb-4 text-sm text-muted-foreground">{lang === "en" ? "Your course is pre-selected below." : "Cursul e deja preselectat mai jos."}</p>
            <RegistrationFormSection
              defaultCourseType="group"
              defaultLevel={(c.level?.toUpperCase() as LevelType) ?? undefined}
              defaultFormat={(c.format as FormatType) ?? undefined}
              lockSelection
              embedded
            />
            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted">WhatsApp</a>
          </section>
        </div>
      </main>

      <Footer />
      <WhatsAppButton />
      <ScrollToTop />
    </div>
  );
};

export default CourseDetail;
