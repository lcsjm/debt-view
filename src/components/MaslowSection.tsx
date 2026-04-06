import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Home, ShieldCheck, Users, Award, Crown } from "lucide-react";
import ScrollReveal from "./ScrollReveal";

// Dados da Pirâmide
const maslowData = [
  {
    id: 5,
    level: "Realização\nPessoal",
    color: "bg-[#E80070]", // Magenta
    hover: "hover:bg-[#ff1a8c]",
    icon: <Crown size={32} className="text-white" />,
    shortDesc: "Independência e Propósito",
    fullDesc: "O topo da pirâmide. No contexto financeiro, representa a independência absoluta, a capacidade de viver de renda, realizar sonhos complexos e deixar um legado. É quando o dinheiro passa a ser uma ferramenta para o seu propósito de vida."
  },
  {
    id: 4,
    level: "Estima",
    color: "bg-[#C1188B]", // Raspberry
    hover: "hover:bg-[#d926a1]",
    icon: <Award size={32} className="text-white" />,
    shortDesc: "Reconhecimento e Status",
    fullDesc: "Relacionado ao respeito próprio e dos outros. Financeiramente, é a construção de um patrimônio sólido, a capacidade de adquirir bens de alto valor, ter sucesso nos investimentos e extrema confiança em suas decisões."
  },
  {
    id: 3,
    level: "Sociais",
    color: "bg-[#77127B]", // Purple
    hover: "hover:bg-[#8f1994]",
    icon: <Users size={32} className="text-white" />,
    shortDesc: "Pertencimento e Família",
    fullDesc: "Necessidades de afeto e interação. Nas finanças, traduz-se na capacidade de prover conforto para a família, investir na educação dos filhos e participar de eventos sociais sem comprometer de forma alguma o orçamento."
  },
  {
    id: 2,
    level: "Segurança",
    color: "bg-[#426DA9]", // Light Blue
    hover: "hover:bg-[#527ebd]",
    icon: <ShieldCheck size={32} className="text-white" />,
    shortDesc: "Proteção e Estabilidade",
    fullDesc: "A necessidade de sentir-se seguro e livre de riscos iminentes. Representa a construção da sua Reserva de Emergência, contratação de seguros (vida, saúde, patrimônio) e a previsibilidade para não depender de crédito."
  },
  {
    id: 1,
    level: "Fisiológicas",
    color: "bg-[#1D4F91]", // Dark Blue
    hover: "hover:bg-[#265fa8]",
    icon: <Home size={32} className="text-white" />,
    shortDesc: "Sobrevivência Básica",
    fullDesc: "A base da pirâmide. O mínimo necessário para viver: pagamento de moradia, alimentação, água, luz e transporte. Sem resolver essa camada primária, é impossível focar nos investimentos dos níveis superiores."
  }
];

