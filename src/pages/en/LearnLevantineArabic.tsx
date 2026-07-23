import { Link } from "react-router-dom";
import EnLandingLayout from "./EnLandingLayout";

const FAQ = [
  {
    q: "What is Levantine Arabic?",
    a: "Levantine Arabic (also called Shami / Eastern Mediterranean Arabic) is the spoken dialect family of the Eastern Mediterranean: Lebanon, Syria, Jordan and Palestine. It's spoken natively by roughly 30–35 million people and is one of the most widely understood dialects across the Arab world thanks to Lebanese and Syrian media.",
  },
  {
    q: "How do I learn Levantine Arabic?",
    a: "The fastest path is oral-first: start speaking with a native teacher from lesson one, using arabizi (Latin transliteration) for the first 2–3 months, then layer the Arabic script on top once your ear is tuned. Two 90-minute lessons per week plus modest listening practice (Lebanese songs, series) gets most learners to basic conversation (A2) in 3–6 months.",
  },
  {
    q: "Is Levantine Arabic similar to MSA (Modern Standard Arabic)?",
    a: "They share most of the vocabulary root system and script, but the grammar is simpler in Levantine, the pronunciation is different (softer, faster, more vowels dropped), and many everyday words are unique to the dialect. MSA is written and formal; Levantine is what people actually speak. Learning one helps with the other, but they are not interchangeable in conversation.",
  },
  {
    q: "Is Levantine Arabic easy to learn?",
    a: "Compared to MSA, yes — noticeably. Levantine has simpler grammar (no case endings, simpler verb conjugation), and the oral-first method skips the alphabet hurdle for the first months. It's still a Semitic language with new sounds, so it needs consistent practice, but learners who avoid MSA-first curricula are usually speaking basic Levantine within weeks.",
  },
  {
    q: "Is Levantine Arabic the same as Lebanese Arabic?",
    a: "Lebanese is a variety of Levantine — specifically North Levantine, shared with Syrian. South Levantine covers Jordanian and Palestinian. The core grammar, most vocabulary, and pronunciation patterns overlap heavily, so learning Lebanese gives you roughly 90% comprehension across the whole Levantine region.",
  },
  {
    q: "Should I learn Levantine Arabic or Modern Standard Arabic (MSA)?",
    a: "If your goal is real conversation with people from Lebanon, Syria, Jordan or Palestine — start with Levantine. MSA is the written, formal register used in news and official contexts; nobody speaks it at home. You can add MSA later for reading if you need it.",
  },
  {
    q: "How long does it take to speak Levantine Arabic?",
    a: "With 2 lessons of 90 minutes per week plus modest practice, learners typically reach basic everyday conversation (A2) in 3–6 months, and comfortable fluency (B1/B2) in 1.5–2 years. The oral-first method (arabizi before the Arabic script) accelerates the first months substantially.",
  },
  {
    q: "Which Levantine variety do you teach — Lebanese, Syrian, Jordanian, Palestinian?",
    a: "We teach the Lebanese variety (North Levantine), which is mutually intelligible with Syrian and highly understood in Jordan and Palestine. Lebanese also has the widest media reach — songs, series, TV — which gives you plenty of listening practice outside class.",
  },
];

const LearnLevantineArabic = () => (
  <EnLandingLayout
    slug="learn-levantine-arabic"
    title="Learn Levantine Arabic online — through Lebanese, the most beautiful Levantine dialect"
    metaTitle="Learn Levantine Arabic Online — Native Teacher | A1–C2"
    description="Learn Levantine Arabic with a native Lebanese teacher — Lebanese is widely considered the most beautiful, melodic Levantine dialect and unlocks Syrian, Jordanian and Palestinian too. Live 1-on-1 and small-group courses online, A1–C2."
    crumb="Learn Levantine Arabic"
    lead="Live online courses in Levantine Arabic — taught through Lebanese, widely considered the most beautiful and melodic Levantine dialect and the media prestige variety of the region. One dialect, ~90% comprehension across Lebanon, Syria, Jordan and Palestine."
    faq={FAQ}
  >
    <p>
      Levantine Arabic (Shami) is the everyday spoken language of the Eastern Mediterranean — around
      30–35 million native speakers across Lebanon, Syria, Jordan and Palestine. It's one of the
      most widely understood Arabic dialects thanks to decades of Lebanese and Syrian music, cinema
      and TV. If you want to actually <em>talk</em> with people in the region, this is where you
      start.
    </p>

    <h2>The Levantine family — North and South</h2>
    <p>
      Linguists split Levantine into two closely related groups:
    </p>
    <ul>
      <li><strong>North Levantine:</strong> Lebanese and Syrian. Shared core grammar, near-identical pronunciation in many regions, ~95% mutual intelligibility.</li>
      <li><strong>South Levantine:</strong> Jordanian and Palestinian. Same family, small shifts in vocabulary and a few sounds.</li>
    </ul>
    <p>
      Border areas overlap heavily. Tripoli (northern Lebanon) shares features with coastal Syria;
      southern Lebanon has Palestinian influence, and vice versa. In practice, a fluent Lebanese
      speaker converses without friction with Syrians and understands Jordanians and Palestinians
      almost fully — the differences are the kind of thing a linguist notices, not a barrier for
      real conversation.
    </p>

    <h2>Why learn Lebanese as your Levantine gateway</h2>
    <p>
      We teach the Lebanese variety for three practical reasons:
    </p>
    <ul>
      <li><strong>Media reach:</strong> Lebanese songs, series and TV dominate Arab pop culture — endless listening practice.</li>
      <li><strong>Diaspora density:</strong> the Lebanese diaspora is one of the largest globally (Brazil, France, US, West Africa), so speakers to practice with are everywhere.</li>
      <li><strong>Prestige and clarity:</strong> Lebanese is considered a "clear" Levantine pronunciation and is easy to be understood in.</li>
    </ul>
    <p>
      For the deep dive on Lebanese specifically, see{" "}
      <Link to="/en/learn-lebanese-arabic">the Lebanese Arabic course page</Link>. For the full
      Arabic-dialects map (Levantine vs Egyptian vs Gulf vs Maghrebi), see{" "}
      <Link to="/en/arabic-dialects-guide">the Arabic dialects guide</Link>.
    </p>

    <h2>Levantine vs Modern Standard Arabic</h2>
    <p>
      Modern Standard Arabic (MSA / Fusha) is the written, formal register you'll see in news, laws
      and religious texts. Nobody speaks it at home, and native speakers switch to their dialect the
      moment the camera turns off. If your goal is real conversation, spoken Levantine is the
      shortest path. You can layer MSA on top later for reading and formal writing.
    </p>

    <h2>How we teach</h2>
    <ul>
      <li><strong>Oral first:</strong> you speak from lesson one, using arabizi (Latin transliteration). The Arabic script is introduced after 2–3 months, once your ear is tuned.</li>
      <li><strong>Native teacher:</strong> Ibra is a native Lebanese speaker with 5+ years of teaching experience.</li>
      <li><strong>CEFR structure:</strong> six levels A1 → C2, from survival to full fluency.</li>
      <li><strong>Online worldwide:</strong> live Zoom lessons in any time zone that overlaps with Bucharest (EET). In-person option in Bucharest.</li>
    </ul>

    <p>
      Ready to try it? <Link to="/trial">Book a free 30-minute trial lesson</Link> — no card, no
      obligation. Just show up, chat, decide.
    </p>
  </EnLandingLayout>
);

export default LearnLevantineArabic;