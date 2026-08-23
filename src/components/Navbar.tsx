import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { ChevronDown, Menu, X, GraduationCap, Calendar, Sun, Moon } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { scrollToAnchor, scrollToAnchorWhenReady } from "@/lib/scrollToAnchor";
import { languageCounterpart } from "@/lib/languageRoutes";
import { Button } from "@/components/ui/button";
import BrandLogo from "@/components/BrandLogo";

/* Real SVG flags: emoji flags render as bare letters ("RO") on Windows, so
   the language toggle needs proper vectors. Simplified but accurate. */
const FlagRO = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 16" aria-hidden="true" focusable="false" className={className}>
    <rect width="8" height="16" fill="#002B7F" />
    <rect x="8" width="8" height="16" fill="#FCD116" />
    <rect x="16" width="8" height="16" fill="#CE1126" />
  </svg>
);

const FlagGB = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 16" aria-hidden="true" focusable="false" className={className}>
    <rect width="24" height="16" fill="#012169" />
    <path d="M0 0l24 16M24 0L0 16" stroke="#fff" strokeWidth="3.2" />
    <path d="M0 0l24 16M24 0L0 16" stroke="#C8102E" strokeWidth="1.6" />
    <path d="M12 0v16M0 8h24" stroke="#fff" strokeWidth="5.2" />
    <path d="M12 0v16M0 8h24" stroke="#C8102E" strokeWidth="3.2" />
  </svg>
);
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";


