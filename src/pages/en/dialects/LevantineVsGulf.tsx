import { Link } from "@/components/LocalizedLink";
import EnLandingLayout from "../EnLandingLayout";
import ComparisonTable from "@/components/seo/ComparisonTable";
import { DIALECT_PARENTS_EN } from "./parents";

const FAQ = [
  {
    q: "What is the difference between Levantine and Gulf Arabic?",
    a: "Levantine is spoken in Lebanon, Syria, Jordan and Palestine; Gulf Arabic (khaliji) in Kuwait, Bahrain, Qatar, the UAE and eastern Saudi Arabia. The clearest marker is ق: urban Levantine turns it into a glottal stop (ʾāl), Gulf keeps a hard g (gāl). Verb morphology differs too — in Levantine b- marks the present, in Gulf it leans towards intention or the future.",
  },
  {
    q: "If I speak Levantine, will I be understood in Dubai or Doha?",
    a: "Generally yes. Gulf speakers are heavily exposed to Levantine and Egyptian media, so they follow you easily. The other direction is harder: fast khaliji, with its own vocabulary, takes getting used to. Gulf cities are also largely English-speaking workplaces.",
  },
  {
    q: "What dialect is spoken in the UAE?",
    a: "Gulf Arabic (khaliji), in its Emirati variety, part of the same group as Kuwaiti, Bahraini, Qatari and eastern Saudi speech. The population is mostly expatriate, so on the street you will hear as much English, Hindi, Urdu or Tagalog as Arabic.",
  },
  {
    q: "Is it worth learning khaliji if I work in the Gulf?",
    a: "If you deal directly with native speakers — clients, government, families — yes. In an international corporate environment English covers the working day, and a base in Levantine or Egyptian opens personal relationships, since both are widely understood there.",
  },
  {
    q: "Is Gulf Arabic closer to Standard Arabic than Levantine?",
    a: "In some respects: it more often keeps consonants that urban Levantine has lost, such as ث and ذ. That does not make it easier to learn — its everyday vocabulary and intonation are as far from fusha as anywhere else.",
  },
];

const LevantineVsGulf = () => (
  <EnLandingLayout
    slug="arabic-dialects-guide/levantine-vs-gulf-arabic"
    title="Levantine Arabic vs Gulf Arabic"
    metaTitle="Levantine vs Gulf Arabic (Khaliji): The Differences"
    description="Levantine or khaliji? Compare pronunciation, verbs and vocabulary, see who understands whom, and find out which dialect helps if you work in the Gulf."
    crumb="Levantine vs Gulf"
    parents={DIALECT_PARENTS_EN}
    lead="Two dialect families separated by a thousand kilometres of desert. They understand each other partly — and not equally in both directions."
    roHref="/dialecte-arabe/levantina-vs-golf"
    courseSchema={false}
    faq={FAQ}
  >
    <h2>Short answer</h2>
    <p>
      <strong>Levantine (shami)</strong> is spoken in Lebanon, Syria, Jordan and Palestine.{" "}
      <strong>Gulf Arabic (khaliji)</strong> covers Kuwait, Bahrain, Qatar, the UAE and eastern
      Saudi Arabia. They are related but not interchangeable: several consonants are pronounced
      differently, part of the verb morphology diverges, and a solid layer of vocabulary is simply
      not shared. A Gulf speaker understands Levantine more easily than the reverse, because
      Levantine and Egyptian media travel everywhere and Gulf media much less.
    </p>

    <h2>Side by side</h2>
    <ComparisonTable
      caption="Levantine Arabic compared with Gulf Arabic"
      columns={["Feature", "Levantine (shami)", "Gulf (khaliji)"]}
      rows={[
        ["Where it is spoken", "Lebanon, Syria, Jordan, Palestine.", "Kuwait, Bahrain, Qatar, UAE, eastern Saudi Arabia."],
        ["The letter ق", "Glottal stop in urban speech: ʾāl.", "Hard g: gāl."],
        ["The letter ك", "Stays k throughout.", "Often affricated to ch next to front vowels."],
        ["ث and ذ", "Usually lost, becoming t and d.", "More often kept, as in Standard Arabic."],
        ["The b- prefix", "Marks the present: baʿrif — 'I know'.", "Leans towards intention or the future."],
        ["Action in progress", "ʿam + verb: ʿam bishrab.", "Bare verb, or gāʿid in front of it."],
        ["'How are you?'", "kīfak", "shlōnak"],
        ["'I want'", "baddi", "abī / arīd"],
        ["Loanwords", "French, English, some Turkish.", "Persian, English, Hindi and Urdu."],
        ["Media reach", "Music and drama broadcast region-wide.", "More local production, less exported."],
      ]}
    />

    <h2>The same sentence in both</h2>
    <p><em>"I want to drink a coffee."</em></p>
    <ul>
      <li><strong>Levantine (Lebanese):</strong> <em>baddi ishrab ʾahwe</em></li>
      <li><strong>Gulf:</strong> <em>abī ashrab gahwa</em></li>
    </ul>
    <p>
      The same word for coffee, carrying the two values of ق — <em>ʾahwe</em> in Beirut,{" "}
      <em>gahwa</em> in Kuwait. The verb "to want" is entirely different, and that happens exactly
      at the words you use most.
    </p>

    <h2>Who understands whom</h2>
    <p>
      Asymmetrically, as almost everywhere in the Arab world. Gulf speakers follow Lebanese drama
      and Egyptian film without difficulty, so Levantine is easy for them. A Levantine speaker
      hearing fast khaliji for the first time gets the gist and loses the detail, mostly on local
      vocabulary. Context rescues a lot: across the region people shift towards a neutral register
      close to Egyptian or Standard Arabic.
    </p>

    <h2>What to choose, by goal</h2>
    <ul>
      <li><strong>Family or friends in the Levant</strong> → Levantine. See <Link to="/en/learn-lebanese-arabic">Lebanese Arabic</Link>.</li>
      <li><strong>Work in the UAE, Qatar or Kuwait with native clients</strong> → khaliji is most direct, but Levantine or Egyptian keeps you in the conversation.</li>
      <li><strong>Widest reach across the Arab world</strong> → Levantine or Egyptian, not khaliji.</li>
      <li><strong>Documents, contracts, news</strong> → Standard Arabic. See <Link to="/en/lebanese-arabic-vs-msa-vs-egyptian">which Arabic to learn</Link>.</li>
    </ul>

    <h2>The rest of the map</h2>
    <p>
      The Gulf is not Levantine's only neighbour. For the rest:{" "}
      <Link to="/en/arabic-dialects-guide/levantine-vs-iraqi-arabic">Levantine vs Iraqi Arabic</Link>,{" "}
      <Link to="/en/arabic-dialects-guide/levantine-vs-peninsular-arabic">Levantine vs Peninsular Arabic</Link>{" "}
      and <Link to="/en/arabic-dialects-guide/levantine-vs-maghrebi-arabic">Levantine vs Maghrebi Arabic</Link>.
      The overview is in the <Link to="/en/arabic-dialects-guide">Arabic dialects guide</Link>.
    </p>
  </EnLandingLayout>
);

export default LevantineVsGulf;
