import {
  LayoutDashboard,
  Target,
  Calculator,
  Shield,
  Rocket,
  BookOpen,
  TrendingUp,
  LogOut,
  User,
  CreditCard,
  Sun,
  Moon,
} from "lucide-react";
import { useRef, useCallback } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import supabase from "../../utils/supabase";
import { useTheme } from "next-themes";
import { useChat } from "./chat-context";

// --- Componente de Efeito Magnético ---
const MagneticWrapper = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 150, damping: 15 });
  const springY = useSpring(y, { stiffness: 150, damping: 15 });

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!ref.current) return;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    const centerX = left + width / 2;
    const centerY = top + height / 2;
    x.set((e.clientX - centerX) * 0.4);
    y.set((e.clientY - centerY) * 0.4);
  }, [x, y]);

  const handleMouseLeave = useCallback(() => {
    x.set(0);
    y.set(0);
  }, [x, y]);

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x: springX, y: springY }}
      className={`w-full ${className}`}
    >
      {children}
    </motion.div>
  );
};

const menuItems = [
  { icon: LayoutDashboard, label: "Painel Financeiro", id: "painel", path: "/dashboard" },
  { icon: CreditCard,      label: "Dívidas",           id: "debts",   path: "/debts" },
  { icon: User,            label: "Meu Perfil",        id: "profile", path: "/profile" },
  { icon: BookOpen,        label: "Educação Financeira", id: "education", path: "/education" },
  { icon: Rocket,          label: "Assistente Serasa", id: "chatbot", path: "#" },
];

interface AppSidebarProps {
  activeSection: string;
  onSectionChange: (id: string) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export function AppSidebar({ activeSection, onSectionChange, collapsed, setCollapsed }: AppSidebarProps) {
  const { theme, setTheme } = useTheme();
  const nav = useNavigate();
  const location = useLocation();
  const { toggle } = useChat();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    nav('/');
  };

  return (
    <motion.aside
      onMouseEnter={() => setCollapsed(false)}
      onMouseLeave={() => setCollapsed(true)}
      animate={{ width: collapsed ? 72 : 260 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
      className="fixed left-0 top-0 h-screen bg-primary z-50 flex flex-col shadow-xl"
    >
      {/* Logo */}
      <div 
        onClick={() => nav("/dashboard")}
        className="flex items-center justify-center gap-3 px-5 py-8 border-b border-sidebar-border cursor-pointer hover:bg-sidebar-accent/50 transition-colors"
      >
        <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0">
          <img src="/favicon.svg" alt="DebtView Logo" className="w-9 h-9 rounded-lg" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              className="text-xl font-heading font-bold text-primary-foreground whitespace-nowrap overflow-hidden"
            >
              DebtView
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Nav - APENAS CENTRALIZADO VERTICALMENTE */}
      <nav className="flex-1 px-3 py-4 flex flex-col justify-center gap-6 overflow-y-auto">
        {menuItems.map((item) => {
          const active = item.path === "#" ? activeSection === item.id : location.pathname.startsWith(item.path);
          
          return (
            <MagneticWrapper key={item.id}>
              <button
                onClick={() => {
                  if (item.id === "chatbot") {
                    toggle();
                  } else {
                    if (item.id) onSectionChange(item.id);
                    if (item.path) nav(item.path);
                  }
                }}
                className={`w-full flex items-center gap-4 px-3 py-3 rounded-lg transition-all duration-200 group relative ${
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-primary-foreground/70 hover:bg-sidebar-accent/50 hover:text-primary-foreground"
                } ${collapsed ? "justify-center" : "justify-start"}`}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-sm font-medium whitespace-nowrap overflow-hidden"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
                {active && !collapsed && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute right-3 w-1.5 h-1.5 rounded-full bg-brand-pink"
                  />
                )}
              </button>
            </MagneticWrapper>
          );
        })}
      </nav>

      {/* Actions - CENTRALIZADOS HORIZONTALMENTE */}
      <div className="flex flex-col gap-4 mx-3 mb-6 items-center">
        
        {/* Theme Toggle */}
        <MagneticWrapper>
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="w-full p-2.5 rounded-lg text-primary-foreground/60 hover:text-primary-foreground hover:bg-sidebar-accent/50 transition-colors flex items-center justify-center gap-4 overflow-hidden"
            title={theme === "dark" ? "Modo Claro" : "Modo Escuro"}
          >
            {theme === "dark" ? <Sun className="w-5 h-5 flex-shrink-0" /> : <Moon className="w-5 h-5 flex-shrink-0" />}
            {!collapsed && (
              <span className="text-sm font-medium whitespace-nowrap">
                {theme === "dark" ? "Modo Claro" : "Modo Escuro"}
              </span>
            )}
          </button>
        </MagneticWrapper>

        {/* Logout */}
        <MagneticWrapper>
          <button
            onClick={handleLogout}
            className="w-full p-2.5 rounded-lg text-primary-foreground/60 hover:text-red-400 hover:bg-red-400/10 transition-colors flex items-center justify-center gap-4 overflow-hidden"
            title="Sair"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span className="text-sm font-medium whitespace-nowrap">Sair da Conta</span>}
          </button>
        </MagneticWrapper>
      </div>
    </motion.aside>
  );
}