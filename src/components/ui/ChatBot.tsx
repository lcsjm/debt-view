import { useState, useRef, useEffect } from "react";
import { Send, Bot, User } from "lucide-react";

interface FinancialData {
  divida: number;
  rendaFixa: number[];
  rendaVariavel: number[];
  gastosFixos: number[];
  gastosVariaveis: number[];
}

interface Message {
  role: "bot" | "user";
  text: string;
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

const responses: Record<string, string> = {
  "regra 50/30/20": "A regra 50/30/20 sugere: 50% da renda para gastos essenciais (fixos), 30% para gastos pessoais (variáveis) e 20% para investimentos e pagamento de dívidas.",
  "como economizar": "Dicas: 1) Faça uma lista de compras antes de ir ao mercado. 2) Cancele assinaturas não utilizadas. 3) Compare preços. 4) Cozinhe em casa. 5) Use transporte público quando possível.",
  "investimento": "Para iniciantes, considere: Tesouro Direto (baixo risco), CDB (renda fixa), e gradualmente diversifique para renda variável conforme ganha experiência.",
  "divida": "Para sair das dívidas: 1) Liste todas as dívidas. 2) Priorize as de maior juros. 3) Negocie condições. 4) Evite novas dívidas. 5) Considere a portabilidade de crédito.",
};

const Chatbot = ({ financialData, compact }: { financialData: FinancialData | null; compact?: boolean }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [initialized, setInitialized] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (financialData && !initialized) {
      const analysis = generateAnalysis(financialData);
      const botMsgs: Message[] = [
        { role: "bot", text: "Olá! Sou seu assistente financeiro. Analisei seus dados cadastrados. Veja:" },
        ...analysis.map((t) => ({ role: "bot" as const, text: t })),
        { role: "bot", text: "Pergunte sobre: \"regra 50/30/20\", \"como economizar\", \"investimento\" ou \"dívida\" para mais dicas!" },
      ];
      setMessages(botMsgs);
      setInitialized(true);
    } else if (!financialData && !initialized) {
      setMessages([
        { role: "bot", text: "Olá! Sou seu assistente financeiro. Cadastre seus dados na seção acima para uma análise personalizada, ou pergunte sobre finanças!" },
      ]);
      setInitialized(true);
    }
  }, [financialData, initialized]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg: Message = { role: "user", text: input };
    const lower = input.toLowerCase();

    let reply = "Não entendi. Tente perguntar sobre: \"regra 50/30/20\", \"como economizar\", \"investimento\" ou \"dívida\".";
    for (const [key, val] of Object.entries(responses)) {
      if (lower.includes(key)) {
        reply = val;
        break;
      }
    }

    setMessages((prev) => [...prev, userMsg, { role: "bot", text: reply }]);
    setInput("");
  };

  return (
    <div className={`w-full ${compact ? "" : "max-w-[800px]"} mx-auto bg-card rounded-lg ${compact ? "" : "card-shadow"} overflow-hidden flex flex-col`} style={{ height: compact ? "100%" : 500 }}>
      <div className="bg-primary text-primary-foreground px-6 py-4 flex items-center gap-3">
        <Bot className="w-6 h-6" />
        <div>
          <h3 className="font-bold">Assistente Financeiro</h3>
          <p className="text-xs opacity-80">Powered by análise 50/30/20</p>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            {msg.role === "bot" && (
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-primary" />
              </div>
            )}
            <div
              className={`max-w-[75%] px-4 py-2 rounded-lg text-sm ${
                msg.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground"
              }`}
            >
              {msg.text}
            </div>
            {msg.role === "user" && (
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-muted-foreground" />
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-border flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Digite sua pergunta..."
          className="flex-1 h-10 px-4 rounded-md border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <button onClick={handleSend} className="btn-serasa w-10 h-10 bg-primary flex items-center justify-center rounded-md hover:brightness-110 transition-all">
          <Send className="w-5 h-5 text-white" />
        </button>
      </div>
    </div>
  );
};

export default Chatbot;