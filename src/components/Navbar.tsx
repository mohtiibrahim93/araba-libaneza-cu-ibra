import { useI18n } from "@/lib/i18n";

const Navbar = () => {
  const { t, toggle, lang } = useI18n();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
      <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
        <a href="#" className="text-lg tracking-[0.15em] uppercase font-semibold text-foreground" style={{ fontFamily: "var(--font-display)" }}>
          Raduga
        </a>

        <div className="hidden md:flex items-center gap-8 text-[13px] text-muted-foreground font-medium tracking-wide">
          <a href="#inscriere" className="hover:text-foreground transition-colors">{t.navGroup}</a>
          <a href="#private" className="hover:text-foreground transition-colors">{t.navPrivate}</a>
          <a href="#kids" className="hover:text-foreground transition-colors">{t.navKids}</a>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="#inscriere"
            className="hidden sm:inline-flex px-5 py-2 text-[13px] font-semibold tracking-wide bg-foreground text-background rounded-full transition-all hover:opacity-90"
          >
            {t.navCta}
          </a>
          <button
            onClick={toggle}
            className="text-[11px] font-semibold tracking-[0.15em] uppercase px-3 py-1.5 rounded-full border border-border text-muted-foreground hover:text-foreground transition-colors"
          >
            {lang === "ro" ? "EN" : "RO"}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
