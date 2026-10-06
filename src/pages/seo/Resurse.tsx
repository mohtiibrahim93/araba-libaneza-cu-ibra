import { Link } from "@/lib/router-compat";
import LandingLayout from "@/components/seo/LandingLayout";
import ResourcePicker from "@/components/ResourcePicker";

const FAQ = [
  {
    q: "Cum primesc materialele?",
    a: "Bifezi PDF-urile dorite, completezi prenumele și emailul o singură dată, dai acordul și primești imediat câte un email cu linkul de descărcare pentru fiecare.",
  },
  {
    q: "Costă ceva?",
    a: "Nu. Toate materialele de pe această pagină sunt gratuite, fără card și fără abonament.",
  },
  {
    q: "Pot primi toate materialele deodată?",
    a: "Da, toate trei sunt bifate de la început. Fiecare vine într-un email separat, cu propriul link de descărcare.",
  },
  {
    q: "Ce fac cu datele mele?",
    a: "Le folosim ca să îți trimitem materialul și, ocazional, informații despre cursuri. Te poți dezabona din orice email, iar ștergerea completă se cere din pagina de ștergere a datelor.",
  },
];

const Resurse = () => (
  <LandingLayout
    slug="resurse"
    title="Resurse gratuite pentru arabă libaneză"
    metaTitle="Resurse Gratuite Arabă Libaneză | PDF-uri de Descărcat"
    description="Descarcă gratuit fișe Arabizi, 100 de expresii libaneze și un plan de 30 de zile. Primești PDF-urile pe email, fără costuri ascunse."
    crumb="Resurse gratuite"
    lead="Toate materialele noastre gratuite într-un singur loc. Bifezi ce vrei, lași emailul o singură dată și primești PDF-urile în câteva secunde."
    enHref={null}
    faq={FAQ}
  >
    <p>
      Materialele sunt făcute pentru <strong>araba libaneză vorbită</strong> și scrise în{" "}
      <Link to="/arabizi">arabizi</Link>, ca să le poți citi din prima zi, fără alfabetul arab.
    </p>

    <h2>Cele 3 PDF-uri gratuite</h2>
    <ResourcePicker
      source="/resurse"
      items={[
        {
          resource: "arabizi-cheat-sheet",
          fileHref: "/arabizi-cheat-sheet.pdf",
          title: "Cheat-sheet Arabizi",
          description: "Tabelul cifrelor, 20 de expresii libaneze și un mesaj real de WhatsApp decodat.",
        },
        {
          resource: "100-expresii-libaneze",
          fileHref: "/100-expresii-libaneze.pdf",
          title: "100 de expresii libaneze",
          description: "Șapte situații de zi cu zi, cu pronunție în arabizi și traducere în română.",
        },
        {
          resource: "plan-30-zile",
          fileHref: "/plan-30-zile-araba-libaneza.pdf",
          title: "Plan de 30 de zile",
          description: "15–20 de minute pe zi, cu obiective săptămânale și resurse gratuite recomandate.",
        },
      ]}
    />

    <h2>Ce conține fiecare</h2>
    <ul>
      <li>
        <strong>Cheat-sheet Arabizi</strong> — o pagină cu tabelul cifrelor (2, 3, 5, 7, 8) și literele
        arabe pe care le înlocuiesc, 20 de expresii esențiale și un mesaj real de WhatsApp decodat cuvânt
        cu cuvânt. Ghidul complet stă pe <Link to="/arabizi">pagina Arabizi</Link>.
      </li>
      <li>
        <strong>100 de expresii libaneze</strong> — expresiile de care ai nevoie în primele luni, grupate
        pe situații: salut și prezentare, restaurant, taxi, cumpărături, familie, urări și politețe.
      </li>
      <li>
        <strong>Plan de 30 de zile</strong> — ce faci în fiecare zi, folosind doar resurse gratuite, cu
        verificări la final de săptămână. Vezi și{" "}
        <Link to="/invata-araba-gratis">ghidul complet de învățare gratuită</Link>.
      </li>
    </ul>

    <h2>Resurse gratuite direct pe site</h2>
    <ul>
      <li><Link to="/joc">Jocul Yalla</Link> — peste 4.300 de expresii libaneze, cu recapitulări programate. Gratuit, fără cont.</li>
      <li><Link to="/test-de-nivel">Test de nivel</Link> — ~15 minute, îți spune de unde pornești.</li>

      <li><Link to="/fara-alfabet-arab">Cum înveți fără alfabetul arab</Link>.</li>
      <li><Link to="/blog/primele-20-de-expresii-libaneze">Primele 20 de expresii libaneze</Link>.</li>
      <li><Link to="/blog/numere-in-araba-libaneza">Numerele în araba libaneză</Link>.</li>
      <li><Link to="/blog/gramatica-arabei-libaneze">Gramatica libaneză pe înțelesul tuturor</Link>.</li>
      <li><Link to="/trial">Lecția de probă gratuită</Link> — 30 min cu profesor nativ.</li>
    </ul>

    <h2>Când resursele gratuite nu mai sunt suficiente</h2>
    <p>
      PDF-urile te duc până la primele conversații simple. Dacă vrei corectare pe pronunție și
      progres constant, continuă cu un <Link to="/cursuri-limba-araba">curs de arabă libaneză</Link> —
      grupe mici A1–C2 <Link to="/cursuri-araba-bucuresti">în București</Link> sau online, ori{" "}
      <Link to="/meditatii-araba">meditații de arabă 1:1</Link> adaptate obiectivului tău.
    </p>
  </LandingLayout>
);

export default Resurse;
