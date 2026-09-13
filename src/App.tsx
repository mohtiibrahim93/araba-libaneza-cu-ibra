import { Suspense, useEffect, type ComponentType, type ReactNode } from "react";
import { lazyWithRetry } from "@/lib/lazyWithRetry";
import { Loader2 } from "lucide-react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation, useParams } from "react-router-dom";
import { I18nProvider, useI18n } from "@/lib/i18n";
import { useRouteAnalytics } from "@/hooks/useRouteAnalytics";
// Homepage + the tiny catch-all stay eager (critical path); everything else is
// code-split so it doesn't weigh down the initial homepage bundle.
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const Privacy = lazyWithRetry(() => import("./pages/Privacy"));
const Terms = lazyWithRetry(() => import("./pages/Terms"));
const DataDeletion = lazyWithRetry(() => import("./pages/DataDeletion"));
const Unsubscribe = lazyWithRetry(() => import("./pages/Unsubscribe"));
const PrivateStatus = lazyWithRetry(() => import("./pages/PrivateStatus"));
const Booking = lazyWithRetry(() => import("./pages/Booking"));
const BookingManage = lazyWithRetry(() => import("./pages/BookingManage"));
const Trial = lazyWithRetry(() => import("./pages/Trial"));
const Quiz = lazyWithRetry(() => import("./pages/Quiz"));
const Joaca = lazyWithRetry(() => import("./pages/Joaca"));
const Auth = lazyWithRetry(() => import("./pages/Auth"));
const Admin = lazyWithRetry(() => import("./pages/Admin"));
const AdminNotifications = lazyWithRetry(() => import("./pages/AdminNotifications"));
const PrivateLead = lazyWithRetry(() => import("./pages/PrivateLead"));
const Checkout = lazyWithRetry(() => import("./pages/Checkout"));
const ThankYou = lazyWithRetry(() => import("./pages/ThankYou"));
const PaymentStatus = lazyWithRetry(() => import("./pages/PaymentStatus"));
const CursGrup = lazyWithRetry(() => import("./pages/courses/CursGrup"));
const CursGrupLevel = lazyWithRetry(() => import("./pages/courses/CursGrupLevel"));
const CursPrivate = lazyWithRetry(() => import("./pages/courses/CursPrivate"));
const CursCopii = lazyWithRetry(() => import("./pages/courses/CursCopii"));
const Cursuri = lazyWithRetry(() => import("./pages/courses/Cursuri"));
const CourseDetail = lazyWithRetry(() => import("./pages/courses/CourseDetail"));
const CursAdulti = lazyWithRetry(() => import("./pages/courses/CursAdulti"));
const BlogIndex = lazyWithRetry(() => import("./pages/blog/BlogIndex"));
const BlogCumInvetiArabaLibaneza = lazyWithRetry(() => import("./pages/blog/CumInvetiArabaLibaneza"));
const BlogArabaLibanezaVsArabaStandard = lazyWithRetry(() => import("./pages/blog/ArabaLibanezaVsArabaStandard"));
const BlogPrimele20Expresii = lazyWithRetry(() => import("./pages/blog/Primele20Expresii"));
const BlogCatCostaCursurile = lazyWithRetry(() => import("./pages/blog/CatCostaCursurile"));
const BlogAlfabetulArab = lazyWithRetry(() => import("./pages/blog/AlfabetulArab"));
const BlogCeEsteArabizi = lazyWithRetry(() => import("./pages/blog/CeEsteArabizi"));
const BlogCulturaLibaneza = lazyWithRetry(() => import("./pages/blog/CulturaLibaneza"));
const BlogCumSalutiInLibaneza = lazyWithRetry(() => import("./pages/blog/CumSalutiInLibaneza"));
const BlogCatDureaza = lazyWithRetry(() => import("./pages/blog/CatDureaza"));
const BlogArabaPentruCopii = lazyWithRetry(() => import("./pages/blog/ArabaPentruCopii"));
const BlogCumAlegiProfesor = lazyWithRetry(() => import("./pages/blog/CumAlegiProfesor"));
const BlogInvataArabaOnline = lazyWithRetry(() => import("./pages/blog/InvataArabaOnline"));
const BlogNumereInLibaneza = lazyWithRetry(() => import("./pages/blog/NumereInLibaneza"));
const BlogGramaticaArabaLibaneza = lazyWithRetry(() => import("./pages/blog/GramaticaArabaLibaneza"));
const BlogLebaneseArabicPhrases = lazyWithRetry(() => import("./pages/blog/LebaneseArabicPhrases"));
const BlogLebaneseFamilyVocabulary = lazyWithRetry(() => import("./pages/blog/LebaneseFamilyVocabulary"));
const BlogDeCeInvatamAraba2026 = lazyWithRetry(() => import("./pages/blog/DeCeInvatamAraba2026"));
const BlogLimbileVorbiteInLiban = lazyWithRetry(() => import("./pages/blog/LimbileVorbiteInLiban"));
const BlogLebaneseArabicLearningResources = lazyWithRetry(() => import("./pages/blog/LebaneseArabicLearningResources"));
const LearnLebaneseArabic = lazyWithRetry(() => import("./pages/en/LearnLebaneseArabic"));
const ArabicTutor = lazyWithRetry(() => import("./pages/en/ArabicTutor"));
const EnFaq = lazyWithRetry(() => import("./pages/en/Faq"));
const ArabicClassesNearMe = lazyWithRetry(() => import("./pages/en/ArabicClassesNearMe"));
const ArabicDialectsGuide = lazyWithRetry(() => import("./pages/en/ArabicDialectsGuide"));
const LebaneseVsMsaVsEgyptian = lazyWithRetry(() => import("./pages/en/LebaneseVsMsaVsEgyptian"));
const HowToLearnLebaneseArabic = lazyWithRetry(() => import("./pages/en/HowToLearnLebaneseArabic"));
const DeArabischLernen = lazyWithRetry(() => import("./pages/de/ArabischLernen"));
const SeoCursuriAraba = lazyWithRetry(() => import("./pages/seo/CursuriAraba"));
const SeoMeditatiiAraba = lazyWithRetry(() => import("./pages/seo/MeditatiiAraba"));
const SeoIntrebariFrecvente = lazyWithRetry(() => import("./pages/seo/IntrebariFrecvente"));
const SeoCursuriArabaBucuresti = lazyWithRetry(() => import("./pages/seo/CursuriArabaBucuresti"));
const SeoCursArabaCopii = lazyWithRetry(() => import("./pages/seo/CursArabaCopii"));
const SeoArabizi = lazyWithRetry(() => import("./pages/seo/Arabizi"));
const SeoInvataArabaGratis = lazyWithRetry(() => import("./pages/seo/InvataArabaGratis"));
const SeoResurse = lazyWithRetry(() => import("./pages/seo/Resurse"));
const SeoFaraAlfabetArab = lazyWithRetry(() => import("./pages/seo/FaraAlfabetArab"));
const SeoDialecteArabe = lazyWithRetry(() => import("./pages/seo/DialecteArabe"));
const SeoCeArabaSaInveti = lazyWithRetry(() => import("./pages/seo/CeArabaSaInveti"));
const SeoArabaPentruPartener = lazyWithRetry(() => import("./pages/seo/ArabaPentruPartener"));
const SeoArabaInFamilie = lazyWithRetry(() => import("./pages/seo/ArabaInFamilie"));
const SeoCelMaiBunCursAraba = lazyWithRetry(() => import("./pages/seo/CelMaiBunCursAraba"));
const SeoCursuriArabaAdolescenti = lazyWithRetry(() => import("./pages/seo/CursuriArabaAdolescenti"));
const BestArabicCourse = lazyWithRetry(() => import("./pages/en/BestArabicCourse"));
const ArabicForTeenagers = lazyWithRetry(() => import("./pages/en/ArabicForTeenagers"));

