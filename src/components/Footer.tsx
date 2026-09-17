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

        {/* Guides and open groups. The course pages and the free resources are
            not repeated here: the navbar menus carry them, and since those
            menus now render into the served HTML the footer no longer has to
            be the site's only crawlable navigation. It was carrying forty-two
            links for that reason alone. */}
        <div className="lg:col-span-2">
          <p className="text-sm font-semibold text-foreground mb-4">
            {lang === "en" ? "Guides" : "Ghiduri"}
          </p>
          <ul className="space-y-3 text-sm leading-relaxed text-muted-foreground">
            <li><Link to="/cursuri-limba-araba" className="hover:text-foreground transition-colors">{lang === "en" ? "Arabic courses — overview" : "Cursuri de arabă — toate formatele"}</Link></li>
            <li><Link to="/curs-araba-copii" className="hover:text-foreground transition-colors">{lang === "en" ? "Arabic course for children" : "Curs de arabă pentru copii"}</Link></li>
            <li><Link to={lang === "en" ? "/en/best-arabic-course" : "/cel-mai-bun-curs-de-araba"} className="hover:text-foreground transition-colors">{lang === "en" ? "Best Arabic course guide" : "Cel mai bun curs de arabă"}</Link></li>
            <li><Link to="/intrebari-frecvente" className="hover:text-foreground transition-colors">{lang === "en" ? "FAQ" : "Întrebări frecvente"}</Link></li>
          </ul>

          <p className="text-sm font-semibold text-foreground mt-8 mb-4">
            {lang === "en" ? "Open groups" : "Grupe deschise"}
          </p>
          <ul className="space-y-3 text-sm leading-relaxed text-muted-foreground">
            <li><Link to={lang === "en" ? "/en/courses/group/b1" : "/cursuri/grup/b1"} className="hover:text-foreground transition-colors">{lang === "en" ? "Group B1" : "Grupă B1"}</Link></li>
            <li><Link to={lang === "en" ? "/en/courses/group/b2" : "/cursuri/grup/b2"} className="hover:text-foreground transition-colors">{lang === "en" ? "Group B2" : "Grupă B2"}</Link></li>
            <li><Link to={lang === "en" ? "/en/courses/group/c1" : "/cursuri/grup/c1"} className="hover:text-foreground transition-colors">{lang === "en" ? "Group C1" : "Grupă C1"}</Link></li>
            <li><Link to={lang === "en" ? "/en/courses/group/c2" : "/cursuri/grup/c2"} className="hover:text-foreground transition-colors">{lang === "en" ? "Group C2" : "Grupă C2"}</Link></li>
          </ul>
        </div>

        {/* Quick links */}
        <div className="lg:col-span-2">
          <p className="text-sm font-semibold text-foreground mb-4">{t.footerQuickLinks}</p>
          <ul className="space-y-3 text-sm leading-relaxed text-muted-foreground">
            <li><Link to="/test-de-nivel" className="hover:text-foreground transition-colors">{lang === "en" ? "Level test" : "Test de nivel"}</Link></li>
            <li><Link to={lang === "en" ? "/en/quiz" : "/quiz"} className="hover:text-foreground transition-colors">{lang === "en" ? "Find your course" : "Găsește cursul potrivit"}</Link></li>
            <li><Link to={lang === "en" ? "/en/find-your-page" : "/te-ajutam"} className="hover:text-foreground transition-colors">{lang === "en" ? "Find your page" : "Te ajutăm să găsești"}</Link></li>
            <li><Link to={lang === "en" ? "/en/trial" : "/trial"} className="hover:text-foreground transition-colors">{lang === "en" ? "Free trial lesson" : "Lecție de probă gratuită"}</Link></li>
            <li><AnchorLink to="#about" className="hover:text-foreground transition-colors">{t.navWhy}</AnchorLink></li>
          </ul>
        </div>

        {/* The navbar menus are written in whichever language the reader has
            selected, so on the Romanian side these pages have no other link in
            the chrome. Without them the English half of the site is reachable
            only from the language toggle, which is JavaScript. */}
        <div className="lg:col-span-2">
          <p className="text-sm font-semibold text-foreground mb-4">
            {lang === "en" ? "More in English" : "English"}
          </p>
          <ul className="space-y-3 text-sm leading-relaxed text-muted-foreground">
            <li><Link to="/en/learn-lebanese-arabic" className="hover:text-foreground transition-colors" hrefLang="en">Learn Lebanese Arabic</Link></li>
            <li><Link to="/en/how-to-learn-lebanese-arabic" className="hover:text-foreground transition-colors" hrefLang="en">How to learn Lebanese Arabic</Link></li>
            <li><Link to="/en/arabic-tutor" className="hover:text-foreground transition-colors" hrefLang="en">Arabic tutor</Link></li>
            <li><Link to="/en/arabic-dialects-guide" className="hover:text-foreground transition-colors" hrefLang="en">Arabic dialects guide</Link></li>
            <li><Link to="/en/arabic-classes-near-me" className="hover:text-foreground transition-colors" hrefLang="en">Arabic classes near me</Link></li>
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

      </div>

      <div className="border-t border-border">
        {/* Stacked and centred rather than spread left-to-right: the floating
            WhatsApp and phone buttons are pinned to the bottom-right corner of
            the viewport, and a right-aligned row here ends up underneath
            them. */}
        <div className="w-full max-w-content mx-auto px-gutter py-8 flex flex-col items-center gap-3 text-xs text-muted-foreground">
          <ul className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
            <li><Link to={lang === "en" ? "/en/privacy" : "/privacy"} className="hover:text-foreground transition-colors">{t.footerPrivacy}</Link></li>
            <li><Link to={lang === "en" ? "/en/terms" : "/terms"} className="hover:text-foreground transition-colors">{t.footerTerms}</Link></li>
            <li><Link to="/stergere-date" className="hover:text-foreground transition-colors">{lang === "en" ? "Delete my data (GDPR)" : "Ștergerea datelor (GDPR)"}</Link></li>
            <li><Link to={lang === "en" ? "/en/find-your-page" : "/te-ajutam"} className="hover:text-foreground transition-colors">{lang === "en" ? "Find the right page" : "Găsește pagina potrivită"}</Link></li>
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
          <p>{t.footer}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
