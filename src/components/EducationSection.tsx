import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GraduationCap, Droplets, PiggyBank, Building2, TrendingUp, Rocket, TrendingDown, Percent, Receipt, Handshake, Calculator, Home, X } from "lucide-react";
import ScrollReveal from "./ScrollReveal";

type CardType = {
  title: string;
  icon: JSX.Element;
  desc: string;
  fullDesc: string;
};

const investmentCards: CardType[] = [
  { 
    title: "Educação", 
    icon: <GraduationCap size={28} />, 
    desc: "Investir em conhecimento é o maior retorno que você pode ter.",
    fullDesc: "A educação financeira é a base de tudo. Antes de investir seu dinheiro em qualquer ativo, invista tempo para entender como o mercado funciona. Livros, cursos e mentorias são os investimentos que garantem que você tomará as melhores decisões com o seu patrimônio ao longo de toda a sua vida. Entender seu perfil de investidor e seus objetivos (curto, médio ou longo prazo) evitará que você caia em armadilhas e promessas de dinheiro fácil."
  },
  { 
    title: "Liquidez diária", 
    icon: <Droplets size={28} />, 
    desc: "Investimentos com resgate imediato para sua reserva de emergência.",
    fullDesc: "Ter liquidez diária significa que você pode transformar seu investimento em dinheiro na conta a qualquer momento, sem perdas ou carências. É o lugar ideal e obrigatório para deixar a sua reserva de emergência (o equivalente a no mínimo 6 meses do seu custo de vida mensal). Exemplos clássicos e seguros incluem o Tesouro Selic e CDBs de liquidez diária que rendem 100% do CDI em bancos sólidos."
  },
  { 
    title: "Poupança", 
    icon: <PiggyBank size={28} />, 
    desc: "O primeiro passo para guardar dinheiro, simples e acessível.",
    fullDesc: "Embora seja o investimento mais tradicional do brasileiro pela sua facilidade e isenção de imposto de renda, a poupança costuma perder para a inflação no longo prazo. Seu rendimento atual é de 70% da Selic + TR (quando a Selic está abaixo de 8,5%) ou 0,5% ao mês + TR. Ela serve como um excelente primeiro passo para criar o hábito de poupar, mas o ideal é buscar alternativas de Renda Fixa mais rentáveis assim que possível."
  },
  { 
    title: "Patrimônio", 
    icon: <Building2 size={28} />, 
    desc: "Construa riqueza com imóveis e ativos de longo prazo.",
    fullDesc: "A construção de patrimônio envolve adquirir ativos que se valorizam ou geram renda passiva recorrente ao longo do tempo. Isso inclui a compra de imóveis físicos, terras e, muito popularmente hoje, os Fundos de Investimento Imobiliário (FIIs). Os FIIs permitem que você invista em grandes shoppings, galpões logísticos e lajes corporativas com pouco dinheiro, recebendo aluguéis mensais isentos de Imposto de Renda."
  },
  { 
    title: "Ações", 
    icon: <TrendingUp size={28} />, 
    desc: "Participe do crescimento de grandes empresas na bolsa.",
    fullDesc: "Comprar ações significa comprar pequenos 'pedaços' de empresas de capital aberto. Quando você investe em boas empresas, você se torna sócio delas, lucrando de duas formas principais: com a valorização do preço da ação no mercado e com o pagamento regular de dividendos (parte dos lucros que a empresa decide distribuir aos seus acionistas). É um investimento de Renda Variável, indicado para o longo prazo devido à oscilação do mercado."
  },
  { 
    title: "Empreendimento", 
    icon: <Rocket size={28} />, 
    desc: "Crie seu próprio negócio e gere renda ativa.",
    fullDesc: "Enquanto investimentos tradicionais no mercado financeiro geram renda passiva de forma gradual, empreender é a forma mais rápida de alavancar e multiplicar sua renda ativa. Criar soluções, vender produtos ou serviços e escalar um negócio envolve riscos significativamente maiores, além de muito trabalho e dedicação, mas oferece um potencial de ganhos financeiros teoricamente ilimitados em comparação a um salário fixo."
  },
];

