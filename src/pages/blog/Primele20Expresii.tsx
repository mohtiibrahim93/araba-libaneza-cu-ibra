import { Link } from "@/components/LocalizedLink";
import BlogArticleLayout from "@/components/blog/BlogArticleLayout";
import { Tldr, InlineCta } from "@/components/blog/ArticleKit";
import { useI18n } from "@/lib/i18n";

// group → { title-ro, title-en, rows: [ arabizi, arabic, ro, en ] }
const GROUPS: { titleRo: string; titleEn: string; rows: [string, string, string, string][] }[] = [
  {
    titleRo: "Salut și politețe",
    titleEn: "Greetings and politeness",
    rows: [
      ["Mar7aba", "مرحبا", "Salut / Bună", "Hi / Hello"],
      ["Kifak? (m) · Kifik? (f)", "كيفك؟", "Ce faci?", "How are you?"],
      ["Mnee7, shukran", "منيح، شكراً", "Bine, mulțumesc", "Good, thanks"],
      ["Shu akhbarak?", "شو أخبارك؟", "Ce mai e nou?", "What's new?"],
      ["Yalla, baaden", "يلا، بعدين", "Hai, pe curând", "Alright, see you later"],
      ["Tsharrafna", "تشرفنا", "Îmi pare bine (de cunoștință)", "Nice to meet you"],
    ],
  },
  {
    titleRo: "Cuvinte de bază",
    titleEn: "Basic words",
    rows: [
      ["Eh / La'", "إيه / لأ", "Da / Nu", "Yes / No"],
      ["Min fadlak (m)", "من فضلك", "Te rog", "Please"],
      ["Shukran ktir", "شكراً كتير", "Mulțumesc mult", "Thank you very much"],
      ["3afwan", "عفواً", "Cu plăcere / Scuze", "You're welcome / Excuse me"],
      ["Aasef (m) · Aasfeh (f)", "آسف", "Îmi pare rău", "I'm sorry"],
      ["Ma fhemet", "ما فهمت", "Nu am înțeles", "I didn't understand"],
    ],
  },
  {
    titleRo: "La cafenea și pe stradă",
    titleEn: "At the café and on the street",
    rows: [
      ["Baddi ahwe", "بدي قهوة", "Vreau o cafea", "I'd like a coffee"],
      ["Addesh el 7saab?", "قديش الحساب؟", "Cât costă / Cât e nota?", "How much is it / the bill?"],
      ["Wein el 7ammem?", "وين الحمام؟", "Unde e toaleta?", "Where's the toilet?"],
      ["3al yamin / 3ash-shmel", "عاليمين / عالشمال", "La dreapta / La stânga", "To the right / To the left"],
      ["Wa''ifni hon", "وقفني هون", "Oprește-mă aici (în taxi)", "Stop here (in a taxi)"],
      ["Ktir tayyeb!", "كتير طيّب!", "Foarte gustos!", "Very tasty!"],
    ],
  },
  {
    titleRo: "Expresii libaneze de suflet",
    titleEn: "Heartfelt Lebanese expressions",
    rows: [
      ["Ya3ni", "يعني", "Adică / Cam așa (umplutură universală)", "I mean / sort of (universal filler)"],
      ["Ta2burni", "تقبرني", "„Te iubesc enorm” (literal: să mă îngropi tu) — afecțiune tipic libaneză", "'I love you dearly' (literally: may you bury me) — typically Lebanese affection"],
    ],
  },
];

// Questions specific to this article; anything answered elsewhere on the
// site stays there, so the same answer never lives on two URLs.
const FAQ = [
  {
    q: { ro: "Ce expresie folosesc dacă știu una singură?", en: "Which phrase should I use if I only know one?" },
    a: { ro: "„Mar7aba”. E salutul neutru, potrivit în orice context și cu oricine, iar reacția pe care o primești când un străin salută în libaneză schimbă tot restul conversației.", en: "\"Mar7aba\". It is the neutral greeting, right in any context and with anyone, and the reaction a foreigner gets for greeting in Lebanese changes the rest of the conversation." },
  },
  {
    q: { ro: "Ce înseamnă „yalla”?", en: "What does \"yalla\" mean?" },
    a: { ro: "Literal „hai”, dar se folosește pentru aproape orice îndemn: hai să mergem, hai odată, gata. E printre cele mai auzite cuvinte din Liban și apare în mijlocul frazelor în orice limbă.", en: "Literally \"come on\", but it is used for almost any prompt: let's go, hurry up, that's enough. It is among the most heard words in Lebanon and turns up mid-sentence in any language." },
  },
  {
    q: { ro: "Risc să par nepoliticos dacă greșesc pronunția?", en: "Do I risk sounding rude if I get the pronunciation wrong?" },
    a: { ro: "Practic niciodată. Efortul de a vorbi libaneză e primit cu căldură, iar greșelile sunt corectate prietenos. Riscul real e invers: să nu încerci deloc.", en: "Almost never. The effort of speaking Lebanese is met warmly, and mistakes are corrected in a friendly way. The real risk runs the other way: not trying at all." },
  },
];

