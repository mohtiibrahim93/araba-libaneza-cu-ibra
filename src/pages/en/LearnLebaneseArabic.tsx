import { Link } from "react-router-dom";
import { CheckCircle2, Globe, Users, GraduationCap, MessageCircle, BookOpen, Star, ShieldCheck } from "lucide-react";
import EnLandingLayout from "./EnLandingLayout";

const FAQ = [
  {
    q: "What is Lebanese Arabic exactly?",
    a: "Lebanese Arabic is the spoken dialect of Lebanon. It belongs to the Levantine Arabic family (together with Syrian, Jordanian and Palestinian), so what you learn is understood across the whole Levant. It is not the same as Modern Standard Arabic (MSA / Fusha), the formal written language used in news and official documents.",
  },
  {
    q: "Should I learn Lebanese Arabic or Modern Standard Arabic first?",
    a: "If your goal is to speak with people — family, friends, travel, media — start with Lebanese Arabic. MSA is the written, formal register; almost no one speaks it at home. Lebanese gets you to real conversations faster, and you can add MSA later if you need reading or formal skills.",
  },
  {
    q: "Are the courses online or in person?",
    a: "Both. Online lessons over Zoom are available worldwide (any time zone overlapping with Bucharest / EET). In-person lessons and group courses take place in Bucharest, Romania. Group courses run twice a week; private 1-on-1 lessons are scheduled flexibly.",
  },
  {
    q: "Who is the teacher?",
    a: "Ibra — a native Lebanese Arabic speaker with 5+ years of teaching experience (Preply and independent students), based in Bucharest. Lessons combine native pronunciation, cultural context and a structured CEFR method.",
  },
  {
    q: "How much do Lebanese Arabic courses cost?",
    a: "Group courses start at 500 LEI / month (≈ €100) online, with monthly or full-payment options (10% discount for the full level). Private 1-on-1 lessons are 150 LEI / lesson (≈ €30). A 30-minute trial lesson is free.",
  },
  {
    q: "What language are lessons taught in?",
    a: "You pick. Ibra teaches fluently in English, French, Arabic and Romanian — pick whichever you're most comfortable with. Lessons are not taught in German or other languages.",
  },
];

