import { Link } from "react-router-dom";
import BlogArticleLayout from "@/components/blog/BlogArticleLayout";

const CumAlegiProfesor = () => (
  <BlogArticleLayout
    slug="cum-alegi-profesor-de-araba"
    title="Cum alegi un profesor de arabă: întrebările esențiale"
    description="Ghid pentru a alege profesorul de arabă potrivit: ce să întrebi despre experiență, metodă, preț, format și rezultate — plus semnalele de alarmă de evitat."
    published="2026-07-17"
    readingMinutes={6}
    crumb="Cum alegi un profesor"
    lead="Ce să întrebi înainte să te înscrii — despre experiență, metodă, preț și rezultate — ca să nu pierzi timp și bani."
  >
    <p>
      Un profesor bun face diferența dintre a abandona după trei lecții și a ajunge să vorbești cu
      încredere. Înainte să alegi, merită să pui câteva întrebări clare. Iată-le, grupate, cu
      răspunsurile noastre la fiecare.
    </p>

    <h2>Despre experiență și limbă</h2>
    <ul>
      <li><strong>Ești vorbitor nativ?</strong> Da — Ibra este vorbitor nativ de arabă libaneză.</li>
      <li><strong>Ce fel de arabă predai?</strong> Dialect libanez (levantin), limba vie vorbită
        în Liban — nu doar <Link to="/blog/araba-libaneza-vs-araba-standard">araba clasică din manuale</Link>.</li>
      <li><strong>Ce experiență ai?</strong> Ani de predare, atât în grup cât și 1:1, cu cursanți
        de toate nivelurile — vezi <Link to="/#testimonials">recenziile reale</Link>.</li>
    </ul>

    <h2>Despre metodă</h2>
    <ul>
      <li><strong>Cum sunt structurate lecțiile?</strong> Prin metoda <strong>Oral First</strong> —
        vorbești din primele lecții, cu <Link to="/blog/ce-este-arabizi">arabizi</Link> la început
        și trecere treptată la alfabetul arab.</li>
      <li><strong>Cum adaptezi lecțiile la nivelul meu?</strong> Grupe mici și feedback constant;
        pentru obiective specifice, <Link to="/cursuri/private">lecții private 1:1</Link>.</li>
      <li><strong>Incluzi și cultura?</strong> Da — limba vine împreună cu{" "}
        <Link to="/blog/cultura-libaneza-obiceiuri-mancare-traditii">obiceiurile și contextul cultural</Link>.</li>
    </ul>

    <h2>Despre logistică</h2>
    <ul>
      <li><strong>Cât durează o lecție și cât de des?</strong> 90 de minute, de 2 ori pe săptămână
        la grup; flexibil la privat.</li>
      <li><strong>Online sau fizic?</strong> Ambele — fizic în București sau online prin Zoom.</li>
      <li><strong>Cât costă și care e politica de anulare?</strong> Transparent, fără costuri
        ascunse — vezi <Link to="/blog/cat-costa-cursurile-de-araba-libaneza">detaliile de preț</Link>.
        Abonamentele se pot anula oricând, cu rambursare proporțională în primele 5 zile.</li>
      <li><strong>Oferi o lecție de probă?</strong> Da — prima lecție e{" "}
        <Link to="/trial">gratuită, fără obligații</Link>.</li>
    </ul>

    <h2>Despre potrivire și rezultate</h2>
    <ul>
      <li><strong>Ai recenzii de la cursanți?</strong> Da, recenzii reale verificate pe Preply.</li>
      <li><strong>Mă poți ajuta cu obiectivul meu?</strong> Conversație, călătorie, familie, copii —
        <Link to="/cursuri"> cursurile</Link> acoperă toate scopurile.</li>
      <li><strong>Cât de repede văd progres?</strong> Vorbești de la prima lecție; vezi{" "}
        <Link to="/blog/cat-dureaza-sa-inveti-araba-libaneza">cât durează pe fiecare nivel</Link>.</li>
    </ul>

    <h2>Semnale de alarmă de evitat</h2>
    <ul>
      <li>Un vorbitor nativ care nu are experiență de predare — a ști o limbă nu înseamnă a o preda.</li>
      <li>Lecții generice, la fel pentru toată lumea, fără adaptare.</li>
      <li>Costuri ascunse sau program rigid, fără lecție de probă.</li>
    </ul>

    <p>
      Cel mai simplu test? O <Link to="/trial">lecție de probă gratuită</Link> — vezi direct metoda,
      pui întrebările de mai sus și decizi în cunoștință de cauză.
    </p>
  </BlogArticleLayout>
);

export default CumAlegiProfesor;