const Navbar = () => {
  const { t, setLang, lang } = useI18n();
  const [open, setOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const navRef = useRef<HTMLElement | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Sync dark-mode state with <html> class on mount
  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  // Switch language. On the dedicated EN pages / their RO-only twins the body
  // is written in one language, so we navigate to the counterpart route;
  // everywhere else the toggle just swaps strings in place.
  const changeLang = (next: "ro" | "en") => {
    setLang(next);
    const dest = languageCounterpart(location.pathname, next);
    if (dest) navigate(dest);
  };

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  // Navigate to an in-page anchor; if currently on a different route,
  // route to "/" first then scroll once the target mounts.
  const goToAnchor = (hash: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    const id = hash.replace(/^#/, "");
    setOpen(false);
    if (location.pathname !== "/") {
      navigate("/" + hash);
      scrollToAnchorWhenReady(id);
      return;
    }
    scrollToAnchor(id, { updateHash: true });
  };

  // Publish actual navbar height as a CSS var so anchor scrolling
  // (native href="#..." and programmatic scrollIntoView) lands below it.
  useEffect(() => {
    const el = navRef.current;
    if (!el) return;
    const apply = () => {
      const h = Math.round(el.getBoundingClientRect().height);
      if (h > 0) document.documentElement.style.setProperty("--nav-h", `${h}px`);
    };
    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(el);
    window.addEventListener("resize", apply);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", apply);
    };
  }, []);

  const links = [
    // Prices are shown in the Programs section — there is no #pricing block.
    { href: "#programs", label: t.navPricing },
    { href: "#testimonials", label: t.navTestimonials },
    { href: "#faq", label: t.navFaq },
    { href: "#contact", label: t.navContact },
  ];

  // Course + resource menus. These give every important landing page at least
  // one prominent internal link (footer-only links crawl poorly).
  const courseMenu =
    lang === "en"
      ? [
          { to: "/cursuri/grup", label: "Group course (A1–C2)" },
          { to: "/cursuri/private", label: "Private lessons" },
          { to: "/cursuri/copii", label: "Kids (6–10)" },
          { to: "/cursuri/tineri", label: "Teens (11–18)" },
          { to: "/cursuri/adulti", label: "Adults" },
          { to: "/en/arabic-classes-near-me", label: "Arabic classes in Bucharest" },
          { to: "/en/arabic-tutor", label: "1-on-1 Arabic tutor" },
        ]
      : [
          { to: "/cursuri/grup", label: "Curs de grup (A1–C2)" },
          { to: "/cursuri/private", label: "Lecții private" },
          { to: "/cursuri/copii", label: "Copii (6–10)" },
          { to: "/cursuri/tineri", label: "Adolescenți (11–18)" },
          { to: "/cursuri/adulti", label: "Adulți" },
          { to: "/cursuri-araba-bucuresti", label: "Cursuri în București" },
          { to: "/meditatii-araba", label: "Meditații 1:1" },
        ];

  // In English the resource menu points at the English guides, so the /en/*
  // pages get real internal links instead of living only in the sitemap.
  const resourceMenu =
    lang === "en"
      ? [
          { to: "/en/learn-lebanese-arabic", label: "Learn Lebanese Arabic" },
          { to: "/en/how-to-learn-lebanese-arabic", label: "How to learn it" },
          { to: "/blog/lebanese-arabic-learning-resources", label: "Free learning resources" },
          { to: "/blog/lebanese-arabic-phrases", label: "Essential phrases" },
          { to: "/en/arabic-dialects-guide", label: "Arabic dialects guide" },
          { to: "/en/lebanese-arabic-vs-msa-vs-egyptian", label: "Lebanese vs MSA vs Egyptian" },
          { to: "/en/levantine-arabic-dialects-map", label: "Levantine dialects map" },
        ]
      : [
          { to: "/resurse", label: "Resurse gratuite" },
          { to: "/invata-araba-gratis", label: "Învață araba gratis" },
          { to: "/arabizi", label: "Arabizi" },
          { to: "/fara-alfabet-arab", label: "Fără alfabet arab" },
          { to: "/dialecte-arabe", label: "Dialectele arabe" },
          { to: "/ce-araba-sa-inveti", label: "Ce arabă să înveți" },
          { to: "/araba-pentru-partener", label: "Arabă pentru partener" },
          { to: "/araba-in-familie", label: "Arabă în familie" },
        ];



  return (
    <nav ref={navRef} className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-md border-b border-border">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-[60] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-primary-foreground"
      >
        {lang === "en" ? "Skip to content" : "Sari la conținut"}
      </a>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-[4.25rem] md:h-20 flex items-center justify-between gap-4 lg:gap-6">
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            if (location.pathname === "/") {
              window.scrollTo({ top: 0, behavior: "smooth" });
            } else {
              navigate("/");
            }
          }}
          aria-label="Centrul de Arabă Libaneză — arabă libaneză cu Ibra"
          className="flex h-14 min-w-0 flex-1 items-center pr-3 md:max-w-none md:flex-none md:pr-4"
        >
          <BrandLogo />
        </a>

        <div className="hidden md:flex items-center gap-6 lg:gap-8 text-sm text-muted-foreground font-medium">
          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex items-center gap-1 hover:text-foreground transition-colors focus:outline-none">
              {t.navCourses}
              <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="min-w-56">
              <DropdownMenuItem asChild>
                <Link to="/cursuri">{lang === "en" ? "All courses" : "Toate cursurile"}</Link>
              </DropdownMenuItem>
              {courseMenu.map((item) => (
                <DropdownMenuItem key={item.to} asChild>
                  <Link to={item.to}>{item.label}</Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex items-center gap-1 hover:text-foreground transition-colors focus:outline-none">
              {lang === "en" ? "Resources" : "Resurse"}
              <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="min-w-56">
              {resourceMenu.map((item) => (
                <DropdownMenuItem key={item.to} asChild>
                  <Link to={item.to}>{item.label}</Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Link
            to="/booking"
            onClick={() => setOpen(false)}
            className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors"
          >
            <Calendar className="w-4 h-4" aria-hidden="true" />
            {t.navBooking}
          </Link>
          <Link
            to="/blog"
            onClick={() => setOpen(false)}
            className="hover:text-foreground transition-colors"
          >
            {t.navBlog}
          </Link>

          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={goToAnchor(l.href)}
              className="hover:text-foreground transition-colors"
            >
              {l.label}
            </a>
          ))}
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          {/* Quick access: jump to Programs from any page. Hidden on phones —
              the sticky MobileEnrollmentCTA bar already covers enrolment there,
              and the navbar space is needed for the full brand name. */}
          <a
            href="/#programs"
            onClick={goToAnchor("#programs")}
            aria-label={t.navEnroll}
            className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-muted md:hidden lg:inline-flex"
          >
            <GraduationCap className="w-4 h-4 text-primary" aria-hidden="true" />
            <span className="hidden sm:inline">{t.navEnroll}</span>
          </a>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            className="rounded-full"
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                aria-label={t.languageLabel}
                className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground min-h-9"
              >
                {lang === "ro" ? (
                  <FlagRO className="h-3.5 w-5 rounded-[2px] shadow-sm" />
                ) : (
                  <FlagGB className="h-3.5 w-5 rounded-[2px] shadow-sm" />
                )}
                <span className="hidden sm:inline uppercase">{lang}</span>
                <ChevronDown className="h-3.5 w-3.5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-36">
              <DropdownMenuItem onClick={() => changeLang("ro")} className="gap-2">
                <FlagRO className="h-3.5 w-5 rounded-[2px]" />
                <span>{t.languageRomanian}</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => changeLang("en")} className="gap-2">
                <FlagGB className="h-3.5 w-5 rounded-[2px]" />
                <span>{t.languageEnglish}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden flex items-center justify-center min-w-11 min-h-11 -mr-1 text-foreground"
            aria-label={open ? t.navCloseMenuLabel : t.navOpenMenuLabel}
            aria-expanded={open}
            aria-controls="mobile-navigation"
          >
            {open ? <X className="w-5 h-5" aria-hidden="true" /> : <Menu className="w-5 h-5" aria-hidden="true" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div id="mobile-navigation" className="md:hidden border-t border-border bg-background/95 backdrop-blur-md animate-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col px-6 py-2 gap-1">
            <Link
              to="/cursuri"
              onClick={() => setOpen(false)}
              className="text-base font-medium text-foreground/90 hover:text-foreground transition-colors py-3 min-h-12 flex items-center gap-2"
            >
              <GraduationCap className="w-4 h-4" aria-hidden="true" />
              {t.navCourses}
            </Link>
            <div className="flex flex-col pl-6">
              {courseMenu.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors py-2.5 min-h-10 flex items-center"
                >
                  {item.label}
                </Link>
              ))}
            </div>
            <p className="pt-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {lang === "en" ? "Resources" : "Resurse"}
            </p>
            <div className="flex flex-col pl-6">
              {resourceMenu.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors py-2.5 min-h-10 flex items-center"
                >
                  {item.label}
                </Link>
              ))}
            </div>

            <Link
              to="/booking"
              onClick={() => setOpen(false)}
              className="text-base font-medium text-foreground/90 hover:text-foreground transition-colors py-3 min-h-12 flex items-center gap-2"
            >
              <Calendar className="w-4 h-4" aria-hidden="true" />
              {t.navBooking}
            </Link>
            <Link
              to="/blog"
              onClick={() => setOpen(false)}
              className="text-base font-medium text-foreground/90 hover:text-foreground transition-colors py-3 min-h-12 flex items-center gap-2"
            >
              {t.navBlog}
            </Link>
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={goToAnchor(l.href)}
                className="text-base font-medium text-foreground/90 hover:text-foreground transition-colors py-3 min-h-12 flex items-center"
              >
                {l.label}
              </a>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
