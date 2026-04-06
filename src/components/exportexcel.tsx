import { toast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import * as XLSX from "xlsx-js-style";

type Props = {
  data: any[];
};

// ── Brand Colors ──────────────────────────────────────────────────────────────
const C = {
  DARK_BLUE:    "1D4F91",
  LIGHT_BLUE:   "426DA9",
  PURPLE:       "77127B",
  RASPBERRY:    "C1188B",
  MAGENTA:      "E80070",
  GOLD:         "F0C040",
  WHITE:        "FFFFFF",
  LIGHT_GRAY:   "F2F5FA",
  MID_GRAY:     "D6DFF0",
  // Cores alinhadas com TYPE_CONFIG do app
  INVEST_COLOR: "1D4F91",  // azul — Investimento
  INVEST_BG:    "E3F2FD",
  RENDA_COLOR:  "1E8449",  // verde — Renda
  RENDA_BG:     "E8F5E9",
  DESP_COLOR:   "C0392B",  // vermelho — Despesa
  DESP_BG:      "FDECEA",
  BLACK:        "000000",
};

const BRL      = '"R$"#,##0.00';
const DATE_FMT = "DD/MM/YYYY";

// ── Style helpers ─────────────────────────────────────────────────────────────
const mkFill   = (rgb: string) => ({ patternType: "solid", fgColor: { rgb } });
const mkFont   = (bold = false, color = C.BLACK, sz = 11, italic = false) =>
  ({ bold, color: { rgb: color }, sz, italic, name: "Arial" });
const mkAlign  = (h = "center", v = "center") => ({ horizontal: h, vertical: v });
const mkBorder = (style: "thin" | "medium" = "thin", color = C.DARK_BLUE) => {
  const side = { style, color: { rgb: color } };
  return { top: side, bottom: side, left: side, right: side };
};

// ── Retorna cores por tipo ────────────────────────────────────────────────────
function tipoColors(type: string) {
  if (type === "Renda")        return { color: C.RENDA_COLOR,  bg: C.RENDA_BG  };
  if (type === "Investimento") return { color: C.INVEST_COLOR, bg: C.INVEST_BG };
  return                              { color: C.DESP_COLOR,   bg: C.DESP_BG   };
}

// ── Pre-built styles ──────────────────────────────────────────────────────────
const STY = {
  darkBg:    { fill: mkFill(C.DARK_BLUE) },
  lightBg:   { fill: mkFill(C.LIGHT_BLUE) },
  midGrayBg: { fill: mkFill(C.MID_GRAY) },

  title: {
    font:      mkFont(true, C.WHITE, 24),
    fill:      mkFill(C.DARK_BLUE),
    alignment: mkAlign("center"),
  },
  subtitle: {
    font:      mkFont(false, C.WHITE, 11, true),
    fill:      mkFill(C.LIGHT_BLUE),
    alignment: mkAlign("center"),
  },

  kpiLbl: (bg: string) => ({
    font:      mkFont(true, C.WHITE, 9),
    fill:      mkFill(bg),
    alignment: mkAlign("center"),
  }),
  kpiVal: (bg: string) => ({
    font:      mkFont(true, C.WHITE, 15),
    fill:      mkFill(bg),
    alignment: mkAlign("center"),
  }),
  kpiSub: (bg: string) => ({
    font:      mkFont(false, C.WHITE, 9, true),
    fill:      mkFill(bg),
    alignment: mkAlign("center"),
  }),

  colHead: {
    font:      mkFont(true, C.GOLD, 11),
    fill:      mkFill(C.DARK_BLUE),
    alignment: mkAlign("center"),
    border:    mkBorder("medium", C.MAGENTA),
  },
  accentStrip: {
    fill:   mkFill(C.MAGENTA),
    border: mkBorder("thin", C.DARK_BLUE),
  },

  rowIdx: {
    font:      mkFont(true, C.DARK_BLUE, 10),
    fill:      mkFill(C.MID_GRAY),
    alignment: mkAlign("center"),
    border:    mkBorder("thin", C.LIGHT_BLUE),
  },

  tipo: (type: string) => {
    const { color, bg } = tipoColors(type);
    return {
      font:      mkFont(true, color, 10),
      fill:      mkFill(bg),
      alignment: mkAlign("center"),
      border:    mkBorder("thin", C.LIGHT_BLUE),
    };
  },

  cat: (bg: string) => ({
    font:      mkFont(false, "333333", 10),
    fill:      mkFill(bg),
    alignment: mkAlign("left"),
    border:    mkBorder("thin", C.LIGHT_BLUE),
  }),

  val: (type: string, bg: string) => {
    const { color } = tipoColors(type);
    return {
      font:      mkFont(true, color, 10),
      fill:      mkFill(bg),
      alignment: mkAlign("right"),
      border:    mkBorder("thin", C.LIGHT_BLUE),
    };
  },

  dateCell: (bg: string) => ({
    font:      mkFont(false, C.DARK_BLUE, 10),
    fill:      mkFill(bg),
    alignment: mkAlign("center"),
    border:    mkBorder("thin", C.LIGHT_BLUE),
  }),

  accentCol: { fill: mkFill(C.DARK_BLUE) },

  footer: {
    font:      mkFont(false, C.GOLD, 9, true),
    fill:      mkFill(C.DARK_BLUE),
    alignment: mkAlign("center"),
  },
  totalLbl: {
    font:      mkFont(true, C.GOLD, 11),
    fill:      mkFill(C.DARK_BLUE),
    alignment: mkAlign("center"),
    border:    mkBorder("medium", C.MAGENTA),
  },
  totalVal: {
    font:      mkFont(true, C.WHITE, 12),
    fill:      mkFill(C.PURPLE),
    alignment: mkAlign("right"),
    border:    mkBorder("medium", C.MAGENTA),
  },
};

// ── Helpers de escrita ────────────────────────────────────────────────────────
function writeCell(ws: any, row: number, col: number, value: any, style: any, fmt?: string) {
  const addr = XLSX.utils.encode_cell({ r: row - 1, c: col - 1 });
  let t: string;
  let v = value;
  if (value === null || value === undefined || value === "") {
    t = "s"; v = "";
  } else if (value instanceof Date) {
    const epoch = new Date(Date.UTC(1899, 11, 30)).getTime();
    v = (Date.UTC(value.getFullYear(), value.getMonth(), value.getDate()) - epoch) / 86400000;
    t = "n";
  } else if (typeof value === "number") {
    t = "n";
  } else {
    t = "s";
  }
  ws[addr] = { v, t, s: style };
  if (fmt) ws[addr].z = fmt;
}

function fillRow(ws: any, row: number, cols: number[], style: any) {
  cols.forEach((c) => writeCell(ws, row, c, "", style));
}

function outerBorder(ws: any, r1: number, r2: number, c1: number, c2: number) {
  const med = { style: "medium", color: { rgb: C.DARK_BLUE } };
  for (let r = r1; r <= r2; r++) {
    for (let c = c1; c <= c2; c++) {
      const addr = XLSX.utils.encode_cell({ r: r - 1, c: c - 1 });
      if (!ws[addr]) ws[addr] = { v: "", t: "s", s: {} };
      if (!ws[addr].s) ws[addr].s = {};
      const cur = ws[addr].s.border ?? {};
      ws[addr].s.border = {
        left:   c === c1 ? med : (cur.left   ?? {}),
        right:  c === c2 ? med : (cur.right  ?? {}),
        top:    r === r1 ? med : (cur.top    ?? {}),
        bottom: r === r2 ? med : (cur.bottom ?? {}),
      };
    }
  }
}

// ── Parse de data seguro (suporta "YYYY-MM-DD" e Date) ───────────────────────
function parseDate(raw: any): Date | null {
  if (!raw) return null;
  if (raw instanceof Date) return isNaN(raw.getTime()) ? null : raw;
  // "YYYY-MM-DD" → evita problema de fuso UTC
  if (typeof raw === "string" && /^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    const [y, m, d] = raw.split("-").map(Number);
    return new Date(y, m - 1, d);
  }
  const d = new Date(raw);
  return isNaN(d.getTime()) ? null : d;
}

// ── Componente ────────────────────────────────────────────────────────────────
export default function ExportExcelButton({ data }: Props) {
  function exportToExcel() {
    if (!data || data.length === 0) {
      toast({ title: "Nenhum dado para exportar", variant: "destructive" });
      return;
    }

    // Ordena: Investimento → Renda → Despesa para o Excel também
    const sorted = [...data].sort((a, b) => {
      const p: Record<string, number> = { Investimento: 1, Renda: 2, Despesa: 3 };
      return (p[a.type] || 4) - (p[b.type] || 4);
    });

    const entradas      = sorted.filter(t => t.type === "Renda");
    const saidas        = sorted.filter(t => t.type === "Despesa");
    const investimentos = sorted.filter(t => t.type === "Investimento");

    const totalEntradas      = entradas.reduce((a, t)      => a + (Number(t.value) || 0), 0);
    const totalSaidas        = saidas.reduce((a, t)        => a + (Number(t.value) || 0), 0);
    const totalInvestimentos = investimentos.reduce((a, t) => a + (Number(t.value) || 0), 0);
    const saldo = totalEntradas - totalSaidas - totalInvestimentos;

    // ── Sheet 1: Controle Financeiro ─────────────────────────────────────────
    const ws1: any = {
      "!merges": [],
      "!rows":   [],
      // Colunas: # | Tipo | Categoria | Valor | Data | (acento)
      "!cols": [
        { wpx: 36  },   // A — #
        { wpx: 130 },   // B — Tipo
        { wpx: 210 },   // C — Categoria
        { wpx: 140 },   // D — Valor
        { wpx: 110 },   // E — Data
        { wpx: 36  },   // F — acento
      ],
    };

    const rh = (px: number) => ({ hpx: px });
    const M1 = (sr: number, sc: number, er: number, ec: number) =>
      ws1["!merges"].push({ s: { r: sr - 1, c: sc - 1 }, e: { r: er - 1, c: ec - 1 } });
    const wc1 = (r: number, c: number, v: any, sty: any, fmt?: string) =>
      writeCell(ws1, r, c, v, sty, fmt);
    const fr1 = (r: number, cols: number[], sty: any) => fillRow(ws1, r, cols, sty);

    // Linha 1 — espaço topo
    ws1["!rows"].push(rh(8));
    fr1(1, [1, 2, 3, 4, 5, 6], STY.darkBg);

    // Linha 2 — título
    ws1["!rows"].push(rh(40));
    fr1(2, [1, 2, 3, 4, 5, 6], STY.title);
    wc1(2, 1, "💳   DebtView", STY.title);
    M1(2, 1, 2, 6);

    // Linha 3 — subtítulo
    ws1["!rows"].push(rh(26));
    fr1(3, [1, 2, 3, 4, 5, 6], STY.subtitle);
    wc1(3, 1, "Controle Inteligente de Finanças Pessoais", STY.subtitle);
    M1(3, 1, 3, 6);

    // Linha 4 — espaço
    ws1["!rows"].push(rh(8));
    fr1(4, [1, 2, 3, 4, 5, 6], STY.lightBg);

    // Linhas 5-7 — KPIs (Investimento | Renda | Despesa | Saldo)
    ws1["!rows"].push(rh(22));
    wc1(5, 1, "INVESTIMENTOS",  STY.kpiLbl(C.DARK_BLUE));
    wc1(5, 2, "TOTAL RECEITAS", STY.kpiLbl(C.LIGHT_BLUE));
    wc1(5, 3, "TOTAL DESPESAS", STY.kpiLbl(C.RASPBERRY));
    wc1(5, 4, "SALDO FINAL",    STY.kpiLbl(C.PURPLE));
    wc1(5, 5, "",               STY.kpiLbl(C.DARK_BLUE));
    wc1(5, 6, "",               STY.kpiLbl(C.DARK_BLUE));

    ws1["!rows"].push(rh(30));
    wc1(6, 1, totalInvestimentos, STY.kpiVal(C.DARK_BLUE), BRL);
    wc1(6, 2, totalEntradas,      STY.kpiVal(C.LIGHT_BLUE), BRL);
    wc1(6, 3, totalSaidas,        STY.kpiVal(C.RASPBERRY),  BRL);
    wc1(6, 4, saldo,              STY.kpiVal(C.PURPLE),     BRL);
    wc1(6, 5, "",                 STY.darkBg);
    wc1(6, 6, "",                 STY.darkBg);

    ws1["!rows"].push(rh(20));
    wc1(7, 1, "📈 Invest.",  STY.kpiSub(C.DARK_BLUE));
    wc1(7, 2, "✅ Receitas", STY.kpiSub(C.LIGHT_BLUE));
    wc1(7, 3, "❌ Despesas", STY.kpiSub(C.RASPBERRY));
    wc1(7, 4, "💰 Saldo",   STY.kpiSub(C.PURPLE));
    wc1(7, 5, "",            STY.kpiSub(C.DARK_BLUE));
    wc1(7, 6, "",            STY.kpiSub(C.DARK_BLUE));

    // Linha 8 — espaço
    ws1["!rows"].push(rh(8));
    fr1(8, [1, 2, 3, 4, 5, 6], STY.midGrayBg);

    // Linha 9 — cabeçalho de colunas
    ws1["!rows"].push(rh(22));
    ["#", "Tipo", "Categoria", "Valor (R$)", "Data", ""].forEach((h, i) =>
      wc1(9, i + 1, h, STY.colHead)
    );

    // Linha 10 — faixa magenta
    ws1["!rows"].push(rh(6));
    fr1(10, [1, 2, 3, 4, 5, 6], STY.accentStrip);

    // Dados — Investimento → Renda → Despesa
    sorted.forEach((item, i) => {
      const row = 11 + i;
      const bg  = i % 2 === 0 ? C.LIGHT_GRAY : C.WHITE;
      ws1["!rows"].push(rh(20));

      wc1(row, 1, i + 1,             STY.rowIdx);
      wc1(row, 2, item.type ?? "",   STY.tipo(item.type));
      wc1(row, 3, item.category ?? "", STY.cat(bg));
      wc1(row, 4, Number(item.value) || 0, STY.val(item.type, bg), BRL);

      const d = parseDate(item.date ?? item.createdAt);
      wc1(row, 5, d ?? "", STY.dateCell(bg), d ? DATE_FMT : undefined);
      wc1(row, 6, "",      { fill: { patternType: "solid", fgColor: { rgb: C.DARK_BLUE } } });
    });

    // Rodapé
    const foot1 = 12 + sorted.length;
    ws1["!rows"].push(rh(24));
    fr1(foot1, [1, 2, 3, 4, 5, 6], STY.footer);
    wc1(foot1, 1, "© DebtView  •  Controle financeiro inteligente", STY.footer);
    M1(foot1, 1, foot1, 6);
    outerBorder(ws1, 1, foot1, 1, 6);
    ws1["!ref"] = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: foot1 - 1, c: 5 } });

    // ── Sheet 2: Dashboard por Categoria ────────────────────────────────────
    const ws2: any = {
      "!merges": [],
      "!rows":   [],
      "!cols":   [{ wpx: 36 }, { wpx: 200 }, { wpx: 130 }, { wpx: 140 }, { wpx: 36 }],
    };
    const wc2 = (r: number, c: number, v: any, sty: any, fmt?: string) =>
      writeCell(ws2, r, c, v, sty, fmt);
    const fr2 = (r: number, cols: number[], sty: any) => fillRow(ws2, r, cols, sty);
    const M2 = (sr: number, sc: number, er: number, ec: number) =>
      ws2["!merges"].push({ s: { r: sr - 1, c: sc - 1 }, e: { r: er - 1, c: ec - 1 } });

    ws2["!rows"].push(rh(8), rh(40), rh(26), rh(8), rh(22), rh(6));
    fr2(1, [1, 2, 3, 4, 5], STY.darkBg);
    wc2(2, 1, "💳   DebtView  ·  Dashboard Financeiro", STY.title); M2(2, 1, 2, 5);
    wc2(3, 1, "Resumo e Análise por Categoria",         STY.subtitle); M2(3, 1, 3, 5);
    fr2(4, [1, 2, 3, 4, 5], STY.lightBg);
    ["#", "Categoria", "Tipo", "Total (R$)", ""].forEach((h, i) =>
      wc2(5, i + 1, h, STY.colHead)
    );
    fr2(6, [1, 2, 3, 4, 5], STY.accentStrip);

    // Agrupa por categoria, prioriza tipo com maior total
    const catMap = new Map<string, { tipo: string; total: number }>();
    sorted.forEach((item) => {
      const key = item.category ?? "—";
      const cur = catMap.get(key);
      if (cur) cur.total += Number(item.value) || 0;
      else catMap.set(key, { tipo: item.type ?? "Despesa", total: Number(item.value) || 0 });
    });

    // Ordena categorias: Investimento → Renda → Despesa
    const cats = Array.from(catMap.entries()).sort((a, b) => {
      const p: Record<string, number> = { Investimento: 1, Renda: 2, Despesa: 3 };
      return (p[a[1].tipo] || 4) - (p[b[1].tipo] || 4);
    });

    cats.forEach(([cat, { tipo, total }], i) => {
      const row = 7 + i;
      const bg  = i % 2 === 0 ? C.LIGHT_GRAY : C.WHITE;
      ws2["!rows"].push(rh(20));
      wc2(row, 1, i + 1, STY.rowIdx);
      wc2(row, 2, cat,   STY.cat(bg));
      wc2(row, 3, tipo,  STY.tipo(tipo));
      wc2(row, 4, total, STY.val(tipo, bg), BRL);
      wc2(row, 5, "",    STY.accentCol);
    });

    const totRow = 7 + cats.length;
    ws2["!rows"].push(rh(26));
    wc2(totRow, 2, "TOTAL GERAL", STY.totalLbl);
    wc2(totRow, 4, sorted.reduce((a, t) => a + (Number(t.value) || 0), 0), STY.totalVal, BRL);
    M2(totRow, 2, totRow, 3);

    const foot2 = totRow + 3;
    ws2["!rows"].push(rh(10), rh(10), rh(24));
    wc2(foot2, 1, "© DebtView  •  Análise por Categoria", STY.footer);
    M2(foot2, 1, foot2, 5);
    outerBorder(ws2, 1, foot2, 1, 5);
    ws2["!ref"] = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: foot2 - 1, c: 4 } });

    // ── Gerar arquivo ────────────────────────────────────────────────────────
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws1, "📊 Controle Financeiro");
    XLSX.utils.book_append_sheet(wb, ws2, "📈 Dashboard");
    XLSX.writeFile(wb, "DebtView_Relatorio_Financeiro.xlsx");
    toast({ title: "Exportado com sucesso! 🎉" });
  }

  return (
    <motion.button
      whileHover={{ scale: 1.03, filter: "brightness(1.1)" }}
      whileTap={{ scale: 0.95 }}
      onClick={exportToExcel}
      className="relative overflow-hidden px-6 py-2.5 rounded-xl text-white text-sm font-semibold shadow-lg transition-all duration-300 whitespace-nowrap"
      style={{
        background: "linear-gradient(135deg, #1D4F91, #77127B, #E80070)",
        boxShadow: "0 4px 14px rgba(119,18,123,0.3)"
      }}
    >
      <span className="relative z-10 flex items-center gap-2">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
            d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Exportar Excel
      </span>
    </motion.button>
  );
}
