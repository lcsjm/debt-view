
import { Send, Bot, Sparkles, ArrowRight } from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { useChat, type FinancialData } from "@/components/chat-context";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const INITIAL_MESSAGE: ChatMessage = {
  id: "welcome",
  role: "assistant",
  content:
    "Oi! Sou o assistente do Serasa Humanizado. Posso te ajudar a entender como funciona a renegociação, tirar dúvidas sobre o Método Maslow Financeiro ou simular seu orçamento. Como posso ajudar?",
};

const SUGGESTIONS = [
  { label: "Renegociação", prompt: "Como funciona a renegociação?" },
  { label: "Método Maslow", prompt: "O que é o Método Maslow Financeiro?" },
  { label: "Simulador", prompt: "Como usar o simulador de orçamento?" },
  { label: "Score", prompt: "Como funciona o score de saúde financeira?" },
];

const fmt = (v: number) =>
  `R$ ${v.toFixed(2).replace(".", ",").replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;

function generateAnalysis(data: FinancialData): string[] {
  const totalRendaFixa = data.rendaFixa.reduce((a, b) => a + b, 0);
  const totalRendaVariavel = data.rendaVariavel.reduce((a, b) => a + b, 0);
  const totalRenda = totalRendaFixa + totalRendaVariavel;
  const totalGastosFixos = data.gastosFixos.reduce((a, b) => a + b, 0);
  const totalGastosVariaveis = data.gastosVariaveis.reduce((a, b) => a + b, 0);
  const totalGastos = totalGastosFixos + totalGastosVariaveis;
  const sobra = totalRenda - totalGastos;

  const tips: string[] = [];

  if (totalRenda === 0) {
    return ["Você não cadastrou nenhuma renda. Cadastre seus dados na seção anterior para uma análise completa."];
  }

  const percFixos = (totalGastosFixos / totalRenda) * 100;
  const percVariaveis = (totalGastosVariaveis / totalRenda) * 100;

  tips.push(`Analisei seus dados: Sua renda total é ${fmt(totalRenda)}. Seus gastos fixos levam ${percFixos.toFixed(1)}% e os variáveis ${percVariaveis.toFixed(1)}%.`);

  if (percFixos > 50) {
    tips.push(`⚠️ Atenção: Seus gastos fixos (${percFixos.toFixed(1)}%) estão acima do ideal de 50%. Isso pressiona seu orçamento.`);
  }

  if (percVariaveis > 30) {
    tips.push(`⚠️ Seus gastos variáveis (${percVariaveis.toFixed(1)}%) ultrapassam os 30% recomendados. Que tal rever assinaturas ou lazer?`);
  }

  if (sobra < 0) {
    tips.push(`🔴 Alerta Vermelho: Você está gastando ${fmt(Math.abs(sobra))} a mais do que ganha. Vamos priorizar o essencial (Maslow) e cortar o resto?`);
  } else if (sobra > 0 && data.divida > 0) {
    const meses = Math.ceil(data.divida / sobra);
    tips.push(`💡 Boa notícia: Com sua sobra de ${fmt(sobra)}/mês, você pode quitar sua dívida de ${fmt(data.divida)} em cerca de ${meses} meses (se usar tudo para isso).`);
  }

  return tips;
}

function getBotReply(userMessage: string): string {
  const lower = userMessage.toLowerCase();

  if (
    lower.includes("renegoci") ||
    lower.includes("negocia") ||
    lower.includes("dívida") ||
    lower.includes("divida")
  ) {
    return "A renegociação humanizada prioriza seu sustento primeiro. Usamos o Método Maslow Financeiro para garantir que suas necessidades básicas (moradia, alimentação) estejam cobertas antes de direcionar qualquer valor para dívidas. Assim, você negocia sem comprometer sua sobrevivência.";
  }

  if (
    lower.includes("maslow") ||
    lower.includes("método") ||
    lower.includes("metodo") ||
    lower.includes("vital")
  ) {
    return "O Método VITAL (baseado em Maslow) tem 3 etapas:\n\n1. **Garantir o Básico** -- Aluguel e mercado ficam protegidos.\n2. **Criar Segurança** -- Uma reserva de emergência para imprevistos.\n3. **Acordo Justo** -- Somente o que sobra vai para dívidas.\n\nIsso garante que você nunca comprometa o essencial ao negociar.";
  }

  if (
    lower.includes("simul") ||
    lower.includes("orçamento") ||
    lower.includes("orcamento") ||
    lower.includes("50-30-20")
  ) {
    return "No simulador, você ajusta sua renda mensal e gastos essenciais com os controles deslizantes. O gráfico mostra a divisão recomendada:\n\n- **50%** para necessidades\n- **30%** para estilo de vida\n- **20%** disponível para dívidas\n\nSe seus gastos passarem de 80% da renda, o sistema avisa para focar em renda extra primeiro.";
  }

  if (
    lower.includes("score") ||
    lower.includes("painel") ||
    lower.includes("dashboard") ||
    lower.includes("saúde") ||
    lower.includes("saude")
  ) {
    return "O Painel Financeiro mostra seu score de saúde financeira (de 0 a 1000) e ofertas personalizadas de renegociação com descontos que podem chegar a 60%. Quanto mais organizado seu orçamento, melhores as condições oferecidas.";
  }

  if (
    lower.includes("oi") ||
    lower.includes("olá") ||
    lower.includes("ola") ||
    lower.includes("bom dia") ||
    lower.includes("boa tarde") ||
    lower.includes("boa noite")
  ) {
    return "Olá! Fico feliz em te atender. Posso explicar sobre a renegociação humanizada, o Método Maslow Financeiro, ou te ajudar com o simulador de orçamento. O que prefere saber?";
  }

  return "Entendi! Para te ajudar melhor, posso falar sobre: a renegociação humanizada de dívidas, o Método Maslow Financeiro que prioriza seu sustento, ou como usar nosso simulador de orçamento. Sobre qual desses temas quer saber mais?";
}

export function ChatSidebar() {
  const { isOpen, setIsOpen, financialData } = useChat();
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, scrollToBottom]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  // Smart Analysis Effect
  useEffect(() => {
    if (financialData && !hasAnalyzed && isOpen) {
      const tips = generateAnalysis(financialData);

      const analysisMessages: ChatMessage[] = tips.map((tip, i) => ({
        id: `analysis-${Date.now()}-${i}`,
        role: "assistant",
        content: tip,
      }));

      // Add a small delay for natural feeling
      setTimeout(() => {
        setMessages(prev => [...prev, ...analysisMessages]);
        setHasAnalyzed(true);
      }, 500);
    }
  }, [financialData, isOpen, hasAnalyzed]);

  // Reset analysis if data is cleared (optional, depends on if financialData becomes null)
  useEffect(() => {
    if (!financialData) {
      setHasAnalyzed(false);
    }
  }, [financialData]);

  const handleSend = useCallback(
    (text?: string) => {
      const messageText = text || input.trim();
      if (!messageText || isTyping) return;

      const userMsg: ChatMessage = {
        id: `user-${Date.now()}`,
        role: "user",
        content: messageText,
      };

      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      setIsTyping(true);

      setTimeout(() => {
        const reply: ChatMessage = {
          id: `bot-${Date.now()}`,
          role: "assistant",
          content: getBotReply(messageText),
        };
        setMessages((prev) => [...prev, reply]);
        setIsTyping(false);
      }, 600 + Math.random() * 800);
    },
    [input, isTyping],
  );

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent
        side="right"
        className="flex w-full flex-col p-0 sm:max-w-[420px]"
      >
        {/* Sidebar header */}
        <SheetHeader className="flex-none border-b border-border px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <SheetTitle className="text-base">Assistente Serasa</SheetTitle>
              <SheetDescription className="text-xs">
                Tire suas dúvidas sobre renegociação
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          <div className="flex flex-col gap-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div className="flex max-w-[90%] gap-2.5">
                  {msg.role === "assistant" && (
                    <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                  )}
                  <div
                    className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${msg.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-foreground"
                      }`}
                  >
                    {msg.content.split("\n").map((line, i) => (
                      <span key={`${msg.id}-${i}`}>
                        {i > 0 && <br />}
                        {line}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="flex gap-2.5">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex items-center gap-1.5 rounded-2xl bg-muted px-4 py-3">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/40 [animation-delay:0ms]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/40 [animation-delay:150ms]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/40 [animation-delay:300ms]" />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggestion chips -- shown only when just the welcome message exists */}
          {messages.length === 1 && !isTyping && (
            <div className="mt-6 flex flex-col gap-2">
              <p className="text-xs font-medium text-muted-foreground">
                Sugestões
              </p>
              <div className="flex flex-col gap-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s.label}
                    type="button"
                    onClick={() => handleSend(s.prompt)}
                    className="group flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3 text-left text-sm text-foreground transition-colors hover:border-primary/30 hover:bg-primary/5"
                  >
                    <span>{s.label}</span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Input area */}
        <div className="flex-none border-t border-border px-5 py-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Digite sua mensagem..."
              className="flex-1 rounded-xl border border-input bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-40"
              aria-label="Enviar mensagem"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
          <p className="mt-2 text-center text-[11px] text-muted-foreground/60">
            {"Assistente com respostas pré-programadas para demonstração."}
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
