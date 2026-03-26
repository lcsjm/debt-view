import { useState } from "react";
import * as XLSX from "xlsx";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ptBR } from "date-fns/locale/pt-BR";
import { useDebts, DebtData } from "../hooks/useDebts";
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
  Calendar
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { AppSidebar } from "@/components/AppSidebar";
import { toast } from "@/hooks/use-toast";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Footer from "@/components/footer";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

// Schema atualizado: Removemos "date" (Vencimento) e focamos na "entryDate"
const debtSchema = z.object({
  creditor: z.string().min(2, "Nome do credor obrigatório"),
  value: z
    .string()
    .min(1, "Obrigatório")
    .refine((v) => {
      const d = v.replace(/\D/g, "");
      return parseInt(d, 10) > 0;
    }, "Deve ser maior que zero"),
  entryDate: z.string().nullable(), // Data de entrada
  rate: z.string().min(1, "Obrigatório"),
  interestType: z.enum(["Simples", "Composto"]),
  installments: z.string().min(1, "Obrigatório"),
  status: z.string().min(2, "Informe o status"),
});

type DebtForm = z.infer<typeof debtSchema>;

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
    "Pago": "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    "Em negociação": "bg-[#77127B]/10 text-[#77127B] dark:bg-[#77127B]/20 dark:text-[#E88CEE]",
    "Parcelado": "bg-[#426DA9]/10 text-[#426DA9] dark:bg-[#426DA9]/20 dark:text-[#8CB4F5]",
    "Pendente": "bg-[#E80070]/10 text-[#E80070] dark:bg-[#E80070]/20 dark:text-[#FF85BB]"
  };
  return styles[status] || styles["Pendente"];
};

// Função auxiliar para gerar os dados do gráfico projetando as datas
const generateChartData = (principal: number, rate: number, months: number, isCompound: boolean, startDateStr: string | null) => {
  const chartData = [];
  const startDate = startDateStr ? new Date(startDateStr) : new Date();

  for (let i = 0; i <= months; i++) {
    let currentVal = principal;
    if (i > 0) {
      if (isCompound) {
        currentVal = principal * Math.pow(1 + rate, i);
      } else {
        currentVal = principal * (1 + rate * i);
      }
    }

    // Projeta o mês somando a parcela 'i' à data inicial
    const stepDate = new Date(startDate);
    stepDate.setMonth(stepDate.getMonth() + i);
    
    // Formata algo como "mar/2026"
    const monthName = stepDate.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '');
    const year = stepDate.getFullYear();
    const dateLabel = `${monthName}/${year}`;

    chartData.push({
      index: i,
      name: i === 0 ? `Início (${dateLabel})` : `Parc. ${i} (${dateLabel})`, // Para o Tooltip
      shortName: i === 0 ? 'Início' : `P${i}`, // Para o eixo X (Evita poluição visual)
      valor: Number(currentVal.toFixed(2)),
    });
  }
  return chartData;
};

