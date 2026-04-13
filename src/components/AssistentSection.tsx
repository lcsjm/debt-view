import { useState, useRef, useEffect, useCallback } from "react";
import { 
  ChevronLeft, 
  ChevronRight, 
  Maximize2, 
  Minimize2, 
  X, 
  BotMessageSquare
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Chatbot from "./ui/ChatBot";

// Referências apontando para a pasta public
const storySerasaLimpaNome = "/LimpaNomeSerasa.png";
const storyDesenrola = "/DesenrolaBrasil.png";
const storyAmortizacao = "/AmortizacaoSerasa.webp";
const storyFeirao = "/FeiraoSerasa.png";

interface FinancialData {
  divida: number;
  rendaFixa: number[];
  rendaVariavel: number[];
  gastosFixos: number[];
  gastosVariaveis: number[];
}

interface SlideData {
  title: string;
  description: string;
  image: string;
  link?: string;
  isExternal?: boolean;
}

const col1Slides: SlideData[] = [
  {
    title: "Desenrola Brasil",
    description: "Programa do Governo Federal que facilita a renegociação de dívidas para milhões de brasileiros com condições especiais.",
    image: storyDesenrola,
    link: "https://desenrola.gov.br/novahome",
    isExternal: true,
  },
  {
    title: "Amortização",
    description: "Entenda como funciona a amortização e os principais tipos: SAC, Price e mais. Reduza o custo total das suas dívidas.",
    image: storyAmortizacao,
    link: "https://www.serasa.com.br/limpa-nome-online/blog/amortizacao-entenda-como-funciona-e-os-principais-tipos/",
    isExternal: true,
  },
];

const col3Slides: SlideData[] = [
  {
    title: "Serasa Limpa Nome",
    description: "Negocie suas dívidas com descontos exclusivos através do programa Serasa Limpa Nome. Milhões de ofertas disponíveis.",
    image: storySerasaLimpaNome,
    link: "https://www.serasa.com.br/limpa-nome-online/",
    isExternal: true,
  },
  {
    title: "Feirão da Serasa",
    description: "Aproveite o Feirão Serasa Limpa Nome com descontos de até 99% para quitar suas dívidas. Evento por tempo limitado!",
    image: storyFeirao,
    link: "https://www.serasa.com.br/limpa-nome-online/feirao/",
    isExternal: true,
  },
];

/* ─── Magnetic Button ─── */
const MagneticArrow = ({
  direction,
  onClick,
  disabled,
}: {
  direction: "left" | "right";
  onClick: () => void;
  disabled?: boolean;
}) => {
  const btnRef = useRef<HTMLButtonElement>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!btnRef.current || disabled) return;
    const rect = btnRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) * 0.25;
    const dy = (e.clientY - cy) * 0.25;
    const maxD = 8;
    setOffset({
      x: Math.max(-maxD, Math.min(maxD, dx)),
      y: Math.max(-maxD, Math.min(maxD, dy)),
    });
  }, [disabled]);

  const handleMouseLeave = () => setOffset({ x: 0, y: 0 });

  return (
    <button
      ref={btnRef}
      onClick={onClick}
      disabled={disabled}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white transition-all duration-150 active:scale-95 disabled:opacity-30 disabled:pointer-events-none hover:bg-white/30"
      style={{
        transform: `translate(${offset.x}px, ${offset.y}px)`,
        transition: "transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)",
      }}
    >
      {direction === "left" ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
    </button>
  );
};

