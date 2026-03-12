import { useState, useMemo, KeyboardEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ResponsivePie } from "@nivo/pie";
import { ResponsiveBar } from "@nivo/bar";
import { AlertTriangle, CheckCircle, Plus, ArrowRight, ArrowLeft, SkipForward, X, Loader2 } from "lucide-react";
import ScrollReveal from "./ScrollReveal";
import supabase from "../../utils/supabase";

const COLORS = {
  primary: "hsl(213, 66%, 34%)",
  light: "hsl(213, 43%, 46%)",
  secondary: "hsl(298, 75%, 28%)",
  raspberry: "hsl(320, 79%, 43%)",
  magenta: "hsl(331, 100%, 45%)",
  muted: "hsl(220, 14%, 75%)",
};

const nivoTheme = {
  text: {
    fontFamily: "inherit",
    fill: "hsl(var(--foreground))",
    fontSize: 12,
  },
  axis: {
    domain: {
      line: {
        stroke: "hsl(var(--border))",
        strokeWidth: 1,
      },
    },
    ticks: {
      line: {
        stroke: "hsl(var(--border))",
        strokeWidth: 1,
      },
      text: {
        fill: "hsl(var(--muted-foreground))",
      },
    },
    legend: {
      text: {
        fill: "hsl(var(--foreground))",
        fontWeight: "bold",
      },
    },
  },
  grid: {
    line: {
      stroke: "hsl(var(--border))",
      strokeWidth: 1,
      strokeDasharray: "4 4",
    },
  },
  tooltip: {
    container: {
      background: "hsl(var(--card))",
      color: "hsl(var(--card-foreground))",
      fontSize: 13,
      borderRadius: "12px",
      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
      border: "1px solid hsl(var(--border))",
      padding: "8px 12px",
    },
  },
  legends: {
    text: {
      fill: "hsl(var(--foreground))",
    },
  },
};

interface FinancialData {
  divida: number[];
  rendaFixa: number[];
  rendaVariavel: number[];
  gastosFixos: number[];
  gastosVariaveis: number[];
  investimentos: number[];
}

const steps = [
    {
        key: "divida",
        title: "Dívida Ativa",
        question: "Você possui alguma dívida ativa? Digite o valor:",
        description: "Dívida ativa é qualquer valor que você deve a terceiros — bancos, lojas, cartão de crédito, empréstimos, etc. Saber o total é o primeiro passo para se reorganizar.",
        image: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&q=80",
        multiple: true,
    },
    {
        key: "rendaFixa",
        title: "Renda Fixa",
        question: "Deseja adicionar alguma renda fixa?",
        description: "Renda fixa é todo valor que você recebe regularmente e de forma previsível: salário, aposentadoria, pensão, aluguéis recebidos, entre outros.",
        image: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800&q=80",
        multiple: true,
    },
    {
        key: "rendaVariavel",
        title: "Renda Variável",
        question: "Deseja adicionar alguma renda variável?",
        description: "Renda variável inclui trabalho informal, freelances, comissões, gorjetas, renda extra e qualquer ganho sem valor fixo mensal.",
        image: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=800&q=80",
        multiple: true,
    },
    {
        key: "gastosFixos",
        title: "Gastos Fixos",
        question: "Deseja adicionar algum gasto fixo?",
        description: "Gastos fixos são despesas recorrentes com valor previsível: aluguel, educação, financiamentos, plano de saúde, IPVA, IPTU, entre outros.",
        image: "https://images.unsplash.com/photo-1554224154-26032ffc0d07?w=800&q=80",
        multiple: true,
    },
    {
        key: "gastosVariaveis",
        title: "Gastos Variáveis",
        question: "Deseja adicionar algum gasto variável?",
        description: "Gastos variáveis mudam a cada mês: água, luz, alimentação, higiene, lazer, saúde e outros custos do dia a dia.",
        image: "https://images.unsplash.com/photo-1607006411046-bf25eb6e1da3?w=800&q=80",
        multiple: true,
    },
    {
        key: "investimentos",
        title: "Investimentos",
        question: "Você possui algum valor investido mensalmente?",
        description: "Investimentos são valores poupados ou aplicados em produtos financeiros com o objetivo de multiplicar seu patrimônio.",
        image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80",
        multiple: true,
    },
    {
        key: "signup",
        title: "Cadastro",
        question: "Crie sua conta para ver os resultados e salvar seus dados!",
        description: "Estamos quase lá! Cadastre-se gratuitamente para ver sua análise financeira detalhada e acompanhar sua evolução ao longo do tempo.",
        image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80",
        multiple: false,
        isSignup: true
    }
];

