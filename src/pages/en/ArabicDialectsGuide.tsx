import { Link } from "react-router-dom";
import EnLandingLayout from "./EnLandingLayout";

const FAQ = [
  {
    q: "Is Lebanese Arabic actually Arabic?",
    a: "Yes. Lebanese is one of the many spoken varieties of Arabic. All Arabic dialects share the same root system, most core vocabulary, and a common written standard (MSA). The spoken forms diverged over centuries the way Romance languages diverged from Latin — related, but distinct enough that not all dialects are mutually intelligible.",
  },
  {
    q: "Do Lebanese people speak Arabic?",
    a: "Yes, Arabic (Lebanese dialect) is the everyday language of Lebanon and one of the country's official languages. Many Lebanese also speak French and English fluently, especially in Beirut, but Arabic is the native language spoken at home and across the country.",
  },
  {
    q: "What are the main Arabic dialect families?",
    a: "Broadly: Levantine (Lebanon, Syria, Jordan, Palestine), Egyptian–Sudanese, Maghrebi (Libya through Mauritania), Peninsular (Gulf + Saudi + South Arabian in Yemen and Oman), Mesopotamian (Iraq), and peripheral Arabic-official regions (Chad, Djibouti, Somalia, Comoros). MSA / Fusha sits on top as the shared written standard.",
  },
  {
    q: "Which Arabic dialect is easiest to learn — and most useful?",
    a: "Levantine (especially Lebanese) and Egyptian are the two most commonly recommended for learners: both have huge media presence (music, cinema, TV), both are widely understood across the Arab world, and both have plenty of learning resources. Which one is 'best' depends on your target region and personal connections.",
  },
  {
    q: "Can speakers from different Arab countries understand each other?",
    a: "It depends on the pair. Levantine, Egyptian and Gulf speakers usually understand each other with mild adjustment thanks to shared media exposure. Maghrebi dialects (especially Moroccan and Algerian) can be hard for eastern Arabs to follow unless the speaker slows down or switches toward MSA. Everyone can fall back on MSA when needed.",
  },
];

