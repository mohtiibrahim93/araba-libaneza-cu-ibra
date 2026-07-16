import { Link } from "react-router-dom";
import BlogArticleLayout from "@/components/blog/BlogArticleLayout";

const CulturaLibaneza = () => (
  <BlogArticleLayout
    slug="cultura-libaneza-obiceiuri-mancare-traditii"
    title="Cultura libaneză: obiceiuri, mâncare și tradiții"
    description="Un ghid cald despre cultura Libanului: ospitalitatea, mâncarea (mezze, tabbouleh, kibbeh), muzica, limba și tradițiile — contextul viu în spatele arabei libaneze."
    published="2026-07-16"
    readingMinutes={6}
    crumb="Cultura libaneză"
    lead="Ospitalitate, mezze, muzică și un amestec unic de influențe — contextul viu care dă sens limbii pe care o înveți."
  >
    <p>
      Nu înveți doar o limbă — intri într-o cultură. Libanul este o țară mică de la Marea
      Mediterană, dar cu o densitate culturală uriașă: un loc de întâlnire între Orient și
      Occident, cu o istorie de mii de ani. Iată ce dă farmec culturii libaneze.
    </p>

    <h2>Ospitalitatea, mai presus de toate</h2>
    <p>
      În Liban, oaspetele este sacru. Vei fi întâmpinat mereu cu „<strong>Ahla w sahla</strong>"
      (bine ai venit) și, aproape sigur, cu o cafea sau ceva de mâncare. A refuza e aproape
      imposibil — și nici nu vei vrea. Această căldură se simte direct în limbă, plină de expresii
      de afecțiune (îți amintești de <Link to="/blog/primele-20-de-expresii-libaneze">„ta2burni"</Link>?).
    </p>

    <h2>Mâncarea: mezze și mult mai mult</h2>
    <p>
      Bucătăria libaneză este renumită în toată lumea. Masa începe cu <strong>mezze</strong> — o
      mulțime de farfurii mici pe care le împarți cu toată lumea:
    </p>
    <ul>
      <li><strong>Hummus</strong> și <strong>moutabbal</strong> — pastă de năut, respectiv de vinete.</li>
      <li><strong>Tabbouleh</strong> — salată proaspătă de pătrunjel, roșii și bulgur.</li>
      <li><strong>Kibbeh</strong> — chiftele de bulgur cu carne, simbol național.</li>
      <li><strong>Falafel</strong>, <strong>fattoush</strong>, <strong>manakish</strong> — și lista continuă.</li>
    </ul>
    <p>
      Mâncarea nu e doar hrană — e un mod de a fi împreună. Multe expresii pe care le înveți la curs
      apar exact la masă, în jurul mezze-urilor.
    </p>

    <h2>Muzică, limbă și un amestec unic</h2>
    <p>
      Muzica libaneză merge de la marea <strong>Fairuz</strong> (vocea dimineților libaneze) până la
      pop-ul modern de la Beirut. Un lucru te va surprinde: libanezii amestecă adesea în aceeași
      propoziție arabă, franceză și engleză — „<em>Hi, kifak? Ça va?</em>". E o reflexie a istoriei
      cosmopolite a țării.
    </p>

    <h2>De ce contează cultura când înveți limba</h2>
    <p>
      Araba libaneză este un <Link to="/blog/araba-libaneza-vs-araba-standard">dialect viu</Link>,
      nu araba clasică din manuale. Cuvintele au poveste, umor și context. Când înveți cu un
      profesor nativ, primești și cultura odată cu limba — de asta cursurile noastre includ
      expresii reale, obiceiuri și felul autentic în care se vorbește pe străzile Beirutului.
    </p>
    <p>
      Curios? Începe cu o <Link to="/trial">lecție de probă gratuită</Link> sau vezi{" "}
      <Link to="/cursuri">toate cursurile</Link>.
    </p>
  </BlogArticleLayout>
);

export default CulturaLibaneza;
