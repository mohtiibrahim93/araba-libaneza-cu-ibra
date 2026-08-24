import { Link } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import { BookOpen, MessageCircle, Languages } from "lucide-react";

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
    <section className="section-padding bg-secondary/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
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
              className="group flex flex-col h-full rounded-2xl border border-border bg-background p-6 shadow-sm hover:shadow-md transition-all"
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
