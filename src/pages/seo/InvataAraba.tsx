import { Link } from "react-router-dom";
import LandingLayout from "@/components/seo/LandingLayout";

const FAQ = [
  {
    q: "Cum înveți araba de la zero?",
    a: "Cel mai eficient e să începi cu un dialect vorbit (nu MSA) și cu metoda Oral First: vorbești din prima lecție, folosind arabizi (scriere cu litere latine). Alfabetul arab vine treptat, după 2–3 luni, când ai deja vocabular și ureche formată. Ritm optim: 2 lecții de 90 min/săptămână.",
  },
  {
    q: "Cât de greu e să înveți araba?",
    a: "E percepută ca dificilă din cauza alfabetului și a distanței față de limbile europene. În realitate, gramatica dialectului libanez e mai simplă decât gramatica română (fără cazuri, fără genuri complicate). Partea grea e pronunția câtorva sunete guturale și vocabularul complet nou — dar acestea se rezolvă cu practică orală constantă.",
  },
  {
    q: "Pot învăța araba singur, fără profesor?",
    a: "Poți învăța vocabular și gramatică din aplicații (Duolingo, Memrise), dar fără feedback pe pronunție rămâi cu greșeli care se fixează. Recomandăm minim 1 lecție/săptămână cu profesor nativ pentru corectare, plus practică zilnică cu resurse gratuite între lecții.",
  },
  {
    q: "Cât timp îmi ia să învăț araba pentru conversație?",
    a: "6–10 luni pentru conversații de bază (A2), 1,5–2 ani pentru fluență conversațională (B1/B2), cu 2 lecții/săpt. + practică. E realist, nu marketing — depinde de constanță, nu de talent. Detalii în ghidul „cât durează să înveți araba libaneză”.",
  },
];

const InvataAraba = () => (
  <LandingLayout
    slug="invata-araba"
    title="Învață araba libaneză de la zero — ghid complet + cursuri cu profesor nativ"
    metaTitle="Învață Araba Libaneză de la Zero — Metodă, Timp & Cursuri | 2026"
    description="Ghid pas cu pas pentru a învăța araba libaneză de la zero: ce dialect alegi, cât durează, ce metodă folosești. Plus cursuri cu profesor nativ, online sau fizic."
    crumb="Învață araba libaneză"
    lead="Vrei să înveți araba libaneză, dar nu știi de unde să începi? Ghid clar despre alegerea dialectului, metoda potrivită și timpul necesar — plus cursuri cu profesor nativ."
    faq={FAQ}
  >
    <p>
      Ai decis să <strong>înveți araba</strong> și te-ai lovit imediat de întrebări: „De unde
      încep? Alfabetul mai întâi? Ce dialect? Cât durează?”. Îți răspundem la toate mai jos, apoi
      îți arătăm cursurile prin care poți începe azi.
    </p>

    <h2>Pasul 1: alegi dialectul, nu doar „araba”</h2>
    <p>
      „Araba” nu e o singură limbă. Există araba standard (MSA / Fusha) — scrisă, formală, folosită
      în știri — și zeci de dialecte vorbite. Dacă vrei să vorbești cu oameni reali (familie,
      călătorii, muzică, seriale), începi cu un <strong>dialect vorbit</strong>. Noi predăm{" "}
      <Link to="/blog/araba-libaneza-vs-araba-standard">dialectul libanez</Link>, care acoperă
      toată zona Levantului (Liban, Siria, Iordania, Palestina). Vezi harta completă în{" "}
      <Link to="/dialecte-arabe">ghidul dialectelor arabe</Link> și decide rapid cu{" "}
      <Link to="/ce-araba-sa-inveti">ce arabă să înveți</Link>.
    </p>

    <h2>Pasul 2: metoda — vorbește înainte să scrii</h2>
    <p>
      Cea mai comună greșeală: să începi cu alfabetul arab și să pierzi 2 luni desenând litere fără
      să spui o propoziție. Metoda <strong>Oral First</strong> inversează ordinea: vorbești din
      prima lecție folosind{" "}
      <Link to="/blog/ce-este-arabizi">arabizi</Link> (scriere cu litere latine), iar alfabetul
      arab vine când ai deja ureche și vocabular. Detalii pas cu pas în{" "}
      <Link to="/blog/cum-inveti-araba-libaneza">cum înveți araba libaneză</Link>.
    </p>

    <h2>Pasul 3: alege formatul care ți se potrivește</h2>
    <ul>
      <li><strong><Link to="/cursuri/grup">Curs de grup A1–C2</Link></strong> — de la 500 lei/lună, grupe mici, ritm structurat.</li>
      <li><strong><Link to="/cursuri/private">Meditații 1:1</Link></strong> — 150 lei/lecție, ritm și program flexibil.</li>
      <li><strong><Link to="/cursuri/copii">Curs pentru copii</Link></strong> — 6–10 ani, fizic în București.</li>
    </ul>

    <h2>Pasul 4: începe cu o probă gratuită</h2>
    <p>
      30 de minute cu profesor nativ, fără nicio obligație. Verifici metoda, pui întrebări, decizi
      dacă e pentru tine. <Link to="/trial">Rezervă lecția de probă</Link> sau fă{" "}
      <Link to="/quiz">testul de nivel</Link> dacă știi deja puțină arabă.
    </p>

    <h2>Vrei să începi gratis?</h2>
    <p>
      Poți porni fără să plătești nimic: mini-lecția, PDF-urile și planul de 30 de zile sunt în{" "}
      <Link to="/invata-araba-gratis">ghidul de învățare gratuită</Link>, iar toate materialele
      descărcabile stau pe <Link to="/resurse">pagina de resurse</Link>.
    </p>
  </LandingLayout>
);

export default InvataAraba;