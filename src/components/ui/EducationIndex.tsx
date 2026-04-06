import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { GraduationCap, Droplets, PiggyBank, Building2, TrendingUp, Rocket, TrendingDown, Percent, Receipt, Handshake, Calculator, Home } from "lucide-react";
import ScrollReveal from "../ScrollReveal";

type CardType = {
  title: string;
  icon: JSX.Element;
  desc: string;
};

const investmentCards: CardType[] = [
  { 
    title: "Educação", 
    icon: <GraduationCap size={28} />, 
    desc: "Investir em conhecimento é o maior retorno que você pode ter."
  },
  { 
    title: "Liquidez diária", 
    icon: <Droplets size={28} />, 
    desc: "Investimentos com resgate imediato para sua reserva de emergência."
  },
  { 
    title: "Poupança", 
    icon: <PiggyBank size={28} />, 
    desc: "O primeiro passo para guardar dinheiro, simples e acessível."
  },
  { 
    title: "Patrimônio", 
    icon: <Building2 size={28} />, 
    desc: "Construa riqueza com imóveis e ativos de longo prazo."
  },
  { 
    title: "Ações", 
    icon: <TrendingUp size={28} />, 
    desc: "Participe do crescimento de grandes empresas na bolsa."
  },
  { 
    title: "Empreendimento", 
    icon: <Rocket size={28} />, 
    desc: "Crie seu próprio negócio e gere renda ativa."
  },
];

const conceptCards: CardType[] = [
  { 
    title: "Inflação", 
    icon: <TrendingDown size={28} />, 
    desc: "Entenda como a inflação corrói seu poder de compra ao longo do tempo."
  },
  { 
    title: "CDB e CDI", 
    icon: <Percent size={28} />, 
    desc: "Conheça os principais indicadores de renda fixa do mercado."
  },
  { 
    title: "Taxas e juros", 
    icon: <Receipt size={28} />, 
    desc: "Saiba como as taxas impactam seus investimentos e dívidas."
  },
  { 
    title: "Empréstimos", 
    icon: <Handshake size={28} />, 
    desc: "Quando e como recorrer a empréstimos de forma inteligente."
  },
  { 
    title: "Amortização", 
    icon: <Calculator size={28} />, 
    desc: "Reduza o valor das suas parcelas e economize nos juros."
  },
  { 
    title: "Financiamento", 
    icon: <Home size={28} />, 
    desc: "Tudo sobre financiamento imobiliário e veicular."
  },
];