const Primele20Expresii = () => {
  const { lang } = useI18n();
  const en = lang === "en";
  return (
    <BlogArticleLayout
      slug="primele-20-de-expresii-libaneze"
      title={{ ro: "20 de expresii în arabă libaneză pentru începători", en: "20 Lebanese Arabic phrases you'll use from day one" }}
      description={{
        ro: "Cele mai utile 20 de expresii libaneze pentru începători — salut, politețe, cafenea, taxi — scrise în arabizi cu pronunție și traducere.",
        en: "The 20 most useful Lebanese phrases for beginners — greetings, politeness, café, taxi — written in Arabizi with pronunciation and translation.",
      }}
      published="2026-07-16"
      readingMinutes={6}
      faq={FAQ}
      crumb={{ ro: "Primele 20 de expresii", en: "The first 20 phrases" }}
      lead={{
        ro: "Scrise în arabizi (litere latine), cu grafia arabă și traducere. Exact expresiile pe care le folosești din prima zi în Liban — sau cu prietenii libanezi.",
        en: "Written in Arabizi (Latin letters), with Arabic script and translation. Exactly the phrases you use from day one in Lebanon — or with Lebanese friends.",
      }}
      cta={{
        title: { ro: "Vrei să le și pronunți corect?", en: "Want to pronounce them correctly too?" },
        text: {
          ro: "La o lecție de probă gratuită le auzi de la un vorbitor nativ și le repeți pe loc.",
          en: "In a free trial lesson you hear them from a native speaker and repeat them on the spot.",
        },
        href: "/trial",
        label: { ro: "Rezervă o lecție de probă gratuită", en: "Book a free trial lesson" },
      }}
    >
      <Tldr
        points={[
          { ro: "Douăzeci de expresii acoperă majoritatea schimburilor scurte din prima zi.", en: "Twenty phrases cover most short exchanges from day one." },
          { ro: "„Mar7aba” și „yalla” sunt cele două cuvinte pe care le auzi cel mai des.", en: "\"Mar7aba\" and \"yalla\" are the two words you will hear most." },
          { ro: "Sunt scrise în arabizi, cu grafia arabă alături, ca să le poți citi imediat.", en: "They are written in arabizi, with the Arabic script alongside, so you can read them immediately." },
          { ro: "Efortul de a vorbi contează mai mult decât pronunția perfectă.", en: "The effort of speaking counts for more than perfect pronunciation." },
        ]}
      />
      <div className="rounded-xl border border-border bg-muted/40 p-5 text-sm text-foreground/80 leading-relaxed [&_a]:no-underline">
        <p>
          <strong>{en ? "How to read the table:" : "Cum citești tabelul:"}</strong>{" "}
          {en
            ? "'3' is pronounced like a guttural 'a' (the letter ع), '7' like a harsh 'h' from the throat (ح), and '2' marks a short catch in the voice (ء). Don't worry — in class you hear and repeat them naturally, our method is "
            : "„3” se pronunță ca un „a” gutural (litera ع), „7” ca un „h” aspru din gât (ح), iar „2” marchează o oprire scurtă a vocii (ء). Nu-ți face griji — la curs le auzi și le repeți natural, metoda noastră e "}
          <em>Oral First</em>.
        </p>
      </div>

      {GROUPS.map((group) => (
        <section key={group.titleEn} className="space-y-4">
          <h2>{en ? group.titleEn : group.titleRo}</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="py-2 pr-3 font-semibold">Arabizi</th>
                  <th className="py-2 px-3 font-semibold">{en ? "Arabic" : "Arabă"}</th>
                  <th className="py-2 pl-3 font-semibold">{en ? "Meaning" : "Română"}</th>
                </tr>
              </thead>
              <tbody>
                {group.rows.map(([arabizi, arabic, ro, enM]) => (
                  <tr key={arabizi} className="border-b border-border/60 align-top">
                    <td className="py-2.5 pr-3 font-semibold text-foreground whitespace-nowrap">{arabizi}</td>
                    <td className="py-2.5 px-3 font-arabic text-lg text-brand-green" dir="rtl" lang="ar">{arabic}</td>
                    <td className="py-2.5 pl-3 text-foreground/80">{en ? enM : ro}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}

      <InlineCta
        title={{ ro: "Vrei să auzi cum sună?", en: "Want to hear how it sounds?" }}
        text={{
          ro: "30 de minute cu profesor nativ, gratuit — online sau fizic în București.",
          en: "30 minutes with a native teacher, free — online or in person in Bucharest.",
        }}
        href="/trial"
        label={{ ro: "Rezervă lecția de probă", en: "Book the trial lesson" }}
      />


      <h2>{en ? "Where to go next" : "De unde continui"}</h2>
      <p>
        {en
          ? "If you liked the phrases above, the natural next step is to put them in context — how they connect, how you reply, how you hold a short conversation. That's what we do in class from the first lesson."
          : "Dacă expresiile de mai sus ți-au plăcut, pasul următor firesc e să le pui în context — cum se leagă, cum răspunzi, cum porți o conversație scurtă. Asta facem la curs din prima lecție."}
      </p>
      <ul>
        <li>
          {en ? "See the difference between dialect and Classical Arabic in " : "Vezi diferența dintre dialect și araba clasică în "}
          <Link to="/blog/araba-libaneza-vs-araba-standard">{en ? "Lebanese Arabic vs Standard Arabic" : "araba libaneză vs araba standard"}</Link>.
        </li>
        <li>
          {en ? "Don't know what the numbers in 'mar7aba' mean? See the " : "Nu știi ce caută cifrele în „mar7aba”? Vezi "}
          <Link to="/arabizi">{en ? "full Arabizi guide" : "ghidul complet Arabizi"}</Link>.
        </li>
        <li>
          {en ? "Want all 100 phrases as a free PDF? Get them from the " : "Vrei toate cele 100 de expresii în PDF gratuit? Le iei de pe "}
          <Link to="/resurse">{en ? "free resources page" : "pagina de resurse gratuite"}</Link>.
        </li>
        <li>
          {en ? "Not sure where to start? Take the " : "Nu știi de unde pornești? Fă "}
          <Link to="/quiz">{en ? "free level test" : "testul de nivel gratuit"}</Link>.
        </li>
      </ul>
    </BlogArticleLayout>
  );
};

export default Primele20Expresii;