const formatCurrency = (val: string) => {
    const num = val.replace(/\D/g, "");
    const parsed = (parseInt(num || "0") / 100).toFixed(2);
    return parsed.replace(".", ",").replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

interface StepSnapshot {
    data: FinancialData;
    inputValue: string;
    items: number[];
}

export default function CalculatorSection() {
  const [currentStep, setCurrentStep] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  
  const [data, setData] = useState<FinancialData>({
      divida: [],
      rendaFixa: [],
      rendaVariavel: [],
      gastosFixos: [],
      gastosVariaveis: [],
      investimentos: [],
  });
  
  const [inputValue, setInputValue] = useState("");
  const [items, setItems] = useState<number[]>([]);
  const [history, setHistory] = useState<StepSnapshot[]>([]);

  // Auth fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const step = steps[currentStep];

  // --- Handlers ---
  const handleAddItem = () => {
      const num = parseFloat(inputValue.replace(/\./g, "").replace(",", ".")) || 0;
      if (num > 0) {
          setItems([...items, num]);
          setInputValue("");
      }
  };

  const handleRemoveItem = (index: number) => {
      setItems(items.filter((_, i) => i !== index));
  };

  const saveAndAdvance = async (newData: FinancialData) => {
      setHistory([...history, { data: { ...data }, inputValue, items: [...items] }]);
      setData(newData);

      if (currentStep < steps.length - 1) {
          setCurrentStep(currentStep + 1);
          setInputValue("");
          setItems([]);
      }
  };

  const handleNext = () => {
      const num = parseFloat(inputValue.replace(/\./g, "").replace(",", ".")) || 0;
      const newData = { ...data };

      if (step.multiple) {
          const allItems = num > 0 ? [...items, num] : items;
          (newData as any)[step.key] = allItems;
      } else if (!step.isSignup) {
          (newData as any)[step.key] = num > 0 ? [num] : items;
      }
      
      saveAndAdvance(newData);
  };

  const handleSignupAndFinish = async () => {
      if (!name || !email || !password) {
          setErrorMsg("Por favor, preencha todos os campos.");
          return;
      }
      setErrorMsg("");
      setLoading(true);

      try {
          // 1. Create user
          const { data: authData, error: authError } = await supabase.auth.signUp({
              email,
              password,
          });

          if (authError) throw authError;

          const user = authData.user;
          if (!user) throw new Error("Falha ao criar usuário");

          // 2. Insert into profiles
          const { error: profileError } = await supabase
              .from('profiles')
              .insert([
                  { user_id: user.id, name: name }
              ]);

          if (profileError) {
              console.error("Profile Error:", profileError);
          }

          // 3. Insert into finances
          const totalRendaFixa = data.rendaFixa.reduce((a, b) => a + b, 0);
          const totalRendaVar = data.rendaVariavel.reduce((a, b) => a + b, 0);
          const totalGastosFixos = data.gastosFixos.reduce((a, b) => a + b, 0);
          const totalGastosVar = data.gastosVariaveis.reduce((a, b) => a + b, 0);
          const totalDivida = data.divida.reduce((a, b) => a + b, 0);
          const totalInv = data.investimentos.reduce((a, b) => a + b, 0);

          const { error: financeError } = await supabase
              .from('finances')
              .insert([
                  {
                      user_id: user.id,
                      fixed_income: totalRendaFixa,
                      variable_income: totalRendaVar,
                      fixed_expense: totalGastosFixos,
                      variable_expense: totalGastosVar,
                      debts: totalDivida,
                      investments: totalInv
                  }
              ]);

          if (financeError) {
              console.error("Finance Error:", financeError);
          }

          // Finish and show results
          setShowResults(true);
      } catch (err: any) {
          setErrorMsg(err.message || "Ocorreu um erro durante o cadastro.");
      } finally {
          setLoading(false);
      }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
          e.preventDefault();
          if (step.isSignup) {
              handleSignupAndFinish();
              return;
          }

          const num = parseFloat(inputValue.replace(/\./g, "").replace(",", ".")) || 0;
          if (step.multiple) {
              if (num > 0) {
                  handleAddItem();
              } else {
                  handleNext();
              }
          } else {
              handleNext();
          }
      } else if (e.key === "Escape" && currentStep > 0) {
          e.preventDefault();
          handleBack();
      }
  };

  const handleSkip = () => {
      const newData = { ...data };
      if (!step.isSignup) {
          if (step.multiple) {
              (newData as any)[step.key] = items.length > 0 ? items : [];
          } else {
              (newData as any)[step.key] = [];
          }
      }
      saveAndAdvance(newData);
  };

  const handleBack = () => {
      if (history.length === 0) return;
      const prev = history[history.length - 1];
      setData(prev.data);
      setInputValue(prev.inputValue);
      setItems(prev.items);
      setHistory(history.slice(0, -1));
      setCurrentStep(currentStep - 1);
      setErrorMsg("");
  };

  // --- Compute Results if showResults is true ---
  const sum = (arr: number[]) => arr.reduce((a, b) => a + b, 0);
  const renda = sum(data.rendaFixa) + sum(data.rendaVariavel);
  const gastosFixos = sum(data.gastosFixos);
  const gastosVariaveis = sum(data.gastosVariaveis);
  const investimentos = sum(data.investimentos);
  const dividas = sum(data.divida);
  const saldo = renda - gastosFixos - gastosVariaveis - investimentos;

  const pieData = useMemo(() => [
    { name: "Gastos Fixos", value: gastosFixos },
    { name: "Gastos Variáveis", value: gastosVariaveis },
    { name: "Investimentos", value: investimentos },
    { name: "Saldo Livre", value: Math.max(0, saldo) },
  ], [gastosFixos, gastosVariaveis, investimentos, saldo]);

  const barData = useMemo(() => [
    { name: "Renda", value: renda, color: COLORS.primary },
    { name: "G. Fixos", value: gastosFixos, color: COLORS.light },
    { name: "G. Variáveis", value: gastosVariaveis, color: COLORS.raspberry },
    { name: "Dívidas", value: dividas, color: COLORS.magenta },
    { name: "Investimentos", value: investimentos, color: COLORS.secondary },
  ], [renda, gastosFixos, gastosVariaveis, dividas, investimentos]);

  const formatCurrencyDisplay = (v: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

  const pieColors = [COLORS.primary, COLORS.raspberry, COLORS.secondary, COLORS.light];

  // --- Render ---
  return (
    <section id="calculator" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <ScrollReveal>
          <h2 className="fluid-title-lg font-heading font-bold text-center text-foreground mb-4">
            Análise Financeira
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-xl mx-auto fluid-body">
            Entenda sua situação financeira em poucos passos
          </p>
        </ScrollReveal>

        {!showResults ? (
            <ScrollReveal>
                <div className="w-full flex flex-col items-center justify-center gap-8 animate-in fade-in duration-700">
                    {/* Progress */}
                    <div className="w-full max-w-5xl flex items-center gap-2 mb-6">
                        {steps.map((s, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-2 group cursor-default">
                                <div className="relative">
                                    {i < currentStep && (
                                        <div className="absolute inset-0 bg-primary/20 rounded-full blur-sm" />
                                    )}
                                    <div
                                        className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all border-2 ${
                                            i <= currentStep
                                                ? "bg-primary text-primary-foreground border-primary"
                                                : "bg-muted text-muted-foreground border-muted-foreground/20"
                                        }`}
                                    >
                                        {i + 1}
                                    </div>
                                </div>
                                <span className={`text-xs font-medium hidden sm:block transition-colors ${
                                    i <= currentStep ? "text-primary" : "text-muted-foreground"
                                }`}>
                                    {s.title}
                                </span>
                            </div>
                        ))}
                    </div>

                    <div className="w-full max-w-5xl flex flex-col lg:flex-row gap-8 items-stretch bg-card border rounded-2xl shadow-xl overflow-hidden min-h-[500px]">
                        {/* Left - Input */}
                        <div className="flex-1 flex flex-col gap-6 p-8 lg:p-12 justify-center bg-background rounded-l-2xl z-10">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={currentStep}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.3 }}
                                    className="flex flex-col gap-6"
                                >
                                    <div className="space-y-2">
                                        <h3 className="text-3xl font-bold text-foreground tracking-tight">{step.title}</h3>
                                        <p className="text-muted-foreground text-lg leading-relaxed">{step.question}</p>
                                    </div>

                                    {!step.isSignup ? (
                                        <>
                                            {/* Items list */}
                                            {step.multiple && items.length > 0 && (
                                                <div className="flex flex-wrap gap-2 animate-in slide-in-from-bottom-2">
                                                    {items.map((item, i) => (
                                                        <div
                                                            key={i}
                                                            className="group flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/20 text-accent-foreground border border-accent/30 text-sm font-semibold shadow-sm transition-colors hover:bg-destructive/10 hover:border-destructive/30 hover:text-destructive"
                                                        >
                                                            <span>R$ {item.toFixed(2).replace(".", ",")}</span>
                                                            <button
                                                                onClick={() => handleRemoveItem(i)}
                                                                className="p-0.5 rounded-full hover:bg-destructive/20 transition-colors"
                                                            >
                                                                <X className="w-3 h-3" />
                                                                <span className="sr-only">Remover</span>
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            <div className="flex flex-wrap gap-4 items-end">
                                                <div className="relative flex-1 min-w-[200px] group">
                                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold text-xl group-focus-within:text-primary transition-colors">
                                                        R$
                                                    </span>
                                                    <input
                                                        type="text"
                                                        value={inputValue}
                                                        onChange={(e) => setInputValue(formatCurrency(e.target.value))}
                                                        onKeyDown={handleKeyDown}
                                                        placeholder="0,00"
                                                        className="w-full h-14 pl-12 pr-4 rounded-xl border bg-background text-2xl font-bold border-muted-foreground/20 focus:ring-2 focus:ring-primary focus:border-primary shadow-sm outline-none transition-all"
                                                    />
                                                </div>

                                                {step.multiple && (
                                                    <button
                                                        onClick={handleAddItem}
                                                        className="h-14 px-6 rounded-xl border-dashed border-2 font-semibold hover:border-primary hover:text-primary hover:bg-primary/5 transition-all text-muted-foreground flex items-center"
                                                    >
                                                        <Plus className="w-5 h-5 mr-2" /> Adicionar
                                                    </button>
                                                )}
                                            </div>
                                        </>
                                    ) : (
                                        <div className="flex flex-col gap-4">
                                            {errorMsg && (
                                                <div className="p-3 rounded bg-destructive/10 text-destructive text-sm font-medium">
                                                    {errorMsg}
                                                </div>
                                            )}
                                            <div className="space-y-3">
                                                <input
                                                    type="text"
                                                    placeholder="Nome completo"
                                                    value={name}
                                                    onChange={e => setName(e.target.value)}
                                                    onKeyDown={handleKeyDown}
                                                    className="w-full h-12 px-4 rounded-xl border bg-background border-muted-foreground/20 focus:ring-2 focus:ring-primary focus:border-primary shadow-sm outline-none transition-all"
                                                />
                                                <input
                                                    type="email"
                                                    placeholder="E-mail"
                                                    value={email}
                                                    onChange={e => setEmail(e.target.value)}
                                                    onKeyDown={handleKeyDown}
                                                    className="w-full h-12 px-4 rounded-xl border bg-background border-muted-foreground/20 focus:ring-2 focus:ring-primary focus:border-primary shadow-sm outline-none transition-all"
                                                />
                                                <input
                                                    type="password"
                                                    placeholder="Senha"
                                                    value={password}
                                                    onChange={e => setPassword(e.target.value)}
                                                    onKeyDown={handleKeyDown}
                                                    className="w-full h-12 px-4 rounded-xl border bg-background border-muted-foreground/20 focus:ring-2 focus:ring-primary focus:border-primary shadow-sm outline-none transition-all"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t mt-4">
                                        {currentStep > 0 && (
                                            <button
                                                onClick={handleBack}
                                                className="h-12 px-6 rounded-xl font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex items-center justify-center"
                                            >
                                                <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
                                            </button>
                                        )}

                                        <div className="flex-1 flex gap-3 justify-end">
                                            {!step.isSignup && (
                                                <button
                                                    onClick={handleSkip}
                                                    className="h-12 px-6 rounded-xl font-medium bg-secondary/20 text-secondary-foreground hover:bg-secondary/30 transition-colors flex items-center justify-center"
                                                >
                                                    <SkipForward className="w-4 h-4 mr-2" /> Pular
                                                </button>
                                            )}
                                            {step.isSignup ? (
                                                <button
                                                    onClick={handleSignupAndFinish}
                                                    disabled={loading}
                                                    className="h-12 px-8 rounded-xl bg-primary text-primary-foreground font-semibold shadow-lg hover:shadow-primary/25 hover:bg-primary/90 transition-all flex items-center justify-center disabled:opacity-70"
                                                >
                                                    {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : "Ver Resultados"}
                                                    {!loading && <ArrowRight className="w-5 h-5 ml-2" />}
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={handleNext}
                                                    className="h-12 px-8 rounded-xl bg-primary text-primary-foreground font-semibold shadow-lg hover:shadow-primary/25 hover:bg-primary/90 transition-all flex items-center justify-center"
                                                >
                                                    Próximo
                                                    <ArrowRight className="w-5 h-5 ml-2" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            </AnimatePresence>
                        </div>

                        {/* Right - Illustration with background image */}
                        <div className="hidden lg:flex flex-1 relative min-h-[400px] bg-muted">
                            <AnimatePresence mode="wait">
                                <motion.img
                                    key={step.image}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.5 }}
                                    src={step.image}
                                    alt={step.title}
                                    className="absolute inset-0 w-full h-full object-cover"
                                />
                            </AnimatePresence>
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                            <div className="absolute bottom-0 left-0 right-0 p-10 z-10 space-y-3">
                                <div className="inline-block p-2 rounded-lg bg-white/10 backdrop-blur-md mb-2 border border-white/20">
                                    <h4 className="text-xl font-bold text-white">{step.title}</h4>
                                </div>
                                <p className="text-base text-white/90 leading-relaxed font-medium max-w-md drop-shadow-md">
                                    {step.description}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </ScrollReveal>
        ) : (
            <ScrollReveal>
            <div className="max-w-4xl mx-auto animate-in fade-in zoom-in duration-500">
              <AlertsPanel renda={renda} gastosFixos={gastosFixos} gastosVariaveis={gastosVariaveis} />

              <div className="grid md:grid-cols-2 gap-8 lg:gap-12 mb-8 lg:mb-12">
                <div className="neu-card p-6 lg:p-8 flex flex-col items-center">
                  <h3 className="font-heading font-semibold text-foreground mb-4 text-center">Distribuição</h3>
                  <div className="w-full h-[320px]">
                    <ResponsivePie
                        data={pieData.map((d, i) => ({ id: d.name, label: d.name, value: d.value, color: pieColors[i % pieColors.length] }))}
                        margin={{ top: 20, right: 20, bottom: 60, left: 20 }}
                        innerRadius={0.6}
                        padAngle={2}
                        cornerRadius={4}
                        activeOuterRadiusOffset={8}
                        colors={{ datum: 'data.color' }}
                        borderWidth={1}
                        borderColor={{
                            from: 'color',
                            modifiers: [['darker', 0.2]]
                        }}
                        enableArcLinkLabels={false}
                        arcLabel={e => `${((e.value / Math.max(renda, 1)) * 100).toFixed(0)}%`}
                        arcLabelsSkipAngle={10}
                        arcLabelsTextColor="#ffffff"
                        theme={nivoTheme}
                        tooltip={({ datum }) => (
                            <div className="bg-card text-card-foreground p-3 rounded-xl shadow-md border text-sm font-medium flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: datum.color }} />
                                <span>{datum.id}:</span>
                                <span className="font-bold">{formatCurrencyDisplay(datum.value)}</span>
                            </div>
                        )}
                        legends={[
                            {
                                anchor: 'bottom',
                                direction: 'row',
                                justify: false,
                                translateX: 0,
                                translateY: 56,
                                itemsSpacing: 0,
                                itemWidth: 100,
                                itemHeight: 18,
                                itemTextColor: 'hsl(var(--foreground))',
                                itemDirection: 'left-to-right',
                                itemOpacity: 1,
                                symbolSize: 14,
                                symbolShape: 'circle',
                                effects: [
                                    {
                                        on: 'hover',
                                        style: {
                                            itemTextColor: 'hsl(var(--primary))'
                                        }
                                    }
                                ]
                            }
                        ]}
                        motionConfig="wobbly"
                        transitionMode="pushIn"
                    />
                  </div>
                </div>
                <div className="neu-card p-6 lg:p-8 flex flex-col items-center">
                  <h3 className="font-heading font-semibold text-foreground mb-4 text-center">Comparativo</h3>
                  <div className="w-full h-[320px]">
                    <ResponsiveBar
                        data={barData}
                        keys={['value']}
                        indexBy="name"
                        margin={{ top: 20, right: 10, bottom: 40, left: 50 }}
                        padding={0.3}
                        valueScale={{ type: 'linear' }}
                        indexScale={{ type: 'band', round: true }}
                        colors={{ datum: 'data.color' }}
                        borderRadius={4}
                        borderColor={{
                            from: 'color',
                            modifiers: [['darker', 1.6]]
                        }}
                        axisTop={null}
                        axisRight={null}
                        axisBottom={{
                            tickSize: 5,
                            tickPadding: 5,
                            tickRotation: 0,
                        }}
                        axisLeft={{
                            tickSize: 5,
                            tickPadding: 5,
                            tickRotation: 0,
                            format: value => `R$${value > 1000 ? (value/1000).toFixed(0) + 'k' : value}`,
                            tickValues: 5,
                        }}
                        enableLabel={false}
                        theme={nivoTheme}
                        tooltip={({ id, value, color, indexValue }) => (
                            <div className="bg-card text-card-foreground p-3 rounded-xl shadow-md border text-sm font-medium flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                                <span>{indexValue}:</span>
                                <span className="font-bold">{formatCurrencyDisplay(Number(value))}</span>
                            </div>
                        )}
                        role="application"
                        ariaLabel="Comparativo Financeiro"
                        motionConfig="wobbly"
                    />
                  </div>
                </div>
              </div>

              <div className="neu-card p-6 mb-6">
                <h3 className="font-heading font-semibold text-foreground mb-4 text-center">Resumo</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {[
                    { label: "Renda", value: renda, color: "text-primary" },
                    { label: "Gastos Fixos", value: gastosFixos, color: "text-foreground" },
                    { label: "Gastos Variáveis", value: gastosVariaveis, color: "text-raspberry" },
                    { label: "Dívidas", value: dividas, color: "text-magenta" },
                    { label: "Investimentos", value: investimentos, color: "text-secondary" },
                    { label: "Saldo Livre", value: saldo, color: saldo >= 0 ? "text-primary" : "text-destructive" },
                  ].map((item) => (
                    <div key={item.label} className="text-center">
                      <p className="text-sm text-muted-foreground">{item.label}</p>
                      <p className={`font-heading font-bold text-lg ${item.color}`}>{formatCurrencyDisplay(item.value)}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap gap-4 justify-center">
                <button
                  onClick={() => window.location.href = '/dashboard'}
                  className="btn-primary-serasa flex items-center gap-2 px-8"
                >
                  Continuar para o Dashboard
                </button>
              </div>
            </div>
          </ScrollReveal>
        )}
      </div>
    </section>
  );
}

const AlertsPanel = ({ renda, gastosFixos, gastosVariaveis }: { renda: number; gastosFixos: number; gastosVariaveis: number }) => {
  if (renda <= 0) return null;
  const fixosPct = (gastosFixos / renda) * 100;
  const varPct = (gastosVariaveis / renda) * 100;
  const alerts: { msg: string; level: "warning" | "danger" }[] = [];

  if (fixosPct > 60) alerts.push({ msg: "Atenção, seus gastos fixos estão muito altos.", level: "danger" });
  else if (fixosPct >= 51) alerts.push({ msg: "Cuidado, seus gastos fixos estão no limite.", level: "warning" });

  if (varPct > 40) alerts.push({ msg: "Atenção, seus gastos variáveis estão muito altos, é preciso encontrar uma maneira de reduzi-los.", level: "danger" });
  else if (varPct >= 31) alerts.push({ msg: "Cuidado, seus gastos variáveis estão no limite.", level: "warning" });

  if (alerts.length === 0) return (
    <div className="mb-6 p-4 neu-card flex items-center gap-3 text-primary">
      <CheckCircle size={22} />
      <span className="font-medium">Seus gastos parecem equilibrados. Continue assim!</span>
    </div>
  );

  return (
    <div className="mb-6 flex flex-col gap-3">
      {alerts.map((a, i) => (
        <div key={i} className={`p-4 rounded-xl flex items-center gap-3 font-medium ${
          a.level === "danger" ? "bg-destructive/10 text-destructive" : "bg-magenta/10 text-magenta"
        }`}>
          <AlertTriangle size={22} />
          <span>{a.msg}</span>
        </div>
      ))}
    </div>
  );
};
