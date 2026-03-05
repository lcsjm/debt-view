import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, TrendingDown } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export type Debts = {
  credor?: string;
  valorOriginal?: number;
  valorAttJuros?: number;
  taxaJuros?: number;
  dataVenc?: string;
  status?: string;
};

export default function Debts() {
  const [debts, setDebts] = useState<Debts>({});
  const nav = useNavigate();

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!debts.credor || debts.credor.trim() === "") {
      toast.error("Informe o credor!");
      return;
    }
    
    // Sucesso
    toast.success("Seus dados foram salvos com sucesso!");
    // Pode redirecionar ou limpar o estado aqui
    console.log("Dívidas salvas:", debts);
    setTimeout(() => nav("/dash"), 2000);
  };

  return (
    <div className="min-h-screen bg-background pt-24 pb-12 px-4 sm:px-6 lg:px-8 font-body">
      <div className="max-w-2xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="glass-card p-6 md:p-8"
        >
          <div className="flex items-center gap-4 mb-8">
            <Link 
              to="/" 
              className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft size={24} />
            </Link>
            <div>
              <h1 className="text-3xl font-heading font-bold text-foreground flex items-center gap-3">
                <TrendingDown className="text-raspberry" size={32} />
                Acompanhe sua dívida
              </h1>
              <p className="text-muted-foreground mt-1">
                Cadastre e acompanhe o andamento das suas renegociações.
              </p>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-6">
            {/* Credor e Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Credor</label>
                <input
                  required
                  type="text"
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background/50 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  placeholder="Ex: Banco do Brasil"
                  value={debts.credor ?? ""}
                  onChange={(e) => setDebts({ ...debts, credor: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Status da dívida</label>
                <select
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background/50 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all appearance-none"
                  value={debts.status ?? ""}
                  onChange={(e) => setDebts({ ...debts, status: e.target.value })}
                >
                  <option value="" disabled>Selecione um status...</option>
                  <option value="Em Atraso">Em Atraso</option>
                  <option value="Em Renegociação">Em Renegociação</option>
                  <option value="Quitada">Quitada</option>
                </select>
              </div>
            </div>

            {/* Valores */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Valor Original (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background/50 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  placeholder="0,00"
                  value={debts.valorOriginal ?? ""}
                  onChange={(e) => setDebts({ ...debts, valorOriginal: e.target.value === "" ? undefined : parseFloat(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Valor Atual com Juros (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background/50 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  placeholder="0,00"
                  value={debts.valorAttJuros ?? ""}
                  onChange={(e) => setDebts({ ...debts, valorAttJuros: e.target.value === "" ? undefined : parseFloat(e.target.value) })}
                />
              </div>
            </div>

            {/* Taxa e Vencimento */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Taxa de Juros (%) am</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background/50 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  placeholder="0,00%"
                  value={debts.taxaJuros ?? ""}
                  onChange={(e) => setDebts({ ...debts, taxaJuros: e.target.value === "" ? undefined : parseFloat(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Data de Vencimento</label>
                <input
                  type="date"
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background/50 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  value={debts.dataVenc ?? ""}
                  onChange={(e) => setDebts({ ...debts, dataVenc: e.target.value })}
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                className="btn-primary-serasa flex items-center justify-center gap-2 w-full md:w-auto min-w-[200px]"
              >
                <Save size={20} />
                Salvar Dívida
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
