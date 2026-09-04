import { Link } from "react-router-dom";
import BlogArticleLayout from "@/components/blog/BlogArticleLayout";
import { Tldr, InlineCta } from "@/components/blog/ArticleKit";
import { useI18n } from "@/lib/i18n";

// [arabizi/phrase, ro-meaning, en-meaning]
const PHRASES: [string, string, string][] = [
  ["Marhaba", "Bună", "Hello"],
  ["Kifak? / Kifik?", "Ce faci? (către bărbat / femeie)", "How are you? (to a man / woman)"],
  ["Mnih, shukran", "Bine, mulțumesc", "Good, thanks"],
  ["Shu ismak? / ismik?", "Cum te cheamă?", "What's your name?"],
  ["Ana ismi…", "Numele meu este…", "My name is…"],
  ["Ana mn Rumania", "Sunt din România", "I'm from Romania"],
  ["Btehki inglizi?", "Vorbești engleză?", "Do you speak English?"],
  ["Addesh?", "Cât costă?", "How much is it?"],
  ["Wein el ḥammem?", "Unde este toaleta?", "Where is the toilet?"],
  ["Yalla, bye!", "Hai, pa!", "Alright, bye!"],
];

// Questions specific to this article. Anything already answered elsewhere on
// the site stays there — the same question on two URLs splits the answer.
const FAQ = [
  {
    q: { ro: "Pot învăța araba libaneză singur, fără profesor?", en: "Can I learn Lebanese Arabic on my own, without a teacher?" },
    a: {
      ro: "Poți construi vocabular și obișnuința cu sunetele singur, din muzică, seriale și liste de expresii. Ce nu poți face singur este să-ți corectezi pronunția: nu auzi propriile greșeli, iar ele se fixează. De aceea majoritatea combină studiul individual cu ședințe regulate cu un vorbitor nativ.",
      en: "You can build vocabulary and get used to the sounds on your own, from music, series and phrase lists. What you cannot do alone is correct your own pronunciation: you do not hear your own errors, and they set. That is why most learners combine solo study with regular sessions with a native speaker.",
    },
  },
  {
    q: { ro: "De câte cuvinte am nevoie ca să mă descurc în conversații de zi cu zi?", en: "How many words do I need to handle everyday conversation?" },
    a: {
      ro: "Mai puține decât pare, pentru că libaneza se sprijină mult pe expresii fixe. Salutul, prezentarea, cifrele, mâncarea și câteva verbe de bază acoperă majoritatea schimburilor scurte. Important e să înveți fraze întregi, nu cuvinte izolate — multe expresii nu se traduc cuvânt cu cuvânt.",
      en: "Fewer than it seems, because Lebanese leans heavily on set expressions. Greetings, introductions, numbers, food and a handful of basic verbs cover most short exchanges. What matters is learning whole phrases rather than isolated words — many expressions do not translate word for word.",
    },
  },
  {
    q: { ro: "Cât de des ar trebui să exersez?", en: "How often should I practise?" },
    a: {
      ro: "Regulat bate intens. Câteva minute în fiecare zi fac mai mult decât o sesiune lungă în weekend, pentru că sunetele și tiparele se fixează prin repetare deasă. Cursurile de grup merg pe 2 lecții de 90 de minute pe săptămână, exact ca să existe un ritm între ședințe.",
      en: "Regular beats intense. A few minutes every day does more than one long weekend session, because sounds and patterns settle through frequent repetition. Group courses run two 90-minute lessons a week precisely so there is a rhythm between sessions.",
    },
  },
  {
    q: { ro: "Ce fac dacă simt că nu mai progresez?", en: "What do I do if I feel I have stopped progressing?" },
    a: {
      ro: "Platourile sunt normale și apar de obicei după primele săptămâni, când noutatea trece. Cel mai simplu remediu e să schimbi tipul de input: dacă ai tot citit liste, treci la ascultare; dacă ai tot ascultat, treci la vorbit cu cineva. Un obiectiv concret — o conversație de 5 minute, o comandă la restaurant — face progresul vizibil din nou.",
      en: "Plateaus are normal and usually show up after the first few weeks, once the novelty wears off. The simplest fix is to change the kind of input: if you have been reading lists, switch to listening; if you have been listening, switch to speaking with someone. A concrete goal — a five-minute conversation, ordering a meal — makes progress visible again.",
    },
  },
];

