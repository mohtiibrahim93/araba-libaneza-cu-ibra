import { Link } from "react-router-dom";
import LandingLayout from "@/components/seo/LandingLayout";

const FAQ = [
  {
    q: "Ce fel de arabă învăț la aceste cursuri?",
    a: "Arabă libaneză (dialect levantin) — limba vie vorbită în Liban, Siria, Iordania și Palestina, nu araba clasică din manuale. E dialectul pe care îl auzi în muzică, seriale și conversații reale, iar profesorul este vorbitor nativ.",
  },
  {
    q: "Cât costă un curs de arabă?",
    a: "Cursurile de grup pornesc de la 500 lei/lună (2 lecții de 90 de minute pe săptămână), cu 10% reducere la plata integrală a nivelului. Lecțiile private costă 150 lei/lecție (60 min), cu reduceri automate: −5% de la 5 lecții, −10% de la 10 și −20% de la 20. Prima lecție de probă este gratuită.",
  },
  {
    q: "Pot începe de la zero, fără să știu nimic?",
    a: "Da — nivelul A1 este gândit exact pentru începători compleți. Vorbești din prima lecție prin metoda Oral First, folosind arabizi (scriere cu litere latine), iar alfabetul arab vine treptat, fără să te blocheze.",
  },
  {
    q: "Cursurile sunt în București sau online?",
    a: "Ambele. Fizic la Raduga Creative Center (Strada Icoanei 80, București) sau online pe Zoom, de oriunde. Toate nivelurile au variantă online.",
  },
  {
    q: "Cursurile de arabă sunt acreditate?",
    a: "Cursurile respectă structura CEFR (A1–C2) — același cadru european folosit de școlile de limbi. La final primești certificat intern pe nivelul absolvit. Pentru certificări oficiale internaționale (ex. ALPT, examene universitare) te putem pregăti separat.",
  },
  {
    q: "În ce limbă se predau lecțiile?",
    a: "Tu alegi. Ibra predă fluent în engleză, franceză, arabă și română — alegi limba în care te simți cel mai confortabil. Lecțiile nu se țin în germană sau alte limbi.",
  },
];

interface CursuriArabaProps {
  legacy?: boolean;
}

