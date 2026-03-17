"use client";

import { useMemo, useState } from "react";
import { ResponsivePie } from "@nivo/pie";
import { ResponsiveBar } from "@nivo/bar";
import { 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp, 
  Wallet, 
  ArrowDownCircle, 
  Target,
  Edit2,
  Check
} from "lucide-react";
import { motion } from "framer-motion";

interface FinancialData {
  divida: number[];
  rendaFixa: number[];
  rendaVariavel: number[];
  gastosFixos: number[];
  gastosVariaveis: number[];
  investimentos: number[];
}

interface Props {
  data: FinancialData;
}

// Paleta Oficial Serasa Experian
const COLORS = {
  darkBlue: "#1D4F91",
  lightBlue: "#426DA9",
  purple: "#77127B",
  raspberry: "#C1188B",
  magenta: "#E80070",
};

export default function ResultsSection({ data }: Props) {
  const sum = (arr: number[]) => arr.reduce((a, b) => a + b, 0);

  // Estados interativos para edição
  const [isEditing, setIsEditing] = useState(false);
  const [valores, setValores] = useState({
    rendaFixa: sum(data.rendaFixa),
    rendaVariavel: sum(data.rendaVariavel),
    gastosFixos: sum(data.gastosFixos),
    gastosVariaveis: sum(data.gastosVariaveis),
    dividas: sum(data.divida),
    investimentos: sum(data.investimentos),
  });

  const rendaTotal = valores.rendaFixa + valores.rendaVariavel;
  const saldo = rendaTotal - valores.gastosFixos - valores.gastosVariaveis - valores.investimentos;

  // Função para lidar com as edições mantendo a proporção de renda fixa/variável
  const handleValueChange = (field: string, newValue: number) => {
    const val = isNaN(newValue) ? 0 : newValue;
    
    if (field === "renda") {
      const oldRenda = valores.rendaFixa + valores.rendaVariavel;
      if (oldRenda === 0) {
        setValores((prev) => ({ ...prev, rendaFixa: val, rendaVariavel: 0 }));
      } else {
        const fixaRatio = valores.rendaFixa / oldRenda;
        setValores((prev) => ({
          ...prev,
          rendaFixa: val * fixaRatio,
          rendaVariavel: val * (1 - fixaRatio),
        }));
      }
    } else {
      setValores((prev) => ({ ...prev, [field]: val }));
    }
  };

  // Gráfico de Pizza
  const pieData = useMemo(() => [
    { id: "Renda Fixa", label: "Renda Fixa", value: valores.rendaFixa, color: COLORS.lightBlue },
    { id: "Renda Variável", label: "Renda Variável", value: valores.rendaVariavel, color: COLORS.darkBlue },
    { id: "Gastos Fixos", label: "Gastos Fixos", value: valores.gastosFixos, color: COLORS.magenta },
    { id: "Gastos Variáveis", label: "Gastos Variáveis", value: valores.gastosVariaveis, color: COLORS.magenta },
    { id: "Investimentos", label: "Investimentos", value: valores.investimentos, color: COLORS.purple },
  ].filter(item => item.value > 0), [valores]);

  // Gráfico de Barras: Saldo Livre posicionado antes de Dívidas
  const barData = useMemo(() => [
    { name: "Renda", value: rendaTotal, color: COLORS.darkBlue },
    { name: "G. Fixos", value: valores.gastosFixos, color: COLORS.magenta },
    { name: "G. Variáveis", value: valores.gastosVariaveis, color: COLORS.magenta },
    { name: "Invest.", value: valores.investimentos, color: COLORS.purple },
    { name: "Saldo Livre", value: saldo, color: COLORS.lightBlue },
    { name: "Dívidas", value: valores.dividas, color: COLORS.raspberry },
  ], [rendaTotal, valores, saldo]);

  const formatCurrency = (v: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

  // Tema customizado para os gráficos
  const nivoTheme = {
    text: { fontSize: 13, fontWeight: "bold", fill: "#8b95a1" },
    axis: { ticks: { text: { fontSize: 12, fontWeight: "bold", fill: "#8b95a1" } } },
    grid: { line: { stroke: "#e5e7eb", strokeWidth: 1, strokeDasharray: "4 4" } },
    tooltip: { container: { background: "#1D4F91", color: "#ffffff", fontSize: 14, fontWeight: "bold", borderRadius: "8px", boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" } }
  };

  const summaryItems = [
    { id: "renda", label: "Renda Total", value: rendaTotal, color: "text-[#1D4F91] dark:text-[#426DA9]", bg: "bg-[#1D4F91]/10 dark:bg-[#1D4F91]/20", icon: <TrendingUp size={18}/>, editable: true },
    { id: "gastosFixos", label: "Gastos Fixos", value: valores.gastosFixos, color: "text-[#E80070]", bg: "bg-[#E80070]/10 dark:bg-[#E80070]/20", icon: <ArrowDownCircle size={18}/>, editable: true },
    { id: "gastosVariaveis", label: "Gastos Variáveis", value: valores.gastosVariaveis, color: "text-[#E80070]", bg: "bg-[#E80070]/10 dark:bg-[#E80070]/20", icon: <ArrowDownCircle size={18}/>, editable: true },
    { id: "dividas", label: "Dívidas", value: valores.dividas, color: "text-[#C1188B]", bg: "bg-[#C1188B]/10 dark:bg-[#C1188B]/20", icon: <AlertTriangle size={18}/>, editable: true },
    { id: "investimentos", label: "Investimentos", value: valores.investimentos, color: "text-[#77127B]", bg: "bg-[#77127B]/10 dark:bg-[#77127B]/20", icon: <Target size={18}/>, editable: true },
    { id: "saldo", label: "Saldo Livre", value: saldo, color: saldo >= 0 ? "text-[#426DA9]" : "text-[#E80070]", bg: saldo >= 0 ? "bg-[#426DA9]/10 dark:bg-[#426DA9]/20" : "bg-[#E80070]/10 dark:bg-[#E80070]/20", icon: <Wallet size={18}/>, editable: false },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col gap-8 transition-colors duration-300">
      
      {/* Alertas */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
        <AlertsPanel renda={rendaTotal} gastosFixos={valores.gastosFixos} gastosVariaveis={valores.gastosVariaveis} />
      </motion.div>

      {/* Grid dos Gráficos */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Gráfico de Pizza */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 flex flex-col items-center relative overflow-hidden transition-colors duration-300">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#1D4F91] to-[#426DA9]" />
          <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 w-full text-left">Distribuição</h3>
          <div className="w-full h-[350px]">
            <ResponsivePie data={pieData} colors={{ datum: 'data.color' }} innerRadius={0.65} padAngle={2} cornerRadius={8} activeOuterRadiusOffset={8} margin={{ top: 20, right: 20, bottom: 20, left: 20 }} enableArcLinkLabels={false} arcLabelsSkipAngle={10} arcLabelsTextColor="#ffffff" theme={nivoTheme} />
          </div>
          <div className="flex flex-wrap justify-center gap-4 mt-4 w-full">
            {pieData.map(item => (
              <div key={item.id} className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300">
                <span className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: item.color }} />
                {item.label}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Gráfico de Barras */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }} className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 flex flex-col items-center relative overflow-hidden transition-colors duration-300">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#77127B] to-[#E80070]" />
          <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 w-full text-left">Comparativo Geral</h3>
          <div className="w-full h-[350px]">
            <ResponsiveBar data={barData} keys={["value"]} indexBy="name" margin={{ top: 20, right: 20, bottom: 50, left: 60 }} padding={0.4} valueScale={{ type: 'linear' }} colors={({ data }) => data.color} borderRadius={6} axisBottom={{ tickSize: 0, tickPadding: 15, tickRotation: 0 }} axisLeft={{ tickSize: 0, tickPadding: 10, tickRotation: 0, format: (value) => `R$ ${value >= 1000 ? (value / 1000) + 'k' : value}` }} enableLabel={false} theme={nivoTheme} />
          </div>
        </motion.div>
      </div>

      {/* Grid de Resumo */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }} className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 p-8 transition-colors duration-300">
        
        {/* Cabeçalho do Resumo com Botão de Edição */}
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
            <Wallet className="text-[#426DA9] dark:text-[#1D4F91]" size={28} />
            Resumo Financeiro
          </h3>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors font-bold text-sm ${
              isEditing 
                ? "bg-[#1D4F91] text-white hover:bg-[#1D4F91]/90" 
                : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
            }`}
          >
            {isEditing ? <Check size={16} /> : <Edit2 size={16} />}
            {isEditing ? "Concluir" : "Editar"}
          </button>
        </div>

        {/* Cards de Valores */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {summaryItems.map((item) => (
            <motion.div 
              whileHover={!isEditing ? { scale: 1.05, y: -5 } : {}}
              key={item.label} 
              className={`p-4 rounded-2xl flex flex-col justify-center items-center text-center transition-all ${item.bg}`}
            >
              <div className={`mb-2 ${item.color}`}>
                {item.icon}
              </div>
              <p className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                {item.label}
              </p>
              
              {/* Input Dinâmico vs Texto Estático */}
              {isEditing && item.editable ? (
                <div className="w-full relative mt-1">
                  <span className={`absolute left-0 top-1/2 -translate-y-1/2 text-sm ${item.color} opacity-70`}>R$</span>
                  <input
                    type="number"
                    value={item.value}
                    onChange={(e) => handleValueChange(item.id, parseFloat(e.target.value))}
                    className={`w-full bg-transparent border-b-2 border-current outline-none text-center font-bold text-lg pl-6 pr-2 ${item.color} focus:border-opacity-100 border-opacity-30`}
                  />
                </div>
              ) : (
                <p className={`font-bold text-lg ${item.color}`}>
                  {formatCurrency(item.value)}
                </p>
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>

    </div>
  );
}

function AlertsPanel({
  renda,
  gastosFixos,
  gastosVariaveis
}: {
  renda: number;
  gastosFixos: number;
  gastosVariaveis: number;
}) {
  if (renda <= 0) return null;

  const fixosPct = (gastosFixos / renda) * 100;
  const varPct = (gastosVariaveis / renda) * 100;

  const alerts: { msg: string; level: "warning" | "danger" }[] = [];

  if (fixosPct > 60)
    alerts.push({ msg: `Atenção: Seus gastos fixos comprometem ${fixosPct.toFixed(0)}% da sua renda. O ideal é manter até 50%.`, level: "danger" });
  else if (fixosPct >= 51)
    alerts.push({ msg: "Cuidado: Seus gastos fixos estão próximos do limite recomendado.", level: "warning" });

  if (varPct > 40)
    alerts.push({ msg: `Atenção: Seus gastos variáveis representam ${varPct.toFixed(0)}% da renda. O ideal é focar em 30%.`, level: "danger" });
  else if (varPct >= 31)
    alerts.push({ msg: "Cuidado: Tente reduzir um pouco os gastos variáveis para ter mais folga.", level: "warning" });

  if (alerts.length === 0)
    return (
      <div className="bg-gradient-to-r from-[#1D4F91] to-[#426DA9] p-6 rounded-2xl shadow-lg flex items-center gap-4 text-white">
        <div className="bg-white/20 p-3 rounded-full">
          <CheckCircle size={28} />
        </div>
        <div>
          <h4 className="font-bold text-xl mb-1">Tudo certo por aqui!</h4>
          <span className="font-bold text-white/90">
            Seus gastos parecem equilibrados em relação à sua renda. Continue assim!
          </span>
        </div>
      </div>
    );

  return (
    <div className="flex flex-col gap-4">
      {alerts.map((a, i) => (
        <div
          key={i}
          className={`p-6 rounded-2xl shadow-md flex items-center gap-4 font-bold border-l-8 dark:bg-gray-800 ${
            a.level === "danger"
              ? "bg-[#E80070]/10 border-[#E80070] text-[#E80070]"
              : "bg-[#C1188B]/10 border-[#C1188B] text-[#C1188B]"
          }`}
        >
          <div className={a.level === "danger" ? "text-[#E80070]" : "text-[#C1188B]"}>
            <AlertTriangle size={28} />
          </div>
          <span className="text-lg text-gray-800 dark:text-gray-200">{a.msg}</span>
        </div>
      ))}
    </div>
  );
}