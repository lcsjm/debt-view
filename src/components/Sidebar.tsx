import { useRef, useState, useCallback } from "react";
import { motion, useMotionValue, useSpring, AnimatePresence } from "framer-motion";
import { Menu, X, Home, BarChart3, MessageSquare, BookOpen, LogIn, Sun, Moon, MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "next-themes";
import { useChat } from "@/components/chat-context";

const MagneticIcon = ({ children, onClick, className }: { children: React.ReactNode; onClick?: () => void; className?: string }) => {
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
      className={`p-2 rounded-xl text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10 transition-colors duration-200 w-full ${className}`}
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

  const scrollTo = (href: string) => {
    const el = document.querySelector(href);
    el?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    // Mudança para ocupar a lateral esquerda
    <aside className="fixed left-0 top-0 bottom-0 z-50 w-64 bg-primary/95 backdrop-blur-md shadow-2xl border-r border-primary-foreground/10 hidden md:flex flex-col">
      <div className="flex flex-col h-full py-8 px-4">
        
        {/* Logo */}
        <div className="mb-10 px-2">
          <a href="#hero" className="flex items-center gap-3" onClick={() => scrollTo("#hero")}>
            <span className="font-heading font-bold text-primary-foreground text-2xl">
              DebtView
            </span>
          </a>
        </div>

        {/* Navigation - Vertical stack */}
        <nav className="flex flex-col gap-2 flex-grow">
          {navItems.map((item) => (
            <MagneticIcon key={item.label} onClick={() => scrollTo(item.href)}>
              <div className="flex items-center gap-3 text-sm font-medium px-2 py-1">
                {item.icon}
                <span>{item.label}</span>
              </div>
            </MagneticIcon>
          ))}

          <MagneticIcon key="sobre" onClick={() => nav('/about')}>
            <div className="flex items-center gap-3 text-sm font-medium px-2 py-1">
              <BookOpen size={20} />
              <span>Sobre</span>
            </div>
          </MagneticIcon>
        </nav>

        {/* Bottom Actions */}
        <div className="flex flex-col gap-4 pt-6 border-t border-primary-foreground/10">
          
          {/* Theme & Chat - Row inside the column */}
          <div className="flex items-center justify-between px-2">
             <button
                type="button"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="relative flex h-8 w-14 items-center rounded-full p-1 transition-colors duration-300"
                style={{
                  backgroundColor: theme === "dark" ? "hsl(var(--raspberry))" : "rgba(255,255,255,0.2)",
                }}
              >
                <motion.div
                  layout
                  transition={{ type: "spring", stiffness: 700, damping: 30 }}
                  className="flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-sm"
                  style={{ marginLeft: theme === "dark" ? "auto" : "0" }}
                >
                  {theme === "dark" ? <Moon className="h-3 w-3 text-raspberry" /> : <Sun className="h-3 w-3 text-primary" />}
                </motion.div>
              </button>

              <button 
                onClick={toggleChat}
                className="p-2 bg-primary-foreground/10 rounded-full text-primary-foreground hover:bg-primary-foreground/20 transition-all"
              >
                <MessageCircle size={20} />
              </button>
          </div>

          <motion.button
            onClick={() => nav('/login')}
            className="btn-raspberry-serasa flex items-center justify-center gap-2 text-sm w-full py-3"
            whileHover={{ scale: 1.02 }}
            animate={{ boxShadow: ["0px 0px 0px rgba(227,24,55,0)", "0px 0px 15px rgba(227,24,55,0.4)", "0px 0px 0px rgba(227,24,55,0)"] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <LogIn size={18} />
            Entrar
          </motion.button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;