import { motion } from "framer-motion";
import { Trophy, Wallet, Clock } from "lucide-react";

export function ProgressPanel() {
  const progressPercent = 38;
  const totalSaved = 1240;
  const monthsLeft = 14;

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-heading font-bold text-foreground">
        Painel de Progresso
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Thermometer */}
        <div className="bg-card rounded-xl p-6 shadow-card border border-border">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="w-5 h-5 text-brand-pink" />
            <h3 className="text-sm font-semibold text-foreground">Termômetro de Quitação</h3>
          </div>
          <div className="relative w-full h-4 bg-muted rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="h-full rounded-full gradient-accent"
            />
          </div>
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>Endividado</span>
            <span className="font-bold text-brand-pink">{progressPercent}%</span>
            <span>Livre!</span>
          </div>
        </div>

        {/* Total saved */}
        <div className="bg-card rounded-xl p-6 shadow-card border border-border">
          <div className="flex items-center gap-2 mb-4">
            <Wallet className="w-5 h-5 text-accent" />
            <h3 className="text-sm font-semibold text-foreground">Total Economizado</h3>
          </div>
          <p className="text-3xl font-heading font-bold text-foreground">
            {totalSaved.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            em juros evitados com renegociações
          </p>
        </div>

        {/* Countdown */}
        <div className="bg-card rounded-xl p-6 shadow-card border border-border">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-secondary" />
            <h3 className="text-sm font-semibold text-foreground">Contagem Regressiva</h3>
          </div>
          <p className="text-3xl font-heading font-bold text-foreground">
            {monthsLeft} <span className="text-base font-normal text-muted-foreground">meses</span>
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            para sua liberdade financeira 🎉
          </p>
        </div>
      </div>
    </section>
  );
}
