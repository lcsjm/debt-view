
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

  // Helper para formatar o input em BRL em tempo real (ex: de "1500" para "1.500,00")
  const formatCurrencyInput = (value: string) => {
    // Remove tudo que não for dígito
    const digits = value.replace(/\D/g, "");
    if (!digits) return "";
    
    // Converte para decimal (dividindo por 100)
    const number = parseInt(digits, 10) / 100;
    
    // Retorna formatado
    return new Intl.NumberFormat("pt-BR", {
      style: "decimal", // Usando decimal invés de currency para não prender o "R$" no input e ficar mais limpo
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(number);
  };

  // Helper para reverter a string formatada ("1.500,00") de volta para número (1500.00) pro Supabase
  const parseCurrencyInput = (value: string) => {
    const digits = value.replace(/\D/g, "");
    if (!digits) return 0;
    return parseInt(digits, 10) / 100;
  };

  // Merge dos dados vindos do hook
  const currentCards = defaultCards.map(card => ({
    ...card,
    value: finances ? (finances[card.id as keyof typeof finances] as number || 0) : 0
  }));

  // CALCULO DO SALDO AUTOMÁTICO
  const saldo =
    (finances?.fixed_income || 0) +
    (finances?.variable_income || 0) -
    (finances?.fixed_expense || 0) -
    (finances?.variable_expense || 0) -
    (finances?.debts || 0);

  const startEditing = () => {
    const values: Record<string, string> = {};
    currentCards.forEach((c) => {
      // Pré-popula os inputs com a máscara
      values[c.id] = formatCurrencyInput((c.value * 100).toFixed(0));
    });
    setEditValues(values);
    setEditing(true);
  };

  const saveEditing = async () => {
    try {

      const payload: any = {};

      Object.keys(editValues).forEach(key => {
        // Na hora de salvar, converte de volta pra número float pro Supabase
        payload[key] = parseCurrencyInput(editValues[key]);
      });

      const fullPayload = { ...finances, ...payload };

      await saveFinances(fullPayload);

      toast({
        title: "Finanças atualizadas",
        description: "Seus dados foram salvos com sucesso!"
      });

    } catch (e: any) {

      toast({
        title: "Erro ao salvar",
        description: e.message,
        variant: "destructive"
      });

    } finally {
      setEditing(false);
    }
  };

  const formatCurrency = (v: number) =>
    v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  if (isLoading) {
    return (
      <div className="w-full h-32 flex items-center justify-center">
        <p className="text-muted-foreground animate-pulse">
          Carregando painel financeiro...
        </p>
      </div>
    );
  }

  return (

    <section className="space-y-4">

      <div className="flex items-center justify-between">

        {/* SALDO */}
        <div className="flex flex-col">

          <span className="text-sm text-muted-foreground">
            Saldo
          </span>

          <h2
            className={`text-xl font-heading font-bold ${
              saldo >= 0 ? "text-green-500" : "text-red-500"
            }`}
          >
            {formatCurrency(saldo)}
          </h2>

        </div>

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
              <>
                <Check className="w-4 h-4" /> Salvar
              </>
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

              <div
                className={`w-10 h-10 rounded-lg ${card.colorClass} flex items-center justify-center`}
              >
                <card.icon className="w-5 h-5 text-primary-foreground" />
              </div>

              {editing && (
                <button
                  onClick={() => {
                    setEditValues((v) => ({
                      ...v,
                      [card.id]: "",
                    }));
                  }}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <X className="w-4 h-4" />
                </button>
              )}

            </div>

            <p className="text-sm text-muted-foreground mb-1">
              {card.label}
            </p>

            <AnimatePresence mode="wait">

              {editing ? (

                <motion.div
                  key="input-container"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2 bg-muted rounded-md px-3 py-1.5 focus-within:ring-2 focus-within:ring-ring"
                >
                  <span className="text-muted-foreground font-medium select-none">R$</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={editValues[card.id] || ""}
                    onChange={(e) =>
                      setEditValues((v) => ({
                        ...v,
                        [card.id]: formatCurrencyInput(e.target.value),
                      }))
                    }
                    onKeyDown={(e) => {
                      // Pressionar Enter salva todos os valores, igual ao botão "Salvar"
                      if (e.key === "Enter") {
                        e.preventDefault();
                        saveEditing();
                      }
                    }}
                    className="w-full text-xl font-heading font-bold bg-transparent text-foreground outline-none"
                    placeholder="0,00"
                  />
                </motion.div>

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
