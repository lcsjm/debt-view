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
  onSave?: (valores: {
    rendaFixa: number;
    rendaVariavel: number;
    gastosFixos: number;
    gastosVariaveis: number;
    dividas: number;
    investimentos: number;
  }) => void;
}

// Paleta Oficial Serasa Experian
const COLORS = {
  darkBlue: "#1D4F91",
  lightBlue: "#426DA9",
  purple: "#77127B",
  raspberry: "#C1188B",
  magenta: "#E80070",
};

export default function ResultsSection({ data, onSave }: Props) {
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

  // Função para testar inputs manuais de forma segura, com fallback
  const handleValueChange = (field: string, newValue: number) => {
    const val = isNaN(newValue) || newValue < 0 ? 0 : newValue;
    
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

  // Gráfico de Barras: Saldo posicionado antes de Dívidas
  const barData = useMemo(() => [
    { name: "Renda", value: rendaTotal, color: COLORS.darkBlue },
    { name: "G. Fixos", value: valores.gastosFixos, color: COLORS.magenta },
    { name: "G. Var.", value: valores.gastosVariaveis, color: COLORS.magenta },
    { name: "Invest.", value: valores.investimentos, color: COLORS.purple },
    { name: "Saldo", value: saldo, color: saldo >= 0 ? COLORS.lightBlue : "#ef4444" },
    { name: "Dívidas", value: valores.dividas, color: COLORS.raspberry },
  ], [rendaTotal, valores, saldo]);

  // Se houver saldo negativo, garante um respiro no fundo do gráfico
  // para a barra negativa não sobrepor o texto do eixo X
  const minChartValue = saldo < 0 ? saldo * 1.3 : 0;

  const formatCurrency = (v: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

  // Tema customizado Premium para os gráficos
  const nivoTheme = {
    text: { fontSize: 13, fontWeight: 600, fill: "#6B7280", fontFamily: "inherit" },
    axis: {
      domain: { line: { stroke: "transparent" } },
      ticks: { line: { stroke: "transparent" }, text: { fontSize: 13, fontWeight: 600, fill: "#6B7280", fontFamily: "inherit" } }
    },
    grid: { line: { stroke: "#E5E7EB", strokeWidth: 1, strokeDasharray: "4 4" } },
    labels: { text: { fontSize: 13, fontWeight: "bold", fill: "#ffffff", fontFamily: "inherit", textShadow: "0px 1px 2px rgba(0,0,0,0.5)" } },
    tooltip: { container: { background: "rgba(255, 255, 255, 0.95)", backdropFilter: "blur(8px)", color: "#1F2937", fontSize: 14, fontWeight: "bold", borderRadius: "12px", boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)", padding: "12px 16px", border: "1px solid #F3F4F6"} }
  };

  const CustomTooltipPie = ({ datum }: any) => (
    <div className="bg-white/95 backdrop-blur-sm dark:bg-gray-800/95 dark:border-gray-700 px-4 py-3 shadow-xl rounded-xl border border-gray-100 flex items-center gap-3 whitespace-nowrap">
      <span className="w-3.5 h-3.5 rounded-full shadow-sm shrink-0" style={{ backgroundColor: datum.color }} />
      <strong className="text-gray-800 dark:text-gray-200 font-semibold">{datum.id}:</strong>
      <span className="text-gray-600 dark:text-gray-400 font-medium">{formatCurrency(datum.value)}</span>
    </div>
  );

  const CustomTooltipBar = ({ indexValue, value, color }: any) => (
    <div className="bg-white/95 backdrop-blur-sm dark:bg-gray-800/95 dark:border-gray-700 px-4 py-3 shadow-xl rounded-xl border border-gray-100 flex items-center gap-3 whitespace-nowrap">
      <span className="w-3.5 h-3.5 rounded-full shadow-sm shrink-0" style={{ backgroundColor: color }} />
      <strong className="text-gray-800 dark:text-gray-200 font-semibold">{indexValue}:</strong>
      <span className="text-gray-600 dark:text-gray-400 font-medium">{formatCurrency(value)}</span>
    </div>
  );

  const summaryItems = [
    { id: "renda", label: "Renda Total", value: rendaTotal, color: "text-[#1D4F91] dark:text-[#426DA9]", bg: "bg-[#1D4F91]/10 dark:bg-[#1D4F91]/20", icon: <TrendingUp size={22}/>, editable: true },
    { id: "gastosFixos", label: "Gastos Fixos", value: valores.gastosFixos, color: "text-[#E80070]", bg: "bg-[#E80070]/10 dark:bg-[#E80070]/20", icon: <ArrowDownCircle size={22}/>, editable: true },
    { id: "gastosVariaveis", label: "Gastos Variáveis", value: valores.gastosVariaveis, color: "text-[#E80070]", bg: "bg-[#E80070]/10 dark:bg-[#E80070]/20", icon: <ArrowDownCircle size={22}/>, editable: true },
    { id: "dividas", label: "Dívidas", value: valores.dividas, color: "text-[#C1188B]", bg: "bg-[#C1188B]/10 dark:bg-[#C1188B]/20", icon: <AlertTriangle size={22}/>, editable: true },
    { id: "investimentos", label: "Investimentos", value: valores.investimentos, color: "text-[#77127B]", bg: "bg-[#77127B]/10 dark:bg-[#77127B]/20", icon: <Target size={22}/>, editable: true },
    { id: "saldo", label: "Saldo Livre", value: saldo, color: saldo >= 0 ? "text-[#426DA9]" : "text-[#E80070]", bg: saldo >= 0 ? "bg-[#426DA9]/10 dark:bg-[#426DA9]/20" : "bg-[#E80070]/10 dark:bg-[#E80070]/20", icon: <Wallet size={22}/>, editable: false },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col gap-10 transition-colors duration-300">
      
      {/* Alertas */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
        <AlertsPanel renda={rendaTotal} gastosFixos={valores.gastosFixos} gastosVariaveis={valores.gastosVariaveis} saldo={saldo} />
      </motion.div>

      {/* Grid dos Gráficos */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Gráfico de Pizza */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.2 }} className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 flex flex-col items-center relative transition-colors duration-300 group hover:shadow-2xl">
          <div className="absolute top-0 left-0 w-full h-1.5 rounded-t-3xl bg-gradient-to-r from-[#1D4F91] to-[#426DA9] opacity-80 group-hover:opacity-100 transition-opacity" />
          <h3 className="text-2xl font-extrabold text-gray-800 dark:text-white mb-6 w-full text-left tracking-tight">Distribuição da Renda</h3>
          <div className="w-full h-[380px]">
            <ResponsivePie 
              data={pieData} 
              colors={{ datum: 'data.color' }} 
              innerRadius={0.65} 
              padAngle={2} 
              cornerRadius={8} 
              activeOuterRadiusOffset={10} 
              margin={{ top: 20, right: 20, bottom: 20, left: 20 }} 
              enableArcLinkLabels={false} 
              arcLabelsSkipAngle={10} 
              arcLabelsTextColor="#ffffff" 
              theme={nivoTheme} 
              tooltip={CustomTooltipPie}
              animate={true}
              motionConfig="gentle"
            />
          </div>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-3 mt-6 w-full px-4">
            {pieData.map(item => (
              <div key={item.id} className="flex items-center gap-2.5 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors cursor-default">
                <span className="w-3.5 h-3.5 rounded-full shadow-sm" style={{ backgroundColor: item.color }} />
                {item.label}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Gráfico de Barras */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.3 }} className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 flex flex-col items-center relative transition-colors duration-300 group hover:shadow-2xl">
          <div className="absolute top-0 left-0 w-full h-1.5 rounded-t-3xl bg-gradient-to-r from-[#77127B] to-[#E80070] opacity-80 group-hover:opacity-100 transition-opacity" />
          <h3 className="text-2xl font-extrabold text-gray-800 dark:text-white mb-6 w-full text-left tracking-tight">Comparativo Geral</h3>
          <div className="w-full h-[380px]">
            <ResponsiveBar 
              data={barData} 
              keys={["value"]} 
              indexBy="name" 
              margin={{ top: 20, right: 20, bottom: 70, left: 60 }} 
              padding={0.3} 
              valueScale={{ type: 'linear', min: minChartValue }} 
              colors={({ data }) => data.color} 
              borderRadius={4} 
              axisBottom={{ tickSize: 0, tickPadding: 15, tickRotation: -35 }} 
              axisLeft={{ 
                tickSize: 0, 
                tickPadding: 12, 
                tickRotation: 0, 
                format: (value) => `R$ ${value >= 1000 ? (value / 1000).toFixed(0) + 'k' : value}` 
              }} 
              enableLabel={true}
              labelSkipHeight={20}
              labelTextColor="#ffffff"
              theme={nivoTheme} 
              tooltip={CustomTooltipBar}
              animate={true}
              motionConfig="gentle"
            />
          </div>
        </motion.div>
      </div>

      {/* Grid de Resumo */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }} className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 p-8 lg:p-10 transition-colors duration-300 relative overflow-hidden">
        
        {/* Cabeçalho do Resumo com Botão de Edição */}
        <div className="flex justify-between items-center mb-10 relative z-10">
          <h3 className="text-3xl font-extrabold text-gray-800 dark:text-white flex items-center gap-4 tracking-tight">
            <div className="p-3 bg-[#426DA9]/10 dark:bg-[#1D4F91]/20 rounded-2xl">
              <Wallet className="text-[#426DA9] dark:text-[#426DA9]" size={36} />
            </div>
            Resumo Financeiro
          </h3>
          <button
            onClick={() => {
              if (isEditing && onSave) {
                // Ao salvar, passa os valores atualizados
                onSave(valores);
              }
              setIsEditing(!isEditing);
            }}
            className={`flex items-center gap-2.5 px-6 py-3 rounded-2xl transition-all duration-300 font-bold text-sm shadow-md hover:shadow-lg ${
              isEditing 
                ? "bg-gradient-to-r from-[#1D4F91] to-[#426DA9] text-white hover:scale-105" 
                : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 hover:scale-105"
            }`}
          >
            {isEditing ? <Check size={18} /> : <Edit2 size={18} />}
            {isEditing ? "Concluir Edição" : "Ajustar Valores"}
          </button>
        </div>

        {/* Cards de Valores */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-5 relative z-10">
          {summaryItems.map((item) => (
            <motion.div 
              whileHover={!isEditing ? { scale: 1.05, y: -5 } : {}}
              key={item.label} 
              className={`p-5 rounded-3xl flex flex-col justify-center items-center text-center transition-all shadow-sm border border-transparent hover:border-black/5 dark:hover:border-white/5 ${item.bg}`}
            >
              <div className={`mb-3 p-3 bg-white/50 dark:bg-black/20 rounded-2xl shadow-sm ${item.color}`}>
                {item.icon}
              </div>
              <p className="text-xs font-extrabold text-gray-600 dark:text-gray-400 uppercase tracking-widest mb-2 opacity-90">
                {item.label}
              </p>
              
              {/* Input Dinâmico vs Texto Estático */}
              {isEditing && item.editable ? (
                <div className="w-full relative mt-1 bg-white dark:bg-gray-800 rounded-xl px-2 py-1 shadow-inner border dark:border-gray-600">
                  <span className={`absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold ${item.color} opacity-80`}>R$</span>
                  <input
                    type="number"
                    value={item.value || ""}
                    onChange={(e) => handleValueChange(item.id, parseFloat(e.target.value))}
                    className={`w-full bg-transparent outline-none text-right font-bold text-lg pl-8 p-1 ${item.color}`}
                    placeholder="0"
                  />
                </div>
              ) : (
                <p className={`font-extrabold text-xl ${item.color} drop-shadow-sm`}>
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
  gastosVariaveis,
  saldo
}: {
  renda: number;
  gastosFixos: number;
  gastosVariaveis: number;
  saldo: number;
}) {
  if (renda <= 0) return null;

  const fixosPct = (gastosFixos / renda) * 100;
  const varPct = (gastosVariaveis / renda) * 100;

  const alerts: { msg: string; level: "warning" | "danger" }[] = [];

  if (fixosPct > 60)
    alerts.push({ msg: `Atenção: Seus gastos fixos comprometem ${fixosPct.toFixed(0)}% da sua renda. O ideal é manter até 50%.`, level: "danger" });
  else if (fixosPct >= 51)
    alerts.push({ msg: "Cuidado: Seus gastos fixos estão próximos do limite recomendado (50%).", level: "warning" });

  if (varPct > 40)
    alerts.push({ msg: `Atenção: Seus gastos variáveis representam ${varPct.toFixed(0)}% da renda. O ideal é focar em 30%.`, level: "danger" });
  else if (varPct >= 31)
    alerts.push({ msg: "Cuidado: Tente reduzir um pouco os gastos variáveis (limite superado de 30%).", level: "warning" });

  if (saldo < 0) {
    alerts.push({ msg: "Urgente: Você está fechando no vermelho. Priorize cortar gastos imediatamente e negocie dívidas.", level: "danger" });
  }

  if (alerts.length === 0)
    return (
      <div className="bg-gradient-to-r from-[#1D4F91] to-[#426DA9] p-8 rounded-3xl shadow-xl flex items-center gap-6 text-white overflow-hidden relative">
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl mix-blend-overlay"></div>
        <div className="bg-white/20 p-4 rounded-full shadow-inner animate-pulse">
          <CheckCircle size={36} className="text-white drop-shadow-md" />
        </div>
        <div>
          <h4 className="font-extrabold text-2xl mb-2 tracking-tight">Tudo certo por aqui!</h4>
          <p className="font-medium text-white/90 text-lg leading-relaxed">
            Seus gastos parecem equilibrados em relação à sua renda. Continue assim e não esqueça de investir!
          </p>
        </div>
      </div>
    );

  return (
    <div className="flex flex-col gap-5">
      {alerts.map((a, i) => (
        <div
          key={i}
          className={`p-6 md:p-8 rounded-3xl shadow-lg flex items-start gap-5 font-bold border-l-[10px] bg-white dark:bg-gray-800 transition-all hover:scale-[1.01] ${
            a.level === "danger"
              ? "border-[#E80070]"
              : "border-[#C1188B]"
          }`}
        >
          <div className={`p-3 rounded-2xl ${a.level === "danger" ? "bg-[#E80070]/10 text-[#E80070]" : "bg-[#C1188B]/10 text-[#C1188B]"}`}>
            <AlertTriangle size={32} />
          </div>
          <span className="text-lg md:text-xl text-gray-800 dark:text-gray-200 self-center leading-snug">{a.msg}</span>
        </div>
      ))}
    </div>
  );
}