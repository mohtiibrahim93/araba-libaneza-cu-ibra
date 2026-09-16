import { Link } from "@/components/LocalizedLink";
import EnLandingLayout from "../EnLandingLayout";
import ComparisonTable from "@/components/seo/ComparisonTable";
import { DIALECT_PARENTS_EN } from "./parents";

const FAQ = [
  {
    q: "What is the difference between Levantine and Maghrebi Arabic?",
    a: "Maghrebi (darija) reduces or drops short vowels, producing consonant clusters that look impossible to someone used to Levantine: kteb, 'he wrote'. It conjugates the first person differently (nekteb 'I write', nketbu 'we write'), carries a thick layer of Berber, French and Spanish words, and uses different basic vocabulary. It is the Arabic dialect family furthest from Levantine.",
  },
  {
    q: "Can a Lebanese person understand a Moroccan?",
    a: "As a rule, not in a normal, fast conversation. Understanding is asymmetric: Moroccans, Algerians and Tunisians follow Levantine and Egyptian well, because they grew up on Middle Eastern media, but very little travels the other way. In practice people switch to Egyptian, French or Standard Arabic.",
  },
  {
    q: "Is darija a language or a dialect?",
    a: "'Darija' simply means everyday speech, and is used for the spoken Arabic of Morocco, Algeria and Tunisia. Linguistically these are Arabic dialects with a strong Berber substrate. In practice the distance from Standard Arabic and from the eastern dialects is large enough that many speakers treat them as separate languages.",
  },
  {
    q: "If I am going to Morocco, which Arabic should I learn?",
    a: "Moroccan darija, if the goal is talking to locals. Lebanese will not carry you there. Worth knowing too: French is widely used in Moroccan cities, and in tourist areas French or English will get you through.",
  },
  {
    q: "Why do Maghrebis understand easterners but not the other way round?",
    a: "Exposure, not structure. Egyptian films and Lebanese and Syrian series were broadcast across the Maghreb for decades, so ears there are trained on eastern speech. Maghrebi production travelled east far less, so Levantine speakers never got used to it.",
  },
];

const LevantineVsMaghrebi = () => (
  <EnLandingLayout
    slug="arabic-dialects-guide/levantine-vs-maghrebi-arabic"
    title="Levantine Arabic vs Maghrebi Arabic"
    metaTitle="Levantine vs Maghrebi Arabic (Darija)"
    description="Why can't a Lebanese and a Moroccan understand each other? Vowels, conjugation, Berber and French loanwords, and which Arabic you need for Morocco or Tunisia."
    crumb="Levantine vs Maghrebi"
    parents={DIALECT_PARENTS_EN}
    lead="The widest gap in the Arab world: two ends of the same language that, spoken quickly, no longer meet."
    roHref="/dialecte-arabe/levantina-vs-maghrebina"
    courseSchema={false}
    faq={FAQ}
  >
    <h2>Short answer</h2>
    <p>
      <strong>Maghrebi (darija)</strong> covers Morocco, Algeria, Tunisia and Libya.{" "}
      <strong>Levantine</strong> covers Lebanon, Syria, Jordan and Palestine. They are relatives,
      but distant ones: Maghrebi shortens vowels until dense consonant clusters remain, conjugates
      the first person differently, and brings in a thick layer of Berber, French and Spanish
      words. The result is the one pair in the Arab world where understanding genuinely breaks —
      and it breaks in one direction only.
    </p>

    <h2>Side by side</h2>
    <ComparisonTable
      caption="Levantine Arabic compared with Maghrebi Arabic"
      columns={["Feature", "Levantine (shami)", "Maghrebi (darija)"]}
      rows={[
        ["Where it is spoken", "Lebanon, Syria, Jordan, Palestine.", "Morocco, Algeria, Tunisia, Libya."],
        ["Short vowels", "Kept: katab, 'he wrote'.", "Reduced or dropped: kteb."],
        ["'I write' / 'we write'", "baktub / mnuktub", "nekteb / nketbu"],
        ["Negation", "Usually just ma in front.", "Wraps the verb: ma-ktebsh."],
        ["'Now'", "hallaʾ", "daba (Morocco)"],
        ["'A lot'", "ktīr", "bezzaf"],
        ["'Where?'", "wēn", "fīn"],
        ["Possession", "tabaʿ: l-bēt tabaʿi.", "dyal: d-dar dyali."],
        ["Loanwords", "French, English, some Turkish.", "Berber, French, Spanish."],
        ["Understood elsewhere", "Widely, through music and drama.", "Poorly, outside the Maghreb."],
      ]}
    />

    <h2>The same sentence in both</h2>
    <p><em>"I want to drink a coffee."</em></p>
    <ul>
      <li><strong>Levantine (Lebanese):</strong> <em>baddi ishrab ʾahwe</em></li>
      <li><strong>Maghrebi (Moroccan):</strong> <em>bghit nshrab qahwa</em></li>
    </ul>
    <p>
      Three words, three differences: another verb for "want" (<em>bghit</em>), another first-person
      prefix (<em>n-</em> instead of <em>a-</em>), and a ق pronounced as itself rather than as a
      glottal stop. None of it is random, but it all lands at once.
    </p>

    <h2>Why understanding runs one way</h2>
    <p>
      It is exposure, not structure. Decades of Egyptian film and Lebanese and Syrian drama reached
      every home in the Maghreb, so ears there are trained on eastern speech. Maghrebi production
      did not travel east the same way. The result is exactly what you observe in practice: a
      Moroccan follows a Lebanese conversation, a Lebanese is lost in a Moroccan one.
    </p>

    <h2>What to choose, by goal</h2>
    <ul>
      <li><strong>Morocco, Algeria, Tunisia</strong> → the local darija. Lebanese will not help you there.</li>
      <li><strong>Lebanon, Syria, Jordan, Palestine</strong> → Levantine. See <Link to="/en/learn-lebanese-arabic">Lebanese Arabic</Link>.</li>
      <li><strong>You want to be understood as widely as possible</strong> → Levantine or Egyptian; both travel across the Arab world, the Maghreb included.</li>
      <li><strong>You want to read Arabic</strong> → Standard Arabic, the same everywhere. See <Link to="/en/lebanese-arabic-vs-msa-vs-egyptian">which Arabic to learn</Link>.</li>
    </ul>

    <h2>The rest of the map</h2>
    <p>
      The Maghreb is the western extreme. For Levantine's eastern neighbours see{" "}
      <Link to="/en/arabic-dialects-guide/levantine-vs-iraqi-arabic">Levantine vs Iraqi</Link> and{" "}
      <Link to="/en/arabic-dialects-guide/levantine-vs-gulf-arabic">Levantine vs Gulf</Link>, and for
      the closest pair of all,{" "}
      <Link to="/en/arabic-dialects-guide/lebanese-vs-egyptian-arabic">Lebanese vs Egyptian</Link>.
    </p>
  </EnLandingLayout>
);

export default LevantineVsMaghrebi;
