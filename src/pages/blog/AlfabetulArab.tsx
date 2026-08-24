import { Link } from "react-router-dom";
import BlogArticleLayout from "@/components/blog/BlogArticleLayout";
import { useI18n } from "@/lib/i18n";

// [letter, name, sound-ro, sound-en]
const LETTERS: [string, string, string, string][] = [
  ["ا", "alif", "a / â lung", "a / long â"],
  ["ب", "ba", "b", "b"],
  ["ت", "ta", "t", "t"],
  ["ث", "tha", "th (ca în engl. „think”)", "th (as in 'think')"],
  ["ج", "jim", "j (în libaneză: „j” ca în „jurnal”)", "j (in Lebanese: 'j' as in 'journal')"],
  ["ح", "ḥa", "h aspru din gât", "harsh h from the throat"],
  ["خ", "kha", "h gutural (ca „ch” germană)", "guttural h (like German 'ch')"],
  ["د", "dal", "d", "d"],
  ["ذ", "dhal", "dh (ca engl. „this”)", "dh (as in 'this')"],
  ["ر", "ra", "r", "r"],
  ["ز", "zay", "z", "z"],
  ["س", "sin", "s", "s"],
  ["ش", "shin", "ș", "sh"],
  ["ص", "ṣad", "s emfatic", "emphatic s"],
  ["ض", "ḍad", "d emfatic", "emphatic d"],
  ["ط", "ṭa", "t emfatic", "emphatic t"],
  ["ظ", "ẓa", "z emfatic", "emphatic z"],
  ["ع", "ʿayn", "sunet gutural (redat „3” în arabizi)", "guttural sound (written '3' in Arabizi)"],
  ["غ", "ghayn", "gh (ca un „r” franțuzesc)", "gh (like a French 'r')"],
  ["ف", "fa", "f", "f"],
  ["ق", "qaf", "q gutural (în libaneză adesea oprire glotală)", "guttural q (in Lebanese often a glottal stop)"],
  ["ك", "kaf", "k", "k"],
  ["ل", "lam", "l", "l"],
  ["م", "mim", "m", "m"],
  ["ن", "nun", "n", "n"],
  ["ه", "ha", "h simplu", "plain h"],
  ["و", "waw", "w / u lung", "w / long u"],
  ["ي", "ya", "y / i lung", "y / long i"],
];

