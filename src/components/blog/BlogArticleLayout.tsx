import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import ScrollToTop from "@/components/ScrollToTop";
import RelatedPosts from "@/components/blog/RelatedPosts";

const BASE = "https://centruldearabalibaneza.com";

interface Props {
  slug: string;
  title: string;
  description: string;
  published: string; // ISO
  readingMinutes: number;
  /** Short crumb label (falls back to title). */
  crumb?: string;
  /** Lead paragraph under the H1. */
  lead: string;
  children: React.ReactNode;
  /** CTA at the bottom; defaults to the trial. */
  ctaTitle?: string;
  ctaText?: string;
  ctaHref?: string;
  ctaLabel?: string;
}

/**
 * Shared chrome for blog articles: SEO meta + Article JSON-LD + breadcrumb +
 * a bottom CTA. Keeps each article file to just its content.
 */
const BlogArticleLayout = ({
  slug,
  title,
  description,
  published,
  readingMinutes,
  crumb,
  lead,
  children,
  ctaTitle = "Gata să începi să vorbești araba libaneză?",
  ctaText = "O lecție de probă gratuită cu profesor nativ — online sau fizic în București.",
  ctaHref = "/trial",
  ctaLabel = "Rezervă o lecție de probă gratuită",
}: Props) => {
  const url = `${BASE}/blog/${slug}`;
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    datePublished: published,
    dateModified: published,
    inLanguage: "ro",
    mainEntityOfPage: url,
    image: `${BASE}/og-image.png`,
    author: { "@type": "Person", name: "Ibra — Centrul de Arabă Libaneză" },
    publisher: {
      "@type": "Organization",
      name: "Centrul de Arabă Libaneză cu Ibra",
      url: `${BASE}/`,
      logo: { "@type": "ImageObject", url: `${BASE}/favicon.png` },
    },
  };
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Acasă", item: `${BASE}/` },
      { "@type": "ListItem", position: 2, name: "Blog", item: `${BASE}/blog` },
      { "@type": "ListItem", position: 3, name: crumb ?? title, item: url },
    ],
  };
  const dateLabel = new Date(published).toLocaleDateString("ro-RO", {
    day: "numeric", month: "long", year: "numeric",
  });

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={url} />
        <meta property="og:type" content="article" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={url} />
        <meta property="og:image" content={`${BASE}/og-image.png`} />
        <meta property="og:locale" content="ro_RO" />
        <meta property="article:published_time" content={published} />
        <meta property="article:author" content="Ibra — Centrul de Arabă Libaneză" />
        <meta name="twitter:card" content="summary_large_image" />
        <script type="application/ld+json">{JSON.stringify(articleJsonLd)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbJsonLd)}</script>
      </Helmet>

      <Navbar />

      <main className="pt-24 pb-16">
        <article className="max-w-3xl mx-auto px-4 md:px-6">
          <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground mb-6">
            <Link to="/" className="hover:text-primary">Acasă</Link>
            <ChevronRight className="w-3.5 h-3.5 inline mx-1 -mt-0.5" aria-hidden />
            <Link to="/blog" className="hover:text-primary">Blog</Link>
            <ChevronRight className="w-3.5 h-3.5 inline mx-1 -mt-0.5" aria-hidden />
            <span className="text-foreground">{crumb ?? title}</span>
          </nav>

          <header className="mb-10 space-y-4">
            <h1 className="font-display text-3xl md:text-5xl font-bold tracking-tight text-foreground">
              {title}
            </h1>
            <p className="text-lg text-muted-foreground">{lead}</p>
            <p className="text-sm text-muted-foreground">
              Publicat pe {dateLabel} · Aprox. {readingMinutes} minute de citire
            </p>
          </header>

          <div className="space-y-8 text-foreground/80 leading-relaxed [&_h2]:font-display [&_h2]:text-2xl [&_h2]:md:text-3xl [&_h2]:font-bold [&_h2]:text-foreground [&_h2]:mt-10 [&_h2]:mb-3 [&_p]:leading-relaxed [&_ul]:list-disc [&_ul]:list-inside [&_ul]:space-y-2 [&_ol]:list-decimal [&_ol]:list-inside [&_ol]:space-y-2 [&_a]:text-primary [&_a]:underline">
            {children}
          </div>

          <RelatedPosts currentSlug={slug} />

          <div className="mt-16 rounded-xl border border-border bg-primary/5 p-6 md:p-8 text-center space-y-4">
            <h2 className="font-display text-2xl font-bold text-foreground">{ctaTitle}</h2>
            <p className="text-muted-foreground">{ctaText}</p>
            <Link
              to={ctaHref}
              className="inline-block bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition"
            >
              {ctaLabel}
            </Link>
          </div>
        </article>
      </main>

      <Footer />
      <WhatsAppButton />
      <ScrollToTop />
    </div>
  );
};

export default BlogArticleLayout;
