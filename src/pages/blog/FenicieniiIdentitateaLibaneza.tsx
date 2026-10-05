import { Link } from "@/components/LocalizedLink";
import BlogArticleLayout from "@/components/blog/BlogArticleLayout";
import { Tldr, InlineCta } from "@/components/blog/ArticleKit";
import { useI18n } from "@/lib/i18n";

// The short answer lives in the FAQ ("Are Lebanese people Arabs?"); this is
// the long version, in the owner's framing: an Arabized nation descended
// primarily from the Canaanites of the coast, the people the Greeks called
// Phoenicians. Hypotheses are labelled as hypotheses.
const FAQ = [
  {
    q: { ro: "Fenicienii și canaaneenii sunt același popor?", en: "Are the Phoenicians and the Canaanites the same people?" },
    a: { ro: "Fenicienii sunt canaaneenii de pe coasta Libanului de azi. „Canaaneeni” e numele mai larg, pentru mai multe popoare înrudite din Levant; „fenicieni” e numele dat de greci celor din orașele de pe coastă.", en: "The Phoenicians are the Canaanites of the coast of today's Lebanon. \"Canaanites\" is the wider name for several related peoples of the Levant; \"Phoenicians\" is the name the Greeks gave to those of the coastal cities." },
  },
  {
    q: { ro: "Ce arată studiul ADN din 2017?", en: "What does the 2017 DNA study show?" },
    a: { ro: "Publicat în The American Journal of Human Genetics, studiul a comparat ADN vechi de circa 3.700 de ani din Sidon cu libanezii de azi: aproximativ 93% din ascendența lor provine de la canaaneenii din Epoca Bronzului.", en: "Published in The American Journal of Human Genetics, it compared roughly 3,700-year-old DNA from Sidon with Lebanese people today: about 93% of their ancestry comes from the Bronze Age Canaanites." },
  },
  {
    q: { ro: "Au inventat fenicienii alfabetul?", en: "Did the Phoenicians invent the alphabet?" },
    a: { ro: "Alfabetul fenician, de 22 de litere, e strămoșul alfabetului grecesc și, prin el, al celui latin — dar și al celui aramaic, din care vin scrierea siriacă și cea arabă.", en: "The 22-letter Phoenician alphabet is the ancestor of the Greek alphabet and, through it, of the Latin one — and also of Aramaic script, from which Syriac and Arabic writing descend." },
  },
];