const CumInvetiArabaLibaneza = () => {
  const { lang } = useI18n();
  const en = lang === "en";
  return (
    <BlogArticleLayout
      slug="cum-inveti-araba-libaneza"
      title={{ ro: "Cum înveți araba libaneză în 2026: ghid pentru începători", en: "How to learn Lebanese Arabic in 2026: A beginner's guide" }}
      description={{
        ro: "Ghid pas cu pas pentru a învăța araba libaneză: diferența față de araba standard (Fusha), cât durează, cele mai bune metode, greșeli frecvente și fraze utile.",
        en: "A step-by-step guide to learning Lebanese Arabic: how it differs from Standard Arabic (Fusha), how long it takes, the best methods, common mistakes and useful phrases.",
      }}
      published="2026-07-10"
      readingMinutes={8}
      crumb={{ ro: "Cum înveți araba libaneză", en: "How to learn Lebanese Arabic" }}
      lead={{
        ro: "Diferențe față de araba standard, cât timp îți ia, cele mai bune metode de învățare, greșeli frecvente și primele fraze utile — tot ce trebuie să știi înainte să începi.",
        en: "How it differs from Standard Arabic, how long it takes, the best learning methods, common mistakes and the first useful phrases — everything you need to know before you start.",
      }}
      cta={{
        title: { ro: "Gata să începi să vorbești araba libaneză?", en: "Ready to start speaking Lebanese Arabic?" },
        text: {
          ro: "Alătură-te unui curs cu profesor nativ, în București sau online.",
          en: "Join a course with a native teacher, in Bucharest or online.",
        },
        // #inscriere exists only on the course-detail pages, not on the
        // homepage, so "/#inscriere" scrolled nowhere.
        href: "/cursuri",
        label: { ro: "Înscrie-te la un curs", en: "Enrol in a course" },
      }}
      faq={FAQ}
    >
      <Tldr
        points={[
          {
            ro: "Începe cu dialectul libanez, nu cu araba standard: Fusha se scrie, libaneza se vorbește.",
            en: "Start with the Lebanese dialect, not Standard Arabic: Fusha is written, Lebanese is spoken.",
          },
          {
            ro: "Vorbești din prima lecție folosind arabizi (litere latine) — alfabetul arab vine mai târziu, nu la start.",
            en: "You speak from lesson one using arabizi (Latin letters) — the Arabic script comes later, not at the start.",
          },
          {
            ro: "Nivelul A1 durează ~4 luni (32 de lecții), cu 2 lecții de 90 de minute pe săptămână.",
            en: "A1 takes about 4 months (32 lessons), at two 90-minute lessons a week.",
          },
          {
            ro: "Corectarea pronunției de către un vorbitor nativ e partea pe care nicio aplicație nu o acoperă.",
            en: "Pronunciation correction by a native speaker is the part no app covers.",
          },
        ]}
      />
      <aside className="rounded-lg border border-border bg-muted/40 p-5 [&_a]:no-underline">
        <h2 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wide mt-0">
          {en ? "What you'll learn" : "Ce vei afla"}
        </h2>
        <ol className="list-decimal list-inside space-y-1 text-sm text-foreground/80">
          <li><a href="#dialect" className="hover:text-primary">{en ? "What Lebanese Arabic is and how it differs from Fusha" : "Ce este araba libaneză și cum diferă de Fusha"}</a></li>
          <li><a href="#msa" className="hover:text-primary">{en ? "Do you need to learn Fusha (Standard Arabic) first?" : "Trebuie să înveți întâi Fusha (araba standard)?"}</a></li>
          <li><a href="#dificultate" className="hover:text-primary">{en ? "Is Lebanese Arabic hard? How long does it take?" : "Este araba libaneză grea? Cât durează?"}</a></li>
          <li><a href="#metode" className="hover:text-primary">{en ? "The best learning methods" : "Cele mai bune metode de învățare"}</a></li>
          <li><a href="#greseli" className="hover:text-primary">{en ? "Common beginner mistakes" : "Greșeli frecvente ale începătorilor"}</a></li>
          <li><a href="#fraze" className="hover:text-primary">{en ? "The first useful phrases and words" : "Primele fraze și cuvinte utile"}</a></li>
          <li><a href="#pasi" className="hover:text-primary">{en ? "Next steps" : "Următorii pași"}</a></li>
        </ol>
      </aside>

      <section id="dialect" className="scroll-mt-24 space-y-4">
        <h2>{en ? "1. What Lebanese Arabic is and how it differs from other dialects" : "1. Ce este araba libaneză și cum diferă de celelalte dialecte"}</h2>
        <p>
          {en
            ? "Lebanese Arabic is part of the Levantine dialect family (together with Syrian, Palestinian and Jordanian Arabic), which are largely mutually intelligible. It differs from Egyptian and Gulf Arabic in pronunciation, vocabulary and intonation, and also in its strong influences from French, English, Aramaic and Turkish."
            : "Araba libaneză face parte din familia dialectelor levantine (împreună cu araba siriană, palestiniană și iordaniană), care sunt în mare parte inteligibile reciproc. Se deosebește de araba egipteană și de cea din Golf prin pronunție, vocabular și intonație, dar și prin influențele puternice din franceză, engleză, aramaică și turcă."}
        </p>
        <p>
          {en
            ? "In practice, if you learn Lebanese Arabic you'll be understood without trouble in Lebanon, Syria, Jordan and Palestine, and in Egypt, the Gulf and North Africa you'll be able to communicate after a short period of exposure to the local dialect. It's one of the most 'media-friendly' dialects — it appears often in music, series and on social media."
            : "În practică, dacă înveți araba libaneză vei fi înțeles fără probleme în Liban, Siria, Iordania și Palestina, iar în Egipt, Golf și Africa de Nord vei putea comunica după o scurtă perioadă de expunere la dialectul local. Este unul dintre cele mai „media-friendly” dialecte — apare frecvent în muzică, seriale și pe rețelele sociale."}
        </p>
      </section>

      <section id="msa" className="scroll-mt-24 space-y-4">
        <h2>{en ? "2. Do you need to learn Standard Arabic (Fusha) first?" : "2. Trebuie să înveți întâi araba standard (Fusha)?"}</h2>
        <p>
          {en ? "The short answer: " : "Răspunsul scurt: "}
          <strong>{en ? "no, if your goal is to speak" : "nu, dacă scopul tău este să vorbești"}</strong>{en ? ". Modern Standard Arabic (MSA / Fusha) is the written language, used in news, newspapers and official documents. Almost no one uses it in daily conversation." : ". Araba standard modernă (MSA / Fusha) este limba scrisă, folosită în știri, ziare și documente oficiale. Aproape nimeni nu o folosește în conversații zilnice."}
        </p>
        <p>
          {en
            ? "If you want to communicate with family, travel to Lebanon, understand music and series, or work with native speakers, start directly with the Lebanese dialect. You'll reach real conversations much faster. Fusha stays useful later — especially for reading, academic writing or religious contexts."
            : "Dacă vrei să comunici cu familia, să călătorești în Liban, să înțelegi muzica și serialele sau să lucrezi cu vorbitori nativi, începe direct cu dialectul libanez. Vei ajunge la conversații reale mult mai repede. Fusha rămâne utilă mai târziu — mai ales pentru citit, scris academic sau context religios."}
        </p>
      </section>

      <section id="dificultate" className="scroll-mt-24 space-y-4">
        <h2>{en ? "3. Is Lebanese Arabic hard? How long until you're conversational?" : "3. Este araba libaneză grea? Cât durează să devii conversațional?"}</h2>
        <p>
          {en ? "For an English speaker, Lebanese Arabic has a few new sounds (ع, ح, ق) and a different grammatical structure, but it's a dialect " : "Pentru un vorbitor de română, araba libaneză are câteva sunete noi (ع, ح, ق) și o structură gramaticală diferită, dar este un dialect "}
          <strong>{en ? "simpler than Fusha" : "mai simplu decât Fusha"}</strong>{en ? ": conjugations are more regular, grammatical cases aren't used, and everyday vocabulary is limited and repetitive." : ": conjugările sunt mai regulate, cazurile gramaticale nu se folosesc, iar vocabularul de zi cu zi este limitat și repetitiv."}
        </p>
        <ul>
          <li><strong>{en ? "1–3 months:" : "1–3 luni:"}</strong>{en ? " introduce yourself, order at a restaurant, ask for directions." : " te prezinți, comanzi la restaurant, întrebi indicații."}</li>
          <li><strong>{en ? "6 months:" : "6 luni:"}</strong>{en ? " simple conversations on familiar topics." : " conversații simple pe teme familiare."}</li>
          <li><strong>{en ? "12–18 months:" : "12–18 luni:"}</strong>{en ? " fluent conversation with regular practice (2–3 hours/week)." : " conversație fluentă cu practică regulată (2–3 ore/săptămână)."}</li>
        </ul>
        <p>
          {en ? "The deciding factor isn't talent, but " : "Factorul decisiv nu este talentul, ci "}
          <strong>{en ? "consistency" : "consecvența"}</strong>{en ? " and how much you speak, not just read or listen." : " și cât de mult vorbești, nu doar citești sau asculți."}
        </p>
      </section>

      <section id="metode" className="scroll-mt-24 space-y-4">
        <h2>{en ? "4. The best learning methods" : "4. Cele mai bune metode de învățare"}</h2>
        <p>{en ? "The combination that works for most adults:" : "Combinația care funcționează pentru majoritatea adulților:"}</p>
        <ul>
          <li><strong>{en ? "A native teacher" : "Un profesor nativ"}</strong>{en ? " (group or 1:1) — for correct pronunciation and immediate feedback. Apps like Duolingo don't teach Lebanese." : " (grup sau 1:1) — pentru pronunție corectă și feedback imediat. Apps precum Duolingo nu predau libaneza."}</li>
          <li><strong>{en ? "Easy daily input:" : "Input zilnic ușor:"}</strong>{en ? " Lebanese music (Fairuz, Nancy Ajram), series on Shahid / Netflix, TikTok and YouTube accounts in Lebanese." : " muzică libaneză (Fairuz, Nancy Ajram), seriale de pe Shahid / Netflix, conturi de TikTok și YouTube în libaneză."}</li>
          <li><strong>{en ? "Thematic vocabulary" : "Vocabular tematic"}</strong>{en ? " (food, family, shopping) instead of long lists of words out of context." : " (mâncare, familie, cumpărături) în loc de liste lungi de cuvinte scoase din context."}</li>
          <li><strong>{en ? "Speaking from lesson 1" : "Vorbire de la lecția 1"}</strong>{en ? " — even wrong phrases said out loud progress faster than silent reading." : " — chiar și fraze greșite spuse cu voce tare progresează mai repede decât citirea în tăcere."}</li>
        </ul>
        <p>
          {en ? "You can learn " : "Poți învăța "}
          <Link to="/cursuri">{en ? "online or in person in Bucharest" : "online sau fizic în București"}</Link>
          {en ? " — both work, if you have a teacher who corrects pronunciation." : " — ambele funcționează, dacă ai un profesor care corectează pronunția."}
        </p>
      </section>

      <InlineCta
        title={{ ro: "Vrei să auzi cum sună?", en: "Want to hear how it sounds?" }}
        text={{
          ro: "30 de minute cu profesor nativ, gratuit — online sau fizic în București.",
          en: "30 minutes with a native teacher, free — online or in person in Bucharest.",
        }}
        href="/trial"
        label={{ ro: "Rezervă lecția de probă", en: "Book the trial lesson" }}
      />

      <section id="greseli" className="scroll-mt-24 space-y-4">
        <h2>{en ? "5. Common mistakes beginners make" : "5. Greșeli frecvente pe care le fac începătorii"}</h2>
        <ul>
          <li><strong>{en ? "Mixing Fusha with Lebanese" : "Amestecă Fusha cu libaneza"}</strong>{en ? " — it sounds artificial and native speakers will reply in English." : " — sună artificial și vorbitorii nativi vor răspunde în engleză."}</li>
          <li><strong>{en ? "Getting stuck on the alphabet" : "Se blochează pe alfabet"}</strong>{en ? " before saying a word. You can start with transliteration and add writing later." : " înainte să spună un cuvânt. Poți începe cu transliterație și adăugi scrisul mai târziu."}</li>
          <li><strong>{en ? "Translating word-for-word" : "Traduc din română cuvânt-cu-cuvânt"}</strong>{en ? " — word order and expressions are different." : " — ordinea cuvintelor și expresiile sunt diferite."}</li>
          <li><strong>{en ? "Ignoring the 'hard' sounds" : "Ignoră sunetele „grele”"}</strong>{en ? " (ع, ح, ق). With 10 minutes a day of practice they become natural in a few weeks." : " (ع, ح, ق). Cu 10 minute pe zi de exersare devin naturale în câteva săptămâni."}</li>
          <li><strong>{en ? "Learning in isolation" : "Învață izolat"}</strong>{en ? ", never speaking with anyone. The result: you understand, but you can't reply." : ", fără să vorbească niciodată cu cineva. Rezultatul: înțelegi, dar nu poți răspunde."}</li>
        </ul>
      </section>

      <section id="fraze" className="scroll-mt-24 space-y-4">
        <h2>{en ? "6. The first 10 useful phrases in Lebanese Arabic" : "6. Primele 10 fraze utile în araba libaneză"}</h2>
        <ul>
          {PHRASES.map(([phrase, ro, enM]) => (
            <li key={phrase}><strong>{phrase}</strong> — {en ? enM : ro}</li>
          ))}
        </ul>
      </section>

      <section id="pasi" className="scroll-mt-24 space-y-4">
        <h2>{en ? "7. Next steps" : "7. Următorii pași"}</h2>
        <p>
          {en
            ? "The most important step is to start speaking with someone this week — not in a month, when you'll 'be ready'. You can:"
            : "Cel mai important pas este să începi să vorbești cu cineva săptămâna aceasta — nu peste o lună, când „vei fi gata”. Poți:"}
        </p>
        <ul>
          <li>
            {en ? "Take the " : "Vezi "}
            <Link to="/quiz">{en ? "free level test" : "testul de nivel gratuit"}</Link>{en ? " to find where you start." : " ca să afli de unde pornești."}
          </li>
          <li>
            {en ? "Choose a " : "Alege un "}
            <Link to="/cursuri/grup">{en ? "group course" : "curs de grup"}</Link>{en ? " (more affordable, more motivating) or " : " (mai accesibil, mai motivant) sau "}
            <Link to="/cursuri/private">{en ? "private lessons" : "lecții private"}</Link>{en ? " (personalised pace)." : " (ritm personalizat)."}
          </li>
          <li>
            {en ? "Worried about the script? Read " : "Te sperie alfabetul? Citește "}
            <Link to="/fara-alfabet-arab">{en ? "how to start without the Arabic alphabet" : "cum începi fără alfabetul arab"}</Link>
            {en ? " and the " : " și "}
            <Link to="/arabizi">{en ? "Arabizi guide" : "ghidul Arabizi"}</Link>.
          </li>
          <li>
            {en ? "For kids, we have a " : "Pentru copii, avem un "}
            <Link to="/cursuri/copii">{en ? "dedicated programme" : "program dedicat"}</Link>{en ? " in person in Bucharest." : " fizic în București."}
          </li>
        </ul>
      </section>
    </BlogArticleLayout>
  );
};

export default CumInvetiArabaLibaneza;
