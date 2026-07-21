import { Link } from "react-router-dom";
import LandingLayout from "@/components/seo/LandingLayout";

const FAQ = [
  {
    q: "Cât costă o meditație de arabă?",
    a: "150 lei/lecție (90 min) pentru meditații 1:1, cu 15% reducere la pachete de 20+ lecții. Prima lecție de probă (30 min) este gratuită, ca să vezi cum lucrăm înainte să te decizi.",
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
    title="Meditații de arabă 1:1 — profesor nativ, program flexibil"
    metaTitle="Meditații Arabă 1:1 cu Profesor Nativ | București & Online"
    description="Meditații de limba arabă cu profesor nativ libanez, 1:1, ritm personalizat. Fizic în București sau online pe Zoom. 150 lei/lecție, primă lecție gratuită."
    crumb="Meditații arabă"
    lead="Meditații 1:1 cu profesor nativ, adaptate obiectivului tău — călătorie, familie, examen sau conversație. Fizic în București sau online, program flexibil."
    faq={FAQ}
  >
    <p>
      Cauți <strong>meditații de arabă</strong> cu un profesor care să-ți adapteze lecțiile la
      nivelul și scopul tău? La <Link to="/">Centrul de Arabă Libaneză cu Ibra</Link> lucrăm 1:1,
      cu vorbitor nativ libanez, în ritmul tău — fără grupă care te ține pe loc sau te grăbește.
    </p>

    <h2>Când merită meditații în locul unui curs de grup</h2>
    <ul>
      <li><strong>Ai un obiectiv precis:</strong> călătorie în Liban, comunicare cu familia soțului/soției, un examen sau un interviu.</li>
      <li><strong>Nu se potrivesc orele grupei:</strong> program de lucru variabil, fus orar diferit, copii mici acasă.</li>
      <li><strong>Vrei progres mai rapid:</strong> 100% atenție profesor, feedback pe fiecare cuvânt.</li>
      <li><strong>Ești la un nivel intermediar sau avansat</strong> și n-ai grupă potrivită.</li>
    </ul>

    <h2>Cum arată o meditație tipică</h2>
    <p>
      90 de minute, structurat: 10 min recap, 30 min material nou (vocabular + gramatică prin
      exemple), 30–40 min conversație aplicată, 10 min feedback + temă. Fără prelegeri lungi —
      vorbești tu, în arabă libaneză, din prima lecție. Metoda o descriem pe larg în{" "}
      <Link to="/blog/cum-inveti-araba-libaneza">cum înveți araba libaneză</Link>.
    </p>

    <h2>Prețuri și pachete</h2>
    <ul>
      <li><strong>Lecție individuală:</strong> 150 lei / 90 min</li>
      <li><strong>Pachet 10 lecții:</strong> 1.425 lei (5% reducere)</li>
      <li><strong>Pachet 20 lecții:</strong> 2.550 lei (15% reducere)</li>
      <li><strong>Prima lecție de probă:</strong> gratuită, 30 min</li>
    </ul>
    <p>
      Rezervi direct din <Link to="/cursuri/private">pagina de lecții private</Link> sau începi cu{" "}
      <Link to="/trial">proba gratuită de 30 min</Link>.
    </p>
  </LandingLayout>
);

export default MeditatiiAraba;