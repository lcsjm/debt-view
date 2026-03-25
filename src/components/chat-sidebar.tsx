import { GoogleGenAI } from "@google/genai";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Send, Bot, Sparkles, ArrowRight, Trash2 } from "lucide-react";
import supabase from "../../utils/supabase";
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

export function ChatSidebar() {
  const { isOpen, setIsOpen, financialData } = useChat();
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);
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
             // Prevines duplicata
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

  // Reset analysis if data is cleared (optional, depends on if financialData becomes null)
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
      saveHistory(newMessages);
      setInput("");
      setIsTyping(true);

      try {
        // Fetch User Context
        const { data: { user } } = await supabase.auth.getUser();
        let userContext = "";

        if (user) {
          const [profileReq, financesReq, debtsReq, serasaReq, transReq] = await Promise.all([
            supabase.from('profiles').select('*').eq('user_id', user.id).maybeSingle(),
            supabase.from('finances').select('*').eq('user_id', user.id).maybeSingle(),
            supabase.from('debts').select('*').eq('user_id', user.id),
            // Serasa demands CPF...
            supabase.from('profiles').select('cpf').eq('user_id', user.id).maybeSingle()
              .then((res: any) => res.data?.cpf ? supabase.from('mock_serasa_debts').select('*').eq('user_cpf', res.data.cpf) : { data: [] }),
            supabase.from('transactions').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(10)
          ]);

          const p = profileReq.data;
          const f = financesReq.data;
          const d = debtsReq.data || [];
          const s = serasaReq.data || [];
          const t = transReq.data || [];

          userContext = `\n\n--- DADOS DO USUÁRIO PARA CONTEXTO OBRIGATÓRIO (NÃO MENCIONE QUE VOCÊ TEM ACESSO AOS DADOS DO BANCO DIRETAMENTE, SIMPLESMENTE FALE NATURALMENTE) ---
Nome: ${p?.name || 'Desconhecido'}
Gastos Fixos Mensais: ${fmt(f?.fixed_expense || 0)}
Gastos Variáveis Mensais: ${fmt(f?.variable_expense || 0)}
Renda Fixa Mensal: ${fmt(f?.fixed_income || 0)}
Renda Variável Mensal: ${fmt(f?.variable_income || 0)}
Dívidas Atuais (Serasa Mock): ${s.length > 0 ? s.map((x: any) => `${x.creditor_name} - ${fmt(x.current_amount)} (Vence em: ${x.due_date})`).join(', ') : 'Nenhuma'}
Outras Dívidas Cadastradas: ${d.length > 0 ? d.map((x: any) => `${x.creditor} - ${fmt(x.amount)}`).join(', ') : 'Nenhuma'}
Últimas Transações: ${t.length > 0 ? t.map((x: any) => `${x.category} (${x.type}): ${fmt(x.value)}`).join(', ') : 'Nenhuma'}
`;
        }

        const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
        
        // Convert existing messages to Gemini format, keeping only the last 10 for context
        const history = messages
          .filter(m => m.id !== "welcome" && !m.id.startsWith("analysis"))
          .slice(-10)
          .map(m => ({
            role: m.role === "assistant" ? "model" as const : "user" as const,
            parts: [{ text: m.content }]
          }));

        const response = await ai.models.generateContent({
           model: 'gemini-2.5-flash',
           contents: [
             ...history,
             { role: 'user', parts: [{ text: messageText }] }
           ],
           config: {
             systemInstruction: "Você é o assistente do Serasa Humanizado. Seu objetivo é ajudar o usuário a entender como funciona a renegociação, tirar dúvidas sobre o Método Maslow Financeiro ou simular seu orçamento. Priorize a sobrevivência do usuário (moradia, alimentação) antes do pagamento de dívidas (Método VITAL/Maslow Financeiro). Seja amigável, acolhedor e claro. Responda em Markdown. " + userContext
           }
        });

        const reply: ChatMessage = {
          id: `bot-${Date.now()}`,
          role: "assistant",
          content: response.text || "Desculpe, não consegui gerar uma resposta.",
        };
        const finalMsgs = [...newMessages, reply];
        setMessages(finalMsgs);
        saveHistory(finalMsgs);
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
      setHasAnalyzed(false); // Reinicia a analise de contexto da prox vez que abrir
      saveHistory([INITIAL_MESSAGE]);
    }
  };

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
              <SheetTitle className="text-base text-left">Assistente Serasa</SheetTitle>
              <SheetDescription className="text-xs text-left">
                Tire suas dúvidas sobre renegociação
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          <div className="flex flex-col gap-4">
            {messages.map((msg, idx) => (
              <div
                key={msg.id || idx}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div className="flex max-w-[90%] gap-2.5">
                  {msg.role === "assistant" && (
                    <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <Bot className="h-4 w-4 text-primary" />
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
            {"As respostas do Assistente são geradas por Inteligência Artificial e podem conter imprecisões."}
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
