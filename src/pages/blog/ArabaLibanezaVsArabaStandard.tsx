import { Link } from "react-router-dom";
import BlogArticleLayout from "@/components/blog/BlogArticleLayout";
import { useI18n } from "@/lib/i18n";

// comparison rows: [criterion-ro, criterion-en, leb-ro, leb-en, msa-ro, msa-en]
const COMPARE: [string, string, string, string, string, string][] = [
  ["Folosită pentru", "Used for", "Conversație zilnică, familie, călătorii, media", "Daily conversation, family, travel, media", "Scris, știri, texte oficiale, religie", "Writing, news, official texts, religion"],
  ["Cine o vorbește nativ", "Who speaks it natively", "~30M vorbitori (Liban, Siria, Iordania, Palestina)", "~30M speakers (Lebanon, Syria, Jordan, Palestine)", "Nimeni ca limbă maternă", "No one as a mother tongue"],
  ["Gramatică", "Grammar", "Simplificată, fără cazuri", "Simplified, no cases", "Complexă, cu cazuri și forme duale", "Complex, with cases and dual forms"],
  ["Timp până la conversație", "Time to conversation", "~4–6 luni", "~4–6 months", "~12–18 luni (și rar folosită în vorbire)", "~12–18 months (and rarely used in speech)"],
  ["Scriere", "Writing", "Rar; adesea în transliterație latină", "Rare; often in Latin transliteration", "Standard, în alfabet arab", "Standard, in the Arabic alphabet"],
  ["Ideală pentru", "Ideal for", "Comunicare, cultură, familie", "Communication, culture, family", "Studiu academic, citit, contexte formale", "Academic study, reading, formal contexts"],
];

