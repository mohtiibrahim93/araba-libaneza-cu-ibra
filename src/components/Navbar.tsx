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
        <a href="#" className="inline-flex items-center gap-2 text-lg sm:text-xl font-bold text-foreground tracking-tight">
          <Tooltip>
            <TooltipTrigger asChild>
              <span
                role="img"
                aria-label="Steagul Libanului"
                className="text-xl sm:text-2xl leading-none"
              >
                🇱🇧
              </span>
            </TooltipTrigger>
            <TooltipContent side="bottom">Steagul Libanului</TooltipContent>
          </Tooltip>
          <span>{t.siteTitle}</span>
        </a>

        <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground font-medium">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="hover:text-foreground transition-colors">{l.label}</a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <DropdownMenu>
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
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold bg-primary text-primary-foreground rounded-lg transition-all hover:bg-primary/90"
          >
            <MessageCircle className="w-4 h-4" />
            <span className="hidden sm:inline">{t.navCta}</span>
          </a>
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden p-2 text-foreground"
            aria-label="Toggle menu"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-border bg-background/95 backdrop-blur-md animate-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col px-6 py-4 gap-3">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2"
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
