import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { courseMenu as courseLinks, resourceMenu as resourceLinks } from "@/lib/siteNav";
import { ChevronDown, Menu, X, GraduationCap, Calendar, Sun, Moon, Phone, MessageCircle, MapPin } from "lucide-react";
import { useLocation, useNavigate } from "@/lib/router-compat";
import { Link } from "@/components/LocalizedLink";
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
import NavDropdown from "@/components/NavDropdown";
import CourseMegaMenu from "@/components/CourseMegaMenu";
import { useActiveCohorts } from "@/hooks/useActiveCohorts";
import { nextOpenCohort, shortDate, cohortHref } from "@/lib/nextCohort";
import { cn } from "@/lib/utils";

/** Height of the green band above the menu, in px (kept in step with h-[38px]). */
const BAND_H = 38;


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

  // Past the first few pixels the green band folds away and the bar slims
  // down, so the menu takes less of the screen while reading.
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // The band sits inside this fixed menu, so it would cover the top of every
  // page. The body gets the band's height as top padding instead: it is at the
  // very top of the document, so it scrolls away together with the band.
  useEffect(() => {
    const prev = document.body.style.paddingTop;
    document.body.style.paddingTop = `${BAND_H}px`;
    return () => {
      document.body.style.paddingTop = prev;
    };
  }, []);

  // On the homepage, underline the section being read. The homepage is "/"
  // in Romanian and "/en" in English.
  const homePath = lang === "en" ? "/en" : "/";
  const [activeSection, setActiveSection] = useState<string | null>(null);
  useEffect(() => {
    if (location.pathname !== homePath) {
      setActiveSection(null);
      return;
    }
    const ids = ["programs", "testimonials", "faq", "contact"];
    const seen = new Map<string, boolean>();
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => seen.set(e.target.id, e.isIntersecting));
        setActiveSection(ids.find((id) => seen.get(id)) ?? null);
      },
      { rootMargin: "-40% 0px -55% 0px" },
    );
    const t = window.setTimeout(() => {
      ids.forEach((id) => {
        const el = document.getElementById(id);
        if (el) io.observe(el);
      });
    }, 800);
    return () => {
      window.clearTimeout(t);
      io.disconnect();
    };
  }, [location.pathname, homePath]);

  // Theme and language live in the band on wide screens and in the bar below
  // that. Only one copy is rendered, so the controls are never duplicated.
  const [isXl, setIsXl] = useState(false);
  useEffect(() => {
    if (typeof window.matchMedia !== "function") return;
    const mq = window.matchMedia("(min-width: 1280px)");
    const apply = () => setIsXl(mq.matches);
    apply();
    mq.addEventListener?.("change", apply);
    return () => mq.removeEventListener?.("change", apply);
  }, []);

  const { cohorts } = useActiveCohorts();
  const next = nextOpenCohort(cohorts);

  // Navigate to an in-page anchor; if currently on a different route,
  // route to "/" first then scroll once the target mounts.
  const goToAnchor = (hash: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    const id = hash.replace(/^#/, "");
    setOpen(false);
    if (location.pathname !== homePath) {
      navigate(homePath + hash);
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

  // Course + resource menus, from src/lib/siteNav.ts. The desktop menus render
  // them through NavDropdown, which keeps every link in the served HTML; the
  // mobile menu lists the same links below, the audiences indented under the
  // group course as in the owner's structure.
  const courseMenu = courseLinks(lang);
  const resourceMenu = resourceLinks(lang);

  const langSwitcher = (tone: "light" | "dark") => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={t.languageLabel}
          className={cn(
            "inline-flex items-center gap-1.5 text-sm font-semibold transition-colors",
            tone === "dark"
              ? "text-white/90 hover:text-white"
              : "rounded-full border border-border px-3 py-2 text-muted-foreground hover:text-foreground min-h-9",
          )}
        >
          {lang === "ro" ? (
            <FlagRO className="h-3.5 w-5 rounded-[2px] shadow-xs" />
          ) : (
            <FlagGB className="h-3.5 w-5 rounded-[2px] shadow-xs" />
          )}
          <span className={cn("uppercase", tone === "light" && "hidden sm:inline")}>{lang}</span>
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
  );

  const themeButton = (tone: "light" | "dark") => (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={cn(
        "inline-flex items-center justify-center transition-colors",
        tone === "dark" ? "h-7 w-7 text-white/90 hover:text-white" : "h-10 w-10 rounded-full hover:bg-muted text-foreground",
      )}
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );

  const nextLabel = next
    ? `${next.level} ${next.format === "fizic" ? (lang === "en" ? "in person" : "fizic") : "online"} · ${shortDate(next.start_date, lang)}`
    : null;
  const seatsLabel = next
    ? lang === "en"
      ? `${next.seatsLeft} seats free`
      : `${next.seatsLeft} locuri libere`
    : null;

  const navLinkClass = (active: boolean) =>
    cn(
      "relative whitespace-nowrap rounded-[10px] px-3 py-2 text-foreground transition-colors hover:bg-cream",
      active &&
        "font-semibold text-brand-green after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:rounded-full after:bg-primary",
    );

  return (
    <nav ref={navRef} className="fixed top-0 left-0 right-0 z-50">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-[60] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-primary-foreground"
      >
        {lang === "en" ? "Skip to content" : "Sari la conținut"}
      </a>

      {/* Green band: the next course to join (live from the database), then
          contact, booking, theme and language. Folds away once scrolled. */}
      <div
        className={cn(
          "overflow-hidden bg-brand-green text-white transition-[height] duration-200 dark:bg-[#163a2a]",
          scrolled ? "h-0" : "h-[38px]",
        )}
        aria-hidden={scrolled || undefined}
      >
        <div className="flex h-[38px] w-full items-center gap-4 px-gutter text-[13px] xl:px-8">
          {next ? (
            <Link
              to={cohortHref(next)}
              tabIndex={scrolled ? -1 : undefined}
              className="inline-flex min-w-0 items-center gap-1 truncate rounded-full bg-white/[0.12] px-3 py-1 font-semibold transition-colors hover:bg-white/20"
            >
              <span className="hidden sm:inline">{lang === "en" ? "Next course:" : "Următorul curs:"}</span>
              <span className="text-[#E9C77B]">{nextLabel}</span>
              <span className="hidden md:inline">· {seatsLabel}</span>
              <span aria-hidden="true">→</span>
            </Link>
          ) : (
            <Link
              to="/trial"
              tabIndex={scrolled ? -1 : undefined}
              className="inline-flex items-center gap-1 rounded-full bg-white/[0.12] px-3 py-1 font-semibold hover:bg-white/20"
            >
              {lang === "en" ? "The first trial lesson is free →" : "Prima lecție de probă e gratuită →"}
            </Link>
          )}
          <span className="hidden items-center gap-1.5 text-white/90 lg:inline-flex">
            <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
            {lang === "en" ? "Bucharest · online" : "București · online"}
          </span>
          {/* WhatsApp and Programare are buttons, not plain links: the owner
              wants them found at a glance, on phones too. */}
          <div className="ml-auto flex items-center gap-2 md:gap-3">
            <a href="tel:+40763124514" tabIndex={scrolled ? -1 : undefined} className="mr-2 hidden items-center gap-1.5 text-white/90 hover:text-white md:inline-flex">
              <Phone className="h-3.5 w-3.5" aria-hidden="true" />
              +40 763 124 514
            </a>
            <a
              href="https://wa.me/40763124514"
              target="_blank"
              rel="noopener noreferrer"
              tabIndex={scrolled ? -1 : undefined}
              aria-label="WhatsApp"
              className="inline-flex h-7 items-center gap-1.5 rounded-full bg-[#25D366] px-2.5 font-semibold text-white transition-opacity hover:opacity-90 sm:px-3"
            >
              <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="hidden sm:inline">WhatsApp</span>
            </a>
            <Link
              to={lang === "en" ? "/en/booking" : "/booking"}
              tabIndex={scrolled ? -1 : undefined}
              className="inline-flex h-7 items-center gap-1.5 rounded-full bg-white px-3 font-semibold text-brand-green transition-opacity hover:opacity-90"
            >
              <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
              {t.navBooking}
            </Link>
            {isXl && <span className="ml-2 h-3.5 w-px bg-white/30" aria-hidden="true" />}
            {isXl && (
              <span className="flex items-center gap-3">
                {themeButton("dark")}
                {langSwitcher("dark")}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main bar: full width — logo at the left edge, every link visible,
          the two actions at the right edge. */}
      <div
        className={cn(
          "relative border-b border-border bg-background/95 backdrop-blur-md transition-[height,box-shadow] duration-200",
          scrolled ? "shadow-[0_6px_18px_rgba(26,26,26,0.06)]" : "",
        )}
      >
        <div
          className={cn(
            "flex w-full items-center justify-between gap-4 px-gutter transition-[height] duration-200 xl:px-8",
            scrolled ? "h-[4.25rem] md:h-16" : "h-[4.25rem] md:h-[76px]",
          )}
        >
          <a
            href={lang === "en" ? "/en" : "/"}
            onClick={(e) => {
              e.preventDefault();
              const home = lang === "en" ? "/en" : "/";
              if (location.pathname === home) {
                window.scrollTo({ top: 0, behavior: "smooth" });
              } else {
                navigate(home);
              }
            }}
            aria-label="Centrul de Arabă Libaneză — arabă libaneză cu Ibra"
            className="flex h-14 min-w-0 flex-1 items-center pr-3 xl:flex-none xl:pr-4"
          >
            <BrandLogo />
          </a>

          {/* xl, not lg: with seven links, the logo and the two buttons the bar
              needs about 1200px. Below that the hamburger carries everything. */}
          <div className="hidden xl:flex items-center gap-0.5 text-[15px] font-medium">
            <CourseMegaMenu
              label={t.navCourses}
              lang={lang === "en" ? "en" : "ro"}
              courses={courseMenu}
              next={next}
            />
            <div className="relative px-3 py-2 text-foreground">
              <NavDropdown label={lang === "en" ? "Resources" : "Resurse"} items={resourceMenu} />
            </div>
            <Link to={lang === "en" ? "/en/blog" : "/blog"} onClick={() => setOpen(false)} className={navLinkClass(false)}>
              {t.navBlog}
            </Link>
            {links.map((l) => (
              <a
                key={l.href}
                // "/#faq", not "#faq": these sections live on the homepage, so on
                // any other page a bare hash points at an id that is not there.
                href={`/${l.href}`}
                onClick={goToAnchor(l.href)}
                className={navLinkClass(activeSection === l.href.slice(1))}
              >
                {l.label}
              </a>
            ))}
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <Link
              to="/trial"
              className="hidden xl:inline-flex h-11 items-center rounded-xl bg-primary px-5 text-[15px] font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              {lang === "en" ? "Free lesson" : "Lecție gratuită"}
            </Link>
            <a
              href="/#programs"
              onClick={goToAnchor("#programs")}
              className="hidden xl:inline-flex h-11 items-center rounded-xl border-[1.5px] border-brand-green px-5 text-[15px] font-semibold text-brand-green transition-colors hover:bg-brand-green/5"
            >
              {t.navEnroll}
            </a>
            {/* Below xl the band has no room for these, so they sit here. */}
            {!isXl && (
              <span className="flex items-center gap-2">
                {themeButton("light")}
                {langSwitcher("light")}
              </span>
            )}
            <button
              onClick={() => setOpen(!open)}
              className="xl:hidden flex items-center justify-center min-w-11 min-h-11 -mr-1 text-foreground"
              aria-label={open ? t.navCloseMenuLabel : t.navOpenMenuLabel}
              aria-expanded={open}
              aria-controls="mobile-navigation"
            >
              {open ? <X className="w-5 h-5" aria-hidden="true" /> : <Menu className="w-5 h-5" aria-hidden="true" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div id="mobile-navigation" className="xl:hidden max-h-[calc(100vh-8rem)] overflow-y-auto border-b border-border bg-background/95 backdrop-blur-md animate-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col px-6 py-2 gap-1">
            <div className="flex flex-wrap gap-2 py-3">
              <Link
                to="/trial"
                onClick={() => setOpen(false)}
                className="inline-flex h-11 flex-1 items-center justify-center rounded-xl bg-primary px-5 text-[15px] font-semibold text-primary-foreground"
              >
                {lang === "en" ? "Free lesson" : "Lecție gratuită"}
              </Link>
              <a
                href="/#programs"
                onClick={goToAnchor("#programs")}
                className="inline-flex h-11 flex-1 items-center justify-center rounded-xl border-[1.5px] border-brand-green px-5 text-[15px] font-semibold text-brand-green"
              >
                {t.navEnroll}
              </a>
            </div>
            {next && (
              <Link
                to={cohortHref(next)}
                onClick={() => setOpen(false)}
                className="mb-2 rounded-xl bg-brand-green/10 px-4 py-3 text-sm font-semibold text-brand-green"
              >
                {lang === "en" ? "Next course: " : "Următorul curs: "}
                {nextLabel} · {seatsLabel} →
              </Link>
            )}
            <Link
              to={lang === "en" ? "/en/courses" : "/cursuri"}
              onClick={() => setOpen(false)}
              className="text-base font-medium text-foreground/90 hover:text-foreground transition-colors py-3 min-h-12 flex items-center gap-2"
            >
              <GraduationCap className="w-4 h-4" aria-hidden="true" />
              {t.navCourses}
            </Link>
            <div className="flex flex-col pl-6">
              {courseMenu.map((item, i) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "text-sm text-muted-foreground hover:text-foreground transition-colors py-2.5 min-h-10 flex items-center",
                    i > 0 && !/\/private$/.test(item.to) && "pl-4",
                  )}
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
              to={lang === "en" ? "/en/booking" : "/booking"}
              onClick={() => setOpen(false)}
              className="text-base font-medium text-foreground/90 hover:text-foreground transition-colors py-3 min-h-12 flex items-center gap-2"
            >
              <Calendar className="w-4 h-4" aria-hidden="true" />
              {t.navBooking}
            </Link>
            <Link
              to={lang === "en" ? "/en/blog" : "/blog"}
              onClick={() => setOpen(false)}
              className="text-base font-medium text-foreground/90 hover:text-foreground transition-colors py-3 min-h-12 flex items-center gap-2"
            >
              {t.navBlog}
            </Link>
            {links.map((l) => (
              <a
                key={l.href}
                href={`/${l.href}`}
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
