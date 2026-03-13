import { useI18n } from "@/lib/i18n";
import { MessageCircle } from "lucide-react";

const WHATSAPP_URL = "https://wa.me/40763124514";

const Navbar = () => {
  const { t, toggle, lang } = useI18n();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-md border-b border-border">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <a href="#" className="text-xl font-bold text-foreground tracking-tight">
          Arabă Libaneză cu Ibra
        </a>

        <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground font-medium">
          <a href="#courses" className="hover:text-foreground transition-colors">{t.navCourses}</a>
          <a href="#pricing" className="hover:text-foreground transition-colors">{t.navPricing}</a>
          <a href="#testimonials" className="hover:text-foreground transition-colors">{t.navTestimonials}</a>
          <a href="#faq" className="hover:text-foreground transition-colors">{t.navFaq}</a>
          <a href="#contact" className="hover:text-foreground transition-colors">{t.navContact}</a>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={toggle}
            className="text-xs font-semibold tracking-wider uppercase px-3 py-1.5 rounded-full border border-border text-muted-foreground hover:text-foreground transition-colors"
          >
            {lang === "ro" ? "EN" : "RO"}
          </button>
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold bg-primary text-primary-foreground rounded-lg transition-all hover:bg-primary/90"
          >
            <MessageCircle className="w-4 h-4" />
            <span className="hidden sm:inline">{t.navCta}</span>
          </a>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
