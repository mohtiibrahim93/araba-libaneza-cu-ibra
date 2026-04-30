import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { ChevronDown, MessageCircle, Menu, X, GraduationCap } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const WHATSAPP_URL = "https://wa.me/40763124514";

const Navbar = () => {
  const { t, setLang, lang } = useI18n();
  const [open, setOpen] = useState(false);
  const navRef = useRef<HTMLElement | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Navigate to an in-page anchor; if currently on a different route,
  // route to "/" first then scroll once the target mounts.
  const goToAnchor = (hash: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    const id = hash.replace(/^#/, "");
    setOpen(false);
    if (location.pathname !== "/") {
      navigate("/" + hash);
      // Defer until Index renders
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
      }, 80);
      return;
    }
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
      history.replaceState(null, "", hash);
    }
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
    { href: "#courses", label: t.navCourses },
    { href: "#pricing", label: t.navPricing },
    { href: "#testimonials", label: t.navTestimonials },
    { href: "#faq", label: t.navFaq },
    { href: "#contact", label: t.navContact },
  ];

  return (
    <nav ref={navRef} className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-md border-b border-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        <Tooltip>
          <TooltipTrigger asChild>
            <a
              href="#"
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
          </TooltipTrigger>
          <TooltipContent side="bottom">{t.lebanonFlagLabel}</TooltipContent>
        </Tooltip>

        <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground font-medium">
          {links.map((l) => (
            <Tooltip key={l.href}>
              <TooltipTrigger asChild>
                <a
                  href={l.href}
                  onClick={goToAnchor(l.href)}
                  aria-label={l.label}
                  className="hover:text-foreground transition-colors"
                >
                  {l.label}
                </a>
              </TooltipTrigger>
              <TooltipContent side="bottom">{l.label}</TooltipContent>
            </Tooltip>
          ))}
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          {/* Quick access: jump to Programs from any page */}
          <Tooltip>
            <TooltipTrigger asChild>
              <a
                href="/#courses"
                onClick={goToAnchor("#courses")}
                aria-label={t.navCourses}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-muted md:hidden lg:inline-flex"
              >
                <GraduationCap className="w-4 h-4 text-primary" aria-hidden="true" />
                <span className="hidden sm:inline">{t.navCourses}</span>
              </a>
            </TooltipTrigger>
            <TooltipContent side="bottom">{t.navCourses}</TooltipContent>
          </Tooltip>
          <DropdownMenu>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    aria-label={t.languageLabel}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <span aria-hidden="true">{lang === "ro" ? "🇷🇴" : "🇬🇧"}</span>
                    <span className="hidden sm:inline uppercase">{lang}</span>
                    <ChevronDown className="h-3.5 w-3.5" />
                  </button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent side="bottom">{t.languageLabel}</TooltipContent>
            </Tooltip>
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
          <Tooltip>
            <TooltipTrigger asChild>
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={t.navWhatsappLabel}
                className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold bg-primary text-primary-foreground rounded-lg transition-all hover:bg-primary/90"
              >
                <MessageCircle className="w-4 h-4" aria-hidden="true" />
                <span className="hidden sm:inline">{t.navCta}</span>
              </a>
            </TooltipTrigger>
            <TooltipContent side="bottom">{t.navWhatsappLabel}</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => setOpen(!open)}
                className="md:hidden p-2 text-foreground"
                aria-label={open ? t.navCloseMenuLabel : t.navOpenMenuLabel}
                aria-expanded={open}
                aria-controls="mobile-navigation"
              >
                {open ? <X className="w-5 h-5" aria-hidden="true" /> : <Menu className="w-5 h-5" aria-hidden="true" />}
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom">{open ? t.navCloseMenuLabel : t.navOpenMenuLabel}</TooltipContent>
          </Tooltip>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div id="mobile-navigation" className="md:hidden border-t border-border bg-background/95 backdrop-blur-md animate-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col px-6 py-4 gap-3">
            {links.map((l) => (
              <Tooltip key={l.href}>
                <TooltipTrigger asChild>
                  <a
                    href={l.href}
                    aria-label={l.label}
                  onClick={goToAnchor(l.href)}
                    className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2"
                  >
                    {l.label}
                  </a>
                </TooltipTrigger>
                <TooltipContent side="right">{l.label}</TooltipContent>
              </Tooltip>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
