import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { ChevronDown, Menu, X, GraduationCap, Calendar, Sun, Moon } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { scrollToAnchor, scrollToAnchorWhenReady } from "@/lib/scrollToAnchor";
import { Button } from "@/components/ui/button";
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
    { href: "#pricing", label: t.navPricing },
    { href: "#testimonials", label: t.navTestimonials },
    { href: "#faq", label: t.navFaq },
    { href: "#contact", label: t.navContact },
  ];

  const courseLinks = [
    { to: "/cursuri", label: t.cursuriH1 },
    { to: "/cursuri/adulti", label: t.trackAdultiTitle },
    { to: "/cursuri/tineri", label: t.trackTineriTitle },
    { to: "/cursuri/copii", label: t.trackCopiiTitle },
    { to: "/cursuri/grup", label: t.courseGrupH1 },
    { to: "/cursuri/private", label: t.coursePrivateH1 },
  ];

  return (
    <nav ref={navRef} className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-md border-b border-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
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
          aria-label={`${t.siteTitle} — ${t.lebanonFlagLabel}`}
          className="flex h-10 min-w-0 flex-1 items-center gap-2.5 pr-2 text-base font-bold text-foreground tracking-tight sm:text-xl md:max-w-none md:flex-none md:pr-0"
        >
          <span
            role="img"
            aria-label={t.lebanonFlagLabel}
            className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-sm border border-border bg-background text-[24px] leading-none"
          >
            🇱🇧
          </span>
          <span className="line-clamp-2 min-w-0 max-w-[9.5rem] leading-tight sm:max-w-[16rem] sm:line-clamp-1 md:max-w-none">
            {t.siteTitle}
          </span>
        </a>

        <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground font-medium">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                aria-label={t.navCoursesDropdownLabel}
                className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
              >
                {t.navCourses}
                <ChevronDown className="h-3.5 w-3.5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="min-w-56">
              {courseLinks.map((c) => (
                <DropdownMenuItem key={c.to} asChild>
                  <Link to={c.to} onClick={() => setOpen(false)}>
                    {c.label}
                  </Link>
                </DropdownMenuItem>
              ))}
              <DropdownMenuItem asChild>
                <a href="#programs" onClick={goToAnchor("#programs")} className="text-primary font-medium">
                  {t.courseSeeAllPrograms}
                </a>
              </DropdownMenuItem>
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
          {/* Quick access: jump to Programs from any page */}
          <a
            href="/#programs"
            onClick={goToAnchor("#programs")}
            aria-label={t.navEnroll}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-muted md:hidden lg:inline-flex"
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
                <span aria-hidden="true">{lang === "ro" ? "🇷🇴" : "🇬🇧"}</span>
                <span className="hidden sm:inline uppercase">{lang}</span>
                <ChevronDown className="h-3.5 w-3.5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-36">
              <DropdownMenuItem onClick={() => setLang("ro")} className="gap-2">
                <span aria-hidden="true">🇷🇴</span>
                <span>{t.languageRomanian}</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLang("en")} className="gap-2">
                <span aria-hidden="true">🇬🇧</span>
                <span>{t.languageEnglish}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden p-2 text-foreground"
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
            <div className="py-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground px-1 mb-1">
                {t.navCourses}
              </p>
              {courseLinks.map((c) => (
                <Link
                  key={c.to}
                  to={c.to}
                  onClick={() => setOpen(false)}
                  className="text-base font-medium text-foreground/90 hover:text-foreground transition-colors py-2.5 min-h-11 flex items-center"
                >
                  {c.label}
                </Link>
              ))}
              <a
                href="#programs"
                onClick={goToAnchor("#programs")}
                className="text-sm font-medium text-primary py-2.5 min-h-10 flex items-center"
              >
                {t.courseSeeAllPrograms}
              </a>
            </div>
            <Link
              to="/booking"
              onClick={() => setOpen(false)}
              className="text-base font-medium text-foreground/90 hover:text-foreground transition-colors py-3 min-h-12 flex items-center gap-2"
            >
              <Calendar className="w-4 h-4" aria-hidden="true" />
              {t.navBooking}
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
