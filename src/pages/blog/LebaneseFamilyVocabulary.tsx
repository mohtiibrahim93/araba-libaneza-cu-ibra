import { Link } from "@/components/LocalizedLink";
import BlogArticleLayout from "@/components/blog/BlogArticleLayout";
import { Tldr, InlineCta } from "@/components/blog/ArticleKit";
import { useI18n } from "@/lib/i18n";

type Row = { arabizi: string; arabic: string; en: string; ro: string };

const CORE: Row[] = [
  { arabizi: "eyle", arabic: "عيلة", en: "family", ro: "familie" },
  { arabizi: "bayy / baba", arabic: "بيّ / بابا", en: "father / dad", ro: "tată / tata" },
  { arabizi: "em / mama", arabic: "إم / ماما", en: "mother / mum", ro: "mamă / mama" },
  { arabizi: "akh", arabic: "أخ", en: "brother", ro: "frate" },
  { arabizi: "ekht", arabic: "أخت", en: "sister", ro: "soră" },
  { arabizi: "jeddi", arabic: "جدّي", en: "my grandfather", ro: "bunicul meu" },
  { arabizi: "sitto / teta", arabic: "ستّو / تيتا", en: "grandmother", ro: "bunica" },
  { arabizi: "3ammi", arabic: "عمّي", en: "my paternal uncle", ro: "unchiul meu (din partea tatălui)" },
  { arabizi: "3ammti", arabic: "عمّتي", en: "my paternal aunt", ro: "mătușa mea (din partea tatălui)" },
  { arabizi: "5ali", arabic: "خالي", en: "my maternal uncle", ro: "unchiul meu (din partea mamei)" },
  { arabizi: "5alti", arabic: "خالتي", en: "my maternal aunt", ro: "mătușa mea (din partea mamei)" },
  { arabizi: "ibn 3ammi", arabic: "ابن عمّي", en: "my (paternal) cousin — m", ro: "vărul meu (partea tatălui)" },
  { arabizi: "bint 3ammi", arabic: "بنت عمّي", en: "my (paternal) cousin — f", ro: "verișoara mea (partea tatălui)" },
];

const INLAWS: Row[] = [
  { arabizi: "jouz / mart", arabic: "جوز / مرت", en: "husband / wife", ro: "soț / soție" },
  { arabizi: "3aris / 3aroos", arabic: "عريس / عروس", en: "groom / bride", ro: "mire / mireasă" },
  { arabizi: "7amii / 7ameeti", arabic: "حماي / حماتي", en: "my father/mother in-law", ro: "socrul / soacra mea" },
  { arabizi: "sihri", arabic: "صهري", en: "my brother-in-law", ro: "cumnatul meu" },
  { arabizi: "silfeti", arabic: "سلفتي", en: "my sister-in-law", ro: "cumnata mea" },
  { arabizi: "ibni / binti", arabic: "ابني / بنتي", en: "my son / daughter", ro: "fiul / fiica mea" },
  { arabizi: "jaddi / stiddi", arabic: "جدّي / ستّي", en: "my grandpa / grandma", ro: "bunicul / bunica mea" },
  { arabizi: "7afeed / 7afeede", arabic: "حفيد / حفيدة", en: "grandson / granddaughter", ro: "nepot / nepoată" },
];

const POSSESS: Row[] = [
  { arabizi: "bayyi", arabic: "بيّي", en: "my dad", ro: "tatăl meu" },
  { arabizi: "bayyak / bayyik", arabic: "بيّك", en: "your dad (m/f)", ro: "tatăl tău" },
  { arabizi: "bayyo", arabic: "بيّو", en: "his dad", ro: "tatăl lui" },
  { arabizi: "bayya", arabic: "بيّا", en: "her dad", ro: "tatăl ei" },
  { arabizi: "bayyna", arabic: "بيّنا", en: "our dad", ro: "tatăl nostru" },
  { arabizi: "bayykon", arabic: "بيّكن", en: "your (pl) dad", ro: "tatăl vostru" },
  { arabizi: "bayyon", arabic: "بيّن", en: "their dad", ro: "tatăl lor" },
];

