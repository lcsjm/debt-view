import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  GraduationCap, Droplets, PiggyBank, Building2, TrendingUp,
  Rocket, TrendingDown, Percent, Receipt, Handshake,
  Calculator, Home, X
} from "lucide-react";
import ScrollReveal from "./ScrollReveal";
import supabase from "../../utils/supabase";
import MaslowSection from "./MaslowSection"; // <-- Componente importado aqui!

// 1. Mapeamento de Ícones (Necessário pois o banco só retorna texto)
const iconMap: Record<string, JSX.Element> = {
  "Educação": <GraduationCap size={28} />,
  "Liquidez diária": <Droplets size={28} />,
  "Poupança": <PiggyBank size={28} />,
  "Patrimônio": <Building2 size={28} />,
  "Ações": <TrendingUp size={28} />,
  "Empreendimento": <Rocket size={28} />,
  "Inflação": <TrendingDown size={28} />,
  "CDB e CDI": <Percent size={28} />,
  "Taxas e juros": <Receipt size={28} />,
  "Empréstimos": <Handshake size={28} />,
  "Amortização": <Calculator size={28} />,
  "Financiamento": <Home size={28} />,
};

type CardType = {
  title: string;
  desc: string;
  fullDesc: string;
  categoria?: string;
  icon?: JSX.Element;
};

