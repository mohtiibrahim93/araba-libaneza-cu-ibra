import { Link } from "@/components/LocalizedLink";
import BlogArticleLayout from "@/components/blog/BlogArticleLayout";
import { Tldr, InlineCta } from "@/components/blog/ArticleKit";
import { useI18n } from "@/lib/i18n";

// Place-name explanations are the popular ones, labelled as such: the owner
// asked to keep the Bsharri legend, and it is told as a legend.
const FAQ = [
  {
    q: { ro: "Mai vorbește cineva siriaca în Liban?", en: "Does anyone still speak Syriac in Lebanon?" },
    a: { ro: "Ca limbă de zi cu zi, nu. Siriaca rămâne limba liturgică a Bisericii Maronite și a altor biserici siriace, așa că se aude în biserică, în rugăciuni și în cântări.", en: "Not as an everyday language. Syriac remains the liturgical language of the Maronite Church and other Syriac churches, so it is heard in church, in prayers and in hymns." },
  },
  {
    q: { ro: "Aramaica și siriaca sunt aceeași limbă?", en: "Are Aramaic and Syriac the same language?" },
    a: { ro: "Siriaca este o formă a aramaicii: dialectul orașului Edessa (Urfa, în Turcia de azi), care a devenit limba scrisă a creștinismului răsăritean.", en: "Syriac is a form of Aramaic: the dialect of the city of Edessa (Urfa, in today's Turkey), which became the written language of Eastern Christianity." },
  },
  {
    q: { ro: "Trebuie să știu siriacă ca să învăț libaneza?", en: "Do I need Syriac to learn Lebanese Arabic?" },
    a: { ro: "Nu. Cuvintele de origine siriacă sunt pur și simplu cuvinte libaneze — le înveți odată cu restul. E doar o poveste frumoasă despre de unde vin.", en: "No. Words of Syriac origin are simply Lebanese words — you learn them with everything else. It is just a good story about where they come from." },
  },
];