const PHRASES = [
  { en: "This is my mother — hayde emmi.", ro: "Aceasta e mama mea — hayde emmi.", ar: "هيدي إمّي" },
  { en: "My brother lives in Beirut — akhi 3aayesh bi Bayrout.", ro: "Fratele meu locuiește la Beirut — akhi 3aayesh bi Bayrout.", ar: "أخي عايش ببيروت" },
  { en: "I have two sisters — 3andi ekhtayn.", ro: "Am două surori — 3andi ekhtayn.", ar: "عندي أختين" },
  { en: "My grandma is Lebanese — sitti Lebnaniyye.", ro: "Bunica mea e libaneză — sitti Lebnaniyye.", ar: "ستّي لبنانية" },
  { en: "Say hi to your family — sallem 3a eyltak.", ro: "Salută familia ta — sallem 3a eyltak.", ar: "سلّم ع عيلتك" },
];

// Questions specific to this article; anything answered elsewhere on the
// site stays there, so the same answer never lives on two URLs.
const FAQ = [
  {
    q: { ro: "De ce are libaneza cuvinte diferite pentru unchiul din partea mamei și a tatălui?", en: "Why does Lebanese have different words for a maternal and a paternal uncle?" },
    a: { ro: "Pentru că cele două ramuri ale familiei au roluri sociale distincte, iar limba le marchează explicit. Nu e o subtilitate: sunt cuvinte complet diferite, pe care le folosește toată lumea.", en: "Because the two sides of the family have distinct social roles, and the language marks them explicitly. It is not a subtlety: they are entirely different words that everyone uses." },
  },
  {
    q: { ro: "Cum mă adresez politicos părinților partenerului?", en: "How do I politely address my partner's parents?" },
    a: { ro: "Există formule dedicate pentru socri, diferite de cele pentru propriii părinți. Folosirea lor corectă de la prima întâlnire e observată imediat și contează mult mai mult decât fluența.", en: "There are dedicated terms for parents-in-law, different from those for your own parents. Using them correctly at a first meeting is noticed immediately and counts for far more than fluency." },
  },
  {
    q: { ro: "Se folosesc aceleași cuvinte pentru rude apropiate și îndepărtate?", en: "Are the same words used for close and distant relatives?" },
    a: { ro: "Nu chiar. Termenii de familie se extind adesea și către prieteni apropiați sau vecini, ca semn de afecțiune — cineva poate fi numit „unchi” fără nicio legătură de sânge.", en: "Not quite. Family terms are often extended to close friends and neighbours as a mark of affection — someone can be called \"uncle\" with no blood relation at all." },
  },
];