const LearnLebaneseArabic = () => (
  <EnLandingLayout
    slug="learn-lebanese-arabic"
    title="Learn Lebanese Arabic online with a native teacher"
    metaTitle="Learn Lebanese Arabic Online | Native Teacher, Free Trial"
    description="Learn Lebanese Arabic (Levantine dialect) with a native instructor. Live 1-on-1 and small-group courses online worldwide, from beginner (A1) to advanced. Speak from lesson one — free trial."
    crumb="Learn Lebanese Arabic"
    lead="Live 1-on-1 and small-group courses in the Lebanese dialect — the everyday Levantine Arabic spoken by ~30 million people. Speak from lesson one, without starting from the alphabet. From beginner (A1) to advanced (C2)."
    faq={FAQ}
    courseSchema
    roHref="/cursuri-araba"
  >
    <div className="rounded-2xl border border-border bg-gradient-to-br from-primary/5 to-primary/[0.02] p-5 md:p-6 not-prose my-6">
      <div className="flex flex-wrap items-center gap-4 md:gap-6">
        <div className="flex items-center gap-2">
          <div className="flex" aria-label="Rated 5 out of 5">
            {[0, 1, 2, 3, 4].map((i) => (
              <Star key={i} className="w-4 h-4 fill-primary text-primary" />
            ))}
          </div>
          <span className="text-sm font-semibold text-foreground">5.0 · 21+ reviews</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-foreground/80">
          <GraduationCap className="w-4 h-4 text-primary" />
          <span><strong className="text-foreground">Native Lebanese teacher</strong> — 5+ years experience</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-foreground/80">
          <ShieldCheck className="w-4 h-4 text-primary" />
          <span><strong className="text-foreground">Free trial, no card</strong> — 30 minutes</span>
        </div>
      </div>
    </div>

    <div className="grid sm:grid-cols-3 gap-4 not-prose my-8">
      {[
        { icon: Globe, title: "Online worldwide", desc: "Lessons over Zoom in any time zone that overlaps with Bucharest (EET)." },
        { icon: Users, title: "1-on-1 or small group", desc: "Private lessons tailored to your goals, or groups of 4–10 learners." },
        { icon: GraduationCap, title: "CEFR A1 → C2", desc: "Six levels, from survival Lebanese to full fluency." },
      ].map(({ icon: Icon, title, desc }) => (
        <div key={title} className="rounded-xl border border-border bg-card p-5">
          <Icon className="w-5 h-5 text-primary mb-2" />
          <h3 className="text-sm font-bold text-foreground mb-1">{title}</h3>
          <p className="text-xs text-muted-foreground">{desc}</p>
        </div>
      ))}
    </div>

    <h2>Why learn Lebanese Arabic?</h2>
    <p>
      Lebanese Arabic is the living language of Lebanon — what people use with family, on TikTok, in songs and series, and in daily life. It is also one of the most widely understood Arabic dialects across the Middle East thanks to decades of Lebanese music, cinema and media.
    </p>
    <ul>
      <li><strong>Speak from lesson one:</strong> no alphabet gatekeeping; you start with arabizi transliteration.</li>
      <li><strong>Real conversations at A2:</strong> handle introductions, shopping, directions and small talk in 3–6 months.</li>
      <li><strong>Understand Lebanese media:</strong> songs, series, YouTube and social content in the original dialect.</li>
      <li><strong>Travel and family:</strong> connect with Lebanese speakers in Lebanon and the diaspora.</li>
      <li><strong>Gateway to the Levant:</strong> Lebanese is mutually intelligible with Syrian and widely understood in Jordan and Palestine.</li>
    </ul>

    <h2>Lebanese Arabic vs Modern Standard Arabic</h2>
    <p>
      Modern Standard Arabic (MSA / Fusha) is the written, formal register used in news, laws and religious texts. Nobody speaks it at home, and native speakers switch to their dialect the moment the camera turns off. If your goal is real conversation, spoken Lebanese Arabic is the shortest path. You can layer MSA on top later for reading and formal writing.
    </p>
    <p>
      Read the full{" "}
      <Link to="/blog/araba-libaneza-vs-araba-standard">Lebanese Arabic vs Standard Arabic comparison</Link>{" "}
      for a side-by-side breakdown.
    </p>

    <h2>Course formats</h2>
    <div className="grid sm:grid-cols-2 gap-4 not-prose my-6">
      <div className="rounded-xl border border-border bg-muted/30 p-5">
        <h3 className="text-base font-semibold text-foreground mb-2 flex items-center gap-2">
          <Users className="w-4 h-4 text-primary" /> Group courses
        </h3>
        <p className="text-sm text-muted-foreground">
          Small groups (4–10 learners), twice a week, 90 minutes per session. Online or in Bucharest. Fixed schedule with a clear CEFR syllabus.
        </p>
        <p className="text-sm font-medium text-foreground mt-3">From 500 LEI / month online</p>
      </div>
      <div className="rounded-xl border border-border bg-muted/30 p-5">
        <h3 className="text-base font-semibold text-foreground mb-2 flex items-center gap-2">
          <MessageCircle className="w-4 h-4 text-primary" /> Private lessons
        </h3>
        <p className="text-sm text-muted-foreground">
          1-on-1 lessons tailored to your goals and pace. Flexible scheduling. Online worldwide or in person in Bucharest.
        </p>
        <p className="text-sm font-medium text-foreground mt-3">150 LEI / lesson</p>
      </div>
    </div>

    <h2>How we teach</h2>
    <ul>
      <li><strong>Oral first:</strong> you speak from lesson one using arabizi (Latin transliteration). The Arabic script is introduced after 2–3 months, once your ear is tuned.</li>
      <li><strong>Native teacher:</strong> Ibra is a native Lebanese speaker with 5+ years of teaching experience.</li>
      <li><strong>CEFR structure:</strong> six levels A1 → C2, from survival to full fluency.</li>
      <li><strong>Real conversations:</strong> every lesson builds toward something you can actually say in daily life.</li>
      <li><strong>Online worldwide:</strong> live Zoom lessons in any time zone that overlaps with Bucharest (EET). In-person option in Bucharest.</li>
      <li><strong>Teaching language:</strong> English, French, Arabic or Romanian — you choose the one you're most comfortable in.</li>
    </ul>

    <h2>What you will be able to say</h2>
    <p>
      Even after a few lessons you can handle practical situations: introduce yourself, order food, ask for directions, shop, make plans and greet people naturally. By A2 you can hold short conversations about everyday topics; by B1 you can discuss past experiences, give opinions and understand the gist of Lebanese media.
    </p>

    <h2>Free resources to start learning Lebanese Arabic</h2>
    <p>
      While you decide on a course, you can already build exposure with free material:
    </p>
    <ul>
      <li>
        <Link to="/blog/primele-20-de-expresii-libaneze">The first 20 Lebanese Arabic phrases</Link> — greetings, politeness, café and taxi situations.
      </li>
      <li>
        <Link to="/blog/cum-saluti-in-libaneza">How to greet in Lebanese Arabic</Link> — complete politeness guide with pronunciation.
      </li>
      <li>
        <Link to="/blog/ce-este-arabizi">What is Arabizi</Link> — how to read Arabic written with Latin letters and numbers.
      </li>
      <li>
        <Link to="/blog/cum-inveti-araba-libaneza">How to learn Lebanese Arabic: a beginner's guide</Link> — methods, mistakes and timeline.
      </li>
    </ul>

    <div className="rounded-xl border border-border bg-primary/5 p-6 not-prose my-10">
      <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center gap-2">
        <BookOpen className="w-5 h-5 text-primary" /> Want a step-by-step beginner guide?
      </h3>
      <p className="text-sm text-muted-foreground mb-4">
        Read our dedicated guide on <Link to="/blog/learn-lebanese-arabic">how to learn Lebanese Arabic</Link> — it covers dialect differences, study methods, common mistakes and your first useful phrases.
      </p>
      <Link
        to="/blog/learn-lebanese-arabic"
        className="inline-flex items-center gap-2 rounded-lg bg-primary text-primary-foreground px-5 py-2.5 text-sm font-semibold hover:bg-primary/90 transition-colors"
      >
        Read the beginner guide
      </Link>
    </div>

    <h2>Start learning Lebanese Arabic today</h2>
    <p>
      Book a free 30-minute trial lesson. No card required — just show up, chat, and see if the method fits you. Online worldwide or in person in Bucharest.
    </p>
    <div className="flex flex-wrap gap-3 not-prose">
      <Link
        to="/trial"
        className="inline-flex items-center gap-2 rounded-lg bg-primary text-primary-foreground px-5 py-3 text-sm font-semibold hover:bg-primary/90 transition-colors"
      >
        Book a free trial lesson
      </Link>
      <a
        href="https://wa.me/40763124514"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-5 py-3 text-sm font-semibold hover:border-primary/50 transition-colors"
      >
        <MessageCircle className="w-4 h-4" /> Ask on WhatsApp
      </a>
    </div>

    <ul className="grid sm:grid-cols-2 gap-2 text-sm text-foreground/80 not-prose mt-8">
      {[
        "Speak from lesson one — no alphabet gatekeeping",
        "Real conversations at A2 in 3–6 months",
        "Native pronunciation and cultural context",
        "Understand Lebanese music, cinema and series",
        "Works across Lebanon, Syria, Jordan and Palestine",
        "Optional transition to the Arabic script when you're ready",
      ].map((item) => (
        <li key={item} className="flex items-start gap-2">
          <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  </EnLandingLayout>
);

export default LearnLebaneseArabic;
