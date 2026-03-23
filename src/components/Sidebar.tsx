import { useRef, useState, useCallback } from "react";
import { motion, useMotionValue, useSpring, AnimatePresence } from "framer-motion";
import { 
  Home, 
  BarChart3, 
  MessageSquare, 
  BookOpen, 
  LogOut, 
  Sun, 
  Moon, 
  MessageCircle 
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "next-themes";
import { useChat } from "@/components/chat-context";
import supabase from "../../utils/supabase";

// Componente para o efeito magnético nos ícones
const MagneticIcon = ({ 
  children, 
  onClick, 
  className, 
  isExpanded 
}: { 
  children: React.ReactNode; 
  onClick?: () => void; 
  className?: string;
  isExpanded: boolean;
}) => {
  const ref = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 300, damping: 20 });
  const springY = useSpring(y, { stiffness: 300, damping: 20 });

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    x.set((e.clientX - cx) * 0.3);
    y.set((e.clientY - cy) * 0.3);
  }, [x, y]);

  const handleMouseLeave = useCallback(() => {
    x.set(0);
    y.set(0);
  }, [x, y]);

  return (
    <motion.button
      ref={ref}
      style={{ x: springX, y: springY }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`p-2 rounded-xl text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10 transition-colors duration-200 w-full flex items-center ${!isExpanded ? 'justify-center' : ''} ${className}`}
    >
      {children}
    </motion.button>
  );
};

const navItems = [
  { icon: <Home size={20} />, label: "Início", href: "#hero" },
  { icon: <BarChart3 size={20} />, label: "Calculadora", href: "#calculator" },
  { icon: <MessageSquare size={20} />, label: "Análise", href: "#analysis" },
  { icon: <BookOpen size={20} />, label: "Educação", href: "#education" },
];

const Sidebar = () => {
  const nav = useNavigate();
  const { theme, setTheme } = useTheme();
  const { toggle: toggleChat } = useChat();
  const [isHovered, setIsHovered] = useState(false);

  const scrollTo = (href: string) => {
    const el = document.querySelector(href);
    el?.scrollIntoView({ behavior: "smooth" });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    nav('/');
  };

  return (
    <motion.aside
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      initial={{ width: 80 }}
      animate={{ width: isHovered ? 260 : 80 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="fixed left-0 top-0 bottom-0 z-50 bg-primary/95 backdrop-blur-md shadow-2xl border-r border-primary-foreground/10 hidden md:flex flex-col overflow-hidden"
    >
      <div className="flex flex-col h-full py-8 px-4">
        
        {/* Logo Section */}
        <div className="mb-10 px-2 min-h-[40px] flex items-center">
          <a href="#hero" className="flex items-center gap-3" onClick={() => scrollTo("#hero")}>
            <div className="min-w-[40px] flex justify-center items-center">
                <span className="font-heading font-bold text-primary-foreground text-2xl">D</span>
            </div>
            <AnimatePresence>
              {isHovered && (
                <motion.span 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="font-heading font-bold text-primary-foreground text-2xl whitespace-nowrap"
                >
                  ebtView
                </motion.span>
              )}
            </AnimatePresence>
          </a>
        </div>

        {/* Navigation Section - CENTRALIZADO VERTICALMENTE */}
        <nav className="flex flex-col gap-2 flex-grow justify-center">
          {navItems.map((item) => (
            <MagneticIcon key={item.label} isExpanded={isHovered} onClick={() => scrollTo(item.href)}>
              <div className="flex items-center gap-3 text-sm font-medium px-2 py-1 whitespace-nowrap">
                <span className="flex-shrink-0">{item.icon}</span>
                {isHovered && <span>{item.label}</span>}
              </div>
            </MagneticIcon>
          ))}

          <MagneticIcon key="sobre" isExpanded={isHovered} onClick={() => nav('/about')}>
            <div className="flex items-center gap-3 text-sm font-medium px-2 py-1 whitespace-nowrap">
              <span className="flex-shrink-0"><BookOpen size={20} /></span>
              {isHovered && <span>Sobre</span>}
            </div>
          </MagneticIcon>
        </nav>

        {/* Bottom Actions Section */}
        <div className="flex flex-col gap-2 pt-6 border-t border-primary-foreground/10">
          
          {/* Theme Switcher com Magnetic Effect */}
          <MagneticIcon 
            isExpanded={isHovered} 
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="!p-1"
          >
            <div className={`flex items-center ${isHovered ? 'justify-between w-full' : 'justify-center'} px-2`}>
                <div
                  className={`relative flex h-7 items-center rounded-full p-1 transition-all duration-300 ${isHovered ? 'w-12' : 'w-7'}`}
                  style={{ backgroundColor: theme === "dark" ? "hsl(var(--raspberry))" : "rgba(255,255,255,0.2)" }}
                >
                  <motion.div
                    layout
                    transition={{ type: "spring", stiffness: 700, damping: 30 }}
                    className="flex h-5 w-5 items-center justify-center rounded-full bg-white shadow-sm"
                    style={{ marginLeft: (isHovered && theme === "dark") ? "auto" : "0" }}
                  >
                    {theme === "dark" ? <Moon className="h-3 w-3 text-raspberry" /> : <Sun className="h-3 w-3 text-primary" />}
                  </motion.div>
                </div>
                {isHovered && <span className="text-sm ml-3 flex-grow text-left">Tema</span>}
            </div>
          </MagneticIcon>

          {/* Chat Toggle com Magnetic Effect (Apenas se expandido) */}
          <AnimatePresence>
            {isHovered && (
              <MagneticIcon isExpanded={isHovered} onClick={toggleChat}>
                 <div className="flex items-center gap-3 text-sm font-medium px-2 py-1">
                    <MessageCircle size={20} />
                    <span>Chat Suporte</span>
                 </div>
              </MagneticIcon>
            )}
          </AnimatePresence>

          {/* Logout Button com Magnetic Effect */}
          <MagneticIcon 
            isExpanded={isHovered} 
            onClick={handleLogout}
            className="bg-white/10 border border-white/20 hover:bg-white/20 hover:text-[#E80070] !mt-2"
          >
            <div className="flex items-center gap-3 text-sm font-medium px-2 py-1">
              <LogOut size={18} />
              {isHovered && <span className="whitespace-nowrap">Sair da conta</span>}
            </div>
          </MagneticIcon>
        </div>
      </div>
    </motion.aside>
  );
};

export default Sidebar;