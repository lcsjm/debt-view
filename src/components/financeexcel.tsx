import { toast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import * as XLSX from "xlsx-js-style";

type Props = {
  data: any[];
  structured?: {
    divida: number[];
    rendaFixa: number[];
    rendaVariavel: number[];
    gastosFixos: number[];
    gastosVariaveis: number[];
    investimentos: number[];
  };
};

// ── Brand Colors ──────────────────────────────────────────────────────────
const C = {
  DARK_BLUE:   "1D4F91",
  LIGHT_BLUE:  "426DA9",
  PURPLE:      "77127B",
  RASPBERRY:   "C1188B",
  MAGENTA:     "E80070",
  GOLD:        "F0C040",
  WHITE:       "FFFFFF",
  LIGHT_GRAY:  "F2F5FA",
  MID_GRAY:    "D6DFF0",
  INCOME_GRN:  "1E8449",
  INCOME_BG:   "E8F5E9",
  EXPENSE_RED: "C0392B",
  EXPENSE_BG:  "FDECEA",
  BLACK:       "000000",
  // extras para categorias estruturadas
  INVEST_BLU:  "1565C0",
  INVEST_BG:   "E3F2FD",
  DEBT_ORG:    "BF360C",
  DEBT_BG:     "FBE9E7",
  FIXED_TEAL:  "00695C",
  FIXED_BG:    "E0F2F1",
  VAR_AMB:     "F57F17",
  VAR_BG:      "FFF8E1",
};

const BRL      = '"R$"#,##0.00';
const PCT_FMT  = '0.0"%"';

// ── Style helpers ─────────────────────────────────────────────────────────
const mkFill   = (rgb: string) => ({ patternType: "solid", fgColor: { rgb } });
const mkFont   = (bold = false, color = C.BLACK, sz = 11, italic = false) =>
  ({ bold, color: { rgb: color }, sz, italic, name: "Arial" });
const mkAlign  = (h = "center", v = "center") => ({ horizontal: h, vertical: v });
const mkBorder = (style: "thin" | "medium" = "thin", color = C.DARK_BLUE) => {
  const side = { style, color: { rgb: color } };
  return { top: side, bottom: side, left: side, right: side };
};

// ── Pre-built styles ──────────────────────────────────────────────────────
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
  tipo: (isRenda: boolean) => ({
    font:      mkFont(true, isRenda ? C.INCOME_GRN : C.EXPENSE_RED, 10),
    fill:      mkFill(isRenda ? C.INCOME_BG : C.EXPENSE_BG),
    alignment: mkAlign("center"),
    border:    mkBorder("thin", C.LIGHT_BLUE),
  }),
  cat: (bg: string) => ({
    font:      mkFont(false, "333333", 10),
    fill:      mkFill(bg),
    alignment: mkAlign("left"),
    border:    mkBorder("thin", C.LIGHT_BLUE),
  }),
  val: (isRenda: boolean, bg: string) => ({
    font:      mkFont(true, isRenda ? C.INCOME_GRN : C.EXPENSE_RED, 10),
    fill:      mkFill(bg),
    alignment: mkAlign("right"),
    border:    mkBorder("thin", C.LIGHT_BLUE),
  }),
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

  // ── Estilos novos para sheet estruturada ──────────────────────────────
  sectionHead: (bg: string) => ({
    font:      mkFont(true, C.WHITE, 10),
    fill:      mkFill(bg),
    alignment: mkAlign("left"),
    border:    mkBorder("medium", C.DARK_BLUE),
  }),
  numCell: (fg: string, bg: string) => ({
    font:      mkFont(true, fg, 10),
    fill:      mkFill(bg),
    alignment: mkAlign("right"),
    border:    mkBorder("thin", C.LIGHT_BLUE),
  }),
  numCellLight: (fg: string, bg: string) => ({
    font:      mkFont(false, fg, 10),
    fill:      mkFill(bg),
    alignment: mkAlign("right"),
    border:    mkBorder("thin", C.LIGHT_BLUE),
  }),
  labelCell: (fg: string, bg: string) => ({
    font:      mkFont(false, fg, 10),
    fill:      mkFill(bg),
    alignment: mkAlign("left"),
    border:    mkBorder("thin", C.LIGHT_BLUE),
  }),
  summaryLbl: {
    font:      mkFont(true, C.GOLD, 11),
    fill:      mkFill(C.DARK_BLUE),
    alignment: mkAlign("left"),
    border:    mkBorder("medium", C.MAGENTA),
  },
  summaryVal: (positive: boolean) => ({
    font:      mkFont(true, C.WHITE, 11),
    fill:      mkFill(positive ? C.INCOME_GRN : C.EXPENSE_RED),
    alignment: mkAlign("right"),
    border:    mkBorder("medium", C.MAGENTA),
  }),
  pctBadge: (fg: string, bg: string) => ({
    font:      mkFont(true, fg, 10),
    fill:      mkFill(bg),
    alignment: mkAlign("center"),
    border:    mkBorder("thin", C.LIGHT_BLUE),
  }),
};

