import { useState } from "react";
import { motion } from "framer-motion";
import {
  AlertCircle, TrendingUp, TrendingDown, Layers, CalendarDays
} from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "@/hooks/use-toast";
import { useTransactions } from "@/hooks/useTransactions";
import { TransactionList } from "./TransactionsList";

// ─── Helpers ──────────────────────────────────────────────────────────────────

export const todayISO = () => {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

export const formatDateDisplay = (iso: string) => {
  if (!iso) return "";
  const [yyyy, mm, dd] = iso.split("-");
  return `${dd}/${mm}/${yyyy}`;
};

// Máscara para o input de data (DD/MM/AAAA)
export const formatDateInputMask = (value: string) => {
  const v = value.replace(/\D/g, "").slice(0, 8);
  if (v.length >= 5) {
    return `${v.slice(0, 2)}/${v.slice(2, 4)}/${v.slice(4)}`;
  } else if (v.length >= 3) {
    return `${v.slice(0, 2)}/${v.slice(2)}`;
  }
  return v;
};

// Converte DD/MM/AAAA de volta para ISO AAAA-MM-DD para salvar e para o calendário nativo
export const parseDateToISO = (brDate: string) => {
  // Retorna vazio se incompleto para não bugar o calendário nativo enquanto digita
  if (!brDate || brDate.length !== 10) return ""; 
  const [dd, mm, yyyy] = brDate.split("/");
  return `${yyyy}-${mm}-${dd}`;
};

// ─── Config de tipo ───────────────────────────────────────────────────────────

export const TYPE_CONFIG: Record<string, {
  color: string; bg: string; border: string;
  icon: React.ReactNode; label: string; sign: string;
}> = {
  Investimento: {
    color: "#1D4F91", 
    bg: "rgba(29, 79, 145, 0.08)",
    border: "rgba(29, 79, 145, 0.25)",
    icon: <Layers size={13} />,
    label: "Investimento",
    sign: "▲"
  },
  Renda: {
    color: "#1E8449", 
    bg: "rgba(30, 132, 73, 0.08)",
    border: "rgba(30, 132, 73, 0.25)",
    icon: <TrendingUp size={13} />,
    label: "Renda",
    sign: "+"
  },
  Despesa: {
    color: "#E80070", 
    bg: "rgba(232, 0, 112, 0.08)",
    border: "rgba(232, 0, 112, 0.25)",
    icon: <TrendingDown size={13} />,
    label: "Despesa",
    sign: "−"
  }
};

// ─── Schema ───────────────────────────────────────────────────────────────────

const transactionSchema = z.object({
  category: z.string().min(3, "Min. 3 letras"),
  value: z.string().min(1, "Obrigatório").refine((val) => {
    const digits = val.replace(/\D/g, "");
    return parseInt(digits, 10) > 0;
  }, "Maior que zero"),
  type: z.enum(["Renda", "Despesa", "Investimento"], {
    errorMap: () => ({ message: "Obrigatório" })
  }),
  date: z.string().length(10, "Data incompleta")
});

type TransactionForm = z.infer<typeof transactionSchema>;

// ─── Moeda ────────────────────────────────────────────────────────────────────

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
  const digits = value.replace(/\D/g, "");
  if (!digits) return 0;
  return parseInt(digits, 10) / 100;
};

// ─── Estilos dinâmicos com Tailwind ───────────────────────────────────────────

const labelClass = "block text-xs font-bold mb-1.5 uppercase tracking-wider text-[#1D4F91] dark:text-white";

const getInputBaseClass = (hasError: boolean) => `
  w-full bg-background rounded-lg text-sm font-semibold outline-none transition-all duration-300 h-[42px] border-2
  ${hasError 
    ? "border-[#E80070] focus:border-[#E80070] focus:ring-4 focus:ring-[#E80070]/20 text-[#E80070] dark:border-[#E80070]/80" 
    : "border-[#1D4F91]/20 dark:border-[#426DA9]/30 hover:border-[#426DA9]/60 dark:hover:border-[#426DA9]/60 focus:border-[#1D4F91] dark:focus:border-[#426DA9] focus:ring-4 focus:ring-[#426DA9]/20 text-foreground"
  }
`;

// ─── Componente principal ─────────────────────────────────────────────────────

