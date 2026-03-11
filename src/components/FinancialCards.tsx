import { useState } from "react";
import { useFinances } from "../hooks/useFinances";
import { toast } from "@/hooks/use-toast";
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
  { id: "fixed_income", label: "Renda Fixa", value: 0, icon: Landmark, colorClass: "bg-primary" },
  { id: "variable_income", label: "Renda Variável", value: 0, icon: TrendingUp, colorClass: "bg-secondary" },
  { id: "fixed_expense", label: "Gastos Fixos", value: 0, icon: Receipt, colorClass: "bg-accent" },
  { id: "variable_expense", label: "Gastos Variáveis", value: 0, icon: ShoppingCart, colorClass: "bg-brand-magenta" },
  { id: "debts", label: "Dívidas", value: 0, icon: CreditCard, colorClass: "bg-destructive" },
  { id: "investments", label: "Investimentos", value: 0, icon: PiggyBank, colorClass: "bg-brand-purple" },
];

export function FinancialCards() {
  const { finances, isLoading, saveFinances, isSaving } = useFinances();

  const [editing, setEditing] = useState(false);
  const [editValues, setEditValues] = useState<Record<string, string>>({});

  // Merge hook data into the default structure mapping
  const currentCards = defaultCards.map(card => ({
    ...card,
    value: finances ? (finances[card.id as keyof typeof finances] as number || 0) : 0
  }));

  const startEditing = () => {
    const values: Record<string, string> = {};
    currentCards.forEach((c) => (values[c.id] = c.value.toString()));
    setEditValues(values);
    setEditing(true);
  };

  const saveEditing = async () => {
    try {
        const payload: any = {};
        Object.keys(editValues).forEach(key => {
            payload[key] = parseFloat(editValues[key]) || 0;
        });
        
        // Preserve any existing ID / metadata not explicitly in cards
        const fullPayload = { ...finances, ...payload };
        
        await saveFinances(fullPayload);
        toast({ title: "Finanças atualizadas", description: "Seus dados foram salvos com sucesso!" });
    } catch (e: any) {
        toast({ title: "Erro ao salvar", description: e.message, variant: "destructive" });
    } finally {
        setEditing(false);
    }
  };

  const formatCurrency = (v: number) =>
    v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  if (isLoading) {
      return (
          <div className="w-full h-32 flex items-center justify-center">
              <p className="text-muted-foreground animate-pulse">Carregando painel financeiro...</p>
          </div>
      )
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-heading font-bold text-foreground">
          Seu Painel Financeiro
        </h1>
        <button
          onClick={editing ? saveEditing : startEditing}
          disabled={isSaving}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {editing ? (
             isSaving ? (
                <>Salvando...</>
             ) : (
                <><Check className="w-4 h-4" /> Salvar</>
             )
          ) : (
            <>
              <Pencil className="w-4 h-4" /> Editar
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {currentCards.map((card, i) => (
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