// ── Definição de seções ───────────────────────────────────────────────────
type SectionDef = {
  key: keyof NonNullable<Props["structured"]>;
  label: string;
  emoji: string;
  bgHead: string;
  fgVal: string;
  bgVal: string;
  isPositive: boolean; // afeta cor do valor
};

const SECTIONS: SectionDef[] = [
  {
    key: "rendaFixa",
    label: "Renda Fixa",
    emoji: "💼",
    bgHead: C.INCOME_GRN,
    fgVal: C.INCOME_GRN,
    bgVal: C.INCOME_BG,
    isPositive: true,
  },
  {
    key: "rendaVariavel",
    label: "Renda Variável",
    emoji: "📈",
    bgHead: C.FIXED_TEAL,
    fgVal: C.FIXED_TEAL,
    bgVal: C.FIXED_BG,
    isPositive: true,
  },
  {
    key: "gastosFixos",
    label: "Gastos Fixos",
    emoji: "🏠",
    bgHead: C.EXPENSE_RED,
    fgVal: C.EXPENSE_RED,
    bgVal: C.EXPENSE_BG,
    isPositive: false,
  },
  {
    key: "gastosVariaveis",
    label: "Gastos Variáveis",
    emoji: "🛒",
    bgHead: C.VAR_AMB,
    fgVal: C.VAR_AMB,
    bgVal: C.VAR_BG,
    isPositive: false,
  },
  {
    key: "investimentos",
    label: "Investimentos",
    emoji: "💹",
    bgHead: C.INVEST_BLU,
    fgVal: C.INVEST_BLU,
    bgVal: C.INVEST_BG,
    isPositive: true,
  },
  {
    key: "divida",
    label: "Dívidas",
    emoji: "💳",
    bgHead: C.DEBT_ORG,
    fgVal: C.DEBT_ORG,
    bgVal: C.DEBT_BG,
    isPositive: false,
  },
];

