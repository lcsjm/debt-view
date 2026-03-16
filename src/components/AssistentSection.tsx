import { useState, useRef, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, MessageCircle, Maximize2, Component } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Chatbot from "./ui/ChatBot";

import storyRenegociacao from "@/assets/story-renegociacao.jpg";
import storySerasaLimpaNome from "@/assets/story-serasa-limpa-nome.jpg";
import storyDesenrola from "@/assets/story-desenrola.jpg";
import storyAmortizacao from "@/assets/story-amortizacao.jpg";
import storyFeirao from "@/assets/story-feirao.jpg";

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
      className="relative rounded-2xl overflow-hidden cursor-pointer group"
      style={{
        aspectRatio: "9/16",
        maxHeight: 520,
        opacity: visible ? 1 : 0,
        transform: visible ? "translateX(0)" : "translateX(40px)",
        transition: `all 0.7s cubic-bezier(0.34, 1.56, 0.64, 1)`,
      }}
    >
      {/* Progress bar */}
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

      {/* Slide content with transition */}
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

      {/* Navigation arrows */}
      <div className="absolute bottom-4 left-4 right-4 z-20 flex justify-between">
        <MagneticArrow direction="left" onClick={() => setStep((s) => s - 1)} disabled={step === 0} />
        <MagneticArrow direction="right" onClick={() => setStep((s) => s + 1)} disabled={step === slides.length - 1} />
      </div>
    </div>
  );
};

/* ─── Main Section ─── */
const AssistentSection = ({
  financialData,
  isChatbotFloating,
  onFloatChatbot,
}: {
  financialData: FinancialData | null;
  isChatbotFloating: boolean;
  onFloatChatbot: (floating: boolean) => void;
}) => {
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
      {/* Frosted glass overlay */}
      <div className="absolute inset-0 backdrop-blur-[2px] bg-black/20" />
      
      <div className="max-w-[1366px] mx-auto px-[3%] relative z-10">
        <div className="text-center mb-10">
          <h2
            className="font-bold text-white mb-2"
            style={{ fontSize: "clamp(1.5rem, 3vw, 2.5rem)" }}
          >
            Assistente Financeiro
          </h2>
          <p className="text-white/60">Renegocie dívidas, tire dúvidas e aprenda sobre amortização</p>
        </div>

        <div
          className={`grid gap-6 items-center justify-items-center ${
            isChatbotFloating
              ? "grid-cols-1 md:grid-cols-2"
              : "grid-cols-1 md:grid-cols-3"
          }`}
        >
          {/* Column 1 — Renegociação */}
          <div className="w-full max-w-[400px]">
            <StoryCard slides={col1Slides} revealDelay={0} />
          </div>

          {/* Column 2 — Chatbot (if not floating) */}
          {!isChatbotFloating && (
            <div className="w-full max-w-[400px]">
              <div
                className="relative rounded-2xl overflow-hidden flex flex-col"
                style={{ aspectRatio: "9/16", maxHeight: 520 }}
              >
                <div className="absolute top-3 right-3 z-20">
                  <button
                    onClick={() => onFloatChatbot(true)}
                    className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-colors active:scale-95"
                    title="Destacar chatbot"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex-1 flex flex-col">
                  <Chatbot financialData={financialData} compact />
                </div>
              </div>
            </div>
          )}

          {/* Column 3 — Amortização */}
          <div className="w-full max-w-[400px]">
            <StoryCard slides={col3Slides} revealDelay={200} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default AssistentSection;
;
