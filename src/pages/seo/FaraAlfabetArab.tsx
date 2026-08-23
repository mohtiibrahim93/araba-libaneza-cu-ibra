import { Link } from "react-router-dom";
import LandingLayout from "@/components/seo/LandingLayout";
import ArabiziCheatSheetForm from "@/components/ArabiziCheatSheetForm";

const FAQ = [
  {
    q: "Pot învăța araba fără alfabet?",
    a: "Da. Poți învăța să vorbești araba libaneză folosind arabizi (scrierea cu litere latine și cifre). Alfabetul arab e necesar pentru citit și scris, nu pentru conversație — la noi vine mai târziu, la cerere.",
  },
  {
    q: "E greu de învățat araba?",
    a: "Partea grea a arabei este scrierea și gramatica arabei standard. Dialectul libanez vorbit are gramatică mult mai simplă — fără cazuri, fără forme duale complicate — și se învață prin conversație. Dificultatea reală e pronunția câtorva sunete guturale, care se rezolvă prin exercițiu cu un vorbitor nativ.",
  },
  {
    q: "Cât durează să înveți alfabetul arab?",
    a: "Cu 20-30 de minute pe zi, recunoașterea literelor durează în jur de 2-4 săptămâni, iar citirea fluentă câteva luni. De aceea nu îl punem în față: ar amâna primele conversații cu luni de zile.",
  },
  {
    q: "Ce înveți în primele patru săptămâni fără nicio literă arabă?",
    a: "Te prezinți, saluți și răspunzi la salut, pui întrebări simple, comanzi la restaurant, te descurci la cumpărături și la taxi, folosești numerele și exprimi preferințe de bază — totul oral, notat în arabizi.",
  },
  {
    q: "Când introduceți alfabetul arab?",
    a: "Când ceri tu, de obicei după nivelul A1, sau mai devreme dacă ai un motiv clar (citit, studiu academic, texte religioase). Se predă în paralel cu conversația, fără să o oprească.",
  },
];

const FaraAlfabetArab = () => (
  <LandingLayout
    slug="fara-alfabet-arab"
    title="Nu ai nevoie de alfabetul arab ca să începi să vorbești"
    metaTitle="Pot Învăța Araba Fără Alfabet? Da — Iată Cum | Metoda Oral First"
    description="Poți învăța araba libaneză fără alfabetul arab: vorbești din prima lecție folosind arabizi. Ce e greu de fapt la arabă, ce înveți în 4 săptămâni și când merită alfabetul."
    crumb="Fără alfabetul arab"
    lead="Alfabetul este motivul numărul unu pentru care oamenii se apucă de arabă și renunță în prima lună. Nu e obligatoriu ca să vorbești — iată cum arată drumul fără el."
    enHref={null}
    faq={FAQ}
  >
    <p>
      Aproape orice curs de arabă începe la fel: 28 de litere, patru forme pentru fiecare, scriere de
      la dreapta la stânga. Trei săptămâni mai târziu, cursantul știe să deseneze literele — dar nu
      poate spune „ce faci?” unui vorbitor nativ. Asta e ordinea inversă față de felul în care înveți
      o limbă vorbită.
    </p>

    <h2>Ce e greu de fapt la arabă — și ce nu</h2>
    <ul>
      <li><strong>Greu:</strong> alfabetul și citirea fără vocale scurte. Se poate amâna.</li>
      <li><strong>Greu:</strong> gramatica arabei standard (fusha), cu cazuri și forme literare. Nu o folosim — nimeni nu vorbește așa acasă.</li>
      <li><strong>Mediu:</strong> câteva sunete guturale (ع, ح, خ, غ). Se rezolvă doar cu urechea și cu un profesor nativ care te corectează pe loc.</li>
      <li><strong>Ușor:</strong> gramatica dialectului libanez — fără cazuri, verbe regulate în majoritate, topică apropiată de română.</li>
      <li><strong>Ușor:</strong> vocabularul de zi cu zi, mai ales cu împrumuturi din franceză și engleză, foarte prezente în libaneză.</li>
    </ul>

    <h2>Cum scriem, dacă nu cu litere arabe</h2>
    <p>
      Cu <Link to="/arabizi">arabizi</Link> — araba scrisă cu litere latine și câteva cifre (2, 3, 5,
      7…), exact cum își scriu libanezii mesajele pe WhatsApp. Notezi tot ce înveți într-o formă pe
      care o poți citi din prima zi, iar cifrele îți amintesc exact ce sunet trebuie produs:
      „mar7aba” nu poate fi citit greșit ca „marhaba” românesc.
    </p>

    <ArabiziCheatSheetForm source="/fara-alfabet-arab" />

    <p>
      Restul materialelor gratuite — 100 de expresii esențiale și planul de 30 de zile — sunt pe{" "}
      <Link to="/resurse">pagina de resurse</Link>, iar drumul complet fără costuri e în{" "}
      <Link to="/invata-araba-gratis">învață araba libaneză gratis</Link>.
    </p>

    <h2>Metoda Oral First, pe scurt</h2>
    <ul>
      <li><strong>Asculți întâi.</strong> Fiecare structură nouă intră prin ureche, în context, nu ca regulă scrisă pe tablă.</li>
      <li><strong>Vorbești în prima lecție.</strong> Nu aștepți „să știi destul” — repeți, greșești, ești corectat imediat.</li>
      <li><strong>Notezi în arabizi.</strong> Notițele tale sunt lizibile de la început.</li>
      <li><strong>Gramatica vine după uz.</strong> Explicația apare abia după ce ai folosit forma de câteva ori.</li>
      <li><strong>Alfabetul, la cerere.</strong> Se adaugă când ai deja o bază orală și nu te mai poate descuraja.</li>
    </ul>

    <h2>Primele patru săptămâni, fără nicio literă arabă</h2>
    <ul>
      <li><strong>Săptămâna 1:</strong> saluturi, prezentare, „kifak / kifik”, răspunsuri de bază.</li>
      <li><strong>Săptămâna 2:</strong> întrebări simple, numere, prețuri, ore — vezi și <Link to="/blog/numere-in-araba-libaneza">numerele în libaneză</Link>.</li>
      <li><strong>Săptămâna 3:</strong> la restaurant și la cumpărături — comanzi, întrebi, negociezi.</li>
      <li><strong>Săptămâna 4:</strong> vorbești despre tine, familie, muncă, ce îți place și ce nu.</li>
    </ul>
    <p>
      Ritmul complet, nivel cu nivel, e detaliat în{" "}
      <Link to="/blog/cat-dureaza-sa-inveti-araba-libaneza">cât durează să înveți araba libaneză</Link>.
    </p>

    <h2>Când chiar ai nevoie de alfabet</h2>
    <p>
      Nu îl ascundem — doar îl punem la locul potrivit. Ai nevoie de alfabetul arab dacă vrei să
      citești texte, să studiezi araba standard, să lucrezi cu documente sau să citești texte
      religioase. Atunci îl predăm sistematic, în paralel cu conversația:{" "}
      <Link to="/blog/alfabetul-arab-pentru-incepatori">ghidul alfabetului arab pentru începători</Link>.
    </p>

    <h2>Unde continui</h2>
    <p>
      Cursuri de <Link to="/cursuri/grup">grup A1–C2</Link>, <Link to="/cursuri/private">lecții
      private 1:1</Link>, fizic în București sau <Link to="/araba-online">online pe Zoom</Link>. Dacă
      nu știi de unde pornești, <Link to="/quiz">testul de nivel</Link> îți spune în două minute.
    </p>
  </LandingLayout>
);

export default FaraAlfabetArab;
