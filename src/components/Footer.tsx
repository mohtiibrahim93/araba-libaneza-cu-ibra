import { useI18n } from "@/lib/i18n";
import { MessageCircle, Mail, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import AnchorLink from "@/components/AnchorLink";

const WHATSAPP_URL = "https://wa.me/40763124514";

const Footer = () => {
  const { t } = useI18n();

  return (
    <footer className="border-t border-border bg-card">
      <div className="max-w-6xl mx-auto px-6 py-12 grid sm:grid-cols-2 lg:grid-cols-5 gap-10">
        {/* Brand */}
        <div>
          <p className="inline-flex items-center gap-2 text-lg font-bold text-foreground mb-2">
            <span
              role="img"
              aria-label={t.lebanonFlagLabel}
              className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-sm border border-border bg-background text-[22px] leading-none"
            >
              🇱🇧
            </span>
            <span>{t.siteTitle}</span>
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {t.footerTagline}
          </p>
        </div>

        {/* Courses */}
        <div>
          <p className="text-sm font-semibold text-foreground mb-3">{t.navCourses}</p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/cursuri/grup" className="hover:text-foreground transition-colors">{t.courseGrupH1}</Link></li>
            <li><Link to="/cursuri/private" className="hover:text-foreground transition-colors">{t.coursePrivateH1}</Link></li>
            <li><Link to="/cursuri/copii" className="hover:text-foreground transition-colors">{t.courseCopiiH1}</Link></li>
            <li><Link to="/cursuri/online" className="hover:text-foreground transition-colors">{t.courseOnlineH1}</Link></li>
          </ul>
        </div>

        {/* Quick links */}
        <div>
          <p className="text-sm font-semibold text-foreground mb-3">{t.footerQuickLinks}</p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><AnchorLink to="#about" className="hover:text-foreground transition-colors">{t.navWhy}</AnchorLink></li>
            <li><AnchorLink to="#curriculum" className="hover:text-foreground transition-colors">{t.navCurriculum}</AnchorLink></li>
            <li><AnchorLink to="#testimonials" className="hover:text-foreground transition-colors">{t.navTestimonials}</AnchorLink></li>
            <li><AnchorLink to="#programs" className="hover:text-foreground transition-colors">{t.navEnroll}</AnchorLink></li>
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
              <a
                href="https://www.google.com/maps/search/?api=1&query=Raduga+Creative+Center+Strada+Icoanei+80+Bucuresti"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors"
              >
                Raduga Creative Center, Strada Icoanei 80, București
              </a>
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
