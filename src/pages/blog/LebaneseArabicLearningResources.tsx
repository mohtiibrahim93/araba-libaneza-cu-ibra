import { Link } from "@/components/LocalizedLink";
import BlogArticleLayout from "@/components/blog/BlogArticleLayout";
import { Tldr, InlineCta } from "@/components/blog/ArticleKit";
import { useI18n } from "@/lib/i18n";

type Resource = { name: string; kind: string; en: string; ro: string; url?: string };

const APPS: Resource[] = [
  { name: "Anki (custom Lebanese deck)", kind: "app", en: "Spaced-repetition flashcards. Build your own Lebanese deck from phrases you actually use — generic MSA decks are the wrong dialect.", ro: "Flashcard-uri cu repetiție spațiată. Fă-ți propriul deck libanez din expresii pe care le folosești — deck-urile generice de MSA sunt alt dialect." },
  { name: "Mango Languages — Levantine", kind: "app", en: "One of the very few mainstream apps that teaches Levantine (not MSA). Free via many public libraries.", ro: "Una dintre puținele aplicații mainstream care predă levantină (nu MSA). Gratuită prin multe biblioteci publice." },
  { name: "Pimsleur — Eastern Arabic", kind: "app", en: "Audio-only lessons focused on speaking. Slow but excellent for pronunciation and sentence rhythm.", ro: "Lecții doar audio, axate pe vorbire. Lente, dar excelente pentru pronunție și ritmul propoziției." },
  { name: "Language Reactor", kind: "app", en: "Chrome extension that puts dual subtitles on Netflix and YouTube — perfect for Lebanese series and interviews.", ro: "Extensie Chrome cu subtitrări duble pe Netflix și YouTube — perfectă pentru seriale și interviuri libaneze." },
];

const PODCASTS: Resource[] = [
  { name: "Learn Lebanese Arabic (Hiba Najem)", kind: "youtube", en: "Short YouTube lessons in clear Lebanese, taught by a native speaker. Great for absolute beginners.", ro: "Lecții scurte pe YouTube într-o libaneză clară, predate de o vorbitoare nativă. Excelent pentru începători absoluți." },
  { name: "Maha Arabic (YouTube)", kind: "youtube", en: "Levantine-focused channel with dialogues, vocabulary and grammar mini-lessons.", ro: "Canal axat pe levantină cu dialoguri, vocabular și mini-lecții de gramatică." },
  { name: "Arabic in 60 Steps (Podcast)", kind: "podcast", en: "Bite-sized episodes on Levantine phrases and grammar patterns.", ro: "Episoade scurte despre expresii și tipare gramaticale levantine." },
  { name: "Sowt & Kerning Cultures", kind: "podcast", en: "Arabic-language storytelling podcasts. Not lessons, but real Levantine spoken at native speed — the level you're aiming for.", ro: "Podcasturi narative în arabă. Nu sunt lecții, ci levantină reală la viteza nativilor — nivelul spre care țintești." },
];

const MEDIA: Resource[] = [
  { name: "Al Hayba (series, Netflix)", kind: "tv", en: "Lebanese drama filmed in Baalbek. Heavy Lebanese dialect, iconic accents.", ro: "Dramă libaneză filmată la Baalbek. Dialect libanez pronunțat, accente iconice." },
  { name: "Ruby / Cello / 2020 (Lebanese series)", kind: "tv", en: "Modern Beirut life. Everyday Lebanese with a lot of code-switching to English/French.", ro: "Viața modernă din Beirut. Libaneză de zi cu zi, cu mult code-switching spre engleză/franceză." },
  { name: "Fairuz, Wael Kfoury, Nancy Ajram", kind: "music", en: "Classic and modern Lebanese singers. Fairuz for morning listening (slow, clear), the others for modern pop pronunciation.", ro: "Cântăreți libanezi clasici și moderni. Fairuz pentru ascultare de dimineață (lent, clar), ceilalți pentru pronunție pop modernă." },
  { name: "LBCI / MTV Lebanon (news)", kind: "news", en: "Free live streams. TV news alternates MSA (anchors) with Lebanese (interviews, weather, sports) — good ear training.", ro: "Streaming live gratuit. Știrile TV alternează MSA (prezentatori) cu libaneza (interviuri, vreme, sport) — antrenament excelent pentru ureche." },
];

const BOOKS: Resource[] = [
  { name: "Levantine Arabic Verbs (Aldrich)", kind: "book", en: "The go-to reference for conjugating Levantine verbs across tenses. Dry but complete.", ro: "Referința standard pentru conjugarea verbelor levantine în toate timpurile. Aridă, dar completă." },
  { name: "Spoken Lebanese (Maksoud Feghali)", kind: "book", en: "Classic textbook, pure Lebanese dialect (not Syrian, not Palestinian). Older but the dialogues still hold up.", ro: "Manual clasic, dialect libanez pur (nu sirian, nu palestinian). Mai vechi, dar dialogurile încă funcționează." },
  { name: "Living Arabic Project (dictionary)", kind: "book", en: "Free online Levantine/Egyptian dictionary. Search by root, by dialect, by meaning.", ro: "Dicționar online gratuit levantin/egiptean. Căutare după rădăcină, dialect sau sens." },
];

