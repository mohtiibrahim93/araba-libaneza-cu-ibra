import { Link } from "react-router-dom";
import BlogArticleLayout from "@/components/blog/BlogArticleLayout";

const CatCostaCursurile = () => (
  <BlogArticleLayout
    slug="cat-costa-cursurile-de-araba-libaneza"
    title="Cât costă cursurile de arabă libaneză în 2026?"
    description="Prețurile cursurilor de arabă libaneză: grup lunar sau plată integrală cu reducere, lecții private, curs pentru copii și proba gratuită. Explicat clar, fără costuri ascunse."
    published="2026-07-16"
    readingMinutes={5}
    crumb="Cât costă cursurile"
    lead="Grup sau privat, online sau fizic — iată cum se calculează prețul, ce reduceri există și de ce prima lecție e gratuită."
  >
    <p>
      Una dintre primele întrebări firești când vrei să înveți o limbă nouă este „cât costă?".
      La Centrul de Arabă Libaneză prețurile sunt transparente și depind de un singur lucru:
      formatul pe care îl alegi. Mai jos ai toate opțiunile.
    </p>

    <h2>Cursuri de grup (adulți, A1–C2)</h2>
    <p>
      Cursurile de grup sunt cea mai accesibilă și mai motivantă opțiune — înveți alături de
      colegi de nivelul tău, cu 2 lecții pe săptămână. Poți plăti în două feluri:
    </p>
    <ul>
      <li>
        <strong>Abonament lunar</strong> — plătești lună de lună, iar abonamentul se oprește
        automat când se termină cursul. Prețul pe lună pornește de la 500 lei pentru nivelul A1
        online și crește pe niveluri; formatul fizic în București are un tarif ușor mai mare.
      </li>
      <li>
        <strong>Plată integrală în avans</strong> — dacă plătești tot cursul o dată, primești
        <strong> 10% reducere</strong> la total.
      </li>
    </ul>
    <p>
      Fiecare nivel durează un număr fix de luni (A1 patru luni, A2 șapte luni etc.), așa că știi
      din start cât plătești în total. Vezi cifrele exacte pe nivel în pagina de{" "}
      <Link to="/cursuri/grup">cursuri de grup</Link>.
    </p>

    <h2>Lecții private (1:1)</h2>
    <p>
      Dacă vrei ritm personalizat sau un program flexibil, lecțiile private costă{" "}
      <strong>150 lei / lecție</strong> (90 de minute), în orice format — online sau fizic.
      La pachetele de <strong>20 de lecții sau mai multe primești 15% reducere</strong>. Detalii
      pe pagina de <Link to="/cursuri/private">lecții private</Link>.
    </p>

    <h2>Curs pentru copii (6–10 ani)</h2>
    <p>
      Cursul pentru copii este un program interactiv, bazat pe joc, fizic în București (online de
      la 10 ani). Prețul este 500 lei/lună pe durata programului. Vezi{" "}
      <Link to="/cursuri/copii">cursul pentru copii</Link>.
    </p>

    <h2>Proba este gratuită</h2>
    <p>
      Nu trebuie să plătești nimic ca să începi. Prima lecție este o{" "}
      <Link to="/trial">probă gratuită</Link> de 30 de minute, fără nicio obligație — o rezervi
      online, îți alegi un interval și vorbești cu profesorul. Abia după ce vezi cum e, decizi
      dacă te înscrii.
    </p>

    <h2>Există costuri ascunse?</h2>
    <p>
      Nu. Materialele audio și suportul sunt incluse. Plățile se fac securizat prin Stripe, iar
      pentru abonamentele lunare poți anula oricând — dacă anulezi în primele 5 zile ale unei luni
      deja plătite, primești banii înapoi proporțional. Restul lunilor pur și simplu nu se mai
      facturează.
    </p>
  </BlogArticleLayout>
);

export default CatCostaCursurile;
