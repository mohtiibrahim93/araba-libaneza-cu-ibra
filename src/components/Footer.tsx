import { useI18n } from "@/lib/i18n";
import { MessageCircle, Mail, MapPin } from "lucide-react";
import { Link } from "@/lib/router-compat";
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
      <div className="w-full max-w-content mx-auto px-gutter py-20 grid gap-x-12 gap-y-14 sm:grid-cols-2 lg:grid-cols-12">
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

        {/* Courses — the things you can actually enrol in, then the guides that
            help you choose one. Previously a single flat list of eighteen links
            that mixed the two and repeated the teenagers page twice. */}
        <div className="lg:col-span-2">
          <p className="text-sm font-semibold text-foreground mb-4">{t.navCourses}</p>
          <ul className="space-y-3 text-sm leading-relaxed text-muted-foreground">
            <li><Link to={lang === "en" ? "/en/courses" : "/cursuri"} className="hover:text-foreground transition-colors">{lang === "en" ? "All courses" : "Toate cursurile"}</Link></li>
            <li><Link to={lang === "en" ? "/en/courses/group" : "/cursuri/grup"} className="hover:text-foreground transition-colors">{t.courseGrupH1}</Link></li>
            <li><Link to={lang === "en" ? "/en/courses/private" : "/cursuri/private"} className="hover:text-foreground transition-colors">{t.coursePrivateH1}</Link></li>
            <li><Link to={lang === "en" ? "/en/courses/children" : "/cursuri/copii"} className="hover:text-foreground transition-colors">{t.courseCopiiH1}</Link></li>
            <li><Link to={lang === "en" ? "/en/arabic-for-teenagers" : "/cursuri-araba-adolescenti"} className="hover:text-foreground transition-colors">{lang === "en" ? "Teens (11–17)" : "Adolescenți (11–17)"}</Link></li>
            <li><Link to={lang === "en" ? "/en/courses/adults" : "/cursuri/adulti"} className="hover:text-foreground transition-colors">{lang === "en" ? "Adults" : "Adulți"}</Link></li>
            <li><Link to="/meditatii-araba" className="hover:text-foreground transition-colors">{lang === "en" ? "1-on-1 tutoring" : "Meditații arabă 1:1"}</Link></li>
            <li><Link to="/cursuri-araba-bucuresti" className="hover:text-foreground transition-colors">{lang === "en" ? "Courses in Bucharest" : "Cursuri arabă București"}</Link></li>
          </ul>

          <p className="text-sm font-semibold text-foreground mt-8 mb-4">
            {lang === "en" ? "Guides" : "Ghiduri"}
          </p>
          <ul className="space-y-3 text-sm leading-relaxed text-muted-foreground">
            <li><Link to="/cursuri-limba-araba" className="hover:text-foreground transition-colors">{lang === "en" ? "Arabic courses — overview" : "Cursuri de arabă — toate formatele"}</Link></li>
            <li><Link to="/curs-araba-copii" className="hover:text-foreground transition-colors">{lang === "en" ? "Arabic course for children" : "Curs de arabă pentru copii"}</Link></li>
            <li><Link to={lang === "en" ? "/en/best-arabic-course" : "/cel-mai-bun-curs-de-araba"} className="hover:text-foreground transition-colors">{lang === "en" ? "Best Arabic course guide" : "Cel mai bun curs de arabă"}</Link></li>
            <li><Link to="/ce-araba-sa-inveti" className="hover:text-foreground transition-colors">{lang === "en" ? "Which Arabic to learn" : "Ce arabă să înveți"}</Link></li>
            <li><Link to="/dialecte-arabe" className="hover:text-foreground transition-colors">{lang === "en" ? "Arabic dialects guide" : "Dialectele arabe"}</Link></li>
          </ul>

          <p className="text-sm font-semibold text-foreground mt-8 mb-4">
            {lang === "en" ? "Free & situations" : "Gratuit & situații"}
          </p>
          <ul className="space-y-3 text-sm leading-relaxed text-muted-foreground">
            {/* The practice game. Same reason as the two below: the navbar
                dropdown mounts its contents only when opened, so without this
                the page would be linked nowhere a crawler can see. */}
            <li><Link to="/joc" className="hover:text-foreground transition-colors">{lang === "en" ? "The Yalla game (in Romanian)" : "Jocul Yalla"}</Link></li>
            <li><Link to="/resurse" className="hover:text-foreground transition-colors">{lang === "en" ? "Free resources" : "Resurse gratuite"}</Link></li>
            <li><Link to="/invata-araba-gratis" className="hover:text-foreground transition-colors">{lang === "en" ? "Learn Arabic free" : "Învață araba gratis"}</Link></li>
            <li><Link to="/araba-pentru-partener" className="hover:text-foreground transition-colors">{lang === "en" ? "Arabic for your partner" : "Arabă pentru partener"}</Link></li>
            <li><Link to="/araba-in-familie" className="hover:text-foreground transition-colors">{lang === "en" ? "Arabic in the family" : "Arabă în familie"}</Link></li>
            {/* These two were reachable only from the navbar dropdown, which
                mounts its contents when opened and so never reaches the
                prerendered HTML: both appeared zero times on the homepage. */}
            <li><Link to="/arabizi" className="hover:text-foreground transition-colors">Arabizi</Link></li>
            <li><Link to="/fara-alfabet-arab" className="hover:text-foreground transition-colors">{lang === "en" ? "Without the Arabic alphabet" : "Fără alfabet arab"}</Link></li>
          </ul>
        </div>

        {/* Quick links */}
        <div className="lg:col-span-2">
          <p className="text-sm font-semibold text-foreground mb-4">{t.footerQuickLinks}</p>
          <ul className="space-y-3 text-sm leading-relaxed text-muted-foreground">
            <li><Link to={lang === "en" ? "/en/blog" : "/blog"} className="hover:text-foreground transition-colors">Blog</Link></li>
            <li><Link to={lang === "en" ? "/en/quiz" : "/quiz"} className="hover:text-foreground transition-colors">{lang === "en" ? "Level test" : "Test de nivel"}</Link></li>
            <li><Link to={lang === "en" ? "/en/trial" : "/trial"} className="hover:text-foreground transition-colors">{lang === "en" ? "Free trial lesson" : "Lecție de probă gratuită"}</Link></li>
            <li><Link to={lang === "en" ? "/en/booking" : "/booking"} className="hover:text-foreground transition-colors">{lang === "en" ? "Book a lesson" : "Rezervă o lecție"}</Link></li>
            <li><Link to="/intrebari-frecvente" className="hover:text-foreground transition-colors">{lang === "en" ? "FAQ" : "Întrebări frecvente"}</Link></li>
            <li><Link to={lang === "en" ? "/en/courses/group/b1" : "/cursuri/grup/b1"} className="hover:text-foreground transition-colors">{lang === "en" ? "Group B1" : "Grupă B1"}</Link></li>
            <li><Link to={lang === "en" ? "/en/courses/group/b2" : "/cursuri/grup/b2"} className="hover:text-foreground transition-colors">{lang === "en" ? "Group B2" : "Grupă B2"}</Link></li>
            <li><Link to={lang === "en" ? "/en/courses/group/c1" : "/cursuri/grup/c1"} className="hover:text-foreground transition-colors">{lang === "en" ? "Group C1" : "Grupă C1"}</Link></li>
            <li><Link to={lang === "en" ? "/en/courses/group/c2" : "/cursuri/grup/c2"} className="hover:text-foreground transition-colors">{lang === "en" ? "Group C2" : "Grupă C2"}</Link></li>
            <li><AnchorLink to="#about" className="hover:text-foreground transition-colors">{t.navWhy}</AnchorLink></li>
            <li><AnchorLink to="#testimonials" className="hover:text-foreground transition-colors">{t.navTestimonials}</AnchorLink></li>
            <li><AnchorLink to="#programs" className="hover:text-foreground transition-colors">{t.navEnroll}</AnchorLink></li>
            <li><Link to="/en/learn-lebanese-arabic" className="hover:text-foreground transition-colors" hrefLang="en">Learn Lebanese Arabic</Link></li>
            <li><Link to="/en/arabic-tutor" className="hover:text-foreground transition-colors" hrefLang="en">Arabic tutor</Link></li>
            <li><Link to="/en/arabic-dialects-guide" className="hover:text-foreground transition-colors" hrefLang="en">Arabic dialects guide</Link></li>
            <li><Link to="/en/arabic-classes-near-me" className="hover:text-foreground transition-colors" hrefLang="en">Arabic classes near me</Link></li>
            {/* These two were reachable only from the English navbar, which a
                crawler starting on the Romanian homepage never renders. That
                left one at click depth 3 and the other with a single inbound
                link. The footer ships on every page, so they now sit at depth
                1 like the rest. */}
            <li><Link to="/en/how-to-learn-lebanese-arabic" className="hover:text-foreground transition-colors" hrefLang="en">How to learn Lebanese Arabic</Link></li>
            <li><Link to="/en/lebanese-arabic-vs-msa-vs-egyptian" className="hover:text-foreground transition-colors" hrefLang="en">Lebanese vs MSA vs Egyptian</Link></li>
            <li><Link to="/en/faq" className="hover:text-foreground transition-colors" hrefLang="en">Lebanese Arabic FAQ</Link></li>
            <li><Link to="/de/arabisch-lernen" className="hover:text-foreground transition-colors" hrefLang="de">Arabisch lernen</Link></li>
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
            <li><Link to={lang === "en" ? "/en/privacy" : "/privacy"} className="hover:text-foreground transition-colors">{t.footerPrivacy}</Link></li>
            <li><Link to={lang === "en" ? "/en/terms" : "/terms"} className="hover:text-foreground transition-colors">{t.footerTerms}</Link></li>
            <li><Link to="/stergere-date" className="hover:text-foreground transition-colors">{lang === "en" ? "Delete my data (GDPR)" : "Ștergerea datelor (GDPR)"}</Link></li>
            <li>
              <button
                type="button"
                onClick={() => {
                  const w = window as any;
                  // Adopt exposes a few reopen entry points depending on build.
                  const open =
                    w.adoptWidget?.show ||
                    w.adopt?.showSettings ||
                    w.Adopt?.open ||
                    w.__adoptOpenSettings;
                  if (typeof open === "function") open();
                  else document.querySelector<HTMLElement>("[data-adopt-settings]")?.click();
                }}
                className="hover:text-foreground transition-colors"
              >
                {lang === "en" ? "Cookie settings" : "Setări cookies"}
              </button>
            </li>
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
