import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import ScrollToTop from "@/components/ScrollToTop";
import RelatedPosts from "@/components/blog/RelatedPosts";

const URL = "https://centruldearabalibaneza.com/blog/primele-20-de-expresii-libaneze";
const TITLE = "Primele 20 de expresii în araba libaneză (cu pronunție)";
const DESCRIPTION =
  "Cele mai utile 20 de expresii libaneze pentru începători — salut, politețe, cafenea, taxi — scrise în arabizi cu pronunție și traducere.";
const PUBLISHED = "2026-07-16";

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: TITLE,
  description: DESCRIPTION,
  datePublished: PUBLISHED,
  dateModified: PUBLISHED,
  inLanguage: "ro",
  mainEntityOfPage: URL,
  author: { "@type": "Person", name: "Ibra — Centrul de Arabă Libaneză" },
  publisher: {
    "@type": "Organization",
    name: "Centrul de Arabă Libaneză cu Ibra",
    url: "https://centruldearabalibaneza.com/",
  },
};

// group → [ arabizi, arabic, romanian ]
const GROUPS: { title: string; rows: [string, string, string][] }[] = [
  {
    title: "Salut și politețe",
    rows: [
      ["Mar7aba", "مرحبا", "Salut / Bună"],
      ["Kifak? (m) · Kifik? (f)", "كيفك؟", "Ce faci?"],
      ["Mnee7, shukran", "منيح، شكراً", "Bine, mulțumesc"],
      ["Shu akhbarak?", "شو أخبارك؟", "Ce mai e nou?"],
      ["Yalla, baaden", "يلا، بعدين", "Hai, pe curând"],
      ["Tsharrafna", "تشرفنا", "Îmi pare bine (de cunoștință)"],
    ],
  },
  {
    title: "Cuvinte de bază",
    rows: [
      ["Eh / La'", "إيه / لأ", "Da / Nu"],
      ["Min fadlak (m)", "من فضلك", "Te rog"],
      ["Shukran ktir", "شكراً كتير", "Mulțumesc mult"],
      ["3afwan", "عفواً", "Cu plăcere / Scuze"],
      ["Aasef (m) · Aasfeh (f)", "آسف", "Îmi pare rău"],
      ["Ma fhemet", "ما فهمت", "Nu am înțeles"],
    ],
  },
  {
    title: "La cafenea și pe stradă",
    rows: [
      ["Baddi ahwe", "بدي قهوة", "Vreau o cafea"],
      ["Addesh el 7saab?", "قديش الحساب؟", "Cât costă / Cât e nota?"],
      ["Wein el 7ammem?", "وين الحمام؟", "Unde e toaleta?"],
      ["3al yamin / 3ash-shmel", "عاليمين / عالشمال", "La dreapta / La stânga"],
      ["Wa''ifni hon", "وقفني هون", "Oprește-mă aici (în taxi)"],
      ["Ktir tayyeb!", "كتير طيّب!", "Foarte gustos!"],
    ],
  },
  {
    title: "Expresii libaneze de suflet",
    rows: [
      ["Ya3ni", "يعني", "Adică / Cam așa (umplutură universală)"],
      ["Ta2burni", "تقبرني", "„Te iubesc enorm” (literal: să mă îngropi tu) — afecțiune tipic libaneză"],
    ],
  },
];