const ScrollingRow = ({ 
  cards, 
  direction 
}: { 
  cards: typeof investmentCards; 
  direction: "left" | "right"; 
}) => {
  const [paused, setPaused] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [lastX, setLastX] = useState(0);
  
  const sliderRef = useRef<HTMLDivElement>(null);
  const setRef = useRef<HTMLDivElement>(null);
  const exactScrollLeft = useRef(0);

  const getSetWidth = () => {
    if (!setRef.current) return 0;
    return setRef.current.offsetWidth + 24; 
  };

  const handleBoundary = () => {
    if (!sliderRef.current) return;
    const slider = sliderRef.current;
    const singleSetWidth = getSetWidth();
    if (singleSetWidth === 0) return;

    if (slider.scrollLeft <= 0) {
      slider.scrollLeft += singleSetWidth;
      exactScrollLeft.current += singleSetWidth;
    } else if (slider.scrollLeft >= singleSetWidth * 2) {
      slider.scrollLeft -= singleSetWidth;
      exactScrollLeft.current -= singleSetWidth;
    }
  };

  useEffect(() => {
    if (paused || isDragging) return;
    let animationId: number;
    
    const scroll = () => {
      if (sliderRef.current) {
        const speed = direction === "left" ? 0.5 : -0.5;
        exactScrollLeft.current += speed;
        sliderRef.current.scrollLeft = exactScrollLeft.current;
        handleBoundary();
      }
      animationId = requestAnimationFrame(scroll);
    };
    
    animationId = requestAnimationFrame(scroll);
    return () => cancelAnimationFrame(animationId);
  }, [paused, isDragging, direction]);

  useEffect(() => {
    if (sliderRef.current && setRef.current) {
      const startPos = getSetWidth();
      sliderRef.current.scrollLeft = startPos;
      exactScrollLeft.current = startPos;
    }
  }, []);

  const handleScroll = () => {
    if (!sliderRef.current) return;
    exactScrollLeft.current = sliderRef.current.scrollLeft;
    handleBoundary();
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    if (sliderRef.current) {
      const x = e.pageX - sliderRef.current.offsetLeft;
      setStartX(x);
      setLastX(x);
    }
  };

  const handleMouseLeave = () => {
    setPaused(false);
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !sliderRef.current) return;
    e.preventDefault();
    const x = e.pageX - sliderRef.current.offsetLeft;
    
    const walk = (x - lastX); 
    exactScrollLeft.current -= walk;
    sliderRef.current.scrollLeft = exactScrollLeft.current;
    setLastX(x);
    handleBoundary();
  };

  return (
    <div
      ref={sliderRef}
      className={`overflow-hidden py-8 -my-8 hide-scrollbar ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseMove={handleMouseMove}
      onScroll={handleScroll}
      style={{ scrollBehavior: 'auto' }} 
    >
      <div className="flex gap-6 w-max">
        {[0, 1, 2].map((setIndex) => (
          <div 
            key={setIndex} 
            ref={setIndex === 0 ? setRef : null} 
            className="flex gap-6"
          >
            {cards.map((card, i) => {
              return (
                <motion.div
                  key={`${card.title}-${i}-${setIndex}`}
                  whileHover={{ scale: 1.03, y: -4 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white/10 dark:bg-slate-900/20 backdrop-blur-2xl shadow-lg p-6 min-w-[300px] max-w-[300px] flex-shrink-0 flex flex-col group transition-all duration-300 rounded-2xl ring-1 ring-inset ring-white/20 dark:ring-white/5 border border-white/20 dark:border-white/10"
                >
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-4 group-hover:bg-raspberry/10 group-hover:text-raspberry transition-colors duration-300">
                    {card.icon}
                  </div>
                  <h4 className="font-heading font-bold text-slate-900 dark:text-white text-lg mb-4">{card.title}</h4>
                  <div className="mt-auto">
                    <p className="text-slate-800 dark:text-slate-200 text-base leading-relaxed font-normal">{card.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

const EducationIndex = () => {
  return (
    <>
      <style>{`
        @keyframes blob-float-1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(8%, 12%) scale(1.05); }
          66% { transform: translate(-5%, 8%) scale(0.95); }
        }
        @keyframes blob-float-2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(-10%, 15%) scale(1.1); }
          66% { transform: translate(8%, -10%) scale(0.9); }
        }
        @keyframes blob-float-3 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(15%, -10%) scale(0.95); }
          66% { transform: translate(-10%, -15%) scale(1.05); }
        }

        .dynamic-blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(120px);
          animation-duration: 25s;
          animation-iteration-count: infinite;
          animation-timing-function: ease-in-out;
        }

        .blob-dark-blue { background-color: #1D4F91; width: 50vw; height: 50vw; top: -20%; left: -10%; animation-name: blob-float-1; }
        .blob-purple { background-color: #77127B; width: 45vw; height: 45vw; top: 10%; left: 30%; animation-name: blob-float-2; animation-delay: -5s; }
        .blob-magenta { background-color: #E80070; width: 40vw; height: 40vw; bottom: -10%; right: 10%; animation-name: blob-float-3; animation-delay: -2s; }
        .blob-light-blue { background-color: #426DA9; width: 45vw; height: 45vw; bottom: 20%; left: 10%; animation-name: blob-float-1; animation-direction: reverse; animation-delay: -7s; }
        .blob-raspberry { background-color: #C1188B; width: 35vw; height: 35vw; top: 20%; right: -5%; animation-name: blob-float-2; animation-direction: reverse; animation-delay: -10s; }
        
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <section id="education" className="relative w-full min-h-screen py-24 flex flex-col justify-center bg-slate-50 dark:bg-slate-950 overflow-hidden border-t border-slate-200 dark:border-white/10">
        
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 opacity-50 dark:opacity-60 transition-opacity duration-500">
          <div className="dynamic-blob blob-dark-blue"></div>
          <div className="dynamic-blob blob-purple"></div>
          <div className="dynamic-blob blob-magenta"></div>
          <div className="dynamic-blob blob-light-blue"></div>
          <div className="dynamic-blob blob-raspberry"></div>
        </div>

        <div className="relative z-10 w-full">
          <div className="container mx-auto px-4">
            <ScrollReveal>
              <h2 className="fluid-title-lg font-heading font-bold text-center text-slate-900 dark:text-white mb-6">
                Educação Financeira
              </h2>
              {/* O max-w-5xl foi alterado para max-w-7xl aqui */}
              <p className="text-center text-slate-600 dark:text-slate-300 max-w-7xl mx-auto text-lg leading-relaxed mb-16">
                Cuidar do seu dinheiro não precisa ser complicado. Aqui, você terá acesso a conteúdos educacionais pensados para acompanhar você em cada etapa da sua jornada financeira. Tudo com uma linguagem simples, clara e, acima de tudo, possível de aplicar no seu dia a dia.
              </p>
            </ScrollReveal>
          </div>

          <ScrollReveal delay={0.1}>
            <div className="mb-16 w-full">
              <h3 className="fluid-title-md font-heading font-bold text-center text-slate-800 dark:text-slate-200 mb-8">
                Investimentos
              </h3>
              <div className="w-full relative">
                <ScrollingRow 
                  cards={investmentCards} 
                  direction="left" 
                />
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.2}>
            <div className="w-full">
              <h3 className="fluid-title-md font-heading font-bold text-center text-slate-800 dark:text-slate-200 mb-8">
                Conceitos
              </h3>
              <div className="w-full relative">
                <ScrollingRow 
                  cards={conceptCards} 
                  direction="right" 
                />
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
};

export default EducationIndex;