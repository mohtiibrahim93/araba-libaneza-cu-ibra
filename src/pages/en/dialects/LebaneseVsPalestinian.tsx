import { Link } from "@/components/LocalizedLink";
import EnLandingLayout from "../EnLandingLayout";
import ComparisonTable from "@/components/seo/ComparisonTable";
import { DIALECT_PARENTS_EN } from "./parents";
import DialectSiblings from "@/components/seo/DialectSiblings";

/**
 * Palestinian Arabic, seen from Beirut — the English half of
 * src/pages/seo/dialecte/LibanezaVsPalestiniana.tsx. Same criteria, same
 * order, so the set of comparison pages reads as one instrument.
 */
const FAQ = [
  {
    q: "Is Lebanese Arabic the same as Palestinian Arabic?",
    a: "Not identical, but from one family: both are Levantine (shami). The grammar is effectively the same and most vocabulary is shared. What changes is the pronunciation of ق, the -sh suffix on negation, a handful of everyday words and the intonation.",
  },
  {
    q: "If I learn Lebanese, can I speak with a Palestinian?",
    a: "Yes. A Lebanese speaker holds ordinary conversations in Ramallah, Jerusalem or Nablus. The adjustments are small: the -sh suffix on negation, hāla instead of halla2 for 'now', and a few dozen local words.",
  },
  {
    q: "Is Palestinian Arabic one accent?",
    a: "No. Urban speech — Jerusalem, Ramallah, Nablus, Haifa — is the closest to Lebanese. Rural speech keeps a harder k for ق and shifts some vowels, and Gaza has its own features. Speech in Israel and the territories also carries more Hebrew loanwords.",
  },
  {
    q: "Which words change most between Lebanese and Palestinian?",
    a: "'I want': baddi vs biddi. 'Now': halla2 vs hāla. 'This': hāda vs hādhīri. 'Very': ktīr vs kthīr. 'Okay': ṭayyib or zyēn vs tamām. 'Where from': mnēn vs min wēn.",
  },
  {
    q: "Should I learn Palestinian instead of Lebanese?",
    a: "Only with a direct tie to Palestine. Lebanese covers the conversation anyway, has far more learning material and more native teachers, and in Romania the Arab community is largely Lebanese and Syrian. The differences are corrected as you go, in a few lessons.",
  },
];