const CursuriAraba = ({ legacy = false }: CursuriArabaProps) => (
  <LandingLayout
    slug={legacy ? "cursuri-limba-araba" : "cursuri-araba"}
    enHref={legacy ? null : "/en/learn-lebanese-arabic"}
    deHref={legacy ? null : "/de/arabisch-lernen"}
    canonicalHref={legacy ? "/cursuri-araba" : undefined}
    title="Cursuri de limbă arabă (libaneză) — București și online, toate nivelurile"
    metaTitle={legacy ? "Cursuri de Arabă Libaneză | București și Online" : "Cursuri Arabă Libaneză A1–C2 | București și Online"}
    description={legacy ? "Alege cursul potrivit: grupă A1–C2, lecții private sau cursuri pentru copii, în București și online, cu profesor nativ libanez." : "Cursuri de arabă libaneză A1–C2 în București și online: grupe, lecții private 1:1 și cursuri pentru copii, toate cu profesor nativ. Probă gratuită."}
    crumb="Cursuri de limbă arabă"
    lead="Toate formatele într-un singur loc: grupe pe niveluri (A1–C2), lecții private 1:1 și curs pentru copii — cu profesor nativ, fizic în București sau online."
    faq={FAQ}
  >
    <p>
      Cauți un curs de arabă care să te facă să <strong>vorbești</strong>, nu doar să memorezi
      reguli? La <Link to="/">Centrul de Arabă Libaneză cu Ibra</Link> predăm dialectul libanez —
      limba reală a conversațiilor, muzicii și serialelor — cu un profesor nativ și metoda{" "}
      <strong>Oral First</strong>: vorbești din prima lecție.
    </p>

    <h2>Alege formatul potrivit</h2>
    <ul>
      <li>
        <strong><Link to="/cursuri/grup">Curs de grup (A1–C2)</Link></strong> — cel mai accesibil și
        mai motivant: grupe mici, 2 lecții de 90 min/săptămână, de la 500 lei/lună. Cohortele
        deschise: A1 fizic — Grupa 2 (luni & miercuri, start miercuri 2 septembrie 2026) și A2 fizic
        (marți & joi, start marți 1 septembrie 2026). Grupa A1 online este în desfășurare și completă.
      </li>
      <li>
        <strong><Link to="/cursuri/private">Lecții private 1:1</Link></strong> — ritm personalizat și
        program flexibil, 150 lei/lecție (60 min), fizic sau online.
      </li>
      <li>
        <strong><Link to="/cursuri/copii">Curs pentru copii (6–10 ani)</Link></strong> — învățare
        prin joc, cântece și povești, fizic în București.
      </li>
    </ul>

    <h2>De ce arabă libaneză, nu arabă standard?</h2>
    <p>
      Araba standard (MSA/Fusha) este limba scrisă a știrilor și documentelor — aproape nimeni nu o
      vorbește acasă. Dialectul libanez este limba pe care o folosești <em>de fapt</em> cu oamenii:
      în familie, în vacanță în Liban, pe Instagram și TikTok. Am explicat diferența pe larg în{" "}
      <Link to="/blog/araba-libaneza-vs-araba-standard">araba libaneză vs araba standard</Link>.
    </p>

    <h2>Cum arată drumul tău</h2>
    <ul>
      <li><strong>Săptămâna 1:</strong> saluți, te prezinți, pui primele întrebări — totul oral, cu arabizi.</li>
      <li><strong>Lunile 1–4 (A1):</strong> conversații de supraviețuire — restaurant, taxi, cumpărături.</li>
      <li><strong>Lunile 5–11 (A2):</strong> povestești la trecut și viitor, îți exprimi opiniile.</li>
      <li><strong>B1 și mai departe:</strong> conversație liberă, nuanțe culturale, fluență.</li>
    </ul>
    <p>
      Detalii despre durată pe fiecare nivel găsești în{" "}
      <Link to="/blog/cat-dureaza-sa-inveti-araba-libaneza">cât durează să înveți araba libaneză</Link>.
    </p>

    <h2>De ce cu profesor nativ</h2>
    <p>
      Pronunția, intonația și expresiile idiomatice nu se învață din manual — se preiau de la un
      vorbitor nativ. Ibra e libanez, cu peste 5 ani de experiență în predare, iar metoda{" "}
      <strong>Oral First</strong> te pune să vorbești din prima lecție, folosind{" "}
      <Link to="/arabizi">arabizi</Link> (scriere cu litere latine) până când alfabetul arab vine
      natural — nu ai nevoie de <Link to="/fara-alfabet-arab">alfabetul arab</Link> ca să începi.
    </p>

    <h2>În ce limbă se predau lecțiile</h2>
    <p>
      Ibra predă fluent în <strong>engleză, franceză, arabă și română</strong> — alegi limba în care
      te simți cel mai confortabil, iar explicațiile se ajustează după tine. Lecțiile nu se țin în
      germană sau alte limbi.
    </p>

    <h2>Cursuri de arabă în București vs online</h2>
    <p>
      Fizic, la Raduga Creative Center (Strada Icoanei 80, sector 2), ai energia grupei și feedbackul
      direct. Online, pe Zoom, ai flexibilitate și acces de oriunde. Ambele formate folosesc același
      profesor nativ și aceeași metodă. Vezi și <Link to="/cursuri-araba-bucuresti">cursurile de arabă în București</Link> sau <Link to="/araba-online">cursurile de arabă online</Link> pentru detalii despre fiecare format.
    </p>

    <h2>Ce înseamnă „arabă levantină” și de ce contează</h2>
    <p>
      Araba libaneză face parte din grupul dialectelor <strong>levantine</strong> (numit și{" "}
      <em>shami</em>), vorbite în Liban, Siria, Iordania și Palestina. Cine învață libaneză înțelege
      și vorbește practic cu vorbitori din toate aceste țări — un avantaj real față de alte dialecte.
      Harta și diferențele sunt explicate în{" "}
      <Link to="/dialecte-arabe">ghidul dialectelor arabe</Link> și în{" "}
      <Link to="/blog/limbile-vorbite-in-liban">limbile vorbite în Liban</Link>.
    </p>

    <h2>Cursuri de arabă pe vârste</h2>
    <ul>
      <li><strong><Link to="/curs-araba-copii">Copii 6–10 ani</Link></strong> — prin joc, cântece și povești, fizic în București.</li>
      <li><strong><Link to="/cursuri-araba-adolescenti">Adolescenți 11–17 ani</Link></strong> — conversație, muzică și limbaj de social media, fizic sau online.</li>
      <li><strong><Link to="/cursuri/grup">Adulți A1–C2</Link></strong> — grupe mici pe niveluri, fizic sau online.</li>
    </ul>

    <h2>Nu știi ce format ți se potrivește?</h2>
    <p>
      Am scris un ghid de comparație onest — dialect vs arabă standard, grup vs privat vs aplicații,
      cu prețuri și criterii clare:{" "}
      <Link to="/cel-mai-bun-curs-de-araba">cum alegi cel mai bun curs de arabă</Link>. Sau începi
      direct cu <Link to="/trial">lecția de probă gratuită de 30 de minute</Link>.
    </p>
  </LandingLayout>

);

export default CursuriAraba;
