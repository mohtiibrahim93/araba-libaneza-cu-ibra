import { Link } from "react-router-dom";
import BlogArticleLayout from "@/components/blog/BlogArticleLayout";

const NUMBERS: [string, string, string][] = [
  ["2", "ء / ق", "oprire glotală (ca pauza din „co-operare”)"],
  ["3", "ع", "sunet gutural din gât, specific arab"],
  ["5", "خ", "h aspru, ca „ch” în germană „Bach”"],
  ["7", "ح", "h puternic din gât, fără echivalent în română"],
  ["8", "غ", "gh, ca un „r” franțuzesc răgușit"],
  ["9", "ق", "q gutural (uneori)"],
];

const CeEsteArabizi = () => (
  <BlogArticleLayout
    slug="ce-este-arabizi"
    title="Ce este arabizi și cum îl folosești (cu tabel)"
    description="Arabizi este araba scrisă cu litere latine și cifre. Afli ce înseamnă cifrele 2, 3, 5, 7, cum citești și de ce e cea mai rapidă cale să începi să vorbești libaneză."
    published="2026-07-16"
    readingMinutes={5}
    crumb="Ce este arabizi"
    lead="Araba scrisă cu litere latine și cifre — cum funcționează, ce înseamnă „3” și „7”, și de ce te ajută să vorbești din prima zi."
  >
    <p>
      <strong>Arabizi</strong> (numit și „arabish" sau „franco-arab") este modul în care milioane
      de arabi scriu dialectul lor pe telefon și pe rețelele sociale:{" "}
      <strong>cu litere latine și câteva cifre</strong>. În loc să înveți întâi{" "}
      <Link to="/blog/alfabetul-arab-pentru-incepatori">alfabetul arab</Link>, poți citi și scrie
      libaneză imediat, folosind litere pe care deja le știi.
    </p>

    <h2>De ce cifre?</h2>
    <p>
      Araba are câteva sunete care nu există în română și nu au o literă latină potrivită. Soluția
      ingenioasă a vorbitorilor: folosesc cifre a căror formă seamănă cu litera arabă
      corespunzătoare. Iată cheia:
    </p>
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b border-border text-left text-muted-foreground">
            <th className="py-2 pr-3 font-semibold">Cifră</th>
            <th className="py-2 px-3 font-semibold">Literă arabă</th>
            <th className="py-2 pl-3 font-semibold">Sunet</th>
          </tr>
        </thead>
        <tbody>
          {NUMBERS.map(([n, letter, sound]) => (
            <tr key={n} className="border-b border-border/60 align-top">
              <td className="py-2 pr-3 font-bold text-lg text-primary">{n}</td>
              <td className="py-2 px-3 font-arabic text-xl text-brand-green" dir="rtl" lang="ar">{letter}</td>
              <td className="py-2 pl-3 text-foreground/80">{sound}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    <h2>Exemple reale</h2>
    <ul>
      <li><strong>Mar7aba</strong> (مرحبا) — „salut" — cifra 7 e sunetul ح din gât.</li>
      <li><strong>3afwan</strong> (عفواً) — „cu plăcere" — cifra 3 e sunetul ع.</li>
      <li><strong>Kifak?</strong> (كيفك؟) — „ce faci?" — fără cifre, se citește direct.</li>
      <li><strong>Ta2burni</strong> (تقبرني) — expresie de afecțiune — cifra 2 e o oprire scurtă.</li>
    </ul>
    <p>
      Vezi mai multe în articolul cu{" "}
      <Link to="/blog/primele-20-de-expresii-libaneze">primele 20 de expresii libaneze</Link>.
    </p>

    <h2>E „barează" să înveți cu arabizi?</h2>
    <p>
      Deloc. Arabizi este modul real în care libanezii comunică zi de zi în scris. Pentru un
      începător, e cea mai rapidă cale spre conversație — nu te blochezi la scris cât timp înveți
      să vorbești. La curs folosim arabizi la început și trecem treptat la alfabetul arab, în
      ritmul tău, prin metoda <strong>Oral First</strong>.
    </p>
  </BlogArticleLayout>
);

export default CeEsteArabizi;
