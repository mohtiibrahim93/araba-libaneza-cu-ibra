import { useI18n } from "@/lib/i18n";
import { MessageCircle, Mail, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import AnchorLink from "@/components/AnchorLink";
import BrandLogo from "@/components/BrandLogo";
import SocialLinks from "@/components/SocialLinks";

const WHATSAPP_URL = "https://wa.me/40763124514";

const Footer = () => {
  const { t, lang } = useI18n();

  return (
    <footer className="border-t border-border bg-card">
      {/* 12-col grid with content-sized spans + generous gaps so long strings
          (email, legal labels) never collide with neighbouring columns. */}
      <div className="max-w-6xl mx-auto px-6 py-20 grid gap-x-12 gap-y-14 sm:grid-cols-2 lg:grid-cols-12">
        {/* Brand */}
        <div className="sm:col-span-2 lg:col-span-3">
          <BrandLogo full className="mb-4" />
          <p className="text-sm text-muted-foreground leading-relaxed">
            {t.footerTagline}
          </p>
          <p className="mt-2 text-xs italic text-muted-foreground/80">
            {lang === "en" ? "Lebanese Arabic, explained simply." : "Arabă libaneză, explicată simplu."}
          </p>
          <SocialLinks className="mt-4" />
        </div>

        {/* Courses */}
        <div className="lg:col-span-2">
          <p className="text-sm font-semibold text-foreground mb-4">{t.navCourses}</p>
          <ul className="space-y-3 text-sm leading-relaxed text-muted-foreground">
            <li><Link to="/cursuri/grup" className="hover:text-foreground transition-colors">{t.courseGrupH1}</Link></li>
            <li><Link to="/cursuri/private" className="hover:text-foreground transition-colors">{t.coursePrivateH1}</Link></li>
            <li><Link to="/cursuri/copii" className="hover:text-foreground transition-colors">{t.courseCopiiH1}</Link></li>
            <li><Link to="/cursuri/tineri" className="hover:text-foreground transition-colors">{lang === "en" ? "Teens (11–18)" : "Adolescenți (11–18)"}</Link></li>
            <li><Link to="/meditatii-araba" className="hover:text-foreground transition-colors">{lang === "en" ? "1-on-1 tutoring" : "Meditații arabă 1:1"}</Link></li>
            <li><Link to="/cursuri-araba-bucuresti" className="hover:text-foreground transition-colors">{lang === "en" ? "Courses in Bucharest" : "Cursuri arabă București"}</Link></li>
            <li><Link to="/invata-araba" className="hover:text-foreground transition-colors">{lang === "en" ? "Learn Arabic — guide" : "Învață araba — ghid"}</Link></li>
            <li><Link to="/cursuri-araba" className="hover:text-foreground transition-colors">{lang === "en" ? "Arabic courses — overview" : "Cursuri de arabă — toate formatele"}</Link></li>
            <li><Link to="/araba-pentru-incepatori" className="hover:text-foreground transition-colors">{lang === "en" ? "Arabic for beginners" : "Arabă pentru începători"}</Link></li>
            <li><Link to="/invata-araba-gratis" className="hover:text-foreground transition-colors">{lang === "en" ? "Learn Arabic free" : "Învață araba gratis"}</Link></li>
            <li><Link to="/resurse" className="hover:text-foreground transition-colors">{lang === "en" ? "Free resources" : "Resurse gratuite"}</Link></li>
            <li><Link to="/araba-online" className="hover:text-foreground transition-colors">{lang === "en" ? "Arabic online" : "Arabă online"}</Link></li>
          </ul>
        </div>

        {/* Quick links */}
        <div className="lg:col-span-2">
          <p className="text-sm font-semibold text-foreground mb-4">{t.footerQuickLinks}</p>
          <ul className="space-y-3 text-sm leading-relaxed text-muted-foreground">
            <li><AnchorLink to="#about" className="hover:text-foreground transition-colors">{t.navWhy}</AnchorLink></li>
            {/* The homepage has no #curriculum block; the group-course page
                lists every CEFR level with its full curriculum. */}
            <li><Link to="/cursuri/grup" className="hover:text-foreground transition-colors">{t.navCurriculum}</Link></li>
            <li><AnchorLink to="#testimonials" className="hover:text-foreground transition-colors">{t.navTestimonials}</AnchorLink></li>
            <li><AnchorLink to="#programs" className="hover:text-foreground transition-colors">{t.navEnroll}</AnchorLink></li>
            <li><Link to="/en/learn-lebanese-arabic" className="hover:text-foreground transition-colors" hrefLang="en">Learn Lebanese Arabic</Link></li>
            <li><Link to="/en/learn-levantine-arabic" className="hover:text-foreground transition-colors" hrefLang="en">Learn Levantine Arabic</Link></li>
            <li><Link to="/en/arabic-tutor" className="hover:text-foreground transition-colors" hrefLang="en">Arabic tutor</Link></li>
            <li><Link to="/en/arabic-dialects-guide" className="hover:text-foreground transition-colors" hrefLang="en">Arabic dialects guide</Link></li>
          </ul>
        </div>

        {/* Contact */}
        <div className="lg:col-span-3">
          <p className="text-sm font-semibold text-foreground mb-4">{t.footerContact}</p>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-primary" />
              <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">
                +40 763 124 514
              </a>
            </li>
            <li className="flex items-start gap-2">
              <Mail className="w-4 h-4 text-primary mt-0.5" />
              {/* <wbr/> after the @ so the address breaks cleanly in two
                  (marhaba@ / domain) instead of mid-word when space is tight. */}
              <a href="mailto:marhaba@centruldearabalibaneza.com" className="hover:text-foreground transition-colors leading-snug">
                marhaba@<wbr />centruldearabalibaneza.com
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
        <div className="lg:col-span-2">
          <p className="text-sm font-semibold text-foreground mb-4">{t.footerLegal}</p>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li><Link to="/privacy" className="hover:text-foreground transition-colors">{t.footerPrivacy}</Link></li>
            <li><Link to="/terms" className="hover:text-foreground transition-colors">{t.footerTerms}</Link></li>
            <li><Link to="/stergere-date" className="hover:text-foreground transition-colors">{lang === "en" ? "Delete my data (GDPR)" : "Ștergerea datelor (GDPR)"}</Link></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border py-8 text-center">
        <p className="text-xs text-muted-foreground">{t.footer}</p>
      </div>
    </footer>
  );
};

export default Footer;
