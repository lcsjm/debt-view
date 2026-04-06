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

/** Retorna hoje em YYYY-MM-DD no fuso local do usuário */
export const todayISO = () => {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

/** YYYY-MM-DD → DD/MM/YYYY para exibição */
export const formatDateDisplay = (iso: string) => {
  if (!iso) return "";
  const [yyyy, mm, dd] = iso.split("-");
  return `${dd}/${mm}/${yyyy}`;
};

// ─── Config de tipo (Investimento=azul, Renda=verde, Despesa=vermelho) ────────

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
    color: "#C0392B",
    bg: "rgba(192, 57, 43, 0.08)",
    border: "rgba(192, 57, 43, 0.25)",
    icon: <TrendingDown size={13} />,
    label: "Despesa",
    sign: "−"
  }
};

// ─── Schema: ordem Categoria → Valor → Tipo → Data ───────────────────────────

const transactionSchema = z.object({
  category: z.string().min(3, "Min. 3 letras"),
  value: z.string().min(1, "Obrigatório").refine((val) => {
    const digits = val.replace(/\D/g, "");
    return parseInt(digits, 10) > 0;
  }, "Maior que zero"),
  type: z.enum(["Renda", "Despesa", "Investimento"], {
    errorMap: () => ({ message: "Obrigatório" })
  }),
  date: z.string().min(1, "Obrigatório")
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

// ─── Estilos compartilhados do form ──────────────────────────────────────────

const labelStyle: React.CSSProperties = { color: "#1D4F91" };

const inputBase = (hasError: boolean): React.CSSProperties => ({
  border: hasError ? "1.5px solid #C0392B" : "1.5px solid rgba(29,79,145,0.2)",
  background: "var(--color-background-primary)",
  color: "var(--color-text-primary)"
});

const errorColor = "#C0392B";

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
      date: todayISO()        // ← sempre hoje ao abrir/resetar
    }
  });

  // ── Lista filtrada por busca (mês é gerenciado internamente pelo filho) ────
  const filteredTransactions = transactions.filter((item) =>
    item.category.toLowerCase().includes(search.toLowerCase())
  );

  // ── Submit ────────────────────────────────────────────────────────────────
  async function onSubmit(data: TransactionForm) {
    const numericValue = parseCurrencyInput(data.value);
    try {
      if (isEditing) {
        await updateTransaction({
          id: editingId,
          value: numericValue,
          type: data.type,
          category: data.category,
          date: data.date
        });
        toast({ title: "Transação atualizada!" });
        setEditingId(null);
      } else {
        await addTransaction({
          value: numericValue,
          type: data.type,
          category: data.category,
          date: data.date
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

  // ── Delete ────────────────────────────────────────────────────────────────
  async function handleDelete(id: string) {
    try {
      await deleteTransaction(id);
      toast({ title: "Transação removida" });
    } catch (err: any) {
      toast({ title: "Erro ao deletar", description: err.message, variant: "destructive" });
    }
  }

  // ── Edição ────────────────────────────────────────────────────────────────
  function startEdit(item: any) {
    setEditingId(item.id);
    setFormValue("category", item.category);
    setFormValue("value", formatCurrencyInput((item.value * 100).toFixed(0)));
    setFormValue("type", item.type as any);
    setFormValue("date", item.date ?? todayISO());
  }

  function resetForm() {
    reset({ category: "", value: "", type: undefined as any, date: todayISO() });
  }

  function cancelEdit() {
    setEditingId(null);
    resetForm();
  }

  function toggleEdit(item: any) {
    editingId === item.id ? cancelEdit() : startEdit(item);
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <section
      className="relative overflow-hidden rounded-2xl p-0 shadow-lg"
      style={{
        background: "var(--color-background-primary)",
        border: "1px solid rgba(29,79,145,0.15)"
      }}
    >
      {/* Header gradiente */}
      <div
        className="px-7 pt-6 pb-5"
        style={{ background: "linear-gradient(135deg, #1D4F91 0%, #426DA9 60%, #77127B 100%)" }}
      >
        <div className="flex items-center gap-3">
          <div
            className="flex items-center justify-center rounded-xl shrink-0"
            style={{
              width: 40, height: 40,
              background: "rgba(255,255,255,0.15)",
              backdropFilter: "blur(4px)"
            }}
          >
            <Layers size={20} color="#fff" />
          </div>
          <div>
          <h2 className="text-3xl md:text-4xl font-extrabold 
  text-transparent bg-clip-text 
  bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500
  tracking-tight 
  drop-shadow-sm">
    Registre suas Finanças
  </h2>
            <p className="text-xs" style={{ color: "rgba(255,255,255,0.65)" }}>
              Receitas, despesas e investimentos
            </p>
          </div>
        </div>
      </div>

      <div className="px-7 pt-6 pb-7">

        {/* ── Formulário ─────────────────────────────────────────────────── */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          onKeyDown={(e) => {
            if (e.key === "Enter") { e.preventDefault(); handleSubmit(onSubmit)(); }
          }}
          className="rounded-xl p-5 mb-7"
          style={{ background: "rgba(29,79,145,0.03)", border: "1px solid rgba(29,79,145,0.12)" }}
        >
          <p className="text-xs font-semibold mb-4 uppercase tracking-widest" style={{ color: "#426DA9" }}>
            {isEditing ? "✎ Editando lançamento" : "Novo lançamento"}
          </p>

          <div className="flex flex-wrap items-start gap-4">

            {/* 1 ── Categoria */}
            <div className="flex-[2] min-w-[200px]">
              <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={labelStyle}>
                Categoria / Descrição
              </label>
              <input
                {...register("category")}
                type="text"
                placeholder="Ex: Supermercado, Salário..."
                className="w-full rounded-lg px-3 py-2.5 text-sm font-semibold outline-none transition-all h-[42px]"
                style={inputBase(!!errors.category)}
              />
              {errors.category && (
                <motion.span
                  initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-1 text-xs mt-1.5 font-medium"
                  style={{ color: errorColor }}
                >
                  <AlertCircle size={11} /> {errors.category.message}
                </motion.span>
              )}
            </div>

            {/* 2 ── Valor */}
            <div className="flex-1 min-w-[130px]">
              <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={labelStyle}>
                Valor
              </label>
              <div
                className="flex items-center rounded-lg transition-all h-[42px]"
                style={inputBase(!!errors.value)}
              >
                <span className="pl-3 text-sm font-bold select-none" style={{ color: "#426DA9" }}>R$</span>
                <Controller
                  name="value"
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="0,00"
                      className="w-full bg-transparent px-2 outline-none text-sm font-bold"
                      style={{ color: "var(--color-text-primary)" }}
                      value={value}
                      onChange={(e) => onChange(formatCurrencyInput(e.target.value))}
                    />
                  )}
                />
              </div>
              {errors.value && (
                <motion.span
                  initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-1 text-xs mt-1.5 font-medium"
                  style={{ color: errorColor }}
                >
                  <AlertCircle size={11} /> {errors.value.message}
                </motion.span>
              )}
            </div>

            {/* 3 ── Tipo */}
            <div className="flex-1 min-w-[140px]">
              <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={labelStyle}>
                Tipo
              </label>
              <select
                {...register("type")}
                className="w-full rounded-lg px-3 py-2.5 text-sm font-semibold outline-none transition-all h-[42px] cursor-pointer"
                style={inputBase(!!errors.type)}
              >
                <option value="">Selecione...</option>
                <option value="Investimento">Investimento</option>
                <option value="Renda">Renda fixa</option>
                <option value="Renda">Renda variável</option>
                <option value="Despesa">Gasto fixo</option>
                <option value="Despesa">Gasto variável</option>
              </select>
              {errors.type && (
                <motion.span
                  initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-1 text-xs mt-1.5 font-medium"
                  style={{ color: errorColor }}
                >
                  <AlertCircle size={11} /> {errors.type.message}
                </motion.span>
              )}
            </div>

            {/* 4 ── Data */}
            <div className="flex-1 min-w-[160px]">
              <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={labelStyle}>
                Data
              </label>
              <div
                className="flex items-center rounded-lg transition-all h-[42px] gap-2 px-3"
                style={inputBase(!!errors.date)}
              >
                <CalendarDays size={15} style={{ color: "#426DA9", flexShrink: 0 }} />
                <Controller
                  name="date"
                  control={control}
                  render={({ field }) => (
                    <input
                      type="date"
                      className="w-full bg-transparent outline-none text-sm font-semibold"
                      style={{ color: "var(--color-text-primary)", colorScheme: "light dark" }}
                      max={todayISO()}
                      {...field}
                    />
                  )}
                />
              </div>
              {errors.date && (
                <motion.span
                  initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-1 text-xs mt-1.5 font-medium"
                  style={{ color: errorColor }}
                >
                  <AlertCircle size={11} /> {errors.date.message}
                </motion.span>
              )}
            </div>

            {/* ── Botões ── */}
            <div className="w-full flex gap-3 justify-end mt-1 md:mt-6 md:w-auto">
              {isEditing && (
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.96 }}
                  onClick={cancelEdit}
                  className="px-4 py-2.5 rounded-lg text-sm font-semibold transition-all"
                  style={{
                    border: "1.5px solid rgba(29,79,145,0.25)",
                    color: "#1D4F91",
                    background: "transparent"
                  }}
                >
                  Cancelar
                </motion.button>
              )}
              <motion.button
                type="submit"
                whileTap={{ scale: 0.96 }}
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 disabled:opacity-50"
                style={{
                  background: isEditing
                    ? "linear-gradient(135deg, #77127B, #C1188B)"
                    : "linear-gradient(135deg, #1D4F91, #426DA9)",
                  color: "#fff",
                  boxShadow: isEditing
                    ? "0 4px 14px rgba(193,24,139,0.3)"
                    : "0 4px 14px rgba(29,79,145,0.3)"
                }}
              >
                {isSubmitting ? "Processando..." : isEditing ? "Salvar Edição" : "Lançar"}
              </motion.button>
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
