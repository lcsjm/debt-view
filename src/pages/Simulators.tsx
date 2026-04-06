import { useState } from "react";
import * as XLSX from "xlsx-js-style";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ptBR } from "date-fns/locale/pt-BR";
import { useSimulators, DebtData } from "../hooks/useSimulators";
import {
  Trash2,
  Plus,
  Download,
  CreditCard,
  AlertCircle,
  Wallet,
  Target,
  Activity,
  Edit2,
  Filter,
  X,
  TrendingUp,
  Calculator,
  Calendar,
  RefreshCw,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { AppSidebar } from "@/components/AppSidebar";
import { toast } from "@/hooks/use-toast";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const simulatorschema = z.object({
  creditor: z.string().min(2, "Nome do credor obrigatório"),
  value: z
    .string()
    .min(1, "Obrigatório")
    .refine((v) => {
      const d = v.replace(/\D/g, "");
      return parseInt(d, 10) > 0;
    }, "Deve ser maior que zero"),
  downPayment: z.any().optional(),
  date: z.string().nullable(),
  rate: z.any(),
  year: z.enum(["Mensal", "Anual"]),
  type: z.enum(["Simples", "Composto"]),
  installments: z.any(),
  status: z.string().min(2, "Informe o status"),
});

type DebtForm = z.infer<typeof simulatorschema>;

const formatCurrencyInput = (value: string | number) => {
  const digits = String(value).replace(/\D/g, "");
  if (!digits) return "";
  const number = parseInt(digits, 10) / 100;
  return new Intl.NumberFormat("pt-BR", {
    style: "decimal",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(number);
};

const parseCurrencyInput = (value: string) => {
  const digits = (value || "").replace(/\D/g, "");
  if (!digits) return 0;
  return parseInt(digits, 10) / 100;
};

const getStatusStyle = (status: string) => {
  const styles: Record<string, string> = {
    Pago: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    Ativa:
      "bg-[#426DA9]/10 text-[#426DA9] dark:bg-[#426DA9]/20 dark:text-[#8CB4F5]",
    Negociando:
      "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    Pendente:
      "bg-[#E80070]/10 text-[#E80070] dark:bg-[#E80070]/20 dark:text-[#FF85BB]",
  };
  return styles[status] || styles["Pendente"];
};

const calculateEffectiveMonthlyRate = (
  rateDec: number,
  period: string,
  isCompound: boolean,
) => {
  if (period === "Anual") {
    return isCompound ?
      Math.pow(1 + rateDec, 1 / 12) - 1 : rateDec / 12;
  }
  return rateDec;
};

const calculateInstallment = (
  principal: number,
  monthlyRate: number,
  months: number,
  isCompound: boolean,
) => {
  if (months <= 0) return 0;
  if (isCompound) {
    if (monthlyRate === 0) return principal / months;
    const factor = Math.pow(1 + monthlyRate, months);
    return (principal * (monthlyRate * factor)) / (factor - 1);
  } else {
    const total = principal * (1 + monthlyRate * months);
    return total / months;
  }
};

const generateChartData = (
  principal: number,
  monthlyRate: number,
  months: number,
  isCompound: boolean,
  startDateStr: string | null,
) => {
  const chartData = [];
  const startDate = startDateStr ? new Date(startDateStr) : new Date();
  const installment = calculateInstallment(
    principal,
    monthlyRate,
    months,
    isCompound,
  );
  for (let i = 0; i <= months; i++) {
    let currentVal = principal;
    if (i > 0) {
      if (isCompound) {
        currentVal = principal * Math.pow(1 + monthlyRate, i);
      } else {
        currentVal = principal * (1 + monthlyRate * i);
      }
    }

    const stepDate = new Date(startDate);
    stepDate.setMonth(stepDate.getMonth() + i);
    const monthName = stepDate
      .toLocaleDateString("pt-BR", { month: "short" })
      .replace(".", "");
    const year = stepDate.getFullYear().toString().slice(-2);
    const dateLabel = `${monthName}/${year}`; // Ex: Jan/26

    chartData.push({
      index: i,
      name: i === 0 ? `Início (${dateLabel})` : `Parc. ${i} (${dateLabel})`,
      shortName: i === 0 ? "Início" : `P${i}`,
      valor: Number(currentVal.toFixed(2)),
      parcela: Number(installment.toFixed(2)),
    });
  }
  return chartData;
};

// Componente Customizado para o Tooltip do Gráfico
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const match = data.name.match(/\((.*?)\)/);
    const monthYear = match ? match[1] : data.name;
    const parcLabel = data.index === 0 ?
      "Início" : `Parcela ${data.index}`;

    return (
      <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-[#426DA9]/30 p-5 rounded-2xl shadow-xl shadow-[#1D4F91]/10">
        <p className="text-[#1D4F91] dark:text-[#8CB4F5] font-black text-sm mb-2 uppercase tracking-widest">
          {monthYear}
        </p>
        <p className="text-2xl font-black text-[#C1188B] dark:text-[#FF66A3] mb-1 flex items-end gap-2">
          {data.valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
            Saldo
          </span>
        </p>
        {data.parcela > 0 && (
          <p className="text-sm font-semibold text-[#426DA9] dark:text-[#8CB4F5] bg-[#426DA9]/10 py-1.5 px-3 rounded-lg inline-block mt-2">
            {parcLabel}: {data.parcela.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          </p>
         )}
      </div>
    );
  }
  return null;
};

export default function Simulators() {
  const [activeSection, setActiveSection] = useState("simulators");
  const [collapsed, setCollapsed] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("Todos");
  const [analysisData, setAnalysisData] = useState<any[] | null>(null);
  const [simulatedSummary, setSimulatedSummary] = useState<{ original: number; total: number } | null>(null);
  const { simulators, isLoading, saveDebt, updateDebt, isSaving, deleteDebt } = useSimulators();
  const {
    register,
    handleSubmit,
    control,
    reset,
    getValues,
    trigger,
    formState: { errors },
  } = useForm<DebtForm>({
    resolver: zodResolver(simulatorschema),
    defaultValues: {
      creditor: "",
      value: "",
      downPayment: undefined,
      date: new Date().toISOString(),
      rate: "0",
      year: "Mensal",
      type: "Composto",
      installments: "0",
      status: "Ativa",
    },
  });

  const clearAnalysis = () => {
    setAnalysisData(null);
    setSimulatedSummary(null);
  };

  const handleAnalyze = async () => {
    const isValid = await trigger([
      "value",
      "downPayment",
      "rate",
      "installments",
      "type",
      "date",
      "rate",
    ]);
    if (!isValid) return;

    const data = getValues();
    const principal = parseCurrencyInput(data.value);
    const downPayment = parseCurrencyInput(data.downPayment || "0");
    const financedpayment = principal - downPayment;

    const isCompound = data.type === "Composto";
    const months = parseInt(String(data.installments), 10);
    const rawRateDec = parseFloat(String(data.rate).replace(",", ".")) / 100;

    if (financedpayment <= 0) {
      toast({
        title: "Valor Inválido",
        description: "O valor de entrada não pode ser maior ou igual ao original.",
        variant: "destructive",
      });
      return;
    }

    if (months <= 0) {
      toast({
        title: "Valores inválidos para análise",
        variant: "destructive",
      });
      return;
    }

    const effectiveMonthlyRate = calculateEffectiveMonthlyRate(
      rawRateDec,
      data.year,
      isCompound,
    );
    const chartData = generateChartData(
      financedpayment,
      effectiveMonthlyRate,
      months,
      isCompound,
      data.date,
    );
    setAnalysisData(chartData);
    setSimulatedSummary({
      original: principal,
      total: chartData[chartData.length - 1].valor + downPayment,
    });
    toast({ title: "Análise gerada com sucesso! 📊" });
  };

  const onSubmit = async (data: DebtForm) => {
    const principal = parseCurrencyInput(data.value);
    const downPayment = parseCurrencyInput(data.downPayment || "0");
    const financedpayment = principal - downPayment;
    if (financedpayment <= 0) {
      toast({
        title: "Erro",
        description: "O valor financiado (Original - Entrada) deve ser maior que zero.",
        variant: "destructive",
      });
      return;
    }

    let finalpaymentValue = 0;
    if (analysisData) {
      finalpaymentValue = analysisData[analysisData.length - 1].valor - financedpayment;
    } else {
      const rawRateDec = parseFloat(String(data.rate).replace(",", ".")) / 100;
      const isCompound = data.type === "Composto";
      const months = parseInt(String(data.installments), 10);

      const effectiveRate = calculateEffectiveMonthlyRate(rawRateDec, data.year, isCompound);
      const chart = generateChartData(financedpayment, effectiveRate, months, isCompound, data.date);

      finalpaymentValue = chart[chart.length - 1].valor - financedpayment;
    }

    const startDate = new Date(data.date || new Date());
    try {
      const payload = {
        creditor: data.creditor,
        value: principal,
        downPayment: downPayment,
        payment: finalpaymentValue,
        rate: parseFloat(String(data.rate).replace(",", ".")),
        status: data.status,
        date: startDate.toISOString(),
        interest: data.type,
        interestType: data.type,
        year: data.year,
        installments: parseInt(String(data.installments), 10),
        ratePeriod: data.year,
      };
      if (editingId) {
        await updateDebt({ id: editingId, ...payload } as any);
      } else {
        await saveDebt(payload as any);
      }

      toast({
        title: editingId ? "Parcelamento atualizado! ✅" : "Parcelamento salvo com sucesso! ✅",
      });
      cancelEdit();
    } catch (e: any) {
      toast({
        title: "Erro ao salvar",
        description: e.message,
        variant: "destructive",
      });
    }
  };

  const handleEdit = (debt: any) => {
    setEditingId(debt.id || null);
    const formattedValue = formatCurrencyInput((debt.value * 100).toString());
    const formattedDownPayment = debt.downPayment
      ? formatCurrencyInput((debt.downPayment * 100).toString())
      : "";

    const instStr = debt.installments ? debt.installments.toString() : "12";
    const typeStr = debt.interestType || "Composto";
    const entryStr = debt.date || debt.date || new Date().toISOString();
    const periodStr = debt.ratePeriod || "Mensal";

    reset({
      creditor: debt.creditor,
      value: formattedValue,
      downPayment: formattedDownPayment,
      date: entryStr,
      rate: debt.rate ? debt.rate.toString() : "0",
      year: periodStr as "Mensal" | "Anual",
      type: typeStr as "Simples" | "Composto",
      installments: instStr,
      status: debt.status,
    });
    const principal = debt.value;
    const downPayment = debt.downPayment || 0;
    const financedpayment = principal - downPayment;
    const rawRateDec = debt.rate ? debt.rate / 100 : 0;
    const isCompound = typeStr === "Composto";
    const months = parseInt(instStr, 10);

    const effectiveRate = calculateEffectiveMonthlyRate(rawRateDec, periodStr, isCompound);
    const chartData = generateChartData(financedpayment, effectiveRate, months, isCompound, entryStr);

    setAnalysisData(chartData);
    setSimulatedSummary({
      original: principal,
      total: chartData[chartData.length - 1].valor + downPayment,
    });
    
    // Rolar suavemente para o formulário de edição
    setTimeout(() => {
      const element = document.getElementById("formulario-parcelamento");
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }, 100);
  };

  const cancelEdit = () => {
    setEditingId(null);
    clearAnalysis();
    reset({
      creditor: "",
      value: "",
      downPayment: "",
      date: new Date().toISOString(),
      rate: "",
      year: "Mensal",
      type: "Composto",
      installments: "12",
      status: "Ativa",
    });
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!window.confirm("Tem certeza que deseja excluir este parcelamento de forma permanente?")) return;
    try {
      await deleteDebt(id);
      toast({ title: "Parcelamento excluído." });
      if (editingId === id) cancelEdit();
    } catch (err: any) {
      toast({
        title: "Erro ao excluir",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  const exportToExcel = () => {
    if (!simulators || simulators.length === 0) {
      toast({
        title: "Nenhum parcelamento para exportar.",
        variant: "destructive",
      });
      return;
    }
    const worksheet = XLSX.utils.json_to_sheet(simulators);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Parcelamentos");
    XLSX.writeFile(workbook, "Meus_Parcelamentos.xlsx");
    toast({ title: "Relatório Excel gerado!" });
  };

  const totalParcelamentos =
    simulators?.reduce((acc, d) => {
      const financiado = (d.value || 0) - ((d as any).downPayment || 0);
      return acc + financiado + (d.payment || 0);
    }, 0) || 0;

  const statusPriority: Record<string, number> = {
    "Pendente": 1,
    "Negociando": 2,
    "Ativa": 3,
    "Pago": 4,
  };

  const filteredsimulators =
    (simulators?.filter((d) => filterStatus === "Todos" || d.status === filterStatus) || [])
    .sort((a, b) => {
      const priorityA = statusPriority[a.status] || 99;
      const priorityB = statusPriority[b.status] || 99;

      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }

      const creditorA = (a.creditor || "").toLowerCase();
      const creditorB = (b.creditor || "").toLowerCase();
      
      return creditorA.localeCompare(creditorB);
    });

  const handleStatusClick = (status: string) => {
    setFilterStatus(status);
    setTimeout(() => {
      const element = document.getElementById("lista-parcelamentos");
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 100);
  };

  // Inputs muito mais dinâmicos com hover, focus ring, sombras suaves e efeito de elevação
  const fieldClass =
    "w-full border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 rounded-xl px-4 py-3 text-slate-800 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 outline-none hover:bg-white/80 dark:hover:bg-slate-900/80 hover:border-[#426DA9]/50 focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-[#426DA9]/20 focus:border-[#426DA9] hover:shadow-md focus:shadow-lg focus:-translate-y-0.5 transition-all duration-300 text-sm backdrop-blur-md";
  
  // Classe semelhante para os wrappers de inputs de moeda para que eles compartilhem do mesmo dinamismo
  const currencyWrapperClass = 
    "flex items-center bg-white/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-white/80 dark:hover:bg-slate-900/80 hover:border-[#426DA9]/50 focus-within:bg-white dark:focus-within:bg-slate-900 focus-within:ring-4 focus-within:ring-[#426DA9]/20 focus-within:border-[#426DA9] hover:shadow-md focus-within:shadow-lg focus-within:-translate-y-0.5 transition-all duration-300 backdrop-blur-md";

  return (
    <div className="min-h-screen relative overflow-hidden text-slate-900 dark:text-slate-100">
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .custom-scroll::-webkit-scrollbar { width: 6px; }
        .custom-scroll::-webkit-scrollbar-track { background: transparent; }
        .custom-scroll::-webkit-scrollbar-thumb { background-color: #426DA9; border-radius: 10px; opacity: 0.5; }
        .custom-scroll::-webkit-scrollbar-thumb:hover { background-color: #1D4F91; }
        @keyframes gradientMove {
               0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient-bg {
          background: linear-gradient(-45deg, #1D4F91, #426DA9, #77127B, #C1188B, #E80070);
          background-size: 400% 400%;
          animation: gradientMove 15s ease infinite;
        }
      `,
        }}
      />

      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 animate-gradient-bg opacity-15 dark:opacity-30" />

      <AppSidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />

      <main
        className={`relative z-10 transition-all duration-300 p-4 md:p-8 space-y-8 ${collapsed ? "ml-[72px]" : "ml-[72px] md:ml-[260px]"}`}
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/60 dark:bg-slate-900/60 p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/50 backdrop-blur-xl shadow-sm">
          <div>
            <p className="text-sm text-[#426DA9] dark:text-[#8CB4F5] font-semibold mb-1 uppercase tracking-wider">
              Gestão Financeira
            </p>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-[#1D4F91] dark:text-white">
              Meus Parcelamentos
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
              Simule, analise os juros e registre seus parcelamentos ativos.
            </p>
          </div>
          <motion.button
            onClick={exportToExcel}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center justify-center gap-2 border border-[#426DA9]/30 bg-white/90 dark:bg-slate-900/90 text-[#1D4F91] dark:text-slate-200 px-5 py-3 rounded-xl text-sm font-semibold hover:bg-[#426DA9] hover:text-white transition-all shadow-sm group"
           >
            <Download className="w-4 h-4 group-hover:animate-bounce" /> Exportar Excel
          </motion.button>
        </div>

        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="relative overflow-hidden bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-[#E80070]/20 rounded-3xl p-6 shadow-lg shadow-[#E80070]/5 group hover:border-[#E80070]/40 transition-colors flex flex-col h-full min-h-[160px]"
          >
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 group-hover:scale-110 transition-all text-[#E80070] dark:text-[#FF66A3] pointer-events-none">
               <Wallet size={64} />
            </div>
            <p className="relative z-10 text-sm font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wide">
              Total em Parcelamentos
            </p>
            <div className="flex-1 flex items-center justify-center mt-2">
              <p className="relative z-10 text-4xl lg:text-5xl font-black bg-gradient-to-r from-[#E80070] to-[#C1188B] bg-clip-text text-transparent">
                {totalParcelamentos.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="relative overflow-hidden bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-[#77127B]/20 rounded-3xl p-6 shadow-lg shadow-[#77127B]/5 group hover:border-[#77127B]/40 transition-colors flex flex-col h-full min-h-[160px]"
          >
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 group-hover:scale-110 transition-all text-[#77127B] dark:text-[#C1188B] pointer-events-none">
               <Target size={64} />
            </div>
            <p className="relative z-10 text-sm font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wide">
              Nº de Parcelamentos
            </p>
            <div className="flex-1 flex items-center justify-center mt-2">
              <p className="relative z-10 text-4xl lg:text-5xl font-black text-[#77127B] dark:text-white">
                {simulators?.length || 0}
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="relative overflow-hidden bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-[#426DA9]/20 rounded-3xl p-5 shadow-lg shadow-[#426DA9]/5 group hover:border-[#426DA9]/40 transition-colors flex items-center justify-center h-full min-h-[160px]"
          >
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 group-hover:scale-110 transition-all text-[#426DA9] dark:text-[#8CB4F5] pointer-events-none">
              <Activity size={64} />
            </div>
            <div className="grid grid-cols-2 gap-3 w-full relative z-10">
              <div 
                onClick={() => handleStatusClick("Pendente")}
                className="cursor-pointer hover:-translate-y-1 hover:shadow-md hover:bg-[#E80070]/20 dark:hover:bg-[#E80070]/30 transition-all duration-300 border border-transparent hover:border-[#E80070]/30 flex flex-col items-center justify-center p-2 rounded-xl bg-[#E80070]/10 text-[#E80070] dark:bg-[#E80070]/20 dark:text-[#FF85BB]"
              >
                <span className="text-2xl font-black">{simulators?.filter((d) => d.status === "Pendente").length || 0}</span>
                <span className="text-[10px] font-bold uppercase tracking-wider mt-1">Pendente</span>
              </div>
              <div 
                onClick={() => handleStatusClick("Negociando")}
                className="cursor-pointer hover:-translate-y-1 hover:shadow-md hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-all duration-300 border border-transparent hover:border-amber-400/30 flex flex-col items-center justify-center p-2 rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
              >
                <span className="text-2xl font-black">{simulators?.filter((d) => d.status === "Negociando").length || 0}</span>
                <span className="text-[10px] font-bold uppercase tracking-wider mt-1">Negociando</span>
              </div>
              <div 
                onClick={() => handleStatusClick("Ativa")}
                className="cursor-pointer hover:-translate-y-1 hover:shadow-md hover:bg-[#426DA9]/20 dark:hover:bg-[#426DA9]/30 transition-all duration-300 border border-transparent hover:border-[#426DA9]/30 flex flex-col items-center justify-center p-2 rounded-xl bg-[#426DA9]/10 text-[#426DA9] dark:bg-[#426DA9]/20 dark:text-[#8CB4F5]"
              >
                <span className="text-2xl font-black">{simulators?.filter((d) => d.status === "Ativa").length || 0}</span>
                <span className="text-[10px] font-bold uppercase tracking-wider mt-1">Ativo</span>
              </div>
              <div 
                onClick={() => handleStatusClick("Pago")}
                className="cursor-pointer hover:-translate-y-1 hover:shadow-md hover:bg-emerald-200 dark:hover:bg-emerald-900/50 transition-all duration-300 border border-transparent hover:border-emerald-400/30 flex flex-col items-center justify-center p-2 rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
              >
                <span className="text-2xl font-black">{simulators?.filter((d) => d.status === "Pago").length || 0}</span>
                <span className="text-[10px] font-bold uppercase tracking-wider mt-1">Pago</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Formulário */}
        <motion.div
          id="formulario-parcelamento"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className={`bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border ${editingId ? "border-[#E80070]/50 shadow-[#E80070]/10" : "border-slate-200/50 dark:border-slate-800/50"} rounded-3xl p-6 md:p-8 shadow-sm transition-all`}
        >
          <div className="flex justify-between items-center mb-8">
            <h2 className="font-bold text-xl flex items-center gap-3 text-[#1D4F91] dark:text-white">
              <div
                className={`p-2 rounded-lg ${editingId ? "bg-[#E80070]/20 text-[#E80070]" : "bg-[#E80070]/10 text-[#E80070]"}`}
              >
                {editingId ? <Edit2 className="w-5 h-5" /> : <Calculator className="w-5 h-5" />}
              </div>
              {editingId ? "Editando Parcelamento" : "Simular & Registrar Parcelamento"}
            </h2>
            {editingId && (
              <button
                onClick={cancelEdit}
                className="text-sm flex items-center gap-1 bg-[#E80070]/10 px-4 py-2 rounded-xl text-[#E80070] font-bold hover:bg-[#E80070]/20 hover:text-[#C1188B] hover:scale-105 transition-all shadow-sm"
               >
                <X size={16} /> Fechar Edição
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-4">
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-2 block">
                  Credor | Compra *
                </label>
                <input
                  {...register("creditor")}
                  placeholder="Ex: Empréstimo, carro, casa própria, etc."
                  className={fieldClass}
                  onChange={clearAnalysis}
                />
                {errors.creditor && (
                  <p className="text-[#E80070] text-xs mt-2 flex items-center gap-1">
                    <AlertCircle size={12} />
                     {errors.creditor.message}
                  </p>
                )}
              </div>

              <div className="lg:col-span-3">
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-2 block">
                  Valor Original *
                </label>
                <div className={currencyWrapperClass}>
                  <span className="pl-4 text-slate-500 text-sm font-medium select-none pointer-events-none">R$</span>
                  <Controller
                    name="value"
                    control={control}
                    render={({ field: { onChange, value } }) => (
                      <input
                       type="text"
                        inputMode="numeric"
                        placeholder="0,00"
                        className="w-full bg-transparent px-3 py-3 text-slate-800 dark:text-slate-100 outline-none text-sm font-semibold placeholder:text-slate-500"
                        value={value}
                        onChange={(e) => {
                          onChange(formatCurrencyInput(e.target.value));
                          clearAnalysis();
                        }}
                      />
                    )}
                  />
                </div>
                {errors.value && (
                  <p className="text-[#E80070] text-xs mt-2 flex items-center gap-1">
                    <AlertCircle size={12} />
                    {errors.value.message}
                  </p>
                )}
               </div>

              <div className="lg:col-span-3">
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-2 block">
                  Entrada (Opcional)
                </label>
                <div className={currencyWrapperClass}>
                  <span className="pl-4 text-slate-500 text-sm font-medium select-none pointer-events-none">R$</span>
                  <Controller
                    name="downPayment"
                    control={control}
                    render={({ field: { onChange, value } }) => (
                      <input
                        type="text"
                        inputMode="numeric"
                        placeholder="0,00"
                        className="w-full bg-transparent px-3 py-3 text-slate-800 dark:text-slate-100 outline-none text-sm font-semibold placeholder:text-slate-500"
                        value={value}
                        onChange={(e) => {
                           onChange(formatCurrencyInput(e.target.value));
                           clearAnalysis();
                         }}
                      />
                    )}
                  />
                </div>
              </div>

              <div className="lg:col-span-2">
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-2 block">
                  Status *
                </label>
                <select {...register("status")} className={fieldClass}>
                  <option value="Ativa">Ativa</option>
                  <option value="Negociando">Negociando</option>
                  <option value="Pendente">Pendente</option>
                  <option value="Pago">Pago</option>
                </select>
                {errors.status && (
                   <p className="text-[#E80070] text-xs mt-2 flex items-center gap-1">
                    <AlertCircle size={12} />
                    {errors.status.message}
                  </p>
                )}
               </div>

              <div className="lg:col-span-3">
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-2 block">
                  Início
                </label>
                <div className="relative group">
                   <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none group-focus-within:text-[#426DA9] transition-colors" />
                  <Controller
                    name="date"
                    control={control}
                    render={({ field: { onChange, value } }) => (
                      <DatePicker
                        selected={value ? new Date(value) : null}
                        onChange={(date) => {
                          onChange(date ? date.toISOString() : null);
                          clearAnalysis();
                        }}
                        dateFormat="dd/MM/yyyy"
                        locale={ptBR}
                        placeholderText="DD/MM/AAAA"
                        className={`${fieldClass} pl-10`}
                       />
                    )}
                  />
                </div>
              </div>

               <div className="lg:col-span-3">
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-2 block">
                  Tipo de Juros *
                </label>
                <select
                  {...register("type")}
                  className={fieldClass}
                  onChange={(e) => {
                    register("type").onChange(e);
                    clearAnalysis();
                  }}
                >
                  <option value="Composto">Juros Composto</option>
                  <option value="Simples">Juros Simples</option>
                </select>
              </div>

               <div className="lg:col-span-3">
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-2 block">
                  Taxa de Juros (%) *
                </label>
                <div className="flex gap-2">
                  <input
                    {...register("rate")}
                    type="text"
                    inputMode="decimal"
                    placeholder="0,00"
                    className={`${fieldClass} w-2/3`}
                    onChange={(e) => {
                      register("rate").onChange(e);
                      clearAnalysis();
                    }}
                  />
                  <select
                    {...register("year")}
                    className={`${fieldClass} w-1/3 px-2`}
                    onChange={(e) => {
                      register("year").onChange(e);
                      clearAnalysis();
                    }}
                  >
                    <option value="Mensal">a.m</option>
                    <option value="Anual">a.a</option>
                  </select>
                </div>
               </div>

              <div className="lg:col-span-3">
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-2 block">
                  Nº Parcelas *
                </label>
                <input
                  {...register("installments")}
                  type="number"
                  min="0"
                  className={fieldClass}
                  onChange={(e) => {
                     register("installments").onChange(e);
                     clearAnalysis();
                  }}
                />
              </div>
            </div>

            {/* Renderização do Gráfico & Resumo */}
            <AnimatePresence>
              {analysisData && simulatedSummary && (
                 <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="pt-8 border-t border-slate-100 dark:border-slate-800/50"
                 >
                  <h3 className="font-bold text-xl mb-6 text-[#1D4F91] dark:text-white flex items-center gap-2">
                    <TrendingUp className="text-[#E80070] w-5 h-5" />
                    Projeção de Pagamento
                  </h3>
                  
                  <div className="h-[320px] w-full mb-8">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={analysisData} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
                        <defs>
                          <linearGradient id="colorValor" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#E80070" stopOpacity={0.6} />
                            <stop offset="95%" stopColor="#E80070" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#cbd5e1" opacity={0.5} />
                        <XAxis 
                          dataKey="shortName" 
                          tick={{ fill: '#426DA9', fontSize: 13, fontWeight: 600 }} 
                          tickMargin={15} 
                          axisLine={{ stroke: '#94a3b8' }}
                          tickLine={false}
                        />
                        <YAxis 
                          tick={{ fill: '#C1188B', fontSize: 12, fontWeight: 600 }} 
                          tickFormatter={(val) => `R$ ${val}`} 
                          axisLine={false}
                          tickLine={false}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Area 
                          type="monotone" 
                          dataKey="valor" 
                          stroke="#E80070" 
                          strokeWidth={4} 
                          fillOpacity={1} 
                          fill="url(#colorValor)" 
                         />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Resumo Final Destacado */}
                  <div className="grid grid-cols-2 gap-4 bg-[#1D4F91]/5 dark:bg-[#1D4F91]/10 p-5 rounded-2xl mb-6 border border-[#1D4F91]/10">
                    <div className="text-left border-r border-[#1D4F91]/10 pr-4">
                      <p className="text-xs md:text-sm font-bold text-[#426DA9] dark:text-[#8CB4F5] uppercase tracking-widest mb-1">
                        Valor Original
                      </p>
                      <p className="text-2xl md:text-3xl font-black text-[#1D4F91] dark:text-white">
                        {simulatedSummary.original.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                      </p>
                    </div>
                    <div className="text-right pl-4">
                      <p className="text-xs md:text-sm font-bold text-[#E80070] uppercase tracking-widest mb-1">
                        Valor Total c/ Juros
                      </p>
                      <p className="text-2xl md:text-3xl font-black text-[#C1188B] dark:text-[#FF66A3]">
                        {simulatedSummary.total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className={`flex flex-col sm:flex-row gap-4 pt-6 border-t border-slate-100 dark:border-slate-800/50 ${editingId ? 'justify-end' : ''}`}>
              {!editingId && (
                <button
                  type="button"
                  onClick={handleAnalyze}
                  className="flex-1 flex items-center justify-center gap-2 bg-[#426DA9]/10 text-[#426DA9] dark:bg-[#426DA9]/20 dark:text-[#8CB4F5] px-6 py-4 rounded-xl font-bold hover:bg-[#426DA9]/20 dark:hover:bg-[#426DA9]/30 transition-all"
                >
                  <TrendingUp size={18} /> Simular Análise
                </button>
              )}

              {(analysisData || editingId) && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={isSaving}
                  type="submit"
                  className={`flex items-center justify-center gap-2 bg-gradient-to-r from-[#E80070] to-[#C1188B] text-white rounded-xl font-bold shadow-lg shadow-[#E80070]/20 hover:shadow-xl hover:shadow-[#E80070]/30 transition-all disabled:opacity-70 ${
                    editingId ? "px-6 py-2.5 text-sm w-full sm:w-auto" : "flex-1 px-6 py-4"
                  }`}
                >
                  {isSaving ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                  {editingId ? "Atualizar Parcelamento" : "Registrar Parcelamento"}
                </motion.button>
              )}
            </div>
          </form>
        </motion.div>

        {/* Lista de Parcelamentos */}
        <motion.div
          id="lista-parcelamentos"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border border-slate-200/50 dark:border-slate-800/50 rounded-3xl p-6 md:p-8 shadow-sm"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
            <h2 className="font-bold text-xl flex items-center gap-3 text-[#1D4F91] dark:text-white">
              <div className="p-2 bg-[#1D4F91]/10 rounded-lg text-[#1D4F91] dark:text-[#8CB4F5]">
                <CreditCard className="w-5 h-5" />
              </div>
              Parcelamentos Registrados
            </h2>
            <div className="flex items-center gap-2 bg-white/50 dark:bg-slate-800/50 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-[#426DA9]/50 transition-colors">
               <Filter className="w-4 h-4 text-slate-400 ml-2" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-transparent border-none text-sm text-slate-700 dark:text-slate-300 outline-none pr-4 cursor-pointer"
               >
                <option value="Todos">Todos</option>
                <option value="Ativa">Ativos</option>
                <option value="Pendente">Pendentes</option>
                <option value="Negociando">Negociando</option>
                <option value="Pago">Pagos</option>
              </select>
             </div>
          </div>

          {!filteredsimulators.length ? (
            <div className="text-center py-12 bg-white/40 dark:bg-slate-900/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
              <CreditCard className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <p className="text-slate-500 dark:text-slate-400 font-medium">
                Nenhum parcelamento encontrado para este filtro.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <AnimatePresence>
                {filteredsimulators.map((d) => {
                  const valorOriginal = d.value || 0;
                  const entrada = (d as any).downPayment || 0;
                  const totalComJuros = valorOriginal - entrada + (d.payment || 0);

                  const startDateStr = d.date ? new Date(d.date) : new Date();
                  const installmentsCount = parseInt(String((d as any).installments || 1), 10);
                  const endDateObj = new Date(startDateStr);
                  endDateObj.setMonth(endDateObj.getMonth() + installmentsCount);
                  const formatMY = (dObj: Date) => {
                    const m = dObj.toLocaleDateString("pt-BR", { month: "long" });
                    return `${m.charAt(0).toUpperCase() + m.slice(1)}/${dObj.getFullYear()}`;
                  };

                  const startMY = formatMY(startDateStr);
                  const endMY = formatMY(endDateObj);
                  const valorParcela = installmentsCount > 0 ? totalComJuros / installmentsCount : 0;

                  return (
                    <motion.div
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      key={d.id}
                      onClick={() => handleEdit(d)}
                      className={`group bg-white dark:bg-slate-900 border ${
                        editingId === d.id
                          ? "border-[#E80070] shadow-md shadow-[#E80070]/10"
                          : "border-slate-100 dark:border-slate-800 hover:border-[#426DA9]/30 hover:-translate-y-1 hover:shadow-lg"
                      } rounded-2xl p-5 transition-all duration-300 cursor-pointer relative overflow-hidden`}
                    >
                      <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-[#1D4F91] to-[#426DA9] opacity-50" />
                      <div className="flex justify-between items-start mb-4 pl-2">
                        <div>
                          <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 truncate pr-2 group-hover:text-[#1D4F91] dark:group-hover:text-[#8CB4F5] transition-colors">
                            {d.creditor}
                          </h3>
                          <div className="flex items-center gap-3 mt-3 flex-wrap">
                            <span
                              className={`text-xs font-black uppercase tracking-wider px-2.5 py-1 rounded-md ${getStatusStyle(
                                d.status,
                              )}`}
                            >
                              {d.status}
                            </span>
                            {(d as any).installments && (
                              <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                                {(d as any).installments} parcelas
                              </span>
                            )}
                            {(d.rate || 0) > 0 && (
                              <span className="text-sm font-medium text-[#C1188B] dark:text-[#E88CEE]">
                                Taxa: {d.rate}% {(d as any).ratePeriod === "Anual" ? "a.a." : "a.m."}
                              </span>
                            )}

                            <span className="text-sm font-medium text-slate-500 dark:text-slate-400 w-full mt-1">
                              Início: {startMY} • Término: {endMY}
                            </span>

                            {valorParcela > 0 && (
                              <span className="text-sm font-bold text-[#426DA9] dark:text-[#8CB4F5] mt-1">
                                Parcela: {valorParcela.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                              </span>
                            )}
                         </div>
                        </div>
                      </div>

                      <div className="flex justify-between items-end border-t border-slate-100 dark:border-slate-800 mt-2 pt-4 pl-2">
                        <div>
                          <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">
                            Valor Total c/ Juros
                          </p>
                          <p className="font-black text-xl text-[#1D4F91] dark:text-white flex items-baseline gap-2">
                            {entrada > 0 && (
                              <span className="text-sm text-slate-400">
                                Entrada: <strong className="text-emerald-500 dark:text-emerald-400">
                                  {entrada.toLocaleString("pt-BR", {
                                    style: "currency",
                                    currency: "BRL",
                                  })}
                                </strong>
                              </span>
                            )}
                            {totalComJuros.toLocaleString("pt-BR", {
                              style: "currency",
                              currency: "BRL",
                            })}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <motion.button
                            whileHover={{
                              scale: 1.1,
                              backgroundColor: "#E80070",
                              color: "white",
                            }}
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => d.id && handleDelete(e, d.id)}
                            className="p-2.5 bg-[#E80070]/10 text-[#E80070] dark:bg-[#E80070]/20 dark:text-[#FF66A3] rounded-xl transition-colors flex-shrink-0"
                            title="Excluir parcelamento"
                          >
                            <Trash2 size={18} />
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}