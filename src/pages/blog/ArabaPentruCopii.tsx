import { Link } from "react-router-dom";
import BlogArticleLayout from "@/components/blog/BlogArticleLayout";
import { useI18n } from "@/lib/i18n";

const ArabaPentruCopii = () => {
  const { lang } = useI18n();
  const en = lang === "en";
  return (
    <BlogArticleLayout
      slug="araba-pentru-copii-ghidul-parintilor"
      title={{ ro: "Cursuri de arabă pentru copii: ghidul părinților", en: "Arabic courses for kids: a parents' guide" }}
      description={{
        ro: "De la ce vârstă pot învăța copiii arabă libaneză, cum arată o lecție, ce metode funcționează și cum îi ajuți acasă. Ghid practic pentru părinți.",
        en: "From what age kids can learn Lebanese Arabic, what a lesson looks like, which methods work and how to help at home. A practical guide for parents.",
      }}
      published="2026-07-16"
      readingMinutes={5}
      crumb={{ ro: "Arabă pentru copii", en: "Arabic for kids" }}
      lead={{
        ro: "De la ce vârstă, cum arată o lecție și cum îți susții copilul — tot ce vor să știe părinții înainte de primul curs.",
        en: "From what age, what a lesson looks like and how to support your child — everything parents want to know before the first course.",
      }}
    >
      <p>
        {en
          ? "Children learn languages differently from adults: through play, repetition and context, not rules. That's why Lebanese Arabic courses for kids look nothing like a classic lesson — they're interactive, with games, songs and stories."
          : "Copiii învață limbile altfel decât adulții: prin joc, repetiție și context, nu prin reguli. De aceea cursurile de arabă libaneză pentru copii nu seamănă deloc cu o lecție clasică — sunt interactive, cu jocuri, cântece și povești."}
      </p>

      <h2>{en ? "From what age?" : "De la ce vârstă?"}</h2>
      <p>
        {en ? "At the Lebanese Arabic Center, the " : "La Centrul de Arabă Libaneză, "}
        <Link to="/cursuri/copii">{en ? "kids course" : "cursul pentru copii"}</Link>
        {en ? " is designed for ages " : " este gândit pentru "}
        <strong>{en ? "6–10" : "6–10 ani"}</strong>{en ? ", in person in Bucharest. From age " : ", fizic în București. De la "}
        <strong>{en ? "10" : "10 ani"}</strong>{en ? ", children can also join online. Under 6, we recommend exposure at home (songs, cartoons) before a structured course." : ", copiii pot participa și online. Sub 6 ani, recomandăm expunerea acasă (cântece, desene) înainte de un curs structurat."}
      </p>

      <h2>{en ? "What a lesson looks like" : "Cum arată o lecție"}</h2>
      <ul>
        <li>{en ? "Small groups, so every child is actively involved." : "Grupe mici, ca fiecare copil să fie implicat activ."}</li>
        <li>{en ? "The " : "Metoda "}<strong>Oral First</strong>{en ? " method — kids speak from the start, with no pressure to write." : " — copiii vorbesc de la început, fără presiunea scrisului."}</li>
        <li><Link to="/blog/ce-este-arabizi">{en ? "Arabizi" : "Arabizi"}</Link>{en ? " at first, then Arabic letters gradually, like a game." : " la început, apoi litere arabe treptat, ca un joc."}</li>
        <li>{en ? "Songs, role-play and words tied to their world: family, animals, food, colours." : "Cântece, jocuri de rol și cuvinte legate de viața lor: familie, animale, mâncare, culori."}</li>
        <li>{en ? "Age-appropriate Lebanese culture — " : "Cultură libaneză adaptată vârstei — "}<Link to="/blog/cultura-libaneza-obiceiuri-mancare-traditii">{en ? "customs and food" : "obiceiuri și mâncare"}</Link>.</li>
      </ul>

      <h2>{en ? "Why Lebanese Arabic and not Classical?" : "De ce arabă libaneză și nu clasică?"}</h2>
      <p>
        {en ? "For kids with Lebanese roots or a speaking family, the " : "Pentru copiii cu rădăcini libaneze sau cu familie vorbitoare, dialectul "}
        <Link to="/blog/araba-libaneza-vs-araba-standard">{en ? "Lebanese dialect" : "libanez"}</Link>
        {en
          ? " is the language they hear at home and on the phone with their grandparents — the living one, not the Arabic of textbooks. That's how they learn a language they actually "
          : " este limba pe care o aud acasă și la telefon cu bunicii — cea vie, nu araba din manuale. Așa învață o limbă pe care o și "}
        <em>{en ? "use" : "folosesc"}</em>.
      </p>

      <h2>{en ? "How to help your child at home" : "Cum îți ajuți copilul acasă"}</h2>
      <ul>
        <li>{en ? "Listen to Lebanese children's music together." : "Ascultați împreună muzică libanească pentru copii."}</li>
        <li>{en ? "Use newly learned words in the daily routine (good morning, thank you)." : "Folosiți cuvintele nou învățate în rutina zilnică (bună dimineața, mulțumesc)."}</li>
        <li>{en ? "No pressure — praise and play work far better than correction." : "Fără presiune — lauda și jocul funcționează mult mai bine decât corectarea."}</li>
        <li>{en ? "A short call with speaking relatives works wonders for motivation." : "Un apel scurt cu rude vorbitoare face minuni pentru motivație."}</li>
      </ul>

      <h2>{en ? "How to start" : "Cum începeți"}</h2>
      <p>
        {en ? "The simplest way is a short chat so we can gauge your child's level and interest. Message us on " : "Cel mai simplu e o discuție scurtă ca să vedem nivelul și interesul copilului. Scrie-ne pe "}
        <a href="https://wa.me/40763124514" target="_blank" rel="noopener noreferrer">WhatsApp</a>
        {en ? " or see the details and price on the " : " sau vezi detaliile și prețul pe pagina de "}
        <Link to="/cursuri/copii">{en ? "kids course" : "curs pentru copii"}</Link> {en ? "page." : ""}
      </p>
    </BlogArticleLayout>
  );
};

export default ArabaPentruCopii;
