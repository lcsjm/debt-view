import { useState } from "react";
import { motion } from "framer-motion";
import { GraduationCap, Droplets, PiggyBank, Building2, TrendingUp, Rocket, TrendingDown, Percent, Receipt, Handshake, Calculator, Home } from "lucide-react";
import ScrollReveal from "./ScrollReveal";
//import bgImage from "../assets/Gemini_Generated_Image_vrhyppvrhyppvrhy.png";

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
    <section id="education" className="w-full min-h-screen bg-dynamic-colors bg-[length:1000%_1000%] animate-dynamic-bg">
      {/* Background Image with Dark Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat bg-fixed"
        style={{ 
          /*backgroundImage: `url(${bgImage})`,*/
          zIndex: -2 
        }}
      />
      {/* Dim overlay to increase contrast for glassmorphism */}
      <div className="absolute inset-0 bg-black/60 dark:bg-black/70" style={{ zIndex: -1 }} />

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
