import { Link } from "@/components/LocalizedLink";
import BlogArticleLayout from "@/components/blog/BlogArticleLayout";
import { Tldr, InlineCta } from "@/components/blog/ArticleKit";
import { useI18n } from "@/lib/i18n";

// "First printing press" claims vary by what is counted. Kept to what holds:
// the first press in Lebanon, often called the first in the Arab world; the
// earlier presses in the Ottoman Empire printed Hebrew, and Ottoman printing in
// Arabic letters only began with İbrahim Müteferrika (approved 1727).
const FAQ = [
  {
    q: { ro: "Ce înseamnă Garshuni?", en: "What does Garshuni mean?" },
    a: { ro: "Așa se numește limba arabă scrisă cu litere siriace. Originea cuvântului nu e sigură; pentru maroniți, era pur și simplu felul firesc de a scrie araba cu literele pe care le știau din biserică.", en: "It is the name for Arabic written in Syriac letters. The origin of the word is uncertain; for the Maronites it was simply the natural way to write Arabic with the letters they knew from church." },
  },
  {
    q: { ro: "Unde se află Qozhaya?", en: "Where is Qozhaya?" },
    a: { ro: "Mănăstirea Sfântul Antonie de la Qozhaya se află în valea Qadisha, în nordul Libanului, nu departe de Bsharri și de Cedrii Domnului.", en: "The Monastery of Saint Anthony of Qozhaya is in the Qadisha valley in northern Lebanon, not far from Bsharri and the Cedars of God." },
  },
  {
    q: { ro: "A fost prima tiparniță din Orientul Mijlociu?", en: "Was it the first printing press in the Middle East?" },
    a: { ro: "Depinde ce numeri. A fost prima din Liban și e adesea numită prima din lumea arabă. În Imperiul Otoman existau tiparnițe mai vechi, dar tipăreau în ebraică; prima tiparniță otomană în litere arabe a primit aprobare abia în 1727.", en: "It depends on what you count. It was the first in Lebanon and is often called the first in the Arab world. The Ottoman Empire had older presses, but they printed Hebrew; the first Ottoman press in Arabic letters was only approved in 1727." },
  },
];

