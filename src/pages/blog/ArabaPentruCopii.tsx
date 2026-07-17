import { Link } from "react-router-dom";
import BlogArticleLayout from "@/components/blog/BlogArticleLayout";

const ArabaPentruCopii = () => (
  <BlogArticleLayout
    slug="araba-pentru-copii-ghidul-parintilor"
    title="Cursuri de arabă pentru copii: ghidul părinților"
    description="De la ce vârstă pot învăța copiii arabă libaneză, cum arată o lecție, ce metode funcționează și cum îi ajuți acasă. Ghid practic pentru părinți."
    published="2026-07-16"
    readingMinutes={5}
    crumb="Arabă pentru copii"
    lead="De la ce vârstă, cum arată o lecție și cum îți susții copilul — tot ce vor să știe părinții înainte de primul curs."
  >
    <p>
      Copiii învață limbile altfel decât adulții: prin joc, repetiție și context, nu prin reguli.
      De aceea cursurile de arabă libaneză pentru copii nu seamănă deloc cu o lecție clasică — sunt
      interactive, cu jocuri, cântece și povești.
    </p>

    <h2>De la ce vârstă?</h2>
    <p>
      La Centrul de Arabă Libaneză, <Link to="/cursuri/copii">cursul pentru copii</Link> este gândit
      pentru <strong>6–10 ani</strong>, fizic în București. De la <strong>10 ani</strong>, copiii
      pot participa și online. Sub 6 ani, recomandăm expunerea acasă (cântece, desene) înainte de un
      curs structurat.
    </p>

    <h2>Cum arată o lecție</h2>
    <ul>
      <li>Grupe mici, ca fiecare copil să fie implicat activ.</li>
      <li>Metoda <strong>Oral First</strong> — copiii vorbesc de la început, fără presiunea scrisului.</li>
      <li><Link to="/blog/ce-este-arabizi">Arabizi</Link> la început, apoi litere arabe treptat, ca un joc.</li>
      <li>Cântece, jocuri de rol și cuvinte legate de viața lor: familie, animale, mâncare, culori.</li>
      <li>Cultură libaneză adaptată vârstei — <Link to="/blog/cultura-libaneza-obiceiuri-mancare-traditii">obiceiuri și mâncare</Link>.</li>
    </ul>

    <h2>De ce arabă libaneză și nu clasică?</h2>
    <p>
      Pentru copiii cu rădăcini libaneze sau cu familie vorbitoare, dialectul{" "}
      <Link to="/blog/araba-libaneza-vs-araba-standard">libanez</Link> este limba pe care o aud
      acasă și la telefon cu bunicii — cea vie, nu araba din manuale. Așa învață o limbă pe care o
      și <em>folosesc</em>.
    </p>

    <h2>Cum îți ajuți copilul acasă</h2>
    <ul>
      <li>Ascultați împreună muzică libanească pentru copii.</li>
      <li>Folosiți cuvintele nou învățate în rutina zilnică (bună dimineața, mulțumesc).</li>
      <li>Fără presiune — lauda și jocul funcționează mult mai bine decât corectarea.</li>
      <li>Un apel scurt cu rude vorbitoare face minuni pentru motivație.</li>
    </ul>

    <h2>Cum începeți</h2>
    <p>
      Cel mai simplu e o discuție scurtă ca să vedem nivelul și interesul copilului. Scrie-ne pe{" "}
      <a href="https://wa.me/40763124514" target="_blank" rel="noopener noreferrer">WhatsApp</a> sau
      vezi detaliile și prețul pe pagina de <Link to="/cursuri/copii">curs pentru copii</Link>.
    </p>
  </BlogArticleLayout>
);

export default ArabaPentruCopii;
