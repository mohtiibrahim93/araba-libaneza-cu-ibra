import { Link } from "react-router-dom";
import BlogArticleLayout from "@/components/blog/BlogArticleLayout";
import { Tldr, InlineCta } from "@/components/blog/ArticleKit";
import { useI18n } from "@/lib/i18n";

// [level-ro, level-en, duration, can-do-ro, can-do-en]
const LEVELS: [string, string, string, string, string][] = [
  ["A1 — Începător", "A1 — Beginner", "~4 luni / ~4 months", "Te descurci în situații simple de zi cu zi: saluturi, cumpărături, prezentări.", "You manage simple everyday situations: greetings, shopping, introductions."],
  ["A2 — Elementar", "A2 — Elementary", "~6–7 luni / months", "Conversații despre subiecte familiare, trecut și viitor, opinii simple.", "Conversations on familiar topics, past and future, simple opinions."],
  ["B1 — Intermediar", "B1 — Intermediate", "~8–9 luni / months", "Vorbești liber despre experiențe, planuri, povești; înțelegi discuții normale.", "You speak freely about experiences, plans, stories; you follow normal discussions."],
  ["B2 — Intermediar avansat", "B2 — Upper-intermediate", "~9 luni / months", "Comunicare naturală, nuanțe culturale, subiecte abstracte.", "Natural communication, cultural nuance, abstract topics."],
  ["C1–C2 — Avansat", "C1–C2 — Advanced", "~10 luni fiecare / each", "Fluență apropiată de nativ, umor, registre diferite.", "Near-native fluency, humour, different registers."],
];

// Questions specific to this article; anything answered elsewhere on the
// site stays there, so the same answer never lives on two URLs.
const FAQ = [
  {
    q: { ro: "Cât durează nivelul A1?", en: "How long does level A1 take?" },
    a: { ro: "Aproximativ 4 luni, adică 32 de lecții, cu două ședințe de 90 de minute pe săptămână. La final porți conversații de supraviețuire: te prezinți, comanzi, ceri indicații.", en: "About 4 months, or 32 lessons, at two 90-minute sessions a week. By the end you handle survival conversations: introducing yourself, ordering, asking for directions." },
  },
  {
    q: { ro: "Pot învăța mai repede dacă fac lecții private?", en: "Can I learn faster with private lessons?" },
    a: { ro: "De obicei da, pentru că întreaga ședință e despre tine: vorbești mai mult și primești corectură pe fiecare greșeală. Ritmul se adaptează, dar timpul de expunere rămâne factorul principal.", en: "Usually yes, because the whole session is about you: you speak more and get corrected on every mistake. The pace adapts, but exposure time remains the main factor." },
  },
  {
    q: { ro: "De ce unii progresează mai repede decât alții?", en: "Why do some people progress faster than others?" },
    a: { ro: "Contează cel mai mult regularitatea și expunerea între lecții. Cine ascultă muzică, seriale sau podcasturi în libaneză și exersează câteva minute zilnic avansează vizibil mai repede decât cine studiază doar la curs.", en: "Regularity and exposure between lessons matter most. Learners who listen to Lebanese music, series or podcasts and practise a few minutes daily progress noticeably faster than those who only study in class." },
  },
];

