/**
 * /recenzii (RO) · /en/reviews (EN)
 *
 * The homepage's reviews on a page of their own, so ads and search can link
 * to them. Same quotes, same section component; plus the Google review links
 * the contact page already uses.
 */
import { Link } from "@/components/LocalizedLink";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import TestimonialsSection from "@/components/TestimonialsSection";
import {
  GOOGLE_MAPS_PROFILE_URL,
  GOOGLE_REVIEW_URL,
} from "@/lib/googleBusiness";

const COPY = {
  ro: {
    badge: "Recenzii",
    h1: "Păreri cursanți",
    lead: "Ce spun cei care au învățat arabă libaneză cu Ibra.",
    google: "Vezi recenziile pe Google",
    write: "Lasă o recenzie pe Google",
    trial: "Lecție de probă gratuită",
    about: "Despre profesor",
  },
  en: {
    badge: "Reviews",
    h1: "Student reviews",
    lead: "What people who learned Lebanese Arabic with Ibra say.",
    google: "See our reviews on Google",
    write: "Leave a review on Google",
    trial: "Free trial lesson",
    about: "About the teacher",
  },
} as const;

const Reviews = ({ lang }: { lang: "ro" | "en" }) => {
  const c = COPY[lang];
  const pill =
    "rounded-full border border-border px-6 py-3 font-semibold text-foreground hover:bg-muted";
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
        <TestimonialsSection />
        <div className="mx-auto flex max-w-content flex-wrap gap-4 px-gutter pb-section">
          <Link
            to={lang === "en" ? "/en/trial" : "/trial"}
            className="rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground hover:opacity-90"
          >
            {c.trial}
          </Link>
          <Link to={lang === "en" ? "/en/about-us" : "/despre-noi"} className={pill}>
            {c.about}
          </Link>
          <a href={GOOGLE_MAPS_PROFILE_URL} target="_blank" rel="noopener noreferrer" className={pill}>
            {c.google}
          </a>
          <a href={GOOGLE_REVIEW_URL} target="_blank" rel="noopener noreferrer" className={pill}>
            {c.write}
          </a>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Reviews;
