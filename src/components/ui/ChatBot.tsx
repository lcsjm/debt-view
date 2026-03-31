import { useState, useRef, useEffect, useCallback } from "react";
import { SendHorizontal, Sparkles, Trash2 } from "lucide-react";
import { GoogleGenAI } from "@google/genai";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import supabase from "../../../utils/supabase";

interface FinancialData {
  divida: number;
  rendaFixa: number[];
  rendaVariavel: number[];
  gastosFixos: number[];
  gastosVariaveis: number[];
}

interface Message {
  id?: string;
  role: "assistant" | "user";
  content: string;
}

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

  tips.push(`Sua renda total é ${fmt(totalRenda)}. Seus gastos fixos representam ${percFixos.toFixed(1)}% e os variáveis ${percVariaveis.toFixed(1)}% da sua renda.`);

  if (percFixos > 50) {
    tips.push(`⚠️ Seus gastos fixos (${percFixos.toFixed(1)}%) estão acima do ideal de 50%. Considere renegociar contratos, buscar opções mais baratas de moradia ou plano de saúde.`);
  }

  if (percVariaveis > 30) {
    tips.push(`⚠️ Seus gastos variáveis (${percVariaveis.toFixed(1)}%) ultrapassam os 30% recomendados. Tente reduzir gastos com lazer e alimentação fora de casa.`);
  }

  if (sobra < 0) {
    tips.push(`🔴 Você está gastando ${fmt(Math.abs(sobra))} a mais do que ganha! Isso aumenta seu endividamento. Priorize cortar gastos variáveis imediatamente.`);
  } else if (sobra > 0 && data.divida > 0) {
    const meses = Math.ceil(data.divida / sobra);
    tips.push(`💡 Com sua sobra de ${fmt(sobra)}/mês, você pode quitar sua dívida de ${fmt(data.divida)} em aproximadamente ${meses} meses, destinando toda a sobra para isso.`);
  }

  if (sobra > 0 && sobra / totalRenda < 0.2) {
    tips.push(`📈 O ideal é destinar 20% da renda para investimentos. Você está em ${((sobra / totalRenda) * 100).toFixed(1)}%. Tente otimizar seus gastos.`);
  }

  if (data.divida > 0) {
    tips.push("🎯 Estratégia para quitar a dívida: Priorize as dívidas com maiores juros, negocie descontos à vista e evite contrair novas dívidas.");
  }

  return tips;
}

const buildPromptContext = (data: FinancialData | null) => {
  if (!data) return "O usuário não preencheu seus dados financeiros ainda. Seja educado e convide-o a preencher na seção anterior.";
  
  const totalRendaFixa = data.rendaFixa.reduce((a, b) => a + b, 0);
  const totalRendaVariavel = data.rendaVariavel.reduce((a, b) => a + b, 0);
  const totalGastosFixos = data.gastosFixos.reduce((a, b) => a + b, 0);
  const totalGastosVariaveis = data.gastosVariaveis.reduce((a, b) => a + b, 0);
  
  return `O usuário tem a seguinte situação financeira construída baseada nos dados dele:
- Dívida total: ${fmt(data.divida)}
- Renda Fixa: ${fmt(totalRendaFixa)}
- Renda Variável: ${fmt(totalRendaVariavel)}
- Gastos Fixos: ${fmt(totalGastosFixos)}
- Gastos Variáveis: ${fmt(totalGastosVariaveis)}

Use essas informações de contexto para as suas respostas se pertinente. Evite ser robótico, seja empático, acolhedor e ofereça dicas práticas e concretas. Formate sempre todas as suas respostas usando Markdown, negritando pontos chaves.`;
};

/* ─── Botão Magnético de Envio ─── */
const MagneticSendButton = ({ onClick }: { onClick: () => void }) => {
  const btnRef = useRef<HTMLButtonElement>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    
    // Multiplicador define a força do ímã (0.3 deixa o movimento do botão mais suave)
    const dx = (e.clientX - cx) * 0.3; 
    const dy = (e.clientY - cy) * 0.3;
    
    // Distância máxima que o botão pode se deslocar
    const maxD = 10; 
    
    setOffset({
      x: Math.max(-maxD, Math.min(maxD, dx)),
      y: Math.max(-maxD, Math.min(maxD, dy)),
    });
  }, []);

  const handleMouseLeave = () => setOffset({ x: 0, y: 0 });

  return (
    <button
      ref={btnRef}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="w-10 h-10 bg-primary flex items-center justify-center rounded-md hover:brightness-110 flex-shrink-0 cursor-pointer"
      style={{
        // A transformação agora acontece no botão inteiro
        transform: `translate(${offset.x}px, ${offset.y}px)`,
        transition: "transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1)",
      }}
    >
      <SendHorizontal 
        style={{ 
          stroke: "white", 
          color: "white", 
          minWidth: "15px", // Tamanho do ícone reduzido
          minHeight: "15px", 
          display: "block" 
        }} 
      />
    </button>
  );
};

