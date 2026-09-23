import { useEffect, type ReactNode } from "react";
import {
  createRootRouteWithContext,
  HeadContent,
  Outlet,
  Scripts,
  useRouter,
} from "@tanstack/react-router";
import type { QueryClient } from "@tanstack/react-query";
import { QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider } from "react-helmet-async";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { I18nProvider, useI18n } from "@/lib/i18n";
import { useRouteAnalytics } from "@/hooks/useRouteAnalytics";
import { useLocation } from "@/lib/router-compat";
import { initContactClickTracking } from "@/lib/tracking";
import { reportLovableError } from "@/lib/lovable-error-reporting";
import NotFound from "@/pages/NotFound";
import AskAssistant from "@/components/AskAssistant";
import appCss from "../styles.css?url";

const ADOPT_WEBSITE_CODE = "1771d601-0d76-4374-9255-347fecce75e3";
const GA_MEASUREMENT_ID = "G-F167Y815JL";

// Skip consent/analytics vendors inside the Lovable editor preview iframe:
// they probe the parent frame and throw cross-origin SecurityErrors there.
const analyticsBootstrap = `
window.__ANALYTICS_ENABLED__ = (function () {
  try {
    if (/lovableproject\\.com$/.test(location.hostname)) return false;
    if (window.top !== window.self) return false;
  } catch (e) {
    return false;
  }
  return true;
})();
if (window.__ANALYTICS_ENABLED__) {
  var adopt = document.createElement("script");
  adopt.src = "https://tag.goadopt.io/injector.js?website_code=${ADOPT_WEBSITE_CODE}";
  adopt.className = "adopt-injector";
  document.head.appendChild(adopt);
}
`;

// One-time cleanup of the previous CMP (consentmanager.net) leftovers.
const cmpLegacyCleanup = `
(function () {
  try {
    if (localStorage.getItem("cmp_legacy_cleaned") === "1") return;
    var host = location.hostname;
    var domains = ["", host, "." + host, ".centruldearabalibaneza.com"];
    var paths = ["/", location.pathname];
    document.cookie.split(";").forEach(function (c) {
      var name = c.split("=")[0].trim();
      if (!/^cmp/i.test(name)) return;
      domains.forEach(function (d) {
        paths.forEach(function (p) {
          document.cookie =
            name + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=" + p + (d ? "; domain=" + d : "");
        });
      });
    });
    Object.keys(localStorage).forEach(function (k) {
      if (/^cmp/i.test(k) || k.indexOf("consentmanager") !== -1) localStorage.removeItem(k);
    });
    localStorage.setItem("cmp_legacy_cleaned", "1");
  } catch (e) {}
})();
`;

// Theme bootstrap — must run before first paint, NOT in useEffect (would flash).
const themeBootstrap = `
(function () {
  var saved = localStorage.getItem("theme");
  if (saved === "dark" || saved === "light") {
    if (saved === "dark") document.documentElement.classList.add("dark");
  } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
    document.documentElement.classList.add("dark");
  }
})();
`;

// Google tag (gtag.js), gated behind the same analytics flag.
const gtagBootstrap = `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
if (window.__ANALYTICS_ENABLED__) {
  var gt = document.createElement("script");
  gt.async = true;
  gt.src = "https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}";
  document.head.appendChild(gt);
  gtag('js', new Date());
  gtag('consent', 'default', { analytics_storage: 'denied', ad_storage: 'denied' });
  gtag('config', '${GA_MEASUREMENT_ID}');
}
`;

