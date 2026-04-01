
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Slots from "./pages/Slots";
import Miner from "./pages/Miner";
import Bonuses from "./pages/Bonuses";
import Crash from "./pages/Crash";
import NotFound from "./pages/NotFound";
import { AuthProvider } from "./context/AuthContext";
import AuthModal from "./components/AuthModal";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <AuthModal />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/slots" element={<Slots />} />
            <Route path="/miner" element={<Miner />} />
            <Route path="/bonuses" element={<Bonuses />} />
            <Route path="/crash" element={<Crash />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
