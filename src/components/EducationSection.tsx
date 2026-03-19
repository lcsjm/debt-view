import { useState, useRef } from "react";
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
  const [scrollLeft, setScrollLeft] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);

  const duplicated = [...cards, ...cards];

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setHasDragged(false);
    if (sliderRef.current) {
      setStartX(e.pageX - sliderRef.current.offsetLeft);
      setScrollLeft(sliderRef.current.scrollLeft);
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
    const walk = (x - startX) * 2;
    
    if (Math.abs(walk) > 5) {
      setHasDragged(true);
    }
    
    sliderRef.current.scrollLeft = scrollLeft - walk;
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
    >
      <div
        className={`flex gap-6 ${direction === "left" ? "scroll-left" : "scroll-right"} ${paused ? "scroll-paused" : ""}`}
        style={{ width: `${duplicated.length * 340}px` }}
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
              className={`glass-card p-6 min-w-[300px] max-w-[300px] flex-shrink-0 group transition-all duration-300 ${
                isViewed ? "border border-emerald-500/80" : "border border-border/10"
              }`}
            >
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-4 group-hover:bg-raspberry/10 group-hover:text-raspberry transition-colors duration-300">
                {card.icon}
              </div>
              <h4 className="font-heading font-bold text-foreground text-lg mb-2">{card.title}</h4>
              <p className="text-muted-foreground text-sm leading-relaxed">{card.desc}</p>
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
      <section id="education" className="relative w-full min-h-screen py-24 flex flex-col justify-center bg-background overflow-hidden border-t border-border/10">
        <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-b from-background to-transparent z-10 pointer-events-none" />

        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute w-[45vw] h-[45vw] max-w-[500px] max-h-[500px] rounded-full bg-[#1D4F91]/30 dark:bg-[#1D4F91]/25 blur-[100px] -top-20 -left-10 animate-[float_22s_ease-in-out_infinite]" />
          <div className="absolute w-[50vw] h-[50vw] max-w-[600px] max-h-[600px] rounded-full bg-[#77127B]/25 dark:bg-[#77127B]/20 blur-[120px] top-[10%] right-[-15%] animate-[float_26s_ease-in-out_infinite_reverse]" />
          <div className="absolute w-[35vw] h-[35vw] max-w-[450px] max-h-[450px] rounded-full bg-[#E80070]/25 dark:bg-[#E80070]/20 blur-[90px] bottom-[-10%] left-[5%] animate-[float_20s_ease-in-out_infinite]" />
          <div className="absolute w-[30vw] h-[30vw] max-w-[400px] max-h-[400px] rounded-full bg-[#426DA9]/30 dark:bg-[#426DA9]/25 blur-[90px] bottom-[15%] right-[15%] animate-[float_24s_ease-in-out_infinite_reverse]" />
          <div className="absolute w-[25vw] h-[25vw] max-w-[350px] max-h-[350px] rounded-full bg-[#C1188B]/30 dark:bg-[#C1188B]/25 blur-[80px] top-[40%] left-[45%] animate-[float_18s_ease-in-out_infinite]" />
        </div>

        <div className="relative z-10 w-full">
          <div className="container mx-auto px-4">
            <ScrollReveal>
              <h2 className="fluid-title-lg font-heading font-bold text-center text-foreground mb-16">
                Educação Financeira
              </h2>
            </ScrollReveal>
          </div>

          <ScrollReveal delay={0.1}>
            <div className="mb-16 w-full">
              <h3 className="fluid-title-md font-heading font-bold text-center text-foreground mb-8">
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
              <h3 className="fluid-title-md font-heading font-bold text-center text-foreground mb-8">
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
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={handleCloseModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-background border border-border/20 shadow-2xl rounded-3xl p-8 max-w-lg w-full relative flex flex-col"
              onClick={(e) => e.stopPropagation()} 
            >
              <button
                onClick={handleCloseModal}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Fechar"
              >
                <X size={24} />
              </button>

              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6">
                {selectedCard.icon}
              </div>
              <h3 className="text-2xl font-heading font-bold text-foreground mb-2">
                {selectedCard.title}
              </h3>
              <p className="text-foreground/80 font-medium text-sm mb-6 pb-6 border-b border-border/10">
                {selectedCard.desc}
              </p>
              <p className="text-muted-foreground leading-relaxed flex-grow">
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