import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ChevronRight, ArrowRight, Clock } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import ScrollToTop from "@/components/ScrollToTop";
import { blogPostsNewestFirst, L } from "@/lib/blogPosts";
import { useI18n } from "@/lib/i18n";

const BASE_URL = "https://centruldearabalibaneza.com";
const COPY = {
  ro: {
    title: "Blog — Arabă libaneză explicată simplu | Centrul de Arabă Libaneză",
    description:
      "Ghiduri și articole despre araba libaneză: cum înveți, diferența față de araba standard, expresii utile și cultură libaneză — de la Ibra, profesor nativ.",
    badge: "Blog",
    h1: "Arabă libaneză, explicată simplu",
    intro: "Ghiduri practice despre limbă, dialect și cultura Libanului — scrise de Ibra, profesor nativ.",
    home: "Acasă",
    read: "Citește",
    min: "min",
  },
  en: {
    title: "Blog — Lebanese Arabic explained simply | Lebanese Arabic Center",
    description:
      "Guides and articles about Lebanese Arabic: how to learn, the difference from Standard Arabic, useful phrases and Lebanese culture — by Ibra, a native teacher.",
    badge: "Blog",
    h1: "Lebanese Arabic, explained simply",
    intro: "Practical guides about the language, dialect and culture of Lebanon — written by Ibra, a native teacher.",
    home: "Home",
    read: "Read",
    min: "min",
  },
} as const;

const BlogIndex = () => {
  const { lang } = useI18n();
  const c = COPY[lang];
  const canonical = `${BASE_URL}/blog`;
  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString(lang === "en" ? "en-GB" : "ro-RO", {
      day: "numeric", month: "long", year: "numeric",
    });

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: blogPostsNewestFirst.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${BASE_URL}/blog/${p.slug}`,
      name: L(p.title, lang),
    })),
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{c.title}</title>
        <meta name="description" content={c.description} />
        <link rel="canonical" href={canonical} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={c.title} />
        <meta property="og:description" content={c.description} />
        <meta property="og:url" content={canonical} />
        <meta property="og:locale" content={lang === "en" ? "en_US" : "ro_RO"} />
        <script type="application/ld+json">{JSON.stringify(itemListJsonLd)}</script>
      </Helmet>

      <Navbar />

      <main className="pt-16">
        <nav aria-label="Breadcrumb" className="max-w-4xl mx-auto px-6 pt-6 pb-2 text-xs text-muted-foreground">
          <ol className="flex flex-wrap items-center gap-1">
            <li><Link to="/" className="hover:text-foreground transition-colors">{c.home}</Link></li>
            <li aria-hidden><ChevronRight className="w-3.5 h-3.5 inline -mt-0.5" /></li>
            <li className="text-foreground font-medium" aria-current="page">Blog</li>
          </ol>
        </nav>

        <header className="max-w-4xl mx-auto px-6 pt-4 pb-8 text-center">
          <span className="text-sm font-medium text-primary mb-2 block">{c.badge}</span>
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground mb-3">
            {c.h1}
          </h1>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {c.intro}
          </p>
        </header>

        <section className="max-w-4xl mx-auto px-6 pb-16">
          <ul className="grid sm:grid-cols-2 gap-5">
            {blogPostsNewestFirst.map((post) => (
              <li key={post.slug}>
                <Link
                  to={`/blog/${post.slug}`}
                  className="group flex h-full flex-col rounded-2xl border border-border bg-card p-6 hover:border-primary/50 hover:shadow-md transition-all"
                >
                  <div className="mb-3 flex items-center gap-3">
                    <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                      {L(post.tag, lang)}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="w-3.5 h-3.5" />
                      {post.readingMinutes} {c.min}
                    </span>
                  </div>
                  <h2 className="font-display text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                    {L(post.title, lang)}
                  </h2>
                  <p className="text-sm text-muted-foreground leading-relaxed flex-1">{L(post.description, lang)}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{fmtDate(post.published)}</span>
                    <span className="inline-flex items-center gap-1 text-sm font-medium text-primary group-hover:underline underline-offset-4">
                      {c.read} <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </main>

      <Footer />
      <WhatsAppButton />
      <ScrollToTop />
    </div>
  );
};

export default BlogIndex;