const FenicieniiIdentitateaLibaneza = () => {
  const { lang } = useI18n();
  const en = lang === "en";
  return (
    <BlogArticleLayout
      slug="fenicienii-si-identitatea-libaneza"
      title={{
        ro: "Fenicienii și identitatea libaneză",
        en: "The Phoenicians and Lebanese identity",
      }}
      description={{
        ro: "Cine au fost fenicienii, de unde le vine numele și ce spune genetica: libanezii de azi descind în primul rând din canaaneenii de pe coastă.",
        en: "Who the Phoenicians were, where their name comes from and what genetics says: Lebanese people today descend primarily from the coastal Canaanites.",
      }}
      published="2026-10-04"
      readingMinutes={6}
      faq={FAQ}
      crumb={{ ro: "Fenicienii", en: "The Phoenicians" }}
      lead={{
        ro: "„Libanezii sunt arabi?” Politic, da. Ca origine, libanezii sunt o națiune arabizată, care descinde în primul rând din populația nativă a Levantului. Pe coasta Libanului de azi, acești strămoși au un nume pe care îl știe toată lumea: fenicienii.",
        en: "\"Are Lebanese people Arabs?\" Politically, yes. By origin, the Lebanese are an Arabized nation descended primarily from the native people of the Levant. On the coast of today's Lebanon, those ancestors have a name everyone knows: the Phoenicians.",
      }}
    >
      <Tldr
        points={[
          { ro: "Canaaneenii erau mai multe popoare înrudite din Levant; cei de pe coasta Libanului sunt fenicienii.", en: "The Canaanites were several related peoples of the Levant; those of the Lebanese coast are the Phoenicians." },
          { ro: "Numele vine de la greci, cel mai probabil după purpura de Tir.", en: "The name comes from the Greeks, most likely after Tyrian purple." },
          { ro: "Un studiu din 2017: circa 93% din ascendența libanezilor de azi e canaaneeană.", en: "A 2017 study: about 93% of today's Lebanese ancestry is Canaanite." },
          { ro: "Limba s-a schimbat (feniciană → aramaică → arabă); oamenii au rămas.", en: "The language changed (Phoenician → Aramaic → Arabic); the people stayed." },
        ]}
      />

      <h2>{en ? "1. Canaanites and Phoenicians" : "1. Canaaneeni și fenicieni"}</h2>
      <p>
        {en
          ? "\"Canaanites\" is the collective name for several related peoples who lived in the Levant in the Bronze Age and spoke related Semitic languages. Those who lived on the land of today's Lebanon, mostly along the coast, are the ones history calls Phoenicians. They did not form one state but a chain of independent city-states: Byblos (Gebal), Berytus (Beirut), Sidon, Tyre, and Tripoli to the north — called Athar by some sources. Inland, Baalbek still carries the name of the god Baal."
          : "„Canaaneeni” e numele colectiv pentru mai multe popoare înrudite care trăiau în Levant în Epoca Bronzului și vorbeau limbi semitice înrudite. Cei care trăiau pe teritoriul Libanului de azi, mai ales pe coastă, sunt cei pe care istoria îi numește fenicieni. Nu formau un singur stat, ci un șir de orașe-stat independente: Byblos (Gebal), Berytus (Beirut), Sidon, Tir și, la nord, Tripoli — numită Athar în unele surse. În interior, Baalbek poartă și azi numele zeului Baal."}
      </p>
      <p>
        {en
          ? "Phoenicia stretched along the coast from Arwad, in today's Syria, south to around Acre. Further north, Ugarit, near today's Latakia, had a closely related Canaanite culture."
          : "Fenicia se întindea de-a lungul coastei de la Arwad, în Siria de azi, până în jurul Acrei, la sud. Mai la nord, Ugarit, lângă Latakia de azi, avea o cultură canaaneeană strâns înrudită."}
      </p>

      <h2>{en ? "2. Why \"Phoenicians\"" : "2. De ce „fenicieni”"}</h2>
      <p>
        {en
          ? "They did not call themselves that. The name comes from Greek, most likely from phoinos — dark red, purple — the colour of Tyrian purple, a dye extracted from murex sea snails. It took thousands of snails for a little dye, which made it extremely expensive and turned it into the colour of kings and emperors. In Akkadian texts the region appears as Kinahhu; some scholars link that name to purple as well, but this remains a hypothesis."
          : "Nu își spuneau așa. Numele vine din greacă, cel mai probabil de la phoinos — roșu închis, purpuriu — culoarea purpurei de Tir, un colorant extras din melcii de mare murex. Era nevoie de mii de melci pentru puțin colorant, ceea ce îl făcea extrem de scump și l-a transformat în culoarea regilor și a împăraților. În textele akkadiene, regiunea apare ca Kinahhu; unii cercetători leagă și acest nume de purpură, dar rămâne o ipoteză."}
      </p>

      <h2>{en ? "3. Sailors, traders and the alphabet" : "3. Navigatori, negustori și alfabetul"}</h2>
      <p>
        {en
          ? "The Phoenicians sailed the whole Mediterranean, founded colonies — Carthage, by tradition founded from Tyre — and traded cedar wood from Mount Lebanon, glass and purple cloth. Their greatest legacy is the alphabet: a short set of letters, one per sound, that the Greeks adopted and passed on to the Romans. One of the oldest inscriptions in it is on the sarcophagus of King Ahiram of Byblos."
          : "Fenicienii au navigat în toată Mediterana, au întemeiat colonii — Cartagina, întemeiată după tradiție din Tir — și au făcut comerț cu lemn de cedru din Muntele Liban, sticlă și stofe de purpură. Cea mai mare moștenire a lor e alfabetul: un set scurt de litere, câte una pentru fiecare sunet, preluat de greci și transmis romanilor. Una dintre cele mai vechi inscripții în acest alfabet se află pe sarcofagul regelui Ahiram din Byblos."}
      </p>

      <h2>{en ? "4. What genetics says" : "4. Ce spune genetica"}</h2>
      <p>
        {en
          ? "In 2017, The American Journal of Human Genetics published a study of roughly 3,700-year-old DNA from five people buried in Sidon. Compared with Lebanese people today, it found that about 93% of their ancestry comes from these Bronze Age Canaanites. Empires, languages and religions changed many times; the population largely stayed."
          : "În 2017, The American Journal of Human Genetics a publicat un studiu pe ADN vechi de circa 3.700 de ani, de la cinci oameni înmormântați în Sidon. Comparat cu libanezii de azi, a arătat că aproximativ 93% din ascendența lor provine de la acești canaaneeni din Epoca Bronzului. Imperiile, limbile și religiile s-au schimbat de multe ori; populația a rămas în mare parte aceeași."}
      </p>

      <h2>{en ? "5. From Phoenician to Arabic" : "5. De la feniciană la arabă"}</h2>
      <p>
        {en
          ? "In the Greek and Roman period the people of the coast and the mountain became Christian and spoke Aramaic, written as Syriac. After the 7th century they were gradually Arabized, and some became Muslim. That is why Lebanon today is part of the Arab League and speaks Arabic — and why Lebanese Arabic still carries Syriac words. Many Lebanese put it simply: the language changed, but we are the same people as our ancestors."
          : "În perioada greacă și romană, oamenii de pe coastă și din munte s-au creștinat și au vorbit aramaica, scrisă ca siriacă. După secolul al VII-lea s-au arabizat treptat, iar o parte s-au islamizat. De aceea Libanul face azi parte din Liga Arabă și vorbește arabă — și de aceea araba libaneză păstrează încă cuvinte siriace. Mulți libanezi o spun simplu: limba s-a schimbat, dar suntem același popor ca strămoșii noștri."}
      </p>

      <InlineCta
        title={{ ro: "Vrei să vorbești limba Libanului de azi?", en: "Want to speak the language of Lebanon today?" }}
        text={{
          ro: "Predăm dialectul libanez, cu profesor nativ. Grupe A1–C2 și lecții 1:1.",
          en: "We teach the Lebanese dialect with a native teacher. Groups A1–C2 and 1-on-1 lessons.",
        }}
        href="/cursuri-limba-araba"
        label={{ ro: "Vezi cursurile", en: "See the courses" }}
      />

      <p>
        {en ? "Related:" : "Alte articole utile:"}{" "}
        <Link to="/blog/siriaca-in-araba-libaneza">{en ? "The Syriac inside Lebanese Arabic" : "Siriaca din araba libaneză"}</Link>{" · "}
        <Link to="/blog/sfantul-efrem-sirul-si-biserica-maronita">{en ? "Saint Ephrem and the Maronite Church" : "Sfântul Efrem Sirul și Biserica Maronită"}</Link>{" · "}
        <Link to="/blog/cultura-libaneza-obiceiuri-mancare-traditii">{en ? "Lebanese culture" : "Cultura libaneză"}</Link>.
      </p>
    </BlogArticleLayout>
  );
};

export default FenicieniiIdentitateaLibaneza;
