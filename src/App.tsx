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
const CursAdulti = lazy(() => import("./pages/courses/CursAdulti"));
const CursTineri = lazy(() => import("./pages/courses/CursTineri"));

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
            <Route path="/cursuri/adulti" element={<CursAdulti />} />
            <Route path="/cursuri/tineri" element={<CursTineri />} />
            <Route path="/cursuri/grup" element={<CursGrup />} />
            <Route path="/cursuri/grup/:level" element={<CursGrupLevel />} />
            <Route path="/cursuri/private" element={<CursPrivate />} />
            <Route path="/cursuri/copii" element={<CursCopii />} />
            <Route path="/cursuri/online" element={<Navigate to="/cursuri" replace />} />
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
