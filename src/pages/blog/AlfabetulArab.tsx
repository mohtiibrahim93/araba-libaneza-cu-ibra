import { Link } from "react-router-dom";
import BlogArticleLayout from "@/components/blog/BlogArticleLayout";

const LETTERS: [string, string, string][] = [
  ["ا", "alif", "a / â lung"],
  ["ب", "ba", "b"],
  ["ت", "ta", "t"],
  ["ث", "tha", "th (ca în engl. „think”)"],
  ["ج", "jim", "j (în libaneză: „j” ca în „jurnal”)"],
  ["ح", "ḥa", "h aspru din gât"],
  ["خ", "kha", "h gutural (ca „ch” germană)"],
  ["د", "dal", "d"],
  ["ذ", "dhal", "dh (ca engl. „this”)"],
  ["ر", "ra", "r"],
  ["ز", "zay", "z"],
  ["س", "sin", "s"],
  ["ش", "shin", "ș"],
  ["ص", "ṣad", "s emfatic"],
  ["ض", "ḍad", "d emfatic"],
  ["ط", "ṭa", "t emfatic"],
  ["ظ", "ẓa", "z emfatic"],
  ["ع", "ʿayn", "sunet gutural (redat „3” în arabizi)"],
  ["غ", "ghayn", "gh (ca un „r” franțuzesc)"],
  ["ف", "fa", "f"],
  ["ق", "qaf", "q gutural (în libaneză adesea oprire glotală)"],
  ["ك", "kaf", "k"],
  ["ل", "lam", "l"],
  ["م", "mim", "m"],
  ["ن", "nun", "n"],
  ["ه", "ha", "h simplu"],
  ["و", "waw", "w / u lung"],
  ["ي", "ya", "y / i lung"],
];

const AlfabetulArab = () => (
  <BlogArticleLayout
    slug="alfabetul-arab-pentru-incepatori"
    title="Alfabetul arab pentru începători: cele 28 de litere"
    description="Ghid pentru alfabetul arab: cele 28 de litere, cum se pronunță, sensul de scriere dreapta-la-stânga și de ce nu trebuie să-l știi ca să începi să vorbești libaneză."
    published="2026-07-16"
    readingMinutes={7}
    crumb="Alfabetul arab"
    lead="Cele 28 de litere, pronunția lor și un adevăr liniștitor: nu ai nevoie de alfabet ca să începi să vorbești."
  >
    <p>
      Alfabetul arab pare intimidant la prima vedere, dar are o logică simplă. Are{" "}
      <strong>28 de litere</strong>, se scrie de la <strong>dreapta la stânga</strong>, iar
      literele își schimbă ușor forma în funcție de poziția din cuvânt (început, mijloc, sfârșit).
      Nu există litere mari și mici.
    </p>

    <h2>Tabelul complet al literelor</h2>
    <p>
      Mai jos ai fiecare literă, numele ei și sunetul aproximativ în română. „Emfatic" înseamnă un
      sunet pronunțat mai apăsat, din spatele gurii.
    </p>
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b border-border text-left text-muted-foreground">
            <th className="py-2 pr-3 font-semibold">Literă</th>
            <th className="py-2 px-3 font-semibold">Nume</th>
            <th className="py-2 pl-3 font-semibold">Sunet</th>
          </tr>
        </thead>
        <tbody>
          {LETTERS.map(([letter, name, sound]) => (
            <tr key={name} className="border-b border-border/60 align-top">
              <td className="py-2 pr-3 font-arabic text-2xl text-brand-green" dir="rtl" lang="ar">{letter}</td>
              <td className="py-2 px-3 font-semibold text-foreground whitespace-nowrap">{name}</td>
              <td className="py-2 pl-3 text-foreground/80">{sound}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    <h2>Vocalele scurte nu se scriu de obicei</h2>
    <p>
      O particularitate importantă: în arabă, vocalele scurte (a, i, u) se marchează cu semne mici
      deasupra sau sub litere, dar în textul obișnuit <strong>nu se scriu</strong>. Cititorul le
      deduce din context. De aceea alfabetul de mai sus are mai ales consoane și vocale lungi.
    </p>

    <h2>Trebuie să știi alfabetul ca să vorbești?</h2>
    <p>
      Nu — și aici e vestea bună. La Centrul de Arabă Libaneză folosim metoda{" "}
      <strong>Oral First</strong>: începi vorbind, cu ajutorul <Link to="/blog/ce-este-arabizi">arabizi</Link>{" "}
      (araba scrisă cu litere latine), și treci treptat la alfabetul arab, fără să te blochezi.
      Poți purta conversații întregi în libaneză înainte să scrii prima literă.
    </p>

    <h2>Cum înveți alfabetul mai ușor</h2>
    <ul>
      <li>Grupează literele după formă — multe se aseamănă și diferă doar prin puncte (ب ت ث).</li>
      <li>Învață mai întâi să le recunoști, apoi să le scrii.</li>
      <li>Asociază fiecare literă cu un cuvânt pe care deja îl știi din vorbire.</li>
      <li>Exersează cu un profesor care îți corectează pronunția sunetelor guturale (ع، ح، ق).</li>
    </ul>
    <p>
      Vrei să vezi de unde pornești? Fă <Link to="/quiz">testul de nivel gratuit</Link> sau citește{" "}
      <Link to="/blog/cum-inveti-araba-libaneza">ghidul complet pentru începători</Link>.
    </p>
  </BlogArticleLayout>
);

export default AlfabetulArab;
