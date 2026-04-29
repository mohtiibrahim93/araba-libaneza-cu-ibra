import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { ChevronDown, MessageCircle, Menu, X } from "lucide-react";
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

  const links = [
    { href: "#courses", label: t.navCourses },
    { href: "#pricing", label: t.navPricing },
    { href: "#testimonials", label: t.navTestimonials },
    { href: "#faq", label: t.navFaq },
    { href: "#contact", label: t.navContact },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-md border-b border-border">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Tooltip>
          <TooltipTrigger asChild>
            <a
              href="#"
              aria-label={`${t.siteTitle} — ${t.lebanonFlagLabel}`}
              className="inline-flex items-center gap-2 text-lg sm:text-xl font-bold text-foreground tracking-tight min-w-0"
            >
              <span
                role="img"
                aria-label={t.lebanonFlagLabel}
                className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-sm border border-border bg-background text-[22px] leading-none sm:h-7 sm:w-7 sm:text-[26px]"
              >
                🇱🇧
              </span>
              <span className="truncate">{t.siteTitle}</span>
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

        <div className="flex items-center gap-3">
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
                    onClick={() => setOpen(false)}
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