export default function Debts() {
  const [activeSection, setActiveSection] = useState("debts");
  const [collapsed, setCollapsed] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("Todos");
  const [analysisData, setAnalysisData] = useState<any[] | null>(null);

  const { debts, isLoading, saveDebt, isSaving, deleteDebt } = useDebts();

  const {
    register,
    handleSubmit,
    control,
    reset,
    getValues,
    trigger,
    formState: { errors },
  } = useForm<DebtForm>({
    resolver: zodResolver(debtSchema),
    defaultValues: {
      creditor: "",
      value: "",
      entryDate: new Date().toISOString(),
      rate: "",
      interestType: "Composto",
      installments: "12",
      status: "Pendente",
    },
  });

  const handleAnalyze = async () => {
    const isValid = await trigger(["value", "rate", "installments", "interestType", "entryDate"]);
    if (!isValid) return;

    const data = getValues();
    const principal = parseCurrencyInput(data.value);
    const rate = parseFloat(data.rate.replace(",", ".")) / 100;
    const isCompound = data.interestType === "Composto";
    const months = parseInt(data.installments, 10);

    if (principal <= 0 || months <= 0) {
      toast({ title: "Valores inválidos para análise", variant: "destructive" });
      return;
    }

    const chartData = generateChartData(principal, rate, months, isCompound, data.entryDate);
    setAnalysisData(chartData);
    toast({ title: "Análise gerada com sucesso! 📊" });
  };

  const onSubmit = async (data: DebtForm) => {
    const finalAmountValue = analysisData ? analysisData[analysisData.length - 1].valor - parseCurrencyInput(data.value) : 0;
    
    // Calculando a data de vencimento final para salvar no banco (caso necessário)
    const startDate = new Date(data.entryDate || new Date());
    const finalDate = new Date(startDate);
    finalDate.setMonth(finalDate.getMonth() + parseInt(data.installments, 10));

    try {
      await saveDebt({
        ...(editingId ? { id: editingId } : {}),
        creditor: data.creditor,
        value: parseCurrencyInput(data.value),
        amount: finalAmountValue,
        rate: parseFloat(data.rate.replace(",", ".")),
        status: data.status,
        date: finalDate.toISOString(), // Salvando a última parcela como vencimento
        // Passando campos adicionais, caso o seu hook useDebts os armazene:
        entryDate: data.entryDate,
        interestType: data.interestType,
        installments: parseInt(data.installments, 10),
      } as DebtData & { entryDate?: string | null, interestType?: string, installments?: number });
      
      toast({ title: editingId ? "Dívida atualizada! ✅" : "Dívida salva com sucesso! ✅" });
      cancelEdit();
    } catch (e: any) {
      toast({ title: "Erro ao salvar", description: e.message, variant: "destructive" });
    }
  };

  // Melhorado: Popula o formulário E JÁ RODA O GRÁFICO
  const handleEdit = (debt: any) => {
    setEditingId(debt.id || null);
    
    // Tratativas de fallback caso o banco antigo não tenha esses campos
    const formattedValue = formatCurrencyInput((debt.value * 100).toString());
    const instStr = debt.installments ? debt.installments.toString() : "12";
    const typeStr = debt.interestType || "Composto";
    const entryStr = debt.entryDate || debt.date || new Date().toISOString();

    reset({
      creditor: debt.creditor,
      value: formattedValue,
      entryDate: entryStr,
      rate: debt.rate ? debt.rate.toString() : "0",
      interestType: typeStr,
      installments: instStr,
      status: debt.status,
    });

    // Auto-gerar a análise para visualização imediata
    const principal = debt.value;
    const rate = debt.rate ? debt.rate / 100 : 0;
    const isCompound = typeStr === "Composto";
    const months = parseInt(instStr, 10);

    const chartData = generateChartData(principal, rate, months, isCompound, entryStr);
    setAnalysisData(chartData);

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setAnalysisData(null);
    reset({
      creditor: "",
      value: "",
      entryDate: new Date().toISOString(),
      rate: "",
      interestType: "Composto",
      installments: "12",
      status: "Pendente",
    });
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // Impede que o clique no deletar abra a edição
    if (!window.confirm("Tem certeza que deseja excluir esta dívida de forma permanente?")) return;
    try {
      await deleteDebt(id);
      toast({ title: "Dívida excluída." });
      if (editingId === id) cancelEdit();
    } catch (err: any) {
      toast({ title: "Erro ao excluir", description: err.message, variant: "destructive" });
    }
  };

  const exportToExcel = () => {
    if (!debts || debts.length === 0) {
      toast({ title: "Nenhuma dívida para exportar.", variant: "destructive" });
      return;
    }
    const worksheet = XLSX.utils.json_to_sheet(debts);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Dívidas");
    XLSX.writeFile(workbook, "Minhas_Dividas.xlsx");
    toast({ title: "Relatório Excel gerado!" });
  };

  const totalDividas = debts?.reduce((acc, d) => acc + (d.value || 0) + (d.amount || 0), 0) || 0;
  const filteredDebts = debts?.filter(d => filterStatus === "Todos" || d.status === filterStatus) || [];

  const fieldClass =
    "w-full border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 rounded-xl px-4 py-3 text-slate-800 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-[#426DA9]/50 focus:border-[#426DA9] transition-all text-sm backdrop-blur-md";

  return (
    <div className="min-h-screen relative overflow-hidden text-slate-900 dark:text-slate-100">
      
      {/* Estilos Globais */}
      <style dangerouslySetInnerHTML={{ __html: `
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
      `}} />

      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 animate-gradient-bg opacity-15 dark:opacity-30" />

      <AppSidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />

      <main className={`relative z-10 transition-all duration-300 p-4 md:p-8 space-y-8 ${collapsed ? "ml-[72px]" : "ml-[72px] md:ml-[260px]"}`}>
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/60 dark:bg-slate-900/60 p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/50 backdrop-blur-xl shadow-sm">
          <div>
            <p className="text-sm text-[#426DA9] dark:text-[#8CB4F5] font-semibold mb-1 uppercase tracking-wider">Gestão Financeira</p>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-[#1D4F91] dark:text-white">Minhas Dívidas</h1>
            <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">Simule, analise os juros e registre suas dívidas ativas.</p>
          </div>
          <motion.button onClick={exportToExcel} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }} className="flex items-center justify-center gap-2 border border-[#426DA9]/30 bg-white/90 dark:bg-slate-900/90 text-[#1D4F91] dark:text-slate-200 px-5 py-3 rounded-xl text-sm font-semibold hover:bg-[#426DA9] hover:text-white transition-all shadow-sm group">
            <Download className="w-4 h-4 group-hover:animate-bounce" /> Exportar Excel
          </motion.button>
        </div>

        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="relative overflow-hidden bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-[#E80070]/20 rounded-3xl p-6 shadow-lg shadow-[#E80070]/5 group hover:border-[#E80070]/40 transition-colors">
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 group-hover:scale-110 transition-all text-[#E80070] dark:text-[#FF66A3]"><Wallet size={64} /></div>
            <p className="text-sm text-slate-600 dark:text-slate-400 font-medium mb-2">Total em Dívidas</p>
            <p className="text-3xl font-black bg-gradient-to-r from-[#E80070] to-[#C1188B] bg-clip-text text-transparent">{totalDividas.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="relative overflow-hidden bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-[#77127B]/20 rounded-3xl p-6 shadow-lg shadow-[#77127B]/5 group hover:border-[#77127B]/40 transition-colors">
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 group-hover:scale-110 transition-all text-[#77127B] dark:text-[#C1188B]"><Target size={64} /></div>
            <p className="text-sm text-slate-600 dark:text-slate-400 font-medium mb-2">Nº de Dívidas</p>
            <p className="text-3xl font-black text-[#77127B] dark:text-white">{debts?.length || 0}</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="relative overflow-hidden bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-[#426DA9]/20 rounded-3xl p-6 shadow-lg shadow-[#426DA9]/5 group hover:border-[#426DA9]/40 transition-colors">
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 group-hover:scale-110 transition-all text-[#426DA9] dark:text-[#8CB4F5]"><Activity size={64} /></div>
            <p className="text-sm text-slate-600 dark:text-slate-400 font-medium mb-2">Status Pendentes</p>
            <p className="text-3xl font-black text-[#426DA9] dark:text-white">{debts?.filter((d) => d.status === "Pendente").length || 0}</p>
          </motion.div>
        </div>

        {/* Formulário de Registro / Edição */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className={`bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border ${editingId ? 'border-[#E80070]/50 shadow-[#E80070]/10' : 'border-slate-200/50 dark:border-slate-800/50'} rounded-3xl p-6 md:p-8 shadow-sm transition-all`}>
          <div className="flex justify-between items-center mb-8">
            <h2 className="font-bold text-xl flex items-center gap-3 text-[#1D4F91] dark:text-white">
              <div className={`p-2 rounded-lg ${editingId ? 'bg-[#E80070]/20 text-[#E80070]' : 'bg-[#E80070]/10 text-[#E80070]'}`}>
                {editingId ? <Edit2 className="w-5 h-5" /> : <Calculator className="w-5 h-5" />}
              </div>
              {editingId ? "Visualizando / Editando Dívida" : "Simular & Registrar Dívida"}
            </h2>
            {editingId && (
              <button onClick={cancelEdit} className="text-sm flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg text-slate-600 hover:text-slate-800 dark:text-slate-300 dark:hover:text-white transition-colors">
                <X size={16} /> Fechar Edição
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* NOVO GRID: Proporcional 4 Colunas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              
              <div className="lg:col-span-2">
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-2 block">Credor *</label>
                <input {...register("creditor")} placeholder="Ex: Banco Itaú" className={fieldClass} onChange={() => setAnalysisData(null)} />
                {errors.creditor && <p className="text-[#E80070] text-xs mt-2 flex items-center gap-1"><AlertCircle size={12} />{errors.creditor.message}</p>}
              </div>

              <div className="lg:col-span-1">
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-2 block">Valor Original *</label>
                <div className="flex items-center bg-white/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl focus-within:ring-2 focus-within:ring-[#426DA9]/50 focus-within:border-[#426DA9] transition-all backdrop-blur-md">
                  <span className="pl-4 text-slate-500 text-sm font-medium select-none">R$</span>
                  <Controller name="value" control={control} render={({ field: { onChange, value } }) => (
                    <input type="text" inputMode="numeric" placeholder="0,00" className="w-full bg-transparent px-3 py-3 text-slate-800 dark:text-slate-100 outline-none text-sm font-semibold placeholder:text-slate-500" value={value} onChange={(e) => { onChange(formatCurrencyInput(e.target.value)); setAnalysisData(null); }} />
                  )} />
                </div>
                {errors.value && <p className="text-[#E80070] text-xs mt-2 flex items-center gap-1"><AlertCircle size={12} />{errors.value.message}</p>}
              </div>

              <div className="lg:col-span-1">
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-2 block">Status *</label>
                <select {...register("status")} className={fieldClass}>
                  <option value="Pendente">Pendente</option>
                  <option value="Em negociação">Em negociação</option>
                  <option value="Parcelado">Parcelado</option>
                  <option value="Pago">Pago</option>
                </select>
                {errors.status && <p className="text-[#E80070] text-xs mt-2 flex items-center gap-1"><AlertCircle size={12} />{errors.status.message}</p>}
              </div>

              {/* Linha 2 do Grid */}
              <div className="lg:col-span-1">
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-2 block">Data de Entrada</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <Controller name="entryDate" control={control} render={({ field: { onChange, value } }) => (
                    <DatePicker selected={value ? new Date(value) : null} onChange={(date) => { onChange(date ? date.toISOString() : null); setAnalysisData(null); }} dateFormat="dd/MM/yyyy" locale={ptBR} placeholderText="Início da dívida" className={`${fieldClass} pl-10`} />
                  )} />
                </div>
              </div>

              <div className="lg:col-span-1">
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-2 block">Tipo de Juros *</label>
                <select {...register("interestType")} className={fieldClass} onChange={(e) => { register("interestType").onChange(e); setAnalysisData(null); }}>
                  <option value="Composto">Juros Composto</option>
                  <option value="Simples">Juros Simples</option>
                </select>
              </div>

              <div className="lg:col-span-1">
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-2 block">Taxa (% a.m.) *</label>
                <div className="flex items-center bg-white/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl focus-within:ring-2 focus-within:ring-[#426DA9]/50 focus-within:border-[#426DA9] transition-all backdrop-blur-md">
                  <input {...register("rate")} type="number" step="0.01" placeholder="Ex: 2.5" className="w-full bg-transparent px-4 py-3 text-slate-800 dark:text-slate-100 outline-none text-sm font-semibold placeholder:text-slate-500" onChange={(e) => { register("rate").onChange(e); setAnalysisData(null); }} />
                  <span className="pr-4 text-slate-500 text-sm font-medium select-none">%</span>
                </div>
                {errors.rate && <p className="text-[#E80070] text-xs mt-2 flex items-center gap-1"><AlertCircle size={12} />{errors.rate.message}</p>}
              </div>

              <div className="lg:col-span-1">
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-2 block">Nº de Parcelas *</label>
                <input {...register("installments")} type="number" placeholder="Ex: 12" className={fieldClass} onChange={(e) => { register("installments").onChange(e); setAnalysisData(null); }} />
                {errors.installments && <p className="text-[#E80070] text-xs mt-2 flex items-center gap-1"><AlertCircle size={12} />{errors.installments.message}</p>}
              </div>
            </div>

            {/* SESSÃO DO GRÁFICO */}
            <AnimatePresence>
              {analysisData && (
                <motion.div
                  initial={{ opacity: 0, height: 0, scale: 0.95 }}
                  animate={{ opacity: 1, height: "auto", scale: 1 }}
                  exit={{ opacity: 0, height: 0, scale: 0.95 }}
                  className="mt-8 border border-slate-200/50 dark:border-slate-700/50 rounded-2xl p-6 bg-slate-50/50 dark:bg-slate-800/20"
                >
                  <h3 className="font-bold text-[#1D4F91] dark:text-[#8CB4F5] mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Evolução da Dívida ({getValues("interestType")})
                  </h3>
                  
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={analysisData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorValor" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#E80070" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#E80070" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="shortName" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                        <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(value) => `R$ ${value}`} />
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
                        <Tooltip 
                          labelFormatter={(label, payload) => payload?.[0]?.payload?.name || label}
                          formatter={(value: number) => [`R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, "Valor Projetado"]}
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', fontSize: '12px' }}
                        />
                        <Area type="monotone" dataKey="valor" stroke="#E80070" strokeWidth={3} fillOpacity={1} fill="url(#colorValor)" activeDot={{ r: 6, fill: "#E80070", stroke: "#fff", strokeWidth: 2 }} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div className="mt-4 flex flex-col sm:flex-row justify-between items-center text-sm p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 gap-4">
                    <div className="text-center sm:text-left">
                      <span className="text-slate-500 block text-xs uppercase tracking-wider font-semibold">Valor Inicial</span>
                      <strong className="text-slate-800 dark:text-slate-200 text-lg">R$ {analysisData[0].valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
                    </div>
                    <div className="hidden sm:block text-slate-300 dark:text-slate-700">➜</div>
                    <div className="text-center sm:text-right">
                      <span className="text-slate-500 block text-xs uppercase tracking-wider font-semibold text-[#E80070]">Valor Final Projetado</span>
                      <strong className="text-[#E80070] text-xl font-black">R$ {analysisData[analysisData.length - 1].valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* BOTÕES DE AÇÃO */}
            <div className="flex justify-end gap-4 pt-6 border-t border-slate-200/50 dark:border-slate-800/50 mt-2">
              {!analysisData ? (
                <motion.button type="button" onClick={handleAnalyze} whileHover={{ scale: 1.02, boxShadow: "0 10px 25px -5px rgba(66, 109, 169, 0.4)" }} whileTap={{ scale: 0.97 }} className="bg-gradient-to-r from-[#1D4F91] to-[#426DA9] text-white px-8 py-3.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2">
                  <TrendingUp size={18} /> Analisar Dívida
                </motion.button>
              ) : (
                <>
                  <button type="button" onClick={() => setAnalysisData(null)} className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 px-4 font-medium text-sm transition-colors">
                    Recalcular
                  </button>
                  <motion.button type="submit" whileHover={{ scale: 1.02, boxShadow: "0 10px 25px -5px rgba(232, 0, 112, 0.4)" }} whileTap={{ scale: 0.97 }} disabled={isSaving} className="bg-gradient-to-r from-[#E80070] to-[#C1188B] text-white px-8 py-3.5 rounded-xl font-bold text-sm transition-all disabled:opacity-50 flex items-center gap-2">
                    {editingId ? <Edit2 size={18} /> : <Plus size={18} />}
                    {isSaving ? "Salvando..." : (editingId ? "Atualizar Dívida" : "Registrar Dívida")}
                  </motion.button>
                </>
              )}
            </div>
          </form>
        </motion.div>

        {/* Lista de Dívidas */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border border-slate-200/50 dark:border-slate-800/50 rounded-3xl p-6 md:p-8 shadow-sm">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
            <h2 className="font-bold text-xl flex items-center gap-3 text-[#1D4F91] dark:text-white">
              <div className="p-2 bg-[#1D4F91]/10 rounded-lg text-[#1D4F91] dark:text-[#8CB4F5]"><CreditCard className="w-5 h-5" /></div>
              Dívidas Registradas
            </h2>
            <div className="flex items-center gap-2 bg-white/50 dark:bg-slate-800/50 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
              <Filter className="w-4 h-4 text-slate-500 ml-2" />
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="bg-transparent text-sm text-slate-700 dark:text-slate-300 font-medium px-2 py-1 outline-none cursor-pointer">
                <option value="Todos">Todos os status</option>
                <option value="Pendente">Pendente</option>
                <option value="Em negociação">Em negociação</option>
                <option value="Parcelado">Parcelado</option>
                <option value="Pago">Pago</option>
              </select>
            </div>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 opacity-50">
              <div className="w-8 h-8 border-4 border-[#426DA9] border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-[#426DA9] dark:text-slate-300 font-medium">Carregando dívidas...</p>
            </div>
          ) : !debts || debts.length === 0 ? (
            <div className="text-center py-16 bg-white/50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-[#426DA9]/30 text-slate-600 dark:text-slate-400">
              <Wallet className="w-12 h-12 mx-auto mb-4 text-[#426DA9]/40" />
              <p className="font-bold text-[#1D4F91] dark:text-white text-lg mb-1">Tudo limpo por aqui!</p>
              <p className="text-sm dark:text-slate-400">Use o formulário acima para registrar sua primeira dívida.</p>
            </div>
          ) : filteredDebts.length === 0 ? (
             <div className="text-center py-12 text-slate-500">Nenhuma dívida encontrada com o status "{filterStatus}".</div>
          ) : (
            <div className="flex flex-col gap-3 max-h-[500px] overflow-y-auto pr-2 custom-scroll">
              <AnimatePresence>
                {filteredDebts.map((d, i) => (
                  <motion.div
                    key={d.id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95, x: 20 }}
                    transition={{ delay: i * 0.05, type: "spring", stiffness: 300, damping: 24 }}
                    // Card clicável!
                    onClick={() => handleEdit(d)}
                    className={`group cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-white/95 dark:bg-slate-800/95 rounded-2xl border transition-all backdrop-blur-sm ${editingId === d.id ? 'border-[#E80070] ring-1 ring-[#E80070]' : 'border-slate-100 dark:border-slate-700 hover:border-[#426DA9]/40 hover:shadow-lg hover:shadow-[#426DA9]/5'}`}
                  >
                    <div className="flex-1 min-w-0 mb-4 sm:mb-0">
                      <p className="font-bold text-lg truncate text-[#1D4F91] dark:text-white group-hover:text-[#E80070] transition-colors">
                        {d.creditor}
                      </p>
                      <div className="flex items-center gap-3 mt-2 flex-wrap">
                        <span className={`text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md ${getStatusStyle(d.status)}`}>{d.status}</span>
                        {(d as any).installments && (
                           <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                             {(d as any).installments} Parcelas
                           </span>
                        )}
                        {(d.rate || 0) > 0 && (
                          <span className="text-xs font-medium text-[#C1188B] dark:text-[#E88CEE]">
                            Taxa: {d.rate}% a.m.
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4">
                      <div className="text-left sm:text-right mr-2">
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-0.5">
                          Original: {(d.value || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                        </p>
                        <p className="font-black text-[15px] text-[#E80070] dark:text-[#FF66A3]">
                          Total c/ Juros: {((d.value || 0) + (d.amount || 0)).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Botão de excluir com stopPropagation para não ativar o clique do card */}
                        <motion.button
                          whileHover={{ scale: 1.1, backgroundColor: "#E80070", color: "white" }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => d.id && handleDelete(e, d.id)}
                          className="p-2.5 bg-[#E80070]/10 text-[#E80070] dark:bg-[#E80070]/20 dark:text-[#FF66A3] rounded-xl transition-colors flex-shrink-0"
                          title="Excluir dívida"
                        >
                          <Trash2 size={18} />
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}