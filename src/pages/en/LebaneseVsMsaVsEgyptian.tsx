import { Link } from "@/components/LocalizedLink";
import EnLandingLayout from "./EnLandingLayout";

const FAQ = [
  {
    q: "Is Lebanese Arabic the same as Arabic?",
    a: "Lebanese Arabic is a dialect of Arabic — it uses the Arabic script and shares most of its vocabulary with Modern Standard Arabic (MSA). What differs is pronunciation, simplified grammar, everyday word choice, and loanwords from French, Turkish and Aramaic. Think of MSA as the shared written 'Latin' and Lebanese as one of its living spoken descendants.",
  },
  {
    q: "Should I learn Egyptian or Levantine (Lebanese) Arabic?",
    a: "Egyptian has the biggest classical media footprint (cinema, older TV) and is understood almost everywhere thanks to that. Lebanese (Levantine) dominates modern pop music, satellite TV, and business across Lebanon, Syria, Jordan and Palestine, and is also very widely understood. Pick the one that matches your family, work, or travel plans — both are excellent choices.",
  },
  {
    q: "Is Levantine Arabic similar to MSA?",
    a: "They share roots and most vocabulary, so learning one makes the other easier. But sound and grammar diverge: Levantine drops case endings, uses simpler verb conjugations, softens or drops the ق, and relaxes long vowels. MSA sounds formal and 'read-aloud'; Levantine sounds like real people talking.",
  },
  {
    q: "Can Egyptians understand Levantine Arabic?",
    a: "Yes, usually with no adjustment. Decades of shared satellite TV (Lebanese pop, Syrian dramas, Egyptian films) mean speakers on both sides are used to hearing the other dialect. A Lebanese speaker in Cairo and an Egyptian in Beirut will understand each other easily.",
  },
  {
    q: "Which is easier for a beginner — Lebanese, Egyptian, or MSA?",
    a: "For spoken use, Lebanese and Egyptian are both easier than MSA: no case endings, more predictable everyday grammar, and pronunciation closer to how people actually talk. MSA is easier if you only want to read news, religious texts or formal documents. Most learners today start with a dialect and pick up MSA later if they need it.",
  },
  {
    q: "Do I need to learn MSA before learning Lebanese?",
    a: "No. You can go straight into Lebanese and speak from day one — that's how our courses are structured. MSA is a separate skill you can add later if your goals include reading news, working in formal Arab-language environments, or studying classical texts.",
  },
];

const Row = ({
  feature,
  msa,
  lebanese,
  egyptian,
}: {
  feature: string;
  msa: string;
  lebanese: string;
  egyptian: string;
}) => (
  <tr className="border-t border-border">
    <th scope="row" className="text-left font-semibold text-foreground align-top p-3 bg-muted/40">
      {feature}
    </th>
    <td className="align-top p-3 text-sm">{msa}</td>
    <td className="align-top p-3 text-sm">{lebanese}</td>
    <td className="align-top p-3 text-sm">{egyptian}</td>
  </tr>
);

