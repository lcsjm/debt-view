import { useState, useRef } from "react";
import {
  LayoutDashboard,
  CreditCard,
  User,
  BookOpen,
  Sparkles,
  Mail,
  LogOut,
  Sun,
  Moon,
  BotMessageSquare
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import supabase from "../../utils/supabase";
import { useTheme } from "next-themes";
import { useChat } from "./chat-context";

// --- COMPONENTE MAGNETIC BUTTON ---
const MagneticButton = ({ children, className, onClick, disabled, title }: any) => {
  const ref = useRef<HTMLButtonElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouse = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;
    const { clientX, clientY } = e;
    const { height, width, left, top } = ref.current!.getBoundingClientRect();
    const middleX = clientX - (left + width / 2);
    const middleY = clientY - (top + height / 2);
    setPosition({ x: middleX * 0.3, y: middleY * 0.3 });
  };

  const reset = () => {
    setPosition({ x: 0, y: 0 });
  };

  return (
    <motion.button
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: "spring", stiffness: 300, damping: 20, mass: 0.5 }}
      className={className}
      onClick={onClick}
      disabled={disabled}
      title={title}
    >
      {children}
    </motion.button>
  );
};

const menuItems = [
  { icon: LayoutDashboard, label: "Painel Financeiro", id: "painel", path: "/dashboard" },
  { icon: CreditCard,      label: "Parcelamentos",     id: "debts",   path: "/debts" },
  { icon: User,            label: "Meu Perfil",        id: "profile", path: "/profile" },
  { icon: BookOpen,        label: "Educação Financeira", id: "education", path: "/education" },
  { icon: BotMessageSquare ,        label: "Assistente",        id: "chatbot", path: "#" },
  { icon: Mail,            label: "Fale Conosco",      id: "directme", path: "/directme" },
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
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="fixed left-0 top-0 h-screen bg-[#1D4F91] border-r border-[#1D4F91] z-50 flex flex-col shadow-2xl overflow-hidden"
    >
      {/* Header com Logo */}
      <div className="flex items-center justify-center px-3 py-6 border-b border-white/10 h-[88px] shrink-0">
        <div 
          onClick={() => nav("/dashboard")}
          className="flex items-center justify-center gap-3 cursor-pointer group w-full overflow-hidden transition-all"
        >
          {/* Logo - Aqui foi adicionada a classe rounded-xl */}
          <div className="w-9 h-9 flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105">
            <img 
              src="../public/debtviewlogo.png" 
              alt="DebtView Logo" 
              className="w-full h-full object-cover rounded-xl" 
            />
          </div>
          
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0, x: -10 }}
                animate={{ opacity: 1, width: "auto", x: 0 }}
                exit={{ opacity: 0, width: 0, x: -10 }}
                className="text-xl font-heading font-black text-white whitespace-nowrap tracking-tight"
              >
                DebtView
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Navegação principal */}
      <nav className="flex-1 px-3 py-6 flex flex-col justify-center gap-3 overflow-y-auto custom-scroll">
        {menuItems.map((item) => {
          const active = item.path === "#" ? activeSection === item.id : location.pathname.startsWith(item.path);
          
          return (
            <MagneticButton
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
                  ? "bg-white/20 text-white font-bold shadow-sm"
                  : "text-white/70 hover:bg-white/10 hover:text-white font-medium"
              } ${collapsed ? "justify-center" : "justify-start"}`}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className={`w-[22px] h-[22px] flex-shrink-0 transition-colors ${active ? "text-white" : "text-white/50 group-hover:text-white"}`} />
              
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
            </MagneticButton>
          );
        })}
      </nav>

      {/* Ações Inferiores - Sempre centralizados horizontalmente */}
      <div className="p-3 border-t border-white/10 flex flex-col justify-center gap-2 shrink-0 bg-black/10">
        {/* Toggle de Tema */}
        <MagneticButton
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="w-full flex items-center justify-center gap-3 px-3 py-3 rounded-xl transition-colors duration-200 text-white/70 hover:bg-white/10 hover:text-white font-medium"
          title={theme === "dark" ? "Mudar para Claro" : "Mudar para Escuro"}
        >
          {theme === "dark" ? <Sun className="w-5 h-5 flex-shrink-0" /> : <Moon className="w-5 h-5 flex-shrink-0 text-white/70" />}
          
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
        </MagneticButton>

        {/* Logout */}
        <MagneticButton
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-3 px-3 py-3 rounded-xl transition-colors duration-200 text-white/70 hover:bg-red-500/20 hover:text-red-400 font-medium group"
          title="Sair da Conta"
        >
          <LogOut className="w-5 h-5 flex-shrink-0 text-white/70 transition-colors group-hover:text-red-400" />
          
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
        </MagneticButton>
      </div>
    </motion.aside>
  );
}