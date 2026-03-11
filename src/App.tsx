import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Register from "./pages/Register";
import About from "./pages/About";
import Dashboard from "./pages/dashboard";
import FinancePage from "./pages/FinancePage";
import Debts from "./pages/Debts";
import './App.css'
import ProtectedRoute from "./components/ProtectedRoute";
import AuthRoute from "./components/AuthRoute";
import { AuthProvider } from "./context/AuthContext";

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
            <AuthProvider>
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<Index />} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
              <Route path='/login' element={
                <AuthRoute>
                  <Login />
                </AuthRoute>
              } />
              <Route path='/register' element={
                <AuthRoute>
                  <Register />
                </AuthRoute>
              } />
              <Route path='/about' element={<About />} />
               <Route path='/FinancePage' element={<FinancePage />} />
              <Route path='/debts' element={
                <ProtectedRoute>
                <Debts />
                </ProtectedRoute>} />
              <Route path='/dashboard' element={
                <ProtectedRoute>
                <Dashboard />
                </ProtectedRoute>} />
                </Routes>
              </BrowserRouter>
            </AuthProvider>
          </StrictMode>
        </TooltipProvider>
      </QueryClientProvider>
    </ChatProvider>
  </ThemeProvider>
);

export default App;
