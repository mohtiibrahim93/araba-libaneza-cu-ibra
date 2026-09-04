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
  slug: string; // fără slash-ul inițial
  title: string;
  metaTitle: string;
  description: string;
  crumb: string;
  lead: string;
  faq?: Faq[];
  /**
   * Root-relative EN counterpart of this page. Drives the hreflang cluster, so
   * it must name a *true* equivalent whose own `roHref` points back here —
   * hreflang has to be 1:1 and reciprocal, and the build fails the check in
   * scripts/seoPrerender.ts if it isn't. Defaults to null (no cluster).
   *
   * The previous default made every page that forgot to set it claim
   * /en/learn-lebanese-arabic, which put six Romanian pages on the same
   * alternate and invalidated the whole cluster. Pages with no English twin
   * still get a nearest relative from the language toggle via
   * src/lib/languageRoutes.ts, which is deliberately looser than this.
   */
  enHref?: string | null;
  /**
   * Root-relative German counterpart, for the one page that has one. Passing it
   * closes the three-language cluster in src/lib/hreflangCluster.ts.
   */
  deHref?: string | null;
  /**
   * Delivery modes and workload for the Course JSON-LD, when the page really is
   * a course. Most LandingLayout pages are guides, so this is opt-in: claiming
   * an in-person schedule for /dialecte-arabe would be false.
   */
  courseInstances?: Record<string, unknown>[];
  /**
   * Canonical override (root-relative). Use when this page is a near-duplicate
   * that should consolidate into another URL — e.g. /cursuri-araba points its
   * canonical at /cursuri-limba-araba. Defaults to self.
   */
  canonicalHref?: string;
  children: React.ReactNode;
}

/**
 * Chrome comun pentru landing-urile SEO românești: meta + canonical,
 * Course & BreadcrumbList (+ FAQPage când există) JSON-LD, breadcrumb
 * vizibil, hreflang către varianta EN (când există) și CTA-ul de probă gratuită.
 * Conținutul e doar în română — paginile țintesc căutări românești.
 */
const LandingLayout = ({ slug, title: titleProp, metaTitle: metaTitleProp, description: descriptionProp, crumb, lead: leadProp, faq: faqProp, enHref = null, deHref = null, courseInstances, canonicalHref, children }: Props) => {
  const url = `${BASE}/${slug}`;
  // Scoped so the outline lists this page\'s own sections.
  const bodyRef = useRef<HTMLDivElement>(null);
  const canonical = canonicalHref ? `${BASE}${canonicalHref}` : url;

  // hreflang is announced only for a real reciprocal twin, and never from a
  // page that canonicalises elsewhere — a non-canonical URL must not head its
  // own language cluster. RO is x-default: it is the site's primary language.
  const hreflang = Boolean(enHref) && !canonicalHref;

  // Owner-edited version of this page (admin → "Pagini"). Anything left empty
  // falls back to the code-shipped content.
  const override = usePageContent(`/${slug}`);
  const title = override?.h1?.trim() || titleProp;
  const metaTitle = override?.meta_title?.trim() || metaTitleProp;
  const description = override?.meta_description?.trim() || descriptionProp;
  const lead = override?.lead?.trim() || leadProp;
  const faq = override?.faq?.length ? override.faq : faqProp;
  const bodyMd = override?.body_md?.trim() || "";

  const courseJsonLd = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: title,
    description,
    inLanguage: "ro",
    url,
    provider: {
      "@type": "Organization",
      name: "Centrul de Arabă Libaneză cu Ibra",
      url: `${BASE}/`,
    },
    // Google reads delivery mode and workload from hasCourseInstance, not from
    // Course itself — see src/lib/courseSchema.ts.
    ...(courseInstances?.length ? { hasCourseInstance: courseInstances } : {}),
  };
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Acasă", item: `${BASE}/` },
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
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{metaTitle}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={canonical} />
        {hreflang ? <link rel="alternate" hrefLang="ro" href={url} /> : null}
        {hreflang ? <link rel="alternate" hrefLang="en" href={`${BASE}${enHref}`} /> : null}
        {/* Only /cursuri-araba has a German sibling. A cluster is honoured only
            when every member names every other, so this closes the group. */}
        {hreflang && deHref ? <link rel="alternate" hrefLang="de" href={`${BASE}${deHref}`} /> : null}
        {hreflang ? <link rel="alternate" hrefLang="x-default" href={url} /> : null}
        <meta property="og:type" content="website" />
        <meta property="og:title" content={metaTitle} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={canonical} />
        <meta property="og:image" content={`${BASE}/og-image.png`} />
        <meta property="og:locale" content="ro_RO" />
        <meta name="twitter:card" content="summary_large_image" />
        <script type="application/ld+json">{JSON.stringify(courseJsonLd)}</script>
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
              <Link to="/" className="hover:text-primary">Acasă</Link>
              <ChevronRight className="w-3.5 h-3.5 inline mx-1 -mt-0.5" aria-hidden />
              <span className="text-foreground">{crumb}</span>
            </span>
          </nav>

          <header className="mb-10 space-y-4">
            <h1 className="font-display text-display-xl font-bold tracking-tight text-foreground">{title}</h1>
            <p className="text-lg text-muted-foreground">{lead}</p>
          </header>

          <div ref={bodyRef}>
          <div className="space-y-8 text-foreground/80 leading-relaxed [&_h2]:font-display [&_h2]:text-2xl [&_h2]:md:text-3xl [&_h2]:font-bold [&_h2]:text-foreground [&_h2]:mt-10 [&_h2]:mb-3 [&_p]:leading-relaxed [&_ul]:list-disc [&_ul]:list-inside [&_ul]:space-y-2 [&_a:not([data-cta])]:text-primary [&_a:not([data-cta])]:underline">
            {bodyMd ? <MarkdownBody markdown={bodyMd} /> : children}

            {faq?.length ? (
              <section>
                <h2>Întrebări frecvente</h2>
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
              Începe cu o lecție de probă gratuită
            </h2>
            <p className="text-muted-foreground">
              30 de minute cu profesor nativ — online sau fizic în București. Fără nicio obligație.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/trial"
                className="inline-block bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition"
              >
                Rezervă proba gratuită
              </Link>
              <Link
                to="/quiz"
                className="inline-block border border-border px-6 py-3 rounded-lg font-semibold text-foreground hover:bg-muted transition"
              >
                Fă testul de nivel (2 min)
              </Link>
            </div>
            {/* Cross-links to the two priority pages — skipped on those pages
                themselves, where they would be links to the current URL. */}
            <p className="text-sm text-muted-foreground">
              {slug !== "meditatii-araba" && (
                <>
                  Preferi un program flexibil? Vezi{" "}
                  <Link to="/meditatii-araba" className="font-medium text-primary underline">
                    meditațiile de arabă 1:1
                  </Link>
                  .{" "}
                </>
              )}
              {slug !== "cursuri-araba-bucuresti" && (
                <>
                  Cauți cursuri fizice? Descoperă{" "}
                  <Link to="/cursuri-araba-bucuresti" className="font-medium text-primary underline">
                    cursurile de arabă în București
                  </Link>
                  .
                </>
              )}
            </p>
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

export default LandingLayout;
