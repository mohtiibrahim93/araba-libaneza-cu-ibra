import { Link } from "react-router-dom";
import BlogArticleLayout from "@/components/blog/BlogArticleLayout";
import { Tldr, InlineCta } from "@/components/blog/ArticleKit";
import { useI18n } from "@/lib/i18n";

// Questions specific to this article; anything answered elsewhere on the
// site stays there, so the same answer never lives on two URLs.
const FAQ = [
  {
    q: { ro: "Ce vârstă are grupa de copii și ce urmează după?", en: "What age is the kids group, and what comes after it?" },
    a: { ro: "Cursul pentru copii este gândit pentru 6–10 ani, fizic în București. De la 11 ani există grupa de adolescenți, cu o abordare diferită: conversație, muzică și limbaj de social media.", en: "The kids course is built for ages 6–10, in person in Bucharest. From 11 there is the teen group, with a different approach: conversation, music and social-media language." },
  },
  {
    q: { ro: "Trebuie să știu și eu arabă ca să-mi ajut copilul?", en: "Do I need to know Arabic myself to support my child?" },
    a: { ro: "Nu. Lecțiile sunt construite să funcționeze independent de ce știu părinții. Ajută însă enorm expunerea acasă — muzică, desene sau câteva cuvinte repetate în joacă.", en: "No. Lessons are built to work regardless of what the parents know. What helps enormously is exposure at home — music, cartoons, or a few words repeated in play." },
  },
  {
    q: { ro: "Cum arată o lecție pentru copii?", en: "What does a lesson for children look like?" },
    a: { ro: "Prin joc, cântece și povești, cu mult mai puțină scriere decât la adulți. Accentul cade pe ureche și pe pronunție, exact vârsta la care se prind cel mai ușor sunetele noi.", en: "Through play, songs and stories, with far less writing than for adults. The focus is on the ear and on pronunciation — exactly the age when new sounds are picked up most easily." },
  },
];

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
      faq={FAQ}
      crumb={{ ro: "Arabă pentru copii", en: "Arabic for kids" }}
      lead={{
        ro: "De la ce vârstă, cum arată o lecție și cum îți susții copilul — tot ce vor să știe părinții înainte de primul curs.",
        en: "From what age, what a lesson looks like and how to support your child — everything parents want to know before the first course.",
      }}
    >
      <Tldr
        points={[
          { ro: "Cursul pentru copii acoperă 6–10 ani, fizic în București; de la 11 ani urmează grupa de adolescenți.", en: "The kids course covers ages 6–10 in Bucharest; from 11 the teen group follows." },
          { ro: "Se învață prin joc, cântece și povești, nu prin gramatică și caiete.", en: "Learning happens through play, songs and stories, not grammar and workbooks." },
          { ro: "Copiii prind sunetele noi mai ușor decât adulții — e vârsta potrivită pentru pronunție.", en: "Children pick up new sounds more easily than adults — it is the right age for pronunciation." },
          { ro: "Nu trebuie să știi arabă ca părinte; expunerea acasă contează mai mult.", en: "You do not need to know Arabic as a parent; exposure at home matters more." },
        ]}
      />
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

      <InlineCta
        title={{ ro: "Cursul pentru copii, în detaliu", en: "The kids course, in detail" }}
        text={{
          ro: "6–10 ani, prin joc, poveste și activitate — nu prin gramatică. Grupă mică, fizic în București.",
          en: "Ages 6–10, through play, story and activity — not grammar. Small group, in person in Bucharest.",
        }}
        href="/cursuri/copii"
        label={{ ro: "Vezi cursul pentru copii", en: "See the kids course" }}
      />


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