const LebaneseFamilyVocabulary = () => {
  const { lang } = useI18n();
  const en = lang === "en";

  const Table = ({ rows, title }: { rows: Row[]; title: string }) => (
    <section className="space-y-3">
      <h2>{title}</h2>
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left">
            <tr>
              <th className="p-3 font-semibold">Arabizi</th>
              <th className="p-3 font-semibold" dir="rtl">عربي</th>
              <th className="p-3 font-semibold">{en ? "English" : "Română"}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.arabizi + r.en} className="border-t border-border">
                <td className="p-3 font-mono">{r.arabizi}</td>
                <td className="p-3" dir="rtl">{r.arabic}</td>
                <td className="p-3 text-muted-foreground">{en ? r.en : r.ro}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );

  return (
    <BlogArticleLayout
      slug="lebanese-family-vocabulary"
      title={{
        ro: "Familia în araba libaneză: vocabular complet",
        en: "Family vocabulary in Lebanese Arabic (core, extended, in-laws)",
      }}
      description={{
        ro: "Vocabularul complet al familiei în araba libaneză: părinți, frați, bunici, unchi/mătuși (mamă vs tată), veri, socri, plus pronumele posesive.",
        en: "The complete family vocabulary in Lebanese Arabic: parents, siblings, grandparents, uncles/aunts (paternal vs maternal), cousins, in-laws, plus possessive pronouns. Arabizi + Arabic script.",
      }}
      published="2026-07-24"
      readingMinutes={6}
      faq={FAQ}
      crumb={{ ro: "Familia în libaneză", en: "Lebanese family vocabulary" }}
      lead={{
        ro: "Familia e primul subiect real de conversație în orice limbă. În libaneză contează chiar mai mult — și distincția între rudele din partea mamei și din partea tatălui e centrală.",
        en: "Family is the first real conversation topic in any language. In Lebanese it matters even more — and the distinction between maternal and paternal relatives is central.",
      }}
    >
      <Tldr
        points={[
          { ro: "Libaneza distinge rudele din partea mamei de cele din partea tatălui cu cuvinte diferite.", en: "Lebanese distinguishes maternal from paternal relatives with entirely different words." },
          { ro: "Există formule dedicate pentru socri, diferite de cele pentru proprii părinți.", en: "There are dedicated terms for parents-in-law, different from those for your own parents." },
          { ro: "Termenii de familie se extind afectuos și către prieteni sau vecini.", en: "Family terms extend affectionately to friends and neighbours too." },
          { ro: "Familia e primul subiect real de conversație — de aceea vocabularul ăsta se plătește repede.", en: "Family is the first real conversation topic — which is why this vocabulary pays off quickly." },
        ]}
      />
      <p>
        {en
          ? "One thing that surprises most learners: Lebanese Arabic distinguishes maternal from paternal uncles and aunts. 3ammi is your dad's brother; 5ali is your mum's brother. There's no single word for ‘uncle’ — you always specify the side."
          : "Un lucru care surprinde majoritatea începătorilor: araba libaneză distinge unchii/mătușile din partea mamei de cele din partea tatălui. 3ammi e fratele tatălui tău; 5ali e fratele mamei tale. Nu există un cuvânt unic pentru „unchi” — specifici mereu partea."}
      </p>

      <Table rows={CORE} title={en ? "Core family" : "Familia nucleu"} />
      <Table rows={INLAWS} title={en ? "Spouses, in-laws, grandchildren" : "Soți, socri, nepoți"} />
      <Table rows={POSSESS} title={en ? "Possessive endings — ‘my/your/his…’" : "Terminații posesive — „al meu / al tău / al lui …”"} />

      <h2>{en ? "Useful family sentences" : "Propoziții utile despre familie"}</h2>
      <ul>
        {PHRASES.map((p) => (
          <li key={p.en}>
            <span dir="rtl" className="mr-2 font-medium">{p.ar}</span>
            — {en ? p.en : p.ro}
          </li>
        ))}
      </ul>

      <InlineCta
        title={{ ro: "Vocabular pentru familia ta, nu pentru un manual", en: "Vocabulary for your family, not a textbook" }}
        text={{
          ro: "La lecțiile 1:1 adaptăm materialul exact la relațiile și situațiile tale — soacră, cumnați, mese de duminică.",
          en: "In 1-on-1 lessons the material is shaped around your actual relatives and situations.",
        }}
        href="/cursuri/private"
        label={{ ro: "Vezi lecțiile private", en: "See private lessons" }}
      />


      <h2>{en ? "Cultural notes" : "Note culturale"}</h2>
      <ul>
        <li>
          {en
            ? "Family greetings matter: after ‘kifak?’ (how are you), the next question is almost always ‘kif el eyle?’ (how's the family?)."
            : "Salutările despre familie contează: după „kifak?” (ce faci?), următoarea întrebare e aproape mereu „kif el eyle?” (ce face familia?)."}
        </li>
        <li>
          {en
            ? "Elders are addressed with ‘3ammo’ / ‘khalto’ (uncle/aunt) even when unrelated — it's a sign of respect."
            : "Bătrânii sunt numiți „3ammo” / „khalto” (unchi/mătușă) chiar dacă nu sunt rude — e semn de respect."}
        </li>
        <li>
          {en
            ? "The word ‘eyle’ (family) usually means the extended family, not just the nuclear one."
            : "Cuvântul „eyle” (familie) înseamnă de obicei familia extinsă, nu doar cea nucleu."}
        </li>
      </ul>

      <p>
        {en
          ? "Family vocabulary is the one area where a generic word list rarely fits: what you need depends on who your relatives actually are. In "
          : "Vocabularul de familie e zona în care o listă generală rareori se potrivește: ai nevoie de cuvintele legate de rudele tale. La "}
        <Link to="/cursuri/private">{en ? "one-on-one lessons" : "lecțiile private 1:1"}</Link>
        {en
          ? " the material is built around your own family — and around the situations you will actually be in."
          : " materialul se construiește în jurul familiei tale — și al situațiilor în care chiar ajungi."}
      </p>

      <p>
        {en ? "Related:" : "Alte articole utile:"}{" "}
        <Link to="/blog/lebanese-arabic-phrases">{en ? "35+ daily-life phrases" : "35+ expresii zilnice"}</Link>{" · "}
        <Link to="/blog/cultura-libaneza-obiceiuri-mancare-traditii">{en ? "Lebanese culture guide" : "Ghid de cultură libaneză"}</Link>.
      </p>
    </BlogArticleLayout>
  );
};

export default LebaneseFamilyVocabulary;