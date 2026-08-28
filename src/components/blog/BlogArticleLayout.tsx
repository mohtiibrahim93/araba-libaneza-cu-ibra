import { useRef } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import ScrollToTop from "@/components/ScrollToTop";
import RelatedPosts from "@/components/blog/RelatedPosts";
import MarkdownBody from "@/components/blog/MarkdownBody";
import ArticleOutline from "@/components/blog/ArticleOutline";
import { useBlogOverride } from "@/hooks/useBlogOverride";
import { useI18n } from "@/lib/i18n";
import type { Localized } from "@/lib/blogPosts";

const BASE = "https://centruldearabalibaneza.com";

// Accept a plain string (same text both languages — for not-yet-translated
// articles) or a bilingual object; normalize + pick the current language.
type Loc = string | Localized;
const pick = (v: Loc, lang: "ro" | "en") =>
  typeof v === "string" ? v : v[lang] ?? v.ro;

interface Props {
  slug: string;
  title: Loc;
  description: Loc;
  /** Optional fixed metadata, independent of owner-edited article headings. */
  metaTitle?: Loc;
  metaDescription?: Loc;
  published: string; // ISO
  readingMinutes: number;
  /** Short crumb label (falls back to title). */
  crumb?: Loc;
  /** Lead paragraph under the H1. */
  lead: Loc;
  children: React.ReactNode;
  /** CTA at the bottom; defaults to the trial. */
  cta?: { title: Loc; text: Loc; href: string; label: Loc };
  /**
   * Per-article questions. Rendered at the end and emitted as FAQPage JSON-LD.
   * Keep them unique to this article — a question that already exists elsewhere
   * on the site splits the same answer across two URLs.
   */
  faq?: { q: Loc; a: Loc }[];
  /**
   * The same steps passed to <Steps>, emitted as HowTo JSON-LD. Pass them only
   * when the article really is a how-to; HowTo on a non-procedural page is
   * misrepresentation, not decoration.
   */
  steps?: { title: Loc; body: Loc }[];
}

const DEFAULT_CTA = {
  title: {
    ro: "Gata să începi să vorbești araba libaneză?",
    en: "Ready to start speaking Lebanese Arabic?",
  },
  text: {
    ro: "O lecție de probă gratuită cu profesor nativ — online sau fizic în București.",
    en: "A free trial lesson with a native teacher — online or in person in Bucharest.",
  },
  href: "/trial",
  label: {
    ro: "Rezervă o lecție de probă gratuită",
    en: "Book a free trial lesson",
  },
};

/**
 * Shared chrome for blog articles: SEO meta + Article JSON-LD + breadcrumb +
 * a bottom CTA. Bilingual — picks RO/EN from the site language toggle. Each
 * article file provides both-language metadata and a lang-aware body.
 */
