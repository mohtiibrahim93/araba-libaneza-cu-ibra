import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import ScrollToTop from "@/components/ScrollToTop";

const URL = "https://centruldearabalibaneza.com/blog/cum-inveti-araba-libaneza";
const TITLE = "Cum înveți araba libaneză în 2026: ghid complet pentru începători";
const DESCRIPTION =
  "Ghid pas cu pas pentru a învăța araba libaneză: diferența față de araba standard (Fusha), cât durează, cele mai bune metode, greșeli frecvente și fraze utile.";
const PUBLISHED = "2026-07-10";

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

const CumInvetiArabaLibaneza = () => {
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
            <span className="text-foreground">Cum înveți araba libaneză</span>
          </nav>

          <header className="mb-10 space-y-4">
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground">
              Cum înveți araba libaneză în 2026: ghid complet pentru începători
            </h1>
            <p className="text-lg text-muted-foreground">
              Diferențe față de araba standard, cât timp îți ia, cele mai bune metode
              de învățare, greșeli frecvente și primele fraze utile — tot ce trebuie să
              știi înainte să începi.
            </p>
            <p className="text-sm text-muted-foreground">
              Publicat pe 10 iulie 2026 · Aprox. 8 minute de citire
            </p>
          </header>

          <aside className="mb-10 rounded-lg border border-border bg-muted/40 p-5">
            <h2 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wide">
              Ce vei afla
            </h2>
            <ol className="list-decimal list-inside space-y-1 text-sm text-foreground/80">
              <li><a href="#dialect" className="hover:text-primary">Ce este araba libaneză și cum diferă de Fusha</a></li>
              <li><a href="#msa" className="hover:text-primary">Trebuie să înveți întâi Fusha (araba standard)?</a></li>
              <li><a href="#dificultate" className="hover:text-primary">Este araba libaneză grea? Cât durează?</a></li>
              <li><a href="#metode" className="hover:text-primary">Cele mai bune metode de învățare</a></li>
              <li><a href="#greseli" className="hover:text-primary">Greșeli frecvente ale începătorilor</a></li>
              <li><a href="#fraze" className="hover:text-primary">Primele fraze și cuvinte utile</a></li>
              <li><a href="#pasi" className="hover:text-primary">Următorii pași</a></li>
            </ol>
          </aside>

          <div className="space-y-12">
            <Section id="dialect" title="1. Ce este araba libaneză și cum diferă de celelalte dialecte">
              <p>
                Araba libaneză face parte din familia dialectelor levantine (împreună
                cu araba siriană, palestiniană și iordaniană), care sunt în mare parte
                inteligibile reciproc. Se deosebește de araba egipteană și de cea din
                Golf prin pronunție, vocabular și intonație, dar și prin influențele
                puternice din franceză, engleză, aramaică și turcă.
              </p>
              <p>
                În practică, dacă înveți araba libaneză vei fi înțeles fără probleme în
                Liban, Siria, Iordania și Palestina, iar în Egipt, Golf și Africa de
                Nord vei putea comunica după o scurtă perioadă de expunere la dialectul
                local. Este unul dintre cele mai „media-friendly” dialecte — apare
                frecvent în muzică, seriale și pe rețelele sociale.
              </p>
            </Section>

            <Section id="msa" title="2. Trebuie să înveți întâi araba standard (Fusha)?">
              <p>
                Răspunsul scurt: <strong>nu, dacă scopul tău este să vorbești</strong>.
                Araba standard modernă (MSA / Fusha) este limba scrisă, folosită în
                știri, ziare și documente oficiale. Aproape nimeni nu o folosește în
                conversații zilnice.
              </p>
              <p>
                Dacă vrei să comunici cu familia, să călătorești în Liban, să înțelegi
                muzica și serialele sau să lucrezi cu vorbitori nativi, începe direct
                cu dialectul libanez. Vei ajunge la conversații reale mult mai repede.
                Fusha rămâne utilă mai târziu — mai ales pentru citit, scris academic
                sau context religios.
              </p>
            </Section>

            <Section id="dificultate" title="3. Este araba libaneză grea? Cât durează să devii conversațional?">
              <p>
                Pentru un vorbitor de română, araba libaneză are câteva sunete noi
                (ع, ح, ق) și o structură gramaticală diferită, dar este un dialect
                <strong> mai simplu decât Fusha</strong>: conjugările sunt mai regulate,
                cazurile gramaticale nu se folosesc, iar vocabularul de zi cu zi este
                limitat și repetitiv.
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li><strong>1–3 luni:</strong> te prezinți, comanzi la restaurant, întrebi indicații.</li>
                <li><strong>6 luni:</strong> conversații simple pe teme familiare.</li>
                <li><strong>12–18 luni:</strong> conversație fluentă cu practică regulată (2–3 ore/săptămână).</li>
              </ul>
              <p>
                Factorul decisiv nu este talentul, ci <strong>consecvența</strong> și
                cât de mult vorbești, nu doar citești sau asculți.
              </p>
            </Section>

            <Section id="metode" title="4. Cele mai bune metode de învățare">
              <p>Combinația care funcționează pentru majoritatea adulților:</p>
              <ul className="list-disc list-inside space-y-2">
                <li>
                  <strong>Un profesor nativ</strong> (grup sau 1:1) — pentru pronunție
                  corectă și feedback imediat. Apps precum Duolingo nu predau libaneza.
                </li>
                <li>
                  <strong>Input zilnic ușor:</strong> muzică libaneză (Fairuz, Nancy
                  Ajram), seriale de pe Shahid / Netflix, conturi de TikTok și YouTube
                  în libaneză.
                </li>
                <li>
                  <strong>Vocabular tematic</strong> (mâncare, familie, cumpărături)
                  în loc de liste lungi de cuvinte scoase din context.
                </li>
                <li>
                  <strong>Vorbire de la lecția 1</strong> — chiar și fraze greșite
                  spuse cu voce tare progresează mai repede decât citirea în tăcere.
                </li>
              </ul>
              <p>
                Poți învăța <Link to="/cursuri" className="text-primary underline">online sau fizic în București</Link>{" "}
                — ambele funcționează, dacă ai un profesor care corectează pronunția.
              </p>
            </Section>

            <Section id="greseli" title="5. Greșeli frecvente pe care le fac începătorii">
              <ul className="list-disc list-inside space-y-2">
                <li>
                  <strong>Amestecă Fusha cu libaneza</strong> — sună artificial și
                  vorbitorii nativi vor răspunde în engleză.
                </li>
                <li>
                  <strong>Se blochează pe alfabet</strong> înainte să spună un cuvânt.
                  Poți începe cu transliterație și adăugi scrisul mai târziu.
                </li>
                <li>
                  <strong>Traduc din română cuvânt-cu-cuvânt</strong> — ordinea
                  cuvintelor și expresiile sunt diferite.
                </li>
                <li>
                  <strong>Ignoră sunetele „grele”</strong> (ع, ح, ق). Cu 10 minute pe
                  zi de exersare devin naturale în câteva săptămâni.
                </li>
                <li>
                  <strong>Învață izolat</strong>, fără să vorbească niciodată cu
                  cineva. Rezultatul: înțelegi, dar nu poți răspunde.
                </li>
              </ul>
            </Section>

            <Section id="fraze" title="6. Primele 10 fraze utile în araba libaneză">
              <ul className="list-disc list-inside space-y-2">
                <li><strong>Marhaba</strong> — Bună</li>
                <li><strong>Kifak? / Kifik?</strong> — Ce faci? (către bărbat / femeie)</li>
                <li><strong>Mnih, shukran</strong> — Bine, mulțumesc</li>
                <li><strong>Shu ismak? / ismik?</strong> — Cum te cheamă?</li>
                <li><strong>Ana ismi…</strong> — Numele meu este…</li>
                <li><strong>Ana mn Rumania</strong> — Sunt din România</li>
                <li><strong>Btehki inglizi?</strong> — Vorbești engleză?</li>
                <li><strong>Addesh?</strong> — Cât costă?</li>
                <li><strong>Wein el ḥammem?</strong> — Unde este toaleta?</li>
                <li><strong>Yalla, bye!</strong> — Hai, pa!</li>
              </ul>
            </Section>

            <Section id="pasi" title="7. Următorii pași">
              <p>
                Cel mai important pas este să începi să vorbești cu cineva săptămâna
                aceasta — nu peste o lună, când „vei fi gata”. Poți:
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li>
                  Vezi <Link to="/quiz" className="text-primary underline">testul de nivel gratuit</Link> ca
                  să afli de unde pornești.
                </li>
                <li>
                  Alege un <Link to="/cursuri/grup" className="text-primary underline">curs de grup</Link>{" "}
                  (mai accesibil, mai motivant) sau{" "}
                  <Link to="/cursuri/private" className="text-primary underline">lecții private</Link>{" "}
                  (ritm personalizat).
                </li>
                <li>
                  Pentru copii, avem un{" "}
                  <Link to="/cursuri/copii" className="text-primary underline">program dedicat</Link>{" "}
                  fizic în București.
                </li>
              </ul>
            </Section>
          </div>

          <div className="mt-16 rounded-xl border border-border bg-primary/5 p-6 md:p-8 text-center space-y-4">
            <h2 className="text-2xl font-bold text-foreground">
              Gata să începi să vorbești araba libaneză?
            </h2>
            <p className="text-muted-foreground">
              Alătură-te unui curs cu profesor nativ, în București sau online.
            </p>
            <Link
              to="/#inscriere"
              className="inline-block bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition"
            >
              Înscrie-te la un curs
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

export default CumInvetiArabaLibaneza;