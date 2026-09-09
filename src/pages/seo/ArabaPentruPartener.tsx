import { Link } from "react-router-dom";
import LandingLayout from "@/components/seo/LandingLayout";

const FAQ = [
  {
    q: "Cât trebuie să știu ca să vorbesc cu socrii libanezi?",
    a: "Pentru primele întâlniri e suficient un set de 60–80 de expresii: salut, formule de politețe, complimente pentru mâncare, întrebări simple despre familie și urări. Se învață realist în 4–6 săptămâni, fără alfabetul arab.",
  },
  {
    q: "Partenerul meu vorbește engleza — mai are rost?",
    a: "Da, și e cel mai apreciat gest. Familia extinsă (bunici, mătuși, vecini) vorbește adesea doar arabă, iar glumele, alintările și emoțiile rămân în limba maternă. Câteva fraze corecte schimbă complet felul în care ești primit.",
  },
  {
    q: "Ce dialect vorbește familia din Liban?",
    a: "Arabă libaneză, un dialect levantin de nord. Nu araba standard din manuale — de aceea multe cursuri clasice nu te ajută la masa de duminică. Vezi comparația în ghidul „ce arabă să înveți”.",
  },
  {
    q: "Putem învăța împreună, eu și partenerul meu?",
    a: "Da. Lecțiile private 1:1 pot fi ținute în doi, cu ritm și teme adaptate. Partenerul nativ devine partener de conversație între lecții, ceea ce accelerează mult progresul.",
  },
  {
    q: "Mi-e teamă că pronunț greșit și e jenant.",
    a: "Greșelile sunt primite cu căldură în cultura libaneză — efortul contează mai mult decât acuratețea. La lecții corectăm pronunția sunetelor care nu există în română (ع, ح, خ, غ) până devin naturale.",
  },
];

const ArabaPentruPartener = () => (
  <LandingLayout
    slug="araba-pentru-partener"
    title="Arabă libaneză pentru partener și familia lui"
    metaTitle="Arabă Libaneză pentru Partener și Familie | Curs 1:1"
    description="Învață expresii libaneze pentru partener și familie, de la alintări la urări la masă. Curs 1:1 cu profesor nativ, online sau în București."
    crumb="Arabă pentru partener"
    lead="Cel mai frecvent motiv pentru care oamenii ne scriu: o relație cu cineva din Liban. Iată ce înveți întâi și cum te pregătești pentru prima întâlnire cu familia."
    enHref={null}
    faq={FAQ}
  >
    <p>
      Nu ai nevoie de fluență ca să fii acceptat. Ai nevoie de <strong>zece fraze spuse corect</strong>,
      la momentul potrivit. În cultura libaneză, efortul de a vorbi limba familiei e citit direct ca
      respect.
    </p>

    <h2>Primele expresii pentru întâlnirea cu familia</h2>
    <p>Scrise în <Link to="/arabizi">arabizi</Link> (7 = h aspru, 3 = ع, 2 = oprire glotală):</p>
    <ul>
      <li><strong>mar7aba, tsharrafna</strong> — bună ziua, îmi pare bine de cunoștință</li>
      <li><strong>kif 7adretak / 7adretik?</strong> — ce mai faceți? (formă respectuoasă)</li>
      <li><strong>shukran ktir 3a hal 2akel</strong> — mulțumesc mult pentru mâncare</li>
      <li><strong>sa77tein</strong> — poftă bună (se spune la masă)</li>
      <li><strong>2eideyke</strong> — „binecuvântate fie mâinile tale”, complimentul clasic pentru gazdă</li>
      <li><strong>bayti baytak</strong> — casa mea e casa ta</li>
      <li><strong>ma3lesh, lissa 3am ta3allam</strong> — scuze, încă învăț</li>
      <li><strong>allah y7fazkon</strong> — Dumnezeu să vă păzească (urare uzuală la plecare)</li>
    </ul>
    <p>
      Continuare utilă:{" "}
      <Link to="/blog/cum-saluti-in-libaneza">cum saluți corect în libaneză</Link>,{" "}
      <Link to="/blog/lebanese-family-vocabulary">vocabularul familiei</Link> și{" "}
      <Link to="/blog/primele-20-de-expresii-libaneze">primele 20 de expresii</Link>.
    </p>

    <h2>Alintări și expresii de afecțiune</h2>
    <ul>
      <li><strong>7abibi / 7abibti</strong> — dragul meu / draga mea</li>
      <li><strong>b7ibbak / b7ibbik</strong> — te iubesc (către el / către ea)</li>
      <li><strong>2albi</strong> — inima mea</li>
      <li><strong>3younii</strong> — ochii mei (alintare foarte comună)</li>
      <li><strong>ya rou7i</strong> — sufletul meu</li>
      <li><strong>eshta2tillak / eshta2tillik</strong> — mi-e dor de tine</li>
    </ul>

    <h2>Plan realist: 6 săptămâni până la prima conversație</h2>
    <ul>
      <li><strong>Săptămânile 1–2</strong> — salut, prezentare, politețe; citești orice în arabizi (<Link to="/fara-alfabet-arab">de ce fără alfabet</Link>).</li>
      <li><strong>Săptămânile 3–4</strong> — familie, mâncare, urări; înțelegi ce se vorbește la masă.</li>
      <li><strong>Săptămânile 5–6</strong> — întrebări și răspunsuri scurte despre tine, muncă, planuri.</li>
    </ul>
    <p>
      Materialele de sprijin sunt gratuite: <Link to="/resurse">cele trei PDF-uri</Link> (cheat-sheet
      arabizi, 100 de expresii, plan de 30 de zile) și{" "}
      <Link to="/invata-araba-gratis">ghidul de învățare gratuită</Link>.
    </p>

    <h2>Ce format ți se potrivește</h2>
    <p>
      Pentru un obiectiv personal și un termen clar (o vizită, o nuntă, o întâlnire cu socrii),{" "}
      <Link to="/meditatii-araba">meditațiile de arabă 1:1</Link> sunt cele mai eficiente — lucrăm exact
      pe situațiile tale. Dacă vrei ritm constant și costuri mai mici, alege{" "}
      <Link to="/cursuri/grup">cursul de grup A1</Link>, fizic în București sau{" "}
      <Link to="/cursuri-limba-araba">online</Link>. Prima lecție de probă e{" "}
      <Link to="/trial">gratuită</Link> — vino cu contextul tău și pornim de acolo.
    </p>
  </LandingLayout>
);

export default ArabaPentruPartener;
