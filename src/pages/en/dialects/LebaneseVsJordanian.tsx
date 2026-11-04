import { Link } from "@/components/LocalizedLink";
import EnLandingLayout from "../EnLandingLayout";
import ComparisonTable from "@/components/seo/ComparisonTable";
import { DIALECT_PARENTS_EN } from "./parents";
import DialectSiblings from "@/components/seo/DialectSiblings";

/**
 * Jordanian Arabic, seen from Beirut — the English half of
 * src/pages/seo/dialecte/LibanezaVsIordaniana.tsx. Three columns instead of
 * two, because urban Amman and Bedouin speech are two different answers to
 * "how do people speak in Jordan".
 */
const FAQ = [
  {
    q: "Is Jordanian Arabic the same as Lebanese Arabic?",
    a: "Not identical, but from the same Levantine family (shami). Grammar and most vocabulary are shared. What differs is the pronunciation of ق, the -sh suffix added to negation, a few everyday words and the intonation.",
  },
  {
    q: "If I learn Lebanese, will I manage in Jordan?",
    a: "Yes. In Amman and the cities a Lebanese speaker is understood without trouble. The adjustments are small: ma baʿrafsh instead of ma baʿrif, hēla or hāla instead of halla2, min wēn instead of mnēn.",
  },
  {
    q: "Is Jordanian Arabic one accent?",
    a: "No. Amman has two main varieties: the urban one, brought by families originally from Palestine, and the eastern one, Bedouin and fellahin, which keeps a hard g for ق (galb) and softens k towards č. Both are Levantine, but they sound distinct.",
  },
  {
    q: "Which words change most between Lebanese and Jordanian?",
    a: "'I want': baddi vs biddi. 'Now': halla2 vs hēla. 'This': hāda vs hādhīri. 'Very': ktīr vs kthīr. 'Where from': mnēn vs min wēn. 'Okay': ṭayyib vs tamām.",
  },
  {
    q: "Is Jordanian closer to Lebanese or to Gulf Arabic?",
    a: "To Lebanese. It is Levantine, so it shares grammar and vocabulary with Beirut and Damascus. Gulf Arabic is the geographic neighbour but has different verb morphology and different everyday vocabulary — that comparison has its own page.",
  },
];

