import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import About from "./pages/About";
import Resultado from "./pages/Resultado";
import Dash from "./pages/Dash";
import Debts from "./pages/Debts";
import './App.css'
import ProtectedRoute from "./components/ProtectedRoute";
import AuthRoute from "./components/AuthRoute";

import { ThemeProvider } from "@/components/theme-provider";
import { ChatProvider } from "@/components/chat-context";
import { ChatSidebar } from "@/components/chat-sidebar";
import { StrictMode } from "react";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
    <ChatProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <ChatSidebar />
          <StrictMode>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
              <Route path='/auth' element={
                <AuthRoute>
                <Auth />
                </AuthRoute>
                } />
              <Route path='/dash' element={
              <ProtectedRoute>
                <Dash />
             </ProtectedRoute>} />
              <Route path='/about' element={<About />} />
              <Route path='/debts' element={
                <ProtectedRoute>
                <Debts />
                </ProtectedRoute>} />
              <Route path='/resultado' element={
                <ProtectedRoute>
                <Resultado />
                </ProtectedRoute>} />
            </Routes>
          </BrowserRouter>
          </StrictMode>
        </TooltipProvider>
      </QueryClientProvider>
    </ChatProvider>
  </ThemeProvider>
);

export default App;
