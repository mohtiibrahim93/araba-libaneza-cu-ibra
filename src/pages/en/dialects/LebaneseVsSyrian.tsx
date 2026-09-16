import { Link } from "@/components/LocalizedLink";
import EnLandingLayout from "../EnLandingLayout";
import ComparisonTable from "@/components/seo/ComparisonTable";
import { DIALECT_PARENTS_EN } from "./parents";

const FAQ = [
  {
    q: "Is Lebanese Arabic the same as Syrian Arabic?",
    a: "Not identical, but very close. Beirut and Damascus sit in the same North Levantine zone: the grammar is effectively the same, the vocabulary overlaps almost completely, and speakers move between them without noticing. What differs is the accent, a handful of words, and how much French runs through everyday speech.",
  },
  {
    q: "If I learn Lebanese, can I manage in Syria, Jordan and Palestine?",
    a: "Yes. All four are Levantine (shami) dialects. A Lebanese speaker holds ordinary conversations in Damascus, Amman or Ramallah. You will meet a different accent and some new words, not a different language.",
  },
  {
    q: "What is the difference between North and South Levantine?",
    a: "North means Lebanese and Syrian, South means Palestinian and Jordanian. Grammar and over 90% of the vocabulary are shared. What changes is the pronunciation of ق, the colour of the vowels, the intonation, and the shape of negation: the south often adds the -sh suffix (ma baʿrafsh), the north usually does not.",
  },
  {
    q: "Why does Lebanese sound so different from Syrian if they are that close?",
    a: "Three small things that add up: imāla, the raising of ā towards ē (kēn in Beirut, kān in Damascus); the rising, sing-song Lebanese intonation; and the thick layer of French and English in everyday Lebanese speech. The structure underneath stays the same.",
  },
  {
    q: "Which Levantine variety is most useful to learn?",
    a: "Any of them, because they are mutually intelligible. Lebanese has the largest media footprint — music, satellite TV, a large diaspora — and the most teaching material outside the region, which makes it the easiest of the four to actually study.",
  },
];

const LebaneseVsSyrian = () => (
  <EnLandingLayout
    slug="arabic-dialects-guide/lebanese-vs-syrian-arabic"
    title="Lebanese against the rest of Levantine"
    metaTitle="Lebanese vs Syrian, Palestinian and Jordanian Arabic"
    description="How different is Lebanese from Syrian, Palestinian and Jordanian Arabic? Pronunciation, negation, vocabulary, and what learning one gets you in the others."
    crumb="Lebanese vs the rest of Levantine"
    parents={DIALECT_PARENTS_EN}
    lead="Lebanese, Syrian, Palestinian and Jordanian are four accents of one family. Here is exactly where they part — and why it matters so little."
    roHref="/dialecte-arabe/libaneza-vs-siriana"
    courseSchema={false}
    faq={FAQ}
  >
    <h2>Short answer</h2>
    <p>
      All four are <strong>Levantine (shami)</strong> dialects and they understand each other
      effortlessly. They split into <strong>North Levantine</strong> — Lebanese and Syrian — and{" "}
      <strong>South Levantine</strong> — Palestinian and Jordanian. The grammar is shared: the same{" "}
      <em>b-</em> present prefix, the same <em>ʿam</em> for an action in progress, the same{" "}
      <em>baddi</em> for "want". What changes is the accent, the shape of negation, and a few dozen
      everyday words. Learn one and you follow all four.
    </p>

    <h2>Side by side</h2>
    <ComparisonTable
      caption="Lebanese compared with Syrian, Palestinian and Jordanian Arabic"
      columns={["Feature", "Lebanese", "Syrian (Damascus)", "Palestinian / Jordanian"]}
      rows={[
        ["Group", "North Levantine", "North Levantine", "South Levantine"],
        ["The letter ق", "Glottal stop: ʾāl.", "Glottal stop: ʾāl.", "Glottal stop in cities; hard g in rural and Bedouin speech: galb."],
        ["The vowel ā", "Raised towards ē (imāla): kēn.", "Stays open: kān.", "Stays open: kān."],
        ["Negation", "Usually just ma: ma baʿrif.", "Usually just ma: ma baʿrif.", "Often adds -sh: ma baʿrafsh."],
        ["'I want'", "baddi", "baddi", "biddi / baddi"],
        ["Loanwords", "Heavy French, plus English.", "Less French, some Turkish.", "More English."],
        ["Intonation", "Rising, sing-song, recognised instantly.", "Flatter than Lebanese.", "Flatter, with its own Amman and Jerusalem accents."],
        ["Mutual intelligibility", "—", "Near complete.", "Very high; a few words to adjust."],
      ]}
    />

    <h2>The same sentence in all four</h2>
    <p><em>"I don't know what he wants."</em></p>
    <ul>
      <li><strong>Lebanese:</strong> <em>ma baʿrif shu baddo</em></li>
      <li><strong>Syrian:</strong> <em>ma baʿrif shu baddo</em></li>
      <li><strong>Palestinian:</strong> <em>ma baʿrafsh shu biddo</em></li>
      <li><strong>Jordanian:</strong> <em>ma baʿrafsh shu biddo</em></li>
    </ul>
    <p>
      Four varieties, one sentence. The difference is a suffix and a vowel — the distance between
      British and American English, not between two languages.
    </p>

    <h2>Where the lines blur</h2>
    <p>
      Contact zones mix features in both directions. Tripoli, in northern Lebanon, already sounds
      partly Syrian; southern Lebanon shares features with Palestine; the Bekaa valley leans
      towards the Syrian desert. The detailed map of the Levantine zones, with its sources, is in
      the <Link to="/en/arabic-dialects-guide">Arabic dialects guide</Link>.
    </p>

    <h2>What this means for you</h2>
    <ul>
      <li><strong>Learn Lebanese</strong> → you speak in Damascus, Amman and Ramallah too.</li>
      <li><strong>Syrian or Palestinian family</strong> → a Lebanese course is directly useful; the handful of local words come from conversation.</li>
      <li><strong>You want one specific accent</strong> → that is what <Link to="/en/arabic-tutor">1-on-1 lessons</Link> are for; the teacher tunes the pronunciation to your target.</li>
      <li><strong>You want the wider picture</strong> → see <Link to="/en/arabic-dialects-guide/levantine-vs-gulf-arabic">Levantine vs Gulf Arabic</Link> and <Link to="/en/arabic-dialects-guide/levantine-vs-iraqi-arabic">Levantine vs Iraqi Arabic</Link>.</li>
    </ul>
  </EnLandingLayout>
);

export default LebaneseVsSyrian;