const GarshuniTiparnitaQozhaya = () => {
  const { lang } = useI18n();
  const en = lang === "en";
  return (
    <BlogArticleLayout
      slug="garshuni-si-tiparnita-de-la-qozhaya"
      title={{
        ro: "Garshuni și tiparnița de la Qozhaya",
        en: "Garshuni and the Qozhaya printing press",
      }}
      description={{
        ro: "Araba scrisă cu litere siriace și tiparnița din valea Qadisha care, în 1610, a tipărit Psaltirea — prima carte tipărită în Liban.",
        en: "Arabic written in Syriac letters, and the press in the Qadisha valley that printed the Psalter in 1610 — the first book printed in Lebanon.",
      }}
      published="2026-10-04"
      readingMinutes={5}
      faq={FAQ}
      crumb={{ ro: "Garshuni și Qozhaya", en: "Garshuni and Qozhaya" }}
      lead={{
        ro: "Timp de secole, creștinii din Liban au vorbit arabă, dar au scris-o cu literele limbii vechi, siriaca. Această scriere se numește Garshuni — iar într-o mănăstire din valea Qadisha ea a ajuns, în 1610, să fie tipărită.",
        en: "For centuries the Christians of Lebanon spoke Arabic but wrote it with the letters of the old language, Syriac. This writing is called Garshuni — and in a monastery in the Qadisha valley, in 1610, it was printed.",
      }}
    >
      <Tldr
        points={[
          { ro: "Garshuni = limba arabă scrisă cu alfabetul siriac.", en: "Garshuni = the Arabic language written in the Syriac alphabet." },
          { ro: "Arată cum s-a făcut trecerea: limba nouă, scrisă cu literele vechi.", en: "It shows the transition itself: the new language, written with the old letters." },
          { ro: "În 1610, mănăstirea Qozhaya a tipărit o Psaltire în siriacă și Garshuni.", en: "In 1610, the Qozhaya monastery printed a Psalter in Syriac and Garshuni." },
          { ro: "A fost prima tiparniță din Liban, adesea numită prima din lumea arabă.", en: "It was the first press in Lebanon, often called the first in the Arab world." },
        ]}
      />

      <h2>{en ? "1. Arabic in Syriac letters" : "1. Araba cu litere siriace"}</h2>
      <p>
        {en
          ? "When Arabic became the everyday language of Lebanon, the Maronites and other Syriac Christians kept learning to read in Syriac, the language of their liturgy. So they wrote the new language with the alphabet they already knew. Letters, notes, prayers and even whole books were written this way: the words are Arabic, the script is Syriac."
          : "Când araba a devenit limba de zi cu zi a Libanului, maroniții și ceilalți creștini siriaci au continuat să învețe să citească în siriacă, limba liturghiei lor. Așa că au scris limba nouă cu alfabetul pe care îl știau deja. Scrisori, însemnări, rugăciuni și chiar cărți întregi au fost scrise astfel: cuvintele sunt arabe, scrisul e siriac."}
      </p>
      <p>
        {en
          ? "Garshuni is a snapshot of how the Arabization happened: not a break, but a slow overlap, in which the old language survived in the hand that wrote the new one."
          : "Garshuni e o fotografie a felului în care s-a petrecut arabizarea: nu o ruptură, ci o suprapunere lentă, în care limba veche a supraviețuit în mâna care o scria pe cea nouă."}
      </p>

      <h2>{en ? "2. Rome and the Maronite College" : "2. Roma și Colegiul Maronit"}</h2>
      <p>
        {en
          ? "In 1584 the Maronite College opened in Rome, training priests from Mount Lebanon. Europe had been printing books for over a century, and Syriac type was cast there. Maronite scholars brought this knowledge home."
          : "În 1584 s-a deschis la Roma Colegiul Maronit, care forma preoți din Muntele Liban. Europa tipărea cărți de peste un secol, iar acolo s-au turnat și litere siriace. Învățații maroniți au adus aceste cunoștințe acasă."}
      </p>

      <h2>{en ? "3. The 1610 Psalter" : "3. Psaltirea din 1610"}</h2>
      <p>
        {en
          ? "In 1610, at the Monastery of Saint Anthony of Qozhaya in the Qadisha valley, a press printed the Book of Psalms in two columns: Syriac on one side, Arabic in Garshuni on the other. It was the first book printed in Lebanon."
          : "În 1610, la Mănăstirea Sfântul Antonie de la Qozhaya, în valea Qadisha, o tiparniță a tipărit Cartea Psalmilor pe două coloane: siriacă pe o parte, arabă în Garshuni pe cealaltă. A fost prima carte tipărită în Liban."}
      </p>
      <p>
        {en
          ? "Was it the first press in the Middle East? It is often called the first in the Arab world. The Ottoman Empire had earlier presses — in Constantinople at the end of the 15th century and in Safed in 1577 — but they printed Hebrew. The first Ottoman press printing in Arabic letters was only approved in 1727, more than a century after Qozhaya."
          : "A fost prima tiparniță din Orientul Mijlociu? E adesea numită prima din lumea arabă. În Imperiul Otoman existau tiparnițe mai vechi — la Constantinopol, la sfârșitul secolului al XV-lea, și la Safed, în 1577 — dar tipăreau în ebraică. Prima tiparniță otomană în litere arabe a primit aprobare abia în 1727, la peste un secol după Qozhaya."}
      </p>

      <h2>{en ? "4. Why it still matters" : "4. De ce contează și azi"}</h2>
      <p>
        {en
          ? "Garshuni and the Qozhaya press tell the same story as the Syriac words in Lebanese Arabic: Lebanon took Arabic as its language without letting go of where it came from. You hear both sides of that story every time a Lebanese person says ēmta instead of matā."
          : "Garshuni și tiparnița de la Qozhaya spun aceeași poveste ca și cuvintele siriace din araba libaneză: Libanul a luat araba drept limbă fără să renunțe la ce era înainte. Auzi ambele părți ale poveștii de fiecare dată când un libanez spune ēmta în loc de matā."}
      </p>

      <InlineCta
        title={{ ro: "Vrei să citești și să vorbești libaneza?", en: "Want to read and speak Lebanese?" }}
        text={{
          ro: "Predăm dialectul libanez, cu profesor nativ. Grupe A1–C2 și lecții 1:1.",
          en: "We teach the Lebanese dialect with a native teacher. Groups A1–C2 and 1-on-1 lessons.",
        }}
        href="/cursuri-limba-araba"
        label={{ ro: "Vezi cursurile", en: "See the courses" }}
      />

      <p>
        {en ? "Related:" : "Alte articole utile:"}{" "}
        <Link to="/blog/siriaca-in-araba-libaneza">{en ? "The Syriac inside Lebanese Arabic" : "Siriaca din araba libaneză"}</Link>{" · "}
        <Link to="/blog/sfantul-efrem-sirul-si-biserica-maronita">{en ? "Saint Ephrem and the Maronite Church" : "Sfântul Efrem Sirul și Biserica Maronită"}</Link>{" · "}
        <Link to="/blog/alfabetul-arab-pentru-incepatori">{en ? "The Arabic alphabet" : "Alfabetul arab"}</Link>.
      </p>
    </BlogArticleLayout>
  );
};

export default GarshuniTiparnitaQozhaya;
