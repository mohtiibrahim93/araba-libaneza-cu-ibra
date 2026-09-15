import { Link } from "@/lib/router-compat";
import LandingLayout from "@/components/seo/LandingLayout";

const FAQ = [
  {
    q: "Cât costă o meditație de arabă?",
    a: "150 lei/lecție (60 min) pentru meditații 1:1, cu reduceri automate la pachet: −10% de la 10 lecții și −20% de la 20. Prima lecție de probă (30 min) este gratuită, ca să vezi cum lucrăm înainte să te decizi.",
  },
  {
    q: "Meditațiile sunt fizic sau online?",
    a: "Ambele. Fizic în București (Strada Icoanei 80) sau online pe Zoom, oriunde te-ai afla. Majoritatea studenților noștri privați aleg online pentru flexibilitatea programului.",
  },
  {
    q: "Ce ritm recomandați pentru meditații de arabă?",
    a: "2 lecții/săptămână e ritmul optim pentru progres constant. Cu 1 lecție/săptămână progresezi mai lent, dar e ok dacă ai un program aglomerat. Sub 1 lecție/săptămână ai tendința să uiți între ședințe.",
  },
  {
    q: "Pot lua meditații doar pentru un scop specific (călătorie, familie, examen)?",
    a: "Da, exact asta e avantajul lecțiilor 1:1. Adaptăm materialul la obiectivul tău: conversație de vacanță, vocabular pentru comunicarea cu familia soțului/soției, pregătire pentru un examen sau interviu în arabă.",
  },
];

