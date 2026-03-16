import { useSerasa } from "../hooks/useSerasa";
import { AlertCircle, ShieldAlert, FileText, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function SerasaSection() {
  const { debts, isLoading, error } = useSerasa();

  if (isLoading) {
    return (
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex items-center justify-center h-40">
        <p className="text-muted-foreground animate-pulse">Consultando base de dados do Serasa...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-destructive/10 border border-destructive/20 rounded-2xl p-6 flex items-start gap-4">
        <AlertCircle className="w-6 h-6 text-destructive flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="font-bold text-destructive mb-1">Erro ao consultar Serasa</h3>
          <p className="text-sm text-destructive/80">Não foi possível carregar suas informações neste momento. Tente novamente mais tarde.</p>
        </div>
      </div>
    );
  }

  const hasDebts = debts && debts.length > 0;

  return (
    <section className="bg-card border border-border rounded-2xl p-6 shadow-sm relative overflow-hidden group">
      {/* Decoração de fundo sutil inspirada na cor do Serasa (rosa/magenta) */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-brand-magenta/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none transition-transform group-hover:scale-110 duration-700" />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 relative z-10">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-xl ${hasDebts ? 'bg-destructive/10 text-destructive' : 'bg-emerald-500/10 text-emerald-500'}`}>
            {hasDebts ? <ShieldAlert className="w-6 h-6" /> : <ShieldAlert className="w-6 h-6 opacity-80" />}
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              Radar Serasa
              {hasDebts && (
                <span className="bg-destructive text-destructive-foreground text-xs font-bold px-2 py-0.5 rounded-full">
                  {debts.length} {debts.length === 1 ? 'dívida' : 'dívidas'}
                </span>
              )}
            </h2>
            <p className="text-sm text-muted-foreground">Monitoramento de dívidas negativadas</p>
          </div>
        </div>

        <Link to="/renegociacao" className="text-sm font-medium text-brand-magenta hover:text-brand-magenta/80 flex items-center gap-1 transition-colors">
          Negociar agora <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="relative z-10">
        {!hasDebts ? (
          <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-5 text-center">
            <h3 className="text-emerald-500 font-bold mb-1">Nome Limpo! 🎉</h3>
            <p className="text-sm text-emerald-600/80">Não encontramos nenhuma dívida negativada no seu CPF atual.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {debts.map((debt) => {
              // Calculando o desconto se houver diferença baseada no MOCK
              const discount = debt.original_amount > debt.current_amount 
                ? Math.round((1 - (debt.current_amount / debt.original_amount)) * 100) 
                : null;

              return (
                <div key={debt.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-background border border-border hover:border-brand-magenta/30 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-muted text-muted-foreground hidden sm:block">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-foreground">{debt.creditor_name}</h4>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                        <span>Vencimento: {new Date(debt.due_date).toLocaleDateString('pt-BR')}</span>
                        <span>•</span>
                        <span className="text-destructive font-medium">{debt.status}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t border-border sm:border-0 pt-3 sm:pt-0">
                    <div className="flex flex-col sm:items-end">
                      {discount && (
                        <span className="text-xs line-through text-muted-foreground">
                          R$ {debt.original_amount.toFixed(2)}
                        </span>
                      )}
                      <span className="font-bold text-lg text-foreground">
                        R$ {debt.current_amount.toFixed(2)}
                      </span>
                    </div>

                    {discount && (
                      <span className="bg-emerald-500 text-white text-xs font-bold px-2 py-0.5 rounded-full mt-1">
                        {discount}% OFF
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
