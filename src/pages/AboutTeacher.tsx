/**
 * /despre-noi (RO) · /en/about-us (EN)
 *
 * A standalone page for the teacher, so ads and search can link to him
 * directly instead of to a section of the homepage. It reuses the homepage's
 * own instructor and reviews sections unchanged: no new claims, one source.
 */
import { Link } from "@/components/LocalizedLink";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import InstructorSection from "@/components/InstructorSection";
import TestimonialsSection from "@/components/TestimonialsSection";

const COPY = {
  ro: {
    badge: "Despre noi",
    h1: "Profesor nativ Ibra",
    lead: "Arabă libaneză vorbită, predată de un profesor nativ din Liban — online pe Zoom și la centrul din București.",
    courses: "Vezi cursurile",
    trial: "Lecție de probă gratuită",
    reviews: "Toate recenziile",
  },
  en: {
    badge: "About us",
    h1: "Native teacher Ibra",
    lead: "Spoken Lebanese Arabic, taught by a native teacher from Lebanon — online on Zoom and at our Bucharest centre.",
    courses: "See the courses",
    trial: "Free trial lesson",
    reviews: "All reviews",
  },
} as const;

const AboutTeacher = ({ lang }: { lang: "ro" | "en" }) => {
  const c = COPY[lang];
  return (
    <div className="min-h-screen bg-background">
      <ScrollToTop />
      <Navbar />
      <main id="main-content" className="pt-28">
        <div className="mx-auto max-w-content px-gutter">
          <span className="mb-2 block text-sm font-bold uppercase tracking-[0.1em] text-foreground">
            {c.badge}
          </span>
          <h1 className="font-display text-display-xl font-bold tracking-tight text-foreground">
            {c.h1}
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
            {c.lead}
          </p>
        </div>
        <InstructorSection />
        <TestimonialsSection />
        <div className="mx-auto flex max-w-content flex-wrap gap-4 px-gutter pb-section">
          <Link
            to={lang === "en" ? "/en/courses" : "/cursuri"}
            className="rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground hover:opacity-90"
          >
            {c.courses}
          </Link>
          <Link
            to={lang === "en" ? "/en/trial" : "/trial"}
            className="rounded-full border border-border px-6 py-3 font-semibold text-foreground hover:bg-muted"
          >
            {c.trial}
          </Link>
          <Link
            to={lang === "en" ? "/en/reviews" : "/recenzii"}
            className="rounded-full border border-border px-6 py-3 font-semibold text-foreground hover:bg-muted"
          >
            {c.reviews}
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AboutTeacher;