const LebaneseVsJordanian = () => (
  <EnLandingLayout
    slug="arabic-dialects-guide/lebanese-vs-jordanian-arabic"
    title="Lebanese and Jordanian Arabic, side by side"
    metaTitle="Lebanese vs Jordanian Arabic: The Real Differences"
    description="How far is Jordanian Arabic from Lebanese? Amman speech, the Bedouin g, the -sh negation and what learning Lebanese gets you in Jordan."
    crumb="Lebanese vs Jordanian"
    parents={DIALECT_PARENTS_EN}
    lead="Jordan is south Levantine with one foot in the desert: the same grammar you learn in Beirut, two different accents inside one country."
    roHref="/dialecte-arabe/libaneza-vs-iordaniana"
    courseSchema={false}
    faq={FAQ}
  >
    <h2>Short answer</h2>
    <p>
      Jordanian is <strong>south Levantine</strong>, like Palestinian, while
      Lebanese is <strong>north Levantine</strong>. What you learn in a
      Lebanese course is heard almost unchanged in Amman: the same{" "}
      <em>b-</em> for the present, the same <em>biddi</em> for "I want", the
      same pronouns. What changes is negation (the <em>-sh</em> suffix), the
      pronunciation of <strong>ق</strong> and a few everyday words. And
      inside Jordan there are two varieties: urban, close to Palestinian, and
      Bedouin, with a hard <em>g</em> where Beirut has a glottal stop.
    </p>

    <h2>Side by side</h2>
    <ComparisonTable
      caption="Lebanese Arabic compared with Jordanian Arabic, urban and Bedouin"
      columns={[
        "Feature",
        "Lebanese",
        "Jordanian (Amman, urban)",
        "Jordanian (Bedouin, rural)",
      ]}
      rows={[
        [
          "Group",
          "North Levantine.",
          "South Levantine, urban.",
          "South Levantine, with Bedouin features.",
        ],
        [
          "The letter ق",
          "Glottal stop: ʾalb.",
          "Glottal stop: ʾalb.",
          "Hard g: galb.",
        ],
        [
          "The letter ك",
          "Stays k: kēn.",
          "Stays k: kān.",
          "Often softened to č in many words.",
        ],
        [
          "The vowel ā",
          "Closes towards ē: kēn.",
          "Stays open: kān.",
          "Stays open: kān.",
        ],
        [
          "Negation",
          "Usually bare ma: ma baʿrif.",
          "Ma + -sh: ma baʿrafsh.",
          "Ma + -sh: ma baʿrafsh.",
        ],
        ["'I want'", "baddi", "biddi", "biddi"],
        ["'Now'", "halla2", "hēla / hāla", "hēla"],
        ["'This'", "hāda", "hādhīri", "hādhīri"],
        ["'Very'", "ktīr", "kthīr", "kthīr"],
        ["'Where from?'", "mnēn?", "min wēn?", "min wēn?"],
        ["'How are you?'", "kīfak", "kīfak", "shlōnak"],
        [
          "Loanwords",
          "A lot of French, plus English.",
          "English, Turkish.",
          "Turkish; little European.",
        ],
        [
          "Neighbours",
          "Syria; Egypt through media.",
          "Palestine, the Gulf, Iraq.",
          "The Gulf, the peninsula.",
        ],
        [
          "Mutual understanding",
          "—",
          "Very good.",
          "Good; a few words to adjust.",
        ],
      ]}
    />

    <h2>The same sentence in all three</h2>
    <p>
      <em>"I want to go home now."</em>
    </p>
    <ul>
      <li>
        <strong>Lebanese:</strong> <em>halla2 baddi arūḥ ʿal bēt</em>
      </li>
      <li>
        <strong>Jordanian (Amman):</strong> <em>hēla biddi arūḥ ʿal bēt</em>
      </li>
      <li>
        <strong>Jordanian (Bedouin):</strong>{" "}
        <em>hēla biddi arūḥ ʿal bēt</em> — same sentence, different colour on
        the ق
      </li>
    </ul>
    <p>
      <em>"How much is this?"</em>
    </p>
    <ul>
      <li>
        <strong>Lebanese:</strong> <em>bqaddēsh hāda?</em>
      </li>
      <li>
        <strong>Jordanian:</strong> <em>kammīsh hādhīri?</em> (or{" "}
        <em>qaddēsh</em>)
      </li>
    </ul>
    <p>One suffix, one vowel, one word for price. The rest of the sentence is shared.</p>

    <h2>Why Amman sounds like two dialects</h2>
    <p>
      Amman grew in waves of population: families originally from Palestine,
      arriving in 1948 and 1967, and Bedouin and fellahin communities from
      the east. Urban speech inherited the Palestinian accent — glottal stop
      for q, intonation less sing-song than in Lebanon — while the eastern
      speech kept the hard <em>g</em> and features close to Gulf Arabic. One
      city, two registers. The good news for a learner is that Lebanese works
      in both: you hear two accents, not two languages.
    </p>

    <h2>What this means for you</h2>
    <ul>
      <li>
        <strong>Family in Jordan</strong> → Lebanese gives you the base;
        pronunciation and local words are tuned in{" "}
        <Link to="/en/arabic-tutor">1-on-1 lessons</Link>.
      </li>
      <li>
        <strong>You work or travel between Jordan and the Gulf</strong> →
        Levantine covers Jordan, and for the Gulf see{" "}
        <Link to="/en/arabic-dialects-guide/levantine-vs-gulf-arabic">
          Levantine vs Gulf Arabic
        </Link>
        .
      </li>
      <li>
        <strong>No regional tie</strong> → Lebanese stays the variety with
        the most material and the widest access to native teachers.
      </li>
    </ul>

    <h2>First step</h2>
    <p>
      Everything is written in <Link to="/en/blog/ce-este-arabizi">Arabizi</Link>
      , so you speak from the first lesson; the free material is in the{" "}
      <Link to="/en/blog/lebanese-arabic-learning-resources">
        resources article
      </Link>
      , and the <Link to="/en/trial">free trial lesson (0 lei)</Link> is with a native
      teacher.
    </p>
    <DialectSiblings current="/en/arabic-dialects-guide/lebanese-vs-jordanian-arabic" />
  </EnLandingLayout>
);

export default LebaneseVsJordanian;
