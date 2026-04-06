import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Pencil, X, Layers, CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
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

/** Retorna "YYYY-MM" da data atual */
const currentYearMonth = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};

/** "YYYY-MM" → "Janeiro 2025" */
const labelMes = (ym: string) => {
  if (!ym) return "";
  const [yyyy, mm] = ym.split("-");
  return `${MESES_PT[parseInt(mm, 10) - 1]} ${yyyy}`;
};

/** Navega ±1 mês em "YYYY-MM" */
const navegarMes = (ym: string, delta: number) => {
  const [yyyy, mm] = ym.split("-").map(Number);
  const d = new Date(yyyy, mm - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};

/** Ordena: Investimento → Renda → Despesa, desempate por valor desc */
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

  // ── Lista final: filtra por mês + tipo + busca, depois ordena ────────────
  const listaFinal = useMemo(() => {
    return filteredTransactions
      .filter((item) => {
        const itemMes = (item.date ?? "").slice(0, 7); // "YYYY-MM"
        const mesOk = itemMes === mesSelecionado;
        const tipoOk = filtroTipo === "Todos" || item.type === filtroTipo;
        return mesOk && tipoOk;
      })
      .sort(sortByType);
  }, [filteredTransactions, mesSelecionado, filtroTipo]);

  // ── Totais do mês filtrado ────────────────────────────────────────────────
  const totais = useMemo(() => {
    const base = filteredTransactions.filter(
      (item) => (item.date ?? "").slice(0, 7) === mesSelecionado
    );
    return {
      renda:       base.filter(t => t.type === "Renda").reduce((s, t) => s + t.value, 0),
      despesa:     base.filter(t => t.type === "Despesa").reduce((s, t) => s + t.value, 0),
      investimento: base.filter(t => t.type === "Investimento").reduce((s, t) => s + t.value, 0),
    };
  }, [filteredTransactions, mesSelecionado]);

  const fmt = (v: number) => v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  // ── Botões de filtro por tipo ─────────────────────────────────────────────
  const tiposBotao: Array<{ key: typeof filtroTipo; label: string; color: string; activeBg: string }> = [
    { key: "Todos",       label: "Todos",        color: "#426DA9",  activeBg: "#1D4F91" },
    { key: "Investimento",label: "Investimento",  color: "#1D4F91",  activeBg: "#1D4F91" },
    { key: "Renda",       label: "Renda",         color: "#1E8449",  activeBg: "#1E8449" },
    { key: "Despesa",     label: "Despesa",       color: "#C0392B",  activeBg: "#C0392B" },
  ];

  return (
    <div>

      {/* ── Navegação de mês ─────────────────────────────────────────────── */}
      <div
        className="flex items-center justify-between rounded-xl px-4 py-3 mb-3"
        style={{ background: "rgba(29,79,145,0.05)", border: "1px solid rgba(29,79,145,0.12)" }}
      >
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setMesSelecionado(m => navegarMes(m, -1))}
          className="flex items-center justify-center rounded-lg transition-all"
          style={{
            width: 32, height: 32,
            background: "rgba(29,79,145,0.08)",
            border: "1px solid rgba(29,79,145,0.18)",
            color: "#1D4F91"
          }}
        >
          <ChevronLeft size={16} />
        </motion.button>

        <div className="flex items-center gap-2">
          <CalendarDays size={15} style={{ color: "#426DA9" }} />
          <span className="font-bold text-sm" style={{ color: "#1D4F91" }}>
            {labelMes(mesSelecionado)}
          </span>
          {mesSelecionado !== currentYearMonth() && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={() => setMesSelecionado(currentYearMonth())}
              className="text-xs font-semibold px-2 py-0.5 rounded-full"
              style={{
                background: "rgba(232,0,112,0.1)",
                color: "#E80070",
                border: "1px solid rgba(232,0,112,0.25)"
              }}
            >
              Hoje
            </motion.button>
          )}
        </div>

        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setMesSelecionado(m => navegarMes(m, +1))}
          className="flex items-center justify-center rounded-lg transition-all"
          style={{
            width: 32, height: 32,
            background: "rgba(29,79,145,0.08)",
            border: "1px solid rgba(29,79,145,0.18)",
            color: "#1D4F91"
          }}
        >
          <ChevronRight size={16} />
        </motion.button>
      </div>

      {/* ── Totais do mês ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        {[
          { label: "Investimento", value: totais.investimento, color: "#1D4F91", bg: "rgba(29,79,145,0.07)", sign: "▲" },
          { label: "Renda",        value: totais.renda,        color: "#1E8449", bg: "rgba(30,132,73,0.07)",  sign: "+" },
          { label: "Despesa",      value: totais.despesa,      color: "#C0392B", bg: "rgba(192,57,43,0.07)",  sign: "−" },
        ].map(({ label, value, color, bg, sign }) => (
          <div
            key={label}
            className="rounded-xl px-3 py-2.5 flex flex-col gap-0.5"
            style={{ background: bg, border: `1px solid ${color}22` }}
          >
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color }}>
              {sign} {label}
            </span>
            <span className="font-bold text-sm tabular-nums" style={{ color }}>
              R$ {fmt(value)}
            </span>
          </div>
        ))}
      </div>

      {/* ── Subheader: título + filtros + busca + export ─────────────────── */}
      <div
        className="flex flex-col gap-3 sticky top-0 z-10 pb-3 mb-2"
        style={{
          background: "var(--color-background-primary)",
          borderBottom: "1px solid rgba(29,79,145,0.1)"
        }}
      >
        {/* Linha 1: título + contagem */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base" style={{ color: "var(--color-text-primary)" }}>
              Histórico Recente
            </h3>
            <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
              {listaFinal.length} {listaFinal.length === 1 ? "lançamento" : "lançamentos"} em {labelMes(mesSelecionado)}
            </p>
          </div>
          <ExportExcelButton data={listaFinal} />
        </div>

        {/* Linha 2: filtros de tipo */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {tiposBotao.map(({ key, label, color, activeBg }) => {
            const ativo = filtroTipo === key;
            return (
              <motion.button
                key={key}
                whileTap={{ scale: 0.95 }}
                onClick={() => setFiltroTipo(key)}
                className="text-xs font-semibold px-3 py-1 rounded-full transition-all"
                style={{
                  background: ativo ? activeBg : "rgba(29,79,145,0.05)",
                  color: ativo ? "#fff" : color,
                  border: `1px solid ${ativo ? activeBg : color + "44"}`
                }}
              >
                {label}
              </motion.button>
            );
          })}

          {/* Busca inline */}
          <div className="relative ml-auto">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: "#426DA9" }}>🔎</span>
            <input
              type="text"
              placeholder="Buscar..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="rounded-full pl-8 pr-4 py-1 text-sm outline-none transition-all w-44"
              style={{
                border: "1.5px solid rgba(29,79,145,0.2)",
                background: "rgba(29,79,145,0.04)",
                color: "var(--color-text-primary)"
              }}
            />
          </div>
        </div>
      </div>

      {/* ── Lista scrollável ─────────────────────────────────────────────── */}
      <div className="max-h-[380px] overflow-y-auto pr-1" style={{ scrollbarWidth: "thin" }}>

        {/* Loading skeleton */}
        {isLoading && (
          <div className="flex flex-col gap-2 pt-1">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="rounded-xl px-4 animate-pulse"
                style={{
                  background: "rgba(29,79,145,0.04)",
                  border: "1px solid rgba(29,79,145,0.08)",
                  height: 64
                }}
              />
            ))}
          </div>
        )}

        {/* Empty — sem transações no sistema */}
        {!isLoading && transactions.length === 0 && (
          <div
            className="flex flex-col items-center justify-center py-14 rounded-xl"
            style={{ background: "rgba(29,79,145,0.03)", border: "1.5px dashed rgba(29,79,145,0.18)" }}
          >
            <div
              className="mb-3 rounded-full flex items-center justify-center"
              style={{ width: 48, height: 48, background: "rgba(29,79,145,0.08)" }}
            >
              <Layers size={22} style={{ color: "#426DA9" }} />
            </div>
            <p className="font-bold text-sm mb-1" style={{ color: "var(--color-text-primary)" }}>
              Nenhuma transação registrada
            </p>
            <p className="text-xs text-center max-w-[220px]" style={{ color: "var(--color-text-secondary)" }}>
              Comece adicionando seus ganhos e gastos no formulário acima.
            </p>
          </div>
        )}

        {/* Empty — sem resultados no mês/filtro */}
        {!isLoading && transactions.length > 0 && listaFinal.length === 0 && (
          <div
            className="flex flex-col items-center justify-center py-10 rounded-xl"
            style={{ background: "rgba(29,79,145,0.03)", border: "1.5px dashed rgba(29,79,145,0.18)" }}
          >
            <CalendarDays size={26} style={{ color: "#426DA9", marginBottom: 8 }} />
            <p className="font-semibold text-sm mb-1" style={{ color: "var(--color-text-primary)" }}>
              Nenhum lançamento em {labelMes(mesSelecionado)}
            </p>
            <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
              {search ? `Sem resultados para "${search}"` : "Navegue nos meses ou adicione um lançamento."}
            </p>
          </div>
        )}

        {/* Items */}
        {!isLoading && (
          <div className="flex flex-col gap-2 pt-1">
            <AnimatePresence>
              {listaFinal.map((item: any) => {
                const cfg = TYPE_CONFIG[item.type] || TYPE_CONFIG.Despesa;
                const isEditingThis = editingId === item.id;

                return (
                  <motion.div
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    transition={{ duration: 0.18 }}
                    key={item.id}
                    className="flex items-center justify-between px-4 py-3.5 rounded-xl transition-all"
                    style={{
                      background: isEditingThis ? cfg.bg : "rgba(29,79,145,0.025)",
                      border: isEditingThis
                        ? `1.5px solid ${cfg.color}`
                        : "1px solid rgba(29,79,145,0.09)",
                      boxShadow: isEditingThis ? `0 0 0 3px ${cfg.bg}` : "none"
                    }}
                  >
                    {/* Esquerda: ícone + info */}
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div
                        className="flex items-center justify-center rounded-lg shrink-0"
                        style={{
                          width: 34, height: 34,
                          background: cfg.bg,
                          border: `1px solid ${cfg.border}`,
                          color: cfg.color
                        }}
                      >
                        {cfg.icon}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-sm truncate" style={{ color: "var(--color-text-primary)" }}>
                          {item.category}
                        </p>
                        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                          <span
                            className="text-xs font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded"
                            style={{ background: cfg.bg, color: cfg.color }}
                          >
                            {item.type}
                          </span>
                          {item.date && (
                            <span
                              className="flex items-center gap-1 text-xs font-medium"
                              style={{ color: "var(--color-text-secondary)" }}
                            >
                              <CalendarDays size={11} />
                              {formatDateDisplay(item.date)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Valor */}
                    <div className="mx-4 text-right shrink-0">
                      <span className="font-bold text-base tabular-nums" style={{ color: cfg.color }}>
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
                        className="flex items-center justify-center rounded-lg transition-all"
                        style={{
                          width: 34, height: 34,
                          background: isEditingThis ? cfg.color : "rgba(66,109,169,0.08)",
                          color: isEditingThis ? "#fff" : "#426DA9",
                          border: `1px solid ${isEditingThis ? cfg.color : "rgba(66,109,169,0.18)"}`
                        }}
                        onClick={() => toggleEdit(item)}
                      >
                        {isEditingThis ? <X size={14} /> : <Pencil size={14} />}
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center justify-center rounded-lg transition-all"
                        style={{
                          width: 34, height: 34,
                          background: "rgba(192,57,43,0.08)",
                          color: "#C0392B",
                          border: "1px solid rgba(192,57,43,0.2)"
                        }}
                        onMouseEnter={e => {
                          (e.currentTarget as HTMLButtonElement).style.background = "#C0392B";
                          (e.currentTarget as HTMLButtonElement).style.color = "#fff";
                        }}
                        onMouseLeave={e => {
                          (e.currentTarget as HTMLButtonElement).style.background = "rgba(192,57,43,0.08)";
                          (e.currentTarget as HTMLButtonElement).style.color = "#C0392B";
                        }}
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
