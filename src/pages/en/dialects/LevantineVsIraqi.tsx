import { Link } from "@/components/LocalizedLink";
import EnLandingLayout from "../EnLandingLayout";
import ComparisonTable from "@/components/seo/ComparisonTable";
import { DIALECT_PARENTS_EN } from "./parents";

const FAQ = [
  {
    q: "What is the difference between Levantine and Iraqi Arabic?",
    a: "Iraqi (Mesopotamian) Arabic pronounces ق as a hard g — hence the name of the group, gelet, 'I said' — where urban Levantine uses a glottal stop. Iraqi marks an action in progress with the prefix da- (da-aktib, 'I am writing'), Levantine with ʿam. Iraqi vocabulary also carries a visible layer of Turkish and Persian words that Levantine does not have.",
  },
  {
    q: "Can a Lebanese speaker understand an Iraqi?",
    a: "Partly, and with effort at first. The structure is the same and much vocabulary overlaps, but the pronunciation and the local words take getting used to. Iraqis usually understand Levantine better than the reverse, because Levantine drama and music circulate across the region.",
  },
  {
    q: "Is Iraqi Arabic harder than Lebanese?",
    a: "Not as a grammatical system — both dropped the case endings of Standard Arabic. In practice Iraqi is harder to study: far fewer courses, fewer subtitled series, and fewer teachers available outside Iraq.",
  },
  {
    q: "What dialect is spoken in Iraq?",
    a: "Across most of the country, Mesopotamian Arabic, with Baghdadi speech as the reference variety. The north also has qeltu-type Mesopotamian varieties, and Kurdish is an official language alongside Arabic, so in the Kurdistan region Arabic is not everyone's everyday language.",
  },
  {
    q: "I have Iraqi friends — which course should I take?",
    a: "A Levantine course gives you a base you can adjust: the grammar is shared and the differences come from conversation. If you want the Iraqi accent itself, a 1-on-1 lesson with someone who speaks it makes more sense than a group course.",
  },
];

const LevantineVsIraqi = () => (
  <EnLandingLayout
    slug="arabic-dialects-guide/levantine-vs-iraqi-arabic"
    title="Levantine Arabic vs Iraqi Arabic"
    metaTitle="Levantine vs Iraqi (Mesopotamian) Arabic"
    description="How different is Iraqi Arabic from Levantine? Pronunciation, verb prefixes, Turkish and Persian loanwords, and how much speakers actually understand."
    crumb="Levantine vs Iraqi"
    parents={DIALECT_PARENTS_EN}
    lead="Two neighbouring families with the same underlying grammar and two sounds that give them away instantly."
    roHref="/dialecte-arabe/levantina-vs-irakiana"
    courseSchema={false}
    faq={FAQ}
  >
    <h2>Short answer</h2>
    <p>
      <strong>Iraqi Arabic</strong>, also called Mesopotamian, is Levantine's eastern neighbour.
      The two share the skeleton of modern spoken Arabic but separate on pronunciation and
      everyday vocabulary. The quickest tell: Iraqi says <em>gāl</em> ("he said") where Beirut says{" "}
      <em>ʾāl</em>, and marks an action in progress with <em>da-</em> where Levantine uses{" "}
      <em>ʿam</em>. On top of that, Iraqi carries a layer of Turkish and Persian words Levantine
      does not.
    </p>

    <h2>Side by side</h2>
    <ComparisonTable
      caption="Levantine Arabic compared with Iraqi Arabic"
      columns={["Feature", "Levantine (shami)", "Iraqi (Mesopotamian)"]}
      rows={[
        ["Where it is spoken", "Lebanon, Syria, Jordan, Palestine.", "Iraq, plus border areas of eastern Syria and south-western Iran."],
        ["The letter ق", "Glottal stop in urban speech: ʾāl.", "Hard g: gāl — hence the group name, gelet."],
        ["The letter ك", "Stays k.", "Often affricated to ch next to front vowels."],
        ["Action in progress", "ʿam + verb: ʿam aktub.", "The da- prefix: da-aktib."],
        ["Future", "raḥ / ḥa- before the verb.", "raḥ, the same."],
        ["'How are you?'", "kīfak", "shlōnak"],
        ["'I want'", "baddi", "arīd"],
        ["Possession", "Suffixes, plus tabaʿ: l-bēt tabaʿi.", "Suffixes, plus māl: l-bēt māli."],
        ["Loanwords", "French, English, some Turkish.", "Turkish and Persian, in a much thicker layer."],
        ["Learning material", "Plenty: courses, drama, music, apps.", "Little outside Iraq."],
      ]}
    />

    <h2>The same sentence in both</h2>
    <p><em>"I want to drink a coffee."</em></p>
    <ul>
      <li><strong>Levantine (Lebanese):</strong> <em>baddi ishrab ʾahwe</em></li>
      <li><strong>Iraqi:</strong> <em>arīd ashrab gahwa</em></li>
    </ul>
    <p>
      The verb "to drink" is identical, coffee is the same word with a different ق, and "to want"
      is different again. The pattern repeats across the Arab world: shared roots, unshared
      high-frequency words.
    </p>

    <h2>Who understands whom</h2>
    <p>
      Iraqis usually follow Levantine without trouble — Lebanese and Syrian series are watched
      everywhere. In the other direction, a Levantine speaker needs a few days of exposure to
      settle into the Iraqi <em>g</em>, the <em>da-</em> prefix and the local vocabulary. It is a
      barrier of habit, not of language.
    </p>

    <h2>What to do about it</h2>
    <ul>
      <li><strong>Iraqi friends or colleagues</strong> → start with Levantine and tune the accent in <Link to="/en/arabic-tutor">1-on-1 lessons</Link>.</li>
      <li><strong>You want the whole map</strong> → the <Link to="/en/arabic-dialects-guide">Arabic dialects guide</Link>.</li>
      <li><strong>You want the southern neighbour</strong> → <Link to="/en/arabic-dialects-guide/levantine-vs-gulf-arabic">Levantine vs Gulf Arabic</Link>.</li>
      <li><strong>You don't know where to start</strong> → the <Link to="/en/trial">free trial lesson</Link> settles it in 30 minutes.</li>
    </ul>
  </EnLandingLayout>
);

export default LevantineVsIraqi;
