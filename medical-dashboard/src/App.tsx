import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import CalendarPage from "./pages/CalendarPage";
import NotFound from "./pages/NotFound";
import MainLayout from "./components/layout/MainLayout";


const App = () => (
  <TooltipProvider>
    <Toaster />
    <Sonner />
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/search" element={<Dashboard />} />
          <Route path="/revenue" element={<Dashboard />} />
          <Route path="/patients" element={<Dashboard />} />
          <Route path="/doctors" element={<Dashboard />} />
          <Route path="/prescriptions" element={<Dashboard />} />
          <Route path="/pharmacy" element={<Dashboard />} />
          <Route path="/settings" element={<Dashboard />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </TooltipProvider>
);

export default App;