const queryClient = new QueryClient();

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <Loader2 className="w-8 h-8 animate-spin text-primary" />
  </div>
);

const RouteAnalytics = () => {
  useRouteAnalytics();
  return null;
};

/**
 * Keep the UI language in step with the URL on /en/ routes.
 *
 * I18nProvider settles the language once, from the path on first paint. That is
 * enough for a cold load but not for client-side navigation: following a link
 * from a Romanian page into /en/blog/... would otherwise leave the language on
 * Romanian and render the Romanian half of a bilingual article under an English
 * URL. Only /en/ forces a language — everywhere else the toggle stays free,
 * because those pages are bilingual at a single URL.
 */
const LanguageFromPath = () => {
  const { pathname } = useLocation();
  const { lang, setLang } = useI18n();
  useEffect(() => {
    if (pathname.startsWith("/en/") && lang !== "en") setLang("en");
  }, [pathname, lang, setLang]);
  return null;
};

/**
 * English twins of the blog, at /en/blog/<same-slug>.
 *
 * Every article component is already bilingual — it picks its language from
 * the i18n context — but until now only the Romanian URL existed, so the
 * English half of twenty articles was invisible to search engines: no URL to
 * index, nothing to point an hreflang at. These routes give that half an
 * address. The component is the same one the Romanian URL renders;
 * LanguageFromPath above is what makes it come out in English.
 */