const ArabaLibanezaVsArabaStandard = () => {
  const { lang } = useI18n();
  const en = lang === "en";
  return (
    <BlogArticleLayout
      slug="araba-libaneza-vs-araba-standard"
      title={{ ro: "Araba libaneză vs araba standard (MSA): ce înveți?", en: "Lebanese Arabic vs Standard Arabic (MSA): which to learn?" }}
      description={{
        ro: "Comparație clară între araba libaneză (dialect) și araba standard (Fusha/MSA): utilizări practice, dificultate, context cultural și ce curs să alegi.",
        en: "A clear comparison between Lebanese Arabic (dialect) and Standard Arabic (Fusha/MSA): practical uses, difficulty, cultural context and which course to choose.",
      }}
      published="2026-07-15"
      readingMinutes={7}
      crumb={{ ro: "Libaneză vs standard", en: "Lebanese vs Standard" }}
      lead={{
        ro: "Nu există „o singură arabă”. Există o limbă scrisă (Fusha / MSA) și zeci de dialecte vorbite. Alegerea corectă depinde de ce vrei să faci cu limba — călătorii, familie, muncă, studiu academic sau muzică și seriale.",
        en: "There's no 'single Arabic'. There's a written language (Fusha / MSA) and dozens of spoken dialects. The right choice depends on what you want to do with the language — travel, family, work, academic study, or music and series.",
      }}
      cta={{
        title: { ro: "Nesigur pe care să o alegi? Începe cu un test gratuit.", en: "Not sure which to choose? Start with a free test." },
        text: {
          ro: "Îți recomandăm nivelul și formatul potrivit — libaneză, Fusha sau combinația care se potrivește obiectivelor tale.",
          en: "We'll recommend the right level and format — Lebanese, Fusha or the combination that fits your goals.",
        },
        href: "/quiz",
        label: { ro: "Fă testul de nivel", en: "Take the level test" },
      }}
    >
      <aside className="rounded-lg border border-border bg-muted/40 p-5 [&_a]:no-underline">
        <h2 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wide mt-0">
          {en ? "What you'll learn" : "Ce vei afla"}
        </h2>
        <ol className="list-decimal list-inside space-y-1 text-sm text-foreground/80">
          <li><a href="#definitii" className="hover:text-primary">{en ? "What Fusha is and what Lebanese is" : "Ce este Fusha și ce este libaneza"}</a></li>
          <li><a href="#utilizari" className="hover:text-primary">{en ? "Practical uses: when to use each" : "Utilizări practice: când folosești fiecare"}</a></li>
          <li><a href="#dificultate" className="hover:text-primary">{en ? "Which is harder to learn" : "Care e mai grea de învățat"}</a></li>
          <li><a href="#cultura" className="hover:text-primary">{en ? "Cultural context and media" : "Context cultural și media"}</a></li>
          <li><a href="#comparatie" className="hover:text-primary">{en ? "Quick comparison table" : "Tabel comparativ rapid"}</a></li>
          <li><a href="#alegere" className="hover:text-primary">{en ? "What you should choose" : "Ce ar trebui să alegi"}</a></li>
        </ol>
      </aside>

      <section id="definitii" className="scroll-mt-24 space-y-4">
        <h2>{en ? "1. What Standard Arabic (MSA / Fusha) is and what Lebanese is" : "1. Ce este araba standard (MSA / Fusha) și ce este libaneza"}</h2>
        <p>
          <strong>{en ? "Modern Standard Arabic" : "Araba standard modernă"}</strong> {en ? "(MSA, or 'Fusha' in Arabic) is the written, official form of the language, used across the Arab world in news, newspapers, books, legal documents and religious sermons. It's a learned language — no one speaks it natively at home." : "(MSA, sau „Fusha” în arabă) este forma scrisă și oficială a limbii, folosită în toată lumea arabă în știri, ziare, cărți, documente juridice și predici religioase. Este o limbă învățată — nimeni nu o vorbește nativ acasă."}
        </p>
        <p>
          <strong>{en ? "Lebanese Arabic" : "Araba libaneză"}</strong> {en ? "is the dialect spoken daily in Lebanon (part of the Levantine family, together with Syrian, Jordanian and Palestinian Arabic). It's the language of family, friends, music and series — but is almost never written in its pure form." : "este dialectul vorbit zilnic în Liban (parte din familia levantină, împreună cu araba siriană, iordaniană și palestiniană). Este limba mamei, a prietenilor, a muzicii și a serialelor — dar aproape că nu se scrie în forma sa pură."}
        </p>
        <p>
          {en ? "The difference isn't like 'literary English' versus 'spoken English': it's closer to the difference between Latin and Italian — two related registers, but with distinct vocabulary, grammar and pronunciation." : "Diferența nu este ca între „română literară” și „română vorbită”: este mai apropiată de diferența între latină și italiană — două registre înrudite, dar cu vocabular, gramatică și pronunție distincte."}
        </p>
      </section>

      <section id="utilizari" className="scroll-mt-24 space-y-4">
        <h2>{en ? "2. Practical uses: when to use each" : "2. Utilizări practice: când folosești fiecare"}</h2>
        <p><strong>{en ? "Choose Lebanese if you want to:" : "Alege libaneza dacă vrei să:"}</strong></p>
        <ul>
          <li>{en ? "talk with Lebanese family, a partner or friends;" : "vorbești cu familia, partenerul sau prietenii libanezi;"}</li>
          <li>{en ? "travel to Lebanon, Syria, Jordan or Palestine;" : "călătorești în Liban, Siria, Iordania sau Palestina;"}</li>
          <li>{en ? "understand music (Fairuz, Nancy Ajram, Mashrou' Leila) and popular series;" : "înțelegi muzică (Fairuz, Nancy Ajram, Mashrou' Leila) și seriale populare;"}</li>
          <li>{en ? "use the language on TikTok, Instagram or in informal conversations;" : "folosești limba pe TikTok, Instagram sau în conversații informale;"}</li>
          <li>{en ? "reach real conversations in months, not years." : "ajungi la conversații reale în luni, nu în ani."}</li>
        </ul>
        <p><strong>{en ? "Choose Fusha (MSA) if you want to:" : "Alege Fusha (MSA) dacă vrei să:"}</strong></p>
        <ul>
          <li>{en ? "read newspapers, books or religious texts;" : "citești ziare, cărți sau texte religioase;"}</li>
          <li>{en ? "pursue academic studies or work in diplomacy / official translation;" : "urmezi studii academice sau lucrezi în diplomație / traduceri oficiale;"}</li>
          <li>{en ? "follow news broadcasts (Al Jazeera, BBC Arabic);" : "urmărești buletine de știri (Al Jazeera, BBC Arabic);"}</li>
          <li>{en ? "have a solid base for later understanding other dialects in writing." : "ai o bază solidă pentru a înțelege ulterior alte dialecte în scris."}</li>
        </ul>
        <p>
          {en ? "In practice, most adults learning Arabic for real communication start with " : "În practică, cei mai mulți adulți care învață arabă pentru comunicare reală încep cu "}
          <strong>{en ? "a dialect" : "un dialect"}</strong>{en ? " — and add Fusha later, if needed." : " — și adaugă Fusha mai târziu, dacă e nevoie."}
        </p>
      </section>

      <section id="dificultate" className="scroll-mt-24 space-y-4">
        <h2>{en ? "3. Which is harder to learn?" : "3. Care e mai grea de învățat?"}</h2>
        <p>
          {en ? "Both share challenges for an English speaker: the 'hard' sounds (" : "Ambele au provocări comune pentru un vorbitor de română: sunetele „grele” ("}
          <strong>ع, ح, ق</strong>{en ? "), right-to-left writing and a vocabulary with no common roots to European languages." : "), scrierea de la dreapta la stânga și un vocabular fără rădăcini comune cu limbile latine."}
        </p>
        <p>
          {en ? "Beyond that, " : "Dincolo de asta, "}
          <strong>{en ? "Fusha is significantly harder" : "Fusha este semnificativ mai grea"}</strong>{en ? " for a beginner:" : " pentru un începător:"}
        </p>
        <ul>
          <li><strong>{en ? "Grammatical cases" : "Cazuri gramaticale"}</strong>{en ? " (nominative, accusative, genitive) marked with endings — Lebanese doesn't use them." : " (nominativ, acuzativ, genitiv) care se marchează cu terminații — libaneza nu le folosește."}</li>
          <li><strong>{en ? "Dual conjugations and more complex verb forms" : "Conjugări duale și forme verbale"}</strong>{en ? "; Lebanese has a regularised system, closer to everyday speech." : " mai complexe; libaneza are un sistem regularizat, mai apropiat de vorbirea zilnică."}</li>
          <li><strong>{en ? "Formal vocabulary" : "Vocabular formal"}</strong>{en ? ", heard far less often — hard to retain without constant exposure." : ", mult mai rar auzit — greu de reținut fără expunere constantă."}</li>
        </ul>
        <p>
          {en ? "With " : "Cu "}
          <strong>{en ? "2–3 hours of study a week" : "2–3 ore de studiu pe săptămână"}</strong>{en ? ", a beginner can hold simple conversations in Lebanese in 4–6 months. The same 'conversational' level in Fusha usually takes 2–3 times longer, because Fusha isn't used in conversation — so real practice is missing." : ", un începător poate purta conversații simple în libaneză în 4–6 luni. Același nivel „de conversație” în Fusha ia de obicei de 2–3 ori mai mult, fiindcă Fusha nu se folosește în conversație — deci practica reală lipsește."}
        </p>
      </section>

      <section id="cultura" className="scroll-mt-24 space-y-4">
        <h2>{en ? "4. Cultural context: why Lebanese is 'media-friendly'" : "4. Context cultural: de ce libaneza e „media-friendly”"}</h2>
        <p>
          {en ? "For decades, Lebanon has produced an enormous amount of cultural content in dialect — from the music of " : "Libanul a produs, timp de decenii, o cantitate uriașă de conținut cultural în dialect — de la muzica lui "}
          <strong>Fairuz</strong>{en ? " and the Rahbani brothers, to soap operas broadcast across the Arab world and TikTok and YouTube creators. The Lebanese dialect is widely understood across the region, even by Egyptian or Gulf Arabic speakers." : " și a fraților Rahbani, la telenovele difuzate în toată lumea arabă și creatori de conținut de pe TikTok și YouTube. Dialectul libanez este înțeles pe scară largă în întreaga regiune, chiar și de vorbitori de arabă egipteană sau din Golf."}
        </p>
        <p>
          {en ? "Modern Lebanese also carries strong influences from " : "Libaneza modernă poartă și influențe puternice din "}
          <strong>{en ? "French, English, Aramaic and Turkish" : "franceză, engleză, aramaică și turcă"}</strong>{en ? ", and in Beirut you routinely hear sentences like " : ", iar în Beirut auzi curent propoziții precum "}
          <em>„Hi, kifak? Ça va?”</em>. {en ? "It's a language with personality — and a window into a living culture, not just written texts." : "Este o limbă cu personalitate — și o fereastră către o cultură vie, nu doar către texte scrise."}
        </p>
      </section>

      <section id="comparatie" className="scroll-mt-24 space-y-4">
        <h2>{en ? "5. Quick comparison table" : "5. Tabel comparativ rapid"}</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border border-border">
            <thead className="bg-muted/50 text-foreground">
              <tr>
                <th className="text-left p-3 border-b border-border">{en ? "Criterion" : "Criteriu"}</th>
                <th className="text-left p-3 border-b border-border">{en ? "Lebanese (dialect)" : "Libaneză (dialect)"}</th>
                <th className="text-left p-3 border-b border-border">Fusha / MSA</th>
              </tr>
            </thead>
            <tbody className="text-foreground/80">
              {COMPARE.map(([critRo, critEn, lebRo, lebEn, msaRo, msaEn]) => (
                <tr key={critEn}>
                  <td className="p-3 border-b border-border font-medium">{en ? critEn : critRo}</td>
                  <td className="p-3 border-b border-border">{en ? lebEn : lebRo}</td>
                  <td className="p-3 border-b border-border">{en ? msaEn : msaRo}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section id="alegere" className="scroll-mt-24 space-y-4">
        <h2>{en ? "6. What should you choose?" : "6. Ce ar trebui să alegi?"}</h2>
        <p>{en ? "A practical rule for adults who want to learn Arabic:" : "Regula practică pentru adulții din România care vor să învețe arabă:"}</p>
        <ul>
          <li>
            <strong>{en ? "You want to speak" : "Vrei să vorbești"}</strong>{en ? " — with family, on holiday, on social media, at work with Lebanese clients → start with " : " — cu familia, în vacanță, pe social media, la muncă cu clienți libanezi → începe cu "}
            <strong>{en ? "Lebanese Arabic" : "araba libaneză"}</strong>. {en ? "Progress shows within weeks." : "Progresul se simte în câteva săptămâni."}
          </li>
          <li>
            <strong>{en ? "You want to read and write" : "Vrei să citești și să scrii"}</strong>{en ? " — for academic study, the Quran, newspapers, official contexts → start with " : " — pentru studii academice, Coran, ziare, contexte oficiale → începe cu "}
            <strong>Fusha (MSA)</strong>.
          </li>
          <li>
            <strong>{en ? "You want both" : "Vrei ambele"}</strong>{en ? " — start with Lebanese (fast results, motivation), and add Fusha after 6–12 months once the phonetic and vocabulary base is formed." : " — începe cu libaneza (rezultate rapide, motivație), și adaugă Fusha după 6–12 luni când baza fonetică și de vocabular este deja formată."}
          </li>
        </ul>
        <p>
          {en ? "At the " : "La "}
          <strong>{en ? "Lebanese Arabic Center with Ibra" : "Centrul de Arabă Libaneză cu Ibra"}</strong>{en ? " we teach the Lebanese dialect " : " predăm "}
          <em>{en ? "directly" : "direct"}</em>{en ? ", with a native teacher, for adults and children — in person in Bucharest or online. We integrate Fusha gradually from level B1, when it's truly useful." : " dialectul libanez, cu profesor nativ, pentru adulți și copii — fizic în București sau online. Fusha o integrăm treptat de la nivelul B1, când e cu adevărat utilă."}
        </p>
        <p>{en ? "Concrete steps:" : "Pași concreți:"}</p>
        <ul>
          <li>
            {en ? "Take the " : "Fă "}
            <Link to="/quiz">{en ? "free level test" : "testul de nivel gratuit"}</Link>{en ? " to find where you start." : " ca să afli de unde pornești."}
          </li>
          <li>
            {en ? "See the " : "Vezi "}
            <Link to="/cursuri/grup">{en ? "group courses" : "cursurile de grup"}</Link>{en ? " (structured on CEFR levels A1–C2) or " : " (structurate pe niveluri CEFR A1–C2) sau "}
            <Link to="/cursuri/private">{en ? "private lessons" : "lecțiile private"}</Link>{en ? " (personalised pace)." : " (ritm personalizat)."}
          </li>
          <li>
            {en ? "For kids, we have a " : "Pentru copii, avem un "}
            <Link to="/cursuri/copii">{en ? "dedicated programme" : "program dedicat"}</Link>{en ? " in person in Bucharest." : " fizic în București."}
          </li>
          <li>
            {en ? "See also the article " : "Vezi și articolul "}
            <Link to="/blog/cum-inveti-araba-libaneza">{en ? "How to learn Lebanese Arabic in 2026" : "Cum înveți araba libaneză în 2026"}</Link>{en ? " for a step-by-step guide." : " pentru un ghid pas cu pas."}
          </li>
        </ul>
      </section>
    </BlogArticleLayout>
  );
};

export default ArabaLibanezaVsArabaStandard;