const conceptCards: CardType[] = [
  { 
    title: "Inflação", 
    icon: <TrendingDown size={28} />, 
    desc: "Entenda como a inflação corrói seu poder de compra ao longo do tempo.",
    fullDesc: "A inflação é o aumento contínuo e generalizado dos preços de bens e serviços. Se o seu dinheiro está parado na conta corrente ou rendendo menos que a inflação (medida oficialmente pelo IPCA no Brasil), você está literalmente perdendo poder de compra. É por isso que R$ 100 hoje compram muito menos no supermercado do que compravam há 10 anos. Proteger seu dinheiro da inflação é a regra número um dos investimentos."
  },
  { 
    title: "CDB e CDI", 
    icon: <Percent size={28} />, 
    desc: "Conheça os principais indicadores de renda fixa do mercado.",
    fullDesc: "O CDB (Certificado de Depósito Bancário) é, na prática, um empréstimo que você faz ao banco. Em troca de usar o seu dinheiro, o banco te devolve o valor com juros no futuro. O CDI (Certificado de Depósito Interbancário) é a taxa que serve de base para o rendimento desses investimentos, caminhando sempre muito próxima à taxa básica de juros, a Selic. Um CDB que rende '100% do CDI' é o porto seguro e a referência básica de rentabilidade na Renda Fixa."
  },
  { 
    title: "Taxas e juros", 
    icon: <Receipt size={28} />, 
    desc: "Saiba como as taxas impactam seus investimentos e dívidas.",
    fullDesc: "A oitava maravilha do mundo, segundo Einstein: os juros compostos. Eles são uma faca de dois gumes. Quando você investe com disciplina, os juros compostos trabalham a seu favor, multiplicando seu dinheiro exponencialmente ao longo dos anos (juros sobre juros). No entanto, quando você entra em dívidas (como rotativo do cartão de crédito ou cheque especial), eles formam uma bola de neve destrutiva que pode arruinar sua saúde financeira em poucos meses."
  },
  { 
    title: "Empréstimos", 
    icon: <Handshake size={28} />, 
    desc: "Quando e como recorrer a empréstimos de forma inteligente.",
    fullDesc: "Tomar crédito nem sempre é um erro, desde que seja uma 'dívida inteligente'. Pegar um empréstimo com taxas de juros baixas para expandir um negócio lucrativo ou investir em uma especialização profissional que aumentará seu salário faz total sentido matemático. Por outro lado, pegar empréstimo para financiar festas, viagens ou bens de consumo que perdem valor rapidamente é uma das maiores armadilhas financeiras."
  },
  { 
    title: "Amortização", 
    icon: <Calculator size={28} />, 
    desc: "Reduza o valor das suas parcelas e economize nos juros.",
    fullDesc: "Amortizar significa pagar parcelas da sua dívida (como um financiamento imobiliário) de forma antecipada. Quando você faz um pagamento extra, esse valor é abatido diretamente do saldo devedor principal, o que significa que você não pagará os juros que incidiriam sobre aquele montante ao longo de anos (normalmente no sistema SAC). É a estratégia mais poderosa e inteligente para quitar dívidas de longo prazo rapidamente economizando milhares de reais."
  },
  { 
    title: "Financiamento", 
    icon: <Home size={28} />, 
    desc: "Tudo sobre financiamento imobiliário e veicular.",
    fullDesc: "O financiamento é a compra de um bem a prazo onde o próprio bem (carro, casa) serve como garantia para o banco em caso de inadimplência. Antes de assinar qualquer contrato, é absolutamente fundamental analisar o CET (Custo Efetivo Total). O CET mostra não apenas a taxa de juros nominal, mas inclui todas as taxas administrativas, tarifas e seguros obrigatórios embutidos, revelando o verdadeiro custo do seu financiamento."
  },
];

