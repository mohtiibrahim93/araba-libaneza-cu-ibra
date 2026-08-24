import { Link } from "react-router-dom";
import LandingLayout from "@/components/seo/LandingLayout";

const FAQ = [
  {
    q: "Cât costă o meditație de arabă?",
    a: "150 lei/lecție (60 min) pentru meditații 1:1, cu reduceri automate la pachet: −5% de la 5 lecții, −10% de la 10 și −20% de la 20. Prima lecție de probă (30 min) este gratuită, ca să vezi cum lucrăm înainte să te decizi.",
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
    metaTitle="Meditații Arabă Libaneză în București și Online | 150 lei/lecție"
    description="Meditații de arabă libaneză cu profesor nativ libanez, 1:1, ritm personalizat. Fizic în București (Strada Icoanei 80) sau online pe Zoom. 150 lei/lecție, pachete cu până la −20%, prima lecție gratuită."
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
            <td className="py-2 pr-3 font-semibold">5 lecții</td>
            <td className="py-2 px-3">712 lei</td>
            <td className="py-2 pl-3">−5%</td>
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

    <h2>Meditații fizic în București sau online pe Zoom</h2>
    <p>
      Poți alege lecții fizice la Raduga Creative Center (Strada Icoanei 80, sector 2) sau online, de
      oriunde. Ambele formate au același profesor nativ, aceeași metodă și același preț. Dacă locuiești
      în București și vrei flexibilitate maximă, <Link to="/cursuri-araba-bucuresti">cursurile de arabă în București</Link> oferă și variante de grup.
    </p>
  </LandingLayout>
);

export default MeditatiiAraba;