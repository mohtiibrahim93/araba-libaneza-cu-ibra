import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { ChevronDown, Menu, X, GraduationCap, Calendar, Sun, Moon } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { scrollToAnchor, scrollToAnchorWhenReady } from "@/lib/scrollToAnchor";
import { Button } from "@/components/ui/button";
import BrandLogo from "@/components/BrandLogo";
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
          aria-label="7ki Lebnene — Arabă libaneză cu Ibra"
          className="flex h-12 min-w-0 flex-1 items-center pr-2 md:max-w-none md:flex-none md:pr-0"
        >
          <BrandLogo />
        </a>

        <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground font-medium">
          <Link
            to="/cursuri"
            onClick={() => setOpen(false)}
            className="hover:text-foreground transition-colors"
          >
            {t.navCourses}
          </Link>
          <Link
            to="/booking"
            onClick={() => setOpen(false)}
            className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors"
          >
            <Calendar className="w-4 h-4" aria-hidden="true" />
            {t.navBooking}
          </Link>
          <Link
            to="/blog/cum-inveti-araba-libaneza"
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
            <Link
              to="/booking"
              onClick={() => setOpen(false)}
              className="text-base font-medium text-foreground/90 hover:text-foreground transition-colors py-3 min-h-12 flex items-center gap-2"
            >
              <Calendar className="w-4 h-4" aria-hidden="true" />
              {t.navBooking}
            </Link>
            <Link
              to="/blog/cum-inveti-araba-libaneza"
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