const Table = ({ rows, lang }: { rows: Resource[]; lang: "en" | "ro" }) => (
  <div className="overflow-x-auto rounded-lg border border-border">
    <table className="w-full text-sm">
      <thead className="bg-muted/50 text-left">
        <tr>
          <th className="p-3 font-semibold">{lang === "en" ? "Resource" : "Resursă"}</th>
          <th className="p-3 font-semibold">{lang === "en" ? "What it is" : "Ce este"}</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.name} className="border-t border-border align-top">
            <td className="p-3 font-medium">{r.name}</td>
            <td className="p-3 text-muted-foreground">{lang === "en" ? r.en : r.ro}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// Questions specific to this article; anything answered elsewhere on the
// site stays there, so the same answer never lives on two URLs.
const FAQ = [
  {
    q: { ro: "De ce majoritatea aplicațiilor predau MSA?", en: "Why do most apps teach MSA?" },
    a: { ro: "Pentru că e standardizată: are o gramatică fixă, manuale și un corpus scris uriaș. Dialectele variază de la țară la țară și n-au ortografie oficială, deci sunt mult mai scumpe de produs.", en: "Because it is standardised: fixed grammar, textbooks and a huge written corpus. Dialects vary from country to country and have no official spelling, so they are far more expensive to produce." },
  },
  {
    q: { ro: "Pot învăța libaneză doar din seriale și muzică?", en: "Can I learn Lebanese from series and music alone?" },
    a: { ro: "Îți antrenează urechea foarte bine și îți dă expresii reale, dar nu îți corectează pronunția și nu îți structurează progresul. Funcționează cel mai bine ca supliment, nu ca sursă unică.", en: "They train your ear very well and give you real expressions, but they cannot correct your pronunciation or structure your progress. They work best as a supplement, not as the only source." },
  },
  {
    q: { ro: "Ce resursă merită prima?", en: "Which resource is worth starting with?" },
    a: { ro: "O listă scurtă de expresii pe care le folosești imediat, plus o sursă audio cu vorbitori nativi. Vocabularul fără sunet te duce la o pronunție pe care nativii o înțeleg greu mai târziu.", en: "A short list of phrases you will use immediately, plus an audio source with native speakers. Vocabulary without sound leads to pronunciation natives struggle to follow later." },
  },
];