const LebaneseVsPalestinian = () => (
  <EnLandingLayout
    slug="arabic-dialects-guide/lebanese-vs-palestinian-arabic"
    title="Lebanese and Palestinian Arabic, side by side"
    metaTitle="Lebanese vs Palestinian Arabic: What Actually Differs"
    description="Lebanese or Palestinian Arabic? The qaf, the -sh negation, everyday words and how easily one dialect carries you into the other. By a native teacher."
    crumb="Lebanese vs Palestinian"
    parents={DIALECT_PARENTS_EN}
    lead="Two Levantine dialects separated by a border, not by distance. The grammar is shared; what moves is a few sounds, one suffix and a handful of words."
    roHref="/dialecte-arabe/libaneza-vs-palestiniana"
    courseSchema={false}
    faq={FAQ}
  >
    <h2>Short answer</h2>
    <p>
      Lebanese and Palestinian are <strong>two varieties of Levantine</strong>{" "}
      (shami): Lebanese belongs to the northern group, Palestinian to the
      southern one. The same <em>b-</em> prefix for the present, the same{" "}
      <em>baddi / biddi</em> for "I want", the same pronouns, the same
      negation frame. The audible difference sits in three places:
      Palestinian often adds the <em>-sh</em> suffix to negation (
      <em>ma baʿrafsh</em>), it does not raise ā towards ē (so{" "}
      <em>kān</em>, not <em>kēn</em>), and its loanword layer is Turkish,
      English and — in Israel and the territories — Hebrew, rather than
      French.
    </p>

    <h2>Side by side</h2>
    <ComparisonTable
      caption="Lebanese Arabic compared with Palestinian Arabic"
      columns={["Feature", "Lebanese", "Palestinian"]}
      rows={[
        [
          "Group",
          "North Levantine (Lebanese, Syrian).",
          "South Levantine (Palestinian, Jordanian).",
        ],
        [
          "The letter ق",
          "Glottal stop: ʾalb ('heart').",
          "Glottal stop in cities; a hard k in village speech; a softer k, towards č, in the south of the area and in Gaza.",
        ],
        [
          "The vowel ā",
          "Closes towards ē (imāla): kēn.",
          "Stays open: kān.",
        ],
        [
          "Negation",
          "Usually bare ma: ma baʿrif.",
          "Often ma + -sh: ma baʿrafsh.",
        ],
        ["'I want'", "baddi", "biddi"],
        ["'Now'", "halla2", "hāla"],
        ["'This'", "hāda", "hādhīri"],
        ["'Very'", "ktīr", "kthīr"],
        ["'Okay'", "ṭayyib, zyēn", "tamām"],
        ["'Where from?'", "mnēn?", "min wēn?"],
        [
          "Loanwords",
          "A lot of French, plus English.",
          "Turkish and English; Hebrew in everyday speech in Israel and the territories.",
        ],
        [
          "Intonation",
          "Rising, sing-song, recognised at once.",
          "Flatter than Lebanese.",
        ],
        [
          "Mutual understanding",
          "—",
          "Very good; a few words to adjust.",
        ],
      ]}
    />

    <h2>The same sentence in both</h2>
    <p>
      <em>"I want to know where you're from now."</em>
    </p>
    <ul>
      <li>
        <strong>Lebanese:</strong> <em>halla2 baddi aʿref mnēn inta</em>
      </li>
      <li>
        <strong>Palestinian:</strong> <em>hāla biddi aʿref min wēn inta</em>
      </li>
    </ul>
    <p>
      <em>"I don't know what he wants."</em>
    </p>
    <ul>
      <li>
        <strong>Lebanese:</strong> <em>ma baʿrif shu baddo</em>
      </li>
      <li>
        <strong>Palestinian:</strong> <em>ma baʿrafsh shu biddo</em>
      </li>
    </ul>
    <p>
      Two words change, the rest of the sentence stays. That is the distance
      between British and American English, not between English and German.
    </p>

    <h2>Palestinian is not one accent</h2>
    <p>
      Urban speech — Jerusalem, Ramallah, Nablus, Haifa — is the closest to
      Lebanese and to the Syrian of Damascus: the same glottal stop for ق,
      the same register. Village speech brings ق back as a hard <em>k</em>,
      and in the southern part of the area and in Gaza a <em>k</em> comes out
      softer, towards <em>č</em>. On top of that sits the local loanword
      layer: Turkish from the Ottoman centuries, English from the mandate and
      from school, Hebrew from daily contact. For a learner the consequence
      is simple: you build a Levantine base and adjust the vocabulary to
      your family's area.
    </p>

    <h2>Where the border fades</h2>
    <p>
      Southern Lebanon shares features with northern Palestine: a less
      sing-song intonation, some words in common. A state border is not a
      linguistic line — dialects mix on both sides of every one of them. The
      map of the Levantine zones, with its sources, is in the{" "}
      <Link to="/en/arabic-dialects-guide">Arabic dialects guide</Link>.
    </p>

    <h2>What this means for you</h2>
    <ul>
      <li>
        <strong>Family or a partner from Palestine</strong> → a Lebanese
        course serves you directly; the few local words are corrected along
        the way, and the accent is tuned in{" "}
        <Link to="/en/arabic-tutor">1-on-1 lessons</Link>.
      </li>
      <li>
        <strong>No regional tie</strong> → Lebanese stays the choice with the
        most material and the widest access to native teachers.
      </li>
      <li>
        <strong>You want to hear the difference</strong> → compare{" "}
        <Link to="/en/arabic-dialects-guide/lebanese-vs-syrian-arabic">
          Lebanese with Syrian
        </Link>{" "}
        and{" "}
        <Link to="/en/arabic-dialects-guide/lebanese-vs-jordanian-arabic">
          Lebanese with Jordanian
        </Link>
        .
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
    <DialectSiblings current="/en/arabic-dialects-guide/lebanese-vs-palestinian-arabic" />
  </EnLandingLayout>
);

export default LebaneseVsPalestinian;
