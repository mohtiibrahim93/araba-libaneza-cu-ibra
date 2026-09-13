import { Link } from "@/components/LocalizedLink";
import { useI18n } from "@/lib/i18n";
import { BookOpen, MessageCircle, Languages, Gamepad2 } from "lucide-react";

const ResourcesTeaser = () => {
  const { lang } = useI18n();
  const isEn = lang === "en";

  const resources = [
    {
      to: "/blog/alfabetul-arab-pentru-incepatori",
      icon: BookOpen,
      title: isEn ? "Arabic alphabet for beginners" : "Alfabetul arab pentru începători",
      desc: isEn
        ? "All 28 letters, pronunciation and writing direction."
        : "Cele 28 de litere, pronunție și sensul de scriere. Cu tabel complet.",
    },
    {
      to: "/blog/lebanese-arabic-phrases",
      icon: MessageCircle,
      title: isEn ? "35+ Lebanese Arabic phrases" : "35+ expresii în araba libaneză",
      desc: isEn
        ? "Daily phrases for greetings, café, taxi and family."
        : "Expresii zilnice: salut, restaurant, taxi, familie — cu PDF gratuit.",
    },
    {
      to: "/blog/limbile-vorbite-in-liban",
      icon: Languages,
      title: isEn ? "Languages of Lebanon" : "Limbile vorbite în Liban",
      desc: isEn
        ? "Lebanese Arabic, MSA, French and English — who uses which."
        : "Arabă libaneză, MSA, franceză și engleză — cine le vorbește și de ce.",
    },
  ];

  return (
    <section className="py-section bg-secondary/30">
      <div className="w-full max-w-content mx-auto px-gutter">
        <div className="text-center mb-12">
          <h2 className="text-display-lg font-bold tracking-tight mb-4">
            {isEn ? "Free resources" : "Resurse gratuite"}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {isEn
              ? "Guides, phrases and cheat sheets to help you learn Lebanese Arabic at your own pace."
              : "Ghiduri, expresii și fișiere de lucru ca să înveți araba libaneză în ritmul tău."}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.map((r) => (
            <Link
              key={r.to}
              to={r.to}
              className="group flex min-w-0 flex-col h-full rounded-2xl border border-border bg-background p-5 sm:p-6 shadow-sm hover:shadow-md transition-all [overflow-wrap:anywhere]"
            >
              <div className="mb-4 inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary">
                <r.icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                {r.title}
              </h3>
              <p className="text-sm text-muted-foreground flex-grow">{r.desc}</p>
              <span className="mt-4 text-sm font-medium text-primary inline-flex items-center">
                {isEn ? "Read more" : "Citește mai mult"}
                <span className="ml-1 group-hover:translate-x-1 transition-transform">→</span>
              </span>
            </Link>
          ))}
        </div>

        {/* The practice game. Deliberately one wide card under the grid rather
            than a fourth item in it: the grid is three columns at lg, so a
            fourth card would leave a gap on the row. It is also not a guide —
            the others are things you read, this is something you use. */}
        <Link
          to="/joaca"
          className="group mt-6 flex min-w-0 items-center gap-4 rounded-2xl border border-border bg-background p-5 sm:p-6 shadow-sm hover:shadow-md transition-all [overflow-wrap:anywhere]"
        >
          <span className="inline-flex shrink-0 items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary">
            <Gamepad2 className="w-6 h-6" />
          </span>
          <span className="min-w-0">
            <span className="block text-lg font-semibold group-hover:text-primary transition-colors">
              {isEn ? "Practice game (in Romanian)" : "Joacă și învață"}
            </span>
            <span className="block text-sm text-muted-foreground">
              {isEn
                ? "Over 4,300 expressions with spaced review, free and with no account. The game itself is in Romanian."
                : "Peste 4.300 de expresii, cu recapitulări programate. Gratuit, fără cont, direct în browser."}
            </span>
          </span>
          <span className="ml-auto hidden shrink-0 text-sm font-medium text-primary sm:inline-flex items-center">
            {isEn ? "Play" : "Joacă"}
            <span className="ml-1 group-hover:translate-x-1 transition-transform">→</span>
          </span>
        </Link>

        <div className="mt-10 text-center">
          <Link
            to="/blog"
            className="inline-flex items-center justify-center rounded-full border border-primary text-primary px-6 py-2.5 text-sm font-medium hover:bg-primary hover:text-primary-foreground transition-colors"
          >
            {isEn ? "Browse all resources" : "Vezi toate resursele"}
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ResourcesTeaser;
