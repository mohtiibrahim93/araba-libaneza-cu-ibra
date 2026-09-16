import { Helmet } from "react-helmet-async";
import { Link } from "@/components/LocalizedLink";
import { Link as CrossLanguageLink } from "@/lib/router-compat";
import { useSearchParams } from "@/lib/router-compat";
import { ChevronRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import ScrollToTop from "@/components/ScrollToTop";
import { blogPostsNewestFirst, L } from "@/lib/blogPosts";
import { BLOG_PER_PAGE, blogPageFrom, blogPageHref, blogTotalPages } from "@/lib/blogPagination";
import { getBlogCover } from "@/lib/blogCovers";
import { seoMeta } from "@/lib/seoHead";
import { useI18n } from "@/lib/i18n";

const BASE_URL = "https://centruldearabalibaneza.com";

/**
 * Paging is driven by ?page= rather than component state so page two has an
 * address: it can be linked, shared and crawled, and the server renders it
 * directly. A useState pager would have hidden seven articles behind a click
 * no crawler performs.
 *
 * The page number, the clamping and the href shape come from
 * src/lib/blogPagination.ts, which the route's head() reads too — the two used
 * to compute them separately and disagreed about which page this was.
 */
const COPY = {
  ro: {
    title: "Blog — Arabă libaneză explicată simplu | Ibra",
    description:
      "Ghiduri și articole despre araba libaneză: cum înveți, diferența față de araba standard, expresii utile și cultură libaneză — de la Ibra, profesor nativ.",
    badge: "Blog",
    h1: "Arabă libaneză, explicată simplu",
    intro: "Ghiduri practice despre limbă, dialect și cultura Libanului — scrise de Ibra, profesor nativ.",
    home: "Acasă",
    author: "Ibra",
    pagination: "Paginare",
    page: "Pagina",
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
    author: "Ibra",
    pagination: "Pagination",
    page: "Page",
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
  const [searchParams] = useSearchParams();
  const totalPages = blogTotalPages();
  const page = blogPageFrom(searchParams.get("page"));
  const start = (page - 1) * BLOG_PER_PAGE;
  const visible = blogPostsNewestFirst.slice(start, start + BLOG_PER_PAGE);
  const hrefFor = (n: number) => blogPageHref(base, n);
  // Each page is its own canonical. Pointing page two at page one would ask
  // Google to merge them and then drop the seven articles only page two lists.
  const canonical = `${BASE_URL}${hrefFor(page)}`;
  // Title and description from the route table, which is what the route's
  // head() serves and what meta-length.test.ts length-checks. The COPY block
  // below still owns the visible page copy; it owned the head too, and the
  // two had drifted.
  const routeMeta = seoMeta(base);
  const metaTitle = routeMeta?.title ?? c.title;
  const metaDescription = routeMeta?.description ?? c.description;
  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString(lang === "en" ? "en-GB" : "ro-RO", {
      day: "numeric", month: "long", year: "numeric",
    });

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: visible.map((p, i) => ({
      "@type": "ListItem",
      // Absolute position across the whole blog, not position within the page.
      position: start + i + 1,
      url: `${BASE_URL}${base}/${p.slug}`,
      name: L(p.title, lang),
    })),
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{metaTitle}</title>
        <meta name="description" content={metaDescription} />
        <link rel="canonical" href={canonical} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={metaTitle} />
        <meta property="og:description" content={metaDescription} />
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
            {/* Deliberately NOT the localised Link: this one is meant to cross
                languages, and LocalizedLink would map /blog straight back to
                /en/blog and leave the reader where they started. */}
            <CrossLanguageLink
              to={lang === "en" ? "/blog" : "/en/blog"}
              onClick={() => setLang(lang === "en" ? "ro" : "en")}
              className="underline underline-offset-4 hover:text-foreground transition-colors"
            >
              {lang === "en" ? "Citește articolele în română" : "Read these articles in English"}
            </CrossLanguageLink>
          </p>
        </header>

        <section className="w-full max-w-content mx-auto px-gutter pb-16">
          <ul className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {visible.map((post) => {
              const cover = getBlogCover(post.slug);
              return (
                <li key={post.slug}>
                  <Link to={`${base}/${post.slug}`} className="group flex h-full flex-col">
                    <div className="mb-4 aspect-[4/3] w-full overflow-hidden rounded-xl bg-muted">
                      {cover ? (
                        <img
                          src={cover.src}
                          alt={L(cover.alt, lang)}
                          width={1200}
                          height={900}
                          loading="lazy"
                          decoding="async"
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                        />
                      ) : (
                        // An article added before its photo exists still needs a
                        // card the same shape as the others, or the grid jumps.
                        <div
                          aria-hidden
                          className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/15 via-primary/10 to-primary/25"
                        >
                          <span className="select-none font-display text-4xl text-primary/40" lang="ar" dir="rtl">
                            ع
                          </span>
                        </div>
                      )}
                    </div>
                    <h2 className="font-display text-lg font-semibold leading-snug text-foreground transition-colors group-hover:text-primary">
                      {L(post.title, lang)}
                    </h2>
                    <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                      {L(post.description, lang)}
                    </p>
                    <div className="mt-4 flex items-center gap-2">
                      <span
                        aria-hidden
                        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground"
                      >
                        IB
                      </span>
                      <span className="text-xs font-medium text-foreground">{c.author}</span>
                      <span className="text-xs text-muted-foreground">{fmtDate(post.published)}</span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>

          {totalPages > 1 && (
            <nav aria-label={c.pagination} className="mt-14 flex items-center justify-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <Link
                  key={n}
                  to={hrefFor(n)}
                  aria-label={`${c.page} ${n}`}
                  aria-current={n === page ? "page" : undefined}
                  className={
                    n === page
                      ? "flex h-9 w-9 items-center justify-center rounded-full bg-foreground text-sm font-medium text-background"
                      : "flex h-9 w-9 items-center justify-center rounded-full text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  }
                >
                  {n}
                </Link>
              ))}
            </nav>
          )}
        </section>
      </main>

      <Footer />
      <WhatsAppButton />
      <ScrollToTop />
    </div>
  );
};

export default BlogIndex;
