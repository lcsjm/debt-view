import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Send, Bot, User } from "lucide-react";
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
    <section id="analysis" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <ScrollReveal>
          <h2 className="fluid-title-lg font-heading font-bold text-center text-foreground mb-4">
            Assistente Financeiro
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-xl mx-auto fluid-body">
            Tire suas dúvidas sobre finanças com nosso chatbot inteligente
          </p>
        </ScrollReveal>

        <ScrollReveal delay={0.2}>
          <div className="max-w-2xl mx-auto neu-card overflow-hidden">
            {/* Chat header */}
            <div className="bg-primary p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                <Bot size={20} className="text-primary-foreground" />
              </div>
              <div>
                <p className="font-heading font-semibold text-primary-foreground text-sm">DebtView Bot</p>
                <p className="text-primary-foreground/60 text-xs">Online</p>
              </div>
            </div>

            {/* Messages */}
            <div ref={chatRef} className="h-80 overflow-y-auto p-4 space-y-4 bg-muted/20">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.role === "bot" && (
                    <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0">
                      <Bot size={16} className="text-secondary" />
                    </div>
                  )}
                  <div className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground rounded-br-md"
                      : "bg-card text-card-foreground shadow-sm rounded-bl-md"
                  }`}>
                    {msg.text}
                  </div>
                  {msg.role === "user" && (
                    <div className="w-8 h-8 rounded-full bg-raspberry/20 flex items-center justify-center flex-shrink-0">
                      <User size={16} className="text-raspberry" />
                    </div>
                  )}
                </motion.div>
              ))}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-border flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Digite sua pergunta..."
                className="flex-1 px-4 py-3 rounded-full bg-muted text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary text-sm"
              />
              <button
                onClick={sendMessage}
                className="btn-raspberry-serasa p-3 flex items-center justify-center"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default AnalysisSection;
