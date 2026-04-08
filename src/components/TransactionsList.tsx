import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Pencil, X, Layers, CalendarDays, ChevronLeft, ChevronRight, Search } from "lucide-react";
import ExportExcelButton from "./exportexcel";

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface TypeConfig {
  color: string;
  bg: string;
  border: string;
  icon: React.ReactNode;
  label: string;
  sign: string;
}

interface TransactionListProps {
  transactions: any[];
  filteredTransactions: any[];
  search: string;
  setSearch: (v: string) => void;
  editingId: string | null;
  toggleEdit: (item: any) => void;
  deleteTransaction: (id: string) => void;
  TYPE_CONFIG: Record<string, TypeConfig>;
  formatDateDisplay: (iso: string) => string;
  isLoading?: boolean;
}

// ─── Helpers de mês ──────────────────────────────────────────────────────────

const MESES_PT = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

const currentYearMonth = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};

const labelMes = (ym: string) => {
  if (!ym) return "";
  const [yyyy, mm] = ym.split("-");
  return `${MESES_PT[parseInt(mm, 10) - 1]} ${yyyy}`;
};

const navegarMes = (ym: string, delta: number) => {
  const [yyyy, mm] = ym.split("-").map(Number);
  const d = new Date(yyyy, mm - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};

const sortByType = (a: any, b: any) => {
  const priority: Record<string, number> = { Investimento: 1, Renda: 2, Despesa: 3 };
  const pa = priority[a.type] || 4;
  const pb = priority[b.type] || 4;
  if (pa !== pb) return pa - pb;
  return b.value - a.value;
};

// ─── Componente ───────────────────────────────────────────────────────────────

export function TransactionList({
  transactions,
  filteredTransactions,
  search,
  setSearch,
  editingId,
  toggleEdit,
  deleteTransaction,
  TYPE_CONFIG,
  formatDateDisplay,
  isLoading = false,
}: TransactionListProps) {

  const [mesSelecionado, setMesSelecionado] = useState<string>(currentYearMonth());
  const [filtroTipo, setFiltroTipo] = useState<"Todos" | "Investimento" | "Renda" | "Despesa">("Todos");

  const listaFinal = useMemo(() => {
    return filteredTransactions
      .filter((item) => {
        const itemMes = (item.date ?? "").slice(0, 7);
        const mesOk = itemMes === mesSelecionado;
        const tipoOk = filtroTipo === "Todos" || item.type === filtroTipo;
        return mesOk && tipoOk;
      })
      .sort(sortByType);
  }, [filteredTransactions, mesSelecionado, filtroTipo]);

  const totais = useMemo(() => {
    const base = filteredTransactions.filter(
      (item) => (item.date ?? "").slice(0, 7) === mesSelecionado
    );
    return {
      renda: base.filter(t => t.type === "Renda").reduce((s, t) => s + t.value, 0),
      despesa: base.filter(t => t.type === "Despesa").reduce((s, t) => s + t.value, 0),
      investimento: base.filter(t => t.type === "Investimento").reduce((s, t) => s + t.value, 0),
    };
  }, [filteredTransactions, mesSelecionado]);

  const fmt = (v: number) => v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  // Botões de filtro ajustados para usar um azul claro (#60A5FA) no dark mode
  const tiposBotao = [
    { key: "Todos", label: "Todos", colorClass: "text-[#426DA9] dark:text-[#60A5FA] border-[#426DA9]/40 dark:border-[#60A5FA]/40", activeClass: "bg-[#1D4F91] border-[#1D4F91] text-white dark:bg-[#60A5FA] dark:border-[#60A5FA] dark:text-gray-900" },
    { key: "Investimento", label: "Investimento", colorClass: "text-[#1D4F91] dark:text-[#60A5FA] border-[#1D4F91]/40 dark:border-[#60A5FA]/40", activeClass: "bg-[#1D4F91] border-[#1D4F91] text-white dark:bg-[#60A5FA] dark:border-[#60A5FA] dark:text-gray-900" },
    { key: "Renda", label: "Renda", colorClass: "text-[#1E8449] border-[#1E8449]/40", activeClass: "bg-[#1E8449] border-[#1E8449] text-white" },
    { key: "Despesa", label: "Despesa", colorClass: "text-[#E80070] border-[#E80070]/40", activeClass: "bg-[#E80070] border-[#E80070] text-white" },
  ] as const;

  return (
    <div className="flex flex-col h-full w-full">

      {/* ── Navegação de mês ─────────────────────────────────────────────── */}
      <div className="flex items-center justify-between rounded-xl px-4 py-3 mb-3 bg-[#1D4F91]/5 border border-[#1D4F91]/10 dark:bg-[#60A5FA]/10 dark:border-[#60A5FA]/20 transition-colors">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setMesSelecionado(m => navegarMes(m, -1))}
          className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#1D4F91]/10 text-[#1D4F91] hover:bg-[#1D4F91]/20 border border-[#1D4F91]/20 dark:bg-[#60A5FA]/10 dark:text-[#60A5FA] dark:hover:bg-[#60A5FA]/20 dark:border-[#60A5FA]/30 transition-all"
        >
          <ChevronLeft size={16} />
        </motion.button>

        <div className="flex items-center gap-2">
          <CalendarDays size={15} className="text-[#426DA9] dark:text-[#60A5FA]" />
          <span className="font-bold text-sm text-[#1D4F91] dark:text-[#60A5FA]">
            {labelMes(mesSelecionado)}
          </span>
          {mesSelecionado !== currentYearMonth() && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={() => setMesSelecionado(currentYearMonth())}
              className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#E80070]/10 text-[#E80070] border border-[#E80070]/20 hover:bg-[#E80070]/20 transition-colors"
            >
              Hoje
            </motion.button>
          )}
        </div>

        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setMesSelecionado(m => navegarMes(m, +1))}
          className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#1D4F91]/10 text-[#1D4F91] hover:bg-[#1D4F91]/20 border border-[#1D4F91]/20 dark:bg-[#60A5FA]/10 dark:text-[#60A5FA] dark:hover:bg-[#60A5FA]/20 dark:border-[#60A5FA]/30 transition-all"
        >
          <ChevronRight size={16} />
        </motion.button>
      </div>

      {/* ── Totais do mês ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        {[
          { label: "Investimento", value: totais.investimento, colorClass: "text-[#1D4F91] dark:text-[#60A5FA]", bgClass: "bg-[#1D4F91]/5 border-[#1D4F91]/20 dark:bg-[#60A5FA]/10 dark:border-[#60A5FA]/20", sign: "▲" },
          { label: "Renda", value: totais.renda, colorClass: "text-[#1E8449]", bgClass: "bg-[#1E8449]/10 border-[#1E8449]/20", sign: "+" },
          { label: "Despesa", value: totais.despesa, colorClass: "text-[#E80070]", bgClass: "bg-[#E80070]/10 border-[#E80070]/20", sign: "−" },
        ].map(({ label, value, colorClass, bgClass, sign }) => (
          <div key={label} className={`rounded-xl px-3 py-2.5 flex flex-col gap-0.5 border transition-colors ${bgClass}`}>
            <span className={`text-xs font-semibold uppercase tracking-wider ${colorClass}`}>
              {sign} {label}
            </span>
            <span className={`font-bold text-sm tabular-nums ${colorClass}`}>
              R$ {fmt(value)}
            </span>
          </div>
        ))}
      </div>

      {/* ── Subheader: título + filtros + busca + export ─────────────────── */}
      <div className="flex flex-col gap-3 sticky top-0 z-10 pb-3 mb-2 bg-background border-b border-[#1D4F91]/10 dark:border-[#60A5FA]/20">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base text-foreground dark:text-gray-100">
              Histórico Recente
            </h3>
            <p className="text-xs text-muted-foreground dark:text-gray-400">
              {listaFinal.length} {listaFinal.length === 1 ? "lançamento" : "lançamentos"} em {labelMes(mesSelecionado)}
            </p>
          </div>
          <ExportExcelButton data={listaFinal} />
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {tiposBotao.map(({ key, label, colorClass, activeClass }) => {
            const ativo = filtroTipo === key;
            return (
              <motion.button
                key={key}
                whileTap={{ scale: 0.95 }}
                onClick={() => setFiltroTipo(key)}
                className={`text-xs font-semibold px-3 py-1 rounded-full border transition-all hover:shadow-sm ${ativo ? activeClass : `bg-[#1D4F91]/5 hover:bg-[#1D4F91]/10 dark:bg-[#60A5FA]/10 dark:hover:bg-[#60A5FA]/20 ${colorClass}`}`}
              >
                {label}
              </motion.button>
            );
          })}

          <div className="relative ml-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#426DA9] dark:text-[#60A5FA]" size={14} />
            <input
              type="text"
              placeholder="Buscar..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="rounded-full pl-8 pr-4 py-1 text-sm outline-none transition-all w-44 border border-[#1D4F91]/20 bg-[#1D4F91]/5 text-foreground dark:bg-[#60A5FA]/10 dark:border-[#60A5FA]/30 dark:text-gray-100 dark:placeholder-gray-400 focus:ring-2 focus:ring-[#426DA9]/50 focus:border-[#426DA9] dark:focus:ring-[#60A5FA]/50 dark:focus:border-[#60A5FA] focus:bg-background"
            />
          </div>
        </div>
      </div>

      {/* ── Lista scrollável ─────────────────────────────────────────────── */}
      <div className="flex-1 max-h-[380px] overflow-y-auto pr-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[#426DA9]/30 dark:[&::-webkit-scrollbar-thumb]:bg-[#60A5FA]/30 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-[#426DA9]/60 dark:hover:[&::-webkit-scrollbar-thumb]:bg-[#60A5FA]/50 transition-colors">
        
        {isLoading && (
          <div className="flex flex-col gap-2 pt-1">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 rounded-xl animate-pulse bg-[#1D4F91]/5 border border-[#1D4F91]/10 dark:bg-[#60A5FA]/5 dark:border-[#60A5FA]/10" />
            ))}
          </div>
        )}

        {!isLoading && transactions.length === 0 && (
          <div className="flex flex-col items-center justify-center py-14 rounded-xl bg-[#1D4F91]/5 border-2 border-dashed border-[#1D4F91]/20 dark:bg-[#60A5FA]/5 dark:border-[#60A5FA]/20">
            <div className="mb-3 w-12 h-12 rounded-full flex items-center justify-center bg-[#1D4F91]/10 dark:bg-[#60A5FA]/10">
              <Layers size={22} className="text-[#426DA9] dark:text-[#60A5FA]" />
            </div>
            <p className="font-bold text-sm mb-1 text-foreground dark:text-gray-100">
              Nenhuma transação registrada
            </p>
            <p className="text-xs text-center max-w-[220px] text-muted-foreground dark:text-gray-400">
              Comece adicionando seus ganhos e gastos no formulário acima.
            </p>
          </div>
        )}

        {!isLoading && transactions.length > 0 && listaFinal.length === 0 && (
          <div className="flex flex-col items-center justify-center py-10 rounded-xl bg-[#1D4F91]/5 border-2 border-dashed border-[#1D4F91]/20 dark:bg-[#60A5FA]/5 dark:border-[#60A5FA]/20">
            <CalendarDays size={26} className="text-[#426DA9] dark:text-[#60A5FA] mb-2" />
            <p className="font-semibold text-sm mb-1 text-foreground dark:text-gray-100">
              Nenhum lançamento em {labelMes(mesSelecionado)}
            </p>
            <p className="text-xs text-muted-foreground dark:text-gray-400">
              {search ? `Sem resultados para "${search}"` : "Navegue nos meses ou adicione um lançamento."}
            </p>
          </div>
        )}

        {!isLoading && (
          <div className="flex flex-col gap-2 pt-1 pb-2">
            <AnimatePresence>
              {listaFinal.map((item: any) => {
                const cfg = TYPE_CONFIG[item.type] || TYPE_CONFIG.Despesa;
                const isEditingThis = editingId === item.id;
                const isInvestimento = item.type === "Investimento";

                return (
                  <motion.div
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    transition={{ duration: 0.18 }}
                    key={item.id}
                    className={`flex items-center justify-between px-4 py-3.5 rounded-xl transition-all border ${
                      isEditingThis 
                        ? "bg-[#1D4F91]/10 border-[#1D4F91] ring-2 ring-[#1D4F91]/20 dark:bg-[#60A5FA]/20 dark:border-[#60A5FA] dark:ring-[#60A5FA]/30" 
                        : "bg-[#1D4F91]/[0.03] border-[#1D4F91]/10 hover:bg-[#1D4F91]/[0.06] dark:bg-white/[0.03] dark:border-white/10 dark:hover:bg-white/5"
                    }`}
                  >
                    {/* Esquerda */}
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      {/* O `!` força a sobreposição aos inline-styles do cfg caso seja Investimento no dark mode */}
                      <div
                        className={`flex items-center justify-center w-[34px] h-[34px] rounded-lg shrink-0 border ${
                          isInvestimento ? "dark:!bg-[#60A5FA]/10 dark:!border-[#60A5FA]/30 dark:!text-[#60A5FA]" : ""
                        }`}
                        style={{ background: cfg.bg, borderColor: cfg.border, color: cfg.color }}
                      >
                        {cfg.icon}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-sm truncate text-foreground dark:text-gray-100">
                          {item.category}
                        </p>
                        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                          <span
                            className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                              isInvestimento ? "dark:!bg-[#60A5FA]/10 dark:!text-[#60A5FA]" : ""
                            }`}
                            style={{ background: cfg.bg, color: cfg.color }}
                          >
                            {item.type}
                          </span>
                          {item.date && (
                            <span className="flex items-center gap-1 text-xs font-medium text-muted-foreground dark:text-gray-400">
                              <CalendarDays size={11} />
                              {formatDateDisplay(item.date)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Valor */}
                    <div className="mx-4 text-right shrink-0">
                      <span 
                        className={`font-bold text-base tabular-nums ${isInvestimento ? "dark:!text-[#60A5FA]" : ""}`} 
                        style={{ color: cfg.color }}
                      >
                        {cfg.sign} R$ {item.value.toLocaleString("pt-BR", {
                          minimumFractionDigits: 2, maximumFractionDigits: 2
                        })}
                      </span>
                    </div>

                    {/* Botões */}
                    <div className="flex gap-1.5 shrink-0">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`flex items-center justify-center w-[34px] h-[34px] rounded-lg transition-all border ${
                          isEditingThis
                            ? "bg-[#1D4F91] text-white border-[#1D4F91] dark:bg-[#60A5FA] dark:text-gray-900 dark:border-[#60A5FA]"
                            : "bg-[#426DA9]/10 text-[#426DA9] border-[#426DA9]/20 hover:bg-[#426DA9] hover:text-white dark:bg-[#60A5FA]/10 dark:text-[#60A5FA] dark:border-[#60A5FA]/20 dark:hover:bg-[#60A5FA] dark:hover:text-gray-900"
                        }`}
                        onClick={() => toggleEdit(item)}
                      >
                        {isEditingThis ? <X size={14} /> : <Pencil size={14} />}
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center justify-center w-[34px] h-[34px] rounded-lg transition-all bg-[#E80070]/10 text-[#E80070] border border-[#E80070]/20 hover:bg-[#E80070] hover:text-white dark:bg-[#E80070]/20 dark:hover:bg-[#E80070]"
                        onClick={() => deleteTransaction(item.id)}
                      >
                        <Trash2 size={14} />
                      </motion.button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}