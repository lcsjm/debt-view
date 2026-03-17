import { useState } from "react";
import * as XLSX from "xlsx";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ptBR } from "date-fns/locale/pt-BR";
import { useDebts, DebtData } from "../hooks/useDebts";
import { Trash2, Plus, Download, CreditCard, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { AppSidebar } from "@/components/AppSidebar";
import { toast } from "@/hooks/use-toast";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const debtSchema = z.object({
  creditor: z.string().min(2, "Nome do credor obrigatório (min. 2 letras)"),
  value: z.string().min(1, "Obrigatório").refine(v => {
    const d = v.replace(/\D/g, "");
    return parseInt(d, 10) > 0;
  }, "Deve ser maior que zero"),
  amount: z.string().optional().or(z.literal("")),
  rate: z.string().optional().or(z.literal("")),
  status: z.string().min(2, "Informe o status (ex: Pendente)"),
});

type DebtForm = z.infer<typeof debtSchema>;

const formatCurrencyInput = (value: string) => {
  const digits = value.replace(/\D/g, "");
  if (!digits) return "";
  const number = parseInt(digits, 10) / 100;
  return new Intl.NumberFormat("pt-BR", { style: "decimal", minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(number);
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
    formState: { errors }
  } = useForm<DebtForm>({
    resolver: zodResolver(debtSchema),
    defaultValues: { creditor: "", value: "", amount: "", rate: "", status: "Pendente" }
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
      toast({ title: "Erro ao salvar", description: e.message, variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDebt(id);
      toast({ title: "Dívida excluída." });
    } catch (e: any) {
      toast({ title: "Erro ao excluir", description: e.message, variant: "destructive" });
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

  const fieldClass = "w-full border border-border bg-background rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring transition-all text-sm";

  return (
    <div className="min-h-screen bg-background">
      <AppSidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />

      <main className={`transition-all duration-300 p-4 md:p-8 space-y-8 ${collapsed ? "ml-[72px]" : "ml-[72px] md:ml-[260px]"}`}>
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Gestão Financeira</p>
            <h1 className="text-2xl md:text-3xl font-heading font-bold text-foreground">Minhas Dívidas</h1>
            <p className="text-muted-foreground text-sm mt-1">Acompanhe, registre e exporte suas dívidas ativas.</p>
          </div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={exportToExcel}
            className="flex items-center gap-2 border border-border bg-card px-4 py-2.5 rounded-xl text-foreground text-sm font-medium hover:bg-muted transition"
          >
            <Download className="w-4 h-4 text-primary" />
            Exportar Excel
          </motion.button>
        </div>

        {/* Resumo */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
            className="bg-card border border-border rounded-2xl p-5 shadow-sm">
            <p className="text-sm text-muted-foreground mb-1">Total em Dívidas</p>
            <p className="text-2xl font-heading font-bold text-destructive">
              {totalDividas.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
            </p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="bg-card border border-border rounded-2xl p-5 shadow-sm">
            <p className="text-sm text-muted-foreground mb-1">Nº de Dívidas</p>
            <p className="text-2xl font-heading font-bold text-foreground">{debts?.length || 0}</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="bg-card border border-border rounded-2xl p-5 shadow-sm">
            <p className="text-sm text-muted-foreground mb-1">Status Pendentes</p>
            <p className="text-2xl font-heading font-bold text-amber-500">
              {debts?.filter(d => d.status === "Pendente").length || 0}
            </p>
          </motion.div>
        </div>

        {/* Formulário */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          
          <h2 className="font-heading font-bold text-lg text-foreground mb-6 flex items-center gap-2">
            <Plus className="w-5 h-5 text-primary" />
            Registrar Nova Dívida
          </h2>

          <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            
            {/* Credor */}
            <div className="sm:col-span-2 lg:col-span-1">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Credor *</label>
              <input {...register("creditor")} placeholder="Ex: Banco Itaú" className={fieldClass} />
              {errors.creditor && <p className="text-destructive text-xs mt-1.5 flex items-center gap-1"><AlertCircle size={12} />{errors.creditor.message}</p>}
            </div>

            {/* Valor Original */}
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Valor Original *</label>
              <div className="flex items-center bg-background border border-border rounded-xl focus-within:ring-2 focus-within:ring-ring transition-all">
                <span className="pl-4 text-muted-foreground text-sm font-medium select-none">R$</span>
                <Controller name="value" control={control} render={({ field: { onChange, value } }) => (
                  <input type="text" inputMode="numeric" placeholder="0,00"
                    className="w-full bg-transparent px-2 py-3 text-foreground outline-none text-sm font-semibold"
                    value={value} onChange={e => onChange(formatCurrencyInput(e.target.value))} />
                )} />
              </div>
              {errors.value && <p className="text-destructive text-xs mt-1.5 flex items-center gap-1"><AlertCircle size={12} />{errors.value.message}</p>}
            </div>

            {/* Valor Atual (com juros) */}
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Juros Acumulados</label>
              <div className="flex items-center bg-background border border-border rounded-xl focus-within:ring-2 focus-within:ring-ring transition-all">
                <span className="pl-4 text-muted-foreground text-sm font-medium select-none">R$</span>
                <Controller name="amount" control={control} render={({ field: { onChange, value } }) => (
                  <input type="text" inputMode="numeric" placeholder="0,00"
                    className="w-full bg-transparent px-2 py-3 text-foreground outline-none text-sm font-semibold"
                    value={value} onChange={e => onChange(formatCurrencyInput(e.target.value))} />
                )} />
              </div>
            </div>

            {/* Taxa */}
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Taxa de Juros (% a.m.)</label>
              <div className="flex items-center bg-background border border-border rounded-xl focus-within:ring-2 focus-within:ring-ring transition-all">
                <input {...register("rate")} type="number" step="0.01" placeholder="0,00"
                  className="w-full bg-transparent px-4 py-3 text-foreground outline-none text-sm font-semibold" />
                <span className="pr-4 text-muted-foreground text-sm font-medium select-none">%</span>
              </div>
            </div>

            {/* Vencimento */}
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Vencimento</label>
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

            {/* Status */}
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Status *</label>
              <select {...register("status")} className={fieldClass}>
                <option value="Pendente">Pendente</option>
                <option value="Em negociação">Em negociação</option>
                <option value="Parcelado">Parcelado</option>
                <option value="Pago">Pago</option>
              </select>
              {errors.status && <p className="text-destructive text-xs mt-1.5 flex items-center gap-1"><AlertCircle size={12} />{errors.status.message}</p>}
            </div>

            {/* Botão */}
            <div className="sm:col-span-2 lg:col-span-3 flex justify-end pt-2 border-t border-border mt-2">
              <motion.button
                type="submit"
                whileTap={{ scale: 0.97 }}
                disabled={isSaving}
                className="bg-primary text-primary-foreground px-8 py-2.5 rounded-xl font-semibold text-sm hover:opacity-90 transition disabled:opacity-50 flex items-center gap-2"
              >
                <Plus size={16} />
                {isSaving ? "Salvando..." : "Registrar Dívida"}
              </motion.button>
            </div>
          </form>
        </motion.div>

        {/* Lista de Dívidas */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="bg-card border border-border rounded-2xl p-6 shadow-sm">

          <h2 className="font-heading font-bold text-lg text-foreground mb-6 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-primary" />
            Dívidas Registradas
          </h2>

          {isLoading ? (
            <p className="text-muted-foreground animate-pulse text-center py-8">Carregando dívidas...</p>
          ) : !debts || debts.length === 0 ? (
            <div className="text-center py-10 bg-muted/20 rounded-xl border border-dashed border-border text-muted-foreground">
              <p className="font-semibold mb-1">Nenhuma dívida registrada ainda.</p>
              <p className="text-sm">Use o formulário acima para começar a acompanhar suas dívidas.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3 max-h-[500px] overflow-y-auto pr-1">
              <AnimatePresence>
                {debts.map((d, i) => (
                  <motion.div
                    key={d.id}
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: i * 0.04 }}
                    className="flex items-center justify-between p-4 bg-muted/40 hover:bg-muted/70 transition-colors rounded-xl border border-transparent hover:border-border"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground truncate">{d.creditor}</p>
                      <div className="flex items-center gap-3 mt-1 flex-wrap">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                          d.status === "Pago" ? "bg-green-500/10 text-green-600 dark:text-green-400" :
                          d.status === "Em negociação" ? "bg-blue-500/10 text-blue-600 dark:text-blue-400" :
                          d.status === "Parcelado" ? "bg-amber-500/10 text-amber-600" :
                          "bg-destructive/10 text-destructive"
                        }`}>
                          {d.status}
                        </span>
                        {d.date && (
                          <span className="text-xs text-muted-foreground">
                            Vence: {new Date(d.date).toLocaleDateString("pt-BR")}
                          </span>
                        )}
                        {(d.rate || 0) > 0 && (
                          <span className="text-xs text-muted-foreground">
                            Taxa: {d.rate}% a.m.
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-right ml-4 flex-shrink-0">
                      <p className="text-xs text-muted-foreground">Original: {(d.value || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</p>
                      <p className="font-bold text-destructive text-sm">
                        Total: {((d.value || 0) + (d.amount || 0)).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                      </p>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => d.id && handleDelete(d.id)}
                      className="ml-4 p-2 bg-destructive/10 text-destructive hover:bg-destructive hover:text-white rounded-lg transition-colors flex-shrink-0"
                    >
                      <Trash2 size={16} />
                    </motion.button>
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
