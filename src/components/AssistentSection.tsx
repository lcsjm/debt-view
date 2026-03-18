import { useState, useRef, useEffect, useCallback } from "react";
import { 
  ChevronLeft, 
  ChevronRight, 
  MessageCircle, 
  Maximize2, 
  Minimize2, 
  X, 
  GripHorizontal 
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Chatbot from "./ui/ChatBot";

const storyRenegociacao = "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&q=80";
const storySerasaLimpaNome = "https://images.unsplash.com/photo-1620714223084-8fcacc6dfd8d?w=400&q=80";
const storyDesenrola = "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=400&q=80";
const storyAmortizacao = "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&q=80";
const storyFeirao = "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=400&q=80";

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
    title: "Renegociação de Dívida",
    description: "Aprenda conceitos e estratégias para renegociar suas dívidas de forma inteligente e recuperar sua saúde financeira.",
    image: storyRenegociacao,
    link: "/renegociacao",
  },
  {
    title: "Serasa Limpa Nome",
    description: "Negocie suas dívidas com descontos exclusivos através do programa Serasa Limpa Nome. Milhões de ofertas disponíveis.",
    image: storySerasaLimpaNome,
    link: "https://www.serasa.com.br/limpa-nome-online/",
    isExternal: true,
  },
  {
    title: "Desenrola Brasil",
    description: "Programa do Governo Federal que facilita a renegociação de dívidas para milhões de brasileiros com condições especiais.",
    image: storyDesenrola,
    link: "https://desenrola.gov.br/novahome",
    isExternal: true,
  },
];

const col3Slides: SlideData[] = [
  {
    title: "Amortização",
    description: "Entenda como funciona a amortização e os principais tipos: SAC, Price e mais. Reduza o custo total das suas dívidas.",
    image: storyAmortizacao,
    link: "https://www.serasa.com.br/limpa-nome-online/blog/amortizacao-entenda-como-funciona-e-os-principais-tipos/",
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

      <div className="absolute bottom-4 left-4 right-4 z-20 flex justify-between">
        <MagneticArrow direction="left" onClick={() => setStep((s) => s - 1)} disabled={step === 0} />
        <MagneticArrow direction="right" onClick={() => setStep((s) => s + 1)} disabled={step === slides.length - 1} />
      </div>
    </div>
  );
};

/* ─── Chatbot Widget (Draggable) ─── */
const ChatbotWidget = ({
  financialData,
  onDock,
}: {
  financialData: FinancialData | null;
  onDock: () => void;
}) => {
  const [minimized, setMinimized] = useState(false);
  const [pos, setPos] = useState({ x: window.innerWidth - 420, y: window.innerHeight - 620 });
  const dragging = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    dragging.current = true;
    dragOffset.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
    e.preventDefault();
  }, [pos]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!dragging.current) return;
      setPos({
        x: Math.max(0, Math.min(window.innerWidth - 380, e.clientX - dragOffset.current.x)),
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

  if (minimized) {
    return (
      <button
        onClick={() => setMinimized(false)}
        className="fixed z-50 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center text-white active:scale-95 transition-transform"
        style={{
          bottom: 24,
          right: 24,
          background: "linear-gradient(135deg, #1D4F91, #C1188B)",
        }}
      >
        <MessageCircle className="w-6 h-6" />
      </button>
    );
  }

  return (
    <div
      className="fixed z-50 rounded-2xl overflow-hidden shadow-2xl border border-white/10 flex flex-col bg-slate-900"
      style={{
        left: pos.x,
        top: pos.y,
        width: 370,
        height: 550,
        animation: "scale-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
      }}
    >
      <div
        onMouseDown={handleMouseDown}
        className="flex items-center justify-between px-3 py-2 cursor-grab active:cursor-grabbing"
        style={{ background: "linear-gradient(135deg, #1D4F91, #77127B)" }}
      >
        <div className="flex items-center gap-2 text-white text-xs">
          <GripHorizontal className="w-4 h-4 opacity-60" />
          <span className="font-medium">Assistente Financeiro</span>
        </div>
        <div className="flex gap-1">
          <button
            onClick={onDock}
            className="w-6 h-6 rounded flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            title="Reencaixar"
          >
            <Minimize2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setMinimized(true)}
            className="w-6 h-6 rounded flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            title="Minimizar"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col bg-transparent">
        <Chatbot financialData={financialData} compact />
      </div>
    </div>
  );
};

/* ─── Main Section ─── */
const AssistentSection = ({
  financialData,
}: {
  financialData: FinancialData | null;
}) => {
  // Estado que controla se o chatbot está fixo na seção ou flutuando trazido para dentro!
  const [isChatbotFloating, setIsChatbotFloating] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const [sectionVisible, setSectionVisible] = useState(false);

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
      <section
        id="chatbot"
        ref={sectionRef}
        className="w-full py-16 assistant-section-bg relative overflow-hidden"
        style={{
          opacity: sectionVisible ? 1 : 0,
          transform: sectionVisible ? "scale(1)" : "scale(0.95)",
          transition: "all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}
      >
        <div className="absolute inset-0 backdrop-blur-[2px] bg-black/20" />
        
        <div className="max-w-[1366px] mx-auto px-[3%] relative z-10 w-full">
          <div className="text-center mb-10">
            <h2
              className="font-bold text-white mb-2 transition-all duration-300"
              style={{ fontSize: "clamp(1.5rem, 3vw, 2.5rem)" }}
            >
              Assistente Financeiro
            </h2>
            <p className="text-white/60 transition-all duration-300">
              Renegocie dívidas, tire dúvidas e aprenda sobre amortização
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-6 items-center md:items-stretch w-full overflow-hidden">
            
            {/* 1ª Div — Renegociação */}
            <div 
              className={`w-full transition-all duration-500 ease-in-out flex justify-center ${
                isChatbotFloating ? 'md:w-[50%]' : 'md:w-[25%]'
              }`}
            >
              <StoryCard slides={col1Slides} revealDelay={0} />
            </div>

            {/* 2ª Div — Chatbot Fixo */}
            {!isChatbotFloating && (
              <div 
                className="w-full md:w-[50%] flex justify-center transition-all duration-500 ease-in-out"
              >
                <div
                  className="relative rounded-2xl overflow-hidden flex flex-col w-full bg-white/5 backdrop-blur-md"
                  style={{ minHeight: 520 }} 
                >
                  <div className="absolute top-3 right-3 z-20">
                    <button
                      onClick={() => setIsChatbotFloating(true)}
                      className="w-8 h-8 rounded-full bg-black/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/40 transition-colors active:scale-95"
                      title="Destacar chatbot"
                    >
                      <Maximize2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex-1 flex flex-col w-full h-full">
                    <Chatbot financialData={financialData} compact />
                  </div>
                </div>
              </div>
            )}

            {/* 3ª Div — Amortização */}
            <div 
              className={`w-full transition-all duration-500 ease-in-out flex justify-center ${
                isChatbotFloating ? 'md:w-[50%]' : 'md:w-[25%]'
              }`}
            >
              <StoryCard slides={col3Slides} revealDelay={200} />
            </div>

          </div>
        </div>
      </section>

      {/* Renderiza o Widget flutuante caso o estado isChatbotFloating seja true */}
      {isChatbotFloating && (
        <ChatbotWidget 
          financialData={financialData} 
          onDock={() => setIsChatbotFloating(false)} 
        />
      )}
    </>
  );
};

export default AssistentSection;