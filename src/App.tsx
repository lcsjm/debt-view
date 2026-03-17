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
import Debts from "./pages/Debts";
import './App.css'
import ProtectedRoute from "./components/ProtectedRoute";
import AuthRoute from "./components/AuthRoute";
import { AuthProvider } from "./context/AuthContext";

import { ThemeProvider } from "@/components/theme-provider";
import { ChatProvider } from "@/components/chat-context";
import { ChatSidebar } from "@/components/chat-sidebar";

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
        
        {/* Nova rota unificada de Autenticação */}
        <Route path="/auth" element={
          <AuthRoute>
            <Auth />
          </AuthRoute>
        } />
        
        {/* Redirecionar rotas antigas para a nova /auth */}
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
        
        {/* CATCH-ALL ROUTE (DEVE SER A ÚLTIMA A SER RENDERIZADA) */}
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
