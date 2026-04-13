import { GoogleGenAI } from "@google/genai";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Send, Bot, Sparkles, ArrowRight, Trash2, Maximize2, Minimize2, X, BotMessageSquare } from "lucide-react";
import supabase from "../../utils/supabase";
import { getAILiveContext } from "../utils/aiContext";
import { useState, useRef, useEffect, useCallback } from "react";
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
    "Oi! Sou o assistente do DebtView. Posso te ajudar a entender como funciona a renegociação, tirar dúvidas sobre o Método Maslow Financeiro ou simular seu orçamento. Como posso ajudar?",
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

export function ChatSidebar() {
  const { isOpen, setIsOpen, financialData } = useChat();
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  
  // Estados para o Widget Arrastável
  const [isDetached, setIsDetached] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<{ startX: number; startY: number; initialX: number; initialY: number } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const saveHistory = async (newHistory: ChatMessage[]) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('chat').upsert({ user_id: user.id, history: newHistory }, { onConflict: 'user_id' });
    }
  };

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        supabase.from('chat').select('history').eq('user_id', user.id).maybeSingle().then(({ data }) => {
          if (data && data.history && Array.isArray(data.history) && data.history.length > 0) {
            setMessages(data.history);
          }
          setHistoryLoaded(true);
        });
      } else {
        setHistoryLoaded(true);
      }
    });
  }, []);

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
    if (!historyLoaded || !isOpen || hasAnalyzed) return;

    setMessages((prev) => {
      if (prev.length > 1) {
        setHasAnalyzed(true);
        return prev;
      }

      if (financialData) {
        const tips = generateAnalysis(financialData);

        const analysisMessages: ChatMessage[] = tips.map((tip, i) => ({
          id: `analysis-${Date.now()}-${i}`,
          role: "assistant",
          content: tip,
        }));

        setTimeout(() => {
          setMessages(current => {
            if (current.length > 1) return current;
            const newMsgs = [...current, ...analysisMessages];
            saveHistory(newMsgs);
            return newMsgs;
          });
          setHasAnalyzed(true);
        }, 500);
      }

      return prev;
    });
  }, [financialData, isOpen, hasAnalyzed, historyLoaded]);

  useEffect(() => {
    if (!financialData) {
      setHasAnalyzed(false);
    }
  }, [financialData]);

  const handleSend = useCallback(
    async (text?: string) => {
      const messageText = text || input.trim();
      if (!messageText || isTyping) return;

      const userMsg: ChatMessage = {
        id: `user-${Date.now()}`,
        role: "user",
        content: messageText,
      };

      const newMessages = [...messages, userMsg];
      setMessages(newMessages);
      // NÃO salvamos o histórico do usuário aqui para evitar condição de corrida com a Edge Function
      setInput("");
      setIsTyping(true);

      try {
        const { data: { user } } = await supabase.auth.getUser();
        let userContext = "";

        if (user) {
          const liveServerContext = await getAILiveContext(user);
          userContext = `${liveServerContext}
Lembre-se: NÃO MENCIONE QUE VOCÊ TEM ACESSO AOS DADOS DO BANCO DIRETAMENTE, SIMPLESMENTE FALE NATURALMENTE.`;
        }

        const { data, error } = await supabase.functions.invoke('chat_handler', {
          body: { 
            message: messageText,
            context: userContext
          }
        });

        if (error) {
          throw new Error(error.message);
        }
        
        if (!data || !data.success) {
          throw new Error(data?.error || "Erro desconhecido na IA.");
        }

        const reply: ChatMessage = {
          id: `bot-${Date.now()}`,
          role: "assistant",
          content: data.response || "Desculpe, não consegui gerar uma resposta.",
        };
        const finalMsgs = [...newMessages, reply];
        setMessages(finalMsgs);
      } catch (error) {
        console.error("Gemini API Error:", error);
        setMessages((prev) => [...prev, {
          id: `bot-${Date.now()}`,
          role: "assistant",
          content: "Desculpe, ocorreu um erro de conexão com nossos servidores I.A. Por favor, tente novamente mais tarde.",
        }]);
      } finally {
        setIsTyping(false);
      }
    },
    [input, isTyping, messages],
  );

  const handleClearHistory = () => {
    if (window.confirm("Certeza que deseja limpar completamente o histórico deste chat?")) {
      setMessages([INITIAL_MESSAGE]);
      setHasAnalyzed(false);
      supabase.auth.getUser().then(({ data: { user } }) => {
        if (user) {
          supabase.from('chat').upsert({ user_id: user.id, history: [INITIAL_MESSAGE], json_url: null }, { onConflict: 'user_id' });
        }
      });
    }
  };

  // --- Lógica de Transição Fluida e Arrasto ---

  const handleToggleDetach = () => {
    if (!isDetached) {
      // Quando vai para modo widget, define a posição inicial próxima de onde a sidebar já estava
      setPosition({
        x: Math.max(16, window.innerWidth - 440),
        y: 24,
      });
    }
    setIsDetached(!isDetached);
  };

  const onPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDetached) return; // Só permite arrastar no modo widget
    setIsDragging(true);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialX: position.x,
      initialY: position.y,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
  }, [isDetached, position]);

  const onPointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (isDragging && dragRef.current) {
      const dx = e.clientX - dragRef.current.startX;
      const dy = e.clientY - dragRef.current.startY;
      setPosition({
        x: Math.max(0, Math.min(window.innerWidth - 400, dragRef.current.initialX + dx)),
        y: Math.max(0, Math.min(window.innerHeight - 100, dragRef.current.initialY + dy)),
      });
    }
  }, [isDragging]);

  const onPointerUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (isDragging) {
      setIsDragging(false);
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  }, [isDragging]);


  return (
    <>
      {/* Backdrop condicional apenas para o modo Sidebar */}
      {!isDetached && (
        <div 
          className={`fixed inset-0 bg-background/80 backdrop-blur-sm z-40 transition-opacity duration-500 ease-in-out ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Container Unificado (Faz o morph de Sidebar para Widget) */}
      <div
        className={`fixed z-50 flex flex-col bg-background border-border shadow-2xl overflow-hidden
          ${isDragging ? 'transition-none' : 'transition-all duration-500 [transition-timing-function:cubic-bezier(0.25,1,0.5,1)]'}
        `}
        style={{
          // Dimensões fluidas
          width: "100%",
          maxWidth: "420px",
          height: isDetached ? "75vh" : "100vh",
          maxHeight: isDetached ? "750px" : "100vh",
          minHeight: isDetached ? "450px" : "100vh",
          
          // Posição Inteligente
          top: isDetached ? position.y : 0,
          left: isDetached ? position.x : `calc(100vw - min(100vw, 420px))`,
          
          // Estilo condicional
          borderRadius: isDetached ? "0.75rem" : "0",
          borderWidth: isDetached ? "1px" : "0 0 0 1px",
          
          // Lógica de aparecer/desaparecer e arrastar
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? "auto" : "none",
          transform: isOpen 
            ? (isDetached ? "scale(1) translateY(0)" : "translateX(0)")
            : (isDetached ? "scale(0.95) translateY(10px)" : "translateX(100%)")
        }}
      >
        {/* Cabeçalho Unificado (Arrastável se for widget) */}
        <div
          className={`flex-none border-b border-border px-5 py-4 flex flex-row justify-between items-center transition-colors 
            ${isDetached ? 'cursor-move hover:bg-muted/30 active:cursor-grabbing' : 'bg-background'}`}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          <div className="flex items-center gap-3 select-none pointer-events-none">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
              {/* Ícone do cabeçalho alterado aqui também! */}
              <BotMessageSquare className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="text-base font-semibold text-left text-foreground">Assistente DebtView</div>
              <div className="text-xs text-left text-muted-foreground">
                Tire suas dúvidas sobre renegociação
              </div>
            </div>
          </div>
          
          {/* BOTÕES: Lado a Lado perfeitamente isolados */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleDetach}
              className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-muted text-muted-foreground transition-colors"
              title={isDetached ? "Fixar na Lateral" : "Destacar como Widget"}
              onPointerDown={(e) => e.stopPropagation()} // Evita que o click arraste a tela
            >
              {isDetached ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-destructive hover:text-destructive-foreground text-muted-foreground transition-colors"
              title="Fechar Chat"
              onPointerDown={(e) => e.stopPropagation()} // Evita que o click arraste a tela
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Área de Mensagens */}
        <div className="flex-1 overflow-y-auto px-5 py-4 custom-scrollbar">
          <div className="flex flex-col gap-4">
            {messages.map((msg, idx) => (
              <div
                key={msg.id || idx}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div className="flex max-w-[90%] gap-2.5">
                  {msg.role === "assistant" && (
                    <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      {/* Ícone de mensagem alterado aqui! */}
                      <BotMessageSquare className="h-4 w-4 text-primary" />
                    </div>
                  )}
                  <div
                    className={`rounded-2xl px-4 py-3 text-sm leading-relaxed prose prose-sm max-w-none ${msg.role === "user"
                      ? "bg-primary text-primary-foreground prose-p:text-primary-foreground prose-strong:text-primary-foreground prose-ul:text-primary-foreground"
                      : "bg-muted text-foreground prose-p:text-foreground prose-strong:text-foreground prose-ul:text-foreground"
                      }`}
                  >
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="flex gap-2.5">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    {/* Ícone de digitando alterado aqui! */}
                    <BotMessageSquare className="h-4 w-4 text-primary" />
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

        {/* Input */}
        <div className="flex-none border-t border-border px-5 py-4 bg-background">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <button
              type="button"
              onClick={handleClearHistory}
              title="Limpar e Reiniciar Chat"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-input bg-background text-muted-foreground transition-colors hover:bg-muted hover:text-destructive hover:border-destructive/30"
            >
              <Trash2 className="h-4 w-4" />
            </button>
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
            As respostas do Assistente são geradas por I.A e podem conter imprecisões.
          </p>
        </div>
      </div>
    </>
  );
}