import { Link } from "@/components/LocalizedLink";
import EnLandingLayout from "../EnLandingLayout";
import ComparisonTable from "@/components/seo/ComparisonTable";
import { DIALECT_PARENTS_EN } from "./parents";

const FAQ = [
  {
    q: "What is the difference between Lebanese and Egyptian Arabic?",
    a: "They are two spoken varieties of the same language: close in grammar, clearly different to the ear. Egyptian pronounces ج as a hard g (gamal), Lebanese as a soft j (jamal). The most common verbs differ — 'I want' is ʿāyiz in Egyptian and baddi in Lebanese. Egyptian negation wraps the verb (ma…-sh); Lebanese usually puts ma in front and leaves it there. A speaker of either follows a conversation in the other without much trouble.",
  },
  {
    q: "Should I learn Lebanese or Egyptian Arabic?",
    a: "It depends who you want to talk to. If your family, partner or friends are from Lebanon, Syria, Jordan or Palestine, Lebanese is the direct choice. If you are aiming at Egypt, or want the widest passive understanding across the Arab world, Egyptian has decades of cinema behind it. Neither is more 'correct' than the other.",
  },
  {
    q: "Can Lebanese and Egyptian speakers understand each other?",
    a: "Yes, almost completely — but not symmetrically. Lebanese speakers grew up on Egyptian films and series, so they understand Egyptian very well. Egyptians pick up Levantine mostly from music and Syrian–Lebanese drama. In practice both adjust a handful of words and the conversation works.",
  },
  {
    q: "Is Egyptian Arabic easier than Lebanese?",
    a: "Neither is objectively easier. Both dropped the case endings of Standard Arabic and both have simpler grammar than it does. For a European learner Lebanese has one practical advantage: a thick layer of French and English sits in its everyday vocabulary.",
  },
  {
    q: "Which dialect has more speakers?",
    a: "Egyptian, by a wide margin: it is the dialect of Egypt, the most populous Arab country, with over a hundred million people. Levantine, the family Lebanese belongs to, is spoken natively by roughly 30–35 million across Lebanon, Syria, Jordan and Palestine.",
  },
];

const LebaneseVsEgyptian = () => (
  <EnLandingLayout
    slug="arabic-dialects-guide/lebanese-vs-egyptian-arabic"
    title="Lebanese Arabic vs Egyptian Arabic"
    metaTitle="Lebanese vs Egyptian Arabic: Every Difference"
    description="Lebanese or Egyptian Arabic? Compare pronunciation, grammar and vocabulary, see the same sentence in both, and get a straight answer on which to learn."
    crumb="Lebanese vs Egyptian"
    parents={DIALECT_PARENTS_EN}
    lead="The two Arabic dialects you hear most — one through music, the other through film. Here is what separates them, and which one is worth your time."
    roHref="/dialecte-arabe/libaneza-vs-egipteana"
    courseSchema={false}
    faq={FAQ}
  >
    <h2>Short answer</h2>
    <p>
      Lebanese and Egyptian Arabic are <strong>two spoken dialects</strong>, not two languages.
      Their grammar largely overlaps and both are far simpler than Standard Arabic. They part ways
      in <strong>pronunciation</strong> (ج: hard g in Cairo, soft j in Beirut), in the{" "}
      <strong>highest-frequency verbs</strong> ("want": <em>ʿāyiz</em> vs <em>baddi</em>) and in
      their <strong>loanword layer</strong> (English and Italian in Egyptian, French and English in
      Lebanese). Choose by the people you want to talk to, not by difficulty.
    </p>

    <h2>Side by side</h2>
    <ComparisonTable
      caption="Lebanese Arabic compared with Egyptian Arabic"
      columns={["Feature", "Lebanese (Levantine)", "Egyptian"]}
      rows={[
        ["Where it is spoken", "Lebanon; understood across Syria, Jordan, Palestine.", "Egypt; understood almost everywhere in the Arab world."],
        ["The letter ج", "Soft j, as in French 'jour': jamal.", "Hard g, as in 'go': gamal."],
        ["The letter ق", "Glottal stop in urban speech: ʾalb for qalb.", "Also a glottal stop in Cairo: ʾalb. Still g in Upper Egypt."],
        ["'I want'", "baddi", "ʿāyiz / ʿāwiz"],
        ["'Now'", "hallaʾ", "dilwaʾti"],
        ["'What?'", "shu", "eh"],
        ["'How are you?'", "kīfak", "izzayyak"],
        ["Negation", "Usually just ma in front: ma baʿrif.", "Wraps the verb: ma-baʿrafsh."],
        ["Future", "raḥ / ḥa- before the verb.", "ḥa- attached to the verb: ḥaktib."],
        ["'This house'", "Demonstrative first: hal-bēt.", "Demonstrative last: el-bēt da."],
        ["Loanwords", "Heavy French and English, some Turkish and Aramaic.", "English, some Turkish and Italian."],
        ["Media reach", "Modern music and satellite television.", "Cinema and drama, from the 1940s on."],
      ]}
    />

    <h2>The same sentence in both</h2>
    <p><em>"I want to drink a coffee."</em></p>
    <ul>
      <li><strong>Lebanese:</strong> <em>baddi ishrab ʾahwe</em></li>
      <li><strong>Egyptian:</strong> <em>ʿāyiz ashrab ʾahwa</em></li>
      <li><strong>Standard Arabic:</strong> <em>ʾurīdu an ashraba qahwatan</em></li>
    </ul>
    <p>
      Same root for "drink" (ش-ر-ب), same word for coffee, a completely different verb for "want".
      That is the whole relationship in miniature: the skeleton is shared, the words you say most
      often are not.
    </p>

    <h2>Who understands whom</h2>
    <p>
      Better than outsiders expect — but asymmetrically. Lebanese speakers grew up watching
      Egyptian films, so they follow Egyptian almost completely. Egyptians know Levantine from
      music and Syrian–Lebanese drama, a little less fluently. When a conversation stalls, both
      slide towards a neutral register close to Egyptian or Standard Arabic. The full map of the
      families is in the <Link to="/en/arabic-dialects-guide">Arabic dialects guide</Link>.
    </p>

    <h2>Which one to pick</h2>
    <ul>
      <li><strong>Family, partner or friends from Lebanon, Syria, Jordan, Palestine</strong> → Lebanese.</li>
      <li><strong>Ties to Egypt</strong> → Egyptian, without hesitation.</li>
      <li><strong>You want the widest passive reach and have no specific target</strong> → Egyptian has the broadest, Levantine is second and sounds the most neutral.</li>
      <li><strong>You want to read news or documents</strong> → neither: you need Standard Arabic. See <Link to="/en/lebanese-arabic-vs-msa-vs-egyptian">Lebanese vs MSA vs Egyptian</Link>.</li>
    </ul>

    <h2>What we teach, and why</h2>
    <p>
      Our courses teach <Link to="/en/learn-lebanese-arabic">Lebanese Arabic</Link> with a native
      teacher from Lebanon, because most of our students have a concrete tie to the Levant: family,
      a partner, colleagues, travel. If you are not sure where you fit, the{" "}
      <Link to="/en/quiz">course finder</Link> takes a minute, and the{" "}
      <Link to="/en/trial">trial lesson is free</Link>.
    </p>
  </EnLandingLayout>
);

export default LebaneseVsEgyptian;
