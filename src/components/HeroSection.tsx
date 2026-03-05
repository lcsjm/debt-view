import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import hero1 from "@/assets/hero-1.jpg";
import hero2 from "@/assets/hero-2.jpg";
import hero3 from "@/assets/hero-3.jpg";

const slides = [
  {
    image: hero1,
    title: "Controle suas finanças",
    subtitle: "Analise seus gastos e tome decisões mais inteligentes com o DebtView.",
  },
  {
    image: hero2,
    title: "Liberte-se das dívidas",
    subtitle: "Planeje sua saída do endividamento com ferramentas profissionais.",
  },
  {
    image: hero3,
    title: "Invista no seu futuro",
    subtitle: "Aprenda sobre investimentos e faça seu dinheiro trabalhar para você.",
  },
];

const HeroSection = () => {
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => setCurrent((p) => (p + 1) % slides.length), []);
  const prev = useCallback(() => setCurrent((p) => (p - 1 + slides.length) % slides.length), []);

  useEffect(() => {
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, [next]);

  return (
    <section id="hero" className="relative min-h-screen flex items-center overflow-hidden">
      {/* Carousel backgrounds */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
          className="absolute inset-0 z-0"
        >
          <img
            src={slides[current].image}
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/90 dark:from-background/95 via-primary/60 dark:via-background/70 to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* Content */}
      <div className="container mx-auto relative z-10 px-4 py-32">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial="hidden"
            animate="show"
            exit="exit"
            variants={{
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.2,
                  delayChildren: 0.1,
                },
              },
              exit: {
                opacity: 0,
                y: -20,
                transition: { duration: 0.4 },
              },
            }}
            className="max-w-3xl"
          >
            <motion.h1
              variants={{
                hidden: { opacity: 0, y: 30 },
                show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
              }}
              className="fluid-title-xl font-heading font-extrabold text-primary-foreground mb-8 drop-shadow-xl"
            >
              {slides[current].title}
            </motion.h1>

            <motion.p
              variants={{
                hidden: { opacity: 0, y: 20 },
                show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
              }}
              className="fluid-body text-primary-foreground/90 mb-10 max-w-xl leading-relaxed"
            >
              {slides[current].subtitle}
            </motion.p>

            <motion.div
              variants={{
                hidden: { opacity: 0, y: 15 },
                show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
              }}
              className="flex flex-wrap gap-5"
            >
              <button
                className="btn-raspberry-serasa text-base px-8 py-3.5"
                onClick={() => document.querySelector("#calculator")?.scrollIntoView({ behavior: "smooth" })}
              >
                Começar agora
              </button>
              <button
                className="btn-serasa bg-primary-foreground/15 text-primary-foreground border border-primary-foreground/30 hover:bg-primary-foreground/25 text-base px-8 py-3.5 backdrop-blur-sm"
                onClick={() => document.querySelector("#education")?.scrollIntoView({ behavior: "smooth" })}
              >
                Saiba mais
              </button>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Carousel controls */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex items-center gap-4">
        <button onClick={prev} className="p-2 rounded-full bg-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/30 transition-all duration-300">
          <ChevronLeft size={20} />
        </button>
        <div className="flex gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${i === current ? "bg-raspberry w-8" : "bg-primary-foreground/40"
                }`}
            />
          ))}
        </div>
        <button onClick={next} className="p-2 rounded-full bg-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/30 transition-all duration-300">
          <ChevronRight size={20} />
        </button>
      </div>
    </section>
  );
};

export default HeroSection;
