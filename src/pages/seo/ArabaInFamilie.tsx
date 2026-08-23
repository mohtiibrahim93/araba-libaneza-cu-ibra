import { Link } from "react-router-dom";
import LandingLayout from "@/components/seo/LandingLayout";

const FAQ = [
  {
    q: "Cum îmi învăț copilul araba dacă eu nu o vorbesc?",
    a: "Nu trebuie să o vorbești tu. Copilul are nevoie de expunere constantă (o oră structurată pe săptămână plus rutine scurte acasă: salut, numărat, un cântec) și de un vorbitor nativ care corectează pronunția. Părintele poate învăța în paralel, ceea ce ajută enorm la motivație.",
  },
  {
    q: "De la ce vârstă poate începe un copil?",
    a: "De la 4 ani, fizic, prin joc, cântece și povești. Cursurile online sunt potrivite de la 10 ani, când copilul poate susține atenția pe ecran.",
  },
  {
    q: "Copilul amestecă limbile — e o problemă?",
    a: "Nu. Amestecul (code-switching) este normal în familiile bilingve și dispare treptat pe măsură ce vocabularul din fiecare limbă crește. Important e ca fiecare limbă să aibă contexte proprii și constante.",
  },
  {
    q: "Ce fac dacă doar un părinte e libanez?",
    a: "Funcționează bine regula „o persoană, o limbă”: părintele libanez vorbește consecvent arabă, celălalt româna. Lipsa consecvenței, nu lipsa timpului, e motivul principal pentru care copiii nu ajung să vorbească.",
  },
  {
    q: "Putem învăța părinte și copil împreună?",
    a: "Da. Copilul merge la grupa lui, iar părintele la o grupă de adulți sau la lecții 1:1; temele se pot suprapune ca vocabular, astfel încât acasă exersați aceleași cuvinte.",
  },
];

const ArabaInFamilie = () => (
  <LandingLayout
    slug="araba-in-familie"
    title="Arabă libaneză în familie: copii bilingvi și părinți care învață"
    metaTitle="Arabă Libaneză în Familie — Copii Bilingvi și Părinți | Ghid"
    description="Cum crești un copil bilingv româno-libanez: rutine zilnice, regula „o persoană, o limbă”, expresii de acasă și cursuri pentru copii și părinți, în București sau online."
    crumb="Arabă în familie"
    lead="Pentru familiile mixte româno-libaneze: cum păstrezi limba în casă, ce faci concret în fiecare zi și de unde începe fiecare membru al familiei."
    enHref="/en/learn-lebanese-arabic"
    faq={FAQ}
  >
    <p>
      Limba nu se transmite automat. În familiile mixte, araba dispare de obicei într-o singură
      generație — nu din lipsă de dorință, ci din lipsă de <strong>rutină</strong>. Câteva obiceiuri
      mici, ținute constant, fac mai mult decât o oră intensivă pe lună.
    </p>

    <h2>Rutine care funcționează acasă</h2>
    <ul>
      <li><strong>Dimineața și seara</strong> — salut și noapte bună mereu în arabă: <em>saba7 el kheir</em> / <em>tesba7 3a kheir</em>.</li>
      <li><strong>La masă</strong> — numele mâncărurilor și <em>sa77tein</em>; mesele libaneze sunt cel mai natural context de vocabular.</li>
      <li><strong>Numărat zilnic</strong> — trepte, jucării, fructe (vezi <Link to="/blog/numere-in-araba-libaneza">numerele în libaneză</Link>).</li>
      <li><strong>Un cântec pe săptămână</strong> — muzica fixează pronunția mai bine decât listele de cuvinte.</li>
      <li><strong>Apel video cu bunicii</strong> — 10 minute, doar în arabă; e cea mai puternică motivație pentru un copil.</li>
    </ul>

    <h2>Regula „o persoană, o limbă”</h2>
    <p>
      Fiecare părinte vorbește constant o singură limbă cu copilul. Creierul copilului asociază limba
      cu persoana și trece între ele fără efort. Amestecul ocazional nu strică nimic; lipsa
      constanței, da. Vocabularul de bază pentru relațiile de familie e aici:{" "}
      <Link to="/blog/lebanese-family-vocabulary">cuvintele familiei în libaneză</Link>.
    </p>

    <h2>De unde începe fiecare</h2>
    <ul>
      <li><strong>Copii 4–10 ani</strong> — <Link to="/curs-araba-copii">curs prin joc, fizic în București</Link>, cântece, povești, jocuri de rol.</li>
      <li><strong>Copii 11–17 ani</strong> — <Link to="/cursuri/tineri">grupa de tineri</Link>, cu accent pe conversație și cultură.</li>
      <li><strong>Părinți</strong> — <Link to="/cursuri/grup">grupa A1 de adulți</Link> sau <Link to="/meditatii-araba">lecții 1:1</Link>; dacă e vorba de socri și relație, vezi <Link to="/araba-pentru-partener">araba pentru partener</Link>.</li>
      <li><strong>Familii în afara Bucureștiului</strong> — <Link to="/araba-online">varianta online</Link>, live pe Zoom.</li>
    </ul>

    <h2>Materiale gratuite pentru acasă</h2>
    <p>
      Descarcă <Link to="/resurse">cele trei PDF-uri gratuite</Link> (cheat-sheet arabizi, 100 de
      expresii, plan de 30 de zile) și folosește-le ca „temă comună” pentru toată familia. Ghidul
      complet al resurselor gratuite e la{" "}
      <Link to="/invata-araba-gratis">învață araba gratis</Link>, iar dacă nu știi ce variantă de
      arabă vă trebuie, citește <Link to="/ce-araba-sa-inveti">ce arabă să înveți</Link>.
    </p>
    <p>
      Prima lecție de probă e <Link to="/trial">gratuită</Link>, pentru copil sau pentru părinte.
    </p>
  </LandingLayout>
);

export default ArabaInFamilie;