const LebaneseArabicLearningResources = () => {
  const { lang } = useI18n();
  const en = lang === "en";
  return (
    <BlogArticleLayout
      slug="lebanese-arabic-learning-resources"
      title={{
        ro: "Resurse pentru araba libaneză: aplicații și podcasturi",
        en: "The best Lebanese Arabic learning resources (apps, podcasts, media)",
      }}
      description={{
        ro: "Ghid curat al aplicațiilor, podcasturilor, cărților și serialelor pentru a învăța araba libaneză — dialect libanez, nu MSA. Recomandate de un profesor nativ.",
        en: "A curated guide to the apps, podcasts, books and TV series worth using to learn Lebanese Arabic — Lebanese dialect, not MSA. Recommended by a native teacher.",
      }}
      published="2026-07-24"
      readingMinutes={7}
      faq={FAQ}
      crumb={{ ro: "Resurse arabă libaneză", en: "Lebanese Arabic resources" }}
      lead={{
        ro: "Aproape toate resursele populare de „arabă” predau MSA. Iată ce merită dacă vrei să vorbești libaneză reală.",
        en: "Almost every popular ‘learn Arabic’ resource teaches MSA. Here's what's actually worth your time if you want to speak real Lebanese.",
      }}
    >
      <Tldr
        points={[
          { ro: "Aproape toate resursele populare de „arabă” predau MSA, nu dialect.", en: "Almost all popular \"Arabic\" resources teach MSA, not a dialect." },
          { ro: "Muzica, serialele și podcasturile libaneze sunt cea mai bună sursă gratuită de expunere.", en: "Lebanese music, series and podcasts are the best free source of exposure." },
          { ro: "Materialul audio contează mai mult decât listele de cuvinte.", en: "Audio material matters more than word lists." },
          { ro: "Resursele gratuite construiesc vocabular; corectura pronunției cere un om.", en: "Free resources build vocabulary; correcting pronunciation needs a person." },
        ]}
      />
      <p>
        {en
          ? "The problem with searching ‘Arabic learning resources’ is that 95% of what comes back — Duolingo, most textbooks, most YouTube channels — teaches Modern Standard Arabic (MSA / Fusha). MSA is the language of news and books; nobody speaks it at home in Beirut. If your goal is to talk with Lebanese friends, family, or clients, you need dialect-specific resources."
          : "Problema când cauți „resurse arabă” este că 95% din rezultate — Duolingo, majoritatea manualelor, majoritatea canalelor YouTube — predau araba standard (MSA / Fusha). MSA e limba știrilor și a cărților; nimeni nu o vorbește acasă în Beirut. Dacă vrei să vorbești cu prieteni, familie sau clienți libanezi, ai nevoie de resurse pe dialect."}{" "}
        <Link to="/blog/araba-libaneza-vs-araba-standard">
          {en ? "More on Lebanese vs MSA." : "Mai multe despre libaneză vs MSA."}
        </Link>
      </p>
      <p>
        {en
          ? "This list is curated — not a dump of every app that exists. Each item below is either genuinely Lebanese/Levantine, or an MSA-agnostic tool (Anki, Language Reactor) you can use with Lebanese content."
          : "Lista e curată — nu o enumerare a fiecărei aplicații care există. Fiecare item de mai jos este fie genuin libanez/levantin, fie o unealtă neutră față de MSA (Anki, Language Reactor) pe care o folosești cu conținut libanez."}
      </p>

      <h2>{en ? "Apps & software" : "Aplicații și software"}</h2>
      <Table rows={APPS} lang={lang} />

      <h2>{en ? "Podcasts & YouTube" : "Podcasturi și YouTube"}</h2>
      <Table rows={PODCASTS} lang={lang} />

      <h2>{en ? "TV, music & news" : "Seriale, muzică și știri"}</h2>
      <p>
        {en
          ? "Passive listening is the fastest way to internalize Lebanese rhythm and vocabulary. 30 minutes a day beats one long weekend session."
          : "Ascultarea pasivă este cel mai rapid mod de a-ți intra în ureche ritmul și vocabularul libanez. 30 de minute pe zi bat o singură sesiune lungă de weekend."}
      </p>
      <Table rows={MEDIA} lang={lang} />

      <h2>{en ? "Books & reference" : "Cărți și referință"}</h2>
      <Table rows={BOOKS} lang={lang} />

      <InlineCta
        title={{ ro: "Resursele nu țin locul unui interlocutor", en: "Resources don't replace a person to talk to" }}
        text={{
          ro: "Toate cursurile într-un loc: grupe pe niveluri, lecții 1:1 sau curs pentru copii — cu profesor nativ.",
          en: "Every course in one place: levelled groups, 1-on-1 lessons or the kids course — with a native teacher.",
        }}
        href="/cursuri-limba-araba"
        label={{ ro: "Vezi cursurile", en: "See the courses" }}
      />


      <h2>{en ? "A weekly routine that actually works" : "O rutină săptămânală care chiar funcționează"}</h2>
      <ul>
        <li>{en ? "3× per week — a live lesson with a native teacher (this is where you actually speak)." : "De 3 ori pe săptămână — o lecție live cu profesor nativ (aici chiar vorbești)."}</li>
        <li>{en ? "Daily — 10 minutes of Anki with phrases from your last lesson." : "Zilnic — 10 minute de Anki cu expresii din ultima lecție."}</li>
        <li>{en ? "Daily — 20–30 minutes of Lebanese TV, music or a podcast in the background." : "Zilnic — 20–30 minute de TV, muzică sau podcast libanez pe fundal."}</li>
        <li>{en ? "Weekly — one real message or voice note in Lebanese to a friend or teacher." : "Săptămânal — un mesaj real sau voice note în libaneză către un prieten sau profesor."}</li>
      </ul>

      <p>
        {en
          ? "Resources on their own won't get you speaking — they're the between-lesson glue. The lesson is where feedback happens."
          : "Resursele singure nu te fac să vorbești — sunt liantul dintre lecții. Feedback-ul apare la lecție."}{" "}
        <Link to={en ? "/en/arabic-tutor" : "/cursuri/private"}>
          {en ? "See how private lessons work" : "Vezi cum funcționează lecțiile private"}
        </Link>{" · "}
        <Link to={en ? "/en/learn-lebanese-arabic" : "/cursuri/grup"}>
          {en ? "Or join a group course" : "Sau înscrie-te la un curs de grup"}
        </Link>.
      </p>

      <p>
        {en
          ? "Every resource above is something you use alone. The one thing none of them provides is a native speaker correcting your pronunciation while you talk — that is what "
          : "Toate resursele de mai sus se folosesc singur. Singurul lucru pe care niciuna nu îl dă e un vorbitor nativ care îți corectează pronunția în timp ce vorbești — asta fac "}
        <Link to="/cursuri-limba-araba">{en ? "the courses" : "cursurile"}</Link>
        {en ? " are for." : "."}
      </p>

      <p>
        {en ? "Related:" : "Alte articole utile:"}{" "}
        <Link to="/blog/lebanese-arabic-phrases">{en ? "Essential Lebanese phrases" : "Expresii esențiale libaneze"}</Link>{" · "}
        <Link to="/blog/cum-alegi-profesor-de-araba">{en ? "How to choose an Arabic tutor" : "Cum alegi un profesor de arabă"}</Link>{" · "}
        <Link to="/blog/cat-dureaza-sa-inveti-araba-libaneza">{en ? "How long it takes" : "Cât durează să înveți"}</Link>.
      </p>
    </BlogArticleLayout>
  );
};

export default LebaneseArabicLearningResources;