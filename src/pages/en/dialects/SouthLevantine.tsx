import { Link } from "@/components/LocalizedLink";
import EnLandingLayout from "../EnLandingLayout";
import ComparisonTable from "@/components/seo/ComparisonTable";
import { DIALECT_PARENTS_EN } from "./parents";
import DialectSiblings from "@/components/seo/DialectSiblings";

/**
 * The south–north line inside Levantine, on its own page — the English half
 * of src/pages/seo/dialecte/LevantinaDeSud.tsx. The four-way page answers
 * "how different are the four"; this one answers which side of the line a
 * learner is starting on.
 */
const FAQ = [
  {
    q: "What is South Levantine Arabic?",
    a: "The variety of Levantine spoken in Palestine and Jordan. Together with North Levantine — Lebanese and Syrian — it forms the shami family: the same grammar, roughly 80–90% shared vocabulary, different accents.",
  },
  {
    q: "What is the most audible difference between north and south?",
    a: "Negation. The south often adds the -sh suffix (ma baʿrafsh), the north usually stops at ma (ma baʿrif). Then come the pronunciation of ق, vowel colour and intonation: Lebanese rises in a sing-song, the south stays flatter.",
  },
  {
    q: "If I learn Lebanese, can I speak in the south?",
    a: "Yes. A Lebanese speaker holds ordinary conversations in Ramallah, Jerusalem or Amman. You adjust a suffix, a few words and the accent — you are not learning another language.",
  },
  {
    q: "Where does the line between north and south run?",
    a: "Through the contact zone, not along a border. Southern Lebanon shares features with northern Palestine, Tripoli sounds partly Syrian, and in Amman the urban speech of Palestinian origin lives beside the Bedouin speech with a hard g for ق.",
  },
  {
    q: "Which should I learn: north or south?",
    a: "The north, unless you have a specific regional tie. Lebanese has the most material, the most native teachers and the largest media exposure. With it you cover the south too; the other way round is harder, because southern material is thinner.",
  },
];

const SouthLevantine = () => (
  <EnLandingLayout
    slug="arabic-dialects-guide/south-levantine-arabic"
    title="South Levantine and North Levantine Arabic"
    metaTitle="South vs North Levantine Arabic: The Four Accents"
    description="North or south? Lebanese and Syrian in the north, Palestinian and Jordanian in the south. The differences in sound, negation and words — and what to learn."
    crumb="South vs north Levantine"
    parents={DIALECT_PARENTS_EN}
    lead="The Levantine family has one line inside it: the north, with Lebanese and Syrian, and the south, with Palestinian and Jordanian. Here is what changes when you cross it."
    roHref="/dialecte-arabe/levantina-de-sud"
    courseSchema={false}
    faq={FAQ}
  >
    <h2>Short answer</h2>
    <p>
      <strong>North Levantine</strong> = Lebanese + Syrian (Beirut, Tripoli,
      Damascus, Aleppo). <strong>South Levantine</strong> = Palestinian +
      Jordanian (Jerusalem, Ramallah, Gaza, Amman, Irbid). The grammar is
      shared: the same <em>b-</em> prefix for the present, the same{" "}
      <em>baddi / biddi</em> for "I want", the same pronouns. What changes is
      one negation suffix, the pronunciation of <strong>ق</strong>, the
      colour of the vowels and the intonation.
    </p>

    <h2>North vs. south, point by point</h2>
    <ComparisonTable
      caption="North Levantine compared with South Levantine"
      columns={[
        "Feature",
        "North (Lebanese, Syrian)",
        "South (Palestinian, Jordanian)",
      ]}
      rows={[
        [
          "Negation",
          "Usually bare ma: ma baʿrif.",
          "Ma + the -sh suffix: ma baʿrafsh.",
        ],
        [
          "The letter ق",
          "Glottal stop in cities: ʾalb.",
          "Glottal stop in cities; hard g in Bedouin and rural speech: galb.",
        ],
        [
          "The vowel ā",
          "Closes towards ē in Lebanese: kēn.",
          "Stays open: kān.",
        ],
        ["'I want'", "baddi", "biddi"],
        ["'Now'", "halla2", "hāla / hēla"],
        ["'This'", "hāda", "hādhīri"],
        ["'Very'", "ktīr", "kthīr"],
        ["'Where from?'", "mnēn?", "min wēn?"],
        ["'Okay'", "ṭayyib, zyēn", "tamām"],
        [
          "Loanwords",
          "French and English, especially in Lebanon.",
          "Turkish and English; Hebrew in everyday speech in Israel and the territories.",
        ],
        [
          "Intonation",
          "Rising, sing-song, recognised at once.",
          "Flatter, with its own accent in Amman and Jerusalem.",
        ],
        [
          "Learning material",
          "The most of anywhere: music, drama, courses, native teachers.",
          "Thinner; usually studied through north Levantine.",
        ],
      ]}
    />

    <h2>The same sentence from both ends</h2>
    <p>
      <em>"I don't know what he wants."</em>
    </p>
    <ul>
      <li>
        <strong>North (Beirut, Damascus):</strong>{" "}
        <em>ma baʿrif shu baddo</em>
      </li>
      <li>
        <strong>South (Ramallah, Amman):</strong>{" "}
        <em>ma baʿrafsh shu biddo</em>
      </li>
    </ul>
    <p>
      One suffix and one vowel. That is the distance between British and
      American English, not between English and German.
    </p>

    <h2>Where the line actually runs</h2>
    <p>
      Not along a border. The contact zone blurs it in both directions:
      southern Lebanon shares features with northern Palestine, Tripoli
      sounds partly Syrian, and in Amman two registers live side by side —
      the urban one of Palestinian origin, and the Bedouin one with a hard{" "}
      <em>g</em> for ق. The map of the Levantine zones, with its sources, is
      in the <Link to="/en/arabic-dialects-guide">Arabic dialects guide</Link>.
    </p>

    <h2>The four, one at a time</h2>
    <ul>
      <li>
        <Link to="/en/arabic-dialects-guide/lebanese-vs-syrian-arabic">
          Lebanese vs Syrian
        </Link>{" "}
        — the two northern ones, almost identical.
      </li>
      <li>
        <Link to="/en/arabic-dialects-guide/lebanese-vs-palestinian-arabic">
          Lebanese vs Palestinian
        </Link>{" "}
        — the north facing the urban south.
      </li>
      <li>
        <Link to="/en/arabic-dialects-guide/lebanese-vs-jordanian-arabic">
          Lebanese vs Jordanian
        </Link>{" "}
        — the south with one foot in the desert: Amman and the Bedouin accent.
      </li>
    </ul>

    <h2>Which to learn</h2>
    <ul>
      <li>
        <strong>No specific regional tie</strong> → the north, meaning
        Lebanese: the most material and the widest access to native teachers,
        with the south covered in the same hand.
      </li>
      <li>
        <strong>Family or a partner from Palestine or Jordan</strong> → still
        Lebanese, with the local words and accent corrected along the way in{" "}
        <Link to="/en/arabic-tutor">1-on-1 lessons</Link>.
      </li>
      <li>
        <strong>You need the south for work or study</strong> → the start is
        still north Levantine; the differences are added once you have the
        shared grammar and vocabulary.
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
    <DialectSiblings current="/en/arabic-dialects-guide/south-levantine-arabic" />
  </EnLandingLayout>
);

export default SouthLevantine;
