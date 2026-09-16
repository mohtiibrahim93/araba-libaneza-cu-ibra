import { Link } from "@/components/LocalizedLink";
import EnLandingLayout from "./EnLandingLayout";
import CreditedFigure from "@/components/content/CreditedFigure";
import levantineDialectsMap from "@/assets/levantine-dialects-map.png.asset.json";
import arabicDialectsMap from "@/assets/arabic-dialects-map.webp";

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
    q: "What is the difference between North and South Levantine Arabic?",
    a: "North Levantine covers Lebanese and Syrian; South Levantine covers Palestinian and Jordanian. They share grammar and most vocabulary. The differences are mainly pronunciation (the qaf, vowel colouring, intonation) and a handful of everyday words — comparable to British vs American English.",
  },
  {
    q: "Is Lebanese Arabic the same as Syrian Arabic?",
    a: "Not identical, but very close. Lebanese and Damascene Syrian are mutually intelligible with almost no effort. Northern Lebanese (Tripoli) already sounds partly Syrian, and border areas blur in both directions.",
  },
  {
    q: "Can speakers from different Arab countries understand each other?",
    a: "It depends on the pair. Levantine, Egyptian and Gulf speakers usually understand each other with mild adjustment thanks to shared media exposure. Maghrebi dialects (especially Moroccan and Algerian) can be hard for eastern Arabs to follow unless the speaker slows down or switches toward MSA. Everyone can fall back on MSA when needed.",
  },
];