const ArabicDialectsGuide = () => (
  <EnLandingLayout
    slug="arabic-dialects-guide"
    title="Arabic dialects — the complete guide (Levantine, Egyptian, Gulf, Maghrebi & more)"
    metaTitle="Arabic Dialects Guide — Levantine, Egyptian, Gulf, Maghrebi | 2026"
    description="Complete guide to Arabic dialects: Levantine (Lebanese, Syrian, Jordanian, Palestinian), Egyptian–Sudanese, Maghrebi, Peninsular (Gulf, Saudi, Yemeni), Mesopotamian, plus MSA. Written by a native Lebanese teacher."
    crumb="Arabic dialects guide"
    lead="A practical, non-academic guide to the Arabic dialect landscape — written by a native Lebanese teacher. What each family sounds like, where it's spoken, and how they relate to each other."
    courseSchema={false}
  >
    <p>
      "Arabic" is not a single language — it's a family of related spoken dialects, plus a shared
      written standard (Modern Standard Arabic / MSA). The dialects diverged over centuries the way
      Romance languages diverged from Latin: Italian, Spanish and French all descend from Latin, but
      a Roman and a Parisian don't chat in Latin. Same idea. Below is the map, region by region.
    </p>

    <h2>1. Levantine Arabic (Shami)</h2>
    <p>
      Spoken across the Eastern Mediterranean by ~30–35 million people. Two sub-groups, with heavy
      border overlap:
    </p>
    <ul>
      <li><strong>North Levantine:</strong> Lebanese and Syrian. Nearly identical grammar, high mutual intelligibility.</li>
      <li><strong>South Levantine:</strong> Jordanian and Palestinian. Same family, small shifts in vocabulary and pronunciation.</li>
    </ul>
    <p>
      Border regions blur the boundaries: Tripoli (northern Lebanon) sounds partly Syrian; southern
      Lebanon shares features with Palestine, and vice versa across every land border in the region.
      Read more on <Link to="/en/learn-levantine-arabic">the Levantine Arabic page</Link>.
    </p>

    <h2>2. Egyptian–Sudanese</h2>
    <p>
      Egyptian Arabic (Masri) is the most-heard dialect in the Arab world thanks to a century of
      Egyptian cinema, TV and music — most Arabs from Morocco to the Gulf can follow it. Sudanese
      Arabic is closely related but distinct enough that some linguists treat it as its own family;
      it shares features with both Egyptian and Peninsular Arabic due to geography and history.
    </p>

    <h2>3. Maghrebi Arabic</h2>
    <p>
      Spoken from Libya west to Mauritania: Libyan, Tunisian, Algerian, Moroccan and Hassaniya
      (Mauritania and parts of Western Sahara). Maghrebi dialects have heavy Berber influence and
      French/Spanish loanwords, and they are the hardest group for eastern Arabs to understand
      cold — especially Moroccan and Algerian. Tunisian sits transitionally between Maghrebi and
      Levantine/Egyptian in feel, but is officially classified as Maghrebi.
    </p>

    <h2>4. Peninsular Arabic</h2>
    <p>
      The Arabian Peninsula splits into three internally distinct groups:
    </p>
    <ul>
      <li><strong>Gulf Arabic:</strong> UAE, Kuwait, Bahrain, Qatar (and eastern Saudi Arabia). Their own recognizable subgroup.</li>
      <li><strong>Saudi (Najdi / Hijazi):</strong> Central and western Saudi Arabia. Related to Gulf but distinct.</li>
      <li><strong>South Arabian:</strong> Yemeni and Omani. Historically the most conservative Arabic varieties — even in antiquity, southern Arabia had its own South Semitic language family, and modern Yemeni/Omani reflect that older stratum.</li>
    </ul>

    <h2>5. Mesopotamian Arabic (Iraqi)</h2>
    <p>
      Iraqi Arabic and closely related border varieties in eastern Syria, southwestern Iran
      (Khuzestan) and southern Turkey. Distinct enough — heavy Aramaic, Persian and Turkish
      influence — that it's usually treated as its own group rather than lumped with Gulf or
      Levantine, even though it borders both.
    </p>

    <h2>6. Peripheral Arabic-official regions</h2>
    <p>
      Some countries have Arabic as an official language but with local varieties that are hard to
      classify neatly:
    </p>
    <ul>
      <li><strong>Chad:</strong> not officially an Arab-League member in the same way, but Chadian Arabic is widely spoken and patterns closest to Libyan / Maghrebi.</li>
      <li><strong>Djibouti, Somalia, Comoros:</strong> Arabic is an official or co-official language, but daily life happens in local languages (Somali, Afar, Comorian). Given historical Yemeni and Omani presence in the Horn of Africa and Indian Ocean coast, the Arabic used there likely carries South Arabian influence — this classification is debated among linguists.</li>
    </ul>

    <h2>MSA vs the dialects</h2>
    <p>
      Modern Standard Arabic (MSA, or Fusha) is the written and formal register — what you'll see in
      newspapers, religious texts, laws and news broadcasts. Everyone learns it at school; nobody
      speaks it at home. If you're learning Arabic to <em>talk to people</em>, you start with a
      dialect. If you're learning to <em>read the news or the Quran</em>, you start with MSA. Most
      practical learners layer them: dialect first for speaking, MSA later for reading.
    </p>

    <h2>Where to start</h2>
    <p>
      For most learners with no specific regional tie, we recommend starting with{" "}
      <Link to="/en/learn-lebanese-arabic">Lebanese Arabic</Link> — a North Levantine variety with
      huge media reach, wide diaspora, and 90%+ comprehension across the whole Levantine region. If
      you want private lessons tailored to your goal, see the{" "}
      <Link to="/en/arabic-tutor">Arabic tutor page</Link>.
    </p>
    <p>
      <strong>You don't need to be in Bucharest.</strong> Lessons run live on Zoom with a native
      Lebanese teacher, so you can learn from anywhere —{" "}
      <Link to="/en/arabic-tutor">private 1-on-1 lessons</Link> are available now and start whenever
      suits your timezone. The online beginner group is currently full; leave your details on the{" "}
      <Link to="/cursuri/grup/a1?mod=online">A1 online page</Link> and we'll email you first when the
      next one opens. Either way, the{" "}
      <Link to="/trial">trial lesson is free</Link> — 30 minutes, no card, no obligation.
    </p>
  </EnLandingLayout>
);

export default ArabicDialectsGuide;