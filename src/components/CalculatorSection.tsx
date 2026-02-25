import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { Download, AlertTriangle, CheckCircle } from "lucide-react";
import * as XLSX from "xlsx";
import ScrollReveal from "./ScrollReveal";

const COLORS = {
  primary: "hsl(213, 66%, 34%)",
  light: "hsl(213, 43%, 46%)",
  secondary: "hsl(298, 75%, 28%)",
  raspberry: "hsl(320, 79%, 43%)",
  magenta: "hsl(331, 100%, 45%)",
  muted: "hsl(220, 14%, 75%)",
};

interface FormData {
  renda: number;
  gastosFixos: number;
  gastosVariaveis: number;
  dividas: number;
  investimentos: number;
  wantsXlsx: boolean | null;
}

const CalculatorSection = () => {
  const [step, setStep] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [form, setForm] = useState<FormData>({
    renda: 0,
    gastosFixos: 0,
    gastosVariaveis: 0,
    dividas: 0,
    investimentos: 0,
    wantsXlsx: null,
  });

  const questions = [
    { key: "renda" as const, label: "Qual é a sua renda mensal total?", icon: "💰" },
    { key: "gastosFixos" as const, label: "Qual o valor dos seus gastos fixos mensais?", icon: "🏠" },
    { key: "gastosVariaveis" as const, label: "Qual o valor dos seus gastos variáveis mensais?", icon: "🛒" },
    { key: "dividas" as const, label: "Qual o valor total das suas dívidas?", icon: "📋" },
    { key: "investimentos" as const, label: "Quanto você investe por mês?", icon: "📈" },
  ];

  const handleSubmit = () => {
    if (step < questions.length) {
      setStep(step + 1);
    } else if (form.wantsXlsx === null) {
      return;
    } else {
      setShowResults(true);
    }
  };

  const saldo = form.renda - form.gastosFixos - form.gastosVariaveis - form.investimentos;

  const pieData = useMemo(() => [
    { name: "Gastos Fixos", value: form.gastosFixos },
    { name: "Gastos Variáveis", value: form.gastosVariaveis },
    { name: "Investimentos", value: form.investimentos },
    { name: "Saldo Livre", value: Math.max(0, saldo) },
  ], [form, saldo]);

  const barData = useMemo(() => [
    { name: "Renda", value: form.renda },
    { name: "G. Fixos", value: form.gastosFixos },
    { name: "G. Variáveis", value: form.gastosVariaveis },
    { name: "Dívidas", value: form.dividas },
    { name: "Investimentos", value: form.investimentos },
  ], [form]);

  const pieColors = [COLORS.primary, COLORS.raspberry, COLORS.secondary, COLORS.light];

  const downloadXlsx = () => {
    const ws = XLSX.utils.json_to_sheet([
      { Categoria: "Renda Mensal", "Valor (R$)": form.renda },
      { Categoria: "Gastos Fixos", "Valor (R$)": form.gastosFixos },
      { Categoria: "Gastos Variáveis", "Valor (R$)": form.gastosVariaveis },
      { Categoria: "Dívidas Totais", "Valor (R$)": form.dividas },
      { Categoria: "Investimentos", "Valor (R$)": form.investimentos },
      { Categoria: "Saldo Livre", "Valor (R$)": saldo },
      { Categoria: "% Gastos Fixos", "Valor (R$)": form.renda > 0 ? ((form.gastosFixos / form.renda) * 100).toFixed(1) + "%" : "0%" },
      { Categoria: "% Gastos Variáveis", "Valor (R$)": form.renda > 0 ? ((form.gastosVariaveis / form.renda) * 100).toFixed(1) + "%" : "0%" },
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Análise Financeira");
    XLSX.writeFile(wb, "DebtView_Analise.xlsx");
  };

  const formatCurrency = (v: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

  const currentValue = step < questions.length ? form[questions[step].key] : 0;

  return (
    <section id="calculator" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <ScrollReveal>
          <h2 className="fluid-title-lg font-heading font-bold text-center text-foreground mb-4">
            Calculadora Financeira
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-xl mx-auto fluid-body">
            Responda algumas perguntas para analisar sua situação financeira
          </p>
        </ScrollReveal>

        {!showResults ? (
          <ScrollReveal>
            <div className="max-w-lg mx-auto">
              {step < questions.length ? (
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  className="neu-card p-8"
                >
                  <div className="text-center mb-6">
                    <span className="text-4xl mb-3 block">{questions[step].icon}</span>
                    <h3 className="font-heading font-semibold text-lg text-foreground">{questions[step].label}</h3>
                    <p className="text-sm text-muted-foreground mt-1">Pergunta {step + 1} de {questions.length + 1}</p>
                  </div>
                  <div className="flex flex-col gap-4">
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">R$</span>
                      <input
                        type="number"
                        min={0}
                        max={1000000000}
                        value={currentValue || ""}
                        onChange={(e) => {
                          const val = Math.min(Number(e.target.value), 1000000000);
                          setForm({ ...form, [questions[step].key]: val });
                        }}
                        className="neu-btn w-full py-4 pl-12 pr-4 text-lg font-semibold text-foreground outline-none focus:ring-2 focus:ring-primary"
                        placeholder="0,00"
                      />
                    </div>
                    <div className="flex gap-3">
                      {step > 0 && (
                        <button onClick={() => setStep(step - 1)} className="btn-light-blue-serasa flex-1">
                          Voltar
                        </button>
                      )}
                      <button onClick={handleSubmit} className="btn-primary-serasa flex-1">
                        Próximo
                      </button>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="neu-card p-8"
                >
                  <div className="text-center mb-6">
                    <span className="text-4xl mb-3 block">📊</span>
                    <h3 className="font-heading font-semibold text-lg text-foreground">
                      Você deseja uma planilha digital com os dados informados? (.xlsx)
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">Pergunta {questions.length + 1} de {questions.length + 1}</p>
                  </div>
                  <div className="flex gap-4 justify-center mb-6">
                    <button
                      onClick={() => setForm({ ...form, wantsXlsx: true })}
                      className={`neu-btn px-8 py-3 font-semibold transition-all duration-300 ${
                        form.wantsXlsx === true ? "ring-2 ring-primary bg-primary/10 text-primary" : "text-foreground"
                      }`}
                    >
                      Sim
                    </button>
                    <button
                      onClick={() => setForm({ ...form, wantsXlsx: false })}
                      className={`neu-btn px-8 py-3 font-semibold transition-all duration-300 ${
                        form.wantsXlsx === false ? "ring-2 ring-primary bg-primary/10 text-primary" : "text-foreground"
                      }`}
                    >
                      Não
                    </button>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => setStep(step - 1)} className="btn-light-blue-serasa flex-1">
                      Voltar
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={form.wantsXlsx === null}
                      className="btn-primary-serasa flex-1 disabled:opacity-50"
                    >
                      Ver Resultados
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Progress bar */}
              <div className="mt-6 h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: `linear-gradient(90deg, ${COLORS.primary}, ${COLORS.raspberry})` }}
                  animate={{ width: `${((step + 1) / (questions.length + 1)) * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>
          </ScrollReveal>
        ) : (
          <ScrollReveal>
            <div className="max-w-4xl mx-auto">
              {/* Alerts */}
              <AlertsPanel renda={form.renda} gastosFixos={form.gastosFixos} gastosVariaveis={form.gastosVariaveis} />

              {/* Charts */}
              <div className="grid md:grid-cols-2 gap-8 mb-8">
                <div className="neu-card p-6">
                  <h3 className="font-heading font-semibold text-foreground mb-4 text-center">Distribuição</h3>
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                        {pieData.map((_, i) => (
                          <Cell key={i} fill={pieColors[i % pieColors.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v: number) => formatCurrency(v)} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="neu-card p-6">
                  <h3 className="font-heading font-semibold text-foreground mb-4 text-center">Comparativo</h3>
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={barData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 85%)" />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip formatter={(v: number) => formatCurrency(v)} />
                      <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                        {barData.map((_, i) => (
                          <Cell key={i} fill={Object.values(COLORS)[i % 5]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Summary */}
              <div className="neu-card p-6 mb-6">
                <h3 className="font-heading font-semibold text-foreground mb-4 text-center">Resumo</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {[
                    { label: "Renda", value: form.renda, color: "text-primary" },
                    { label: "Gastos Fixos", value: form.gastosFixos, color: "text-foreground" },
                    { label: "Gastos Variáveis", value: form.gastosVariaveis, color: "text-raspberry" },
                    { label: "Dívidas", value: form.dividas, color: "text-magenta" },
                    { label: "Investimentos", value: form.investimentos, color: "text-secondary" },
                    { label: "Saldo Livre", value: saldo, color: saldo >= 0 ? "text-primary" : "text-destructive" },
                  ].map((item) => (
                    <div key={item.label} className="text-center">
                      <p className="text-sm text-muted-foreground">{item.label}</p>
                      <p className={`font-heading font-bold text-lg ${item.color}`}>{formatCurrency(item.value)}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap gap-4 justify-center">
                {form.wantsXlsx && (
                  <button onClick={downloadXlsx} className="btn-primary-serasa flex items-center gap-2">
                    <Download size={18} />
                    Baixar Planilha (.xlsx)
                  </button>
                )}
                <button
                  onClick={() => { setShowResults(false); setStep(0); setForm({ renda: 0, gastosFixos: 0, gastosVariaveis: 0, dividas: 0, investimentos: 0, wantsXlsx: null }); }}
                  className="btn-light-blue-serasa"
                >
                  Recalcular
                </button>
              </div>
            </div>
          </ScrollReveal>
        )}
      </div>
    </section>
  );
};

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

export default CalculatorSection;
