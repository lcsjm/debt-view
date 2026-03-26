import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Send, Bot, User, ArrowRight } from "lucide-react";
import ScrollReveal from "./ScrollReveal";

interface Message {
  role: "user" | "bot";
  text: string;
}

const AnalysisSection = () => {
  const [messages, setMessages] = useState<Message[]>([
    { role: "bot", text: "Olá! Sou o assistente financeiro do DebtView. Como posso ajudá-lo hoje? Posso dar dicas sobre economia, investimentos, dívidas e mais!" },
  ]);
  const [input, setInput] = useState("");
  const chatRef = useRef<HTMLDivElement>(null);

  const getBotReply = (msg: string): string => {
    const lower = msg.toLowerCase();
    if (lower.includes("dívida") || lower.includes("divida"))
      return "Para sair das dívidas, priorize quitar as de juros mais altos primeiro (como cartão de crédito). Negocie com os credores — muitas vezes é possível conseguir descontos significativos. O Serasa Limpa Nome pode ser um bom recurso.";
    if (lower.includes("invest"))
      return "Para começar a investir, primeiro monte sua reserva de emergência (3 a 6 meses de gastos). Depois, considere investimentos de renda fixa como CDB e Tesouro Direto antes de partir para renda variável.";
    if (lower.includes("economiz") || lower.includes("poupar") || lower.includes("guardar"))
      return "A regra 50-30-20 é um ótimo começo: 50% para necessidades, 30% para desejos e 20% para poupança/investimentos. Tente automatizar suas transferências para investimentos logo que receber o salário.";
    if (lower.includes("cartão") || lower.includes("crédito"))
      return "Evite pagar apenas o mínimo do cartão de crédito — os juros são os mais altos do mercado (acima de 400% ao ano). Se possível, troque a dívida do cartão por um empréstimo com juros menores.";
    if (lower.includes("emergência") || lower.includes("reserva"))
      return "A reserva de emergência deve cobrir de 3 a 6 meses de despesas essenciais. Mantenha-a em investimentos com liquidez diária, como Tesouro Selic ou CDB com liquidez diária.";
    return "Interessante pergunta! Posso ajudar com temas como controle de gastos, dívidas, investimentos, reserva de emergência e planejamento financeiro. Sobre qual tema gostaria de saber mais?";
  };

  const sendMessage = () => {
    if (!input.trim()) return;
    const userMsg: Message = { role: "user", text: input };
    const botReply: Message = { role: "bot", text: getBotReply(input) };
    setMessages((prev) => [...prev, userMsg, botReply]);
    setInput("");
    setTimeout(() => chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: "smooth" }), 100);
  };

  return (
    // Removido o bg-background fixo e adicionado relative para conter o gradiente
    <section id="analysis" className="relative py-24 lg:py-32 overflow-hidden min-h-[80vh] flex items-center">
      
      {/* Estilos para o Gradiente Dinâmico (Paleta Serasa Experian) */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes gradientMove {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient-bg {
          background: linear-gradient(-45deg, #1D4F91, #426DA9, #77127B, #C1188B, #E80070);
          background-size: 400% 400%;
          animation: gradientMove 15s ease infinite;
        }
      `,
        }}
      />

      {/* Fundo dinâmico CSS fluido aplicado na seção */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 animate-gradient-bg opacity-15 dark:opacity-30" />

      {/* Conteúdo da Seção (z-10 para ficar acima do fundo) */}
      <div className="container mx-auto px-6 md:px-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          
          {/* Coluna 1: Explicação */}
          <ScrollReveal>
            <div className="flex flex-col justify-center space-y-8 w-full max-w-2xl mx-auto lg:mx-0 text-left">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-heading font-extrabold text-[#1D4F91] dark:text-white leading-tight tracking-tight">
                Seu <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#77127B] to-[#E80070]">Assistente</span> Financeiro
              </h2>
              
              {/* Caixa de texto com Glassmorphism */}
              <div className="relative p-6 md:p-8 rounded-2xl bg-white/60 dark:bg-slate-900/60 backdrop-blur-md border border-[#426DA9]/20 shadow-sm hover:shadow-md transition-shadow duration-300">
                {/* Borda lateral estilizada */}
                <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-[#C1188B] to-[#E80070] rounded-l-2xl"></div>
                
                <p className="text-lg md:text-xl text-foreground/80 leading-relaxed font-medium text-justify">
                  Ao entrar, você terá acesso ao nosso chatbot que irá <span className="whitespace-nowrap">auxiliá-lo(a)</span> ao analisar suas finanças (rendas, gastos, investimentos, dívidas, entre outros).
                </p>
              </div>
              
              {/* Elementos decorativos interativos */}
              <div className="flex gap-3 items-center pt-2">
                <motion.div whileHover={{ scale: 1.05, width: 80 }} className="w-16 h-2 bg-[#1D4F91] rounded-full transition-all duration-300 cursor-default"></motion.div>
                <motion.div whileHover={{ scale: 1.05, width: 60 }} className="w-12 h-2 bg-[#426DA9] rounded-full transition-all duration-300 cursor-default"></motion.div>
                <motion.div whileHover={{ scale: 1.05, width: 40 }} className="w-8 h-2 bg-[#77127B] rounded-full transition-all duration-300 cursor-default"></motion.div>
              </div>
            </div>
          </ScrollReveal>

          {/* Coluna 2: Chatbot */}
          <ScrollReveal delay={0.2}>
            {/* Container principal do Chatbot com Glassmorphism forte */}
            <div 
              className="w-full max-w-2xl mx-auto rounded-2xl overflow-hidden cursor-pointer hover:shadow-2xl hover:scale-[1.02] transition-all duration-500 relative group border border-border/50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl"
              onClick={() => window.location.href = "/auth"}
              title="Clique para acessar o chatbot"
            >
              
              {/* Overlay interativo mais imersivo */}
              <div className="absolute inset-0 bg-[#1D4F91]/10 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none flex items-center justify-center backdrop-blur-[2px]">
                <span className="bg-gradient-to-r from-[#C1188B] to-[#E80070] text-white px-8 py-3.5 rounded-full font-bold shadow-xl translate-y-4 group-hover:translate-y-0 transition-all duration-300 flex items-center gap-2 text-lg">
                  Entrar para conversar <ArrowRight size={20} />
                </span>
              </div>

              {/* Chat header */}
              <div className="bg-gradient-to-r from-[#1D4F91] via-[#426DA9] to-[#77127B] px-6 py-5 flex items-center gap-4 relative z-0">
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm shadow-inner">
                  <Bot size={24} className="text-white" />
                </div>
                <div>
                  <p className="font-heading font-bold text-white text-base md:text-lg">DebtView Bot</p>
                  <p className="text-white/80 text-sm flex items-center gap-1.5 font-medium">
                    <span className="w-2.5 h-2.5 rounded-full bg-green-400 block shadow-[0_0_8px_rgba(74,222,128,0.5)]"></span>
                    Online agora
                  </p>
                </div>
              </div>

              {/* Messages - Fundo translúcido para pegar o gradiente de fundo */}
              <div ref={chatRef} className="h-[400px] overflow-y-auto p-6 space-y-6 bg-slate-50/40 dark:bg-slate-800/40 backdrop-blur-sm relative z-0">
                {messages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {msg.role === "bot" && (
                      <div className="w-10 h-10 rounded-full bg-[#426DA9]/10 flex items-center justify-center flex-shrink-0 mt-1">
                        <Bot size={20} className="text-[#426DA9]" />
                      </div>
                    )}
                    <div className={`max-w-[80%] px-5 py-4 rounded-2xl text-base leading-relaxed ${
                      msg.role === "user"
                        ? "bg-[#C1188B] text-white rounded-br-sm shadow-md"
                        : "bg-white dark:bg-slate-800 text-foreground shadow-sm rounded-bl-sm border border-border/50"
                    }`}>
                      {msg.text}
                    </div>
                    {msg.role === "user" && (
                      <div className="w-10 h-10 rounded-full bg-[#C1188B]/10 flex items-center justify-center flex-shrink-0 mt-1">
                        <User size={20} className="text-[#C1188B]" />
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>

              {/* Input - Também com Glassmorphism */}
              <div className="p-5 border-t border-border/50 flex gap-3 relative z-0 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  placeholder="Faça uma pergunta sobre finanças..."
                  className="flex-1 px-5 py-3.5 rounded-full bg-white dark:bg-slate-800 text-foreground placeholder:text-muted-foreground outline-none border border-border focus:border-[#1D4F91] focus:ring-1 focus:ring-[#1D4F91] text-base pointer-events-none transition-colors"
                  readOnly
                />
                <button
                  className="bg-[#E80070] text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg pointer-events-none"
                >
                  <Send size={20} className="ml-1" />
                </button>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
};

export default AnalysisSection;