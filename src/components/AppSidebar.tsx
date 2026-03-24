import {
  LayoutDashboard,
  CreditCard,
  User,
  BookOpen,
  Rocket,
  LogOut,
  Sun,
  Moon,
  PanelLeftClose,
  PanelLeft,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import supabase from "../../utils/supabase";
import { useTheme } from "next-themes";
import { useChat } from "./chat-context";

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
      animate={{ width: collapsed ? 72 : 260 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="fixed left-0 top-0 h-screen bg-sidebar border-r border-sidebar-border z-50 flex flex-col shadow-2xl overflow-hidden"
    >
      {/* Header com Logo e Botão de Toggle */}
      <div className="flex items-center justify-between px-3 py-6 border-b border-sidebar-border/50 h-[88px] shrink-0">
        <div 
          onClick={() => nav("/dashboard")}
          className={`flex items-center gap-3 cursor-pointer group flex-1 overflow-hidden transition-all ${collapsed ? 'justify-center ml-1' : 'ml-2'}`}
        >
          {/* Logo original */}
          <div className="w-9 h-9 flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105">
            <img src="/favicon.svg" alt="DebtView Logo" className="w-9 h-9 rounded-lg" />
          </div>
          
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0, x: -10 }}
                animate={{ opacity: 1, width: "auto", x: 0 }}
                exit={{ opacity: 0, width: 0, x: -10 }}
                className="text-xl font-heading font-black text-sidebar-foreground whitespace-nowrap tracking-tight"
              >
                DebtView
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Botão para colapsar nav */}
        <AnimatePresence>
          {!collapsed && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setCollapsed(true)}
              className="p-1.5 mr-1 rounded-md text-sidebar-foreground/40 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors"
              title="Recolher menu"
            >
              <PanelLeftClose className="w-[18px] h-[18px]" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Navegação principal */}
      <nav className="flex-1 px-3 py-6 flex flex-col gap-1.5 overflow-y-auto custom-scroll">
        {menuItems.map((item) => {
          const active = item.path === "#" ? activeSection === item.id : location.pathname.startsWith(item.path);
          
          return (
            <button
              key={item.id}
              onClick={() => {
                if (item.id === "chatbot") {
                  toggle();
                } else {
                  if (item.id) onSectionChange(item.id);
                  if (item.path) nav(item.path);
                }
              }}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-colors duration-200 group relative ${
                active
                  ? "bg-white/10 text-white font-semibold shadow-sm"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground font-medium"
              } ${collapsed ? "justify-center" : "justify-start"}`}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className={`w-[22px] h-[22px] flex-shrink-0 transition-colors ${active ? "text-white" : "text-sidebar-foreground/50 group-hover:text-sidebar-foreground"}`} />
              
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    className="text-[15px] whitespace-nowrap overflow-hidden"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>

              {/* Indicador Ativo */}
              {active && !collapsed && (
                <motion.div
                  layoutId="activeNavIndicator"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-sm bg-[#E80070]"
                />
              )}
            </button>
          );
        })}

        {/* Botão de expansão no modo colapsado */}
        <AnimatePresence>
          {collapsed && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={() => setCollapsed(false)}
              className="w-full mt-2 flex items-center justify-center gap-3 px-3 py-3 rounded-xl transition-colors duration-200 text-sidebar-foreground/40 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              title="Expandir menu"
            >
              <PanelLeft className="w-[20px] h-[20px] flex-shrink-0" />
            </motion.button>
          )}
        </AnimatePresence>
      </nav>

      {/* Ações Inferiores */}
      <div className="p-3 border-t border-sidebar-border/50 flex flex-col gap-1.5 shrink-0 bg-sidebar/50">
        {/* Toggle de Tema */}
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-colors duration-200 text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground font-medium ${collapsed ? "justify-center" : "justify-start"}`}
          title={theme === "dark" ? "Mudar para Claro" : "Mudar para Escuro"}
        >
          {theme === "dark" ? <Sun className="w-5 h-5 flex-shrink-0" /> : <Moon className="w-5 h-5 flex-shrink-0 text-sidebar-foreground/60" />}
          
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="text-[14px] whitespace-nowrap overflow-hidden"
              >
                {theme === "dark" ? "Modo Claro" : "Modo Escuro"}
              </motion.span>
            )}
          </AnimatePresence>
        </button>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-colors duration-200 text-sidebar-foreground/70 hover:bg-red-500/10 hover:text-red-500 font-medium ${collapsed ? "justify-center" : "justify-start"}`}
          title="Sair da Conta"
        >
          <LogOut className="w-5 h-5 flex-shrink-0 text-sidebar-foreground/60 transition-colors group-hover:text-red-500" />
          
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="text-[14px] whitespace-nowrap overflow-hidden"
              >
                Sair da Conta
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </motion.aside>
  );
}