import { Link } from "@/components/LocalizedLink";
import EnLandingLayout from "./EnLandingLayout";

const FAQ = [
  {
    q: "What is the best Arabic course to actually speak the language?",
    a: "A spoken-dialect course with a native teacher. For most learners that means Lebanese Arabic (Levantine) — the dialect spoken in Lebanon, Syria, Jordan and Palestine. Modern Standard Arabic (MSA / Fusha) is the written language of news and documents; nobody speaks it at home, which is why many learners finish a full MSA year unable to hold a conversation.",
  },
  {
    q: "How do I recognise a good Arabic course?",
    a: "Five signals: the teacher is a native speaker of the dialect taught; you speak from lesson one instead of drilling the alphabet for three months; groups are capped at 8 students; the syllabus is CEFR-aligned (A1–C2) with real assessments; and the price is published openly with a trial lesson available.",
  },
  {
    q: "Group classes or private 1-on-1 lessons?",
    a: "Groups win on motivation, peer conversation and cost (from 500 LEI / month). Private lessons win on speed and specific goals (150 LEI per 60-minute lesson, with package discounts). The most effective mix for most learners is a group plus one or two private lessons a month for weak spots.",
  },
  {
    q: "Can Duolingo replace an Arabic course?",
    a: "Not for dialect. Duolingo teaches Modern Standard Arabic, focuses on reading and gives no pronunciation correction — a real problem in Arabic, where sounds like ع, ح and ق don't exist in most European languages. Apps are useful vocabulary maintenance between lessons, not a replacement.",
  },
  {
    q: "How much should a good Arabic course cost?",
    a: "In Bucharest a serious group course runs 450–600 LEI per month and a private lesson 130–200 LEI per hour. Ours: 500 LEI / month for groups (2 × 90 min per week) and 150 LEI per 60-minute private lesson, with discounts up to 20% on packages. The first 30-minute trial lesson is free.",
  },
];