const BLOG_COMPONENTS: Record<string, ComponentType> = {
  "cum-inveti-araba-libaneza": BlogCumInvetiArabaLibaneza,
  "araba-libaneza-vs-araba-standard": BlogArabaLibanezaVsArabaStandard,
  "primele-20-de-expresii-libaneze": BlogPrimele20Expresii,
  "cat-costa-cursurile-de-araba-libaneza": BlogCatCostaCursurile,
  "alfabetul-arab-pentru-incepatori": BlogAlfabetulArab,
  "ce-este-arabizi": BlogCeEsteArabizi,
  "cultura-libaneza-obiceiuri-mancare-traditii": BlogCulturaLibaneza,
  "cum-saluti-in-libaneza": BlogCumSalutiInLibaneza,
  "cat-dureaza-sa-inveti-araba-libaneza": BlogCatDureaza,
  "araba-pentru-copii-ghidul-parintilor": BlogArabaPentruCopii,
  "cum-alegi-profesor-de-araba": BlogCumAlegiProfesor,
  "invata-araba-libaneza-online": BlogInvataArabaOnline,
  "numere-in-araba-libaneza": BlogNumereInLibaneza,
  "gramatica-arabei-libaneze": BlogGramaticaArabaLibaneza,
  "lebanese-arabic-phrases": BlogLebaneseArabicPhrases,
  "lebanese-family-vocabulary": BlogLebaneseFamilyVocabulary,
  "de-ce-invatam-araba-in-2026": BlogDeCeInvatamAraba2026,
  "limbile-vorbite-in-liban": BlogLimbileVorbiteInLiban,
  "lebanese-arabic-learning-resources": BlogLebaneseArabicLearningResources,
};

const EnBlogPost = () => {
  const { slug } = useParams();
  const Post = slug ? BLOG_COMPONENTS[slug] : undefined;
  return Post ? <Post /> : <NotFound />;
};

interface AppProps {
  /**
   * The router to mount the routes under. Defaults to BrowserRouter for the
   * app itself; the build-time prerender swaps in a StaticRouter bound to the
   * route being rendered, so every page can be turned into real HTML instead
   * of shipping an empty <div id="root"> to crawlers.
   */
  Router?: ComponentType<{ children: ReactNode }>;
  /** Seeds the UI language during prerender; the browser reads localStorage. */
  lang?: "ro" | "en";
}

