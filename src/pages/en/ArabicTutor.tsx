import { Link } from "@/components/LocalizedLink";
import { Star, GraduationCap, Globe2, ShieldCheck } from "lucide-react";
import EnLandingLayout from "./EnLandingLayout";
import DirectAnswer from "@/components/seo/DirectAnswer";
import {
  ONLINE_PRICES,
  PRIVATE_PACKAGE_DISCOUNT,
  PRIVATE_PACKAGE_SIZE,
  privateDiscountFor,
} from "@/lib/pricing";

const FAQ = [
  {
    q: "Are you a native Arabic speaker?",
    a: "Yes. Ibra is a native Lebanese Arabic speaker, based in Bucharest, with 5+ years of teaching experience (Preply and independent students worldwide). Native fluency plus real teaching training — not just a native speaker without a method.",
  },
  {
    q: "What teaching experience and qualifications do you have?",
    a: "5+ years teaching Arabic to adult learners across Europe, North America and the Gulf — on Preply, independently online, and in person in Bucharest. Ongoing training in CEFR-based language pedagogy and the communicative method. Native fluency alone isn't enough — the method is what makes lessons work.",
  },
  {
    q: "Which variety of Arabic do you teach?",
    a: "Primarily Lebanese Arabic (Levantine), the spoken dialect used across Lebanon, Syria, Jordan and Palestine. For students who need Modern Standard Arabic (MSA / Fusha) for reading, exams or professional writing, we layer that on top after the oral foundation.",
  },
  {
    q: "What is your teaching methodology?",
    a: "Oral-first, communicative, CEFR-aligned. You speak from lesson one using arabizi (Latin transliteration), the course is spoken only up to B1 with optional Arabic script from B2, and every lesson is 70% real conversation / role-play, 30% new material. Grammar is taught through examples in context, not drilled from tables.",
  },
  {
    q: "How do you personalise lessons to my level and goals?",
    a: "The free trial doubles as a level check and goal-setting session — travel, family, work, exam prep, kids, religious reading — and every lesson from there uses vocabulary and scenarios tailored to what you actually need. The material bends to fit you, not the other way around.",
  },
  {
    q: "How much does 1-on-1 tutoring cost?",
    a: "150 LEI per 60-minute lesson (~€30), with automatic package discounts: 10% from 10 lessons and 20% from 20. The first 30-minute trial lesson is free. No subscription, no lock-in.",
  },
  {
    q: "What is your cancellation and rescheduling policy?",
    a: "Reschedule any lesson up to 24 hours before the start time at no cost. Cancellations under 24 hours count as a used lesson. No long-term contract, no hidden fees — packages are pay-once and used at your pace.",
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
  {
    q: "Do you have reviews or testimonials from past students?",
    a: "Yes — 5-star reviews on Preply from students across Europe, North America and the Gulf, plus written testimonials from long-term in-person students in Bucharest. Happy to share specific ones on request during the trial lesson.",
  },
];

const ArabicTutor = () => (
  <EnLandingLayout
    slug="arabic-tutor"
    roHref="/meditatii-araba"
    title="Arabic tutor online — private 1-on-1 lessons with a native teacher"
    metaTitle="Arabic Tutor Online — 1-on-1 Lessons | Native Teacher"
    description="Private Lebanese Arabic (Levantine) tutor — 1-on-1 lessons with a native teacher, 5+ years experience. CEFR A1–C2, flexible hours, free trial. 150 LEI / 60 min."
    crumb="Arabic tutor"
    lead="Private Arabic tutoring with a native Lebanese teacher — live 1-on-1 lessons online worldwide, or in person in Bucharest. Personalized pace, real conversation from day one."
    faq={FAQ}
  >
    <DirectAnswer question="What does a private Arabic tutor cost, and who teaches?">
      <p>
        A private Arabic lesson here is {ONLINE_PRICES.privateLesson} RON for 60 minutes
        one-to-one, with {Math.round(privateDiscountFor(10) * 100)}% off from ten lessons
        and {Math.round(PRIVATE_PACKAGE_DISCOUNT * 100)}% off from{" "}
        {PRIVATE_PACKAGE_SIZE} — no subscription, no minimum term. The tutor is{" "}
        <strong>Ibrahim Gabriel Moaty</strong> (Ibra), a native Lebanese speaker teaching
        from Bucharest for more than five years, live over video anywhere in the world or
        in person at Strada Icoanei 80. Lessons cover CEFR A1 to C2 in Lebanese Arabic —
        the Levantine dialect of Lebanon, Syria, Jordan and Palestine — and you speak in
        the first one, with the Arabic script kept optional.
      </p>
      <p>
        The first 30-minute lesson is free: a card confirms the slot, and nothing is
        charged for it.
      </p>
    </DirectAnswer>

    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 not-prose my-6">
      {[
        { icon: Star, title: "5.0 rating", desc: "21+ verified reviews across Preply and independent students." },
        { icon: GraduationCap, title: "5+ years teaching", desc: "Adult learners across Europe, N. America and the Gulf." },
        { icon: Globe2, title: "Native Lebanese", desc: "Born and raised speaker — real Levantine, not textbook Arabic." },
        { icon: ShieldCheck, title: "Free 30-min trial", desc: "Card confirmation secures the spot; the trial remains 0 LEI." },
      ].map(({ icon: Icon, title, desc }) => (
        <div key={title} className="rounded-xl border border-border bg-card p-4">
          <Icon className="w-4 h-4 text-primary mb-2" />
          <p className="text-sm font-semibold text-foreground">{title}</p>
          <p className="text-xs text-muted-foreground mt-1">{desc}</p>
        </div>
      ))}
    </div>

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
      <li><strong>Faster progress:</strong> most 1-on-1 students hit A2 in 3–5 months vs about 10 in a group.</li>
    </ul>

    <h2>How lessons work</h2>
    <p>
      Each private lesson is 60 minutes, structured: a short recap of the previous lesson, new
      material (vocabulary + grammar via examples), applied conversation and role-play — the
      largest part — and feedback + homework. You leave the lesson tired in a good way — not from
      grammar drills, but from having actually spoken Arabic for an hour.
    </p>

    <h2>What we teach</h2>
    <p>
      Primary focus: <Link to="/en/learn-lebanese-arabic">Lebanese Arabic</Link>, which gives you
      comprehension across the whole{" "}
      Levantine region (Lebanon, Syria, Jordan,
      Palestine). Optional MSA / Fusha for reading and formal contexts. For the wider dialect
      landscape, see the <Link to="/en/arabic-dialects-guide">Arabic dialects guide</Link>.
    </p>

    <h2>Pricing</h2>
    <ul>
      <li><strong>Single lesson:</strong> 150 LEI / 60 min (~€30)</li>
      <li><strong>Package of 10:</strong> 1,350 LEI (10% off)</li>
      <li><strong>Package of 20:</strong> 2,400 LEI (20% off)</li>
      <li><strong>Trial lesson:</strong> free, 30 min</li>
    </ul>

    <p>
      <Link to="/trial">Book the free trial</Link> — 30 minutes, 0 LEI, no obligation. If it
      clicks, we schedule your first paid lesson before you leave the call.
    </p>
  </EnLandingLayout>
);

export default ArabicTutor;