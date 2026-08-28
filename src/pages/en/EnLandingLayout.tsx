import { useRef } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import ScrollToTop from "@/components/ScrollToTop";
import MarkdownBody from "@/components/blog/MarkdownBody";
import { usePageContent } from "@/hooks/usePageContent";
import ArticleOutline from "@/components/blog/ArticleOutline";

const BASE = "https://centruldearabalibaneza.com";

interface Faq {
  q: string;
  a: string;
}

interface Props {
  slug: string; // path after /en/, no leading slash
  title: string;
  metaTitle: string;
  description: string;
  crumb: string;
  lead: string;
  faq?: Faq[];
  courseSchema?: boolean;
  /**
   * Root-relative RO counterpart of this page. Drives the hreflang cluster, so
   * it must name a *true* equivalent whose own `enHref` points back here —
   * hreflang has to be 1:1 and reciprocal. Defaults to null (no cluster) when
   * the page has no Romanian twin; the language toggle still finds a nearest
   * relative through src/lib/languageRoutes.ts, which is deliberately looser.
   */
  roHref?: string | null;
  children: React.ReactNode;
}

/**
 * Shared chrome for the English SEO landing pages. Mirrors the Romanian
 * LandingLayout: per-route Helmet head, Course/Breadcrumb/FAQ JSON-LD,
 * visible breadcrumb, cross-language link, and the free-trial CTA.
 */
const EnLandingLayout = ({
  slug,
  title: titleProp,
  metaTitle: metaTitleProp,
  description: descriptionProp,
  crumb,
  lead: leadProp,
  faq: faqProp,
  courseSchema = true,
  roHref = null,
  children,
}: Props) => {
  const url = `${BASE}/en/${slug}`;
  // Scoped so the outline lists this page\'s own sections.
  const bodyRef = useRef<HTMLDivElement>(null);
  const roAlt = roHref ? `${BASE}${roHref}` : null;

  // Owner-edited version of this page (admin -> "Pagini"); empty fields fall
  // back to the code-shipped content.
  const override = usePageContent(`/en/${slug}`);
  const title = override?.h1?.trim() || titleProp;
  const metaTitle = override?.meta_title?.trim() || metaTitleProp;
  const description = override?.meta_description?.trim() || descriptionProp;
  const lead = override?.lead?.trim() || leadProp;
  const faq = override?.faq?.length ? override.faq : faqProp;
  const bodyMd = override?.body_md?.trim() || "";

  const courseJsonLd = courseSchema
    ? {
        "@context": "https://schema.org",
        "@type": "Course",
        name: title,
        description,
        inLanguage: "en",
        url,
        provider: {
          "@type": "Organization",
          name: "Centrul de Arabă Libaneză cu Ibra",
          url: `${BASE}/`,
        },
      }
    : null;

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${BASE}/` },
      { "@type": "ListItem", position: 2, name: crumb, item: url },
    ],
  };
  const faqJsonLd = faq?.length
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faq.map(({ q, a }) => ({
          "@type": "Question",
          name: q,
          acceptedAnswer: { "@type": "Answer", text: a },
        })),
      }
    : null;

  return (
    <div className="min-h-screen bg-background" lang="en">
      <Helmet>
        <html lang="en" />
        <title>{metaTitle}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={url} />
        {roAlt ? <link rel="alternate" hrefLang="ro" href={roAlt} /> : null}
        {roAlt ? <link rel="alternate" hrefLang="en" href={url} /> : null}
        {roAlt ? <link rel="alternate" hrefLang="x-default" href={roAlt} /> : null}
        <meta property="og:type" content="website" />
        <meta property="og:title" content={metaTitle} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={url} />
        <meta property="og:image" content={`${BASE}/og-image.png`} />
        <meta property="og:locale" content="en_US" />
        <meta property="og:locale:alternate" content="ro_RO" />
        <meta name="twitter:card" content="summary_large_image" />
        {courseJsonLd && <script type="application/ld+json">{JSON.stringify(courseJsonLd)}</script>}
        <script type="application/ld+json">{JSON.stringify(breadcrumbJsonLd)}</script>
        {faqJsonLd && <script type="application/ld+json">{JSON.stringify(faqJsonLd)}</script>}
      </Helmet>

      <Navbar />

      <main id="main-content" className="pt-24 pb-16">
        <div className="mx-auto flex w-full max-w-content justify-center gap-10 px-gutter">
          <aside className="hidden lg:block lg:w-52 lg:shrink-0">
            <ArticleOutline containerRef={bodyRef} />
          </aside>
          <article className="min-w-0 w-full max-w-3xl lg:max-w-4xl 2xl:max-w-5xl">
          <nav aria-label="Breadcrumb" className="flex items-center justify-between gap-3 text-sm text-muted-foreground mb-6">
            <span>
              <Link to="/" className="hover:text-primary">Home</Link>
              <ChevronRight className="w-3.5 h-3.5 inline mx-1 -mt-0.5" aria-hidden />
              <span className="text-foreground">{crumb}</span>
            </span>
          </nav>

          <header className="mb-10 space-y-4">
            <h1 className="font-display text-display-xl font-bold tracking-tight text-foreground">{title}</h1>
            <p className="text-lg text-muted-foreground">{lead}</p>
          </header>

          <div ref={bodyRef}>
          <div className="space-y-8 text-foreground/80 leading-relaxed [&_h2]:font-display [&_h2]:text-2xl [&_h2]:md:text-3xl [&_h2]:font-bold [&_h2]:text-foreground [&_h2]:mt-10 [&_h2]:mb-3 [&_h3]:font-semibold [&_h3]:text-foreground [&_h3]:text-lg [&_h3]:mt-6 [&_h3]:mb-2 [&_p]:leading-relaxed [&_ul]:list-disc [&_ul]:list-inside [&_ul]:space-y-2 [&_a]:text-primary [&_a]:underline">
            {bodyMd ? <MarkdownBody markdown={bodyMd} /> : children}

            {faq?.length ? (
              <section>
                <h2>Frequently asked questions</h2>
                <div className="space-y-4 mt-4">
                  {faq.map(({ q, a }) => (
                    <div key={q} className="rounded-lg border border-border bg-muted/30 p-4">
                      <h3 className="font-semibold text-foreground">{q}</h3>
                      <p className="text-sm mt-1">{a}</p>
                    </div>
                  ))}
                </div>
              </section>
            ) : null}
          </div>

          </div>


          <div className="mt-16 rounded-xl border border-border bg-primary/5 p-6 md:p-8 text-center space-y-4">
            <h2 className="font-display text-2xl font-bold text-foreground">
              Start with a free trial lesson
            </h2>
            <p className="text-muted-foreground">
              30 minutes with a native teacher — online worldwide or in person in Bucharest. No obligation.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/trial"
                className="inline-block bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition"
              >
                Book a free trial
              </Link>
              <Link
                to="/en/learn-lebanese-arabic"
                className="inline-block border border-border px-6 py-3 rounded-lg font-semibold text-foreground hover:bg-muted transition"
              >
                See the Lebanese course
              </Link>
            </div>
          </div>
          </article>
        </div>
      </main>

      <Footer />
      <WhatsAppButton />
      <ScrollToTop />
    </div>
  );
};

export default EnLandingLayout;