const BestArabicCourse = () => (
  <EnLandingLayout
    slug="best-arabic-course"
    roHref="/cel-mai-bun-curs-de-araba"
    title="The best Arabic course: how to choose in 2026 (group, private, online or app)"
    metaTitle="Best Arabic Course 2026 — How to Choose | Lebanese vs MSA"
    description="Compare Lebanese Arabic, MSA, group, private and online courses. See prices, common mistakes and choose the best Arabic course for your goals."
    crumb="Best Arabic course"
    lead="There is no single best Arabic course — only the best course for your goal. This guide compares Lebanese Arabic against Modern Standard Arabic, groups against private lessons, and courses against apps, so you don't lose a year on the wrong choice."
    faq={FAQ}
  >
    <p>
      The most common regret among Arabic learners: a full year of{" "}
      <strong>Modern Standard Arabic</strong> (MSA / Fusha) and still no ability to hold a simple
      conversation with a native speaker. The reason is structural — MSA is the written language of
      news and official documents, not the language anyone speaks at home. If your goal is speaking,
      the best Arabic course is a <strong>dialect</strong> course, and the most widely useful dialect
      for Europe-based learners is <strong>Lebanese Arabic (Levantine)</strong>, spoken across
      Lebanon, Syria, Jordan and Palestine.
    </p>

    <h2>Decision one: Lebanese (Levantine) or Modern Standard Arabic?</h2>
    <div className="overflow-x-auto not-prose">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b border-border text-left text-muted-foreground">
            <th className="py-2 pr-3 font-semibold">Criterion</th>
            <th className="py-2 px-3 font-semibold">Lebanese / Levantine</th>
            <th className="py-2 pl-3 font-semibold">Modern Standard (MSA)</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-border/60 align-top">
            <td className="py-2 pr-3 font-semibold">Where you use it</td>
            <td className="py-2 px-3">Real conversation, family, travel, music, series, social media</td>
            <td className="py-2 pl-3">Press, documents, religious texts, exams</td>
          </tr>
          <tr className="border-b border-border/60 align-top">
            <td className="py-2 pr-3 font-semibold">Time to first conversation</td>
            <td className="py-2 px-3">2–4 weeks</td>
            <td className="py-2 pl-3">6–12 months</td>
          </tr>
          <tr className="border-b border-border/60 align-top">
            <td className="py-2 pr-3 font-semibold">Alphabet required upfront</td>
            <td className="py-2 px-3">No — start with Arabizi</td>
            <td className="py-2 pl-3">Yes</td>
          </tr>
          <tr className="border-b border-border/60 align-top">
            <td className="py-2 pr-3 font-semibold">Understood by natives</td>
            <td className="py-2 px-3">Yes across the Levant, widely understood elsewhere</td>
            <td className="py-2 pl-3">Understood, but sounds formal or bookish when spoken</td>
          </tr>
        </tbody>
      </table>
    </div>
    <p>
      The full breakdown with example sentences is in{" "}
      <Link to="/en/lebanese-arabic-vs-msa-vs-egyptian">Lebanese vs MSA vs Egyptian Arabic</Link> and{" "}
      <Link to="/en/arabic-dialects-guide">the Arabic dialects guide</Link>.
    </p>

    <h2>Decision two: group, private, online or app</h2>
    <div className="overflow-x-auto not-prose">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b border-border text-left text-muted-foreground">
            <th className="py-2 pr-3 font-semibold">Format</th>
            <th className="py-2 px-3 font-semibold">Best for</th>
            <th className="py-2 px-3 font-semibold">Price</th>
            <th className="py-2 pl-3 font-semibold">Limitation</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-border/60 align-top">
            <td className="py-2 pr-3 font-semibold">Group course A1–C2</td>
            <td className="py-2 px-3">Motivation, peer conversation, value</td>
            <td className="py-2 px-3">from 500 LEI / month</td>
            <td className="py-2 pl-3">Fixed schedule, shared pace</td>
          </tr>
          <tr className="border-b border-border/60 align-top">
            <td className="py-2 pr-3 font-semibold"><Link to="/en/arabic-tutor">Private 1-on-1</Link></td>
            <td className="py-2 px-3">Specific goals, fastest progress, flexible hours</td>
            <td className="py-2 px-3">150 LEI / 60 min (−10% / −20% packages)</td>
            <td className="py-2 pl-3">Higher hourly cost</td>
          </tr>
          <tr className="border-b border-border/60 align-top">
            <td className="py-2 pr-3 font-semibold"><Link to="/en/learn-lebanese-arabic">Online over Zoom</Link></td>
            <td className="py-2 px-3">Learners outside Bucharest, diaspora, any time zone</td>
            <td className="py-2 px-3">Same price as in person</td>
            <td className="py-2 pl-3">Requires self-discipline</td>
          </tr>
          <tr className="border-b border-border/60 align-top">
            <td className="py-2 pr-3 font-semibold">Apps (Duolingo etc.)</td>
            <td className="py-2 px-3">Vocabulary upkeep between lessons</td>
            <td className="py-2 px-3">Free / subscription</td>
            <td className="py-2 pl-3">MSA only, no pronunciation feedback, no conversation</td>
          </tr>
        </tbody>
      </table>
    </div>

    <h2>Five criteria for comparing any Arabic course</h2>
    <ul>
      <li><strong>Native speaker of the dialect taught.</strong> For Lebanese, a native Lebanese teacher — living pronunciation and idiom don't come from textbooks.</li>
      <li><strong>You speak from lesson one.</strong> If the first months are alphabet drills and grammar tables, you'll quit before you speak.</li>
      <li><strong>Small groups (max 6 online, 10 in person).</strong> Past that, your own speaking time drops below five minutes per lesson.</li>
      <li><strong>CEFR structure (A1–C2)</strong> with an assessment every 8–10 lessons, so your level is an objective fact.</li>
      <li><strong>Public pricing and a trial lesson.</strong> A good course has no reason to hide either.</li>
    </ul>

    <h2>What we offer, and who we're not right for</h2>
    <p>
      At <Link to="/">Centrul de Arabă Libaneză cu Ibra</Link> we teach{" "}
      <strong>Lebanese Arabic (Levantine) only</strong>, with a native Lebanese teacher, in person in
      Bucharest (Strada Icoanei 80) and online worldwide. Formats: group levels A1–C2,{" "}
      <Link to="/en/arabic-tutor">private 1-on-1 lessons</Link>, a kids course (ages 6–10) and{" "}
      <Link to="/en/arabic-for-teenagers">teen groups (11–17)</Link>. We're not the right fit if you
      need strictly Modern Standard Arabic for an academic exam — we'll tell you that plainly during
      the free trial.
    </p>
    <p>
      The fastest way to find out whether it fits:{" "}
      <Link to="/trial">the free 30-minute trial lesson</Link>.
    </p>
  </EnLandingLayout>
);

export default BestArabicCourse;
