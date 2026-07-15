import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import ScrollToTop from "@/components/ScrollToTop";

const URL =
  "https://centruldearabalibaneza.com/blog/araba-libaneza-vs-araba-standard";
const TITLE =
  "Araba libaneză vs araba standard (MSA): ce înveți?";
const DESCRIPTION =
  "Comparație clară între araba libaneză (dialect) și araba standard (Fusha/MSA): utilizări practice, dificultate, context cultural și ce curs să alegi.";
const PUBLISHED = "2026-07-15";

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: TITLE,
  description: DESCRIPTION,
  datePublished: PUBLISHED,
  dateModified: PUBLISHED,
  inLanguage: "ro",
  mainEntityOfPage: URL,
  author: {
    "@type": "Person",
    name: "Ibra — Centrul de Arabă Libaneză",
  },
  publisher: {
    "@type": "Organization",
    name: "Centrul de Arabă Libaneză cu Ibra",
    url: "https://centruldearabalibaneza.com/",
  },
};

const Section = ({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) => (
  <section id={id} className="scroll-mt-24 space-y-4">
    <h2 className="text-2xl md:text-3xl font-bold text-foreground">{title}</h2>
    <div className="space-y-4 text-foreground/80 leading-relaxed">{children}</div>
  </section>
);

const ArabaLibanezaVsArabaStandard = () => {
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
        <meta name="twitter:title" content={TITLE} />
        <meta name="twitter:description" content={DESCRIPTION} />
        <script type="application/ld+json">{JSON.stringify(articleJsonLd)}</script>
      </Helmet>

      <Navbar />

      <main className="pt-24 pb-16">
        <article className="max-w-3xl mx-auto px-4 md:px-6">
          <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground mb-6">
            <Link to="/" className="hover:text-primary">Acasă</Link>
            <span className="mx-2">/</span>
            <span>Blog</span>
            <span className="mx-2">/</span>
            <span className="text-foreground">Araba libaneză vs araba standard</span>
          </nav>

          <header className="mb-10 space-y-4">
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground">
              Araba libaneză vs araba standard (MSA): pe care să o înveți?
            </h1>
            <p className="text-lg text-muted-foreground">
              Nu există „o singură arabă”. Există o limbă scrisă (Fusha / MSA) și
              zeci de dialecte vorbite. Alegerea corectă depinde de ce vrei să
              faci cu limba — călătorii, familie, muncă, studiu academic sau
              muzică și seriale.
            </p>
            <p className="text-sm text-muted-foreground">
              Publicat pe 15 iulie 2026 · Aprox. 7 minute de citire
            </p>
          </header>

          <aside className="mb-10 rounded-lg border border-border bg-muted/40 p-5">
            <h2 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wide">
              Ce vei afla
            </h2>
            <ol className="list-decimal list-inside space-y-1 text-sm text-foreground/80">
              <li><a href="#definitii" className="hover:text-primary">Ce este Fusha și ce este libaneza</a></li>
              <li><a href="#utilizari" className="hover:text-primary">Utilizări practice: când folosești fiecare</a></li>
              <li><a href="#dificultate" className="hover:text-primary">Care e mai grea de învățat</a></li>
              <li><a href="#cultura" className="hover:text-primary">Context cultural și media</a></li>
              <li><a href="#comparatie" className="hover:text-primary">Tabel comparativ rapid</a></li>
              <li><a href="#alegere" className="hover:text-primary">Ce ar trebui să alegi</a></li>
            </ol>
          </aside>

          <div className="space-y-12">
            <Section id="definitii" title="1. Ce este araba standard (MSA / Fusha) și ce este libaneza">
              <p>
                <strong>Araba standard modernă</strong> (MSA, sau „Fusha” în arabă)
                este forma scrisă și oficială a limbii, folosită în toată lumea
                arabă în știri, ziare, cărți, documente juridice și predici
                religioase. Este o limbă învățată — nimeni nu o vorbește nativ
                acasă.
              </p>
              <p>
                <strong>Araba libaneză</strong> este dialectul vorbit zilnic în
                Liban (parte din familia levantină, împreună cu araba siriană,
                iordaniană și palestiniană). Este limba mamei, a prietenilor, a
                muzicii și a serialelor — dar aproape că nu se scrie în forma sa
                pură.
              </p>
              <p>
                Diferența nu este ca între „română literară” și „română vorbită”:
                este mai apropiată de diferența între latină și italiană — două
                registre înrudite, dar cu vocabular, gramatică și pronunție
                distincte.
              </p>
            </Section>

            <Section id="utilizari" title="2. Utilizări practice: când folosești fiecare">
              <p><strong>Alege libaneza dacă vrei să:</strong></p>
              <ul className="list-disc list-inside space-y-2">
                <li>vorbești cu familia, partenerul sau prietenii libanezi;</li>
                <li>călătorești în Liban, Siria, Iordania sau Palestina;</li>
                <li>înțelegi muzică (Fairuz, Nancy Ajram, Mashrou' Leila) și seriale populare;</li>
                <li>folosești limba pe TikTok, Instagram sau în conversații informale;</li>
                <li>ajungi la conversații reale în luni, nu în ani.</li>
              </ul>
              <p><strong>Alege Fusha (MSA) dacă vrei să:</strong></p>
              <ul className="list-disc list-inside space-y-2">
                <li>citești ziare, cărți sau texte religioase;</li>
                <li>urmezi studii academice sau lucrezi în diplomație / traduceri oficiale;</li>
                <li>urmărești buletine de știri (Al Jazeera, BBC Arabic);</li>
                <li>ai o bază solidă pentru a înțelege ulterior alte dialecte în scris.</li>
              </ul>
              <p>
                În practică, cei mai mulți adulți care învață arabă pentru
                comunicare reală încep cu <strong>un dialect</strong> — și adaugă
                Fusha mai târziu, dacă e nevoie.
              </p>
            </Section>

            <Section id="dificultate" title="3. Care e mai grea de învățat?">
              <p>
                Ambele au provocări comune pentru un vorbitor de română:
                sunetele „grele” (<strong>ع, ح, ق</strong>), scrierea de la dreapta
                la stânga și un vocabular fără rădăcini comune cu limbile latine.
              </p>
              <p>
                Dincolo de asta, <strong>Fusha este semnificativ mai grea</strong>{" "}
                pentru un începător:
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li>
                  <strong>Cazuri gramaticale</strong> (nominativ, acuzativ, genitiv)
                  care se marchează cu terminații — libaneza nu le folosește.
                </li>
                <li>
                  <strong>Conjugări duale și forme verbale</strong> mai complexe;
                  libaneza are un sistem regularizat, mai apropiat de vorbirea zilnică.
                </li>
                <li>
                  <strong>Vocabular formal</strong>, mult mai rar auzit — greu de
                  reținut fără expunere constantă.
                </li>
              </ul>
              <p>
                Cu <strong>2–3 ore de studiu pe săptămână</strong>, un începător
                poate purta conversații simple în libaneză în 4–6 luni. Același
                nivel „de conversație” în Fusha ia de obicei de 2–3 ori mai mult,
                fiindcă Fusha nu se folosește în conversație — deci practica reală
                lipsește.
              </p>
            </Section>

            <Section id="cultura" title="4. Context cultural: de ce libaneza e „media-friendly”">
              <p>
                Libanul a produs, timp de decenii, o cantitate uriașă de conținut
                cultural în dialect — de la muzica lui <strong>Fairuz</strong> și a
                fraților Rahbani, la telenovele difuzate în toată lumea arabă și
                creatori de conținut de pe TikTok și YouTube. Dialectul libanez
                este înțeles pe scară largă în întreaga regiune, chiar și de
                vorbitori de arabă egipteană sau din Golf.
              </p>
              <p>
                Libaneza modernă poartă și influențe puternice din{" "}
                <strong>franceză, engleză, aramaică și turcă</strong>, iar în
                Beirut auzi curent propoziții precum{" "}
                <em>„Hi, kifak? Ça va?”</em>. Este o limbă cu personalitate — și o
                fereastră către o cultură vie, nu doar către texte scrise.
              </p>
            </Section>

            <Section id="comparatie" title="5. Tabel comparativ rapid">
              <div className="overflow-x-auto">
                <table className="w-full text-sm border border-border">
                  <thead className="bg-muted/50 text-foreground">
                    <tr>
                      <th className="text-left p-3 border-b border-border">Criteriu</th>
                      <th className="text-left p-3 border-b border-border">Libaneză (dialect)</th>
                      <th className="text-left p-3 border-b border-border">Fusha / MSA</th>
                    </tr>
                  </thead>
                  <tbody className="text-foreground/80">
                    <tr>
                      <td className="p-3 border-b border-border font-medium">Folosită pentru</td>
                      <td className="p-3 border-b border-border">Conversație zilnică, familie, călătorii, media</td>
                      <td className="p-3 border-b border-border">Scris, știri, texte oficiale, religie</td>
                    </tr>
                    <tr>
                      <td className="p-3 border-b border-border font-medium">Cine o vorbește nativ</td>
                      <td className="p-3 border-b border-border">~30M vorbitori (Liban, Siria, Iordania, Palestina)</td>
                      <td className="p-3 border-b border-border">Nimeni ca limbă maternă</td>
                    </tr>
                    <tr>
                      <td className="p-3 border-b border-border font-medium">Gramatică</td>
                      <td className="p-3 border-b border-border">Simplificată, fără cazuri</td>
                      <td className="p-3 border-b border-border">Complexă, cu cazuri și forme duale</td>
                    </tr>
                    <tr>
                      <td className="p-3 border-b border-border font-medium">Timp până la conversație</td>
                      <td className="p-3 border-b border-border">~4–6 luni</td>
                      <td className="p-3 border-b border-border">~12–18 luni (și rar folosită în vorbire)</td>
                    </tr>
                    <tr>
                      <td className="p-3 border-b border-border font-medium">Scriere</td>
                      <td className="p-3 border-b border-border">Rar; adesea în transliterație latină</td>
                      <td className="p-3 border-b border-border">Standard, în alfabet arab</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-medium">Ideală pentru</td>
                      <td className="p-3">Comunicare, cultură, familie</td>
                      <td className="p-3">Studiu academic, citit, contexte formale</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Section>

            <Section id="alegere" title="6. Ce ar trebui să alegi?">
              <p>
                Regula practică pentru adulții din România care vor să învețe
                arabă:
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li>
                  <strong>Vrei să vorbești</strong> — cu familia, în vacanță, pe
                  social media, la muncă cu clienți libanezi → începe cu{" "}
                  <strong>araba libaneză</strong>. Progresul se simte în câteva
                  săptămâni.
                </li>
                <li>
                  <strong>Vrei să citești și să scrii</strong> — pentru studii
                  academice, Coran, ziare, contexte oficiale → începe cu{" "}
                  <strong>Fusha (MSA)</strong>.
                </li>
                <li>
                  <strong>Vrei ambele</strong> — începe cu libaneza (rezultate
                  rapide, motivație), și adaugă Fusha după 6–12 luni când baza
                  fonetică și de vocabular este deja formată.
                </li>
              </ul>
              <p>
                La <strong>Centrul de Arabă Libaneză cu Ibra</strong> predăm{" "}
                <em>direct</em> dialectul libanez, cu profesor nativ, pentru
                adulți și copii — fizic în București sau online. Fusha o
                integrăm treptat de la nivelul B1, când e cu adevărat utilă.
              </p>
              <p>
                Pași concreți:
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li>
                  Fă <Link to="/quiz" className="text-primary underline">testul de nivel gratuit</Link>{" "}
                  ca să afli de unde pornești.
                </li>
                <li>
                  Vezi{" "}
                  <Link to="/cursuri/grup" className="text-primary underline">cursurile de grup</Link>{" "}
                  (structurate pe niveluri CEFR A1–C2) sau{" "}
                  <Link to="/cursuri/private" className="text-primary underline">lecțiile private</Link>{" "}
                  (ritm personalizat).
                </li>
                <li>
                  Pentru copii, avem un{" "}
                  <Link to="/cursuri/copii" className="text-primary underline">program dedicat</Link>{" "}
                  fizic în București.
                </li>
                <li>
                  Vezi și articolul{" "}
                  <Link
                    to="/blog/cum-inveti-araba-libaneza"
                    className="text-primary underline"
                  >
                    Cum înveți araba libaneză în 2026
                  </Link>{" "}
                  pentru un ghid pas cu pas.
                </li>
              </ul>
            </Section>
          </div>

          <div className="mt-16 rounded-xl border border-border bg-primary/5 p-6 md:p-8 text-center space-y-4">
            <h2 className="text-2xl font-bold text-foreground">
              Nesigur pe care să o alegi? Începe cu un test gratuit.
            </h2>
            <p className="text-muted-foreground">
              Îți recomandăm nivelul și formatul potrivit — libaneză, Fusha sau
              combinația care se potrivește obiectivelor tale.
            </p>
            <Link
              to="/quiz"
              className="inline-block bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition"
            >
              Fă testul de nivel
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

export default ArabaLibanezaVsArabaStandard;