const LebaneseVsMsaVsEgyptian = () => (
  <EnLandingLayout
    slug="lebanese-arabic-vs-msa-vs-egyptian"
    title="Lebanese Arabic vs MSA vs Egyptian Arabic — which one should you learn?"
    metaTitle="Lebanese vs MSA vs Egyptian Arabic — Full Comparison (2026)"
    description="Compare Lebanese Arabic, MSA/Fusha, and Egyptian Arabic by pronunciation, grammar, reach, and learning goals. A practical guide from a native teacher."
    crumb="Lebanese vs MSA vs Egyptian"
    lead="A practical side-by-side comparison of Lebanese Arabic, Modern Standard Arabic (MSA / Fusha) and Egyptian Arabic — how they sound, how they differ, and which one to learn depending on your goal."
    courseSchema={false}
    roHref="/ce-araba-sa-inveti"
    faq={FAQ}
  >
    <p>
      "Should I learn Lebanese, Egyptian, or MSA?" is one of the most common questions from new
      Arabic learners — and the honest answer is: <strong>they're not competing choices</strong>.
      MSA is the shared written standard. Lebanese and Egyptian are two of the biggest spoken
      dialects. Which one belongs in your life depends on <em>why</em> you want Arabic.
    </p>

    <h2>The 60-second summary</h2>
    <ul>
      <li>
        <strong>MSA (Modern Standard Arabic / Fusha)</strong> — the formal, pan-Arab written
        standard. Used in news, books, official speeches, and religious contexts. Nobody speaks it
        at home.
      </li>
      <li>
        <strong>Lebanese Arabic</strong> — a Levantine dialect, spoken in Lebanon and closely
        related to Syrian, Palestinian and Jordanian. Dominant in modern Arabic pop music,
        satellite TV, and Levantine business.
      </li>
      <li>
        <strong>Egyptian Arabic</strong> — the dialect of Egypt (~110 million speakers), spread
        globally through decades of cinema and classic television. The most widely understood
        spoken dialect in the Arab world.
      </li>
    </ul>

    <h2>Side-by-side comparison</h2>
    <div className="overflow-x-auto -mx-4 md:mx-0">
      <table className="min-w-full text-left border border-border rounded-lg overflow-hidden">
        <thead className="bg-muted">
          <tr>
            <th className="p-3 text-sm font-semibold text-foreground">Feature</th>
            <th className="p-3 text-sm font-semibold text-foreground">MSA (Fusha)</th>
            <th className="p-3 text-sm font-semibold text-foreground">Lebanese Arabic</th>
            <th className="p-3 text-sm font-semibold text-foreground">Egyptian Arabic</th>
          </tr>
        </thead>
        <tbody>
          <Row
            feature="Where it's spoken"
            msa="Nowhere natively — used in writing and formal speech across all 22 Arab states."
            lebanese="Lebanon; mutually intelligible with Syria, Palestine and Jordan."
            egyptian="Egypt (~110M speakers); widely understood everywhere else."
          />
          <Row
            feature="Everyday use"
            msa="Reading, news broadcasts, formal writing, religious contexts."
            lebanese="Home, work, music, TV, WhatsApp, social media."
            egyptian="Home, work, cinema, music, social media."
          />
          <Row
            feature="Grammar difficulty"
            msa="Hardest — full case endings, dual forms, complex verb conjugations."
            lebanese="Simpler — no case endings, streamlined verbs, more regular patterns."
            egyptian="Simpler — similar simplifications to Lebanese, with its own patterns."
          />
          <Row
            feature="Pronunciation of ق (qaf)"
            msa="Deep, back-of-throat q."
            lebanese="Usually a glottal stop (hamza) — 'qalb' → 'ʔalb'."
            egyptian="Usually a glottal stop as well — 'qalb' → 'ʔalb'."
          />
          <Row
            feature="Pronunciation of ج (jim)"
            msa="'j' as in English 'jam'."
            lebanese="'j' / soft 'zh' — like 'measure'."
            egyptian="Hard 'g' as in 'go' — 'gamal' instead of 'jamal'."
          />
          <Row
            feature="Loanwords"
            msa="Almost none — deliberately purist."
            lebanese="Heavy French and English influence; some Turkish and Aramaic."
            egyptian="English and some Turkish/Italian influence."
          />
          <Row
            feature="Media reach"
            msa="News (Al Jazeera, BBC Arabic), formal broadcasts."
            lebanese="Modern pop music (Fairuz, Wael Kfoury), satellite TV, MTV Lebanon."
            egyptian="Cinema (huge classical film library), TV drama, music."
          />
          <Row
            feature="Best if your goal is…"
            msa="Read newspapers, study Islam, work in formal or academic contexts."
            lebanese="Talk to Lebanese/Syrian/Jordanian/Palestinian family, do business in the Levant, understand modern Arabic pop."
            egyptian="Follow Egyptian cinema and older TV, live/work in Egypt."
          />
          <Row
            feature="How long to conversational"
            msa="12+ months (grammar-heavy)."
            lebanese="3–6 months of consistent practice (A1–A2)."
            egyptian="3–6 months of consistent practice (A1–A2)."
          />
        </tbody>
      </table>
    </div>

    <h2>How the same sentence sounds in each</h2>
    <p>Take a simple sentence: <em>"I want to drink coffee."</em></p>
    <ul>
      <li>
        <strong>MSA:</strong> <em>ʾurīdu an ashraba qahwatan</em> — grammatically complete, sounds
        formal, nobody talks like this at a café.
      </li>
      <li>
        <strong>Lebanese:</strong> <em>baddi ishrab ʾahwe</em> — short, relaxed, ق dropped to a
        glottal stop.
      </li>
      <li>
        <strong>Egyptian:</strong> <em>ʿāyiz ashrab ʾahwa</em> — different verb ("ʿāyiz" instead of
        "baddi"), same glottal stop on ق.
      </li>
    </ul>
    <p>
      Same alphabet, same core roots (ش-ر-ب "sh-r-b" = to drink), completely different flavour.
    </p>

    <h2>So — which one should you actually learn?</h2>
    <h3>Pick MSA if you want to…</h3>
    <ul>
      <li>Read Arabic news, books, or religious texts.</li>
      <li>Study Arabic academically or work in translation.</li>
      <li>Give formal speeches or work in pan-Arab media.</li>
    </ul>

    <h3>Pick Lebanese (Levantine) if you want to…</h3>
    <ul>
      <li>Talk with family or friends in Lebanon, Syria, Jordan, or Palestine.</li>
      <li>Understand modern Arabic music, satellite TV, and social media.</li>
      <li>Do business or travel across the Levant.</li>
      <li>
        Learn the dialect widely considered one of the most musical and expressive — see our{" "}
        <Link to="/en/learn-lebanese-arabic">Lebanese Arabic course</Link>.
      </li>
    </ul>

    <h3>Pick Egyptian if you want to…</h3>
    <ul>
      <li>Watch classic Egyptian cinema in the original.</li>
      <li>Live or work in Egypt specifically.</li>
      <li>Have a dialect maximally understood by casual listeners across all Arab countries.</li>
    </ul>

    <h2>Do you have to choose only one?</h2>
    <p>
      No. In practice, most serious learners end up with a spoken dialect <em>plus</em> passive MSA
      reading ability. Start with the dialect that matches your life — you'll speak from day one —
      and add MSA later if reading or formal contexts become important. Trying to learn all three
      at once dilutes progress in each.
    </p>

    <h2>Going deeper</h2>
    <p>
      This page answers the big question: standard or dialect, and which dialect. Below it sits the{" "}
      <Link to="/en/arabic-dialects-guide">Arabic dialects guide</Link>, which maps every family,
      and below that one page for each comparison people keep asking about:
    </p>
    <ul>
      <li><Link to="/en/arabic-dialects-guide/lebanese-vs-egyptian-arabic">Lebanese vs Egyptian</Link></li>
      <li><Link to="/en/arabic-dialects-guide/lebanese-vs-syrian-arabic">Lebanese vs Syrian, Palestinian, Jordanian</Link></li>
      <li><Link to="/en/arabic-dialects-guide/levantine-vs-gulf-arabic">Levantine vs Gulf Arabic</Link></li>
      <li><Link to="/en/arabic-dialects-guide/levantine-vs-iraqi-arabic">Levantine vs Iraqi Arabic</Link></li>
      <li><Link to="/en/arabic-dialects-guide/levantine-vs-maghrebi-arabic">Levantine vs Maghrebi Arabic</Link></li>
      <li><Link to="/en/arabic-dialects-guide/levantine-vs-peninsular-arabic">Levantine vs Peninsular Arabic</Link></li>
    </ul>

    <h2>Where Lebanese fits</h2>
    <p>
      Lebanese sits inside the broader Levantine Arabic{" "}
      family and, thanks to Lebanese music and satellite TV, is one of the most widely understood
      dialects across the Arab world. If you want the full map of the dialect landscape — Gulf,
      Maghrebi, Mesopotamian and more — see our{" "}
      <Link to="/en/arabic-dialects-guide">Arabic dialects guide</Link>.
    </p>
  </EnLandingLayout>
);

export default LebaneseVsMsaVsEgyptian;