import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import About from "./pages/About";
import Dashboard from "./pages/dashboard";
import Debts from "./pages/Simulators";
import ProfilePage from "./pages/Profile";
import './App.css'
import ProtectedRoute from "./components/ProtectedRoute";
import AuthRoute from "./components/AuthRoute";
import { AuthProvider } from "./context/AuthContext";

import { ThemeProvider } from "@/components/theme-provider";
import { ChatProvider } from "@/components/chat-context";
import { ChatSidebar } from "@/components/chat-sidebar";
import Education from "./pages/Education";
import DirectMe from "./pages/DirectMe";

const queryClient = new QueryClient();

const AppContent = () => {
  const location = useLocation();

  // Esconder o chat na rota de autenticação
  const hideChatRoutes = ["/auth"]; 
  const showChat = !hideChatRoutes.includes(location.pathname);

  return (
    <>
      {showChat && <ChatSidebar />}

      <Routes>
        <Route path="/" element={<Index />} />
        
        {/* Autenticação */}
        <Route path="/auth" element={
          <AuthRoute>
            <Auth />
          </AuthRoute>
        } />
        
        {/* Redirecionamentos antigos */}
        <Route path="/login" element={<Navigate to="/auth" replace />} />
        <Route path="/register" element={<Navigate to="/auth" replace />} />
        
        <Route path="/about" element={<About />} />
        
        <Route path="/debts" element={  
          <ProtectedRoute>
            <Debts />
          </ProtectedRoute>
        } />
        
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>                          
        } />

        <Route path="/profile" element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        } />

        {/* ✅ ROTA CORRIGIDA */}
        <Route path="/directme" element={
          <ProtectedRoute>
            <DirectMe />
          </ProtectedRoute>
        } />

        <Route path="/education" element={
          <ProtectedRoute>
            <Education />
          </ProtectedRoute>
        } />
        
        {/* CATCH-ALL */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
};

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
    <ChatProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <AuthProvider>
            <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
              <AppContent />
            </BrowserRouter>
          </AuthProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </ChatProvider>
  </ThemeProvider>
);

export default App;