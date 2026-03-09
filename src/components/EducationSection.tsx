import { useState } from "react";
import { motion } from "framer-motion";
import { GraduationCap, Droplets, PiggyBank, Building2, TrendingUp, Rocket, TrendingDown, Percent, Receipt, Handshake, Calculator, Home } from "lucide-react";
import ScrollReveal from "./ScrollReveal";

const investmentCards = [
// ... (keeping existing cards) ...
  { title: "Educação", icon: <GraduationCap size={28} />, desc: "Investir em conhecimento é o maior retorno que você pode ter." },
  { title: "Liquidez diária", icon: <Droplets size={28} />, desc: "Investimentos com resgate imediato para sua reserva de emergência." },
  { title: "Poupança", icon: <PiggyBank size={28} />, desc: "O primeiro passo para guardar dinheiro, simples e acessível." },
  { title: "Patrimônio", icon: <Building2 size={28} />, desc: "Construa riqueza com imóveis e ativos de longo prazo." },
  { title: "Ações", icon: <TrendingUp size={28} />, desc: "Participe do crescimento de grandes empresas na bolsa." },
  { title: "Empreendimento", icon: <Rocket size={28} />, desc: "Crie seu próprio negócio e gere renda ativa." },
];

const conceptCards = [
  { title: "Inflação", icon: <TrendingDown size={28} />, desc: "Entenda como a inflação corrói seu poder de compra ao longo do tempo." },
  { title: "CDB e CDI", icon: <Percent size={28} />, desc: "Conheça os principais indicadores de renda fixa do mercado." },
  { title: "Taxas e juros", icon: <Receipt size={28} />, desc: "Saiba como as taxas impactam seus investimentos e dívidas." },
  { title: "Empréstimos", icon: <Handshake size={28} />, desc: "Quando e como recorrer a empréstimos de forma inteligente." },
  { title: "Amortização", icon: <Calculator size={28} />, desc: "Reduza o valor das suas parcelas e economize nos juros." },
  { title: "Financiamento", icon: <Home size={28} />, desc: "Tudo sobre financiamento imobiliário e veicular." },
];

const ScrollingRow = ({ cards, direction }: { cards: typeof investmentCards; direction: "left" | "right" }) => {
  const [paused, setPaused] = useState(false);

  // Duplicate for infinite loop
  const duplicated = [...cards, ...cards];

  return (
    <div
      className="overflow-hidden py-8 -my-8"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        className={`flex gap-6 ${direction === "left" ? "scroll-left" : "scroll-right"} ${paused ? "scroll-paused" : ""}`}
        style={{ width: `${duplicated.length * 340}px` }}
      >
        {duplicated.map((card, i) => (
          <motion.div
            key={`${card.title}-${i}`}
            whileHover={{ scale: 1.03, y: -4 }}
            transition={{ duration: 0.3 }}
            className="glass-card p-6 min-w-[300px] max-w-[300px] flex-shrink-0 cursor-pointer group"
          >
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-4 group-hover:bg-raspberry/10 group-hover:text-raspberry transition-colors duration-300">
              {card.icon}
            </div>
            <h4 className="font-heading font-bold text-foreground text-lg mb-2">{card.title}</h4>
            <p className="text-muted-foreground text-sm leading-relaxed">{card.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

const EducationSection = () => {
  return (
    <section id="education" className="relative w-full min-h-screen py-24 flex flex-col justify-center bg-background overflow-hidden border-t border-border/10">
      {/* Smooth transition from the previous section */}
      <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-b from-background to-transparent z-10 pointer-events-none" />

      {/* Vibrant Serasa Ambient Orbs for Premium Glassmorphism Depth */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Dark Blue - #1D4F91 */}
        <div className="absolute w-[45vw] h-[45vw] max-w-[500px] max-h-[500px] rounded-full bg-[#1D4F91]/30 dark:bg-[#1D4F91]/25 blur-[100px] -top-20 -left-10 animate-[float_22s_ease-in-out_infinite]" />
        
        {/* Purple - #77127B */}
        <div className="absolute w-[50vw] h-[50vw] max-w-[600px] max-h-[600px] rounded-full bg-[#77127B]/25 dark:bg-[#77127B]/20 blur-[120px] top-[10%] right-[-15%] animate-[float_26s_ease-in-out_infinite_reverse]" />
        
        {/* Magenta - #E80070 */}
        <div className="absolute w-[35vw] h-[35vw] max-w-[450px] max-h-[450px] rounded-full bg-[#E80070]/25 dark:bg-[#E80070]/20 blur-[90px] bottom-[-10%] left-[5%] animate-[float_20s_ease-in-out_infinite]" />
        
        {/* Light Blue - #426DA9 */}
        <div className="absolute w-[30vw] h-[30vw] max-w-[400px] max-h-[400px] rounded-full bg-[#426DA9]/30 dark:bg-[#426DA9]/25 blur-[90px] bottom-[15%] right-[15%] animate-[float_24s_ease-in-out_infinite_reverse]" />
        
        {/* Raspberry - #C1188B */}
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

        {/* Investimentos */}
        <ScrollReveal delay={0.1}>
          <div className="mb-16 w-full">
            <h3 className="fluid-title-md font-heading font-bold text-center text-foreground mb-8">
              Investimentos
            </h3>
            <div className="w-full relative">
              <ScrollingRow cards={investmentCards} direction="left" />
            </div>
          </div>
        </ScrollReveal>

        {/* Conceitos */}
        <ScrollReveal delay={0.2}>
          <div className="w-full">
            <h3 className="fluid-title-md font-heading font-bold text-center text-foreground mb-8">
              Conceitos
            </h3>
            <div className="w-full relative">
              <ScrollingRow cards={conceptCards} direction="right" />
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default EducationSection;
