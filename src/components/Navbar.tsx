import { useI18n } from "@/lib/i18n";
import CedarTree from "@/components/CedarTree";

const Navbar = () => {
  const { t, toggle, lang } = useI18n();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-card/90 backdrop-blur-md border-b border-border">
      {/* Lebanese flag stripe */}
      <div className="lebanese-stripe h-1" />
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CedarTree className="text-secondary" size={28} />
          <span className="font-bold text-lg text-foreground" style={{ fontFamily: "var(--font-display)" }}>
            Raduga
          </span>
        </div>

        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
          <a href="#inscriere" className="hover:text-primary transition-colors">{t.navGroup}</a>
          <a href="#private" className="hover:text-primary transition-colors">{t.navPrivate}</a>
          <a href="#kids" className="hover:text-primary transition-colors">{t.navKids}</a>
        </div>

        <button
          onClick={toggle}
          className="px-3 py-1.5 text-sm font-semibold rounded-md border border-border hover:bg-muted transition-colors"
        >
          {lang === "ro" ? "🇬🇧 EN" : "🇷🇴 RO"}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
