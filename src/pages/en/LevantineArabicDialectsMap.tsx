import { Link } from "react-router-dom";
import EnLandingLayout from "./EnLandingLayout";

const FAQ = [
  {
    q: "What does 'Levantine' mean?",
    a: "The Levant is the eastern Mediterranean region: Lebanon, Syria, Jordan, Palestine, and parts of southern Turkey. Levantine Arabic (called Shami by its speakers) is the group of closely related dialects spoken there by roughly 30–35 million people.",
  },
  {
    q: "What is the difference between North and South Levantine Arabic?",
    a: "North Levantine covers Lebanese and Syrian; South Levantine covers Palestinian and Jordanian. They share grammar and most vocabulary. The differences are mainly pronunciation (the qaf, vowel colouring, intonation) and a handful of everyday words — comparable to British vs American English.",
  },
  {
    q: "Is Lebanese Arabic the same as Syrian Arabic?",
    a: "Not identical, but very close. Lebanese and Damascene Syrian are mutually intelligible with almost no effort. Northern Lebanese (Tripoli) already sounds partly Syrian, and border areas blur in both directions.",
  },
  {
    q: "Which Levantine dialect should I learn?",
    a: "Lebanese is the most exported variety — Lebanese music, cinema and TV are consumed across the whole Arab world, so learning it means you are understood everywhere in the Levant and well beyond. If your family or work ties are Palestinian or Jordanian, start there instead; the switch later costs days, not months.",
  },
  {
    q: "Can Levantine speakers understand Egyptian or Gulf Arabic?",
    a: "Usually yes, thanks to decades of shared media. Egyptian is widely understood everywhere; Gulf is close enough with mild adjustment. Maghrebi dialects (Moroccan, Algerian) are the hard direction for Levantine speakers.",
  },
  {
    q: "In which language are your lessons taught?",
    a: "You choose. Ibra teaches fluently in English, French, Arabic and Romanian — lessons are Lebanese Arabic, but explanations happen in whichever of those languages you are most comfortable with.",
  },
];

const LevantineArabicDialectsMap = () => (
  <EnLandingLayout
    slug="levantine-arabic-dialects-map"
    roHref={null}
    title="Levantine Arabic dialects — a map of the Shami family"
    metaTitle="Levantine Arabic Dialects Map — North vs South Shami"
    description="Map of the Levantine Arabic dialects: North Levantine (Lebanese, Syrian) vs South Levantine (Palestinian, Jordanian) — sounds, differences, and where Lebanese fits in."
    crumb="Levantine dialects map"
    lead="Where each Levantine dialect is spoken, how North and South Shami differ, and why Lebanese is the most practical entry point into the family."
    courseSchema={false}
    faq={FAQ}
  >
    <p>
      Levantine Arabic — <em>Shami</em> to its speakers — is the Arabic of the eastern Mediterranean:
      Lebanon, Syria, Jordan and Palestine. Around 30–35 million people speak it as their first
      language. It is one branch of the wider{" "}
      <Link to="/en/arabic-dialects-guide">Arabic dialect family</Link>, and the branch most learners
      end up wanting, because it is the language of everyday conversation across the region.
    </p>

    <h2>The map at a glance</h2>
    <ul>
      <li><strong>North Levantine</strong> — Lebanon and Syria (Beirut, Tripoli, Damascus, Aleppo, Homs, Latakia).</li>
      <li><strong>South Levantine</strong> — Palestine and Jordan (Jerusalem, Ramallah, Gaza, Amman, Irbid).</li>
      <li><strong>Edges</strong> — Hatay in southern Turkey, the Bekaa toward the Syrian desert, and large diaspora communities in Brazil, France, the US, Germany and the Gulf.</li>
    </ul>

    <h2>North Levantine: Lebanese and Syrian</h2>
    <p>
      Lebanese and Damascene Syrian are close enough that speakers rarely notice they are switching
      varieties. The most audible marker is the <strong>qaf</strong>: in both Beirut and Damascus it
      is usually pronounced as a glottal stop (<em>ʾ</em>), so <em>qalb</em> ("heart") becomes{" "}
      <em>ʾalb</em>. Lebanese leans toward a lighter, more raised vowel colour (<em>imēle</em>) —
      Beirut's <em>kēn</em> against Damascus's <em>kān</em>.
    </p>
    <p>
      Lebanese also carries the heaviest French and English layer of any Arabic dialect: everyday
      speech mixes <em>bonjour</em>, <em>merci</em> and <em>ok</em> without a second thought. That is
      part of why it feels approachable to European learners — see{" "}
      <Link to="/en/learn-lebanese-arabic">the Lebanese course page</Link>.
    </p>

    <h2>South Levantine: Palestinian and Jordanian</h2>
    <p>
      Grammar is essentially the same as the north — same <em>b-</em> verb prefix, same pronouns,
      same negation pattern. What shifts is pronunciation and a slice of vocabulary. Rural and
      Bedouin Jordanian often keeps a hard <em>g</em> for the qaf (<em>galb</em>), while urban
      Jerusalem and Amman speech uses the same glottal stop as Beirut. Verb forms like{" "}
      <em>bidd-</em> ("want") and <em>halla ʾ</em> ("now") are shared across the whole family.
    </p>

    <h2>North vs South — the practical differences</h2>
    <ul>
      <li><strong>Qaf:</strong> glottal stop in cities everywhere; hard <em>g</em> in Bedouin and rural Jordanian.</li>
      <li><strong>Vowels:</strong> raised, "lighter" vowels in Lebanese; flatter in Palestinian and Jordanian.</li>
      <li><strong>Loanwords:</strong> French and English in Lebanon; more English in Jordan and Palestine.</li>
      <li><strong>Intonation:</strong> Lebanese has a distinctive sing-song rise that people recognise instantly.</li>
      <li><strong>Everything else:</strong> grammar, sentence structure and 90%+ of vocabulary are shared.</li>
    </ul>
    <p>
      In practice, a learner of any one Levantine dialect follows conversations in all four. The gap
      is smaller than the gap between Levantine and{" "}
      <Link to="/en/lebanese-arabic-vs-msa-vs-egyptian">Egyptian Arabic or MSA</Link>.
    </p>

    <h2>Where Lebanese fits — and why start there</h2>
    <p>
      Lebanese sits at the centre of the family: geographically between Syria and Palestine,
      culturally the region's biggest media exporter. Fairuz, Nancy Ajram, Lebanese cinema and
      Lebanese TV drama travel across the whole Arabic-speaking world, so Lebanese speech is
      understood far outside the Levant. Learning it gives you the widest passive reach for the
      smallest amount of work.
    </p>
    <p>
      If you want the concrete route from zero to conversation, read{" "}
      <Link to="/en/how-to-learn-lebanese-arabic">how to learn Lebanese Arabic</Link>, or start with
      the <Link to="/en/learn-levantine-arabic">Levantine Arabic overview</Link>.
    </p>

    <h2>What Levantine is not</h2>
    <p>
      Levantine is not Modern Standard Arabic. MSA is the written standard of news, contracts and
      literature — nobody grows up speaking it at home. Levantine is not Egyptian either, though the
      two are mutually intelligible after a little exposure. And it is not a single uniform accent:
      every city in the Levant has its own colouring, and that is normal, not a problem to solve.
    </p>
  </EnLandingLayout>
);

export default LevantineArabicDialectsMap;