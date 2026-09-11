import { Link } from "@/components/LocalizedLink";
import BlogArticleLayout from "@/components/blog/BlogArticleLayout";
import { Tldr, InlineCta } from "@/components/blog/ArticleKit";
import { useI18n } from "@/lib/i18n";
import { ARABIZI_DIGITS } from "@/data/arabizi";


// Questions specific to this article; anything answered elsewhere on the
// site stays there, so the same answer never lives on two URLs.
const FAQ = [
  {
    q: { ro: "Ce înseamnă cifrele din arabizi?", en: "What do the numbers in arabizi mean?" },
    a: { ro: "Înlocuiesc sunete arabe care nu au literă latină: 2 pentru ء și pentru ق (în libaneză ق se pronunță ca o oprire glotală), 3 pentru ع, 5 pentru خ, 7 pentru ح și 8 pentru غ. Forma cifrei seamănă cu litera arabă, de aceea se rețin repede.", en: "They stand in for Arabic sounds with no Latin letter: 2 for ء and for ق (in Lebanese, ق is pronounced as a glottal stop), 3 for ع, 5 for خ, 7 for ح and 8 for غ. The digit's shape resembles the Arabic letter, which is why they stick quickly." },
  },
  {
    q: { ro: "Arabizi are reguli fixe de scriere?", en: "Does arabizi have fixed spelling rules?" },
    a: { ro: "Nu. Este o convenție apărută din mesageria de zi cu zi, nu un standard oficial, așa că același cuvânt poate fi scris în două-trei feluri. Cifrele pentru sunetele grele sunt însă folosite aproape la fel de toată lumea.", en: "No. It grew out of everyday messaging rather than any official standard, so the same word can be spelled two or three ways. The digits for the hard sounds, though, are used almost identically by everyone." },
  },
  {
    q: { ro: "Folosesc libanezii arabizi între ei?", en: "Do Lebanese people actually use arabizi with each other?" },
    a: { ro: "Da, constant — pe WhatsApp, în comentarii și pe rețele. Pentru mulți e modul obișnuit de a scrie dialectul, pentru că alfabetul arab nu redă bine libaneza vorbită.", en: "Yes, constantly — on WhatsApp, in comments and on social media. For many it is the normal way to write the dialect, because the Arabic script does not capture spoken Lebanese well." },
  },
];

const CeEsteArabizi = () => {
  const { lang } = useI18n();
  const en = lang === "en";
  return (
    <BlogArticleLayout
      slug="ce-este-arabizi"
      title={{ ro: "Ce este arabizi și cum îl folosești (cu tabel)", en: "What is Arabizi: what 2, 3, 5 and 7 mean in Latin-letter Arabic" }}
      description={{
        ro: "Arabizi este araba scrisă cu litere latine și cifre. Ce înseamnă cifrele 2, 3, 5, 7, cum citești și de ce e cea mai rapidă cale să începi să vorbești libaneză.",
        en: "Arabizi is Arabic written in Latin letters and numbers. Learn what 2, 3, 5, 7 mean, how to read it and why it's the fastest way to start speaking Lebanese.",
      }}
      published="2026-07-16"
      readingMinutes={5}
      faq={FAQ}
      crumb={{ ro: "Ce este arabizi", en: "What is Arabizi" }}
      lead={{
        ro: "Araba scrisă cu litere latine și cifre — cum funcționează, ce înseamnă „3” și „7”, și de ce te ajută să vorbești din prima zi.",
        en: "Arabic written in Latin letters and numbers — how it works, what '3' and '7' mean, and why it helps you speak from day one.",
      }}
    >
      <Tldr
        points={[
          { ro: "Arabizi este araba scrisă cu litere latine și câteva cifre, folosită zilnic pe telefon.", en: "Arabizi is Arabic written in Latin letters and a few digits, used daily on phones." },
          { ro: "Cifrele acoperă sunetele fără echivalent latin: 2, 3, 5, 7 și 8.", en: "The digits cover sounds with no Latin equivalent: 2, 3, 5, 7 and 8." },
          { ro: "Nu e un standard oficial — variază de la om la om, dar cifrele sunt constante.", en: "It is not an official standard — it varies between people, but the digits are consistent." },
          { ro: "Îți permite să scrii și să citești din prima zi, fără alfabetul arab.", en: "It lets you read and write from day one, without the Arabic script." },
        ]}
      />
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
            {ARABIZI_DIGITS.map(({ digit, letter, sound }) => (
              <tr key={digit} className="border-b border-border/60 align-top">
                <td className="py-2 pr-3 font-bold text-lg text-primary">{digit}</td>
                <td className="py-2 px-3 font-arabic text-xl text-brand-green" dir="rtl" lang="ar">{letter}</td>
                <td className="py-2 pl-3 text-foreground/80">{en ? sound.en : sound.ro}</td>
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

      <InlineCta
        title={{ ro: "Vrei să auzi cum sună?", en: "Want to hear how it sounds?" }}
        text={{
          ro: "30 de minute cu profesor nativ, gratuit — online sau fizic în București.",
          en: "30 minutes with a native teacher, free — online or in person in Bucharest.",
        }}
        href="/trial"
        label={{ ro: "Rezervă lecția de probă", en: "Book the trial lesson" }}
      />


      <h2>{en ? "Is it 'cheating' to learn with Arabizi?" : "E „barează” să înveți cu arabizi?"}</h2>
      <p>
        {en
          ? "Not at all. Arabizi is the real way Lebanese people write to each other every day. For a beginner, it's the fastest route to conversation — you don't get stuck on writing while you learn to speak. In class we use Arabizi at first and move gradually to the Arabic alphabet, at your pace, through the "
          : "Deloc. Arabizi este modul real în care libanezii comunică zi de zi în scris. Pentru un începător, e cea mai rapidă cale spre conversație — nu te blochezi la scris cât timp înveți să vorbești. La curs folosim arabizi la început și trecem treptat la alfabetul arab, în ritmul tău, prin metoda "}
        <strong>Oral First</strong>{en ? " method." : "."}
      </p>
      <p>
        {en ? "That method runs through every format we teach — " : "Metoda asta e aceeași în toate formatele — "}
        <Link to="/cursuri-limba-araba">{en ? "see the courses and levels" : "vezi cursurile și nivelurile"}</Link>
        {en
          ? ", from beginner groups to one-on-one lessons."
          : ", de la grupele de început până la lecțiile 1:1."}
      </p>
    </BlogArticleLayout>
  );
};

export default CeEsteArabizi;