const BlogArticleLayout = ({
  slug,
  title,
  description,
  metaTitle,
  metaDescription,
  published,
  readingMinutes,
  crumb,
  lead,
  children,
  cta = DEFAULT_CTA,
  faq,
  steps,
}: Props) => {
  const { lang } = useI18n();
  const url = `${BASE}/blog/${slug}`;
  // Scoped to the body + FAQ so the outline lists the article's own sections,
  // not the "related posts" and CTA headings that follow every article.
  const bodyRef = useRef<HTMLDivElement>(null);

  // Blog CMS override: a published, owner-edited DB version replaces the
  // code-shipped one. Empty DB fields fall back to the code values, and the
  // EN body falls back to RO, so partial edits never blank anything out.
  const override = useBlogOverride(slug);
  const ov = (en: string, ro: string) => (lang === "en" ? en || ro : ro) || "";

  const tTitle = (override && ov(override.title_en, override.title_ro)) || pick(title, lang);
  const tDesc = (override && ov(override.description_en, override.description_ro)) || pick(description, lang);
  const resolvedMetaTitle = metaTitle ? pick(metaTitle, lang) : tTitle;
  const resolvedMetaDescription = metaDescription ? pick(metaDescription, lang) : tDesc;
  const tLead = (override && ov(override.lead_en, override.lead_ro)) || pick(lead, lang);
  const overrideBody = override ? ov(override.body_en, override.body_ro) : "";
  const tReadingMinutes = override?.reading_minutes || readingMinutes;
  const tCrumb = crumb ? pick(crumb, lang) : tTitle;

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: resolvedMetaTitle,
    description: resolvedMetaDescription,
    datePublished: published,
    dateModified: published,
    inLanguage: lang === "en" ? "en" : "ro",
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
  const homeLabel = lang === "en" ? "Home" : "Acasă";
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: homeLabel, item: `${BASE}/` },
      { "@type": "ListItem", position: 2, name: "Blog", item: `${BASE}/blog` },
      { "@type": "ListItem", position: 3, name: tCrumb, item: url },
    ],
  };
  const dateLabel = new Date(published).toLocaleDateString(lang === "en" ? "en-GB" : "ro-RO", {
    day: "numeric", month: "long", year: "numeric",
  });
  const metaLine =
    lang === "en"
      ? `Published on ${dateLabel} · About ${tReadingMinutes} min read`
      : `Publicat pe ${dateLabel} · Aprox. ${tReadingMinutes} minute de citire`;

  const faqJsonLd = faq?.length
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faq.map(({ q, a }) => ({
          "@type": "Question",
          name: pick(q, lang),
          acceptedAnswer: { "@type": "Answer", text: pick(a, lang) },
        })),
      }
    : null;
  const howToJsonLd = steps?.length
    ? {
        "@context": "https://schema.org",
        "@type": "HowTo",
        name: resolvedMetaTitle,
        description: resolvedMetaDescription,
        inLanguage: lang,
        step: steps.map((st, i) => ({
          "@type": "HowToStep",
          position: i + 1,
          name: pick(st.title, lang),
          text: pick(st.body, lang),
          url: `${url}#step-${i + 1}`,
        })),
      }
    : null;

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{resolvedMetaTitle}</title>
        <meta name="description" content={resolvedMetaDescription} />
        <link rel="canonical" href={url} />
        <meta property="og:type" content="article" />
        <meta property="og:title" content={resolvedMetaTitle} />
        <meta property="og:description" content={resolvedMetaDescription} />
        <meta property="og:url" content={url} />
        <meta property="og:image" content={`${BASE}/og-image.png`} />
        <meta property="og:locale" content={lang === "en" ? "en_US" : "ro_RO"} />
        <meta property="article:published_time" content={published} />
        <meta property="article:author" content="Ibra — Centrul de Arabă Libaneză" />
        <meta name="twitter:card" content="summary_large_image" />
        <script type="application/ld+json">{JSON.stringify(articleJsonLd)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbJsonLd)}</script>
        {faqJsonLd && <script type="application/ld+json">{JSON.stringify(faqJsonLd)}</script>}
        {howToJsonLd && <script type="application/ld+json">{JSON.stringify(howToJsonLd)}</script>}
      </Helmet>

      <Navbar />

      <main id="main-content" className="pt-24 pb-16">
        <div className="mx-auto flex w-full max-w-3xl gap-8 px-gutter lg:max-w-content lg:gap-10">
          <aside className="hidden lg:block lg:w-52 lg:shrink-0">
            <ArticleOutline containerRef={bodyRef} />
          </aside>
          <article className="min-w-0 flex-1 lg:max-w-3xl">
          <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground mb-6">
            <Link to="/" className="hover:text-primary">{homeLabel}</Link>
            <ChevronRight className="w-3.5 h-3.5 inline mx-1 -mt-0.5" aria-hidden />
            <Link to="/blog" className="hover:text-primary">Blog</Link>
            <ChevronRight className="w-3.5 h-3.5 inline mx-1 -mt-0.5" aria-hidden />
            <span className="text-foreground">{tCrumb}</span>
          </nav>

          <header className="mb-10 space-y-4">
            <h1 className="font-display text-display-xl font-bold tracking-tight text-foreground">
              {tTitle}
            </h1>
            <p className="text-lg text-muted-foreground">{tLead}</p>
            <p className="text-sm text-muted-foreground">{metaLine}</p>
          </header>

          <div ref={bodyRef}>
          <div className="space-y-8 text-foreground/80 leading-relaxed [&_h2]:font-display [&_h2]:text-2xl [&_h2]:md:text-3xl [&_h2]:font-bold [&_h2]:text-foreground [&_h2]:mt-10 [&_h2]:mb-3 [&_p]:leading-relaxed [&_ul]:list-disc [&_ul]:list-inside [&_ul]:space-y-2 [&_ol]:list-decimal [&_ol]:list-inside [&_ol]:space-y-2 [&_a]:text-primary [&_a]:underline">
            {overrideBody ? <MarkdownBody markdown={overrideBody} /> : children}
          </div>

          {faq?.length ? (
            <section className="mt-12">
              <h2 className="font-display text-2xl font-bold text-foreground">
                {lang === "en" ? "Frequently asked questions" : "Întrebări frecvente"}
              </h2>
              <div className="mt-4 space-y-4">
                {faq.map(({ q, a }) => (
                  <div key={pick(q, lang)} className="rounded-lg border border-border bg-muted/30 p-4">
                    <h3 className="font-semibold text-foreground">{pick(q, lang)}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{pick(a, lang)}</p>
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          </div>

          <RelatedPosts currentSlug={slug} />

          <div className="mt-16 rounded-xl border border-border bg-primary/5 p-6 md:p-8 text-center space-y-4">
            <h2 className="font-display text-2xl font-bold text-foreground">{pick(cta.title, lang)}</h2>
            <p className="text-muted-foreground">{pick(cta.text, lang)}</p>
            <Link
              to={cta.href}
              className="inline-block bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition"
            >
              {pick(cta.label, lang)}
            </Link>
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

export default BlogArticleLayout;
