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
    title: "Blog — Arabă libaneză explicată simplu | Ibra",
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
    title: "Blog — Lebanese Arabic explained simply | Ibra",
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
  const { lang, setLang } = useI18n();
  const c = COPY[lang];
  // In English the index lives at /en/blog and links to the English half of
  // each article. Both halves render from the same component; only the URL
  // differs, and it is the URL that decides which language a crawler sees.
  const base = lang === "en" ? "/en/blog" : "/blog";
  const canonical = `${BASE_URL}${base}`;
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
      url: `${BASE_URL}${base}/${p.slug}`,
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

      <main id="main-content" className="pt-16">
        <nav aria-label="Breadcrumb" className="w-full max-w-content mx-auto px-gutter pt-6 pb-2 text-xs text-muted-foreground">
          <ol className="flex flex-wrap items-center gap-1">
            <li><Link to="/" className="hover:text-foreground transition-colors">{c.home}</Link></li>
            <li aria-hidden><ChevronRight className="w-3.5 h-3.5 inline -mt-0.5" /></li>
            <li className="text-foreground font-medium" aria-current="page">Blog</li>
          </ol>
        </nav>

        <header className="w-full max-w-content mx-auto px-gutter pt-4 pb-8 text-center">
          <span className="text-sm font-medium text-primary mb-2 block">{c.badge}</span>
          <h1 className="font-display text-display-xl font-bold tracking-tight text-foreground mb-3">
            {c.h1}
          </h1>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {c.intro}
          </p>
          {/* A real link to the other language, not just the toggle. The toggle
              is JavaScript, so without this the English half of the blog had no
              crawlable path in — twenty articles reachable only by guessing the
              URL.

              It has to set the language as well as navigate. LanguageFromPath
              forces English on the way *into* /en/ but never restores Romanian
              on the way out, so following this link from /en/blog used to land
              on /blog with the English copy still rendering — the link looked
              like it did nothing. Same two steps the navbar toggle takes. */}
          <p className="text-sm text-muted-foreground mt-4">
            <Link
              to={lang === "en" ? "/blog" : "/en/blog"}
              onClick={() => setLang(lang === "en" ? "ro" : "en")}
              className="underline underline-offset-4 hover:text-foreground transition-colors"
            >
              {lang === "en" ? "Citește articolele în română" : "Read these articles in English"}
            </Link>
          </p>
        </header>

        <section className="w-full max-w-content mx-auto px-gutter pb-16">
          <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {blogPostsNewestFirst.map((post) => (
              <li key={post.slug}>
                <Link
                  to={`${base}/${post.slug}`}
                  className="group flex h-full min-h-[16rem] flex-col rounded-2xl border border-border bg-card p-5 hover:border-primary/50 hover:shadow-md transition-all"
                >
                  <div className="mb-3 flex items-center gap-2">
                    <span className="inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium bg-primary/10 text-primary">
                      {L(post.tag, lang)}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="w-3.5 h-3.5" />
                      {post.readingMinutes} {c.min}
                    </span>
                  </div>
                  <h2 className="font-display text-base font-bold text-foreground mb-2 leading-snug group-hover:text-primary transition-colors">
                    {L(post.title, lang)}
                  </h2>
                  <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">{L(post.description, lang)}</p>
                  <div className="mt-auto pt-4 flex items-center justify-between">
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
