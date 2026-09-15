import { Link, Navigate, useLocation } from "@/lib/router-compat";
import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import { trackEvent } from "@/lib/tracking";
import { useI18n } from "@/lib/i18n";
import { resolveRedirect } from "@/lib/redirects";

const NotFound = () => {
  const location = useLocation();
  const { lang } = useI18n();
  const redirect = resolveRedirect(location.pathname);

  useEffect(() => {
    if (redirect) return;
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
    trackEvent("404NotFound", { path: location.pathname, referrer: document.referrer || "" });
  }, [location.pathname, redirect]);

  // Legacy or "obvious" URLs (/contact, /preturi, /en/courses, …) are sent to
  // the closest real page instead of dead-ending on this view.
  if (redirect) return <Navigate to={redirect} replace />;

  const en = lang === "en";
  const links: { to: string; label: string }[] = en
    ? [
        { to: "/", label: "Home" },
        { to: "/cursuri", label: "All courses" },
        { to: "/cursuri/grup", label: "Group courses" },
        { to: "/cursuri/private", label: "Private lessons" },
        { to: "/curs-araba-copii", label: "Arabic for kids" },
        { to: "/trial", label: "Free trial lesson" },
        { to: "/blog", label: "Blog" },
        { to: "/resurse", label: "Free resources" },
        { to: "/en/learn-lebanese-arabic", label: "English hub" },
      ]
    : [
        { to: "/", label: "Acasă" },
        { to: "/cursuri", label: "Toate cursurile" },
        { to: "/cursuri/grup", label: "Cursuri de grup" },
        { to: "/cursuri/private", label: "Lecții private" },
        { to: "/curs-araba-copii", label: "Arabă pentru copii" },
        { to: "/trial", label: "Lecție de probă gratuită" },
        { to: "/blog", label: "Blog" },
        { to: "/resurse", label: "Resurse gratuite" },
        { to: "/#contact", label: "Contact" },
      ];

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>
          {en
            ? "Page not found (404) | Lebanese Arabic with Ibra"
            : "Pagina nu a fost găsită (404) | Arabă Libaneză cu Ibra"}
        </title>
        <meta
          name="description"
          content={
            en
              ? "The page you were looking for does not exist. Browse Lebanese Arabic courses, the blog and free resources instead."
              : "Pagina căutată nu există. Vezi cursurile de arabă libaneză, blogul și resursele gratuite."
          }
        />
        <meta name="robots" content="noindex, follow" />
      </Helmet>
      <ScrollToTop />
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 py-20 text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-primary">404</p>
        <h1 className="mt-3 text-3xl font-bold sm:text-4xl">
          {en ? "We couldn't find that page" : "Nu am găsit pagina căutată"}
        </h1>
        <p className="mt-4 text-muted-foreground">
          {en
            ? "The link may be old or mistyped. Here's where most people go next:"
            : "Linkul pare vechi sau scris greșit. Iată unde merg de obicei vizitatorii:"}
        </p>
        <nav className="mt-8 grid gap-3 sm:grid-cols-3" aria-label={en ? "Popular pages" : "Pagini populare"}>
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="rounded-lg border border-border bg-card px-4 py-3 text-sm font-medium transition-colors hover:border-primary hover:text-primary"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </main>
      <Footer />
    </div>
  );
};

export default NotFound;
