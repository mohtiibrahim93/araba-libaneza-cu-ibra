import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ChevronRight, Globe, Users, GraduationCap, MessageCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import ScrollToTop from "@/components/ScrollToTop";

const BASE = "https://centruldearabalibaneza.com";
const URL = `${BASE}/de/arabisch-lernen`;

const FAQ = [
  {
    q: "In welcher Sprache findet der Unterricht statt?",
    a: "Du wählst die Sprache, in der du dich am wohlsten fühlst. Ibra unterrichtet fließend auf Englisch, Französisch, Arabisch und Rumänisch — such dir aus, welche dir am leichtesten fällt. Der Unterricht selbst findet nicht auf Deutsch statt.",
  },
  {
    q: "Welches Arabisch lernt man hier — Hocharabisch oder Dialekt?",
    a: "Wir unterrichten libanesisches Arabisch (levantinischer Dialekt), also die gesprochene Sprache aus dem Libanon, Syrien, Jordanien und Palästina. Hocharabisch (MSA / Fusha) ist die formelle Schriftsprache — kaum jemand spricht sie zu Hause. Wenn du wirklich reden willst, ist der Dialekt der schnellste Weg. MSA können wir später ergänzen, wenn du lesen oder formell schreiben möchtest.",
  },
  {
    q: "Wie lange dauert es, Arabisch zu lernen?",
    a: "Mit zwei 90-Minuten-Lektionen pro Woche plus etwas Übung erreichen die meisten Lernenden in 3–6 Monaten das Niveau A2 (Alltagsgespräche). Für B1/B2 (fließende Konversation) rechnen wir mit 1,5–2 Jahren konsequenter Praxis.",
  },
  {
    q: "Muss ich zuerst das arabische Alphabet lernen?",
    a: "Nein. Wir arbeiten oral-first: Du sprichst ab der ersten Lektion mit Arabizi (arabische Wörter in lateinischen Buchstaben und Zahlen). Die arabische Schrift kommt nach 2–3 Monaten dazu, sobald dein Gehör und deine Aussprache sitzen. So gibt es keine Alphabet-Hürde vor dem ersten echten Gespräch.",
  },
  {
    q: "Sind die Kurse online oder in Präsenz?",
    a: "Beides. Online-Kurse laufen über Zoom und funktionieren aus jeder Zeitzone, die sich mit Bukarest (MESZ +1 h) überschneidet — für Deutschland, Österreich und die Schweiz ideal (gleiche Zeitzone). Präsenzkurse finden in Bukarest statt.",
  },
  {
    q: "Wer ist der Lehrer?",
    a: "Ibra — Muttersprachler des libanesischen Arabisch mit 5+ Jahren Unterrichtserfahrung (Preply und eigene Schüler weltweit), lebt in Bukarest. Unterricht auf Englisch, Französisch, Arabisch oder Rumänisch — such dir die Sprache aus, in der du dich am wohlsten fühlst.",
  },
  {
    q: "Was kosten die Kurse?",
    a: "Gruppenkurse ab 500 LEI / Monat (~100 €) online. Privatstunden 1:1 kosten 150 LEI (~30 €) pro 90-Minuten-Lektion. Die erste 30-Minuten-Probestunde ist gratis.",
  },
];

const courseJsonLd = {
  "@context": "https://schema.org",
  "@type": "Course",
  name: "Arabisch lernen online — libanesischer Dialekt mit Muttersprachler",
  description:
    "Arabisch lernen online mit einem libanesischen Muttersprachler. Sprich ab der ersten Lektion — ohne mit dem Alphabet zu beginnen. Einzel- und Gruppenkurse, A1 bis C2.",
  inLanguage: "de",
  url: URL,
  provider: {
    "@type": "Organization",
    name: "Centrul de Arabă Libaneză cu Ibra",
    url: `${BASE}/`,
  },
};
const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: `${BASE}/` },
    { "@type": "ListItem", position: 2, name: "Arabisch lernen", item: URL },
  ],
};
const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ.map(({ q, a }) => ({
    "@type": "Question",
    name: q,
    acceptedAnswer: { "@type": "Answer", text: a },
  })),
};

