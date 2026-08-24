import { Link } from "react-router-dom";
import LandingLayout from "@/components/seo/LandingLayout";

const FAQ = [
  {
    q: "Care e diferența între cursuri de limba arabă și cursuri de arabă libaneză?",
    a: "„Limba arabă” e un termen umbrelă. În practică alegi între araba standard (MSA / Fusha) — limba scrisă a știrilor și documentelor — și un dialect vorbit (libanez, egiptean, marocan etc.). Noi predăm dialectul libanez, adică limba pe care o vorbesc oamenii în viața reală, ceea ce te face să conversezi mai repede decât cu MSA.",
  },
  {
    q: "Cursurile de limba arabă sunt acreditate?",
    a: "Cursurile respectă structura CEFR (A1–C2) — același cadru european folosit de școlile de limbi. La final primești certificat intern pe nivelul absolvit. Pentru certificări oficiale internaționale (ex. ALPT, examene universitare) te putem pregăti separat.",
  },
  {
    q: "Cât durează un curs de limba arabă de la zero până la conversație?",
    a: "Cu 2 lecții de 90 min/săptămână, ajungi la conversații de bază (A2) în 6–10 luni. Fluența conversațională (B1/B2) vine în 1,5–2 ani. Diferența față de școlile clasice: începi să vorbești din prima lecție, nu după 6 luni de gramatică.",
  },
  {
    q: "Pot lua cursuri de limba arabă online?",
    a: "Da. Toate nivelurile au variantă online pe Zoom, cu profesor nativ live. Grupurile online rulează la ore accesibile din România și diaspora (weekend sau seara). Vezi și pagina dedicată de cursuri online.",
  },
  {
    q: "În ce limbă se predau lecțiile?",
    a: "Tu alegi. Ibra predă fluent în engleză, franceză, arabă și română — alegi limba în care te simți cel mai confortabil. Lecțiile nu se țin în germană sau alte limbi.",
  },
];

const CursuriLimbaAraba = () => (
  <LandingLayout
    slug="cursuri-limba-araba"
    title="Cursuri de arabă libaneză — de la zero până la fluență, cu profesor nativ"
    metaTitle="Cursuri de Arabă Libaneză — Grup, Private, Online | București 2026"
    description="Cursuri de arabă libaneză cu profesor nativ, structurate pe niveluri CEFR (A1–C2). Grup, private și pentru copii, fizic în București sau online. De la 500 lei/lună, lecție de probă gratuită."
    crumb="Cursuri de arabă libaneză"
    lead="Cursuri de arabă libaneză structurate pe niveluri CEFR, cu profesor nativ. Grup, private sau pentru copii — fizic în București sau online, oriunde ai fi."
    faq={FAQ}
  >
    <p>
      Vrei să înveți <strong>limba arabă</strong> într-un cadru serios, cu profesor nativ și un plan
      clar de progres? La <Link to="/">Centrul de Arabă Libaneză cu Ibra</Link> lucrăm după structura
      europeană CEFR (A1–C2), dar cu o diferență importantă: predăm dialectul{" "}
      <strong>libanez vorbit</strong>, nu doar araba standard din manuale.
    </p>

    <h2>Ce înseamnă „cursuri de limba arabă” la noi</h2>
    <p>
      În lume există o singură arabă scrisă (MSA / Fusha), dar zeci de dialecte vorbite. Cursurile
      noastre te învață <em>ambele registre</em>: dialectul libanez pentru conversație zilnică
      (familia, călătorii, media, muzică) și expunere graduală la MSA pentru texte scrise. Detalii
      în ghidul{" "}
      <Link to="/blog/araba-libaneza-vs-araba-standard">arabă libaneză vs arabă standard</Link>.
    </p>

    <h2>Formate și prețuri</h2>
    <div className="overflow-x-auto not-prose">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b border-border text-left text-muted-foreground">
            <th className="py-2 pr-3 font-semibold">Format</th>
            <th className="py-2 px-3 font-semibold">Structură</th>
            <th className="py-2 pl-3 font-semibold">Preț</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-border/60 align-top">
            <td className="py-2 pr-3 font-semibold"><Link to="/cursuri/grup">Curs de grup</Link></td>
            <td className="py-2 px-3">2 lecții de 90 min/săptămână, grupe mici</td>
            <td className="py-2 pl-3">de la 500 lei/lună</td>
          </tr>
          <tr className="border-b border-border/60 align-top">
            <td className="py-2 pr-3 font-semibold"><Link to="/cursuri/private">Meditații / lecții private</Link></td>
            <td className="py-2 px-3">1:1, 60 min, program flexibil</td>
            <td className="py-2 pl-3">150 lei/lecție</td>
          </tr>
          <tr className="border-b border-border/60 align-top">
            <td className="py-2 pr-3 font-semibold"><Link to="/cursuri/copii">Curs pentru copii</Link></td>
            <td className="py-2 px-3">6–10 ani, prin joc, fizic în București</td>
            <td className="py-2 pl-3">de la 500 lei/lună</td>
          </tr>
        </tbody>
      </table>
    </div>
    <p>
      Lecția de probă gratuită de 30 min e fără obligație. Nu știi ce nivel ai?{" "}
      <Link to="/quiz">Testul de nivel gratuit</Link> îți recomandă cursul potrivit în 2 minute.
    </p>

    <h2>De unde începi</h2>
    <p>
      Nu ești sigur ce nivel ai? <Link to="/quiz">Testul de nivel gratuit</Link> îți recomandă
      cursul potrivit în 2 minute. Sau începi direct cu o{" "}
      <Link to="/trial">lecție de probă gratuită de 30 min</Link>, fără nicio obligație.
    </p>

    <h2>De ce cu profesor nativ</h2>
    <p>
      Pronunția, intonația și expresiile idiomatice nu se învață din manual — se preiau de la un
      vorbitor nativ. Ibra e libanez, cu peste 5 ani de experiență în predare (Preply și studenți
      independenți), iar metoda <strong>Oral First</strong> te pune să vorbești din prima lecție,
      folosind <Link to="/arabizi">arabizi</Link> (scriere cu litere latine) până când alfabetul
      arab vine natural.
    </p>

    <h2>Fără bariera alfabetului</h2>
    <p>
      Nu trebuie să știi alfabetul arab ca să începi: notăm totul în{" "}
      <Link to="/arabizi">arabizi</Link> (litere latine și cifre), iar alfabetul vine la cerere.
      Detalii despre metodă în{" "}
      <Link to="/fara-alfabet-arab">nu ai nevoie de alfabetul arab ca să începi să vorbești</Link>.
    </p>

    <h2>În ce limbă se predau lecțiile</h2>
    <p>
      Ibra predă fluent în <strong>engleză, franceză, arabă și română</strong> — alegi limba în care
      te simți cel mai confortabil. Lecțiile nu se țin în germană sau alte limbi.
    </p>
  </LandingLayout>
);

export default CursuriLimbaAraba;