const Primele20Expresii = () => {
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{TITLE}</title>
        <meta name="description" content={DESCRIPTION} />
        <link rel="canonical" href={URL} />
        <meta property="og:type" content="article" />
        <meta property="og:title" content={TITLE} />
        <meta property="og:description" content={DESCRIPTION} />
        <meta property="og:url" content={URL} />
        <meta name="twitter:card" content="summary_large_image" />
        <script type="application/ld+json">{JSON.stringify(articleJsonLd)}</script>
      </Helmet>

      <Navbar />

      <main className="pt-24 pb-16">
        <article className="max-w-3xl mx-auto px-4 md:px-6">
          <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground mb-6">
            <Link to="/" className="hover:text-primary">Acasă</Link>
            <span className="mx-2" aria-hidden><ChevronRight className="w-3.5 h-3.5 inline -mt-0.5" /></span>
            <Link to="/blog" className="hover:text-primary">Blog</Link>
            <span className="mx-2" aria-hidden><ChevronRight className="w-3.5 h-3.5 inline -mt-0.5" /></span>
            <span className="text-foreground">Primele 20 de expresii</span>
          </nav>

          <header className="mb-10 space-y-4">
            <h1 className="font-display text-3xl md:text-5xl font-bold tracking-tight text-foreground">
              Primele 20 de expresii în araba libaneză
            </h1>
            <p className="text-lg text-muted-foreground">
              Scrise în <strong>arabizi</strong> (litere latine), cu grafia arabă și traducere.
              Exact expresiile pe care le folosești din prima zi în Liban — sau cu prietenii libanezi.
            </p>
            <p className="text-sm text-muted-foreground">Publicat pe 16 iulie 2026 · Aprox. 6 minute de citire</p>
          </header>

          <div className="rounded-xl border border-border bg-muted/40 p-5 mb-10 text-sm text-foreground/80 leading-relaxed">
            <p>
              <strong>Cum citești tabelul:</strong> „3” se pronunță ca un „a” gutural (litera ع), „7” ca
              un „h” aspru din gât (ح), iar „2” marchează o oprire scurtă a vocii (ء). Nu-ți face griji —
              la curs le auzi și le repeți natural, metoda noastră e <em>Oral First</em>.
            </p>
          </div>

          <div className="space-y-10">
            {GROUPS.map((group) => (
              <section key={group.title} className="space-y-4">
                <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">{group.title}</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-border text-left text-muted-foreground">
                        <th className="py-2 pr-3 font-semibold">Arabizi</th>
                        <th className="py-2 px-3 font-semibold">Arabă</th>
                        <th className="py-2 pl-3 font-semibold">Română</th>
                      </tr>
                    </thead>
                    <tbody>
                      {group.rows.map(([arabizi, arabic, ro]) => (
                        <tr key={arabizi} className="border-b border-border/60 align-top">
                          <td className="py-2.5 pr-3 font-semibold text-foreground whitespace-nowrap">{arabizi}</td>
                          <td className="py-2.5 px-3 font-arabic text-lg text-brand-green" dir="rtl" lang="ar">{arabic}</td>
                          <td className="py-2.5 pl-3 text-foreground/80">{ro}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            ))}
          </div>

          <div className="mt-12 space-y-4 text-foreground/80 leading-relaxed">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">De unde continui</h2>
            <p>
              Dacă expresiile de mai sus ți-au plăcut, pasul următor firesc e să le pui în context — cum
              se leagă, cum răspunzi, cum porți o conversație scurtă. Asta facem la curs din prima lecție.
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li>
                Vezi diferența dintre dialect și araba clasică în{" "}
                <Link to="/blog/araba-libaneza-vs-araba-standard" className="text-primary underline">
                  araba libaneză vs araba standard
                </Link>.
              </li>
              <li>
                Nu știi de unde pornești? Fă{" "}
                <Link to="/quiz" className="text-primary underline">testul de nivel gratuit</Link>.
              </li>
            </ul>
          </div>

          <RelatedPosts currentSlug="primele-20-de-expresii-libaneze" />

          <div className="mt-16 rounded-xl border border-border bg-primary/5 p-6 md:p-8 text-center space-y-4">
            <h2 className="font-display text-2xl font-bold text-foreground">
              Vrei să le și pronunți corect?
            </h2>
            <p className="text-muted-foreground">
              La o lecție de probă gratuită le auzi de la un vorbitor nativ și le repeți pe loc.
            </p>
            <Link
              to="/trial"
              className="inline-block bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition"
            >
              Rezervă o lecție de probă gratuită
            </Link>
          </div>
        </article>
      </main>

      <Footer />
      <WhatsAppButton />
      <ScrollToTop />
    </div>
  );
};

export default Primele20Expresii;