const ArabischLernen = () => (
  <div className="min-h-screen bg-background" lang="de">
    <Helmet>
      <html lang="de" />
      <title>Arabisch lernen online — libanesisch mit Muttersprachler | A1–C2</title>
      <meta
        name="description"
        content="Arabisch lernen online — libanesischer Dialekt mit Muttersprachler. Sprich ab Lektion eins, ohne Alphabet-Hürde. Einzel- & Gruppenkurse, A1–C2. Kostenlose Probestunde."
      />
      <link rel="canonical" href={URL} />
      <link rel="alternate" hrefLang="de" href={URL} />
      <link rel="alternate" hrefLang="en" href={`${BASE}/en/learn-lebanese-arabic`} />
      <link rel="alternate" hrefLang="ro" href={`${BASE}/`} />
      <link rel="alternate" hrefLang="x-default" href={`${BASE}/`} />
      <meta property="og:type" content="website" />
      <meta property="og:title" content="Arabisch lernen online — mit Muttersprachler" />
      <meta
        property="og:description"
        content="Libanesisches Arabisch online lernen. Sprich ab Lektion eins. Kostenlose Probestunde."
      />
      <meta property="og:url" content={URL} />
      <meta property="og:image" content={`${BASE}/og-image.png`} />
      <meta property="og:locale" content="de_DE" />
      <meta name="twitter:card" content="summary_large_image" />
      <script type="application/ld+json">{JSON.stringify(courseJsonLd)}</script>
      <script type="application/ld+json">{JSON.stringify(breadcrumbJsonLd)}</script>
      <script type="application/ld+json">{JSON.stringify(faqJsonLd)}</script>
    </Helmet>

    <Navbar />

    <main id="main-content" className="pt-24 pb-16">
      <article className="max-w-3xl mx-auto px-4 md:px-6">
        <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground mb-6">
          <Link to="/" className="hover:text-primary">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 inline mx-1 -mt-0.5" aria-hidden />
          <span className="text-foreground">Arabisch lernen</span>
        </nav>

        <header className="mb-10 space-y-4">
          <h1 className="font-display text-display-xl font-bold tracking-tight text-foreground">
            Arabisch lernen online — libanesisch mit Muttersprachler
          </h1>
          <p className="text-lg text-muted-foreground">
            Live-Kurse in libanesischem Arabisch — der levantinische Dialekt, den rund 30 Millionen
            Menschen im Libanon, Syrien, Jordanien und Palästina sprechen. Sprich ab Lektion eins,
            ohne mit dem Alphabet zu beginnen. A1 bis C2.
          </p>
        </header>

        <div className="grid sm:grid-cols-3 gap-4 my-8">
          {[
            { icon: Globe, title: "Online weltweit", desc: "Zoom-Kurse aus D/A/CH — gleiche Zeitzone wie Bukarest." },
            { icon: Users, title: "Einzeln oder in Gruppen", desc: "1:1-Unterricht nach deinen Zielen oder Kleingruppen 4–10." },
            { icon: GraduationCap, title: "CEFR A1 → C2", desc: "Sechs Niveaus, vom Überleben bis zur vollen Flüssigkeit." },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-xl border border-border bg-card p-5">
              <Icon className="w-5 h-5 text-primary mb-2" />
              <h3 className="text-sm font-bold text-foreground mb-1">{title}</h3>
              <p className="text-xs text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>

        <div className="space-y-8 text-foreground/80 leading-relaxed [&_h2]:font-display [&_h2]:text-2xl [&_h2]:md:text-3xl [&_h2]:font-bold [&_h2]:text-foreground [&_h2]:mt-10 [&_h2]:mb-3 [&_h3]:font-semibold [&_h3]:text-foreground [&_h3]:text-lg [&_h3]:mt-6 [&_h3]:mb-2 [&_ul]:list-disc [&_ul]:list-inside [&_ul]:space-y-2 [&_a]:text-primary [&_a]:underline">
          <h2>Warum libanesisches Arabisch lernen?</h2>
          <p>
            Libanesisches Arabisch ist die lebendige Sprache des Libanon — was Menschen zu Hause,
            auf TikTok, in Musik und in Serien sprechen. Dank jahrzehntelanger libanesischer
            Medienpräsenz ist es einer der am weitesten verstandenen arabischen Dialekte im gesamten
            Nahen Osten.
          </p>
          <ul>
            <li><strong>Sprechen ab Lektion eins:</strong> kein Alphabet als Hürde — du startest mit Arabizi (lateinische Umschrift).</li>
            <li><strong>Echte Gespräche auf A2:</strong> Vorstellung, Einkauf, Wegbeschreibung, Smalltalk in 3–6 Monaten.</li>
            <li><strong>Verstehe libanesische Medien:</strong> Musik, Serien, YouTube — im Original.</li>
            <li><strong>Reisen und Familie:</strong> mit libanesischsprachigen Menschen im Libanon und der Diaspora sprechen.</li>
            <li><strong>Tor zum Levant:</strong> libanesisch ist gegenseitig verständlich mit syrisch, jordanisch und palästinensisch.</li>
          </ul>

          <h2>Libanesisches Arabisch vs. Hocharabisch (MSA)</h2>
          <p>
            Hocharabisch (Modern Standard Arabic, MSA / Fusha) ist die geschriebene, formelle
            Sprache — in Nachrichten, Gesetzen, religiösen Texten. Zu Hause spricht sie niemand.
            Wenn dein Ziel echtes Sprechen ist, ist der libanesische Dialekt der kürzere Weg. MSA
            kannst du später für Lesen und formelles Schreiben dazulernen.
          </p>

          <h2>Kursformate</h2>
          <div className="grid sm:grid-cols-2 gap-4 my-6">
            <div className="rounded-xl border border-border bg-muted/30 p-5">
              <h3 className="text-base font-semibold text-foreground mb-2 flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" /> Gruppenkurse
              </h3>
              <p className="text-sm text-muted-foreground">
                Kleine Gruppen (4–10 Personen), 2× pro Woche, 90 Minuten pro Einheit. Online oder in
                Bukarest. Fester Stundenplan mit klarem CEFR-Curriculum.
              </p>
              <p className="text-sm font-medium text-foreground mt-3">Ab 500 LEI / Monat (~100 €) online</p>
            </div>
            <div className="rounded-xl border border-border bg-muted/30 p-5">
              <h3 className="text-base font-semibold text-foreground mb-2 flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-primary" /> Privatstunden
              </h3>
              <p className="text-sm text-muted-foreground">
                1:1-Unterricht nach deinen Zielen und deinem Tempo. Flexibler Zeitplan. Online
                weltweit oder Präsenz in Bukarest.
              </p>
              <p className="text-sm font-medium text-foreground mt-3">150 LEI / Lektion (~30 €)</p>
            </div>
          </div>

          <h2>Wie wir unterrichten</h2>
          <ul>
            <li><strong>Oral first:</strong> Sprechen ab Lektion eins mit Arabizi. Die arabische Schrift kommt nach 2–3 Monaten.</li>
            <li><strong>Muttersprachler:</strong> Ibra ist libanesischer Muttersprachler mit über 5 Jahren Unterrichtserfahrung.</li>
            <li><strong>CEFR-Struktur:</strong> sechs Niveaus A1 → C2, vom Überleben bis zur vollen Flüssigkeit.</li>
            <li><strong>Echte Konversation:</strong> jede Lektion baut auf etwas, das du im Alltag sagen kannst.</li>
            <li><strong>Unterrichtssprache:</strong> Englisch, Französisch, Arabisch oder Rumänisch — du wählst.</li>
          </ul>

          <h2>Häufig gestellte Fragen</h2>
          <div className="space-y-4 mt-4">
            {FAQ.map(({ q, a }) => (
              <div key={q} className="rounded-lg border border-border bg-muted/30 p-4">
                <h3 className="font-semibold text-foreground">{q}</h3>
                <p className="text-sm mt-1">{a}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 rounded-xl border border-border bg-primary/5 p-6 md:p-8 text-center space-y-4">
          <h2 className="font-display text-2xl font-bold text-foreground">
            Starte mit einer kostenlosen Probestunde
          </h2>
          <p className="text-muted-foreground">
            30 Minuten mit einem Muttersprachler — online weltweit oder in Präsenz in Bukarest.
            Keine Karte nötig, keine Verpflichtung.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/trial"
              className="inline-block bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition"
            >
              Probestunde buchen
            </Link>
            <a
              href="https://wa.me/40763124514"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 border border-border px-6 py-3 rounded-lg font-semibold text-foreground hover:bg-muted transition"
            >
              <MessageCircle className="w-4 h-4" /> Auf WhatsApp fragen
            </a>
          </div>
        </div>
      </article>
    </main>

    <Footer />
    <WhatsAppButton />
    <ScrollToTop />
  </div>
);

export default ArabischLernen;