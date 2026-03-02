import { useRef, useState, useCallback } from "react";
import { motion, useMotionValue, useSpring, AnimatePresence } from "framer-motion";
import { Menu, X, Home, BarChart3, MessageSquare, BookOpen, LogIn } from "lucide-react";
import serasaLogo from "@/assets/serasa-logo.png";
import { useNavigate } from "react-router-dom";

const MagneticIcon = ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => {
  const ref = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 300, damping: 20 });
  const springY = useSpring(y, { stiffness: 300, damping: 20 });
  const nav = useNavigate()

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
      className="p-2 rounded-full text-primary-foreground/80 hover:text-primary-foreground transition-colors duration-200"
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

const Header = () => {
  const nav = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const scrollTo = (href: string) => {
    setMenuOpen(false);
    const el = document.querySelector(href);
    el?.scrollIntoView({ behavior: "smooth" });
  };

  function toLogin(){
    nav('/login')
  }

  function toAbout(){
    nav('/about')
  }


  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-primary/95 backdrop-blur-md shadow-lg">
      <div className="container mx-auto flex items-center justify-between py-3 px-4">
        {/* Logo */}
        <a href="#hero" className="flex items-center gap-3" onClick={() => scrollTo("#hero")}>
          <img src={serasaLogo} alt="Serasa Experian" className="h-10 w-auto" />
          <span className="font-heading font-bold text-primary-foreground text-lg hidden sm:inline">
            DebtView Experian
          </span>
        </a>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <MagneticIcon key={item.label} onClick={() => scrollTo(item.href)}>
              <div className="flex items-center gap-1.5 text-sm font-medium">
                {item.icon}
                <span>{item.label}</span>
              </div>
            </MagneticIcon>
          ))}

          <MagneticIcon key="sobre" onClick={() => toAbout()}>
              <div className="flex items-center gap-1.5 text-sm font-medium">
                <BookOpen size={20} />
                <span>Sobre</span>
              </div>
            </MagneticIcon>
        </nav>
        {/* Entrar button with breathing */}
        <div className="flex items-center gap-3">
          <motion.button
            onClick={() => toLogin()}
            className="btn-raspberry-serasa hidden sm:flex items-center gap-2 text-sm"
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}   
          >
            <motion.span
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <LogIn size={18} />
            </motion.span>
            Entrar
          </motion.button>

          {/* Mobile menu toggle */}
          <MagneticIcon onClick={() => setMenuOpen(!menuOpen)}>
            <div className="md:hidden">
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </div>
          </MagneticIcon>
        </div>
      </div>

      {/* Mobile Menu with Spring animation */}
      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25, mass: 0.8 }}
            className="md:hidden overflow-hidden bg-primary/98 border-t border-primary-foreground/10"
          >
            <div className="container mx-auto py-4 px-4 flex flex-col gap-2">
              {navItems.map((item) => (
                <motion.button
                  key={item.label}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => scrollTo(item.href)}
                  className="flex items-center gap-3 p-3 rounded-xl text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10 transition-all duration-200"
                >
                  {item.icon}
                  <span className="font-medium">{item.label}</span>
                </motion.button>
              ))}
              <motion.button
                whileTap={{ scale: 0.95 }}
                className="btn-raspberry-serasa mt-2 flex items-center justify-center gap-2"
              >
                <LogIn size={18} />
                Entrar
              </motion.button>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
