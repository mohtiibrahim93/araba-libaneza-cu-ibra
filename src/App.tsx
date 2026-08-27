import { lazy, Suspense } from "react";
import { Loader2 } from "lucide-react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { I18nProvider } from "@/lib/i18n";
import { useRouteAnalytics } from "@/hooks/useRouteAnalytics";
// Homepage + the tiny catch-all stay eager (critical path); everything else is
// code-split so it doesn't weigh down the initial homepage bundle.
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const Privacy = lazy(() => import("./pages/Privacy"));
const Terms = lazy(() => import("./pages/Terms"));
const DataDeletion = lazy(() => import("./pages/DataDeletion"));
const Unsubscribe = lazy(() => import("./pages/Unsubscribe"));
const PrivateStatus = lazy(() => import("./pages/PrivateStatus"));
const Booking = lazy(() => import("./pages/Booking"));
const BookingManage = lazy(() => import("./pages/BookingManage"));
const Trial = lazy(() => import("./pages/Trial"));
const Quiz = lazy(() => import("./pages/Quiz"));
const Auth = lazy(() => import("./pages/Auth"));
const Admin = lazy(() => import("./pages/Admin"));
const AdminNotifications = lazy(() => import("./pages/AdminNotifications"));
const PrivateLead = lazy(() => import("./pages/PrivateLead"));
const Checkout = lazy(() => import("./pages/Checkout"));
const ThankYou = lazy(() => import("./pages/ThankYou"));
const PaymentStatus = lazy(() => import("./pages/PaymentStatus"));
const CursGrup = lazy(() => import("./pages/courses/CursGrup"));
const CursGrupLevel = lazy(() => import("./pages/courses/CursGrupLevel"));
const CursPrivate = lazy(() => import("./pages/courses/CursPrivate"));
const CursCopii = lazy(() => import("./pages/courses/CursCopii"));
const Cursuri = lazy(() => import("./pages/courses/Cursuri"));
const CourseDetail = lazy(() => import("./pages/courses/CourseDetail"));
const PrivateCourse = lazy(() => import("./pages/courses/PrivateCourse"));
const CursAdulti = lazy(() => import("./pages/courses/CursAdulti"));
const BlogIndex = lazy(() => import("./pages/blog/BlogIndex"));
const BlogCumInvetiArabaLibaneza = lazy(() => import("./pages/blog/CumInvetiArabaLibaneza"));
const BlogArabaLibanezaVsArabaStandard = lazy(() => import("./pages/blog/ArabaLibanezaVsArabaStandard"));
const BlogPrimele20Expresii = lazy(() => import("./pages/blog/Primele20Expresii"));
const BlogCatCostaCursurile = lazy(() => import("./pages/blog/CatCostaCursurile"));
const BlogAlfabetulArab = lazy(() => import("./pages/blog/AlfabetulArab"));
const BlogCeEsteArabizi = lazy(() => import("./pages/blog/CeEsteArabizi"));
const BlogCulturaLibaneza = lazy(() => import("./pages/blog/CulturaLibaneza"));
const BlogCumSalutiInLibaneza = lazy(() => import("./pages/blog/CumSalutiInLibaneza"));
const BlogCatDureaza = lazy(() => import("./pages/blog/CatDureaza"));
const BlogArabaPentruCopii = lazy(() => import("./pages/blog/ArabaPentruCopii"));
const BlogCumAlegiProfesor = lazy(() => import("./pages/blog/CumAlegiProfesor"));
const BlogInvataArabaOnline = lazy(() => import("./pages/blog/InvataArabaOnline"));
const BlogNumereInLibaneza = lazy(() => import("./pages/blog/NumereInLibaneza"));
const BlogLearnLebaneseArabic = lazy(() => import("./pages/blog/LearnLebaneseArabic"));
const BlogGramaticaArabaLibaneza = lazy(() => import("./pages/blog/GramaticaArabaLibaneza"));
const BlogLebaneseArabicPhrases = lazy(() => import("./pages/blog/LebaneseArabicPhrases"));
const BlogLebaneseFamilyVocabulary = lazy(() => import("./pages/blog/LebaneseFamilyVocabulary"));
const BlogDeCeInvatamAraba2026 = lazy(() => import("./pages/blog/DeCeInvatamAraba2026"));
const BlogLimbileVorbiteInLiban = lazy(() => import("./pages/blog/LimbileVorbiteInLiban"));
const BlogLebaneseArabicLearningResources = lazy(() => import("./pages/blog/LebaneseArabicLearningResources"));
const LearnLebaneseArabic = lazy(() => import("./pages/en/LearnLebaneseArabic"));
const LearnLevantineArabic = lazy(() => import("./pages/en/LearnLevantineArabic"));
const ArabicTutor = lazy(() => import("./pages/en/ArabicTutor"));
const ArabicClassesNearMe = lazy(() => import("./pages/en/ArabicClassesNearMe"));
const ArabicDialectsGuide = lazy(() => import("./pages/en/ArabicDialectsGuide"));
const LevantineArabicDialectsMap = lazy(() => import("./pages/en/LevantineArabicDialectsMap"));
const LebaneseVsMsaVsEgyptian = lazy(() => import("./pages/en/LebaneseVsMsaVsEgyptian"));
const HowToLearnLebaneseArabic = lazy(() => import("./pages/en/HowToLearnLebaneseArabic"));
const DeArabischLernen = lazy(() => import("./pages/de/ArabischLernen"));
const SeoCursuriAraba = lazy(() => import("./pages/seo/CursuriAraba"));
const SeoArabaPentruIncepatori = lazy(() => import("./pages/seo/ArabaPentruIncepatori"));
const SeoArabaOnline = lazy(() => import("./pages/seo/ArabaOnline"));
const SeoMeditatiiAraba = lazy(() => import("./pages/seo/MeditatiiAraba"));
const SeoInvataAraba = lazy(() => import("./pages/seo/InvataAraba"));
const SeoCursuriArabaBucuresti = lazy(() => import("./pages/seo/CursuriArabaBucuresti"));
const SeoCursArabaCopii = lazy(() => import("./pages/seo/CursArabaCopii"));
const SeoArabizi = lazy(() => import("./pages/seo/Arabizi"));
const SeoInvataArabaGratis = lazy(() => import("./pages/seo/InvataArabaGratis"));
const SeoResurse = lazy(() => import("./pages/seo/Resurse"));
const SeoFaraAlfabetArab = lazy(() => import("./pages/seo/FaraAlfabetArab"));
const SeoDialecteArabe = lazy(() => import("./pages/seo/DialecteArabe"));
const SeoCeArabaSaInveti = lazy(() => import("./pages/seo/CeArabaSaInveti"));
const SeoArabaPentruPartener = lazy(() => import("./pages/seo/ArabaPentruPartener"));
const SeoArabaInFamilie = lazy(() => import("./pages/seo/ArabaInFamilie"));
const SeoCelMaiBunCursAraba = lazy(() => import("./pages/seo/CelMaiBunCursAraba"));
const SeoCursuriArabaAdolescenti = lazy(() => import("./pages/seo/CursuriArabaAdolescenti"));
const BestArabicCourse = lazy(() => import("./pages/en/BestArabicCourse"));
const ArabicForTeenagers = lazy(() => import("./pages/en/ArabicForTeenagers"));

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

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <I18nProvider>
      <BrowserRouter>
        <RouteAnalytics />
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
            <Route path="/auth" element={<Auth />} />
            <Route path="/cursuri" element={<Cursuri />} />
            <Route path="/cursuri/privat" element={<PrivateCourse />} />
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
            <Route path="/blog/learn-lebanese-arabic" element={<BlogLearnLebaneseArabic />} />
            <Route path="/blog/gramatica-arabei-libaneze" element={<BlogGramaticaArabaLibaneza />} />
            <Route path="/blog/lebanese-arabic-phrases" element={<BlogLebaneseArabicPhrases />} />
            <Route path="/blog/lebanese-family-vocabulary" element={<BlogLebaneseFamilyVocabulary />} />
            <Route path="/blog/de-ce-invatam-araba-in-2026" element={<BlogDeCeInvatamAraba2026 />} />
            <Route path="/blog/limbile-vorbite-in-liban" element={<BlogLimbileVorbiteInLiban />} />
            <Route path="/blog/lebanese-arabic-learning-resources" element={<BlogLebaneseArabicLearningResources />} />
            <Route path="/en/learn-lebanese-arabic" element={<LearnLebaneseArabic />} />
            <Route path="/en/learn-levantine-arabic" element={<LearnLevantineArabic />} />
            <Route path="/en/arabic-tutor" element={<ArabicTutor />} />
            <Route path="/en/arabic-classes-near-me" element={<ArabicClassesNearMe />} />
            <Route path="/en/arabic-dialects-guide" element={<ArabicDialectsGuide />} />
            <Route path="/en/levantine-arabic-dialects-map" element={<LevantineArabicDialectsMap />} />
            <Route path="/en/lebanese-arabic-vs-msa-vs-egyptian" element={<LebaneseVsMsaVsEgyptian />} />
            <Route path="/en/how-to-learn-lebanese-arabic" element={<HowToLearnLebaneseArabic />} />
            <Route path="/de/arabisch-lernen" element={<DeArabischLernen />} />
            <Route path="/cursuri-araba" element={<SeoCursuriAraba />} />
            <Route path="/araba-pentru-incepatori" element={<SeoArabaPentruIncepatori />} />
            <Route path="/araba-online" element={<SeoArabaOnline />} />
            {/* Merged into /cursuri-araba: same subject, and the surviving
                slug matches the higher-volume query. */}
            <Route path="/cursuri-limba-araba" element={<Navigate to="/cursuri-araba" replace />} />
            <Route path="/meditatii-araba" element={<SeoMeditatiiAraba />} />
            <Route path="/invata-araba" element={<SeoInvataAraba />} />
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
      </BrowserRouter>
      </I18nProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
