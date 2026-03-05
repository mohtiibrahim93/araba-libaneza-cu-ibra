import { useI18n } from "@/lib/i18n";
import CedarTree from "@/components/CedarTree";

const Navbar = () => {
  const { t, toggle, lang } = useI18n();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-lg border-b border-border">
      <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <CedarTree className="text-secondary" size={28} />
          <span className="font-bold text-foreground tracking-wide text-lg" style={{ fontFamily: "var(--font-display)" }}>
            RADUGA
          </span>
        </div>

        <div className="hidden md:flex items-center gap-1 text-sm text-muted-foreground">
          <a href="#inscriere" className="px-4 py-2 hover:text-foreground transition-colors duration-200">{t.navGroup}</a>
          <span className="text-border">|</span>
          <a href="#private" className="px-4 py-2 hover:text-foreground transition-colors duration-200">{t.navPrivate}</a>
          <span className="text-border">|</span>
          <a href="#kids" className="px-4 py-2 hover:text-foreground transition-colors duration-200">{t.navKids}</a>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="#inscriere"
            className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold bg-secondary text-secondary-foreground transition-all duration-200 hover:brightness-110"
          >
            ✦ {t.navCta}
          </a>
          <button
            onClick={toggle}
            className="text-xs font-semibold tracking-wider uppercase px-3 py-2 rounded-lg border border-border hover:bg-muted transition-colors duration-200"
          >
            {lang === "ro" ? "🇬🇧 EN" : "🇷🇴 RO"}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