const MeditatiiAraba = () => (
  <LandingLayout
    slug="meditatii-araba"
    enHref="/en/arabic-tutor"
    title="Meditații de arabă libaneză 1:1 — București și online"
    metaTitle="Meditații Arabă 1:1 București & Online | 150 lei/oră"
    description="Meditații de arabă libaneză 1:1 cu profesor nativ, în București sau online. 150 lei/lecție de 60 min, pachete −20%, prima lecție de probă gratuită."
    crumb="Meditații arabă libaneză"
    lead="Meditații 1:1 de arabă libaneză cu profesor nativ, adaptate obiectivului tău — călătorie, familie, examen sau conversație. Fizic în București sau online, program flexibil, preț transparent."
    faq={FAQ}
  >
    <p>
      Cauți <strong>meditații de arabă</strong> cu un profesor care să-ți adapteze lecțiile la
      nivelul și scopul tău? La <Link to="/">Centrul de Arabă Libaneză cu Ibra</Link> lucrăm 1:1,
      cu vorbitor nativ libanez, în ritmul tău — fără grupă care te ține pe loc sau te grăbește.
      Fiecare lecție e de 60 de minute, live, cu feedback imediat pe pronunție.
    </p>

    <h2>Când merită meditații în locul unui curs de grup</h2>
    <ul>
      <li><strong>Ai un obiectiv precis:</strong> călătorie în Liban, comunicare cu familia soțului/soției, un examen sau un interviu.</li>
      <li><strong>Nu se potrivesc orele grupei:</strong> program de lucru variabil, fus orar diferit, copii mici acasă.</li>
      <li><strong>Vrei progres mai rapid:</strong> 100% atenție profesor, feedback pe fiecare cuvânt.</li>
      <li><strong>Ești la un nivel intermediar sau avansat</strong> și n-ai grupă potrivită.</li>
      <li><strong>Vrei să înveți doar conversație</strong>, fără alfabetul arab — metoda noastră Oral First pornește cu <Link to="/arabizi">arabizi</Link>.</li>
    </ul>

    <h2>Prețuri și pachete de meditații</h2>
    <div className="overflow-x-auto not-prose">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b border-border text-left text-muted-foreground">
            <th className="py-2 pr-3 font-semibold">Pachet</th>
            <th className="py-2 px-3 font-semibold">Preț</th>
            <th className="py-2 pl-3 font-semibold">Reducere</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-border/60 align-top">
            <td className="py-2 pr-3 font-semibold">Lecție individuală (60 min)</td>
            <td className="py-2 px-3">150 lei</td>
            <td className="py-2 pl-3">—</td>
          </tr>
          <tr className="border-b border-border/60 align-top">
            <td className="py-2 pr-3 font-semibold">10 lecții</td>
            <td className="py-2 px-3">1.350 lei</td>
            <td className="py-2 pl-3">−10%</td>
          </tr>
          <tr className="border-b border-border/60 align-top">
            <td className="py-2 pr-3 font-semibold">20 lecții</td>
            <td className="py-2 px-3">2.400 lei</td>
            <td className="py-2 pl-3">−20%</td>
          </tr>
        </tbody>
      </table>
    </div>
    <p>
      Prima lecție de probă (30 min) este gratuită. Rezervi direct din <Link to="/cursuri/private">pagina de lecții private</Link> sau începi cu{" "}
      <Link to="/trial">proba gratuită de 30 min</Link>.
    </p>

    <h2>Cum arată o meditație tipică</h2>
    <p>
      60 de minute, structurat: 5 min recap, 20 min material nou (vocabular + gramatică prin
      exemple), 25–30 min conversație aplicată, 5 min feedback + temă. Fără prelegeri lungi —
      vorbești tu, în arabă libaneză, din prima lecție. Metoda o descriem pe larg în{" "}
      <Link to="/blog/cum-inveti-araba-libaneza">cum înveți araba libaneză</Link>.
    </p>

    <h2>Meditații de arabă în București — unde și când</h2>
    <p>
      Dacă cauți <strong>meditații de arabă în București</strong>, lecțiile fizice au loc la Raduga
      Creative Center, Strada Icoanei 80 (sector 2), la 5 minute de Piața Rosetti și aproape de
      Universitate și Piața Romană. Orarul se stabilește împreună: dimineața (09:00–12:00), la prânz
      sau seara (18:00–21:00), inclusiv sâmbătă. Dacă stai în alt sector sau în alt oraș, varianta
      online pe Zoom are exact același conținut și preț.
    </p>

    <h2>Ce dialect înveți la meditații: libaneză (levantină), nu arabă standard</h2>
    <p>
      Meditațiile sunt de <strong>arabă libaneză</strong>, parte din familia dialectelor{" "}
      <strong>levantine</strong> (Liban, Siria, Iordania, Palestina) — limba pe care oamenii o
      vorbesc de fapt acasă, în vacanță, în muzică și pe rețelele sociale. Araba standard (MSA /
      Fusha) o adăugăm doar dacă ai nevoie de citit, examene sau scriere formală. Diferența,
      explicată cu exemple, e în{" "}
      <Link to="/blog/araba-libaneza-vs-araba-standard">araba libaneză vs araba standard</Link> și în{" "}
      <Link to="/ce-araba-sa-inveti">ce arabă să înveți</Link>.
    </p>

    <h2>Cât de repede progresezi cu meditații 1:1</h2>
    <div className="overflow-x-auto not-prose">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b border-border text-left text-muted-foreground">
            <th className="py-2 pr-3 font-semibold">După</th>
            <th className="py-2 px-3 font-semibold">Ce poți face</th>
            <th className="py-2 pl-3 font-semibold">Ritm</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-border/60 align-top">
            <td className="py-2 pr-3 font-semibold">4 lecții</td>
            <td className="py-2 px-3">Salut, prezentare, întrebări simple, numere</td>
            <td className="py-2 pl-3">2 lecții/săpt.</td>
          </tr>
          <tr className="border-b border-border/60 align-top">
            <td className="py-2 pr-3 font-semibold">10 lecții</td>
            <td className="py-2 px-3">Conversație de bază: cafenea, taxi, cumpărături, familie</td>
            <td className="py-2 pl-3">2 lecții/săpt.</td>
          </tr>
          <tr className="border-b border-border/60 align-top">
            <td className="py-2 pr-3 font-semibold">20 lecții</td>
            <td className="py-2 px-3">Conversații pe teme largi, înțelegi vorbirea naturală lentă</td>
            <td className="py-2 pl-3">2 lecții/săpt.</td>
          </tr>
        </tbody>
      </table>
    </div>
    <p>
      Estimările sunt pentru cursanți care fac și 10–15 minute de recapitulare între lecții. Detalii
      în <Link to="/blog/cat-dureaza-sa-inveti-araba-libaneza">cât durează să înveți araba libaneză</Link>.
    </p>

    <h2>Meditații sau curs de grup?</h2>
    <p>
      Dacă vrei cost mai mic și conversație cu colegi, un{" "}
      <Link to="/cursuri/grup">curs de grup A1–C2</Link> (de la 500 lei/lună) e mai potrivit.
      Comparația completă a formatelor e în{" "}
      <Link to="/cel-mai-bun-curs-de-araba">cum alegi cel mai bun curs de arabă</Link>. Pentru
      adolescenți 11–17 ani avem <Link to="/cursuri-araba-adolescenti">grupe dedicate</Link>.
    </p>

    <h2>Meditații fizic în București sau online pe Zoom</h2>
    <p>
      Poți alege lecții fizice la Raduga Creative Center (Strada Icoanei 80, sector 2) sau online, de
      oriunde. Ambele formate au același profesor nativ, aceeași metodă și același preț. Dacă locuiești
      în București și vrei flexibilitate maximă, <Link to="/cursuri-araba-bucuresti">cursurile de arabă în București</Link> oferă și variante de grup.
    </p>
  </LandingLayout>
);

export default MeditatiiAraba;