/* ─── Story Card ─── */
const StoryCard = ({
  slides,
  revealDelay = 0,
}: {
  slides: SlideData[];
  revealDelay?: number;
}) => {
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setVisible(true), revealDelay);
          obs.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [revealDelay]);

  const current = slides[step];

  const handleClick = () => {
    if (!current.link) return;
    if (current.isExternal) {
      window.open(current.link, "_blank", "noopener");
    } else {
      navigate(current.link);
    }
  };

  return (
    <div
      ref={cardRef}
      className="relative rounded-2xl overflow-hidden cursor-pointer group w-full"
      style={{
        aspectRatio: "9/16",
        maxHeight: 520,
        opacity: visible ? 1 : 0,
        transform: visible ? "translateX(0)" : "translateX(40px)",
        transition: `all 0.7s cubic-bezier(0.34, 1.56, 0.64, 1)`,
      }}
    >
      <div className="absolute top-3 left-3 right-3 z-20 flex gap-1">
        {slides.map((_, i) => (
          <div key={i} className="flex-1 h-1 rounded-full bg-white/30 overflow-hidden">
            <div
              className="h-full rounded-full bg-white transition-all duration-300"
              style={{ width: i <= step ? "100%" : "0%" }}
            />
          </div>
        ))}
      </div>

      <div className="absolute inset-0 overflow-hidden">
        <div
          className="flex h-full"
          style={{
            width: `${slides.length * 100}%`,
            transform: `translateX(-${(step * 100) / slides.length}%)`,
            transition: "transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
        >
          {slides.map((slide, i) => (
            <div
              key={i}
              className="relative h-full"
              style={{ width: `${100 / slides.length}%` }}
              onClick={handleClick}
            >
              <img
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              <div className="absolute bottom-16 left-4 right-4 text-white z-10">
                <h3
                  className="font-bold mb-2 leading-tight"
                  style={{ fontSize: "clamp(1.1rem, 2vw, 1.5rem)" }}
                >
                  {slide.title}
                </h3>
                <p className="text-sm text-white/80 line-clamp-3">{slide.description}</p>
                <span className="inline-block mt-3 text-xs font-semibold text-white/90 border border-white/40 rounded-full px-3 py-1 group-hover:bg-white/20 transition-colors">
                  {slide.isExternal ? "Acessar →" : "Saiba mais →"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {slides.length > 1 && (
        <div className="absolute bottom-4 left-4 right-4 z-20 flex justify-between">
          <MagneticArrow direction="left" onClick={() => setStep((s) => s - 1)} disabled={step === 0} />
          <MagneticArrow direction="right" onClick={() => setStep((s) => s + 1)} disabled={step === slides.length - 1} />
        </div>
      )}
    </div>
  );
};

/* ─── Main Section ─── */
const AssistentSection = ({
  financialData,
  isDashboard = false,
}: {
  financialData: FinancialData | null | undefined;
  isDashboard?: boolean;
}) => {
  const [isChatbotFloating, setIsChatbotFloating] = useState(false);
  const [minimized, setMinimized] = useState(false);
  
  // Posicionamento inicial seguro
  const [pos, setPos] = useState({ x: 0, y: 0 });
  useEffect(() => {
    setPos({ 
      x: Math.max(20, window.innerWidth - 390), 
      y: Math.max(20, window.innerHeight - 570) 
    });
  }, []);

  const dragging = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const sectionRef = useRef<HTMLDivElement>(null);
  const [sectionVisible, setSectionVisible] = useState(false);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!isChatbotFloating || minimized) return;
    dragging.current = true;
    dragOffset.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
    e.preventDefault();
  }, [isChatbotFloating, minimized, pos]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!dragging.current) return;
      setPos({
        x: Math.max(0, Math.min(window.innerWidth - 370, e.clientX - dragOffset.current.x)),
        y: Math.max(0, Math.min(window.innerHeight - 100, e.clientY - dragOffset.current.y)),
      });
    };
    const handleMouseUp = () => { dragging.current = false; };
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setSectionVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <>
      <style>{`
        .custom-chat-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-chat-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-chat-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(156, 163, 175, 0.4);
          border-radius: 10px;
        }
        .custom-chat-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: rgba(107, 114, 128, 0.6);
        }
        .dark .custom-chat-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(75, 85, 99, 0.4);
        }
        .dark .custom-chat-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: rgba(107, 114, 128, 0.6);
        }
      `}</style>

      {/* Overflow foi removido da Section para garantir que Fixed Elements não sejam cortados */}
      <section
        id="chatbot"
        ref={sectionRef}
        className={`w-full ${isDashboard ? 'py-8 bg-slate-50 dark:bg-transparent dark:bg-gradient-to-r dark:from-[#070b13] dark:to-[#0a101f]' : 'py-16'} assistant-section-bg relative`}
        style={{
          opacity: sectionVisible ? 1 : 0,
          // Retornar para "none" em vez de "scale(1)" remove o bloco de contenção e conserta o pulo
          transform: sectionVisible ? "none" : "scale(0.95)",
          transition: "all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}
      >
        <div className="absolute inset-0 backdrop-blur-[2px] bg-white/40 dark:bg-black/20 overflow-hidden" />
        
        <div className="max-w-[1366px] mx-auto px-[3%] relative z-10 w-full">
          <div className="text-center mb-10 flex flex-col items-center">
            <div className="inline-flex items-center gap-2 mb-3 bg-[#1D4F91]/10 border border-[#426DA9]/30 px-4 py-1.5 rounded-full text-[#426DA9] dark:text-[#8CB4F5] text-sm font-semibold backdrop-blur-sm">
              <BotMessageSquare className="w-4 h-4" />
              DVChat
            </div>
            <h2
              className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#1D4F91] via-[#77127B] to-[#C1188B] dark:from-[#8CB4F5] dark:via-[#E88CEE] dark:to-[#FF85BB] mb-3 transition-all duration-300 drop-shadow-sm"
              style={{ fontSize: "clamp(1.5rem, 3vw, 2.5rem)" }}
            >
              Conheça nosso assistente!
            </h2>
            <p className="text-slate-600 dark:text-slate-300 max-w-2xl mx-auto text-lg transition-all duration-300">
              Você pode transformá-lo em um Widget que vai te acompanhar por toda a página.
            </p>
          </div>

          {/* Wrapper flex agora não possui overflow-hidden */}
          <div className="flex flex-col md:flex-row gap-6 items-center md:items-stretch w-full">
            
            {/* 1ª Div — Limpa Nome & Desenrola */}
            <div className={`w-full transition-all duration-700 [transition-timing-function:cubic-bezier(0.34,1.56,0.64,1)] flex justify-center ${isChatbotFloating ? 'md:w-[50%]' : 'md:w-[25%]'}`}>
              <StoryCard slides={col1Slides} revealDelay={0} />
            </div>

            {/* 2ª Div — Container Inteligente do Chatbot (Gera o Morphing) */}
            <div className={`transition-all duration-700 [transition-timing-function:cubic-bezier(0.34,1.56,0.64,1)] flex justify-center items-center ${isChatbotFloating ? 'w-0 md:w-0' : 'w-full md:w-[50%]'}`}>
              
              <div
                onMouseDown={isChatbotFloating ? handleMouseDown : undefined}
                className={`
                  ${isChatbotFloating ? "fixed z-50 shadow-2xl" : "relative z-10 shadow-xl"}
                  overflow-hidden flex flex-col bg-white/90 dark:bg-[#0a0f1d]/80 backdrop-blur-xl
                  border border-slate-200 dark:border-blue-500/20
                `}
                style={{
                  position: isChatbotFloating ? 'fixed' : 'relative',
                  width: minimized ? 64 : (isChatbotFloating ? 370 : '100%'),
                  height: minimized ? 64 : (isChatbotFloating ? 550 : 520),
                  // Usando calc seguras com interpolação de string exata
                  left: isChatbotFloating ? (minimized ? 'calc(100vw - 100px)' : `${pos.x}px`) : 'auto',
                  top: isChatbotFloating ? (minimized ? 'calc(100vh - 100px)' : `${pos.y}px`) : 'auto',
                  borderRadius: minimized ? '50%' : '20px',
                  transition: dragging.current ? "none" : "all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)",
                }}
              >
                {/* Conteúdo Real do Chatbot */}
                <div
                  className="flex flex-col w-full h-full transition-opacity duration-300"
                  style={{ 
                    opacity: minimized ? 0 : 1, 
                    pointerEvents: minimized ? 'none' : 'auto' 
                  }}
                >
                  {/* Cabeçalho Unificado */}
                  <div
                     className={`flex items-center justify-between transition-all duration-500 ${
                       isChatbotFloating
                         ? "px-4 py-3 cursor-grab active:cursor-grabbing border-b border-slate-200 dark:border-slate-800"
                         : "absolute top-4 right-4 z-20 w-full px-4 py-0 justify-end pointer-events-none"
                     }`}
                     style={{
                       background: isChatbotFloating ? "linear-gradient(90deg, #1D4F91, #426DA9)" : "transparent"
                     }}
                  >
                     <div className={`flex items-center gap-2 text-white transition-opacity duration-500 ${isChatbotFloating ? "opacity-100" : "opacity-0"}`}>
                       <BotMessageSquare className="w-4 h-4 text-blue-200" />
                       <span className="font-semibold text-sm tracking-wide">DebtView AI</span>
                     </div>

                     <div className="flex gap-1.5 pointer-events-auto">
                       <button
                         onClick={() => setIsChatbotFloating(!isChatbotFloating)}
                         className={`flex items-center justify-center transition-all duration-300 ${
                           isChatbotFloating
                             ? "w-6 h-6 rounded text-white/70 hover:text-white hover:bg-white/10"
                             : "w-9 h-9 rounded-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-md text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 hover:scale-105 border border-slate-200 dark:border-slate-600/50 shadow-lg active:scale-95"
                         }`}
                         title={isChatbotFloating ? "Reencaixar na página" : "Destacar assistente"}
                         onMouseDown={(e) => e.stopPropagation()}
                       >
                         {isChatbotFloating ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-4 h-4" />}
                       </button>

                       {isChatbotFloating && (
                         <button
                           onClick={() => setMinimized(true)}
                           className="w-6 h-6 rounded flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 hover:bg-destructive/80 transition-colors"
                           title="Minimizar"
                           onMouseDown={(e) => e.stopPropagation()}
                         >
                           <X className="w-3.5 h-3.5" />
                         </button>
                       )}
                     </div>
                  </div>

                  {/* Scroll do Chat */}
                  <div className="flex-1 flex flex-col w-full h-full overflow-y-auto custom-chat-scrollbar">
                    <Chatbot financialData={financialData} compact />
                  </div>
                </div>

                {/* Visual Modo Minimizado - Posicionado por último para garantir z-index absoluto sobre o chat */}
                <div
                  className="absolute inset-0 flex items-center justify-center cursor-pointer z-50 transition-all duration-500"
                  style={{
                    background: "linear-gradient(135deg, #2563eb, #7c3aed, #db2777)",
                    opacity: minimized ? 1 : 0,
                    pointerEvents: minimized ? 'auto' : 'none',
                    transform: minimized ? 'scale(1)' : 'scale(0.8)'
                  }}
                  onClick={() => setMinimized(false)}
                  title="Abrir DebtView AI"
                >
                  <BotMessageSquare className="w-7 h-7 text-white" />
                </div>
              </div>
            </div>

            {/* 3ª Div — Amortização & Feirão */}
            <div className={`w-full transition-all duration-700 [transition-timing-function:cubic-bezier(0.34,1.56,0.64,1)] flex justify-center ${isChatbotFloating ? 'md:w-[50%]' : 'md:w-[25%]'}`}>
              <StoryCard slides={col3Slides} revealDelay={200} />
            </div>

          </div>
        </div>
      </section>
    </>
  );
};

export default AssistentSection;