import { AlertTriangle, Calendar, DollarSign } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

const subscriptions = [
  { name: "Netflix", price: 39.9, active: true },
  { name: "Spotify", price: 21.9, active: true },
  { name: "Disney+", price: 33.9, active: false },
  { name: "HBO Max", price: 34.9, active: false },
];

export function MoneyDrain() {
  const today = new Date();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const [noSpendDays, setNoSpendDays] = useState<number[]>([3, 7, 12, 15, 18]);

  const toggleDay = (day: number) => {
    setNoSpendDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const totalJuros = 342;
  const cestasBasicas = Math.floor(totalJuros / 120);

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-heading font-bold text-foreground">
        Ralo de Dinheiro
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Subscriptions */}
        <div className="bg-card rounded-xl p-5 shadow-card border border-border">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            <h3 className="text-sm font-semibold text-foreground">Alerta de Assinaturas</h3>
          </div>
          <div className="space-y-2">
            {subscriptions.map((sub) => (
              <div
                key={sub.name}
                className={`flex justify-between items-center p-2.5 rounded-lg text-sm ${
                  sub.active ? "bg-muted" : "bg-destructive/10"
                }`}
              >
                <span className="text-foreground">{sub.name}</span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-foreground">
                    {sub.price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                  </span>
                  {!sub.active && (
                    <span className="text-[10px] text-destructive font-bold">SEM USO</span>
                  )}
                </div>
              </div>
            ))}
            <p className="text-xs text-muted-foreground mt-2">
              💡 Cancele as não usadas e economize{" "}
              <strong>
                {subscriptions
                  .filter((s) => !s.active)
                  .reduce((a, b) => a + b.price, 0)
                  .toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </strong>
              /mês
            </p>
          </div>
        </div>

        {/* No spend challenge */}
        <div className="bg-card rounded-xl p-5 shadow-card border border-border">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-secondary" />
            <h3 className="text-sm font-semibold text-foreground">Desafio "Sem Gasto"</h3>
          </div>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => (
              <button
                key={day}
                onClick={() => toggleDay(day)}
                className={`w-7 h-7 rounded text-[10px] font-medium transition-colors ${
                  noSpendDays.includes(day)
                    ? "gradient-accent text-primary-foreground"
                    : day <= today.getDate()
                    ? "bg-muted text-muted-foreground hover:bg-muted/80"
                    : "bg-background text-muted-foreground/40"
                }`}
              >
                {day}
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            🔥 {noSpendDays.length} dias sem gastar este mês!
          </p>
        </div>

        {/* Interest comparison */}
        <div className="bg-card rounded-xl p-5 shadow-card border border-border">
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="w-5 h-5 text-brand-magenta" />
            <h3 className="text-sm font-semibold text-foreground">Comparativo de Juros</h3>
          </div>
          <div className="space-y-4">
            <div className="text-center p-4 bg-destructive/10 rounded-lg">
              <p className="text-sm text-muted-foreground">Você paga de juros/mês</p>
              <p className="text-2xl font-heading font-bold text-destructive">
                {totalJuros.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </p>
            </div>
            <div className="text-center p-4 bg-primary/10 rounded-lg">
              <p className="text-sm text-muted-foreground">Isso equivale a</p>
              <p className="text-2xl font-heading font-bold text-primary">
                {cestasBasicas} cestas básicas 🛒
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