const Chatbot = ({ financialData, compact }: { financialData: FinancialData | null | undefined; compact?: boolean }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const [historyLoaded, setHistoryLoaded] = useState(false);

  const saveHistory = async (newHistory: Message[]) => {
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

    // Diagnostic Ping connection test
    supabase.auth.getUser().then(({ data, error }) => {
      console.log("-----------------------------------------");
      console.log("⚡ TESTE DE CONEXÃO SUPABASE (Diagnostics)");
      if (error) {
        console.error("❌ ERRO AUTENTICAÇÃO:", error.message);
      } else if (data.user) {
        console.log("✅ AUTENTICAÇÃO ATIVA:", data.user.id);
        
        // Testando velocidade de Query DB
        const start = performance.now();
        supabase.from('profiles').select('id').limit(1).then(() => {
          const lat = performance.now() - start;
          console.log(`✅ CONEXÃO COM BANCO DE DADOS: 100% OK (Latência: ${lat.toFixed(1)}ms)`);
          console.log("-----------------------------------------");
        });
      } else {
        console.log("⚠️ SEM SESSÃO ATIVA. Tudo ok com a SDK, mas usuário aguardando login.");
      }
    });
  }, []);

  useEffect(() => {
    if (financialData === undefined || !historyLoaded) return;
    
    if (messages.length > 0) {
      setInitialized(true);
      return;
    }

    if (financialData && !initialized) {
      const analysis = generateAnalysis(financialData);
      const botMsgs: Message[] = [
        { id: `ana-0`, role: "assistant", content: "Olá! Sou o seu Assistente I.A. Analisei seus dados mais recentes e aqui estão algumas dicas:" },
        ...analysis.map((t, idx) => ({ id: `ana-${idx+1}`, role: "assistant" as const, content: t })),
        { id: `ana-end`, role: "assistant", content: "Você pode me perguntar qualquer dúvida financeira! Como posso te ajudar a atingir seus objetivos hoje?" },
      ];
      setMessages(botMsgs);
      saveHistory(botMsgs);
      setInitialized(true);
    } else if (!financialData && !initialized) {
      const msgs: Message[] = [
        { role: "assistant", content: "Olá! Sou o seu Assistente I.A. DebtView. Você pode cadastrar seus dados ao longo do site para uma análise personalizada de suas finanças!\n\nPosso te ajudar com dúvidas como:\n- *Qual o primeiro passo para quitar minhas contas?*\n- *Como funcionam os métodos de amortização?*" },
      ];
      setMessages(msgs);
      saveHistory(msgs);
      setInitialized(true);
    }
  }, [financialData, initialized, historyLoaded, messages.length]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;
    const userMsg: Message = { id: `user-${Date.now()}`, role: "user", content: input };
    
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    saveHistory(newMessages);
    setInput("");
    setIsTyping(true);

    try {
      const apiKey = "AIzaSyCCAGqDVckbXVdWZ3BhjvNpFM9IsAfFtn8";
      if (!apiKey) {
        throw new Error("API Key não encontrada");
      }
      
      const ai = new GoogleGenAI({ apiKey });
      
      // Converte mensagens mantendo limite de 10 interações de contexto
      const history = messages
        .filter(m => m.role === "user" || m.role === "assistant")
        .slice(-10)
        .map(m => ({
          role: m.role === "assistant" ? "model" as const : "user" as const,
          parts: [{ text: m.content }]
        }));

      // Fetch Real-time Context
      const { data: { user } } = await supabase.auth.getUser();
      let liveContextStr = buildPromptContext(financialData);

      if (user) {
        const [profileReq, financesReq, debtsReq, serasaReq, transReq] = await Promise.all([
          supabase.from('profiles').select('*').eq('user_id', user.id).maybeSingle(),
          supabase.from('financial').select('*').eq('user_id', user.id).maybeSingle(),
          supabase.from('debts').select('*').eq('user_id', user.id),
          supabase.from('profiles').select('cpf').eq('user_id', user.id).maybeSingle()
            .then((res: any) => res.data?.cpf ? supabase.from('mock_serasa_debts').select('*').eq('user_cpf', res.data.cpf) : { data: [] }),
          supabase.from('transactions').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(10)
        ]);

        const p = profileReq.data;
        const f = financesReq.data;
        const d = debtsReq.data || [];
        const s = serasaReq.data || [];
        const t = transReq.data || [];

        liveContextStr = `\n\n--- DADOS BANCÁRIOS E PERFIL (EXTRAÍDOS EM TEMPO REAL) ---
Nome: ${p?.name || 'Desconhecido'}
Gastos Fixos Mensais: ${fmt(f?.fixedExpenses || 0)}
Gastos Variáveis Mensais: ${fmt(f?.variableExpenses || 0)}
Renda Fixa Mensal: ${fmt(f?.fixedIncome || 0)}
Renda Variável Mensal: ${fmt(f?.variableIncome || 0)}
Dívidas Atuais (Serasa Mock): ${s.length > 0 ? s.map((x: any) => `${x.creditor_name} - ${fmt(x.current_amount)} (Vence em: ${x.due_date})`).join(', ') : 'Nenhuma'}
Outras Dívidas Cadastradas: ${d.length > 0 ? d.map((x: any) => `${x.creditor} - ${fmt(x.amount)}`).join(', ') : 'Nenhuma'}
Últimas Transações: ${t.length > 0 ? t.map((x: any) => `${x.category} (${x.type}): ${fmt(x.value)}`).join(', ') : 'Nenhuma'}

Use essas informações atualizadas agora mesmo para responder o usuário. Responda em Markdown. Seja empático, nunca leia as transações em lista a não ser que pedido, e se sinta à vontade para referenciar que 'acabei de dar uma olhada no seu perfil...'.`;
      }

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          ...history,
          { role: 'user', parts: [{ text: input }] }
        ],
        config: {
          systemInstruction: `Você é um assistente financeiro altamente especializado, amigável e focado no alívio de dívidas. Mantenha respostas não muito longas, diretas ao ponto, com tópicos importantes ressaltados em negrito. ${liveContextStr}`
        }
      });

      const reply: Message = { id: `bot-${Date.now()}`, role: "assistant", content: response.text || "Desculpe, não consegui processar a resposta." };
      const finalMsgs = [...newMessages, reply];
      setMessages(finalMsgs);
      saveHistory(finalMsgs);
    } catch (error) {
      console.error("Gemini API Error:", error);
      const erroMsg: Message = { id: `err-${Date.now()}`, role: "assistant", content: "Houve um problema de conexão com nossos servidores I.A. Por favor, tente novamente mais tarde." };
      setMessages((prev) => [...prev, erroMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleClearHistory = () => {
    if (window.confirm("Certeza que deseja limpar completamente o histórico com a I.A.?")) {
      setMessages([]);
      setInitialized(false);
      // Ao limpar o estado do react local, a UseEffect de inicializacao ja vai salvar automaticamente o novo botMsg no Supabase!
      supabase.auth.getUser().then(({ data: { user } }) => {
        if (user) {
          supabase.from('chat').upsert({ user_id: user.id, history: [] }, { onConflict: 'user_id' });
        }
      });
    }
  };

  return (
    <div className={`w-full ${compact ? "" : "max-w-[800px]"} mx-auto bg-slate-950 border border-slate-800 rounded-xl ${compact ? "" : "shadow-2xl"} overflow-hidden flex flex-col`} style={{ height: compact ? "100%" : 500 }}>
      {/* Header Gemini */}
      <div 
        className="px-6 py-4 flex items-center justify-between gap-3 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #172554, #4c1d95)" }}
      >
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-24 h-24 bg-blue-500 rounded-full blur-2xl opacity-30 pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-24 h-24 bg-purple-500 rounded-full blur-2xl opacity-30 pointer-events-none" />

        <div className="flex items-center gap-3 relative z-10 w-full">
          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/20">
            <Sparkles className="w-5 h-5 text-blue-200" />
          </div>
          <div>
            <h3 className="font-bold text-white tracking-tight leading-tight">Assistente I.A.</h3>
            <p className="text-[11px] text-blue-200/80 font-medium tracking-wide">Assistente Inteligente</p>
          </div>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 bg-slate-900/95 scroll-smooth">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            {msg.role === "assistant" && (
              <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0 border border-blue-500/20 mt-1">
                <Sparkles className="w-4 h-4 text-blue-300" />
              </div>
            )}
            <div
              className={`max-w-[88%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-blue-600 text-white rounded-tr-sm shadow-md"
                  : "bg-slate-800 text-slate-200 rounded-tl-sm border border-slate-700 shadow-md prose prose-sm prose-p:text-slate-200 prose-strong:text-slate-100 prose-ul:text-slate-200"
              }`}
            >
              {msg.role === "assistant" ? (
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {msg.content}
                </ReactMarkdown>
              ) : (
                msg.content
              )}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex gap-3 justify-start items-end mt-1">
            <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0 border border-blue-500/20">
              <Sparkles className="w-4 h-4 text-blue-300 animate-pulse" />
            </div>
            <div className="bg-slate-800 px-4 py-3 rounded-2xl rounded-tl-sm border border-slate-700 shadow-md flex gap-1.5 items-center justify-center h-10">
              <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
              <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
              <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" />
            </div>
          </div>
        )}
      </div>

      <div className="p-3 bg-slate-950 border-t border-slate-800 flex gap-2 items-center">
        <button 
          onClick={handleClearHistory}
          className="flex-shrink-0 flex items-center justify-center w-11 h-11 bg-slate-900 border border-slate-700 hover:bg-slate-800 hover:border-red-900/50 rounded-xl transition-all text-slate-400 hover:text-red-400 group"
          title="Limpar Histórico"
        >
          <Trash2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
        </button>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Me ajude com finanças..."
          disabled={isTyping}
          className="flex-1 h-11 px-4 rounded-xl border border-slate-700 bg-slate-900/50 text-slate-100 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 transition-all placeholder:text-slate-500"
        />
        <MagneticSendButton onClick={handleSend} />
      </div>
    </div>
  );
};

export default Chatbot;