// ── Cell writer ───────────────────────────────────────────────────────────
function writeCell(
  ws: any,
  row: number,
  col: number,
  value: any,
  style: any,
  fmt?: string
) {
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

// ══════════════════════════════════════════════════════════════════════════
export default function financeexcel({ data, structured }: Props) {

  function financeexcel() {
    if ((!data || data.length === 0) && !structured) {
      toast({
        title: "Nenhum dado para exportar",
        description: "Adicione transações antes de exportar.",
        variant: "destructive",
      });
      return;
    }

    const entradas      = data.filter((t) => t.type === "Renda");
    const saidas        = data.filter((t) => t.type === "Despesa");
    const totalEntradas = entradas.reduce((a, t) => a + (Number(t.value) || 0), 0);
    const totalSaidas   = saidas.reduce((a, t) => a + (Number(t.value) || 0), 0);
    const saldo         = totalEntradas - totalSaidas;

    // ════════════════════════════════════════════════════════════════════
    // SHEET 1 — Controle Financeiro
    // ════════════════════════════════════════════════════════════════════
    const ws1: any = {
      "!merges": [],
      "!rows":   [],
      "!cols":   [
        { wpx: 36  },
        { wpx: 130 },
        { wpx: 210 },
        { wpx: 140 },
        { wpx: 110 },
        { wpx: 36  },
      ],
    };

    const rh  = (px: number) => ({ hpx: px });
    const M1  = (sr: number, sc: number, er: number, ec: number) =>
      ws1["!merges"].push({ s:{r:sr-1,c:sc-1}, e:{r:er-1,c:ec-1} });
    const wc1 = (r: number, c: number, v: any, sty: any, fmt?: string) =>
      writeCell(ws1, r, c, v, sty, fmt);
    const fr1 = (r: number, cols: number[], sty: any) =>
      fillRow(ws1, r, cols, sty);

    ws1["!rows"].push(rh(8));
    fr1(1, [1,2,3,4,5,6], STY.darkBg);

    ws1["!rows"].push(rh(40));
    fr1(2, [1,2,3,4,5,6], STY.title);
    wc1(2, 1, "💳  DebtView", STY.title);
    M1(2,1, 2,6);

    ws1["!rows"].push(rh(26));
    fr1(3, [1,2,3,4,5,6], STY.subtitle);
    wc1(3, 1, "Controle Inteligente de Finanças Pessoais", STY.subtitle);
    M1(3,1, 3,6);

    ws1["!rows"].push(rh(8));
    fr1(4, [1,2,3,4,5,6], STY.lightBg);

    ws1["!rows"].push(rh(22));
    wc1(5, 1, "",               STY.kpiLbl(C.DARK_BLUE));
    wc1(5, 2, "TOTAL RECEITAS", STY.kpiLbl(C.LIGHT_BLUE));
    wc1(5, 3, "TOTAL DESPESAS", STY.kpiLbl(C.RASPBERRY));
    wc1(5, 4, "SALDO FINAL",    STY.kpiLbl(C.PURPLE));
    wc1(5, 5, "",               STY.kpiLbl(C.DARK_BLUE));
    wc1(5, 6, "",               STY.kpiLbl(C.DARK_BLUE));

    ws1["!rows"].push(rh(30));
    wc1(6, 1, "",            STY.darkBg);
    wc1(6, 2, totalEntradas, STY.kpiVal(C.LIGHT_BLUE), BRL);
    wc1(6, 3, totalSaidas,   STY.kpiVal(C.RASPBERRY),  BRL);
    wc1(6, 4, saldo,         STY.kpiVal(C.PURPLE),     BRL);
    wc1(6, 5, "",            STY.darkBg);
    wc1(6, 6, "",            STY.darkBg);

    ws1["!rows"].push(rh(20));
    wc1(7, 1, "",            STY.kpiSub(C.DARK_BLUE));
    wc1(7, 2, "✅ Receitas", STY.kpiSub(C.LIGHT_BLUE));
    wc1(7, 3, "❌ Despesas", STY.kpiSub(C.RASPBERRY));
    wc1(7, 4, "💰 Saldo",    STY.kpiSub(C.PURPLE));
    wc1(7, 5, "",            STY.kpiSub(C.DARK_BLUE));
    wc1(7, 6, "",            STY.kpiSub(C.DARK_BLUE));

    ws1["!rows"].push(rh(8));
    fr1(8, [1,2,3,4,5,6], STY.midGrayBg);

    ws1["!rows"].push(rh(22));
    ["#","Tipo","Categoria","Valor (R$)","Data",""].forEach((h, i) =>
      wc1(9, i + 1, h, STY.colHead)
    );

    ws1["!rows"].push(rh(6));
    fr1(10, [1,2,3,4,5,6], STY.accentStrip);

    data.forEach((item, i) => {
      const row     = 11 + i;
      const isRenda = item.type === "Renda";
      const bg      = i % 2 === 0 ? C.LIGHT_GRAY : C.WHITE;

      ws1["!rows"].push(rh(20));

      wc1(row, 1, i + 1,                  STY.rowIdx);
      wc1(row, 2, item.type     ?? "",     STY.tipo(isRenda));
      wc1(row, 3, item.category ?? "",     STY.cat(bg));
      wc1(row, 4, Number(item.value) || 0, STY.val(isRenda, bg), BRL);

      const rawDate = item.date ?? item.createdAt;
      if (rawDate) {
        const d = rawDate instanceof Date ? rawDate : new Date(rawDate);
        if (!isNaN(d.getTime())) {
          wc1(row, 5, d,  STY.dateCell(bg), "DD/MM/YYYY");
        } else {
          wc1(row, 5, "", STY.dateCell(bg));
        }
      } else {
        wc1(row, 5, "", STY.dateCell(bg));
      }

      wc1(row, 6, "", STY.accentCol);
    });

    const foot1 = 12 + data.length;
    ws1["!rows"].push(rh(24));
    fr1(foot1, [1,2,3,4,5,6], STY.footer);
    wc1(foot1, 1, "© DebtView  •  Controle financeiro inteligente  •  Powered by DebtView Platform", STY.footer);
    M1(foot1,1, foot1,6);

    outerBorder(ws1, 1, foot1, 1, 6);
    ws1["!ref"] = XLSX.utils.encode_range({ s:{r:0,c:0}, e:{r:foot1-1,c:5} });

    // ════════════════════════════════════════════════════════════════════
    // SHEET 2 — Dashboard por Categoria
    // ════════════════════════════════════════════════════════════════════
    const ws2: any = {
      "!merges": [],
      "!rows":   [],
      "!cols":   [
        { wpx: 36  },
        { wpx: 200 },
        { wpx: 130 },
        { wpx: 140 },
        { wpx: 36  },
      ],
    };

    const M2  = (sr: number, sc: number, er: number, ec: number) =>
      ws2["!merges"].push({ s:{r:sr-1,c:sc-1}, e:{r:er-1,c:ec-1} });
    const wc2 = (r: number, c: number, v: any, sty: any, fmt?: string) =>
      writeCell(ws2, r, c, v, sty, fmt);
    const fr2 = (r: number, cols: number[], sty: any) =>
      fillRow(ws2, r, cols, sty);

    ws2["!rows"].push(rh(8));
    fr2(1, [1,2,3,4,5], STY.darkBg);

    ws2["!rows"].push(rh(40));
    fr2(2, [1,2,3,4,5], STY.title);
    wc2(2, 1, "💳  DebtView  ·  Dashboard Financeiro", STY.title);
    M2(2,1, 2,5);

    ws2["!rows"].push(rh(26));
    fr2(3, [1,2,3,4,5], STY.subtitle);
    wc2(3, 1, "Resumo e Análise por Categoria", STY.subtitle);
    M2(3,1, 3,5);

    ws2["!rows"].push(rh(8));
    fr2(4, [1,2,3,4,5], STY.lightBg);

    ws2["!rows"].push(rh(22));
    ["#","Categoria","Tipo","Total (R$)",""].forEach((h, i) =>
      wc2(5, i + 1, h, STY.colHead)
    );

    ws2["!rows"].push(rh(6));
    fr2(6, [1,2,3,4,5], STY.accentStrip);

    const catMap = new Map<string, { tipo: string; total: number }>();
    data.forEach((item) => {
      const key = item.category ?? "—";
      const cur = catMap.get(key);
      if (cur) {
        cur.total += Number(item.value) || 0;
      } else {
        catMap.set(key, { tipo: item.type ?? "Despesa", total: Number(item.value) || 0 });
      }
    });

    const cats = Array.from(catMap.entries());
    cats.forEach(([cat, { tipo, total }], i) => {
      const row     = 7 + i;
      const isRenda = tipo === "Renda";
      const bg      = i % 2 === 0 ? C.LIGHT_GRAY : C.WHITE;

      ws2["!rows"].push(rh(20));
      wc2(row, 1, i + 1, STY.rowIdx);
      wc2(row, 2, cat,   STY.cat(bg));
      wc2(row, 3, tipo,  STY.tipo(isRenda));
      wc2(row, 4, total, STY.val(isRenda, bg), BRL);
      wc2(row, 5, "",    STY.accentCol);
    });

    const totRow     = 7 + cats.length;
    const grandTotal = cats.reduce((a, [, { total }]) => a + total, 0);

    ws2["!rows"].push(rh(26));
    wc2(totRow, 1, "",            STY.darkBg);
    wc2(totRow, 2, "TOTAL GERAL", STY.totalLbl);
    wc2(totRow, 3, "",            STY.totalLbl);
    wc2(totRow, 4, grandTotal,    STY.totalVal, BRL);
    wc2(totRow, 5, "",            STY.accentCol);
    M2(totRow,2, totRow,3);

    const foot2 = totRow + 3;
    ws2["!rows"].push(rh(10), rh(10), rh(24));
    fr2(foot2, [1,2,3,4,5], STY.footer);
    wc2(foot2, 1, "© DebtView  •  Análise de crédito e finanças pessoais  •  debtview.com.br", STY.footer);
    M2(foot2,1, foot2,5);

    outerBorder(ws2, 1, foot2, 1, 5);
    ws2["!ref"] = XLSX.utils.encode_range({ s:{r:0,c:0}, e:{r:foot2-1,c:4} });

    // ════════════════════════════════════════════════════════════════════
    // SHEET 3 — Análise Estruturada (nova)
    // Colunas: A(#) B(Descrição) C(Valor) D(% do total) E(accent)
    // ════════════════════════════════════════════════════════════════════
    const ws3: any = {
      "!merges": [],
      "!rows":   [],
      "!cols":   [
        { wpx: 36  }, // A — #
        { wpx: 220 }, // B — Descrição
        { wpx: 150 }, // C — Valor (R$)
        { wpx: 90  }, // D — % do total
        { wpx: 36  }, // E — accent
      ],
    };

    const M3  = (sr: number, sc: number, er: number, ec: number) =>
      ws3["!merges"].push({ s:{r:sr-1,c:sc-1}, e:{r:er-1,c:ec-1} });
    const wc3 = (r: number, c: number, v: any, sty: any, fmt?: string) =>
      writeCell(ws3, r, c, v, sty, fmt);
    const fr3 = (r: number, cols: number[], sty: any) =>
      fillRow(ws3, r, cols, sty);

    // ── Calcular totais por seção ──────────────────────────────────────
    const src = structured ?? {
      divida: [],
      rendaFixa: [],
      rendaVariavel: [],
      gastosFixos: [],
      gastosVariaveis: [],
      investimentos: [],
    };

    const sum = (arr: number[]) => arr.reduce((a, v) => a + (Number(v) || 0), 0);

    const totals: Record<string, number> = {};
    SECTIONS.forEach((s) => { totals[s.key] = sum(src[s.key]); });

    const totalReceitas   = totals["rendaFixa"] + totals["rendaVariavel"];
    const totalDespesas   = totals["gastosFixos"] + totals["gastosVariaveis"];
    const totalInvest     = totals["investimentos"];
    const totalDivida     = totals["divida"];
    const saldoEstruturado = totalReceitas - totalDespesas - totalInvest - totalDivida;

    // Grand total de tudo para percentuais (soma de valores positivos)
    const grandBase = totalReceitas + totalInvest || 1; // base = total que entra

    // ── Header ────────────────────────────────────────────────────────
    ws3["!rows"].push(rh(8));
    fr3(1, [1,2,3,4,5], STY.darkBg);

    ws3["!rows"].push(rh(40));
    fr3(2, [1,2,3,4,5], STY.title);
    wc3(2, 1, "💳  DebtView  ·  Análise Financeira Estruturada", STY.title);
    M3(2,1, 2,5);

    ws3["!rows"].push(rh(26));
    fr3(3, [1,2,3,4,5], STY.subtitle);
    wc3(3, 1, "Visão consolidada: Renda · Gastos · Investimentos · Dívidas", STY.subtitle);
    M3(3,1, 3,5);

    ws3["!rows"].push(rh(8));
    fr3(4, [1,2,3,4,5], STY.lightBg);

    // ── KPI bar ───────────────────────────────────────────────────────
    ws3["!rows"].push(rh(22));
    wc3(5, 1, "",                 STY.kpiLbl(C.DARK_BLUE));
    wc3(5, 2, "TOTAL RECEITAS",   STY.kpiLbl(C.INCOME_GRN));
    wc3(5, 3, "TOTAL DESPESAS",   STY.kpiLbl(C.EXPENSE_RED));
    wc3(5, 4, "SALDO ESTRUTURADO",STY.kpiLbl(C.PURPLE));
    wc3(5, 5, "",                 STY.kpiLbl(C.DARK_BLUE));

    ws3["!rows"].push(rh(30));
    wc3(6, 1, "",                STY.darkBg);
    wc3(6, 2, totalReceitas,     STY.kpiVal(C.INCOME_GRN),  BRL);
    wc3(6, 3, totalDespesas,     STY.kpiVal(C.EXPENSE_RED), BRL);
    wc3(6, 4, saldoEstruturado,  STY.kpiVal(C.PURPLE),      BRL);
    wc3(6, 5, "",                STY.darkBg);

    ws3["!rows"].push(rh(20));
    wc3(7, 1, "",                  STY.kpiSub(C.DARK_BLUE));
    wc3(7, 2, "✅ Renda Fixa + Variável", STY.kpiSub(C.INCOME_GRN));
    wc3(7, 3, "❌ Fixos + Variáveis",     STY.kpiSub(C.EXPENSE_RED));
    wc3(7, 4, "💰 Resultado Final",       STY.kpiSub(C.PURPLE));
    wc3(7, 5, "",                  STY.kpiSub(C.DARK_BLUE));

    ws3["!rows"].push(rh(8));
    fr3(8, [1,2,3,4,5], STY.midGrayBg);

    // ── Col headers ───────────────────────────────────────────────────
    ws3["!rows"].push(rh(22));
    ["#", "Descrição", "Valor (R$)", "% Receita", ""].forEach((h, i) =>
      wc3(9, i + 1, h, STY.colHead)
    );

    ws3["!rows"].push(rh(6));
    fr3(10, [1,2,3,4,5], STY.accentStrip);

    // ── Dados por seção ───────────────────────────────────────────────
    let currentRow = 11;
    let globalIdx  = 1;

    SECTIONS.forEach((sec) => {
      const arr = src[sec.key] as number[];

      // Cabeçalho da seção (span B..D)
      ws3["!rows"].push(rh(20));
      wc3(currentRow, 1, "",                          STY.sectionHead(sec.bgHead));
      wc3(currentRow, 2, `${sec.emoji}  ${sec.label}`, STY.sectionHead(sec.bgHead));
      wc3(currentRow, 3, sum(arr),                    {
        ...STY.sectionHead(sec.bgHead),
        alignment: mkAlign("right"),
      }, BRL);
      wc3(currentRow, 4, grandBase > 0 ? sum(arr) / grandBase : 0, {
        ...STY.sectionHead(sec.bgHead),
        alignment: mkAlign("center"),
      }, PCT_FMT);
      wc3(currentRow, 5, "", STY.accentCol);
      M3(currentRow, 1, currentRow, 1); // col A sozinha
      currentRow++;

      if (arr.length === 0) {
        // linha vazia quando não há registros
        ws3["!rows"].push(rh(18));
        wc3(currentRow, 1, "—",      STY.rowIdx);
        wc3(currentRow, 2, "Nenhum registro", STY.labelCell("888888", C.LIGHT_GRAY));
        wc3(currentRow, 3, 0,        STY.numCellLight(sec.fgVal, C.LIGHT_GRAY), BRL);
        wc3(currentRow, 4, 0,        STY.pctBadge("888888", C.LIGHT_GRAY), PCT_FMT);
        wc3(currentRow, 5, "",       STY.accentCol);
        currentRow++;
        globalIdx++;
      } else {
        arr.forEach((val, i) => {
          const bg = i % 2 === 0 ? sec.bgVal : C.WHITE;
          ws3["!rows"].push(rh(18));
          wc3(currentRow, 1, globalIdx,                         STY.rowIdx);
          wc3(currentRow, 2, `${sec.label} #${i + 1}`,          STY.labelCell("333333", bg));
          wc3(currentRow, 3, Number(val) || 0,                  STY.numCell(sec.fgVal, bg), BRL);
          wc3(currentRow, 4, grandBase > 0 ? (Number(val) || 0) / grandBase : 0,
                                                                 STY.pctBadge(sec.fgVal, bg), PCT_FMT);
          wc3(currentRow, 5, "",                                STY.accentCol);
          currentRow++;
          globalIdx++;
        });
      }

      // Sub-total da seção
      ws3["!rows"].push(rh(18));
      wc3(currentRow, 1, "",                  STY.darkBg);
      wc3(currentRow, 2, `Subtotal ${sec.label}`, {
        font:      mkFont(true, C.GOLD, 10),
        fill:      mkFill(C.DARK_BLUE),
        alignment: mkAlign("right"),
        border:    mkBorder("thin", C.MAGENTA),
      });
      wc3(currentRow, 3, sum(arr), {
        font:      mkFont(true, C.WHITE, 10),
        fill:      mkFill(C.LIGHT_BLUE),
        alignment: mkAlign("right"),
        border:    mkBorder("thin", C.MAGENTA),
      }, BRL);
      wc3(currentRow, 4, grandBase > 0 ? sum(arr) / grandBase : 0, {
        font:      mkFont(true, C.WHITE, 10),
        fill:      mkFill(C.LIGHT_BLUE),
        alignment: mkAlign("center"),
        border:    mkBorder("thin", C.MAGENTA),
      }, PCT_FMT);
      wc3(currentRow, 5, "", STY.accentCol);
      currentRow++;

      // Espaçador entre seções
      ws3["!rows"].push(rh(6));
      fr3(currentRow, [1,2,3,4,5], STY.midGrayBg);
      currentRow++;
    });

    // ── Resumo consolidado ────────────────────────────────────────────
    ws3["!rows"].push(rh(8));
    fr3(currentRow, [1,2,3,4,5], STY.darkBg);
    currentRow++;

    ws3["!rows"].push(rh(22));
    fr3(currentRow, [1,2,3,4,5], { fill: mkFill(C.MAGENTA) });
    wc3(currentRow, 1, "📊", STY.colHead);
    wc3(currentRow, 2, "RESUMO CONSOLIDADO", STY.colHead);
    wc3(currentRow, 3, "Valor (R$)", STY.colHead);
    wc3(currentRow, 4, "% Receita", STY.colHead);
    wc3(currentRow, 5, "", STY.accentCol);
    currentRow++;

    const summaryRows: { label: string; val: number; positive: boolean }[] = [
      { label: "✅  Total Receitas (Fixa + Variável)", val: totalReceitas,  positive: true  },
      { label: "❌  Total Despesas (Fixas + Variáveis)", val: totalDespesas, positive: false },
      { label: "💹  Total Investimentos",               val: totalInvest,   positive: true  },
      { label: "💳  Total Dívidas",                     val: totalDivida,   positive: false },
      { label: "💰  Saldo Final Estruturado",            val: saldoEstruturado, positive: saldoEstruturado >= 0 },
    ];

    summaryRows.forEach(({ label, val, positive }, i) => {
      const isLast = i === summaryRows.length - 1;
      ws3["!rows"].push(rh(isLast ? 26 : 20));

      if (isLast) {
        // linha de saldo final em destaque
        wc3(currentRow, 1, "",    STY.darkBg);
        wc3(currentRow, 2, label, STY.summaryLbl);
        wc3(currentRow, 3, val,   STY.summaryVal(positive), BRL);
        wc3(currentRow, 4, grandBase > 0 ? val / grandBase : 0, {
          font:      mkFont(true, C.WHITE, 11),
          fill:      mkFill(positive ? C.INCOME_GRN : C.EXPENSE_RED),
          alignment: mkAlign("center"),
          border:    mkBorder("medium", C.MAGENTA),
        }, PCT_FMT);
        wc3(currentRow, 5, "", STY.accentCol);
      } else {
        const bg = i % 2 === 0 ? C.LIGHT_GRAY : C.WHITE;
        wc3(currentRow, 1, "", STY.rowIdx);
        wc3(currentRow, 2, label, STY.labelCell("333333", bg));
        wc3(currentRow, 3, val, {
          font:      mkFont(true, positive ? C.INCOME_GRN : C.EXPENSE_RED, 10),
          fill:      mkFill(positive ? C.INCOME_BG : C.EXPENSE_BG),
          alignment: mkAlign("right"),
          border:    mkBorder("thin", C.LIGHT_BLUE),
        }, BRL);
        wc3(currentRow, 4, grandBase > 0 ? val / grandBase : 0, STY.pctBadge(
          positive ? C.INCOME_GRN : C.EXPENSE_RED,
          positive ? C.INCOME_BG : C.EXPENSE_BG
        ), PCT_FMT);
        wc3(currentRow, 5, "", STY.accentCol);
      }
      currentRow++;
    });

    // ── Footer ────────────────────────────────────────────────────────
    const foot3 = currentRow + 1;
    ws3["!rows"].push(rh(8), rh(24));
    fr3(foot3 - 1, [1,2,3,4,5], STY.darkBg);
    fr3(foot3,     [1,2,3,4,5], STY.footer);
    wc3(foot3, 1, "© DebtView  •  Planejamento financeiro inteligente  •  debtview.com.br", STY.footer);
    M3(foot3,1, foot3,5);

    outerBorder(ws3, 1, foot3, 1, 5);
    ws3["!ref"] = XLSX.utils.encode_range({ s:{r:0,c:0}, e:{r:foot3-1,c:4} });

    // ── Write file ────────────────────────────────────────────────────
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws1, "📊 Controle Financeiro");
    XLSX.utils.book_append_sheet(wb, ws2, "📈 Dashboard");
    XLSX.utils.book_append_sheet(wb, ws3, "🧩 Análise Estruturada");
    XLSX.writeFile(wb, "DebtView_Relatorio_Financeiro.xlsx");

    toast({
      title: "Exportado com sucesso! 🎉",
      description: "Seu relatório DebtView foi gerado com 3 abas.",
    });
  }

  return (
    <motion.button
      whileHover={{ scale: 1.03, filter: "brightness(1.1)" }}
      whileTap={{ scale: 0.95 }}
      onClick={financeexcel}
      className="relative overflow-hidden px-6 py-2.5 rounded-xl text-white text-sm font-semibold shadow-lg transition-all duration-300 whitespace-nowrap bg-gradient-to-r from-[#1D4F91] via-[#77127B] to-[#E80070] hover:shadow-[#77127B]/30"
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
