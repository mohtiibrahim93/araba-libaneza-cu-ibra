import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ChevronRight, Globe } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import ScrollToTop from "@/components/ScrollToTop";

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
   * The English counterpart this page links to via "English version".
   * Defaults to the general Lebanese course. Pass `null` when there is no
   * real English equivalent (e.g. the Bucharest / kids pages) so we don't
   * send visitors to an unrelated page.
   */
  enHref?: string | null;
  children: React.ReactNode;
}

/**
 * Chrome comun pentru landing-urile SEO românești: meta + canonical,
 * Course & BreadcrumbList (+ FAQPage când există) JSON-LD, breadcrumb
 * vizibil, link către varianta EN și CTA-ul de probă gratuită.
 * Conținutul e doar în română — paginile țintesc căutări românești.
 */
const LandingLayout = ({ slug, title, metaTitle, description, crumb, lead, faq, enHref = "/en/learn-lebanese-arabic", children }: Props) => {
  const url = `${BASE}/${slug}`;

  const courseJsonLd = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: title,
    description,
    inLanguage: "ar",
    url,
    provider: {
      "@type": "Organization",
      name: "Centrul de Arabă Libaneză cu Ibra",
      url: `${BASE}/`,
    },
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
        <link rel="canonical" href={url} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={metaTitle} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={url} />
        <meta property="og:image" content={`${BASE}/og-image.png`} />
        <meta property="og:locale" content="ro_RO" />
        <meta name="twitter:card" content="summary_large_image" />
        <script type="application/ld+json">{JSON.stringify(courseJsonLd)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbJsonLd)}</script>
        {faqJsonLd && <script type="application/ld+json">{JSON.stringify(faqJsonLd)}</script>}
      </Helmet>

      <Navbar />

      <main className="pt-24 pb-16">
        <article className="max-w-3xl mx-auto px-4 md:px-6">
          <nav aria-label="Breadcrumb" className="flex items-center justify-between gap-3 text-sm text-muted-foreground mb-6">
            <span>
              <Link to="/" className="hover:text-primary">Acasă</Link>
              <ChevronRight className="w-3.5 h-3.5 inline mx-1 -mt-0.5" aria-hidden />
              <span className="text-foreground">{crumb}</span>
            </span>
            {enHref ? (
              <Link to={enHref} className="inline-flex items-center gap-1 hover:text-primary whitespace-nowrap">
                <Globe className="w-3.5 h-3.5" aria-hidden />
                English version
              </Link>
            ) : null}
          </nav>

          <header className="mb-10 space-y-4">
            <h1 className="font-display text-3xl md:text-5xl font-bold tracking-tight text-foreground">{title}</h1>
            <p className="text-lg text-muted-foreground">{lead}</p>
          </header>

          <div className="space-y-8 text-foreground/80 leading-relaxed [&_h2]:font-display [&_h2]:text-2xl [&_h2]:md:text-3xl [&_h2]:font-bold [&_h2]:text-foreground [&_h2]:mt-10 [&_h2]:mb-3 [&_p]:leading-relaxed [&_ul]:list-disc [&_ul]:list-inside [&_ul]:space-y-2 [&_a]:text-primary [&_a]:underline">
            {children}

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
          </div>
        </article>
      </main>

      <Footer />
      <WhatsAppButton />
      <ScrollToTop />
    </div>
  );
};

export default LandingLayout;