const ScrollingRow = ({ 
  cards, 
  direction, 
  onCardClick, 
  viewedCards 
}: { 
  cards: typeof investmentCards; 
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

  const duplicated = [...cards, ...cards, ...cards];

  useEffect(() => {
    if (sliderRef.current) {
      const singleSetWidth = sliderRef.current.scrollWidth / 3;
      sliderRef.current.scrollLeft = singleSetWidth;
    }
  }, []);

  const handleScroll = () => {
    if (!sliderRef.current) return;
    const slider = sliderRef.current;
    const singleSetWidth = slider.scrollWidth / 3;

    if (slider.scrollLeft <= 0) {
      slider.scrollLeft += singleSetWidth;
    } else if (slider.scrollLeft >= singleSetWidth * 2) {
      slider.scrollLeft -= singleSetWidth;
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setHasDragged(false);
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
    
    if (Math.abs(x - startX) > 5) {
      setHasDragged(true);
    }
    
    const walk = (x - lastX); 
    sliderRef.current.scrollLeft -= walk;
    setLastX(x);
  };

  return (
    <div
      ref={sliderRef}
      className={`overflow-hidden py-8 -my-8 ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseMove={handleMouseMove}
      onScroll={handleScroll}
    >
      <div
        className={`flex gap-6 ${direction === "left" ? "scroll-left" : "scroll-right"} ${paused ? "scroll-paused" : ""}`}
        style={{ 
          width: `${duplicated.length * 340}px`,
          animationDuration: "65s" /* AQUI: Adicionado para deixar o scroll levemente mais lento */
        }}
      >
        {duplicated.map((card, i) => {
          const isViewed = viewedCards.has(card.title);
          
          return (
            <motion.div
              key={`${card.title}-${i}`}
              whileHover={{ scale: 1.03, y: -4 }}
              transition={{ duration: 0.3 }}
              onClick={() => {
                if (!hasDragged) {
                  onCardClick(card);
                }
              }}
              /* FUNDO DO CARD: Glassmorphism mantido */
              className={`bg-white/40 dark:bg-slate-900/50 backdrop-blur-2xl shadow-lg p-6 min-w-[300px] max-w-[300px] flex-shrink-0 flex flex-col group transition-all duration-300 rounded-2xl ring-1 ring-inset ring-white/40 dark:ring-white/10 ${
                isViewed ? "border border-emerald-500/80" : "border border-white/30"
              }`}
            >
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-4 group-hover:bg-raspberry/10 group-hover:text-raspberry transition-colors duration-300">
                {card.icon}
              </div>
              
              <h4 className="font-heading font-bold text-slate-900 dark:text-white text-lg mb-4">{card.title}</h4>
              
              {/* LEGENDA DO CARD: Fundo removido, fonte aumentada (text-base) e negrito retirado (font-normal) */}
              <div className="mt-auto">
                <p className="text-slate-800 dark:text-slate-200 text-base leading-relaxed font-normal">{card.desc}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

const EducationSection = () => {
  const [selectedCard, setSelectedCard] = useState<CardType | null>(null);
  const [viewedCards, setViewedCards] = useState<Set<string>>(new Set());

  const handleCloseModal = () => {
    if (selectedCard) {
      setViewedCards((prev) => {
        const newSet = new Set(prev);
        newSet.add(selectedCard.title);
        return newSet;
      });
    }
    setSelectedCard(null);
  };

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

        /* Cores originais mantidas na estrutura */
        .blob-dark-blue { background-color: #1D4F91; width: 50vw; height: 50vw; top: -20%; left: -10%; animation-name: blob-float-1; }
        .blob-purple { background-color: #77127B; width: 45vw; height: 45vw; top: 10%; left: 30%; animation-name: blob-float-2; animation-delay: -5s; }
        .blob-magenta { background-color: #E80070; width: 40vw; height: 40vw; bottom: -10%; right: 10%; animation-name: blob-float-3; animation-delay: -2s; }
        .blob-light-blue { background-color: #426DA9; width: 45vw; height: 45vw; bottom: 20%; left: 10%; animation-name: blob-float-1; animation-direction: reverse; animation-delay: -7s; }
        .blob-raspberry { background-color: #C1188B; width: 35vw; height: 35vw; top: 20%; right: -5%; animation-name: blob-float-2; animation-direction: reverse; animation-delay: -10s; }
      `}</style>

      {/* Fundo base definido de forma rigorosa para ser claro ou bem escuro */}
      <section id="education" className="relative w-full min-h-screen py-24 flex flex-col justify-center bg-slate-50 dark:bg-slate-950 overflow-hidden border-t border-slate-200 dark:border-white/10">
        
        {/* OPACIDADE DINÂMICA mantida */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 opacity-20 dark:opacity-60 transition-opacity duration-500">
          <div className="dynamic-blob blob-dark-blue"></div>
          <div className="dynamic-blob blob-purple"></div>
          <div className="dynamic-blob blob-magenta"></div>
          <div className="dynamic-blob blob-light-blue"></div>
          <div className="dynamic-blob blob-raspberry"></div>
        </div>

        <div className="relative z-10 w-full">
          <div className="container mx-auto px-4">
            <ScrollReveal>
              <h2 className="fluid-title-lg font-heading font-bold text-center text-slate-900 dark:text-white mb-16">
                Educação Financeira
              </h2>
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
                  onCardClick={setSelectedCard} 
                  viewedCards={viewedCards}
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
                  onCardClick={setSelectedCard} 
                  viewedCards={viewedCards}
                />
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <AnimatePresence>
        {selectedCard && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
            onClick={handleCloseModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              /* MODAL FUNDO: Glassmorphism com ring */
              className="bg-white/90 dark:bg-slate-900/80 backdrop-blur-xl border border-white/20 shadow-2xl rounded-3xl p-8 max-w-lg w-full relative flex flex-col ring-1 ring-inset ring-slate-100 dark:ring-white/5"
              onClick={(e) => e.stopPropagation()} 
            >
              <button
                onClick={handleCloseModal}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                aria-label="Fechar"
              >
                <X size={24} />
              </button>

              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6">
                {selectedCard.icon}
              </div>
              <h3 className="text-2xl font-heading font-bold text-slate-900 dark:text-white mb-2">
                {selectedCard.title}
              </h3>
              {/* Box cinza removido também no modal, fonte aumentada (text-base) e negrito retirado (font-normal) */}
              <div className="mb-6">
                <p className="text-slate-800 dark:text-slate-200 font-normal text-base leading-relaxed">
                  {selectedCard.desc}
                </p>
              </div>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed flex-grow">
                {selectedCard.fullDesc}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default EducationSection;