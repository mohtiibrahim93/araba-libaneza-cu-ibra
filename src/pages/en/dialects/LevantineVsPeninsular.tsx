import { Link } from "@/components/LocalizedLink";
import EnLandingLayout from "../EnLandingLayout";
import ComparisonTable from "@/components/seo/ComparisonTable";
import { DIALECT_PARENTS_EN } from "./parents";

const FAQ = [
  {
    q: "What Arabic is spoken in Saudi Arabia?",
    a: "Not one variety. In the west, along the Red Sea, Hijazi — the speech of Jeddah, Mecca and Medina. In the centre, Najdi, the speech of Riyadh and the Najd plateau. In the east, on the Gulf coast, a variety close to Kuwaiti and Bahraini. All of them pronounce ق as a hard g, but they differ from each other in other sounds and in vocabulary.",
  },
  {
    q: "What is the difference between Levantine and Peninsular Arabic?",
    a: "Urban Levantine turns ق into a glottal stop (ʾāl); the Peninsular varieties keep a hard g (gāl). Levantine marks the present with the b- prefix and an action in progress with ʿam; the Peninsular varieties normally use the bare verb. High-frequency vocabulary differs, starting with 'I want': baddi in Levantine, abī or abgha in the peninsula.",
  },
  {
    q: "Is Peninsular Arabic closer to Standard Arabic?",
    a: "Some varieties do keep sounds that urban Levantine has lost, and the Yemeni dialects are among the most conservative in the Arab world. That does not make them easier to learn: their everyday vocabulary and intonation are as far from fusha as anywhere else, and no spoken variety is Standard Arabic.",
  },
  {
    q: "If I speak Levantine, will I manage in Saudi Arabia?",
    a: "Generally you will be understood: Levantine and Egyptian circulate throughout the region through music, drama and large expatriate communities. The reverse is harder at first, especially with fast Najdi speech. For formal or written contexts, Standard Arabic remains the shared reference.",
  },
  {
    q: "Are Hijazi and khaliji the same thing?",
    a: "No. Khaliji is the speech of the Gulf coast — Kuwait, Bahrain, Qatar, the UAE and eastern Saudi Arabia. Hijazi is the speech of western Saudi Arabia, on the Red Sea. They are neighbours and relatives, but distinguishable by ear, and Hijazi is usually described as sounding more neutral to the rest of the Arab world.",
  },
];

