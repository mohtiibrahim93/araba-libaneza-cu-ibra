import { Link } from "@/components/LocalizedLink";
import EnLandingLayout from "./EnLandingLayout";

const FAQ = [
  {
    q: "How long does it take to learn Lebanese Arabic?",
    a: "With two 90-minute lessons per week plus 15–20 minutes of daily practice, most learners reach A1 (basic conversations) in ~3 months, A2 in ~6 months, and B1 in 12–18 months. Fluent B2–C1 typically takes 1.5–3 years of consistent practice.",
  },
  {
    q: "Can I learn Lebanese Arabic on my own?",
    a: "Partially. Apps and YouTube channels can teach you vocabulary and basic phrases, but Lebanese is a spoken dialect with very few written resources — you need a native speaker for pronunciation (especially ع, ح, غ) and to correct grammar patterns that don't exist in English. Self-study + a weekly native tutor is the fastest realistic path.",
  },
  {
    q: "Do I need to learn the Arabic alphabet first?",
    a: "No. We start with Arabizi (Arabic written in Latin letters with numbers for missing sounds — e.g. 3ayn for ع) so you can speak from lesson one. The Arabic alphabet is introduced gradually from around level A2 for students who also want to read and write.",
  },
  {
    q: "Should I learn MSA (Fusha) before Lebanese?",
    a: "No, unless your goal is reading news or working in formal contexts. Modern Standard Arabic is nobody's mother tongue — going through MSA to reach spoken Lebanese adds 1–2 years to your journey. Learn the dialect directly, then add MSA later if you need it. See our full comparison: Lebanese vs MSA vs Egyptian Arabic.",
  },
  {
    q: "How much daily practice do I need?",
    a: "15–20 minutes per day beats 2 hours once a week. A working formula: 5 min flashcards (Anki), 5 min shadowing a native audio clip, 5 min writing a spoken diary entry, 5 min listening to Lebanese music or a podcast. Consistency compounds; intensity without consistency doesn't.",
  },
  {
    q: "How to learn Lebanese Arabic online for free?",
    a: "Free routes: YouTube channels (Learn Lebanese Arabic with Nour, Arabic Pod 101), Fairuz and Wael Kfoury lyrics with translations, Lebanese TikTok and Instagram creators, and language-exchange apps (Tandem, HelloTalk) for a native partner. Free gets you to A1; a structured course accelerates A2 and beyond considerably.",
  },
];

const Milestone = ({
  level,
  months,
  weekly,
  can,
}: {
  level: string;
  months: string;
  weekly: string;
  can: string;
}) => (
  <div className="rounded-lg border border-border bg-muted/30 p-4">
    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
      <span className="inline-block rounded-md bg-primary/10 text-primary px-2 py-0.5 text-xs font-semibold">
        {level}
      </span>
      <span className="text-sm text-muted-foreground">{months}</span>
      <span className="text-sm text-muted-foreground">·</span>
      <span className="text-sm text-muted-foreground">{weekly}</span>
    </div>
    <p className="text-sm mt-2">{can}</p>
  </div>
);

