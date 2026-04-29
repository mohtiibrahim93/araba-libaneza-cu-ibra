import { useI18n } from "@/lib/i18n";
import { MessageCircle, Mail, MapPin } from "lucide-react";

const WHATSAPP_URL = "https://wa.me/40763124514";

const Footer = () => {
  const { t } = useI18n();

  return (
    <footer className="border-t border-border bg-card">
      <div className="max-w-6xl mx-auto px-6 py-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
        {/* Brand */}
        <div>
          <p className="text-lg font-bold text-foreground mb-2">
            {t.siteTitle}
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {t.footerTagline}
          </p>
        </div>

        {/* Quick links */}
        <div>
          <p className="text-sm font-semibold text-foreground mb-3">{t.footerQuickLinks}</p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><a href="#courses" className="hover:text-foreground transition-colors">{t.navCourses}</a></li>
            <li><a href="#pricing" className="hover:text-foreground transition-colors">{t.navPricing}</a></li>
            <li><a href="#testimonials" className="hover:text-foreground transition-colors">{t.navTestimonials}</a></li>
            <li><a href="#faq" className="hover:text-foreground transition-colors">{t.navFaq}</a></li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <p className="text-sm font-semibold text-foreground mb-3">{t.footerContact}</p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-primary" />
              <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">
                +40 763 124 514
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-primary" />
              <a href="mailto:mohtiibrahim@gmail.com" className="hover:text-foreground transition-colors">
                mohtiibrahim@gmail.com
              </a>
            </li>
            <li className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-primary mt-0.5" />
              <span>Raduga Creative Center, București</span>
            </li>
          </ul>
        </div>

        {/* Legal */}
        <div>
          <p className="text-sm font-semibold text-foreground mb-3">{t.footerLegal}</p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><a href="/privacy" className="hover:text-foreground transition-colors">{t.footerPrivacy}</a></li>
            <li><a href="/terms" className="hover:text-foreground transition-colors">{t.footerTerms}</a></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border py-6 text-center">
        <p className="text-xs text-muted-foreground">{t.footer}</p>
      </div>
    </footer>
  );
};

export default Footer;
