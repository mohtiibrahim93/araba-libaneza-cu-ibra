import { Link } from "react-router-dom";
import LandingLayout from "@/components/seo/LandingLayout";
import ResourceDownloadForm from "@/components/ResourceDownloadForm";

const FAQ = [
  {
    q: "Cum primesc materialele?",
    a: "Completezi prenumele și emailul la resursa dorită, bifezi acordul și primești imediat un email cu linkul de descărcare al PDF-ului.",
  },
  {
    q: "Costă ceva?",
    a: "Nu. Toate materialele de pe această pagină sunt gratuite, fără card și fără abonament.",
  },
  {
    q: "Pot primi toate materialele deodată?",
    a: "Da, completează pe rând formularele de mai jos. Fiecare resursă vine într-un email separat, cu propriul link de descărcare.",
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
    metaTitle="Resurse Gratuite Arabă Libaneză — PDF-uri, Expresii, Plan 30 Zile"
    description="Descarcă gratuit materialele noastre pentru arabă libaneză: cheat-sheet arabizi, 100 de expresii esențiale și planul de învățare de 30 de zile. PDF pe email, fără costuri."
    crumb="Resurse gratuite"
    lead="Toate materialele noastre gratuite într-un singur loc. Alegi resursa, lași emailul și primești PDF-ul în câteva secunde."
    enHref="/blog/lebanese-arabic-learning-resources"
    faq={FAQ}
  >
    <p>
      Materialele sunt făcute pentru <strong>araba libaneză vorbită</strong> și scrise în{" "}
      <Link to="/arabizi">arabizi</Link>, ca să le poți citi din prima zi, fără alfabetul arab.
    </p>

    <h2>1. Cheat-sheet Arabizi</h2>
    <p>
      O pagină cu tabelul cifrelor (2, 3, 5, 6, 7, 8, 9) și literele arabe pe care le înlocuiesc, 20
      de expresii esențiale și un mesaj real de WhatsApp decodat cuvânt cu cuvânt. Ghidul complet
      stă pe <Link to="/arabizi">pagina Arabizi</Link>.
    </p>
    <ResourceDownloadForm
      resource="arabizi-cheat-sheet"
      source="/resurse"
      idPrefix="res-arabizi"
      fileHref="/arabizi-cheat-sheet.pdf"
      title="Cheat-sheet Arabizi (PDF)"
      description="Tabelul cifrelor, 20 de expresii libaneze și un mesaj real decodat. Gratuit, pe email."
    />

    <h2>2. Pachetul de start: 100 de expresii libaneze</h2>
    <p>
      Expresiile de care ai nevoie în primele luni, grupate pe situații: salut și prezentare,
      restaurant, taxi, cumpărături, familie, urări și politețe. Fiecare cu arabizi și traducere.
    </p>
    <ResourceDownloadForm
      resource="100-expresii-libaneze"
      source="/resurse"
      idPrefix="res-exp100"
      fileHref="/100-expresii-libaneze.pdf"
      title="100 de expresii libaneze esențiale (PDF)"
      description="Șapte situații de zi cu zi, cu pronunție în arabizi și traducere în română."
    />

    <h2>3. Plan de învățare pentru 30 de zile</h2>
    <p>
      Ce faci în fiecare zi, 15–20 de minute, folosind doar resurse gratuite, cu verificări la final
      de săptămână. Vezi și <Link to="/invata-araba-gratis">ghidul complet de învățare gratuită</Link>.
    </p>
    <ResourceDownloadForm
      resource="plan-30-zile"
      source="/resurse"
      idPrefix="res-plan30"
      fileHref="/plan-30-zile-araba-libaneza.pdf"
      title="Plan de 30 de zile (PDF)"
      description="Program zilnic de 15–20 min, cu obiective săptămânale și resurse gratuite recomandate."
    />

    <h2>Resurse gratuite direct pe site</h2>
    <ul>
      <li><Link to="/quiz">Test de nivel</Link> — 2 minute, îți spune de unde pornești.</li>
      <li><Link to="/fara-alfabet-arab">Cum înveți fără alfabetul arab</Link>.</li>
      <li><Link to="/blog/primele-20-de-expresii-libaneze">Primele 20 de expresii libaneze</Link>.</li>
      <li><Link to="/blog/numere-in-araba-libaneza">Numerele în araba libaneză</Link>.</li>
      <li><Link to="/blog/gramatica-araba-libaneza">Gramatica libaneză pe înțelesul tuturor</Link>.</li>
      <li><Link to="/trial">Lecția de probă gratuită</Link> — 30 min cu profesor nativ.</li>
    </ul>
  </LandingLayout>
);

export default Resurse;
