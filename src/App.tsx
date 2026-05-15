import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Admin from "./pages/Admin";
import AdminNotifications from "./pages/AdminNotifications";
import PrivateLead from "./pages/PrivateLead";
import PrivateStatus from "./pages/PrivateStatus";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import NotFound from "./pages/NotFound";
import Unsubscribe from "./pages/Unsubscribe";
import Checkout from "./pages/Checkout";
import Booking from "./pages/Booking";
import BookingManage from "./pages/BookingManage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
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
          <Route path="/booking" element={<Booking />} />
          <Route path="/booking/manage/:token" element={<BookingManage />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
