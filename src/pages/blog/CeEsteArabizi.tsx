import { Link } from "react-router-dom";
import BlogArticleLayout from "@/components/blog/BlogArticleLayout";
import { useI18n } from "@/lib/i18n";

// [number, arabic-letter, sound-ro, sound-en]
const NUMBERS: [string, string, string, string][] = [
  ["2", "ء / ق", "oprire glotală (ca pauza din „co-operare”)", "glottal stop (like the pause in 'co-operate')"],
  ["3", "ع", "sunet gutural din gât, specific arab", "guttural sound from the throat, specific to Arabic"],
  ["5", "خ", "h aspru, ca „ch” în germană „Bach”", "harsh h, like 'ch' in German 'Bach'"],
  ["7", "ح", "h puternic din gât, fără echivalent în română", "strong h from the throat, no English equivalent"],
  ["8", "غ", "gh, ca un „r” franțuzesc răgușit", "gh, like a raspy French 'r'"],
  ["9", "ق", "q gutural (uneori)", "guttural q (sometimes)"],
];

const CeEsteArabizi = () => {
  const { lang } = useI18n();
  const en = lang === "en";
  return (
    <BlogArticleLayout
      slug="ce-este-arabizi"
      title={{ ro: "Ce este arabizi: ce înseamnă 2, 3, 5 și 7 în arabă scrisă cu litere latine", en: "What is Arabizi: what 2, 3, 5 and 7 mean in Latin-letter Arabic" }}
      description={{
        ro: "Arabizi = arabă scrisă cu litere latine și cifre. Tabel complet cu ce înseamnă 2, 3, 5, 7, cum se citește și de ce e cea mai rapidă cale spre arabă libaneză vorbită.",
        en: "Arabizi is Arabic written in Latin letters and numbers. Learn what 2, 3, 5, 7 mean, how to read it and why it's the fastest way to start speaking Lebanese.",
      }}
      published="2026-07-16"
      readingMinutes={5}
      crumb={{ ro: "Ce este arabizi", en: "What is Arabizi" }}
      lead={{
        ro: "Araba scrisă cu litere latine și cifre — cum funcționează, ce înseamnă „3” și „7”, și de ce te ajută să vorbești din prima zi.",
        en: "Arabic written in Latin letters and numbers — how it works, what '3' and '7' mean, and why it helps you speak from day one.",
      }}
    >
      <p>
        <strong>Arabizi</strong> {en ? "(also called 'arabish' or 'franco-arab') is how millions of Arabs write their dialect on their phones and on social media: " : "(numit și „arabish” sau „franco-arab”) este modul în care milioane de arabi scriu dialectul lor pe telefon și pe rețelele sociale: "}
        <strong>{en ? "in Latin letters and a few numbers" : "cu litere latine și câteva cifre"}</strong>{en ? ". Instead of learning the " : ". În loc să înveți întâi "}
        <Link to="/blog/alfabetul-arab-pentru-incepatori">{en ? "Arabic alphabet" : "alfabetul arab"}</Link>
        {en ? " first, you can read and write Lebanese right away, using letters you already know." : ", poți citi și scrie libaneză imediat, folosind litere pe care deja le știi."}
      </p>

      <h2>{en ? "Why numbers?" : "De ce cifre?"}</h2>
      <p>
        {en
          ? "Arabic has a few sounds that don't exist in English and have no matching Latin letter. Speakers found a clever fix: they use numbers whose shape resembles the corresponding Arabic letter. Here's the key:"
          : "Araba are câteva sunete care nu există în română și nu au o literă latină potrivită. Soluția ingenioasă a vorbitorilor: folosesc cifre a căror formă seamănă cu litera arabă corespunzătoare. Iată cheia:"}
      </p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-border text-left text-muted-foreground">
              <th className="py-2 pr-3 font-semibold">{en ? "Number" : "Cifră"}</th>
              <th className="py-2 px-3 font-semibold">{en ? "Arabic letter" : "Literă arabă"}</th>
              <th className="py-2 pl-3 font-semibold">{en ? "Sound" : "Sunet"}</th>
            </tr>
          </thead>
          <tbody>
            {NUMBERS.map(([n, letter, soundRo, soundEn]) => (
              <tr key={n} className="border-b border-border/60 align-top">
                <td className="py-2 pr-3 font-bold text-lg text-primary">{n}</td>
                <td className="py-2 px-3 font-arabic text-xl text-brand-green" dir="rtl" lang="ar">{letter}</td>
                <td className="py-2 pl-3 text-foreground/80">{en ? soundEn : soundRo}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2>{en ? "Real examples" : "Exemple reale"}</h2>
      <ul>
        <li><strong>Mar7aba</strong> (مرحبا) — {en ? "'hi' — the number 7 is the ح sound from the throat." : "„salut” — cifra 7 e sunetul ح din gât."}</li>
        <li><strong>3afwan</strong> (عفواً) — {en ? "'you're welcome' — the number 3 is the ع sound." : "„cu plăcere” — cifra 3 e sunetul ع."}</li>
        <li><strong>Kifak?</strong> (كيفك؟) — {en ? "'how are you?' — no numbers, read as written." : "„ce faci?” — fără cifre, se citește direct."}</li>
        <li><strong>Ta2burni</strong> (تقبرني) — {en ? "a term of affection — the number 2 is a short stop." : "expresie de afecțiune — cifra 2 e o oprire scurtă."}</li>
      </ul>
      <p>
        {en ? "See more in the article on the " : "Vezi mai multe în articolul cu "}
        <Link to="/blog/primele-20-de-expresii-libaneze">{en ? "first 20 Lebanese phrases" : "primele 20 de expresii libaneze"}</Link>.
      </p>

      <h2>{en ? "Is it 'cheating' to learn with Arabizi?" : "E „barează” să înveți cu arabizi?"}</h2>
      <p>
        {en
          ? "Not at all. Arabizi is the real way Lebanese people write to each other every day. For a beginner, it's the fastest route to conversation — you don't get stuck on writing while you learn to speak. In class we use Arabizi at first and move gradually to the Arabic alphabet, at your pace, through the "
          : "Deloc. Arabizi este modul real în care libanezii comunică zi de zi în scris. Pentru un începător, e cea mai rapidă cale spre conversație — nu te blochezi la scris cât timp înveți să vorbești. La curs folosim arabizi la început și trecem treptat la alfabetul arab, în ritmul tău, prin metoda "}
        <strong>Oral First</strong>{en ? " method." : "."}
      </p>
    </BlogArticleLayout>
  );
};

export default CeEsteArabizi;