const CatDureaza = () => {
  const { lang } = useI18n();
  const en = lang === "en";
  return (
    <BlogArticleLayout
      slug="cat-dureaza-sa-inveti-araba-libaneza"
      title={{ ro: "Cât durează să înveți arabă libaneză?", en: "How long does it take to learn Lebanese Arabic?" }}
      description={{
        ro: "De cât timp ai nevoie ca să vorbești arabă libaneză: durata pe fiecare nivel (A1–C2), câte ore pe săptămână și ce influențează ritmul. Estimări realiste.",
        en: "How much time you need to speak Lebanese Arabic: duration per level (A1–C2), hours per week and what affects your pace. Realistic estimates.",
      }}
      published="2026-07-16"
      readingMinutes={5}
      faq={FAQ}
      crumb={{ ro: "Cât durează", en: "How long" }}
      lead={{
        ro: "Depinde de nivelul-țintă și de ritm — dar iată estimări realiste pe fiecare nivel, ca să știi la ce să te aștepți.",
        en: "It depends on your target level and pace — but here are realistic estimates per level, so you know what to expect.",
      }}
    >
      <Tldr
        points={[
          { ro: "A1 durează ~4 luni (32 de lecții), cu două ședințe de 90 de minute pe săptămână.", en: "A1 takes about 4 months (32 lessons), at two 90-minute sessions a week." },
          { ro: "Pentru „mă descurc în vacanță” sunt suficiente A1–A2, adică sub un an.", en: "For \"I can manage on holiday\", A1–A2 is enough — under a year." },
          { ro: "Ritmul depinde mai mult de expunerea dintre lecții decât de talent.", en: "Your pace depends more on exposure between lessons than on talent." },
          { ro: "Testul de nivel îți spune în 2 minute de unde pornești.", en: "The level test tells you where you start in 2 minutes." },
        ]}
      />
      <p>
        {en
          ? "'How long?' is the question everyone wants a simple answer to. The honest truth: it depends on how far you want to go and how often you practise. The good news for Lebanese is that, being a spoken dialect, you start communicating from the first lessons — you don't wait months to say something useful."
          : "„Cât durează?” este întrebarea la care toată lumea vrea un răspuns simplu. Adevărul onest: depinde de cât de departe vrei să ajungi și cât de des exersezi. Vestea bună pentru libaneză e că, fiind un dialect vorbit, începi să comunici din primele lecții — nu aștepți luni întregi ca să spui ceva util."}
      </p>

      <h2>{en ? "Duration per level" : "Durata pe fiecare nivel"}</h2>
      <p>
        {en
          ? "At the Lebanese Arabic Center, group courses have 2 lessons per week (90 minutes each). At that pace, here's how long each CEFR level takes:"
          : "La Centrul de Arabă Libaneză, cursurile de grup au 2 lecții pe săptămână (câte 90 de minute). Cu acest ritm, iată cât durează fiecare nivel CEFR:"}
      </p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-border text-left text-muted-foreground">
              <th className="py-2 pr-3 font-semibold">{en ? "Level" : "Nivel"}</th>
              <th className="py-2 px-3 font-semibold">{en ? "Duration" : "Durată"}</th>
              <th className="py-2 pl-3 font-semibold">{en ? "What you can do" : "Ce poți face"}</th>
            </tr>
          </thead>
          <tbody>
            {LEVELS.map(([lvlRo, lvlEn, dur, canRo, canEn]) => (
              <tr key={lvlEn} className="border-b border-border/60 align-top">
                <td className="py-2.5 pr-3 font-semibold text-foreground whitespace-nowrap">{en ? lvlEn : lvlRo}</td>
                <td className="py-2.5 px-3 text-brand-green font-medium whitespace-nowrap">{dur.split(" / ")[0]}</td>
                <td className="py-2.5 pl-3 text-foreground/80">{en ? canEn : canRo}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2>{en ? "What affects your pace" : "Ce influențează ritmul"}</h2>
      <ul>
        <li><strong>{en ? "Frequency" : "Frecvența"}</strong>{en ? " — 2 lessons/week plus a little practice in between speeds things up a lot." : " — 2 lecții/săptămână plus puțină practică între ele accelerează mult."}</li>
        <li><strong>{en ? "Exposure" : "Expunerea"}</strong>{en ? " — music, series, Lebanese friends — any real contact helps." : " — muzică, seriale, prieteni libanezi — orice contact real ajută."}</li>
        <li>
          <strong>{en ? "Format" : "Formatul"}</strong>{" "}
          <Link to="/cursuri/private">{en ? "1:1 private lessons" : "lecțiile private 1:1"}</Link>
          {en ? " go faster for specific goals; the group is more motivating and affordable." : " merg mai repede pentru obiective specifice; grupul e mai motivant și mai accesibil."}
        </li>
        <li><strong>{en ? "The languages you know" : "Limbile pe care le știi"}</strong>{en ? " — if you already know a language with guttural sounds, pronunciation comes easier." : " — dacă știi deja o limbă cu sunete guturale, pronunția vine mai ușor."}</li>
      </ul>

      <h2>{en ? "How long until 'I can manage on holiday'?" : "Cât până „mă descurc în vacanță”?"}</h2>
      <p>
        {en
          ? "To get by on a trip to Lebanon — greetings, restaurant, taxi, shopping — level A1–A2 is enough, so a few months. See the "
          : "Pentru a te descurca într-o călătorie în Liban — saluturi, restaurant, taxi, cumpărături — nivelul A1–A2 este suficient, deci câteva luni. Vezi "}
        <Link to="/blog/primele-20-de-expresii-libaneze">{en ? "first 20 phrases" : "primele 20 de expresii"}</Link>
        {en ? " to start today, or the " : " ca să începi chiar azi, sau "}
        <Link to="/blog/cum-inveti-araba-libaneza">{en ? "complete beginner's guide" : "ghidul complet pentru începători"}</Link>.
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


      <h2>{en ? "How to find your starting point" : "Cum afli de unde pornești"}</h2>
      <p>
        {en ? "If you already know a few words, you can skip A1. Take the " : "Dacă știi deja câteva cuvinte, poți sări peste A1. Fă "}
        <Link to="/quiz">{en ? "free level test" : "testul de nivel gratuit"}</Link>
        {en ? " (2 minutes) or a " : " (2 minute) sau o "}
        <Link to="/trial">{en ? "free trial lesson" : "lecție de probă gratuită"}</Link>
        {en ? " — the teacher tells you exactly where it's best to start." : " — profesorul îți spune exact de unde e cel mai bine să începi."}
      </p>
    </BlogArticleLayout>
  );
};

export default CatDureaza;