const ScrollingRow = ({
  cards,
  direction,
  onCardClick,
  viewedCards
}: {
  cards: CardType[];
  direction: "left" | "right";
  onCardClick: (card: CardType) => void;
  viewedCards: Set<string>;
}) => {
  const [paused, setPaused] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [hasDragged, setHasDragged] = useState(false);
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
    if (paused || isDragging || cards.length === 0) return;
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
  }, [paused, isDragging, direction, cards]);

  useEffect(() => {
    if (sliderRef.current && setRef.current) {
      const startPos = getSetWidth();
      sliderRef.current.scrollLeft = startPos;
      exactScrollLeft.current = startPos;
    }
  }, [cards]);

  return (
    <div
      ref={sliderRef}
      className={`overflow-hidden py-8 -my-8 hide-scrollbar ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => { setPaused(false); setIsDragging(false); }}
      onMouseDown={(e) => {
        setIsDragging(true);
        setHasDragged(false);
        if (sliderRef.current) {
          const x = e.pageX - sliderRef.current.offsetLeft;
          setStartX(x);
          setLastX(x);
        }
      }}
      onMouseUp={() => setIsDragging(false)}
      onMouseMove={(e) => {
        if (!isDragging || !sliderRef.current) return;
        e.preventDefault();
        const x = e.pageX - sliderRef.current.offsetLeft;
        if (Math.abs(x - startX) > 5) setHasDragged(true);
        const walk = (x - lastX);
        exactScrollLeft.current -= walk;
        sliderRef.current.scrollLeft = exactScrollLeft.current;
        setLastX(x);
        handleBoundary();
      }}
      style={{ scrollBehavior: 'auto' }}
    >
      <div className="flex gap-6 w-max">
        {[0, 1, 2].map((setIndex) => (
          <div key={setIndex} ref={setIndex === 0 ? setRef : null} className="flex gap-6">
            {cards.map((card, i) => {
              const isViewed = viewedCards.has(card.title);
              return (
                <motion.div
                  key={`${card.title}-${i}-${setIndex}`}
                  whileHover={{ scale: 1.03, y: -4 }}
                  onClick={() => { if (!hasDragged) onCardClick(card); }}
                  className={`bg-white/10 dark:bg-slate-900/20 backdrop-blur-2xl shadow-lg p-6 min-w-[300px] max-w-[300px] flex-shrink-0 flex flex-col group transition-all duration-300 rounded-2xl ring-1 ring-inset ring-white/20 dark:ring-white/5 ${isViewed ? "border border-emerald-500/80" : "border border-white/20 dark:border-white/10"
                    }`}
                >
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-4 group-hover:bg-raspberry/10 group-hover:text-[#C1188B] transition-colors duration-300">
                    {iconMap[card.title] || <Building2 size={28} />}
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

const EducationSection = () => {
  const [selectedCard, setSelectedCard] = useState<CardType | null>(null);
  const [viewedCards, setViewedCards] = useState<Set<string>>(new Set());

  // Estados para armazenar dados do banco
  const [investmentCards, setInvestmentCards] = useState<CardType[]>([]);
  const [conceptCards, setConceptCards] = useState<CardType[]>([]);
  const [loading, setLoading] = useState(true);

  // 2. Busca de dados no Supabase
  useEffect(() => {
    const fetchCards = async () => {
      try {
        console.log("Iniciando busca no Supabase...");

        const { data, error } = await supabase
          .from('cards')
          .select('*'); 

        if (error) {
          console.error("Erro na consulta Supabase:", error.message);
          return;
        }

        if (data && data.length > 0) {
          const formattedCards = data.map(item => ({
            title: item.titulo || "Sem título",
            desc: item.descricao_curta || "Sem descrição",
            fullDesc: item.descricao_longa || "Sem conteúdo longo",
            categoria: item.categoria ? String(item.categoria).toLowerCase() : ""
          }));

          setInvestmentCards(formattedCards.slice(0, 6));
          setConceptCards(formattedCards.slice(6, 12));

        } else {
          console.warn("A tabela está vazia.");
        }
      } catch (err) {
        console.error("Erro inesperado:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCards();
  }, []);

  const handleCloseModal = () => {
    if (selectedCard) {
      setViewedCards((prev) => new Set(prev).add(selectedCard.title));
    }
    setSelectedCard(null);
  };

  return (
    <>
      <style>{`
        @keyframes blob-float-1 { 0%, 100% { transform: translate(0, 0) scale(1); } 33% { transform: translate(8%, 12%) scale(1.05); } 66% { transform: translate(-5%, 8%) scale(0.95); } }
        @keyframes blob-float-2 { 0%, 100% { transform: translate(0, 0) scale(1); } 33% { transform: translate(-10%, 15%) scale(1.1); } 66% { transform: translate(8%, -10%) scale(0.9); } }
        @keyframes blob-float-3 { 0%, 100% { transform: translate(0, 0) scale(1); } 33% { transform: translate(15%, -10%) scale(0.95); } 66% { transform: translate(-10%, -15%) scale(1.05); } }
        .dynamic-blob { position: absolute; border-radius: 50%; filter: blur(120px); animation-duration: 25s; animation-iteration-count: infinite; animation-timing-function: ease-in-out; }
        .blob-dark-blue { background-color: #1D4F91; width: 50vw; height: 50vw; top: -20%; left: -10%; animation-name: blob-float-1; }
        .blob-purple { background-color: #77127B; width: 45vw; height: 45vw; top: 10%; left: 30%; animation-name: blob-float-2; animation-delay: -5s; }
        .blob-magenta { background-color: #E80070; width: 40vw; height: 40vw; bottom: -10%; right: 10%; animation-name: blob-float-3; animation-delay: -2s; }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* SEÇÃO PRINCIPAL DE EDUCAÇÃO */}
      <section id="education" className="relative w-full min-h-screen py-24 bg-slate-50 dark:bg-slate-950 overflow-hidden border-t border-slate-200 dark:border-white/10">
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 opacity-50 dark:opacity-60">
          <div className="dynamic-blob blob-dark-blue"></div>
          <div className="dynamic-blob blob-purple"></div>
          <div className="dynamic-blob blob-magenta"></div>
        </div>

        <div className="relative z-10 w-full">
          <div className="container mx-auto px-4">
            <ScrollReveal>
              <h2 className="text-4xl md:text-5xl font-heading font-bold text-center text-slate-900 dark:text-white mb-16">
                Educação Financeira
              </h2>
            </ScrollReveal>
          </div>

          {loading ? (
            <div className="text-center text-slate-500 py-20 font-medium">Carregando conteúdos...</div>
          ) : (
            <>
              <ScrollReveal delay={0.1}>
                <div className="mb-16 w-full">
                  <h3 className="text-2xl font-heading font-bold text-center text-slate-800 dark:text-slate-200 mb-8">Investimentos</h3>
                  <ScrollingRow cards={investmentCards} direction="left" onCardClick={setSelectedCard} viewedCards={viewedCards} />
                </div>
              </ScrollReveal>

              <ScrollReveal delay={0.2}>
                <div className="w-full">
                  <h3 className="text-2xl font-heading font-bold text-center text-slate-800 dark:text-slate-200 mb-8">Conceitos</h3>
                  <ScrollingRow cards={conceptCards} direction="right" onCardClick={setSelectedCard} viewedCards={viewedCards} />
                </div>
              </ScrollReveal>
            </>
          )}
        </div>
      </section>

      {/* COMPONENTE DA PIRÂMIDE DE MASLOW IMPORTADO AQUI */}
      <MaslowSection />

      {/* MODAL DOS CARDS DE EDUCAÇÃO */}
      <AnimatePresence>
        {selectedCard && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
            onClick={handleCloseModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white/70 dark:bg-slate-900/60 backdrop-blur-2xl border border-white/20 shadow-2xl rounded-3xl p-8 max-w-lg w-full relative ring-1 ring-inset ring-white/40 dark:ring-white/5"
              onClick={(e) => e.stopPropagation()}
            >
              <button onClick={handleCloseModal} className="absolute top-4 right-4 p-2 rounded-full text-slate-500 hover:text-[#E80070] transition-colors duration-300">
                <X size={24} strokeWidth={2.5} />
              </button>

              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#1D4F91] to-[#426DA9] shadow-md flex items-center justify-center text-white mb-6">
                {iconMap[selectedCard.title]}
              </div>
              <h3 className="text-2xl font-heading font-black text-slate-900 dark:text-white mb-2">{selectedCard.title}</h3>
              <p className="text-[#C1188B] dark:text-[#E80070] font-bold mb-4 uppercase tracking-wide text-sm">{selectedCard.desc}</p>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-medium">{selectedCard.fullDesc}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default EducationSection;