export default function MaslowSection() {
  const [activeLayer, setActiveLayer] = useState(null); 

  return (
    <>
      <style>{`
        @keyframes shape-float-1 {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          50% { transform: translate(80px, 120px) rotate(180deg); }
        }
        @keyframes shape-float-2 {
          0%, 100% { transform: translate(0, 0) rotate(0deg) scale(1); }
          50% { transform: translate(-100px, 60px) rotate(-90deg) scale(1.3); }
        }
        @keyframes shape-float-3 {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          50% { transform: translate(90px, -100px) rotate(90deg); }
        }
        .animate-shape-1 { animation: shape-float-1 20s infinite ease-in-out; }
        .animate-shape-2 { animation: shape-float-2 25s infinite ease-in-out; }
        .animate-shape-3 { animation: shape-float-3 22s infinite ease-in-out; }
      `}</style>

      <section className="relative w-full py-24 bg-slate-50 dark:bg-slate-950 overflow-hidden border-t border-slate-200 dark:border-white/10">
         
         {/* ========================================================= */}
         {/* FUNDO: Formas Geométricas                                 */}
         {/* SUBSTITUA O BLOCO ABAIXO PELAS FORMAS DO SEU CÓDIGO ANTIGO*/}
         {/* ========================================================= */}
         <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
            <div className="absolute top-[10%] left-[5%] w-56 h-56 border-[16px] border-[#1D4F91]/50 rounded-full animate-shape-1" />
            <div className="absolute top-[40%] right-[12%] w-48 h-48 bg-[#426DA9]/50 rounded-3xl rotate-12 animate-shape-2" />
            <div className="absolute bottom-[10%] left-[10%] w-40 h-40 bg-[#77127B]/50 rounded-full animate-shape-3" />
            <div className="absolute top-[20%] right-[25%] w-0 h-0 border-l-[60px] border-r-[60px] border-b-[100px] border-l-transparent border-r-transparent border-b-[#C1188B]/50 animate-shape-1" style={{ animationDelay: '-4s' }} />
            <div className="absolute bottom-[20%] right-[10%] w-44 h-44 border-[12px] border-[#E80070]/60 rounded-2xl rotate-45 animate-shape-2" style={{ animationDelay: '-8s' }} />
            
            <div className="absolute top-[10%] right-[-5%] w-[45vw] h-[45vw] bg-[#77127B] rounded-full blur-[160px] mix-blend-screen opacity-25 dark:opacity-35" />
            <div className="absolute bottom-[-15%] left-[-5%] w-[40vw] h-[40vw] bg-[#1D4F91] rounded-full blur-[140px] mix-blend-screen opacity-25 dark:opacity-35" />
         </div>
         {/* ========================================================= */}

        <div className="relative z-10 container mx-auto px-4">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-black mb-4 bg-clip-text text-transparent bg-gradient-to-r from-[#1D4F91] via-[#77127B] to-[#E80070]">
                Pirâmide Financeira de Maslow
              </h2>
              <p className="text-slate-800 dark:text-slate-200 text-lg max-w-2xl mx-auto font-bold">
                Clique nas camadas para entender a hierarquia das necessidades financeiras.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid lg:grid-cols-2 gap-12 items-center max-w-7xl mx-auto">
            
            {/* PIRÂMIDE INTERATIVA - Largura Aumentada (max-w-[650px]) */}
            <div className="flex justify-center w-full">
              <div 
                className="w-full max-w-[500px] lg:max-w-[650px] aspect-square flex flex-col drop-shadow-2xl"
                style={{ clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)" }}
              >
                {maslowData.map((layer) => (
                  <motion.div
                    key={layer.id}
                    onClick={() => setActiveLayer(layer)}
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: activeLayer?.id === layer.id ? 1 : 0.8, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: layer.id * 0.15 }}
                    whileHover={{ scale: 1.01 }}
                    className={`flex-1 flex cursor-pointer transition-colors duration-300 ${layer.color} ${layer.hover} border-b border-white/20 last:border-0 
                      ${layer.id === 5 ? 'items-end justify-center pb-2 md:pb-4' : 'items-center justify-center'}`}
                  >
                    {/* Fonte Nova: font-semibold e uppercase */}
                    <span className={`text-white font-semibold uppercase drop-shadow-md whitespace-pre-line text-center 
                      ${layer.id === 5 ? 'text-[10px] md:text-sm leading-tight tracking-wider' : 'text-sm md:text-lg tracking-widest'}`}>
                      {layer.level}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* PAINEL GLASSMORPHISM CRISTALINO */}
            {activeLayer && (
              <ScrollReveal delay={0.4}>
                <div className="bg-white/10 dark:bg-slate-900/10 backdrop-blur-3xl border border-white/40 dark:border-white/10 rounded-[2.5rem] p-8 md:p-10 shadow-[0_8px_32px_0_rgba(0,0,0,0.1)] min-h-[440px] flex flex-col justify-center relative ring-1 ring-inset ring-white/50 transition-all duration-500 hover:border-white/60">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeLayer.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg ${activeLayer.color}`}>
                        {activeLayer.icon}
                      </div>
                      
                      <div>
                        <h3 className="text-3xl font-black text-slate-950 dark:text-white mb-1">
                          {activeLayer.level.replace('\n', ' ')}
                        </h3>
                        <h4 className="text-sm font-bold mb-6 uppercase tracking-[0.2em] text-[#C1188B] dark:text-[#ff4da6]">
                          {activeLayer.shortDesc}
                        </h4>
                        <p className="text-slate-900 dark:text-slate-50 text-xl leading-relaxed font-bold drop-shadow-sm">
                          {activeLayer.fullDesc}
                        </p>
                      </div>

                      <div className="pt-6 border-t border-slate-950/10 dark:border-white/20">
                        <span className="text-sm font-black text-slate-800 dark:text-slate-400 flex items-center gap-2">
                          <span className={`w-3 h-3 rounded-full ${activeLayer.color} animate-pulse`} />
                          Nível {activeLayer.id} de 5
                        </span>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </ScrollReveal>
            )}

          </div>
        </div>
      </section>
    </>
  );
}