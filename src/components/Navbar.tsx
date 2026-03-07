import { useI18n } from "@/lib/i18n";
import CedarTree from "@/components/CedarTree";

const Navbar = () => {
  const { t, toggle, lang } = useI18n();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-card/90 backdrop-blur-md border-b border-border">
      <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CedarTree className="text-secondary" size={24} />
          <span className="font-bold text-foreground tracking-wide text-base uppercase" style={{ fontFamily: "var(--font-display)", letterSpacing: "0.12em" }}>
            Raduga
          </span>
        </div>

        <div className="hidden md:flex items-center gap-6 text-sm text-muted-foreground font-medium">
          <a href="#inscriere" className="hover:text-foreground transition-colors">{t.navGroup}</a>
          <a href="#private" className="hover:text-foreground transition-colors">{t.navPrivate}</a>
          <a href="#kids" className="hover:text-foreground transition-colors">{t.navKids}</a>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="#inscriere"
            className="hidden sm:inline-flex px-4 py-2 rounded text-sm font-semibold bg-primary text-primary-foreground transition-all hover:brightness-110"
          >
            {t.navCta}
          </a>
          <button
            onClick={toggle}
            className="text-xs font-bold tracking-wider uppercase px-3 py-2 rounded border border-border hover:bg-muted transition-colors"
          >
            {lang === "ro" ? "EN" : "RO"}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
