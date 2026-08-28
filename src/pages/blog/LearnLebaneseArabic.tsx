import { Link } from "react-router-dom";
import BlogArticleLayout from "@/components/blog/BlogArticleLayout";
import { useI18n } from "@/lib/i18n";

// [arabizi/phrase, ro-meaning, en-meaning]
const PHRASES: [string, string, string][] = [
  ["Marhaba", "Bună", "Hello"],
  ["Kifak? / Kifik?", "Ce faci? (bărbat / femeie)", "How are you? (to a man / woman)"],
  ["Mnih, shukran", "Bine, mulțumesc", "Good, thanks"],
  ["Shu ismak? / ismik?", "Cum te cheamă?", "What's your name?"],
  ["Ana ismi…", "Numele meu este…", "My name is…"],
  ["Ana mn…", "Sunt din…", "I'm from…"],
  ["Btehki inglizi?", "Vorbești engleză?", "Do you speak English?"],
  ["Addesh?", "Cât costă?", "How much is it?"],
  ["Wein el ḥammem?", "Unde este toaleta?", "Where is the toilet?"],
  ["Yalla, bye!", "Hai, pa!", "Alright, bye!"],
];

const LearnLebaneseArabicBlog = () => {
  const { lang } = useI18n();
  const en = lang === "en";

  return (
    <BlogArticleLayout
      slug="learn-lebanese-arabic"
      title={{
        ro: "Cum înveți araba libaneză: ghid practic pentru începători",
        en: "Learn Lebanese Arabic: a practical beginner's guide",
      }}
      description={{
        ro: "Învață araba libaneză pas cu pas: diferențe față de MSA, metode eficiente, greșeli frecvente și primele fraze utile pentru începători.",
        en: "A step-by-step guide to learning Lebanese Arabic: what the Lebanese dialect is, how it differs from MSA, how long it takes, effective methods, common mistakes and your first useful phrases.",
      }}
      published="2026-07-24"
      readingMinutes={8}
      crumb={{
        ro: "Cum înveți araba libaneză",
        en: "Learn Lebanese Arabic",
      }}
      lead={{
        ro: "Tot ce trebuie să știi ca să înveți araba libaneză: diferențele față de araba standard, cât timp îți ia, metode care funcționează, greșeli de evitat și primele 10 fraze utile.",
        en: "Everything you need to know to learn Lebanese Arabic: how it differs from Standard Arabic, how long it takes, methods that work, mistakes to avoid, and your first 10 useful phrases.",
      }}
      cta={{
        title: {
          ro: "Gata să vorbești araba libaneză?",
          en: "Ready to start speaking Lebanese Arabic?",
        },
        text: {
          ro: "Rezervă o lecție de probă gratuită cu profesor nativ — online sau în București.",
          en: "Book a free trial lesson with a native teacher — online or in Bucharest.",
        },
        href: "/trial",
        label: {
          ro: "Rezervă o lecție de probă gratuită",
          en: "Book a free trial lesson",
        },
      }}
    >
      <aside className="rounded-lg border border-border bg-muted/40 p-5 [&_a]:no-underline">
        <h2 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wide mt-0">
          {en ? "What you'll learn" : "Ce vei afla"}
        </h2>
        <ol className="list-decimal list-inside space-y-1 text-sm text-foreground/80">
          <li><a href="#what-is" className="hover:text-primary">{en ? "What Lebanese Arabic is" : "Ce este araba libaneză"}</a></li>
          <li><a href="#vs-msa" className="hover:text-primary">{en ? "Lebanese Arabic vs Modern Standard Arabic" : "Araba libaneză vs araba standard"}</a></li>
          <li><a href="#how-long" className="hover:text-primary">{en ? "How long it takes" : "Cât durează"}</a></li>
          <li><a href="#methods" className="hover:text-primary">{en ? "Best learning methods" : "Cele mai bune metode"}</a></li>
          <li><a href="#mistakes" className="hover:text-primary">{en ? "Common beginner mistakes" : "Greșeli frecvente"}</a></li>
          <li><a href="#phrases" className="hover:text-primary">{en ? "First useful phrases" : "Primele fraze utile"}</a></li>
          <li><a href="#next" className="hover:text-primary">{en ? "Next steps" : "Următorii pași"}</a></li>
        </ol>
      </aside>

      <section id="what-is" className="scroll-mt-24 space-y-4">
        <h2>{en ? "1. What is Lebanese Arabic?" : "1. Ce este araba libaneză?"}</h2>
        <p>
          {en
            ? "Lebanese Arabic is the spoken dialect of Lebanon. It is part of the Levantine Arabic family, which also includes Syrian, Jordanian and Palestinian Arabic. These dialects are largely mutually intelligible, so learning Lebanese gives you a strong foundation for understanding the whole Levant."
            : "Araba libaneză este dialectul vorbit în Liban. Face parte din familia dialectelor levantine, care include și araba siriană, iordaniană și palestiniană. Aceste dialecte sunt în mare parte inteligibile reciproc, așa că învățând libaneza obții o bază solidă pentru a înțelege întregul Levant."}
        </p>
        <p>
          {en
            ? "It is not the same as Modern Standard Arabic (MSA / Fusha), the formal written language used in news, literature and religious texts. Lebanese Arabic is what people actually speak at home, in cafés, on the phone and in media."
            : "Nu este același lucru cu araba standard modernă (MSA / Fusha), limba scrisă formală folosită în știri, literatură și texte religioase. Araba libaneză este ceea ce oamenii vorbesc de fapt acasă, la cafenea, la telefon și în media."}
        </p>
      </section>

      <section id="vs-msa" className="scroll-mt-24 space-y-4">
        <h2>{en ? "2. Lebanese Arabic vs Modern Standard Arabic" : "2. Araba libaneză vs araba standard"}</h2>
        <p>
          {en
            ? "This is the most common question beginners ask. The short answer: if you want to speak with people, start with Lebanese Arabic. MSA is the written, formal register — important for reading, academia and religion, but almost no one speaks it naturally."
            : "Aceasta este cea mai frecventă întrebare a începătorilor. Răspunsul scurt: dacă vrei să vorbești cu oamenii, începe cu araba libaneză. MSA este registrul scris, formal — important pentru citit, academic și religie, dar aproape nimeni nu o vorbește natural."}
        </p>
        <table className="w-full text-sm border border-border rounded-lg overflow-hidden my-4">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left p-3 font-semibold text-foreground">{en ? "Lebanese Arabic" : "Araba libaneză"}</th>
              <th className="text-left p-3 font-semibold text-foreground">{en ? "Modern Standard Arabic" : "Araba standard modernă"}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            <tr>
              <td className="p-3 text-muted-foreground">{en ? "Spoken everyday language" : "Limba vorbită de zi cu zi"}</td>
              <td className="p-3 text-muted-foreground">{en ? "Written formal language" : "Limba scrisă formală"}</td>
            </tr>
            <tr>
              <td className="p-3 text-muted-foreground">{en ? "No grammatical cases" : "Fără cazuri gramaticale"}</td>
              <td className="p-3 text-muted-foreground">{en ? "Complex grammatical cases" : "Cazuri gramaticale complexe"}</td>
            </tr>
            <tr>
              <td className="p-3 text-muted-foreground">{en ? "Simpler verb conjugations" : "Conjugări verbale mai simple"}</td>
              <td className="p-3 text-muted-foreground">{en ? "Full classical conjugation system" : "Sistem complet de conjugare clasică"}</td>
            </tr>
            <tr>
              <td className="p-3 text-muted-foreground">{en ? "Used in songs, series, TikTok" : "Folosită în muzică, seriale, TikTok"}</td>
              <td className="p-3 text-muted-foreground">{en ? "Used in news, official documents" : "Folosită în știri, documente oficiale"}</td>
            </tr>
          </tbody>
        </table>
        <p>
          {en ? "You can read more in our dedicated " : "Poți citi mai mult în articolul nostru "}
          <Link to="/blog/araba-libaneza-vs-araba-standard">{en ? "Lebanese Arabic vs Standard Arabic comparison" : "Araba libaneză vs araba standard"}</Link>.
        </p>
      </section>

      <section id="how-long" className="scroll-mt-24 space-y-4">
        <h2>{en ? "3. How long does it take to learn Lebanese Arabic?" : "3. Cât durează să înveți araba libaneză?"}</h2>
        <p>
          {en
            ? "For English or Romanian speakers, Lebanese Arabic is more approachable than MSA because it drops many complex grammar features. With consistent study, here is a realistic timeline:"
            : "Pentru vorbitori de engleză sau română, araba libaneză este mai accesibilă decât MSA pentru că renunță la multe caracteristici gramaticale complexe. Cu studiu consecvent, iată un calendar realist:"}
        </p>
        <ul>
          <li><strong>{en ? "1–3 months:" : "1–3 luni:"}</strong>{en ? " introduce yourself, order food, ask for directions, handle basic transactions." : " te prezinți, comanzi mâncare, întrebi direcții, gestionezi tranzacții de bază."}</li>
          <li><strong>{en ? "3–6 months:" : "3–6 luni:"}</strong>{en ? " simple conversations on familiar topics (A2 level)." : " conversații simple pe teme familiare (nivel A2)."}</li>
          <li><strong>{en ? "12–18 months:" : "12–18 luni:"}</strong>{en ? " comfortable conversation with regular practice (B1/B2)." : " conversație confortabilă cu practică regulată (B1/B2)."}</li>
        </ul>
        <p>
          {en ? "The key factor is not talent, but " : "Factorul cheie nu este talentul, ci "}
          <strong>{en ? "consistent speaking practice" : "practica consecventă de vorbire"}</strong>{en ? "." : "."}
        </p>
      </section>

      <section id="methods" className="scroll-mt-24 space-y-4">
        <h2>{en ? "4. Best methods to learn Lebanese Arabic" : "4. Cele mai bune metode de a învăța araba libaneză"}</h2>
        <p>{en ? "The combination that works for most adults:" : "Combinația care funcționează pentru majoritatea adulților:"}</p>
        <ul>
          <li><strong>{en ? "A native teacher" : "Un profesor nativ"}</strong>{en ? " — for correct pronunciation and immediate feedback. Apps like Duolingo do not teach Lebanese Arabic." : " — pentru pronunție corectă și feedback imediat. Aplicații precum Duolingo nu predau araba libaneză."}</li>
          <li><strong>{en ? "Daily easy input" : "Input zilnic ușor"}</strong>{en ? ": Lebanese music (Fairuz, Nancy Ajram), series on Shahid/Netflix, TikTok and YouTube in Lebanese." : ": muzică libaneză (Fairuz, Nancy Ajram), seriale pe Shahid/Netflix, TikTok și YouTube în libaneză."}</li>
          <li><strong>{en ? "Thematic vocabulary" : "Vocabular tematic"}</strong>{en ? " (food, family, shopping) instead of long word lists out of context." : " (mâncare, familie, cumpărături) în loc de liste lungi de cuvinte fără context."}</li>
          <li><strong>{en ? "Speak from lesson 1" : "Vorbește de la lecția 1"}</strong>{en ? " — even imperfect phrases said out loud progress faster than silent reading." : " — chiar și fraze imperfecte spuse cu voce tare progresează mai repede decât cititul în tăcere."}</li>
          <li><strong>{en ? "Use Arabizi first" : "Folosește arabizi mai întâi"}</strong>{en ? " — Latin transliteration lets you focus on sounds and speaking before tackling the Arabic script." : " — transliterarea latină îți permite să te concentrezi pe sunete și vorbire înainte de a aborda scrierea arabă."}</li>
        </ul>
      </section>

      <section id="mistakes" className="scroll-mt-24 space-y-4">
        <h2>{en ? "5. Common beginner mistakes" : "5. Greșeli frecvente ale începătorilor"}</h2>
        <ul>
          <li><strong>{en ? "Starting with the alphabet" : "Să începi cu alfabetul"}</strong>{en ? " — it creates a barrier before you say a word. Start with transliteration and add writing later." : " — creează o barieră înainte să spui un cuvânt. Începe cu transliterație și adaugă scrisul mai târziu."}</li>
          <li><strong>{en ? "Mixing MSA with Lebanese" : "Să amesteci MSA cu libaneza"}</strong>{en ? " — it sounds artificial and native speakers may switch to English." : " — sună artificial și vorbitorii nativi pot trece la engleză."}</li>
          <li><strong>{en ? "Word-for-word translation" : "Traducere cuvânt-cu-cuvânt"}</strong>{en ? " — word order and expressions differ from English/Romanian." : " — ordinea cuvintelor și expresiile diferă față de engleză/română."}</li>
          <li><strong>{en ? "Ignoring the hard sounds" : "Ignorarea sunetelor grele"}</strong>{en ? " (ع, ح, ق). With 10 minutes a day of focused practice they become natural in weeks." : " (ع, ح, ق). Cu 10 minute pe zi de practică focusată devin naturale în câteva săptămâni."}</li>
          <li><strong>{en ? "Learning in isolation" : "Învățarea în izolare"}</strong>{en ? " — never speaking with anyone. The result: you understand but cannot reply." : " — fără să vorbești niciodată cu cineva. Rezultatul: înțelegi, dar nu poți răspunde."}</li>
        </ul>
      </section>

      <section id="phrases" className="scroll-mt-24 space-y-4">
        <h2>{en ? "6. Your first 10 useful phrases in Lebanese Arabic" : "6. Primele 10 fraze utile în araba libaneză"}</h2>
        <ul>
          {PHRASES.map(([phrase, ro, enM]) => (
            <li key={phrase}><strong>{phrase}</strong> — {en ? enM : ro}</li>
          ))}
        </ul>
        <p>
          {en ? "For more, see our full list of " : "Pentru mai multe, vezi lista completă de "}
          <Link to="/blog/primele-20-de-expresii-libaneze">{en ? "20 essential Lebanese Arabic phrases" : "20 de expresii esențiale în araba libaneză"}</Link>.
        </p>
      </section>

      <section id="next" className="scroll-mt-24 space-y-4">
        <h2>{en ? "7. Next steps" : "7. Următorii pași"}</h2>
        <p>
          {en
            ? "The most important step is to start speaking with someone this week — not in a month when you feel 'ready'. Here are concrete ways to begin:"
            : "Cel mai important pas este să începi să vorbești cu cineva săptămâna aceasta — nu peste o lună când te simți gata. Iată modalități concrete de a începe:"}
        </p>
        <ul>
          <li>
            {en ? "Take the " : "Fă "}
            <Link to="/quiz">{en ? "free level test" : "testul de nivel gratuit"}</Link>{en ? " to find your starting point." : " ca să afli de unde pornești."}
          </li>
          <li>
            {en ? "Book a " : "Rezervă o "}
            <Link to="/trial">{en ? "free trial lesson" : "lecție de probă gratuită"}</Link>{en ? " with a native teacher." : " cu un profesor nativ."}
          </li>
          <li>
            {en ? "Choose a " : "Alege un "}
            <Link to="/en/learn-lebanese-arabic">{en ? "Lebanese Arabic course" : "curs de arabă libaneză"}</Link>{en ? " (group or private)." : " (grup sau privat)."}
          </li>
          <li>
            {en ? "Start listening to Lebanese music or watching Lebanese series with subtitles." : "Începe să asculți muzică libaneză sau să te uiți la seriale libaneze cu subtitrare."}
          </li>
        </ul>
      </section>
    </BlogArticleLayout>
  );
};

export default LearnLebaneseArabicBlog;