const SiriacaInArabaLibaneza = () => {
  const { lang } = useI18n();
  const en = lang === "en";
  return (
    <BlogArticleLayout
      slug="siriaca-in-araba-libaneza"
      title={{
        ro: "Siriaca din araba libaneză: cuvinte, luni, nume de sate",
        en: "The Syriac inside Lebanese Arabic: words, months, villages",
      }}
      description={{
        ro: "Înainte de arabă, în Liban se vorbea aramaica. Ce a rămas din ea în libaneza de azi: cuvinte, construcții, numele lunilor și ale satelor.",
        en: "Before Arabic, Lebanon spoke Aramaic. What it left in today's Lebanese: everyday words, a grammar habit, the names of the months and of villages.",
      }}
      published="2026-10-04"
      readingMinutes={6}
      faq={FAQ}
      crumb={{ ro: "Siriaca din libaneză", en: "Syriac in Lebanese" }}
      lead={{
        ro: "Araba nu a venit într-un loc gol. Timp de secole, oamenii din Liban au vorbit aramaica, iar creștinii au scris-o în forma ei siriacă. Când araba a devenit limba de zi cu zi, limba veche nu a dispărut pur și simplu: s-a topit în ea. O auzi și azi, în cuvinte mărunte, în numele lunilor și pe indicatoarele satelor.",
        en: "Arabic did not arrive in an empty place. For centuries the people of Lebanon spoke Aramaic, and Christians wrote it in its Syriac form. When Arabic became the everyday language, the old one did not simply vanish: it melted into it. You still hear it today, in small words, in the names of the months and on village signs.",
      }}
    >
      <Tldr
        points={[
          { ro: "Aramaica a fost timp de secole limba comună a Orientului Apropiat; siriaca e forma ei scrisă creștină.", en: "Aramaic was for centuries the common language of the Near East; Syriac is its Christian written form." },
          { ro: "Libaneza păstrează cuvinte siriace: ēmta („când”), jawwa / barra („înăuntru / afară”).", en: "Lebanese keeps Syriac words: ēmta (\"when\"), jawwa / barra (\"inside / outside\")." },
          { ro: "Lunile anului în Levant au nume aramaice: Kānūn, Shbāṭ, Ādār, Nīsān…", en: "The months in the Levant have Aramaic names: Kānūn, Shbāṭ, Ādār, Nīsān…" },
          { ro: "Multe sate din Muntele Liban au nume siriace: B- vine de la bēt, „casă”.", en: "Many Mount Lebanon villages have Syriac names: B- comes from bēt, \"house\"." },
        ]}
      />

      <h2>{en ? "1. Aramaic, Syriac and Lebanon" : "1. Aramaica, siriaca și Libanul"}</h2>
      <p>
        {en
          ? "From the first millennium BC, Aramaic spread across the Near East until it became the common language of trade and administration, including in the Persian Empire. It was the language Jesus spoke. Syriac is the Aramaic of Edessa, which from the first centuries AD became the written and church language of Eastern Christians — among them the Maronites of Mount Lebanon."
          : "Din mileniul I î.Hr., aramaica s-a răspândit în tot Orientul Apropiat până a devenit limba comună a comerțului și a administrației, inclusiv în Imperiul Persan. A fost limba vorbită de Isus. Siriaca este aramaica orașului Edessa, care din primele secole după Hristos a devenit limba scrisă și bisericească a creștinilor din Răsărit — printre ei, maroniții din Muntele Liban."}
      </p>
      <p>
        {en
          ? "After the 7th century, Arabic slowly became the everyday language. Slowly is the key word: in the mountain villages, the change took centuries, and the old language left its marks behind."
          : "După secolul al VII-lea, araba a devenit treptat limba de zi cu zi. Cuvântul-cheie e treptat: în satele de munte, schimbarea a durat secole, iar limba veche și-a lăsat urmele."}
      </p>

      <h2>{en ? "2. Words you use without knowing" : "2. Cuvinte pe care le folosești fără să știi"}</h2>
      <ul>
        <li><strong>ēmta</strong> — {en ? "\"when?\" (Standard Arabic says matā)." : "„când?” (araba standard spune matā)."}</li>
        <li><strong>jawwa / barra</strong> — {en ? "\"inside / outside\" (Standard Arabic: dākhil / khārij)." : "„înăuntru / afară” (araba standard: dākhil / khārij)."}</li>
        <li><strong>nāṭūr</strong> — {en ? "\"guard, watchman\", from Aramaic nāṭōrā." : "„paznic”, din aramaicul nāṭōrā."}</li>
        <li><strong>Mār</strong> — {en ? "\"saint\" (literally \"lord\"), in Mār Elias, Mār Charbel, Mār Mikhāyel." : "„sfântul” (literal „domnul”), în Mār Elias, Mār Charbel, Mār Mikhāyel."}</li>
      </ul>
      <p>
        {en
          ? "Grammar kept a habit too. Lebanese often announces the object with a pronoun and then names it with la-: shefto la-Elie — literally \"I saw him, Elie\". Linguists often point to the same construction in Aramaic."
          : "Și gramatica a păstrat un obicei. Libaneza anunță adesea complementul printr-un pronume și apoi îl numește cu la-: shefto la-Elie — literal „l-am văzut, pe Elie”. Lingviștii indică adesea aceeași construcție în aramaică."}
      </p>

      <h2>{en ? "3. The months of the year" : "3. Lunile anului"}</h2>
      <p>
        {en
          ? "In Lebanon, Syria, Jordan and Palestine, the months are not called Yanāyir or Fibrāyir as in Egypt or North Africa. They keep their old Aramaic names:"
          : "În Liban, Siria, Iordania și Palestina, lunile nu se numesc Yanāyir sau Fibrāyir ca în Egipt sau în Africa de Nord. Își păstrează numele vechi, aramaice:"}
      </p>
      <ul>
        <li>{en ? "January — Kānūn t-tēne · February — Shbāṭ · March — Ādār" : "ianuarie — Kānūn t-tēne · februarie — Shbāṭ · martie — Ādār"}</li>
        <li>{en ? "April — Nīsān · May — Ayyār · June — Ḥzayrān" : "aprilie — Nīsān · mai — Ayyār · iunie — Ḥzayrān"}</li>
        <li>{en ? "July — Tammūz · August — Āb · September — Aylūl" : "iulie — Tammūz · august — Āb · septembrie — Aylūl"}</li>
        <li>{en ? "October — Tishrīn l-awwal · November — Tishrīn t-tēne · December — Kānūn l-awwal" : "octombrie — Tishrīn l-awwal · noiembrie — Tishrīn t-tēne · decembrie — Kānūn l-awwal"}</li>
      </ul>

      <h2>{en ? "4. Village names" : "4. Numele satelor"}</h2>
      <p>
        {en
          ? "Many place names in Mount Lebanon are Syriac and describe the land or what stood there. Two prefixes are everywhere: B-, from bēt (\"house\"), as in Bikfaya, Baskinta, Bkerke; and Kfar (\"village\"), as in Kfardebian or Kfarshima."
          : "Multe nume de locuri din Muntele Liban sunt siriace și descriu terenul sau ce se afla acolo. Două prefixe sunt peste tot: B-, de la bēt („casă”), ca în Bikfaya, Baskinta, Bkerke; și Kfar („sat”), ca în Kfardebian sau Kfarshima."}
      </p>
      <p>
        {en
          ? "Some names come with stories. A popular explanation reads Bsharri as \"house of God\" — a legend, but a fitting one for the town that guards Arz er-Rab (أرز الرب), the Cedars of God. Brummana is often explained as \"house of Rammān\", the ancient storm god."
          : "Unele nume vin cu povești. O explicație populară citește Bsharri ca „casa lui Dumnezeu” — o legendă, dar una potrivită pentru orașul care păzește Arz er-Rab (أرز الرب), Cedrii Domnului. Brummana e explicată des drept „casa lui Rammān”, vechiul zeu al furtunii."}
      </p>

      <InlineCta
        title={{ ro: "Vrei să auzi libaneza vie?", en: "Want to hear Lebanese the way it lives?" }}
        text={{
          ro: "Predăm dialectul libanez, cu profesor nativ. Grupe A1–C2 și lecții 1:1.",
          en: "We teach the Lebanese dialect with a native teacher. Groups A1–C2 and 1-on-1 lessons.",
        }}
        href="/cursuri-limba-araba"
        label={{ ro: "Vezi cursurile", en: "See the courses" }}
      />

      <p>
        {en ? "Related:" : "Alte articole utile:"}{" "}
        <Link to="/blog/fenicienii-si-identitatea-libaneza">{en ? "The Phoenicians and Lebanese identity" : "Fenicienii și identitatea libaneză"}</Link>{" · "}
        <Link to="/blog/garshuni-si-tiparnita-de-la-qozhaya">{en ? "Garshuni and the Qozhaya press" : "Garshuni și tiparnița de la Qozhaya"}</Link>{" · "}
        <Link to="/blog/limbile-vorbite-in-liban">{en ? "Languages of Lebanon" : "Limbile din Liban"}</Link>.
      </p>
    </BlogArticleLayout>
  );
};

export default SiriacaInArabaLibaneza;
