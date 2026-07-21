import { Link } from "react-router-dom";
import EnLandingLayout from "./EnLandingLayout";

const FAQ = [
  {
    q: "Are you a native Arabic speaker?",
    a: "Yes. Ibra is a native Lebanese Arabic speaker, based in Bucharest, with 5+ years of teaching experience (Preply and independent students worldwide). Native fluency plus real teaching training — not just a native speaker without a method.",
  },
  {
    q: "Which variety of Arabic do you teach?",
    a: "Primarily Lebanese Arabic (Levantine), the spoken dialect used across Lebanon, Syria, Jordan and Palestine. For students who need Modern Standard Arabic (MSA / Fusha) for reading, exams or professional writing, we layer that on top after the oral foundation.",
  },
  {
    q: "How much does 1-on-1 tutoring cost?",
    a: "150 LEI per 90-minute lesson (~€30), with a 15% discount on packages of 20+ lessons. The first 30-minute trial lesson is free. No subscription, no lock-in.",
  },
  {
    q: "How are lessons delivered?",
    a: "Live over Zoom, worldwide, in any time zone that overlaps with Bucharest (EET). In-person lessons are available in Bucharest, Romania. Materials, recordings and homework are shared through email and a shared drive.",
  },
  {
    q: "Do you offer a trial lesson?",
    a: "Yes — a free 30-minute trial. We assess your current level, understand your goal (travel, family, exam, business, kids), and you decide whether the method fits before committing.",
  },
  {
    q: "How do you track progress?",
    a: "CEFR-aligned checkpoints (A1 → C2), weekly informal reviews, and a formal progress assessment every 8–10 lessons. You'll know exactly what you can do, what's next, and where the gaps are.",
  },
];

const ArabicTutor = () => (
  <EnLandingLayout
    slug="arabic-tutor"
    title="Arabic tutor online — private 1-on-1 lessons with a native teacher"
    metaTitle="Arabic Tutor Online — Private 1-on-1 Lessons | Native Teacher"
    description="Private Arabic tutor online — 1-on-1 lessons with a native Lebanese teacher (5+ years experience). CEFR A1–C2, flexible schedule, free trial. €30 / 90 min."
    crumb="Arabic tutor"
    lead="Private Arabic tutoring with a native Lebanese teacher — live 1-on-1 lessons online worldwide, or in person in Bucharest. Personalized pace, real conversation from day one."
    faq={FAQ}
  >
    <p>
      Looking for an <strong>Arabic tutor</strong> who actually speaks the dialect you'll use in
      real life, and who has more than just native fluency? Ibra is a native Lebanese speaker with
      5+ years of teaching experience, working with students from Europe, North America and the
      Gulf on Zoom, and with in-person students in Bucharest.
    </p>

    <h2>What you get from a private tutor (vs a group course or app)</h2>
    <ul>
      <li><strong>100% attention:</strong> every minute is you speaking, being corrected, and moving forward — not waiting for other students.</li>
      <li><strong>Your goal, not a curriculum:</strong> travel, family, work, exam, kids, religion — the material bends to fit.</li>
      <li><strong>Flexible schedule:</strong> reschedule any lesson up to 24h before. No lock-in.</li>
      <li><strong>Faster progress:</strong> most 1-on-1 students hit A2 in 3–5 months vs 6–10 in a group.</li>
    </ul>

    <h2>How lessons work</h2>
    <p>
      Each lesson is 90 minutes, structured: 10 min recap of the previous lesson, 25 min new
      material (vocabulary + grammar via examples), 40 min applied conversation and role-play, 10
      min feedback + homework, 5 min close. You leave the lesson tired in a good way — not from
      grammar drills, but from having actually spoken Arabic for an hour.
    </p>

    <h2>What we teach</h2>
    <p>
      Primary focus: <Link to="/en/learn-lebanese-arabic">Lebanese Arabic</Link>, which gives you
      comprehension across the whole{" "}
      <Link to="/en/learn-levantine-arabic">Levantine region</Link> (Lebanon, Syria, Jordan,
      Palestine). Optional MSA / Fusha for reading and formal contexts. For the wider dialect
      landscape, see the <Link to="/en/arabic-dialects-guide">Arabic dialects guide</Link>.
    </p>

    <h2>Pricing</h2>
    <ul>
      <li><strong>Single lesson:</strong> 150 LEI / 90 min (~€30)</li>
      <li><strong>Package of 10:</strong> 1,425 LEI (5% off)</li>
      <li><strong>Package of 20:</strong> 2,550 LEI (15% off)</li>
      <li><strong>Trial lesson:</strong> free, 30 min</li>
    </ul>

    <p>
      <Link to="/trial">Book the free trial</Link> — 30 minutes, no card, no obligation. If it
      clicks, we schedule your first paid lesson before you leave the call.
    </p>
  </EnLandingLayout>
);

export default ArabicTutor;