const AlfabetulArab = () => {
  const { lang } = useI18n();
  const en = lang === "en";
  return (
    <BlogArticleLayout
      slug="alfabetul-arab-pentru-incepatori"
      title={{ ro: "Alfabetul arab: toate cele 28 de litere, cu pronunție în română", en: "The Arabic alphabet: all 28 letters, with pronunciation" }}
      description={{
        ro: "Tabel cu toate cele 28 de litere arabe, pronunția în română, formele la început/mijloc/sfârșit și scrierea dreapta-la-stânga. Plus cum vorbești libaneză fără alfabet.",
        en: "Complete Arabic alphabet table: all 28 letters, pronunciation, right-to-left writing. Plus how to start speaking Lebanese without learning the alphabet first.",
      }}
      published="2026-07-16"
      readingMinutes={7}
      crumb={{ ro: "Alfabetul arab", en: "The Arabic alphabet" }}
      lead={{
        ro: "Cele 28 de litere, pronunția lor și un adevăr liniștitor: nu ai nevoie de alfabet ca să începi să vorbești.",
        en: "The 28 letters, their pronunciation and a reassuring truth: you don't need the alphabet to start speaking.",
      }}
    >
      <p>
        {en
          ? "The Arabic alphabet looks intimidating at first, but it has a simple logic. It has "
          : "Alfabetul arab pare intimidant la prima vedere, dar are o logică simplă. Are "}
        <strong>{en ? "28 letters" : "28 de litere"}</strong>{en ? ", is written " : ", se scrie de la "}
        <strong>{en ? "right to left" : "dreapta la stânga"}</strong>
        {en
          ? ", and letters change shape slightly depending on their position in the word (start, middle, end). There are no upper- and lower-case letters."
          : ", iar literele își schimbă ușor forma în funcție de poziția din cuvânt (început, mijloc, sfârșit). Nu există litere mari și mici."}
      </p>

      <h2>{en ? "The complete letter table" : "Tabelul complet al literelor"}</h2>
      <p>
        {en
          ? "Below is each letter, its name and the approximate sound. 'Emphatic' means a sound pronounced more heavily, from the back of the mouth."
          : "Mai jos ai fiecare literă, numele ei și sunetul aproximativ în română. „Emfatic” înseamnă un sunet pronunțat mai apăsat, din spatele gurii."}
      </p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-border text-left text-muted-foreground">
              <th className="py-2 pr-3 font-semibold">{en ? "Letter" : "Literă"}</th>
              <th className="py-2 px-3 font-semibold">{en ? "Name" : "Nume"}</th>
              <th className="py-2 pl-3 font-semibold">{en ? "Sound" : "Sunet"}</th>
            </tr>
          </thead>
          <tbody>
            {LETTERS.map(([letter, name, soundRo, soundEn]) => (
              <tr key={name} className="border-b border-border/60 align-top">
                <td className="py-2 pr-3 font-arabic text-2xl text-brand-green" dir="rtl" lang="ar">{letter}</td>
                <td className="py-2 px-3 font-semibold text-foreground whitespace-nowrap">{name}</td>
                <td className="py-2 pl-3 text-foreground/80">{en ? soundEn : soundRo}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2>{en ? "Short vowels are usually not written" : "Vocalele scurte nu se scriu de obicei"}</h2>
      <p>
        {en
          ? "An important quirk: in Arabic, short vowels (a, i, u) are marked with small signs above or below the letters, but in ordinary text they "
          : "O particularitate importantă: în arabă, vocalele scurte (a, i, u) se marchează cu semne mici deasupra sau sub litere, dar în textul obișnuit "}
        <strong>{en ? "are not written" : "nu se scriu"}</strong>
        {en
          ? ". The reader infers them from context. That's why the table above is mostly consonants and long vowels."
          : ". Cititorul le deduce din context. De aceea alfabetul de mai sus are mai ales consoane și vocale lungi."}
      </p>

      <h2>{en ? "Do you need the alphabet to speak?" : "Trebuie să știi alfabetul ca să vorbești?"}</h2>
      <p>
        {en ? "No — and that's the good news. At the Lebanese Arabic Center we use the " : "Nu — și aici e vestea bună. La Centrul de Arabă Libaneză folosim metoda "}
        <strong>Oral First</strong>{en ? " method: you start by speaking, with the help of " : ": începi vorbind, cu ajutorul "}
        <Link to="/blog/ce-este-arabizi">{en ? "Arabizi" : "arabizi"}</Link>{" "}
        {en
          ? "(Arabic written in Latin letters), and move gradually to the Arabic alphabet without getting stuck. You can hold whole conversations in Lebanese before writing your first letter."
          : "(araba scrisă cu litere latine), și treci treptat la alfabetul arab, fără să te blochezi. Poți purta conversații întregi în libaneză înainte să scrii prima literă."}
      </p>

      <h2>{en ? "When you actually need the alphabet" : "Când chiar ai nevoie de alfabet"}</h2>
      <p>
        {en
          ? "You need the Arabic script if you want to read texts, study Modern Standard Arabic, work with documents, or read religious texts. Realistically: 2-4 weeks of 20-30 minutes a day to recognise the letters, a few months to read fluently. You do "
          : "Ai nevoie de alfabet dacă vrei să citești texte, să studiezi araba standard, să lucrezi cu documente sau să citești texte religioase. Realist: 2-4 săptămâni de 20-30 de minute pe zi pentru recunoașterea literelor și câteva luni pentru citire fluentă. "}
        <strong>{en ? "not" : "Nu"}</strong>{en ? " need it to hold a conversation — see " : " ai nevoie de el ca să porți o conversație — vezi "}
        <Link to="/fara-alfabet-arab">{en ? "learning Arabic without the alphabet" : "cum înveți araba fără alfabet"}</Link>
        {en ? ", and the full " : " și "}
        <Link to="/arabizi">{en ? "Arabizi decoding guide" : "ghidul complet Arabizi"}</Link>
        {en ? ". We teach the alphabet on request, alongside speaking." : ". Predăm alfabetul la cerere, în paralel cu vorbirea."}
      </p>

      <h2>{en ? "How to learn the alphabet more easily" : "Cum înveți alfabetul mai ușor"}</h2>
      <ul>
        <li>{en ? "Group the letters by shape — many look alike and differ only by dots (ب ت ث)." : "Grupează literele după formă — multe se aseamănă și diferă doar prin puncte (ب ت ث)."}</li>
        <li>{en ? "Learn to recognise them first, then to write them." : "Învață mai întâi să le recunoști, apoi să le scrii."}</li>
        <li>{en ? "Associate each letter with a word you already know from speaking." : "Asociază fiecare literă cu un cuvânt pe care deja îl știi din vorbire."}</li>
        <li>{en ? "Practise with a teacher who corrects the guttural sounds (ع، ح، ق)." : "Exersează cu un profesor care îți corectează pronunția sunetelor guturale (ع، ح، ق)."}</li>
      </ul>
      <p>
        {en ? "Want to see where you start? Take the " : "Vrei să vezi de unde pornești? Fă "}
        <Link to="/quiz">{en ? "free level test" : "testul de nivel gratuit"}</Link>
        {en ? " or read the " : " sau citește "}
        <Link to="/blog/cum-inveti-araba-libaneza">{en ? "complete beginner's guide" : "ghidul complet pentru începători"}</Link>.
      </p>
    </BlogArticleLayout>
  );
};

export default AlfabetulArab;
