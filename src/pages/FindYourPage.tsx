/**
 * A human-readable map of the site, for anyone who arrived at the wrong address.
 *
 * The 404 page shows a shortlist of the same recommendations; this page is the
 * full version and, unlike a 404, has a real URL that can be linked from an
 * email, an ad or a reply to a "your link is broken" message. Indexable on
 * purpose — it is a useful page, not an error screen.
 */
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import PageFinder from "@/components/PageFinder";

const COPY = {
  ro: {
    h1: "Te ajutăm să găsești pagina potrivită",
    lead: "Ai ajuns dintr-un link vechi sau nu știi de unde să începi? Caută mai jos sau alege dintre cursurile, resursele și articolele noastre.",
  },
  en: {
    h1: "Let us help you find the right page",
    lead: "Followed an old link, or not sure where to start? Search below, or pick from our courses, free resources and articles.",
  },
} as const;

const FindYourPage = ({ lang }: { lang: "ro" | "en" }) => (
  <div className="min-h-screen bg-background">
    <ScrollToTop />
    <Navbar />
    <main className="mx-auto max-w-5xl px-4 py-16">
      <h1 className="text-3xl font-bold sm:text-4xl">{COPY[lang].h1}</h1>
      <p className="mt-4 max-w-2xl text-muted-foreground">{COPY[lang].lead}</p>
      <div className="mt-12">
        <PageFinder lang={lang} full />
      </div>
    </main>
    <Footer />
  </div>
);

export default FindYourPage;
