import { Link } from "react-router-dom";
import EnLandingLayout from "./EnLandingLayout";

const FAQ = [
  {
    q: "What age are the teen Arabic classes for?",
    a: "Ages 11–17. From 16, teenagers can join the regular adult groups (A1–C2) with a parent's consent. For ages 6–10 we run a separate play-based kids course in Bucharest.",
  },
  {
    q: "Which Arabic do teenagers learn here?",
    a: "Lebanese Arabic (Levantine) — the dialect actually spoken in Lebanon, Syria, Jordan and Palestine. It's the Arabic in the music, series and TikTok clips teenagers already watch, which motivates them far more than Modern Standard Arabic textbooks.",
  },
  {
    q: "Are teen classes in person or online?",
    a: "Both. In person in Bucharest (Strada Icoanei 80) or live on Zoom. At this age online works well — teenagers are used to the format and can hold attention for 90 minutes with a break.",
  },
  {
    q: "My teenager doesn't know the Arabic alphabet. Is that a problem?",
    a: "No. We start orally with Arabizi (Arabic written in Latin letters and numbers) — exactly how young Lebanese people text. The Arabic script is introduced gradually, once spoken vocabulary is already there.",
  },
  {
    q: "How much do teen Arabic classes cost?",
    a: "Same as the adult groups: from 500 LEI / month for a group (2 × 90-minute lessons per week), or 150 LEI per 60-minute private lesson with package discounts. The first 30-minute trial lesson is free.",
  },
];

const ArabicForTeenagers = () => (
  <EnLandingLayout
    slug="arabic-for-teenagers"
    roHref="/cursuri-araba-adolescenti"
    title="Lebanese Arabic for teenagers (11–17) — Bucharest and online"
    metaTitle="Lebanese Arabic Classes for Teenagers | Bucharest & Online"
    description="Lebanese Arabic classes for ages 11–17 with a native teacher, online or in Bucharest. Build real conversation skills from the first lesson. Free trial."
    crumb="Arabic for teenagers"
    lead="Lebanese Arabic groups designed for 11–17 year olds: conversation, music and real social-media language instead of grammar drills. Native Lebanese teacher, in person in Bucharest or online."
    faq={FAQ}
  >
    <p>
      Teenagers learn a language when they can use it immediately. That's why our{" "}
      <strong>Lebanese Arabic classes for teenagers</strong> (11–17) start from the living language —
      the Levantine dialect spoken in Lebanon, Syria, Jordan and Palestine — rather than the Modern
      Standard Arabic of textbooks that nobody speaks in conversation.
    </p>

    <h2>Who it's for</h2>
    <ul>
      <li><strong>Teens from Lebanese or Arab families</strong> who want to talk to grandparents, cousins and relatives back home.</li>
      <li><strong>Teens with no family connection</strong> who are into Arabic music, series, TikTok or travel.</li>
      <li><strong>Students adding a third language</strong> that is genuinely rare and useful (Arabic has 400+ million speakers).</li>
      <li><strong>Mixed families</strong> where one parent is a native speaker.</li>
    </ul>

    <h2>What a lesson looks like</h2>
    <p>
      90 minutes at a brisk pace: 10 min recap, 25 min new vocabulary and structures through real
      material (messages, song lyrics, film scenes), 40 min conversation and role-play, 15 min
      pronunciation feedback. No dictation, no long memorisation lists — homework is short and audio.
      The method is <strong>Oral First</strong>: you speak from lesson one, using Arabizi.
    </p>

    <h2>Ages and pathway</h2>
    <div className="overflow-x-auto not-prose">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b border-border text-left text-muted-foreground">
            <th className="py-2 pr-3 font-semibold">Age</th>
            <th className="py-2 px-3 font-semibold">Recommended format</th>
            <th className="py-2 pl-3 font-semibold">Where</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-border/60 align-top">
            <td className="py-2 pr-3 font-semibold">6–10</td>
            <td className="py-2 px-3">Play-based kids course</td>
            <td className="py-2 pl-3">In person, Bucharest</td>
          </tr>
          <tr className="border-b border-border/60 align-top">
            <td className="py-2 pr-3 font-semibold">11–15</td>
            <td className="py-2 px-3">Teen group (forming) or private 1-on-1</td>
            <td className="py-2 pl-3">In person or online</td>
          </tr>
          <tr className="border-b border-border/60 align-top">
            <td className="py-2 pr-3 font-semibold">16–17</td>
            <td className="py-2 px-3">Adult groups A1–C2, with parental consent</td>
            <td className="py-2 pl-3">In person or online</td>
          </tr>
        </tbody>
      </table>
    </div>
    <p>
      Dedicated 11–15 groups open once 4–8 students have registered interest. You can reserve a place
      below — we'll notify you the moment a group
      starts, and in the meantime{" "}
      <Link to="/en/arabic-tutor">private lessons</Link> are available immediately.
    </p>

    <h2>Pricing</h2>
    <ul>
      <li><strong>Group:</strong> from 500 LEI / month (2 × 90 min per week), 10% off when the level is paid in full.</li>
      <li><strong>Private 1-on-1:</strong> 150 LEI per 60-minute lesson, with −10% from 10 lessons and −20% from 20.</li>
      <li><strong>Trial lesson (30 min):</strong> free, with a parent present if they prefer.</li>
    </ul>

    <h2>Native teacher, in Bucharest or online</h2>
    <p>
      Ibra is a native Lebanese Arabic speaker with 5+ years of teaching experience, and teaches in
      English, French, Arabic or Romanian — whichever the teenager is most comfortable with. In-person
      lessons run at Raduga Creative Center (Strada Icoanei 80, Bucharest); online lessons run on
      Zoom. See also{" "}
      <Link to="/en/best-arabic-course">how to choose the best Arabic course</Link> and{" "}
      <Link to="/en/arabic-classes-near-me">Arabic classes in Bucharest</Link>.
    </p>
  </EnLandingLayout>
);

export default ArabicForTeenagers;