const LevantineVsPeninsular = () => (
  <EnLandingLayout
    slug="arabic-dialects-guide/levantine-vs-peninsular-arabic"
    title="Levantine Arabic vs Peninsular Arabic"
    metaTitle="Levantine vs Peninsular Arabic: Hijazi and Najdi"
    description="Hijazi, Najdi, Yemeni: what is spoken in Saudi Arabia and Yemen, how it differs from Levantine, and how far Lebanese Arabic gets you if you go there."
    crumb="Levantine vs Peninsular"
    parents={DIALECT_PARENTS_EN}
    lead="The peninsula does not speak one kind of Arabic. Here are its three main groups and what separates them from the speech of Lebanon and Syria."
    roHref="/dialecte-arabe/levantina-vs-peninsulara"
    courseSchema={false}
    faq={FAQ}
  >
    <h2>Short answer</h2>
    <p>
      By "Peninsular Arabic" this page means the varieties of the interior and west of the Arabian
      Peninsula: <strong>Hijazi</strong> (Jeddah, Mecca, Medina), <strong>Najdi</strong> (Riyadh
      and the central plateau) and the <strong>Yemeni dialects</strong>. The Gulf coast — Kuwait,
      Qatar, the UAE — is a separate group, covered in{" "}
      <Link to="/en/arabic-dialects-guide/levantine-vs-gulf-arabic">Levantine vs Gulf Arabic</Link>.
      Against Levantine, all three turn ق into a g, drop the Levantine <em>b-</em> present prefix,
      and use different words for the most common verbs.
    </p>

    <h2>Side by side</h2>
    <ComparisonTable
      caption="Levantine Arabic compared with the varieties of the Arabian Peninsula"
      columns={["Feature", "Levantine (shami)", "Hijazi (west)", "Najdi (centre)", "Yemeni"]}
      rows={[
        ["Where it is spoken", "Lebanon, Syria, Jordan, Palestine.", "Jeddah, Mecca, Medina.", "Riyadh and the Najd plateau.", "Yemen, in several varieties."],
        ["The letter ق", "Glottal stop: ʾāl.", "Hard g: gāl.", "Hard g: gāl.", "Often kept as a deep q, notably in Sanaa."],
        ["The letter ج", "Soft j.", "j, as in Standard Arabic.", "j, as in Standard Arabic.", "Pronounced g in Sanaa."],
        ["Present tense", "The b- prefix: baʿrif.", "Bare verb: aʿrif.", "Bare verb: aʿrif.", "Bare verb."],
        ["Action in progress", "ʿam + verb.", "gāʿid, or the bare verb.", "gāʿid, or the bare verb.", "Varies by area."],
        ["'I want'", "baddi", "abī / widdi", "abgha", "Varies: ashti, abghi and others."],
        ["Character", "Melodic, widely understood from media.", "Often described as sounding neutral.", "Distinctive affricates in some positions.", "Among the most conservative Arabic varieties."],
      ]}
    />

    <h2>The same sentence</h2>
    <p><em>"I want to drink a coffee."</em></p>
    <ul>
      <li><strong>Levantine (Lebanese):</strong> <em>baddi ishrab ʾahwe</em></li>
      <li><strong>Hijazi:</strong> <em>abī ashrab gahwa</em></li>
      <li><strong>Najdi:</strong> <em>abgha ashrab gahwa</em></li>
    </ul>

    <h2>Who understands whom</h2>
    <p>
      Speakers in the peninsula understand Levantine well: Lebanese music, Syrian drama and
      Egyptian film are consumed everywhere in the region, and Levantine expatriate communities are
      large. A Levantine speaker hearing fast Najdi for the first time gets the sense and loses the
      detail. As everywhere in the Arab world, when a conversation stalls people shift towards a
      neutral register close to Standard Arabic.
    </p>

    <h2>What to choose, by goal</h2>
    <ul>
      <li><strong>Family or friends in the Levant</strong> → Levantine, that is <Link to="/en/learn-lebanese-arabic">Lebanese Arabic</Link>.</li>
      <li><strong>Work or study in Saudi Arabia</strong> → a Levantine or Egyptian base keeps you in the conversation; the local accent comes on site.</li>
      <li><strong>Religious context, texts, the Qur'an</strong> → Standard Arabic. See <Link to="/en/lebanese-arabic-vs-msa-vs-egyptian">which Arabic to learn</Link>.</li>
      <li><strong>A short trip</strong> → a hundred basic phrases cover the usual situations; see the <Link to="/blog/lebanese-arabic-phrases">essential phrases</Link>.</li>
    </ul>

    <h2>The rest of the map</h2>
    <p>
      For the other comparisons:{" "}
      <Link to="/en/arabic-dialects-guide/levantine-vs-gulf-arabic">Levantine vs Gulf</Link>,{" "}
      <Link to="/en/arabic-dialects-guide/levantine-vs-iraqi-arabic">Levantine vs Iraqi</Link>,{" "}
      <Link to="/en/arabic-dialects-guide/levantine-vs-maghrebi-arabic">Levantine vs Maghrebi</Link> and{" "}
      <Link to="/en/arabic-dialects-guide/lebanese-vs-egyptian-arabic">Lebanese vs Egyptian</Link>.
      The overview, with maps, is in the{" "}
      <Link to="/en/arabic-dialects-guide">Arabic dialects guide</Link>.
    </p>
  </EnLandingLayout>
);

export default LevantineVsPeninsular;
