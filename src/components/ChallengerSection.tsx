import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import {
  Pencil,
  X,
  Check,
  Landmark,
  TrendingUp,
  Receipt,
  ShoppingCart,
  CreditCard,
  PiggyBank,
  Zap,
  Sparkles,
  UtensilsCrossed,
  Wallet,
  Tv,
  TrendingDown
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const challenges = [
  {
    titulo: "Reduza gastos com Delivery",
    descricao: "Seus gastos com delivery estão em R$ 350. Tente reduzir R$ 150 este mês.",
    economia: "R$ 150",
    icon: UtensilsCrossed,
    dificuldade: "Médio",
  },
  {
    titulo: "Cancele uma assinatura",
    descricao: "Você tem 3 serviços de streaming. Cancele um e economize.",
    economia: "R$ 40",
    icon: Tv,
    dificuldade: "Fácil",
  },
  {
    titulo: "Pague R$ 200 extra na dívida",
    descricao: "Pague R$ 200 extras no Cartão Nubank e economize R$ 1.240 em juros.",
    economia: "R$ 1.240",
    icon: CreditCard,
    dificuldade: "Difícil",
  },
  {
    titulo: "Reduza gastos variáveis em 10%",
    descricao: "Cortar 10% dos seus gastos variáveis libera R$ 120 por mês.",
    economia: "R$ 120",
    icon: TrendingDown,
    dificuldade: "Médio",
  },
];

const difficultyColors: Record<string, string> = {
  Fácil: "bg-secondary/10 text-secondary",
  Médio: "bg-accent/10 text-accent",
  Difícil: "bg-destructive/10 text-destructive",
};

export function ChallengerSection({ expenses = [] }: { expenses?: any[] }) {
  const navigate = useNavigate();

  const hasExpenses = expenses.length > 0;

  // ADICIONADO: id para permitir scroll automático até os desafios
  return (
    <div id="challenges-section">

      {/* CASO NÃO TENHA GASTOS */}
      {!hasExpenses ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 flex flex-col items-center text-center"
        >
          <div className="w-14 h-14 rounded-full bg-[#e6007e10] flex items-center justify-center mb-6">
            <Wallet className="w-7 h-7 text-[#e6007e]" />
          </div>

          <h3 className="text-xl font-bold text-[#2d3436] mb-3">
            Organize suas finanças agora
          </h3>

          <p className="text-base text-slate-600 max-w-sm mb-8 leading-relaxed">
            Para gerarmos seu plano de superação de dívidas, precisamos entender seu fluxo.
            Adicione seus gastos e receba metas reais para limpar seu nome.
          </p>

          <div className="grid grid-cols-1 gap-4 mb-8 w-full max-w-xs">
            {[
              { step: "1", text: "Registre suas despesas" },
              { step: "2", text: "Analise seu perfil" },
              { step: "3", text: "Ative seus desafios" }
            ].map((item) => (
              <div key={item.step} className="flex items-center gap-3 text-left">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-100 text-[#2d3436] text-xs font-bold flex items-center justify-center">
                  {item.step}
                </span>
                <span className="text-sm font-medium text-slate-700">{item.text}</span>
              </div>
            ))}
          </div>

          <Button
            onClick={() => {
              // CORREÇÃO: scroll até a section de transações
              const section = document.getElementById("transactions-section");
              if (section) {
                section.scrollIntoView({ behavior: "smooth" });
              }
            }}
            className="bg-[#e6007e] hover:bg-[#b80065] text-white font-bold py-6 px-10 rounded-full transition-all shadow-md hover:shadow-lg w-full sm:w-auto"
          >
            Adicionar gastos agora
          </Button>
        </motion.div>
      ) : (
        // CASO TENHA GASTOS
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.6 }}
          className="finance-card"
        >
          <div className="flex items-center gap-2 mb-1">
            <Zap className="w-5 h-5 text-highlight" />
            <h2 className="section-title">Desafios Financeiros</h2>
          </div>

          <p className="text-sm text-muted-foreground mb-6">
            Desafios personalizados baseados nos seus dados financeiros
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {challenges.map((challenge, i) => (
              <motion.div
                key={challenge.titulo}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.7 + i * 0.08 }}
                className="p-4 rounded-lg border border-border/50 hover:border-primary/20 transition-colors"
              >

                <div className="flex items-start gap-3">

                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <challenge.icon className="w-4 h-4 text-primary" />
                  </div>

                  <div className="flex-1 min-w-0">

                    <div className="flex items-center gap-2 mb-1">

                      <span className="text-sm font-semibold text-foreground">
                        {challenge.titulo}
                      </span>

                      <span
                        className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${difficultyColors[challenge.dificuldade]}`}
                      >
                        {challenge.dificuldade}
                      </span>

                    </div>

                    <p className="text-xs text-muted-foreground leading-relaxed mb-2">
                      {challenge.descricao}
                    </p>

                    <div className="flex items-center justify-between">

                      <span className="text-xs text-muted-foreground">
                        Economia:
                        <span className="font-semibold text-primary font-mono-tabular ml-1">
                          {challenge.economia}
                        </span>
                      </span>

                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs text-primary hover:text-primary hover:bg-primary/5"
                      >
                        Aceitar
                      </Button>

                    </div>

                  </div>

                </div>

              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

    </div>
  );
}