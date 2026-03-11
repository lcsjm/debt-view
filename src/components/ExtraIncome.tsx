import { Rocket, Lightbulb, Target } from "lucide-react";
import { motion } from "framer-motion";

const suggestions = [
  { emoji: "📦", title: "Venda o que não usa", desc: "OLX, Mercado Livre, brechó online" },
  { emoji: "💻", title: "Freelance", desc: "Workana, 99freelas, Fiverr" },
  { emoji: "🚗", title: "Motorista de app", desc: "Uber, 99, iFood" },
  { emoji: "📚", title: "Aulas particulares", desc: "Ensine o que você sabe" },
];

export function ExtraIncome() {
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-heading font-bold text-foreground">
        Balcão de Renda Extra
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Suggestions */}
        <div className="bg-card rounded-xl p-5 shadow-card border border-border">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="w-5 h-5 text-brand-magenta" />
            <h3 className="text-sm font-semibold text-foreground">Sugestões Personalizadas</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {suggestions.map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className="p-3 rounded-lg bg-muted hover:bg-muted/70 transition-colors cursor-pointer"
              >
                <span className="text-2xl">{item.emoji}</span>
                <p className="text-sm font-semibold text-foreground mt-1">{item.title}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Acceleration Goal */}
        <div className="bg-card rounded-xl p-5 shadow-card border border-border">
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-5 h-5 text-destructive" />
            <h3 className="text-sm font-semibold text-foreground">Meta de Aceleração</h3>
          </div>
          <div className="gradient-brand rounded-xl p-6 text-primary-foreground text-center">
            <Rocket className="w-10 h-10 mx-auto mb-3 opacity-90" />
            <p className="text-sm opacity-80">Se você fizer</p>
            <p className="text-3xl font-heading font-bold my-1">R$ 200,00</p>
            <p className="text-sm opacity-80">de renda extra este mês</p>
            <div className="mt-4 p-3 bg-primary-foreground/10 rounded-lg backdrop-blur-sm">
              <p className="text-sm font-medium">
                Você quita o <strong>Cartão Inter</strong> dois meses antes! 🎉
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
