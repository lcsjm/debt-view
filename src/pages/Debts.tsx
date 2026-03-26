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
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { AppSidebar } from "@/components/AppSidebar";
import { toast } from "@/hooks/use-toast";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Footer from "@/components/footer";

const debtSchema = z.object({
  creditor: z.string().min(2, "Nome do credor obrigatório (min. 2 letras)"),
  value: z
    .string()
    .min(1, "Obrigatório")
    .refine((v) => {
      const d = v.replace(/\D/g, "");
      return parseInt(d, 10) > 0;
    }, "Deve ser maior que zero"),
  amount: z.string().optional().or(z.literal("")),
  rate: z.string().optional().or(z.literal("")),
  status: z.string().min(2, "Informe o status"),
});

type DebtForm = z.infer<typeof debtSchema>;

const formatCurrencyInput = (value: string) => {
  const digits = value.replace(/\D/g, "");
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

export default function Debts() {
  const [activeSection, setActiveSection] = useState("debts");
  const [collapsed, setCollapsed] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const { debts, isLoading, saveDebt, isSaving, deleteDebt } = useDebts();

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<DebtForm>({
    resolver: zodResolver(debtSchema),
    defaultValues: {
      creditor: "",
      value: "",
      amount: "",
      rate: "",
      status: "Pendente",
    },
  });

  const onSubmit = async (data: DebtForm) => {
    try {
      await saveDebt({
        creditor: data.creditor,
        value: parseCurrencyInput(data.value),
        amount: parseCurrencyInput(data.amount || ""),
        rate: parseCurrencyInput(data.rate || ""),
        status: data.status,
        date: selectedDate ? selectedDate.toISOString() : null,
      } as DebtData);
      toast({ title: "Dívida salva com sucesso! ✅" });
      reset();
      setSelectedDate(new Date());
    } catch (e: any) {
      toast({
        title: "Erro ao salvar",
        description: e.message,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDebt(id);
      toast({ title: "Dívida excluída." });
    } catch (e: any) {
      toast({
        title: "Erro ao excluir",
        description: e.message,
        variant: "destructive",
      });
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

  const totalDividas =
    debts?.reduce((acc, d) => acc + (d.value || 0) + (d.amount || 0), 0) || 0;

  // Ajustado o contraste do placeholder no fieldClass para text-slate-500
  const fieldClass =
    "w-full border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 rounded-xl px-4 py-3 text-slate-800 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-[#426DA9]/50 focus:border-[#426DA9] transition-all text-sm backdrop-blur-md";

  return (
    // Fundo sólido removido do container pai
    <div className="min-h-screen relative overflow-hidden text-slate-900 dark:text-slate-100">
      
      {/* Estilos Globais para Scrollbar Customizada + Animação do Gradiente */}
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

      {/* Fundo dinâmico CSS fluido */}
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
        {/* Header - Glassmorphism ajustado para /60 */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/60 dark:bg-slate-900/60 p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/50 backdrop-blur-xl shadow-sm">
          <div>
            <p className="text-sm text-[#426DA9] dark:text-[#8CB4F5] font-semibold mb-1 uppercase tracking-wider">
              Gestão Financeira
            </p>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-[#1D4F91] dark:text-white">
              Minhas Dívidas
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
              Acompanhe, registre e exporte suas dívidas ativas com fluidez.
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={exportToExcel}
            className="flex items-center justify-center gap-2 border border-[#426DA9]/30 bg-white/90 dark:bg-slate-900/90 text-[#1D4F91] dark:text-slate-200 px-5 py-3 rounded-xl text-sm font-semibold hover:bg-[#426DA9] hover:text-white dark:hover:text-white transition-all shadow-sm group"
          >
            <Download className="w-4 h-4 group-hover:animate-bounce" />
            Exportar Excel
          </motion.button>
        </div>

        {/* Resumo Financeiro - Glassmorphism ajustado para /80 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="relative overflow-hidden bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-[#E80070]/20 rounded-3xl p-6 shadow-lg shadow-[#E80070]/5 group hover:border-[#E80070]/40 transition-colors"
          >
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 group-hover:scale-110 transition-all text-[#E80070] dark:text-[#FF66A3]">
              <Wallet size={64} />
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 font-medium mb-2">
              Total em Dívidas
            </p>
            <p className="text-3xl font-black bg-gradient-to-r from-[#E80070] to-[#C1188B] bg-clip-text text-transparent">
              {totalDividas.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="relative overflow-hidden bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-[#77127B]/20 rounded-3xl p-6 shadow-lg shadow-[#77127B]/5 group hover:border-[#77127B]/40 transition-colors"
          >
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 group-hover:scale-110 transition-all text-[#77127B] dark:text-[#C1188B]">
              <Target size={64} />
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 font-medium mb-2">
              Nº de Dívidas
            </p>
            <p className="text-3xl font-black text-[#77127B] dark:text-white">
              {debts?.length || 0}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="relative overflow-hidden bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-[#426DA9]/20 rounded-3xl p-6 shadow-lg shadow-[#426DA9]/5 group hover:border-[#426DA9]/40 transition-colors"
          >
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 group-hover:scale-110 transition-all text-[#426DA9] dark:text-[#8CB4F5]">
              <Activity size={64} />
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 font-medium mb-2">
              Status Pendentes
            </p>
            <p className="text-3xl font-black text-[#426DA9] dark:text-white">
              {debts?.filter((d) => d.status === "Pendente").length || 0}
            </p>
          </motion.div>
        </div>

        {/* Formulário - Glassmorphism ajustado para /80 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border border-slate-200/50 dark:border-slate-800/50 rounded-3xl p-6 md:p-8 shadow-sm"
        >
          <h2 className="font-bold text-xl mb-8 flex items-center gap-3 text-[#1D4F91] dark:text-white">
            <div className="p-2 bg-[#E80070]/10 rounded-lg text-[#E80070]">
              <Plus className="w-5 h-5" />
            </div>
            Registrar Nova Dívida
          </h2>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <div className="sm:col-span-2 lg:col-span-1">
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-2 block">
                Credor *
              </label>
              <input
                {...register("creditor")}
                placeholder="Ex: Banco Itaú"
                className={fieldClass}
              />
              {errors.creditor && (
                <p className="text-[#E80070] text-xs mt-2 flex items-center gap-1">
                  <AlertCircle size={12} />
                  {errors.creditor.message}
                </p>
              )}
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-2 block">
                Valor Original *
              </label>
              <div className="flex items-center bg-white/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl focus-within:ring-2 focus-within:ring-[#426DA9]/50 focus-within:border-[#426DA9] transition-all backdrop-blur-md">
                <span className="pl-4 text-slate-500 text-sm font-medium select-none">
                  R$
                </span>
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
                      onChange={(e) =>
                        onChange(formatCurrencyInput(e.target.value))
                      }
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

            <div>
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-2 block">
                Juros Acumulados
              </label>
              <div className="flex items-center bg-white/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl focus-within:ring-2 focus-within:ring-[#426DA9]/50 focus-within:border-[#426DA9] transition-all backdrop-blur-md">
                <span className="pl-4 text-slate-500 text-sm font-medium select-none">
                  R$
                </span>
                <Controller
                  name="amount"
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="0,00"
                      className="w-full bg-transparent px-3 py-3 text-slate-800 dark:text-slate-100 outline-none text-sm font-semibold placeholder:text-slate-500"
                      value={value}
                      onChange={(e) =>
                        onChange(formatCurrencyInput(e.target.value))
                      }
                    />
                  )}
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-2 block">
                Taxa de Juros (% a.m.)
              </label>
              <div className="flex items-center bg-white/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl focus-within:ring-2 focus-within:ring-[#426DA9]/50 focus-within:border-[#426DA9] transition-all backdrop-blur-md">
                <input
                  {...register("rate")}
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  className="w-full bg-transparent px-4 py-3 text-slate-800 dark:text-slate-100 outline-none text-sm font-semibold placeholder:text-slate-500"
                />
                <span className="pr-4 text-slate-500 text-sm font-medium select-none">
                  %
                </span>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-2 block">
                Vencimento
              </label>
              <DatePicker
                selected={selectedDate}
                onChange={(date) => setSelectedDate(date)}
                dateFormat="dd/MM/yyyy"
                locale={ptBR}
                placeholderText="dd/mm/aaaa"
                className={fieldClass}
                showPopperArrow={false}
                autoComplete="off"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-2 block">
                Status *
              </label>
              <select {...register("status")} className={fieldClass}>
                <option value="Pendente">Pendente</option>
                <option value="Em negociação">Em negociação</option>
                <option value="Parcelado">Parcelado</option>
                <option value="Pago">Pago</option>
              </select>
              {errors.status && (
                <p className="text-[#E80070] text-xs mt-2 flex items-center gap-1">
                  <AlertCircle size={12} />
                  {errors.status.message}
                </p>
              )}
            </div>

            <div className="sm:col-span-2 lg:col-span-3 flex justify-end pt-4 border-t border-slate-200/50 dark:border-slate-800/50 mt-2">
              <motion.button
                type="submit"
                whileHover={{
                  scale: 1.02,
                  boxShadow: "0 10px 25px -5px rgba(232, 0, 112, 0.4)",
                }}
                whileTap={{ scale: 0.97 }}
                disabled={isSaving}
                className="bg-gradient-to-r from-[#E80070] to-[#C1188B] text-white px-8 py-3.5 rounded-xl font-bold text-sm transition-all disabled:opacity-50 flex items-center gap-2"
              >
                <Plus size={18} />
                {isSaving ? "Salvando..." : "Registrar Dívida"}
              </motion.button>
            </div>
          </form>
        </motion.div>

        {/* Lista de Dívidas - Glassmorphism ajustado para /80 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border border-slate-200/50 dark:border-slate-800/50 rounded-3xl p-6 md:p-8 shadow-sm"
        >
          <h2 className="font-bold text-xl mb-6 flex items-center gap-3 text-[#1D4F91] dark:text-white">
            <div className="p-2 bg-[#1D4F91]/10 rounded-lg text-[#1D4F91] dark:text-[#8CB4F5]">
              <CreditCard className="w-5 h-5" />
            </div>
            Dívidas Registradas
          </h2>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 opacity-50">
              <div className="w-8 h-8 border-4 border-[#426DA9] border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-[#426DA9] dark:text-slate-300 font-medium">
                Carregando dívidas...
              </p>
            </div>
          ) : !debts || debts.length === 0 ? (
            <div className="text-center py-16 bg-white/50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-[#426DA9]/30 text-slate-600 dark:text-slate-400">
              <Wallet className="w-12 h-12 mx-auto mb-4 text-[#426DA9]/40" />
              <p className="font-bold text-[#1D4F91] dark:text-white text-lg mb-1">
                Tudo limpo por aqui!
              </p>
              <p className="text-sm dark:text-slate-400">
                Use o formulário acima para registrar sua primeira dívida.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3 max-h-[500px] overflow-y-auto pr-2 custom-scroll">
              <AnimatePresence>
                {debts.map((d, i) => (
                  <motion.div
                    key={d.id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95, x: 20 }}
                    transition={{
                      delay: i * 0.05,
                      type: "spring",
                      stiffness: 300,
                      damping: 24,
                    }}
                    className="group flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-white/95 dark:bg-slate-800/95 rounded-2xl border border-slate-100 dark:border-slate-700 hover:border-[#426DA9]/40 hover:shadow-lg hover:shadow-[#426DA9]/5 transition-all backdrop-blur-sm"
                  >
                    <div className="flex-1 min-w-0 mb-4 sm:mb-0">
                      <p className="font-bold text-lg truncate text-[#1D4F91] dark:text-white">
                        {d.creditor}
                      </p>
                      <div className="flex items-center gap-3 mt-2 flex-wrap">
                        <span
                          className={`text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md ${
                            d.status === "Pago"
                              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                              : d.status === "Em negociação"
                                ? "bg-[#77127B]/10 text-[#77127B] dark:bg-[#77127B]/20 dark:text-[#E88CEE]"
                                : d.status === "Parcelado"
                                  ? "bg-[#426DA9]/10 text-[#426DA9] dark:bg-[#426DA9]/20 dark:text-[#8CB4F5]"
                                  : "bg-[#E80070]/10 text-[#E80070] dark:bg-[#E80070]/20 dark:text-[#FF85BB]"
                          }`}
                        >
                          {d.status}
                        </span>
                        {d.date && (
                          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                            Vence:{" "}
                            {new Date(d.date).toLocaleDateString("pt-BR")}
                          </span>
                        )}
                        {(d.rate || 0) > 0 && (
                          <span className="text-xs font-medium text-[#C1188B] dark:text-[#E88CEE]">
                            Taxa: {d.rate}% a.m.
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-6">
                      <div className="text-left sm:text-right">
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-0.5">
                          Original:{" "}
                          {(d.value || 0).toLocaleString("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          })}
                        </p>
                        <p className="font-black text-[15px] text-[#E80070] dark:text-[#FF66A3]">
                          Total:{" "}
                          {((d.value || 0) + (d.amount || 0)).toLocaleString(
                            "pt-BR",
                            { style: "currency", currency: "BRL" },
                          )}
                        </p>
                      </div>

                      <motion.button
                        whileHover={{
                          scale: 1.1,
                          backgroundColor: "#E80070",
                          color: "white",
                        }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => d.id && handleDelete(d.id)}
                        className="p-2.5 bg-[#E80070]/10 text-[#E80070] dark:bg-[#E80070]/20 dark:text-[#FF66A3] rounded-xl transition-colors flex-shrink-0"
                        title="Excluir dívida"
                      >
                        <Trash2 size={18} />
                      </motion.button>
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