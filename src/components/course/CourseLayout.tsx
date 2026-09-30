import { ReactNode } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "@/lib/router-compat";
import { ChevronRight, MessageCircle, Check } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import ScrollToTop from "@/components/ScrollToTop";
import { useI18n } from "@/lib/i18n";
import { canonicalPath } from "@/lib/languageRoutes";
import { seoMeta } from "@/lib/seoHead";
import { ORGANIZATION_SAME_AS } from "@/lib/courseSchema";

const BASE_URL = "https://centruldearabalibaneza.com";
const WHATSAPP_URL = "https://wa.me/40763124514";

export interface OtherCourse {
  to: string;
  label: string;
}

interface CourseLayoutProps {
  /** Path of the page, e.g. "/cursuri/grup" — used for canonical & og:url. */
  path: string;
  metaTitle: string;
  metaDescription: string;
  /** Schema.org Course payload (without @context/@type — provided here). */
  courseSchema: Record<string, unknown>;
  /** Hero image (already imported by the page). */
  heroImage: string;
  heroImageAlt: string;
  badge: string;
  /** Visible H1 of the page. */
  h1: string;
  intro: string;
  /** Short price tagline shown under the H1, e.g. "de la 500 LEI / lună". */
  priceLine?: string;
  features: string[];
  /** Primary CTA — usually scrolls to the embedded form. */
  primaryCtaLabel: string;
  primaryCtaHref: string;
  /** Cross-links to the other course pages. */
  otherCourses: OtherCourse[];
  children: ReactNode;
}

