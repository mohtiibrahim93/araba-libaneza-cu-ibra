import { Link } from "react-router-dom";
import BlogArticleLayout from "@/components/blog/BlogArticleLayout";
import { useI18n } from "@/lib/i18n";

const CulturaLibaneza = () => {
  const { lang } = useI18n();
  const en = lang === "en";
  return (
    <BlogArticleLayout
      slug="cultura-libaneza-obiceiuri-mancare-traditii"
      title={{ ro: "Cultura libaneză: obiceiuri, mâncare și tradiții", en: "Lebanese culture: customs, food and traditions" }}
      description={{
        ro: "Un ghid cald despre cultura Libanului: ospitalitatea, mâncarea (mezze, tabbouleh, kibbeh), muzica și tradițiile — contextul viu din spatele limbii.",
        en: "A warm guide to Lebanese culture: hospitality, food (mezze, tabbouleh, kibbeh), music, language and traditions — the living context behind Lebanese Arabic.",
      }}
      published="2026-07-16"
      readingMinutes={6}
      crumb={{ ro: "Cultura libaneză", en: "Lebanese culture" }}
      lead={{
        ro: "Ospitalitate, mezze, muzică și un amestec unic de influențe — contextul viu care dă sens limbii pe care o înveți.",
        en: "Hospitality, mezze, music and a unique mix of influences — the living context that gives meaning to the language you're learning.",
      }}
    >
      <p>
        {en
          ? "You don't just learn a language — you step into a culture. Lebanon is a small Mediterranean country, but with enormous cultural density: a meeting point between East and West, with thousands of years of history. Here's what gives Lebanese culture its charm."
          : "Nu înveți doar o limbă — intri într-o cultură. Libanul este o țară mică de la Marea Mediterană, dar cu o densitate culturală uriașă: un loc de întâlnire între Orient și Occident, cu o istorie de mii de ani. Iată ce dă farmec culturii libaneze."}
      </p>

      <h2>{en ? "Hospitality, above all" : "Ospitalitatea, mai presus de toate"}</h2>
      <p>
        {en ? "In Lebanon, the guest is sacred. You'll always be welcomed with " : "În Liban, oaspetele este sacru. Vei fi întâmpinat mereu cu "}
        „<strong>Ahla w sahla</strong>” {en ? "(welcome) and, almost certainly, a coffee or something to eat. Refusing is nearly impossible — and you won't want to. That warmth is felt directly in the language, full of terms of affection (remember " : "(bine ai venit) și, aproape sigur, cu o cafea sau ceva de mâncare. A refuza e aproape imposibil — și nici nu vei vrea. Această căldură se simte direct în limbă, plină de expresii de afecțiune (îți amintești de "}
        <Link to="/blog/primele-20-de-expresii-libaneze">„ta2burni”</Link>{en ? "?)." : "?)."}
      </p>

      <h2>{en ? "The food: mezze and much more" : "Mâncarea: mezze și mult mai mult"}</h2>
      <p>
        {en ? "Lebanese cuisine is famous worldwide. A meal begins with " : "Bucătăria libaneză este renumită în toată lumea. Masa începe cu "}
        <strong>mezze</strong>{en ? " — many small plates you share with everyone:" : " — o mulțime de farfurii mici pe care le împarți cu toată lumea:"}
      </p>
      <ul>
        <li><strong>Hummus</strong> {en ? "and" : "și"} <strong>moutabbal</strong> — {en ? "chickpea and aubergine dips." : "pastă de năut, respectiv de vinete."}</li>
        <li><strong>Tabbouleh</strong> — {en ? "a fresh salad of parsley, tomatoes and bulgur." : "salată proaspătă de pătrunjel, roșii și bulgur."}</li>
        <li><strong>Kibbeh</strong> — {en ? "bulgur-and-meat croquettes, a national symbol." : "chiftele de bulgur cu carne, simbol național."}</li>
        <li><strong>Falafel</strong>, <strong>fattoush</strong>, <strong>manakish</strong> — {en ? "and the list goes on." : "și lista continuă."}</li>
      </ul>
      <p>
        {en
          ? "Food isn't just nourishment — it's a way of being together. Many expressions you learn in class come up exactly at the table, around the mezze."
          : "Mâncarea nu e doar hrană — e un mod de a fi împreună. Multe expresii pe care le înveți la curs apar exact la masă, în jurul mezze-urilor."}
      </p>

      <h2>{en ? "Music, language and a unique blend" : "Muzică, limbă și un amestec unic"}</h2>
      <p>
        {en ? "Lebanese music ranges from the great " : "Muzica libaneză merge de la marea "}
        <strong>Fairuz</strong>{en ? " (the voice of Lebanese mornings) to modern Beirut pop. One thing will surprise you: Lebanese people often mix Arabic, French and English in the same sentence — " : " (vocea dimineților libaneze) până la pop-ul modern de la Beirut. Un lucru te va surprinde: libanezii amestecă adesea în aceeași propoziție arabă, franceză și engleză — "}
        „<em>Hi, kifak? Ça va?</em>”. {en ? "It reflects the country's cosmopolitan history." : "E o reflexie a istoriei cosmopolite a țării."}
      </p>

      <h2>{en ? "Why culture matters when learning the language" : "De ce contează cultura când înveți limba"}</h2>
      <p>
        {en ? "Lebanese Arabic is a " : "Araba libaneză este un "}
        <Link to="/blog/araba-libaneza-vs-araba-standard">{en ? "living dialect" : "dialect viu"}</Link>
        {en
          ? ", not the classical Arabic of textbooks. Words carry story, humour and context. When you learn with a native teacher, you get the culture along with the language — that's why our courses include real expressions, customs and the authentic way people speak on the streets of Beirut."
          : ", nu araba clasică din manuale. Cuvintele au poveste, umor și context. Când înveți cu un profesor nativ, primești și cultura odată cu limba — de asta cursurile noastre includ expresii reale, obiceiuri și felul autentic în care se vorbește pe străzile Beirutului."}
      </p>
      <p>
        {en ? "Curious? Start with a " : "Curios? Începe cu o "}
        <Link to="/trial">{en ? "free trial lesson" : "lecție de probă gratuită"}</Link>
        {en ? " or see " : " sau vezi "}
        <Link to="/cursuri">{en ? "all the courses" : "toate cursurile"}</Link>.
      </p>
    </BlogArticleLayout>
  );
};

export default CulturaLibaneza;
