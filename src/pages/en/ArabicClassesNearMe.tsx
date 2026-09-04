import { Link } from "react-router-dom";
import EnLandingLayout from "./EnLandingLayout";

const FAQ = [
  {
    q: "Where are your Arabic classes located?",
    a: "In-person classes are held in Bucharest, Romania (Strada Icoanei 80, sector 2). Live online classes are available worldwide over Zoom, in any time zone that overlaps with Bucharest (EET / UTC+2).",
  },
  {
    q: "Do you offer Arabic classes near me if I'm outside Bucharest?",
    a: "Yes — the live online format is identical to in-person: same native teacher, same small groups (max 6 online), same materials. Students from across Europe, North America and the Gulf take the same courses over Zoom. If you're in Bucharest, choose in-person; anywhere else, online is the answer.",
  },
  {
    q: "How much do the classes cost?",
    a: "Group courses: 500 LEI / month online, 700 LEI / month in person in Bucharest (~€100 / €140). Private 1-on-1 lessons: 150 LEI / 90 min (~€30). First 30-minute trial lesson is free.",
  },
  {
    q: "When do the classes run?",
    a: "Group courses run on fixed weekly schedules — in-person Mondays and Wednesdays 19:00–20:30, online Saturdays 12:00–13:30 and Sundays 17:30–19:00. Private lessons are scheduled around your calendar.",
  },
  {
    q: "Which dialect do you teach?",
    a: "Lebanese Arabic, a variety of Levantine Arabic that is understood across Lebanon, Syria, Jordan and Palestine (~30 million native speakers). Optional Modern Standard Arabic (MSA / Fusha) is available on top for students who need it for reading or exams.",
  },
  {
    q: "Is there a free trial?",
    a: "Yes — a free 30-minute trial lesson with a native teacher. No card, no obligation, no auto-enroll. Book it, show up, decide.",
  },
];

const ArabicClassesNearMe = () => (
  <EnLandingLayout
    slug="arabic-classes-near-me"
    roHref="/cursuri-araba-bucuresti"
    title="Arabic classes near me — Bucharest & online worldwide"
    metaTitle="Arabic Classes Near Me — Bucharest & Online | Native Teacher"
    description="Arabic classes in Bucharest or live online with a native Lebanese teacher. Small groups, CEFR A1–C2, practical conversation, free trial. From €100/month."
    crumb="Arabic classes near me"
    lead="In-person Arabic classes in Bucharest and live online classes worldwide, taught by a native Lebanese teacher. Small groups (max 6 online, 10 in person), CEFR-aligned A1–C2, or private 1-on-1 if you prefer."
  >
    <p>
      Looking for <strong>Arabic classes near you</strong>? Two options, same native teacher, same
      method:
    </p>
    <ul>
      <li><strong>In-person in Bucharest:</strong> Strada Icoanei 80, sector 2 — Mondays and Wednesdays 19:00–20:30.</li>
      <li><strong>Live online, worldwide:</strong> Saturdays 12:00–13:30 and Sundays 17:30–19:00 (EET) over Zoom — same small-group experience, no travel.</li>
    </ul>

    <h2>Why "near me" often means online</h2>
    <p>
      Outside a handful of European capitals, quality in-person Arabic classes with a native
      Levantine teacher are rare — most local schools teach Modern Standard Arabic, not the
      spoken dialect you'd actually use. Live online with a native teacher is usually closer to
      "near you" than driving 40 minutes to a class that teaches the wrong Arabic.
    </p>

    <h2>What the classes cover</h2>
    <p>
      <Link to="/en/learn-lebanese-arabic">Lebanese Arabic</Link> — a variety of{" "}
      <Link to="/en/arabic-dialects-guide">Levantine Arabic</Link> understood across Lebanon,
      Syria, Jordan and Palestine. Oral-first: you speak from lesson one, using arabizi (Latin
      transliteration), with the Arabic script layered on after 2–3 months. CEFR levels A1 → C2.
    </p>

    <h2>Class formats</h2>
    <ul>
      <li><strong>Group course, in person (Bucharest):</strong> 700 LEI / month, 4 lessons of 90 min per month, max 10 students.</li>
      <li><strong>Group course, online:</strong> 500 LEI / month, 4 lessons of 90 min per month, max 6 students.</li>
      <li><strong>Private 1-on-1:</strong> 150 LEI / 90 min — see the <Link to="/en/arabic-tutor">private Arabic tutor page</Link>.</li>
      <li><strong>Kids (7–14):</strong> in-person only, small groups, playful method.</li>
    </ul>

    <h2>Bucharest location</h2>
    <p>
      Strada Icoanei 80, sector 2, Bucharest — a 5-minute walk from Piața Rosetti, close to Metro
      Universitate and multiple bus lines. Free WhatsApp support to plan your first visit.
    </p>

    <p>
      <Link to="/trial">Book the free 30-minute trial</Link> — you'll meet Ibra, see the method
      live, and decide whether in-person or online fits your life better.
    </p>
  </EnLandingLayout>
);

export default ArabicClassesNearMe;