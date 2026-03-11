import { useState } from "react";
import { Snowflake, Mountain, Calculator } from "lucide-react";
import { motion } from "framer-motion";

const debts = [
  { name: "Cartão Nubank", total: 1200, rate: 14.5, min: 120 },
  { name: "Empréstimo Banco X", total: 3500, rate: 8.2, min: 350 },
  { name: "Cartão Inter", total: 700, rate: 12.0, min: 70 },
];

type Method = "snowball" | "avalanche";

export function PaymentStrategy() {
  const [method, setMethod] = useState<Method>("snowball");
  const [extraAmount, setExtraAmount] = useState("");

  const sorted = [...debts].sort((a, b) =>
    method === "snowball" ? a.total - b.total : b.rate - a.rate
  );

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-heading font-bold text-foreground">
        Estratégia de Pagamento
      </h2>

      {/* Method Selector */}
      <div className="flex gap-3 flex-wrap">
        <button
          onClick={() => setMethod("snowball")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
            method === "snowball"
              ? "bg-primary text-primary-foreground shadow-card"
              : "bg-card text-foreground border border-border hover:bg-muted"
          }`}
        >
          <Snowflake className="w-4 h-4" /> Bola de Neve
        </button>
        <button
          onClick={() => setMethod("avalanche")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
            method === "avalanche"
              ? "bg-primary text-primary-foreground shadow-card"
              : "bg-card text-foreground border border-border hover:bg-muted"
          }`}
        >
          <Mountain className="w-4 h-4" /> Avalanche
        </button>
      </div>

      <p className="text-sm text-muted-foreground">
        {method === "snowball"
          ? "Pague primeiro as menores dívidas para vitórias rápidas e motivação."
          : "Pague primeiro as dívidas com maiores juros para economizar mais."}
      </p>

      {/* Debt List */}
      <div className="space-y-3">
        {sorted.map((debt, i) => (
          <motion.div
            key={debt.name}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-card rounded-xl p-4 shadow-card border border-border flex items-center justify-between"
          >
            <div>
              <p className="font-semibold text-foreground">{debt.name}</p>
              <p className="text-xs text-muted-foreground">
                Juros: {debt.rate}% a.m. · Mínimo:{" "}
                {debt.min.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </p>
            </div>
            <div className="text-right">
              <p className="text-lg font-heading font-bold text-destructive">
                {debt.total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </p>
              {i === 0 && (
                <span className="text-xs gradient-accent text-primary-foreground px-2 py-0.5 rounded-full">
                  Prioridade #{i + 1}
                </span>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Simulate */}
      <div className="bg-card rounded-xl p-5 shadow-card border border-border">
        <div className="flex items-center gap-2 mb-3">
          <Calculator className="w-5 h-5 text-accent" />
          <h3 className="font-semibold text-foreground text-sm">Simular Renegociação</h3>
        </div>
        <div className="flex gap-3">
          <input
            type="number"
            placeholder="Quanto você tem em mãos?"
            value={extraAmount}
            onChange={(e) => setExtraAmount(e.target.value)}
            className="flex-1 rounded-lg bg-muted px-4 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
          />
          <button className="px-5 py-2.5 rounded-lg gradient-accent text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity">
            Simular
          </button>
        </div>
        {extraAmount && parseFloat(extraAmount) > 0 && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 text-sm text-muted-foreground"
          >
            💡 Com{" "}
            <strong className="text-foreground">
              {parseFloat(extraAmount).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
            </strong>{" "}
            extra, recomendamos atacar a dívida <strong className="text-destructive">{sorted[0].name}</strong> primeiro!
          </motion.p>
        )}
      </div>
    </section>
  );
}