export default function TransactionSection() {
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const isEditing = editingId !== null;

  const {
    transactions = [],
    isLoading,
    addTransaction,
    updateTransaction,
    deleteTransaction
  } = useTransactions();

  const {
    register,
    handleSubmit,
    control,
    setValue: setFormValue,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<TransactionForm>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      category: "",
      value: "",
      type: undefined as any,
      date: formatDateDisplay(todayISO())
    }
  });

  const filteredTransactions = transactions.filter((item) =>
    item.category.toLowerCase().includes(search.toLowerCase())
  );

  async function onSubmit(data: TransactionForm) {
    const numericValue = parseCurrencyInput(data.value);
    const isoDate = parseDateToISO(data.date) || todayISO(); // Garante o ISO ao salvar
    
    try {
      if (isEditing) {
        await updateTransaction({
          id: editingId,
          value: numericValue,
          type: data.type,
          category: data.category,
          date: isoDate 
        });
        toast({ title: "Transação atualizada!" });
        setEditingId(null);
      } else {
        await addTransaction({
          value: numericValue,
          type: data.type,
          category: data.category,
          date: isoDate
        });
        toast({ title: "Transação adicionada!" });
      }
      resetForm();
    } catch (err: any) {
      toast({
        title: isEditing ? "Erro na edição" : "Erro ao criar",
        description: err.message,
        variant: "destructive"
      });
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteTransaction(id);
      toast({ title: "Transação removida" });
    } catch (err: any) {
      toast({ title: "Erro ao deletar", description: err.message, variant: "destructive" });
    }
  }

  function startEdit(item: any) {
    setEditingId(item.id);
    setFormValue("category", item.category);
    setFormValue("value", formatCurrencyInput((item.value * 100).toFixed(0)));
    setFormValue("type", item.type as any);
    setFormValue("date", formatDateDisplay(item.date ?? todayISO()));
  }

  function resetForm() {
    reset({ category: "", value: "", type: undefined as any, date: formatDateDisplay(todayISO()) });
  }

  function cancelEdit() {
    setEditingId(null);
    resetForm();
  }

  function toggleEdit(item: any) {
    editingId === item.id ? cancelEdit() : startEdit(item);
  }

  return (
    <section
      className="relative overflow-y-auto max-h-[85vh] rounded-2xl bg-background border border-[#1D4F91]/15 dark:border-[#426DA9]/20 shadow-xl
      [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[#426DA9]/30 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-[#426DA9]/60 transition-colors"
    >
      <div className="px-7 pt-6 pb-5 bg-gradient-to-br from-[#1D4F91] via-[#426DA9] to-[#77127B]">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center rounded-xl shrink-0 w-12 h-12 bg-white/15 backdrop-blur-md shadow-inner border border-white/20">
            <Layers size={24} className="text-white" />
          </div>
          <div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight drop-shadow-md">
              Registre suas Finanças
            </h2>
            <p className="text-sm text-white/80 font-medium mt-0.5">
              Receitas, despesas e investimentos
            </p>
          </div>
        </div>
      </div>

      <div className="px-7 pt-6 pb-7">

        <form
          onSubmit={handleSubmit(onSubmit)}
          onKeyDown={(e) => {
            if (e.key === "Enter") { e.preventDefault(); handleSubmit(onSubmit)(); }
          }}
          className="rounded-xl p-6 mb-8 bg-[#1D4F91]/[0.02] dark:bg-white/[0.03] border border-[#1D4F91]/10 dark:border-white/10 shadow-inner transition-all hover:bg-[#1D4F91]/[0.04] dark:hover:bg-white/[0.05]"
        >
          <div className="flex items-center gap-2 mb-5">
            <div className={`w-2 h-2 rounded-full ${isEditing ? 'bg-[#77127B] dark:bg-[#C1188B] animate-pulse' : 'bg-[#426DA9]'}`} />
            <p className="text-xs font-bold uppercase tracking-widest text-[#426DA9] dark:text-white">
              {isEditing ? "Editando lançamento" : "Novo lançamento"}
            </p>
          </div>

          <div className="flex flex-wrap items-start gap-5">

            {/* 1 ── Categoria */}
            <div className="flex-[2] min-w-[200px]">
              <label className={labelClass}>Categoria / Descrição</label>
              <input
                {...register("category")}
                type="text"
                placeholder="Ex: Supermercado, Salário..."
                className={`px-3 ${getInputBaseClass(!!errors.category)}`}
              />
              {errors.category && (
                <motion.span
                  initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-1 text-xs mt-1.5 font-bold text-[#E80070] dark:text-[#E80070]"
                >
                  <AlertCircle size={12} /> {errors.category.message}
                </motion.span>
              )}
            </div>

            {/* 2 ── Valor */}
            <div className="flex-1 min-w-[140px]">
              <label className={labelClass}>Valor</label>
              <div className={`flex items-center px-3 ${getInputBaseClass(!!errors.value)}`}>
                <span className="text-sm font-bold text-[#426DA9] dark:text-white select-none mr-1">R$</span>
                <Controller
                  name="value"
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="0,00"
                      className="w-full bg-transparent outline-none text-sm font-bold placeholder:text-muted-foreground/50"
                      value={value}
                      onChange={(e) => onChange(formatCurrencyInput(e.target.value))}
                    />
                  )}
                />
              </div>
              {errors.value && (
                <motion.span
                  initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-1 text-xs mt-1.5 font-bold text-[#E80070]"
                >
                  <AlertCircle size={12} /> {errors.value.message}
                </motion.span>
              )}
            </div>

            {/* 3 ── Tipo */}
            <div className="flex-1 min-w-[150px]">
              <label className={labelClass}>Tipo</label>
              <select
                {...register("type")}
                className={`px-3 cursor-pointer ${getInputBaseClass(!!errors.type)}`}
              >
                <option value="">Selecione...</option>
                <option value="Investimento">Investimento</option>
                <option value="Renda">Renda</option>
                <option value="Despesa">Despesa</option>
              </select>
              {errors.type && (
                <motion.span
                  initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-1 text-xs mt-1.5 font-bold text-[#E80070]"
                >
                  <AlertCircle size={12} /> {errors.type.message}
                </motion.span>
              )}
            </div>

            {/* 4 ── Data (Com Máscara + Calendário Nativo) */}
            <div className="flex-1 min-w-[160px]">
              <label className={labelClass}>Data</label>
              <div className={`flex items-center px-3 gap-2 ${getInputBaseClass(!!errors.date)}`}>
                <Controller
                  name="date"
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <>
                      {/* Ícone Wrapper: Input nativo invisível sobreposto ao ícone */}
                      <div className="relative flex-shrink-0 flex items-center justify-center w-5 h-5 overflow-hidden">
                        <CalendarDays size={16} className="text-[#426DA9] dark:text-white absolute pointer-events-none" />
                        <input
                          type="date"
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                          max={todayISO()}
                          value={parseDateToISO(value)}
                          onChange={(e) => {
                            if (e.target.value) {
                              onChange(formatDateDisplay(e.target.value));
                            }
                          }}
                        />
                      </div>

                      {/* Input de Texto visível com máscara */}
                      <input
                        type="text"
                        inputMode="numeric"
                        placeholder="DD/MM/AAAA"
                        maxLength={10}
                        className="w-full bg-transparent outline-none text-sm font-semibold placeholder:text-muted-foreground/50"
                        value={value}
                        onChange={(e) => onChange(formatDateInputMask(e.target.value))}
                      />
                    </>
                  )}
                />
              </div>
              {errors.date && (
                <motion.span
                  initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-1 text-xs mt-1.5 font-bold text-[#E80070]"
                >
                  <AlertCircle size={12} /> {errors.date.message}
                </motion.span>
              )}
            </div>

            {/* ── Botões ── */}
            <div className="w-full flex gap-3 justify-end mt-2 md:mt-6 md:w-auto">
              {isEditing && (
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="px-5 py-2.5 rounded-lg text-sm font-bold transition-all border-2 border-[#1D4F91]/20 text-[#1D4F91] hover:bg-[#1D4F91]/10 dark:border-white/50 dark:text-white dark:hover:bg-white/10 active:scale-95"
                >
                  Cancelar
                </button>
              )}
              
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-6 py-2.5 rounded-lg text-sm font-bold text-white transition-all flex items-center justify-center gap-2 disabled:opacity-60 active:scale-95
                  ${isEditing 
                    ? "bg-gradient-to-r from-[#77127B] to-[#C1188B] hover:shadow-lg hover:shadow-[#C1188B]/40 hover:-translate-y-0.5" 
                    : "bg-gradient-to-r from-[#1D4F91] to-[#426DA9] hover:shadow-lg hover:shadow-[#426DA9]/40 hover:-translate-y-0.5"
                  }`}
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Processando
                  </span>
                ) : isEditing ? "Salvar Edição" : "Lançar"}
              </button>
            </div>

          </div>
        </form>

        {/* ── Lista ──────────────────────────────────────────────────────── */}
        <TransactionList
          transactions={transactions}
          filteredTransactions={filteredTransactions}
          search={search}
          setSearch={setSearch}
          editingId={editingId}
          toggleEdit={toggleEdit}
          deleteTransaction={handleDelete}
          TYPE_CONFIG={TYPE_CONFIG}
          formatDateDisplay={formatDateDisplay}
          isLoading={isLoading}
        />

      </div>
    </section>
  );
}