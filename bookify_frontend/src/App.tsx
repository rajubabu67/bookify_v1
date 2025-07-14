import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import NewBookingPage from "./components/NewBookingPage";
import BookingConfirmationPage from "./components/BookingConfirmationPage";
import LoginSignup from "./components/LoginSignup";
import WeeklySchedulePage from "./components/WeeklySchedulePage";

const queryClient = new QueryClient();

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<LoginSignup onLogin={() => {}} />} />
            <Route path="/business/:businessId/new-booking" element={<NewBookingPage />} />
            <Route path="/business/booking-confirmation/:bookingId" element={<BookingConfirmationPage />} />
            <Route path="/weekly-schedule" element={<WeeklySchedulePage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
