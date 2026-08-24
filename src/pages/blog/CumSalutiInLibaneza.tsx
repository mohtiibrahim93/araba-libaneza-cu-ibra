import { Link } from "react-router-dom";
import BlogArticleLayout from "@/components/blog/BlogArticleLayout";
import { useI18n } from "@/lib/i18n";

// [arabizi, arabic, ro-meaning, en-meaning]
const GREETINGS: [string, string, string, string][] = [
  ["Mar7aba", "مرحبا", "Salut / Bună (universal, orice moment)", "Hi / Hello (universal, any time)"],
  ["Ahla w sahla", "أهلا وسهلا", "Bine ai venit", "Welcome"],
  ["Saba7 el kheir", "صباح الخير", "Bună dimineața", "Good morning"],
  ["Saba7 el noor", "صباح النور", "Răspuns la „bună dimineața”", "Reply to 'good morning'"],
  ["Masa el kheir", "مساء الخير", "Bună seara", "Good evening"],
  ["Kifak? (m) / Kifik? (f)", "كيفك؟", "Ce faci?", "How are you?"],
  ["Mnee7, il7amdillah", "منيح، الحمد لله", "Bine, slavă Domnului", "Good, thank God"],
  ["Yalla bye", "يلا باي", "Hai, pa (informal, foarte folosit)", "Bye (informal, very common)"],
  ["Bshoufak (m) / Bshoufik (f)", "بشوفك", "Ne vedem / Pe curând", "See you / Soon"],
];

const CumSalutiInLibaneza = () => {
  const { lang } = useI18n();
  const en = lang === "en";
  return (
    <BlogArticleLayout
      slug="cum-saluti-in-libaneza"
      title={{ ro: "Cum saluți în arabă libaneză: mar7aba, kifak, yalla bye", en: "How to greet in Lebanese Arabic: mar7aba, kifak, yalla bye" }}
      description={{
        ro: "Toate formulele de salut în arabă libaneză (levantină): bună dimineața, ce faci, bine ai venit, pa — cu pronunție, grafie arabă și când se folosește fiecare.",
        en: "All the greetings in Lebanese Arabic: good morning, how are you, welcome, bye — with Arabizi pronunciation, Arabic script and when to use each.",
      }}
      published="2026-07-16"
      readingMinutes={4}
      crumb={{ ro: "Cum saluți în libaneză", en: "How to greet in Lebanese" }}
      lead={{
        ro: "De la „mar7aba” la „yalla bye” — formulele de salut pe care le auzi zilnic în Liban, cu pronunție și context.",
        en: "From 'mar7aba' to 'yalla bye' — the greetings you hear daily in Lebanon, with pronunciation and context.",
      }}
    >
      <p>
        {en
          ? "Greetings are your first interaction in any language — and in Lebanese they're warm and expressive. The good news: a handful of phrases take you a long way. Here are the most common ones, with "
          : "Salutul este prima ta interacțiune în orice limbă — și în libaneză e cald și expresiv. Vestea bună: câteva formule te duc foarte departe. Iată-le pe cele mai folosite, cu "}
        <Link to="/blog/ce-este-arabizi">{en ? "Arabizi" : "arabizi"}</Link>
        {en ? " pronunciation and Arabic script." : " și scriere arabă."}
      </p>

      <h2>{en ? "The essential phrases" : "Formulele esențiale"}</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-border text-left text-muted-foreground">
              <th className="py-2 pr-3 font-semibold">Arabizi</th>
              <th className="py-2 px-3 font-semibold">{en ? "Arabic" : "Arabă"}</th>
              <th className="py-2 pl-3 font-semibold">{en ? "When / meaning" : "Când / ce înseamnă"}</th>
            </tr>
          </thead>
          <tbody>
            {GREETINGS.map(([arabizi, arabic, ro, enM]) => (
              <tr key={arabizi} className="border-b border-border/60 align-top">
                <td className="py-2.5 pr-3 font-semibold text-foreground whitespace-nowrap">{arabizi}</td>
                <td className="py-2.5 px-3 font-arabic text-lg text-brand-green" dir="rtl" lang="ar">{arabic}</td>
                <td className="py-2.5 pl-3 text-foreground/80">{en ? enM : ro}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2>{en ? "Masculine or feminine — mind the ending" : "Masculin sau feminin — atenție la terminație"}</h2>
      <p>
        {en
          ? "Notice 'Kifak?' vs 'Kifik?'. In Lebanese, when you address someone the form changes with their gender: -ak for men, -ik for women. It's a simple rule that shows up everywhere and you pick it up quickly by speaking."
          : "Ai observat „Kifak?” vs „Kifik?”. În libaneză, când te adresezi cuiva, forma se schimbă după genul persoanei: -ak pentru bărbați, -ik pentru femei. E o regulă simplă care apare peste tot și pe care o prinzi repede vorbind."}
      </p>

      <h2>{en ? "'7' and 'kh' — how to pronounce them" : "„7” și „kh” — cum le pronunți"}</h2>
      <p>
        {en
          ? "In 'saba7' and 'el kheir' there are guttural sounds specific to Arabic. The number 7 is a strong 'h' from the throat, and 'kh' is like the 'ch' in German 'Bach'. Don't worry if they don't come out at first — in a lesson you hear them from a native speaker and repeat them on the spot."
          : "În „saba7” și „el kheir” apar sunete guturale specifice arabei. Cifra 7 este un „h” puternic din gât, iar „kh” seamănă cu „ch” din germana „Bach”. Nu-ți face griji dacă nu-ți ies din prima — la o lecție le auzi de la un vorbitor nativ și le repeți pe loc."}
      </p>

      <h2>{en ? "Practise with a real person" : "Exersează cu cineva real"}</h2>
      <p>
        {en ? "Greetings are learned best by saying them, not reading them. In a " : "Salutările se învață cel mai bine spunându-le, nu citindu-le. La o "}
        <Link to="/trial">{en ? "free trial lesson" : "lecție de probă gratuită"}</Link>
        {en ? " you pronounce them with the teacher and start a first short conversation. See also the " : " le pronunți cu profesorul și pornești o primă conversație scurtă. Vezi și "}
        <Link to="/blog/primele-20-de-expresii-libaneze">{en ? "first 20 Lebanese phrases" : "primele 20 de expresii libaneze"}</Link>
        {en ? " to continue." : " ca să continui."}
      </p>
    </BlogArticleLayout>
  );
};

export default CumSalutiInLibaneza;