const organizationJsonLd = JSON.stringify({
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://centruldearabalibaneza.com/#organization",
      name: "Centrul de Arabă Libaneză",
      alternateName: "Arabă Libaneză cu Ibra",
      url: "https://centruldearabalibaneza.com/",
      logo: {
        "@type": "ImageObject",
        url: "https://centruldearabalibaneza.com/favicon.png",
      },
      email: "marhaba@centruldearabalibaneza.com",
      telephone: "+40 763 124 514",
      address: {
        "@type": "PostalAddress",
        streetAddress: "Strada Icoanei 80",
        addressLocality: "București",
        addressCountry: "RO",
      },
    },
    {
      "@type": "WebSite",
      "@id": "https://centruldearabalibaneza.com/#website",
      url: "https://centruldearabalibaneza.com/",
      name: "Centrul de Arabă Libaneză",
      alternateName: "Arabă Libaneză cu Ibra",
      inLanguage: "ro-RO",
      publisher: { "@id": "https://centruldearabalibaneza.com/#organization" },
    },
  ],
});

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1.0" },
      { "data-rh": "true", title: "Cursuri de Arabă Libaneză în București și Online — Ibra" },
      {
        "data-rh": "true",
        name: "description",
        content:
          "Cursuri de arabă libaneză în București și online, pentru toate nivelurile, cu Ibra, profesor nativ din Liban. Vorbești din primele lecții.",
      },
      { name: "author", content: "centrul de araba libaneza" },
      { name: "adopt-website-id", content: ADOPT_WEBSITE_CODE },
      { name: "google-site-verification", content: "O4lPkW4s-d2rF0NNhpyeNU-6yhLxvox4c73Hz2lcoKU" },
      { "data-rh": "true", property: "og:type", content: "website" },
      { "data-rh": "true", property: "og:url", content: "https://centruldearabalibaneza.com/" },
      { "data-rh": "true", property: "og:title", content: "Cursuri de arabă în București și online — Arabă libaneză cu Ibra" },
      {
        "data-rh": "true",
        property: "og:description",
        content:
          "Cursuri de arabă libaneză în București și online, pentru toate nivelurile, cu Ibra, profesor nativ din Liban. Vorbești din primele lecții.",
      },
      { "data-rh": "true", property: "og:image", content: "https://centruldearabalibaneza.com/og-image.png" },
      { "data-rh": "true", name: "twitter:card", content: "summary_large_image" },
      { "data-rh": "true", name: "twitter:title", content: "Cursuri de arabă în București și online — Arabă libaneză cu Ibra" },
      {
        "data-rh": "true",
        name: "twitter:description",
        content:
          "Cursuri de arabă libaneză în București și online, pentru toate nivelurile, cu Ibra, profesor nativ din Liban. Vorbești din primele lecții.",
      },
      { "data-rh": "true", name: "twitter:image", content: "https://centruldearabalibaneza.com/og-image.png" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", type: "image/png", href: "/favicon.png" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "preload",
        as: "style",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap",
      },
    ],
    scripts: [
      { children: analyticsBootstrap },
      { children: cmpLegacyCleanup },
      { children: themeBootstrap },
      { children: gtagBootstrap },
      {
        src: "https://www.google.com/recaptcha/api.js?render=6Le9mPssAAAAAOEV4BSPnuBGmJDDQiPtQgOwkzjc",
        async: true,
        defer: true,
      },
      { type: "application/ld+json", children: organizationJsonLd },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: () => <NotFound />,
  errorComponent: RootErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  // English pages live under /en/; everything else is Romanian. The i18n
  // effect keeps this in sync client-side after language toggles.
  const { pathname } = useLocation();
  const shellLang = pathname.startsWith("/en/") || pathname === "/en" ? "en" : "ro";
  return (
    <html lang={shellLang} suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

const RouteAnalytics = () => {
  useRouteAnalytics();
  return null;
};

/**
 * Keep the UI language in step with the URL on /en/ routes.
 * (Ported unchanged from the old App.tsx.)
 */
const LanguageFromPath = () => {
  const { pathname } = useLocation();
  const { lang, setLang } = useI18n();
  useEffect(() => {
    if (pathname.startsWith("/en/") && lang !== "en") setLang("en");
  }, [pathname, lang, setLang]);
  return null;
};

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  // SSR renders /en/* pages with English chrome so the server HTML matches
  // the client's first render (the client initializer also picks "en" there).
  const { pathname } = useLocation();
  const initialLang = pathname.startsWith("/en/") ? ("en" as const) : ("ro" as const);

  // ported from main.tsx
  useEffect(() => {
    initContactClickTracking();
  }, []);

  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <I18nProvider initialLang={initialLang}>
            <RouteAnalytics />
            <LanguageFromPath />
            <Outlet />
            <AskAssistant />
          </I18nProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

function RootErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();

  console.error(error);
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground px-6">
      <div className="max-w-md w-full text-center space-y-4">
        <h1 className="text-2xl font-bold">This page didn't load</h1>
        <p className="text-muted-foreground">
          Something went wrong on our end. You can try again or head back to the homepage.
        </p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            onClick={() => {
              void router.invalidate();
              reset();
            }}
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-border bg-background px-4 py-2 text-sm font-medium hover:bg-muted"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}