const HowToLearnLebaneseArabic = () => (
  <EnLandingLayout
    slug="how-to-learn-lebanese-arabic"
    title="How to learn Lebanese Arabic — recommended learning path & lesson structure"
    metaTitle="How to Learn Lebanese Arabic — Step-by-Step Guide (2026)"
    description="Learn Lebanese Arabic step by step in 2026 with a weekly routine, level-by-level timeline, and practical guidance from native Lebanese teacher Ibra."
    crumb="How to learn Lebanese Arabic"
    lead="A step-by-step path from complete beginner to fluent conversation, including the exact weekly lesson structure and daily routine that gets you there — written by a native Lebanese teacher who has taught hundreds of students."
    courseSchema={false}
    roHref="/blog/cum-inveti-araba-libaneza"
    faq={FAQ}
  >
    <p>
      Most people who try to learn Lebanese Arabic quit within three months — not because it's
      hard, but because they picked the wrong route: MSA textbooks, generic Arabic apps, or
      YouTube playlists with no structure. This guide gives you the shortest realistic path from
      zero to real Lebanese conversation, and the exact lesson structure that makes it work.
    </p>

    <h2>The 4-part learning path</h2>
    <p>
      Every Lebanese-Arabic learner needs the same four ingredients. Miss any one of them and
      progress stalls.
    </p>
    <ol className="list-decimal list-inside space-y-2">
      <li>
        <strong>A structured curriculum</strong> — CEFR levels A1→C1 broken into weekly
        objectives, so you always know what comes next.
      </li>
      <li>
        <strong>A native speaker</strong> — for pronunciation (ع, ح, غ don't exist in English)
        and for correcting the patterns you can't hear yourself getting wrong.
      </li>
      <li>
        <strong>Daily short practice</strong> — 15–20 minutes every day beats a single 2-hour
        session on Sunday. Language sticks through repetition, not intensity.
      </li>
      <li>
        <strong>Real Lebanese input</strong> — music, TV, TikTok, WhatsApp voice notes from
        friends. Textbook language sounds like textbook language; you need the real thing to
        train your ear.
      </li>
    </ol>

    <h2>Recommended weekly lesson structure</h2>
    <p>
      This is the structure we use in our group and private courses — refined over years of
      teaching, and the fastest reliable format we've found.
    </p>

    <h3>Two 90-minute lessons per week (with a native teacher)</h3>
    <p>Each 90-minute lesson breaks down like this:</p>
    <ul>
      <li>
        <strong>0–10 min · Warm-up.</strong> Free conversation in Lebanese only, on last week's
        topics. Forces active recall before new material lands.
      </li>
      <li>
        <strong>10–30 min · Review.</strong> Correct homework, drill last lesson's grammar, and
        clarify anything unclear. This is where mistakes get caught before they solidify.
      </li>
      <li>
        <strong>30–60 min · New material.</strong> One grammar concept + one theme (family, food,
        directions…) + ~10 new words. Never more — capacity is the constraint.
      </li>
      <li>
        <strong>60–80 min · Guided practice.</strong> Role-plays, dialogues, listening to a short
        native clip and answering questions. This is where new material becomes usable.
      </li>
      <li>
        <strong>80–90 min · Homework assignment.</strong> A concrete task for the week — record a
        1-minute voice note, write 5 sentences, message the teacher in Lebanese.
      </li>
    </ul>

    <h3>Daily 15–20 minute routine (on your own)</h3>
    <ul>
      <li>
        <strong>5 min · Flashcards.</strong> Anki with the week's new vocabulary + audio. Skipping
        this is the #1 reason people forget what they learn in class.
      </li>
      <li>
        <strong>5 min · Shadowing.</strong> Play a native audio clip (song lyric, dialogue) and
        repeat immediately after, matching rhythm and pitch. Trains pronunciation faster than
        anything else.
      </li>
      <li>
        <strong>5 min · Spoken diary.</strong> Talk to yourself in Lebanese about your day. It
        feels silly for the first week; by week three it's your fastest fluency builder.
      </li>
      <li>
        <strong>5 min · Passive listening.</strong> Fairuz in the morning, a Lebanese podcast on
        the commute, MTV Lebanon in the background. Your ear needs constant exposure.
      </li>
    </ul>

    <h2>Level-by-level timeline</h2>
    <p>With the routine above, here's what to expect:</p>
    <div className="not-prose space-y-3 my-4">
      <Milestone
        level="A1 · Beginner"
        months="~3 months"
        weekly="2×90 min + daily practice"
        can="Introduce yourself, order food, shop, ask basic questions, exchange greetings with Lebanese family."
      />
      <Milestone
        level="A2 · Elementary"
        months="+6 months (9 total)"
        weekly="2×90 min + daily practice"
        can="Hold simple conversations, describe your day, understand slow native speech, read short WhatsApp messages in Arabic script."
      />
      <Milestone
        level="B1 · Intermediate"
        months="+8–10 months (~18 total)"
        weekly="2×90 min + daily practice + native input"
        can="Discuss opinions, follow most Lebanese TV series with occasional pauses, hold 30-minute conversations with native speakers."
      />
      <Milestone
        level="B2 · Upper intermediate"
        months="+8–10 months (~2–2.5 years)"
        weekly="1×90 min + heavy native input"
        can="Understand fast native speech, argue and negotiate, follow Lebanese news and pop culture without effort."
      />
      <Milestone
        level="C1 · Advanced"
        months="~3 years total"
        weekly="Native input + occasional coaching"
        can="Speak effortlessly on any topic, catch cultural nuance and humour, sound Lebanese rather than foreign."
      />
    </div>

    <h2>What to learn in your first month (concrete plan)</h2>
    <p>
      If you want a checklist to start today, here's what a well-structured first month covers:
    </p>
    <ul>
      <li>
        <strong>Week 1:</strong> the alphabet in Arabizi form, greetings (marhaba, kifak/kifik,
        shu akhbarak), numbers 1–20, personal pronouns.
      </li>
      <li>
        <strong>Week 2:</strong> introducing yourself (name, age, nationality, job), question
        words (shu, wein, meen, kif, addesh, aymta), present tense of common verbs.
      </li>
      <li>
        <strong>Week 3:</strong> family vocabulary, possessives (baytak, baytik), simple location
        prepositions, ordering in a café or restaurant.
      </li>
      <li>
        <strong>Week 4:</strong> shopping and prices, colours and clothes, past tense of the most
        common verbs, first 20-second spoken diary entries.
      </li>
    </ul>
    <p>
      By the end of month one you should be able to survive a short visit to Lebanon — introduce
      yourself, order, shop, and ask directions.
    </p>

    <h2>Common mistakes that slow learners down</h2>
    <ul>
      <li>
        <strong>Starting with MSA.</strong> You'll spend a year learning something nobody speaks
        at home. If your goal is conversation, learn Lebanese directly — see{" "}
        <Link to="/en/lebanese-arabic-vs-msa-vs-egyptian">
          Lebanese vs MSA vs Egyptian
        </Link>.
      </li>
      <li>
        <strong>Skipping speaking for months.</strong> "I'll speak when I'm ready" never arrives.
        Speak badly from day one; that's the whole point.
      </li>
      <li>
        <strong>Only using apps.</strong> Duolingo and similar apps teach MSA vocabulary, not
        Lebanese dialect. Useful as a supplement, insufficient as the main method.
      </li>
      <li>
        <strong>Studying grammar without context.</strong> Grammar rules stick when you use them
        in real sentences, not when you memorise tables.
      </li>
      <li>
        <strong>Consuming only "learner" content.</strong> Simplified content is fine for the
        first two months. After that you need real Lebanese — songs, TV, TikTok — even if you
        only understand 20%.
      </li>
    </ul>

    <h2>Recommended resources</h2>
    <ul>
      <li>
        <strong>Music:</strong> Fairuz (start here), Wael Kfoury, Nancy Ajram, Mashrou' Leila.
        Read the lyrics side-by-side with translations.
      </li>
      <li>
        <strong>TV:</strong> MTV Lebanon, LBCI drama series (start with kids' or teen shows;
        adult drama is faster).
      </li>
      <li>
        <strong>Social media:</strong> Lebanese TikTok, Instagram creators (search #Lebanon, or
        follow chefs, comedians, news anchors).
      </li>
      <li>
        <strong>Apps:</strong> Anki for flashcards, Tandem or HelloTalk for finding Lebanese
        language partners.
      </li>
      <li>
        <strong>Structured course:</strong> our{" "}
        <Link to="/en/learn-lebanese-arabic">Lebanese Arabic course</Link> with a native teacher —
        or if you want to see the whole dialect landscape first, read the{" "}
        <Link to="/en/arabic-dialects-guide">Arabic dialects guide</Link>.
      </li>
    </ul>

    <h2>The single best step you can take today</h2>
    <p>
      Book a free 30-minute trial lesson with a native Lebanese teacher. You'll learn your first
      five phrases, hear the sound of the dialect, and get a personalised recommendation on where
      to start based on your goal (family, travel, business, heritage). No obligation, no card
      required.
    </p>
  </EnLandingLayout>
);

export default HowToLearnLebaneseArabic;