const App = ({ Router = BrowserRouter, lang }: AppProps = {}) => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <I18nProvider initialLang={lang}>
      <Router>
        <RouteAnalytics />
        <LanguageFromPath />
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/admin/notifications" element={<AdminNotifications />} />
            <Route path="/admin/private-leads/:id" element={<PrivateLead />} />
            <Route path="/private-status/:id" element={<PrivateStatus />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/stergere-date" element={<DataDeletion />} />
            <Route path="/unsubscribe" element={<Unsubscribe />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/thank-you" element={<ThankYou />} />
            <Route path="/payment-status" element={<PaymentStatus />} />
            <Route path="/booking" element={<Booking />} />
            <Route path="/booking/manage/:token" element={<BookingManage />} />
            <Route path="/trial" element={<Trial />} />
            <Route path="/quiz" element={<Quiz />} />
            {/* Romanian only: the game's card bank carries Romanian meanings
                alone, so there is no /en twin to pair it with. */}
            <Route path="/joaca" element={<Joaca />} />
            {/* English twins of the remaining bilingual pages. All five already
                carry a full English copy (a COPY[lang] object or i18n keys); they
                simply had no English URL, so the English text could not be
                indexed or linked. The Romanian privacy policy and terms remain
                the binding versions — /en/privacy and /en/terms are the existing
                English translation of them, given an address. */}
            <Route path="/en/privacy" element={<Privacy />} />
            <Route path="/en/terms" element={<Terms />} />
            <Route path="/en/booking" element={<Booking />} />
            <Route path="/en/trial" element={<Trial />} />
            <Route path="/en/quiz" element={<Quiz />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/cursuri" element={<Cursuri />} />
            <Route path="/cursuri/privat" element={<Navigate to="/cursuri/private" replace />} />
            <Route path="/cursuri/curs/:slug" element={<CourseDetail />} />
            <Route path="/cursuri/adulti" element={<CursAdulti />} />
            {/* Merged into the adolescenți page: one URL, one term, nothing
                for search engines to split between. */}
            <Route path="/cursuri/tineri" element={<Navigate to="/cursuri-araba-adolescenti" replace />} />
            <Route path="/cursuri/grup" element={<CursGrup />} />
            <Route path="/cursuri/grup/:level" element={<CursGrupLevel />} />
            <Route path="/cursuri/private" element={<CursPrivate />} />
            <Route path="/cursuri/copii" element={<CursCopii />} />
            <Route path="/cursuri/online" element={<Navigate to="/cursuri" replace />} />
            {/* English twins of the course pages. Same components — they have
                always rendered both languages — but until now only the Romanian
                URL existed, so the English version of the course pages could
                not be indexed or linked. LanguageFromPath forces English on
                /en/. */}
            <Route path="/en/courses" element={<Cursuri />} />
            <Route path="/en/courses/adults" element={<CursAdulti />} />
            <Route path="/en/courses/group" element={<CursGrup />} />
            <Route path="/en/courses/group/:level" element={<CursGrupLevel />} />
            <Route path="/en/courses/private" element={<CursPrivate />} />
            <Route path="/en/courses/children" element={<CursCopii />} />
            <Route path="/blog" element={<BlogIndex />} />
            <Route path="/blog/cum-inveti-araba-libaneza" element={<BlogCumInvetiArabaLibaneza />} />
            <Route path="/blog/araba-libaneza-vs-araba-standard" element={<BlogArabaLibanezaVsArabaStandard />} />
            <Route path="/blog/primele-20-de-expresii-libaneze" element={<BlogPrimele20Expresii />} />
            <Route path="/blog/cat-costa-cursurile-de-araba-libaneza" element={<BlogCatCostaCursurile />} />
            <Route path="/blog/alfabetul-arab-pentru-incepatori" element={<BlogAlfabetulArab />} />
            <Route path="/blog/ce-este-arabizi" element={<BlogCeEsteArabizi />} />
            <Route path="/blog/cultura-libaneza-obiceiuri-mancare-traditii" element={<BlogCulturaLibaneza />} />
            <Route path="/blog/cum-saluti-in-libaneza" element={<BlogCumSalutiInLibaneza />} />
            <Route path="/blog/cat-dureaza-sa-inveti-araba-libaneza" element={<BlogCatDureaza />} />
            <Route path="/blog/araba-pentru-copii-ghidul-parintilor" element={<BlogArabaPentruCopii />} />
            <Route path="/blog/cum-alegi-profesor-de-araba" element={<BlogCumAlegiProfesor />} />
            <Route path="/blog/invata-araba-libaneza-online" element={<BlogInvataArabaOnline />} />
            <Route path="/blog/numere-in-araba-libaneza" element={<BlogNumereInLibaneza />} />
            {/* Retired: a section-for-section rewrite of cum-inveti-araba-libaneza
                in both languages, so it duplicated the survivor twice over. Its
                English half was the only argument for keeping it, and that
                argument died when /en/blog/<slug> gave every article an English
                URL of its own. */}
            <Route path="/blog/learn-lebanese-arabic" element={<Navigate to="/blog/cum-inveti-araba-libaneza" replace />} />
            <Route path="/en/blog/learn-lebanese-arabic" element={<Navigate to="/en/blog/cum-inveti-araba-libaneza" replace />} />
            <Route path="/blog/gramatica-arabei-libaneze" element={<BlogGramaticaArabaLibaneza />} />
            <Route path="/blog/lebanese-arabic-phrases" element={<BlogLebaneseArabicPhrases />} />
            <Route path="/blog/lebanese-family-vocabulary" element={<BlogLebaneseFamilyVocabulary />} />
            <Route path="/blog/de-ce-invatam-araba-in-2026" element={<BlogDeCeInvatamAraba2026 />} />
            <Route path="/blog/limbile-vorbite-in-liban" element={<BlogLimbileVorbiteInLiban />} />
            <Route path="/blog/lebanese-arabic-learning-resources" element={<BlogLebaneseArabicLearningResources />} />
            <Route path="/en/blog" element={<BlogIndex />} />
            <Route path="/en/blog/:slug" element={<EnBlogPost />} />
            <Route path="/en/learn-lebanese-arabic" element={<LearnLebaneseArabic />} />
            <Route path="/en/learn-levantine-arabic" element={<Navigate to="/en/learn-lebanese-arabic" replace />} />
            <Route path="/en/arabic-tutor" element={<ArabicTutor />} />
            <Route path="/en/faq" element={<EnFaq />} />
            <Route path="/en/arabic-classes-near-me" element={<ArabicClassesNearMe />} />
            <Route path="/en/arabic-dialects-guide" element={<ArabicDialectsGuide />} />
            <Route path="/en/levantine-arabic-dialects-map" element={<Navigate to="/en/arabic-dialects-guide" replace />} />
            <Route path="/en/lebanese-arabic-vs-msa-vs-egyptian" element={<LebaneseVsMsaVsEgyptian />} />
            <Route path="/en/how-to-learn-lebanese-arabic" element={<HowToLearnLebaneseArabic />} />
            <Route path="/de/arabisch-lernen" element={<DeArabischLernen />} />
            <Route path="/cursuri-limba-araba" element={<SeoCursuriAraba />} />
            {/* Retired duplicates of the courses hub.
                /cursuri-araba used to render a byte-identical copy of it — an
                audit put the two at Jaccard 1.00. The other three each covered
                a slice the hub already covers (from zero, for beginners,
                online) and, tellingly, all three named /en/learn-lebanese-arabic
                as their English twin — the same page the hub itself pairs with,
                so by the site's own mapping they were the hub under other
                names. Their unique answers moved into src/data/faq.ts and the
                hub's own "București vs online" section; the URLs now redirect
                rather than serving a second copy of the same intent. */}
            <Route path="/cursuri-araba" element={<Navigate to="/cursuri-limba-araba" replace />} />
            <Route path="/araba-pentru-incepatori" element={<Navigate to="/cursuri-limba-araba" replace />} />
            <Route path="/araba-online" element={<Navigate to="/cursuri-limba-araba" replace />} />
            <Route path="/invata-araba" element={<Navigate to="/cursuri-limba-araba" replace />} />
            <Route path="/meditatii-araba" element={<SeoMeditatiiAraba />} />
            <Route path="/intrebari-frecvente" element={<SeoIntrebariFrecvente />} />
            <Route path="/cursuri-araba-bucuresti" element={<SeoCursuriArabaBucuresti />} />
            <Route path="/curs-araba-copii" element={<SeoCursArabaCopii />} />
            <Route path="/arabizi" element={<SeoArabizi />} />
            <Route path="/invata-araba-gratis" element={<SeoInvataArabaGratis />} />
            <Route path="/resurse" element={<SeoResurse />} />
            <Route path="/fara-alfabet-arab" element={<SeoFaraAlfabetArab />} />
            <Route path="/dialecte-arabe" element={<SeoDialecteArabe />} />
            <Route path="/ce-araba-sa-inveti" element={<SeoCeArabaSaInveti />} />
            <Route path="/araba-pentru-partener" element={<SeoArabaPentruPartener />} />
            <Route path="/araba-in-familie" element={<SeoArabaInFamilie />} />
            <Route path="/cel-mai-bun-curs-de-araba" element={<SeoCelMaiBunCursAraba />} />
            <Route path="/cursuri-araba-adolescenti" element={<SeoCursuriArabaAdolescenti />} />
            <Route path="/en/best-arabic-course" element={<BestArabicCourse />} />
            <Route path="/en/arabic-for-teenagers" element={<ArabicForTeenagers />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </Router>
      </I18nProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