const CourseLayout = ({
  path,
  metaTitle,
  metaDescription,
  courseSchema,
  heroImage,
  heroImageAlt,
  badge,
  h1,
  intro,
  priceLine,
  features,
  primaryCtaLabel,
  primaryCtaHref,
  otherCourses,
  children,
}: CourseLayoutProps) => {
  const { t, lang } = useI18n();
  // Self-canonical per language: the English course pages render from this
  // same component at /en/courses/*, and pointing them at the Romanian path
  // asked Google to drop them.
  const canonical = `${BASE_URL}${canonicalPath(path, lang)}`;
  // The head comes from the route table in src/lib/seoHead.ts, which is what
  // the route's head() serves and what meta-length.test.ts keeps inside the
  // truncation limits. The props carried a second set of strings, and on the
  // four English course URLs the two had drifted apart.
  const routeMeta = seoMeta(canonicalPath(path, lang));
  const resolvedMetaTitle = routeMeta?.title ?? metaTitle;
  const resolvedMetaDescription = routeMeta?.description ?? metaDescription;
  // The route already put that head in the HTML, so this component adds it only
  // for a page the table does not know. Rendering it either way is what left
  // every page with two titles and two descriptions.
  const served = Boolean(routeMeta);

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: t.courseBreadcrumbHome, item: `${BASE_URL}/` },
      { "@type": "ListItem", position: 2, name: t.courseBreadcrumbCourses, item: `${BASE_URL}/cursuri` },
      { "@type": "ListItem", position: 3, name: h1, item: canonical },
    ],
  };

  const fullCourseSchema = {
    "@context": "https://schema.org",
    "@type": "Course",
    url: canonical,
    inLanguage: lang === "en" ? "en" : "ro",
    name: h1,
    description: metaDescription,
    provider: {
      "@type": "Organization",
      name: "Centrul de Arabă Libaneză cu Ibra",
      url: `${BASE_URL}/`,
      sameAs: ORGANIZATION_SAME_AS,
    },
    ...courseSchema,
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        {!served ? <title>{resolvedMetaTitle}</title> : null}
        {!served ? <meta name="description" content={resolvedMetaDescription} /> : null}
        {!served ? <link rel="canonical" href={canonical} /> : null}
        {!served ? <meta property="og:title" content={resolvedMetaTitle} /> : null}
        {!served ? <meta property="og:description" content={resolvedMetaDescription} /> : null}
        {!served ? <meta property="og:url" content={canonical} /> : null}
        {/* No hreflang here on purpose. These four course pages exist only in
            Romanian — the /en/ pages are separate landing pages, not
            translations of them. Announcing ro, en and x-default all pointing
            at this same Romanian URL told Google the page was its own English
            version, which the crawl flagged as "One page is linked for more
            than one language" on /cursuri/grup, /cursuri/copii and
            /cursuri/private. LandingLayout already follows the rule that
            hreflang is announced only for a real reciprocal twin. */}
        <script type="application/ld+json">{JSON.stringify(fullCourseSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbJsonLd)}</script>
      </Helmet>
      <Navbar />

      <main id="main-content" className="pt-16">
        {/* Breadcrumb */}
        <nav
          aria-label={t.courseBreadcrumbCourses}
          className="w-full max-w-content mx-auto px-gutter pt-3 pb-2 text-xs text-muted-foreground"
        >
          <ol className="flex flex-wrap items-center gap-1">
            <li>
              <Link to="/" className="hover:text-foreground transition-colors">
                {t.courseBreadcrumbHome}
              </Link>
            </li>
            <li aria-hidden="true">
              <ChevronRight className="w-3.5 h-3.5 inline -mt-0.5" />
            </li>
            <li>
              <Link to="/cursuri" className="hover:text-foreground transition-colors">
                {t.courseBreadcrumbCourses}
              </Link>
            </li>
            <li aria-hidden="true">
              <ChevronRight className="w-3.5 h-3.5 inline -mt-0.5" />
            </li>
            <li className="text-foreground font-medium" aria-current="page">
              {h1}
            </li>
          </ol>
        </nav>

        {/* Hero */}
        <section className="w-full max-w-content mx-auto px-gutter pt-4 pb-12">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div>
              {/* Label and heading in the homepage's style, so the course
                  pages read as the same site. */}
              <span className="mb-2 block text-sm font-bold uppercase tracking-[0.1em] text-foreground">
                {badge}
              </span>
              <h1 className="font-display text-display-xl font-bold tracking-tight text-foreground mb-4">
                {h1}
              </h1>
              {priceLine && (
                <p className="text-lg font-semibold text-foreground mb-4">{priceLine}</p>
              )}
              <p className="text-lg text-muted-foreground leading-relaxed mb-6">{intro}</p>
              <ul className="space-y-2 mb-8">
                {features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-[15px] text-foreground">
                    <span
                      aria-hidden="true"
                      className="mt-0.5 inline-flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-brand-green/10 text-brand-green"
                    >
                      <Check className="h-3 w-3" />
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
              <div className="flex flex-wrap gap-3">
                <a
                  href={primaryCtaHref}
                  className="inline-flex h-12 items-center gap-2 px-6 font-semibold bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors"
                >
                  {primaryCtaLabel}
                </a>
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-12 items-center gap-2 px-6 font-semibold rounded-xl border border-[#E7E1D6] bg-card text-foreground hover:bg-cream transition-colors dark:border-border"
                >
                  <MessageCircle className="w-4 h-4 text-[#25D366]" />
                  WhatsApp
                </a>
              </div>
            </div>
            <div className="order-first lg:order-last">
              <img
                src={heroImage}
                alt={heroImageAlt}
                width={1200}
                height={800}
                loading="eager"
                className="w-full h-64 sm:h-80 lg:h-[26rem] object-cover rounded-3xl"
              />
            </div>
          </div>
        </section>

        {/* Page body */}
        <div className="w-full max-w-content mx-auto px-gutter pb-16">{children}</div>

        {/* Other courses */}
        <section className="bg-cream">
          <div className="w-full max-w-content mx-auto px-gutter py-section">
            <h2 className="font-display text-2xl font-bold text-foreground mb-5">{t.courseOtherCoursesTitle}</h2>
            <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {otherCourses.map((c) => (
                <li key={c.to}>
                  <Link
                    to={c.to}
                    className="flex items-center justify-between rounded-2xl border border-[#E7E1D6] bg-card px-5 py-4 font-semibold text-foreground hover:border-brand-green/50 transition-colors dark:border-border"
                  >
                    {c.label}
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </Link>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-sm">
              <Link to="/cursuri" className="text-brand-green font-semibold hover:underline underline-offset-4">
                {t.courseSeeAllPrograms}
              </Link>
            </p>
          </div>
        </section>
      </main>

      <Footer />
      <WhatsAppButton />
      <ScrollToTop />
    </div>
  );
};

export default CourseLayout;