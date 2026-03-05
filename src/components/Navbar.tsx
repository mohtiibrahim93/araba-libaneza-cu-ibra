import { useI18n } from "@/lib/i18n";
import CedarTree from "@/components/CedarTree";

const Navbar = () => {
  const { t, toggle, lang } = useI18n();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50">
      <div className="flag-stripe" />
      <div className="bg-card/95 backdrop-blur-lg border-b border-border">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <CedarTree className="text-secondary" size={24} />
            <span className="font-semibold text-foreground tracking-wide text-sm uppercase">
              Raduga
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#inscriere" className="hover:text-primary transition-colors duration-200">{t.navGroup}</a>
            <a href="#private" className="hover:text-primary transition-colors duration-200">{t.navPrivate}</a>
            <a href="#kids" className="hover:text-primary transition-colors duration-200">{t.navKids}</a>
          </div>

          <button
            onClick={toggle}
            className="text-xs font-semibold tracking-wider uppercase px-3 py-1.5 rounded border border-border hover:bg-muted transition-colors duration-200"
          >
            {lang === "ro" ? "🇬🇧 EN" : "🇷🇴 RO"}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
