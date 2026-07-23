import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { trackEvent } from "@/lib/tracking";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
    trackEvent("404NotFound", { path: location.pathname, referrer: document.referrer || "" });
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <Helmet>
        <title>Pagina nu a fost găsită (404) | Arabă Libaneză cu Ibra</title>
        <meta
          name="description"
          content="Pagina căutată nu există. Revino la Arabă Libaneză cu Ibra pentru cursuri de arabă libaneză cu profesor nativ."
        />
        <meta name="robots" content="noindex, follow" />
      </Helmet>
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">404</h1>
        <p className="mb-4 text-xl text-muted-foreground">Oops! Page not found</p>
        <a href="/" className="text-primary underline hover:text-primary/90">
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
