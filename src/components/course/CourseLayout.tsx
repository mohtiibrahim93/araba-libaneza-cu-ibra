import { ReactNode } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "@/lib/router-compat";
import { ChevronRight, MessageCircle } from "lucide-react";
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
              <span className="inline-block text-xs font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full mb-4">
                {badge}
              </span>
              <h1 className="text-display-xl font-bold tracking-tight text-foreground mb-4">
                {h1}
              </h1>
              {priceLine && (
                <p className="text-lg font-semibold text-foreground mb-4">{priceLine}</p>
              )}
              <p className="text-base text-muted-foreground leading-relaxed mb-6">{intro}</p>
              <ul className="space-y-2 mb-8">
                {features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                    <span
                      aria-hidden="true"
                      className="mt-1 inline-block w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0"
                    />
                    {f}
                  </li>
                ))}
              </ul>
              <div className="flex flex-wrap gap-3">
                <a
                  href={primaryCtaHref}
                  className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  {primaryCtaLabel}
                </a>
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold rounded-lg border border-border text-foreground hover:bg-muted transition-colors"
                >
                  <MessageCircle className="w-4 h-4 text-primary" />
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
                className="w-full h-64 sm:h-80 lg:h-96 object-cover rounded-2xl border border-border shadow-xs"
              />
            </div>
          </div>
        </section>

        {/* Page body */}
        <div className="w-full max-w-content mx-auto px-gutter pb-16">{children}</div>

        {/* Other courses */}
        <section className="bg-muted/50 border-t border-border">
          <div className="w-full max-w-content mx-auto px-gutter py-12">
            <h2 className="text-xl font-bold text-foreground mb-4">{t.courseOtherCoursesTitle}</h2>
            <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {otherCourses.map((c) => (
                <li key={c.to}>
                  <Link
                    to={c.to}
                    className="block rounded-xl border border-border bg-background px-4 py-3 text-sm font-medium text-foreground hover:border-primary/50 hover:bg-muted transition-colors"
                  >
                    {c.label}
                    <ChevronRight className="w-4 h-4 inline ml-1 -mt-0.5 text-muted-foreground" />
                  </Link>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-sm">
              <Link to="/cursuri" className="text-primary font-medium hover:underline underline-offset-4">
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