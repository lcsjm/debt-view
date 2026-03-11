import {
  LayoutDashboard,
  Target,
  Calculator,
  Shield,
  Rocket,
  BookOpen,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import supabase from "../../utils/supabase";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";

const menuItems = [
  { icon: LayoutDashboard, label: "Painel Financeiro", id: "painel" }
];

interface AppSidebarProps {
  activeSection: string;
  onSectionChange: (id: string) => void;
}

export function AppSidebar({ activeSection, onSectionChange }: AppSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const { theme, setTheme } = useTheme();
  const nav = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    nav('/');
  };

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 260 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="fixed left-0 top-0 h-screen bg-primary z-50 flex flex-col shadow-xl"
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-6 border-b border-sidebar-border">
        <div className="w-9 h-9 rounded-lg gradient-accent flex items-center justify-center flex-shrink-0">
          <TrendingUp className="w-5 h-5 text-primary-foreground" />
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

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const active = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-primary-foreground/70 hover:bg-sidebar-accent/50 hover:text-primary-foreground"
              }`}
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
                  className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-pink"
                />
              )}
            </button>
          );
        })}
      </nav>

      {/* Actions */}
      <div className="flex flex-col gap-2 mx-3 mb-4">
        
        {/* Theme Toggle */}
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="p-2 rounded-lg text-primary-foreground/60 hover:text-primary-foreground hover:bg-sidebar-accent/50 transition-colors flex items-center justify-center gap-3 overflow-hidden"
          title={theme === "dark" ? "Modo Claro" : "Modo Escuro"}
        >
          {theme === "dark" ? <Sun className="w-5 h-5 flex-shrink-0" /> : <Moon className="w-5 h-5 flex-shrink-0" />}
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="text-sm font-medium whitespace-nowrap"
              >
                {theme === "dark" ? "Modo Claro" : "Modo Escuro"}
              </motion.span>
            )}
          </AnimatePresence>
        </button>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="p-2 rounded-lg text-primary-foreground/60 hover:text-red-400 hover:bg-red-400/10 transition-colors flex items-center justify-center gap-3 overflow-hidden"
          title="Sair"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="text-sm font-medium whitespace-nowrap"
              >
                Sair da Conta
              </motion.span>
            )}
          </AnimatePresence>
        </button>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-lg text-primary-foreground/60 hover:text-primary-foreground hover:bg-sidebar-accent/50 transition-colors flex items-center justify-center"
        >
          {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>
    </motion.aside>
  );
}
