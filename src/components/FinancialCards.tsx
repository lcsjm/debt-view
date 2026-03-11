import { useState } from "react";
import { Pencil, X, Check, Landmark, TrendingUp, Receipt, ShoppingCart, CreditCard, PiggyBank } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface CardData {
  id: string;
  label: string;
  value: number;
  icon: React.ElementType;
  colorClass: string;
}

const defaultCards: CardData[] = [
  { id: "renda-fixa", label: "Renda Fixa", value: 3500, icon: Landmark, colorClass: "bg-primary" },
  { id: "renda-variavel", label: "Renda Variável", value: 1200, icon: TrendingUp, colorClass: "bg-secondary" },
  { id: "gastos-fixos", label: "Gastos Fixos", value: 2100, icon: Receipt, colorClass: "bg-accent" },
  { id: "gastos-variaveis", label: "Gastos Variáveis", value: 800, icon: ShoppingCart, colorClass: "bg-brand-magenta" },
  { id: "dividas", label: "Dívidas", value: 5400, icon: CreditCard, colorClass: "bg-destructive" },
  { id: "investimentos", label: "Investimentos", value: 950, icon: PiggyBank, colorClass: "bg-brand-purple" },
];

export function FinancialCards() {
  const [cards, setCards] = useState<CardData[]>(defaultCards);
  const [editing, setEditing] = useState(false);
  const [editValues, setEditValues] = useState<Record<string, string>>({});

  const startEditing = () => {
    const values: Record<string, string> = {};
    cards.forEach((c) => (values[c.id] = c.value.toString()));
    setEditValues(values);
    setEditing(true);
  };

  const saveEditing = () => {
    setCards((prev) =>
      prev.map((c) => ({ ...c, value: parseFloat(editValues[c.id]) || 0 }))
    );
    setEditing(false);
  };

  const formatCurrency = (v: number) =>
    v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-heading font-bold text-foreground">
          Seu Painel Financeiro
        </h1>
        <button
          onClick={editing ? saveEditing : startEditing}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
        >
          {editing ? (
            <>
              <Check className="w-4 h-4" /> Salvar
            </>
          ) : (
            <>
              <Pencil className="w-4 h-4" /> Editar
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card, i) => (
          <motion.div
            key={card.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="bg-card rounded-xl p-5 shadow-card hover:shadow-card-hover transition-shadow duration-300 border border-border"
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 rounded-lg ${card.colorClass} flex items-center justify-center`}>
                <card.icon className="w-5 h-5 text-primary-foreground" />
              </div>
              {editing && (
                <button
                  onClick={() => {
                    setEditValues((v) => ({ ...v, [card.id]: "" }));
                  }}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <p className="text-sm text-muted-foreground mb-1">{card.label}</p>
            <AnimatePresence mode="wait">
              {editing ? (
                <motion.input
                  key="input"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  type="number"
                  value={editValues[card.id] || ""}
                  onChange={(e) =>
                    setEditValues((v) => ({ ...v, [card.id]: e.target.value }))
                  }
                  className="w-full text-xl font-heading font-bold bg-muted rounded-md px-3 py-1.5 text-foreground outline-none focus:ring-2 focus:ring-ring"
                  placeholder="0.00"
                />
              ) : (
                <motion.p
                  key="value"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-xl font-heading font-bold text-foreground"
                >
                  {formatCurrency(card.value)}
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