const ArabicDialectsGuide = () => (
  <EnLandingLayout
    slug="arabic-dialects-guide"
    roHref="/dialecte-arabe"
    title="Arabic dialects — the complete guide (Levantine, Egyptian, Gulf, Maghrebi & more)"
    metaTitle="Arabic Dialects & Map: Levantine, Egyptian, Gulf & More"
    description="Explore Arabic dialects with a clear map of Levantine, Egyptian, Gulf, Maghrebi and Iraqi Arabic, plus MSA, explained by a native Lebanese teacher."
    crumb="Arabic dialects guide"
    parents={[{ name: "Which Arabic to learn", href: "/en/lebanese-arabic-vs-msa-vs-egyptian" }]}
    lead="A practical, non-academic guide to the Arabic dialect landscape — written by a native Lebanese teacher. What each family sounds like, where it's spoken, and how they relate to each other."
    courseSchema={false}
  >
    <p>
      "Arabic" is not a single language — it's a family of related spoken dialects, plus a shared
      written standard (Modern Standard Arabic / MSA). The dialects diverged over centuries the way
      Romance languages diverged from Latin: Italian, Spanish and French all descend from Latin, but
      a Roman and a Parisian don't chat in Latin. Same idea. Below is the map, region by region.
    </p>

    <CreditedFigure
      src={arabicDialectsMap}
      alt="Map of the Arabic dialects by region, from Moroccan and Hassaniya in the west to Gulf and Omani in the east, with Levantine on the eastern Mediterranean"
      caption="The Arabic dialects by region — twenty-six labelled varieties, all related, and not one of them Modern Standard Arabic. Levantine sits on the eastern Mediterranean; the section below breaks it down."
      credit={{
        title: "Arabic Dialects",
        author: "Rafy",
        sourceHref: "https://commons.wikimedia.org/wiki/File:Arabic_Dialects.svg",
        licence: "CC BY 3.0",
        licenceHref: "https://creativecommons.org/licenses/by/3.0/",
      }}
    />

    <h2>1. Levantine Arabic (Shami)</h2>
    <p>
      Spoken across the Eastern Mediterranean by ~30–35 million people. <em>Shami</em> to its own
      speakers, it is the branch most learners end up wanting, because it is the language of
      everyday conversation across four countries at once.
    </p>

    <CreditedFigure
      src={levantineDialectsMap.url}
      className="w-full max-w-md"
      alt="Map of the Levantine Arabic dialects: North Levantine (North-eastern, Nusayrieh, Central) and South Levantine (Palestinian, South-eastern, Outer southern)"
      caption="The Levantine (Shami) dialect area. Beirut and Damascus sit in the same Central zone of North Levantine — which is why the two sound so close. After Behnstedt, Palva and Seeger."
      credit={{
        title: "Levantine Arabic Map v4",
        author: "Hurayshi",
        sourceHref: "https://commons.wikimedia.org/wiki/File:Levantine_Arabic_Map_v4.png",
        licence: "CC BY-SA 3.0",
        licenceHref: "https://creativecommons.org/licenses/by-sa/3.0/",
      }}
    />

    <h3>The Levantine map at a glance</h3>
    <ul>
      <li><strong>North Levantine</strong> — Lebanon and Syria (Beirut, Tripoli, Damascus, Aleppo, Homs, Latakia). Nearly identical grammar, ~95% mutual intelligibility.</li>
      <li><strong>South Levantine</strong> — Palestine and Jordan (Jerusalem, Ramallah, Gaza, Amman, Irbid). Same family, small shifts in vocabulary and a few sounds.</li>
      <li><strong>Edges</strong> — Hatay in southern Turkey, the Bekaa toward the Syrian desert, and large diaspora communities in Brazil, France, the US, Germany and the Gulf.</li>
    </ul>

    <h3>North Levantine: Lebanese and Syrian</h3>
    <p>
      Lebanese and Damascene Syrian are close enough that speakers rarely notice they are switching
      varieties. The most audible marker is the <strong>qaf</strong>: in both Beirut and Damascus it
      is usually pronounced as a glottal stop (<em>ʾ</em>), so <em>qalb</em> ("heart") becomes{" "}
      <em>ʾalb</em>. Lebanese leans toward a lighter, more raised vowel colour (<em>imēle</em>) —
      Beirut's <em>kēn</em> against Damascus's <em>kān</em>. Lebanese also carries the heaviest
      French and English layer of any Arabic dialect: everyday speech mixes <em>bonjour</em>,{" "}
      <em>merci</em> and <em>ok</em> without a second thought, which is part of why it feels
      approachable to European learners.
    </p>

    <h3>South Levantine: Palestinian and Jordanian</h3>
    <p>
      Grammar is essentially the same as the north — same <em>b-</em> verb prefix, same pronouns,
      same negation pattern. What shifts is pronunciation and a slice of vocabulary. Rural and
      Bedouin Jordanian often keeps a hard <em>g</em> for the qaf (<em>galb</em>), while urban
      Jerusalem and Amman speech uses the same glottal stop as Beirut. Verb forms like{" "}
      <em>bidd-</em> ("want") and <em>hallaʾ</em> ("now") are shared across the whole family.
    </p>

    <h3>North vs South — the practical differences</h3>
    <ul>
      <li><strong>Qaf:</strong> glottal stop in cities everywhere; hard <em>g</em> in Bedouin and rural Jordanian.</li>
      <li><strong>Vowels:</strong> raised, "lighter" vowels in Lebanese; flatter in Palestinian and Jordanian.</li>
      <li><strong>Loanwords:</strong> French and English in Lebanon; more English in Jordan and Palestine.</li>
      <li><strong>Intonation:</strong> Lebanese has a distinctive sing-song rise that people recognise instantly.</li>
      <li><strong>Everything else:</strong> grammar, sentence structure and 90%+ of vocabulary are shared.</li>
    </ul>
    <p>
      Border regions blur the boundaries further: Tripoli sounds partly Syrian, southern Lebanon
      shares features with Palestine, and so on across every land border in the region. In practice
      a learner of any one Levantine variety follows conversations in all four countries — the gap
      is far smaller than the gap between Levantine and Egyptian or MSA.
    </p>
    <p>
      Lebanese sits at the centre of the family: geographically between Syria and Palestine,
      culturally the region's biggest media exporter. Fairuz, Nancy Ajram, Lebanese cinema and TV
      drama travel across the whole Arabic-speaking world, so Lebanese speech is understood far
      outside the Levant — the widest passive reach for the smallest amount of work. If you want to
      learn it, see <Link to="/en/learn-lebanese-arabic">the Lebanese Arabic course page</Link>.
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

    <h2>The comparisons, one by one</h2>
    <p>
      This page is the map. Every pair people actually compare has its own page, with a table,
      examples and a direct answer to "which one should I learn?":
    </p>
    <ul>
      <li><Link to="/en/arabic-dialects-guide/lebanese-vs-egyptian-arabic">Lebanese vs Egyptian Arabic</Link> — the two dialects you hear most.</li>
      <li><Link to="/en/lebanese-arabic-vs-msa-vs-egyptian">Lebanese vs MSA vs Egyptian</Link> — spoken dialect against the written standard.</li>
      <li><Link to="/en/arabic-dialects-guide/lebanese-vs-syrian-arabic">Lebanese vs Syrian, Palestinian and Jordanian</Link> — how much the accent really matters.</li>
      <li><Link to="/en/arabic-dialects-guide/levantine-vs-gulf-arabic">Levantine vs Gulf Arabic (khaliji)</Link> — what is spoken in the UAE, Qatar and Kuwait.</li>
      <li><Link to="/en/arabic-dialects-guide/levantine-vs-iraqi-arabic">Levantine vs Iraqi Arabic</Link> — the eastern neighbour, with a different g and different loanwords.</li>
      <li><Link to="/en/arabic-dialects-guide/levantine-vs-maghrebi-arabic">Levantine vs Maghrebi Arabic (darija)</Link> — the widest gap in the Arab world.</li>
      <li><Link to="/en/arabic-dialects-guide/levantine-vs-peninsular-arabic">Levantine vs Peninsular Arabic</Link> — Hijazi, Najdi and the Yemeni dialects.</li>
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
      huge media reach, wide diaspora, and 90%+ comprehension across the whole Levantine region.
      For the step-by-step route from zero to conversation, read{" "}
      <Link to="/en/how-to-learn-lebanese-arabic">how to learn Lebanese Arabic</Link>. If
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
