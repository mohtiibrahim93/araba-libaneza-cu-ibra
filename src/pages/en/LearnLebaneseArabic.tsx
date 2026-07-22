import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { CheckCircle2, Globe, Users, GraduationCap, MessageCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import ScrollToTop from "@/components/ScrollToTop";

const BASE = "https://centruldearabalibaneza.com";
const URL = `${BASE}/en/learn-lebanese-arabic`;
const TITLE = "Learn Lebanese Arabic Online — 1-on-1 & Group Courses with a Native Teacher";
const DESC =
  "Learn Lebanese Arabic (Levantine dialect) with a native instructor. Live 1-on-1 and small-group courses online worldwide, from beginner (A1) to advanced. Speak from lesson one — free trial.";

const FAQ: { q: string; a: string }[] = [
  {
    q: "Should I learn Lebanese Arabic or Modern Standard Arabic (MSA / Fusha)?",
    a: "If your goal is to actually speak with people — family, friends, travel, media — start with Lebanese. MSA is the written, formal register used in news and religious texts; almost no one speaks it at home. Lebanese is part of the Levantine family, so what you learn also works in Syria, Jordan and Palestine.",
  },
  {
    q: "How long does it take to hold a real conversation in Lebanese Arabic?",
    a: "Most learners reach basic everyday conversations (A1–A2) in 3–6 months of consistent study — roughly 2 sessions of 90 minutes per week plus a little practice between lessons. Reading the Arabic alphabet fluently comes later; we start with 'arabizi' (Latin transliteration) so you speak from lesson one.",
  },
  {
    q: "Do I need to learn the Arabic alphabet first?",
    a: "No. We use an oral-first method: you speak from lesson one using arabizi, then transition to the Arabic script once your ear and mouth are already tuned. This is faster and less frustrating than starting from letters.",
  },
  {
    q: "Are the lessons online?",
    a: "Yes — online lessons over Zoom are available worldwide (any time zone that overlaps with Bucharest / EET). In-person lessons are offered in Bucharest, Romania. Group courses run twice a week; private 1-on-1 lessons are scheduled flexibly.",
  },
  {
    q: "Is the teacher a native speaker with real teaching experience?",
    a: "Yes. Ibra is a native Lebanese Arabic speaker with 5+ years of teaching experience (Preply and independent students), based in Bucharest. Being native isn't enough on its own — the method, the pacing and the correction habits are what make progress stick.",
  },
  {
    q: "How much do the courses cost?",
    a: "Group courses start at 500 LEI / month (≈ €100) online, with monthly or full-payment options (10% discount for the full level). Private 1-on-1 lessons are 150 LEI / lesson (≈ €30). A 30-minute trial lesson is free.",
  },
];

const LearnLebaneseArabic = () => {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ.map(({ q, a }) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: { "@type": "Answer", text: a },
    })),
  };

  const courseJsonLd = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: "Lebanese Arabic — Online Courses (A1–C2)",
    description: DESC,
    inLanguage: "en",
    url: URL,
    provider: {
      "@type": "Organization",
      name: "Centrul de Arabă Libaneză cu Ibra",
      url: `${BASE}/`,
    },
    hasCourseInstance: [
      {
        "@type": "CourseInstance",
        courseMode: "online",
        inLanguage: "en",
      },
    ],
  };

  return (
    <div className="min-h-screen bg-background" lang="en">
      <Helmet>
        <html lang="en" />
        <title>{TITLE}</title>
        <meta name="description" content={DESC} />
        <link rel="canonical" href={URL} />
        <link rel="alternate" hrefLang="en" href={URL} />
        <link rel="alternate" hrefLang="ro" href={`${BASE}/`} />
        <link rel="alternate" hrefLang="x-default" href={`${BASE}/`} />
        <meta property="og:title" content={TITLE} />
        <meta property="og:description" content={DESC} />
        <meta property="og:url" content={URL} />
        <meta property="og:type" content="website" />
        <meta property="og:locale" content="en_US" />
        <meta property="og:locale:alternate" content="ro_RO" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={TITLE} />
        <meta name="twitter:description" content={DESC} />
        <script type="application/ld+json">{JSON.stringify(courseJsonLd)}</script>
        <script type="application/ld+json">{JSON.stringify(faqJsonLd)}</script>
      </Helmet>

      <Navbar />

      <main id="main-content" className="pt-16">
        <section className="max-w-4xl mx-auto px-6 pt-10 pb-8">
          <p className="text-xs uppercase tracking-wide text-primary font-semibold mb-3">
            Live online lessons · Native teacher
          </p>
          <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-tight text-foreground mb-4">
            Learn Lebanese Arabic online with a native teacher
          </h1>
          <p className="text-lg text-muted-foreground mb-6 max-w-2xl">
            Live 1-on-1 and small-group courses in the Lebanese dialect — the everyday
            Levantine Arabic spoken by ~30 million people. Speak from lesson one, without
            starting from the alphabet. From beginner (A1) to advanced (C2).
          </p>
          <div className="flex flex-wrap gap-3">
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
        </section>

        <section className="max-w-4xl mx-auto px-6 py-8 grid sm:grid-cols-3 gap-4">
          {[
            { icon: Globe, title: "Online worldwide", desc: "Lessons over Zoom in any time zone that overlaps with Bucharest (EET)." },
            { icon: Users, title: "1-on-1 or small group", desc: "Private lessons tailored to your goals, or groups of 4–10 learners." },
            { icon: GraduationCap, title: "CEFR A1 → C2", desc: "Six levels, from survival Lebanese to full fluency." },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-xl border border-border bg-card p-5">
              <Icon className="w-5 h-5 text-primary mb-2" />
              <h2 className="text-sm font-bold text-foreground mb-1">{title}</h2>
              <p className="text-xs text-muted-foreground">{desc}</p>
            </div>
          ))}
        </section>

        <section className="max-w-4xl mx-auto px-6 py-8">
          <h2 className="text-2xl font-bold text-foreground mb-3">Why Lebanese, not Modern Standard Arabic?</h2>
          <p className="text-sm text-muted-foreground mb-3 max-w-3xl">
            Modern Standard Arabic (MSA / Fusha) is the written, formal register used in news, official
            documents and religious texts — nobody speaks it natively at home. Lebanese Arabic is the
            <em> living </em> language: what people actually use with family, on TikTok, in songs and series,
            and in daily life across Lebanon and the broader Levant (Syria, Jordan, Palestine).
          </p>
          <p className="text-sm text-muted-foreground mb-4 max-w-3xl">
            If your goal is to <strong>talk with people</strong>, Lebanese gets you there in months, not
            years. Read our full{" "}
            <Link to="/blog/araba-libaneza-vs-araba-standard" className="text-primary hover:underline">
              Lebanese vs Standard Arabic comparison
            </Link>{" "}
            (bilingual RO/EN).
          </p>
          <ul className="grid sm:grid-cols-2 gap-2 text-sm text-foreground/80">
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
        </section>

        <section id="faq" className="max-w-4xl mx-auto px-6 py-10 scroll-mt-20">
          <h2 className="text-2xl font-bold text-foreground mb-4">Frequently asked questions</h2>
          <div className="space-y-4">
            {FAQ.map(({ q, a }) => (
              <details key={q} className="rounded-xl border border-border bg-card p-4">
                <summary className="cursor-pointer text-sm font-semibold text-foreground">{q}</summary>
                <p className="mt-2 text-sm text-muted-foreground">{a}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-6 py-10">
          <div className="rounded-2xl border border-border bg-muted/40 p-6 sm:p-8">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">
              Ready to start speaking Lebanese Arabic?
            </h2>
            <p className="text-sm text-muted-foreground mb-5 max-w-2xl">
              Book a free 30-minute trial lesson online. No card required — just show up, chat, and see if
              the method fits you.
            </p>
            <Link
              to="/trial"
              className="inline-flex items-center gap-2 rounded-lg bg-primary text-primary-foreground px-5 py-3 text-sm font-semibold hover:bg-primary/90 transition-colors"
            >
              Book a free trial lesson
            </Link>
          </div>
        </section>
      </main>

      <Footer />
      <WhatsAppButton />
      <ScrollToTop />
    </div>
  );
};

export default LearnLebaneseArabic;