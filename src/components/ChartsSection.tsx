import { ResponsivePie } from '@nivo/pie';
import { ResponsiveBar } from '@nivo/bar';
import { useFinances } from "../hooks/useFinances";
import { useTransactions } from "../hooks/useTransactions";
import { useTheme } from "next-themes";
import { useMemo } from 'react';

export function ChartsSection() {
  const { finances, isLoading: isLoadingFinances } = useFinances();
  const { transactions, isLoading: isLoadingTransactions } = useTransactions();
  const { theme } = useTheme();

  // Mapeia os dados reais do banco para o formato Nivo Pie Chart
  const pieData = useMemo(() => {
    return [
      { id: "Renda Fixa", label: "Renda Fixa", value: finances?.fixed_income || 0, color: "hsl(214, 66%, 34%)" }, // #1D4F91
      { id: "Renda Variável", label: "Renda Variável", value: finances?.variable_income || 0, color: "hsl(214, 44%, 46%)" }, // #426DA9
      { id: "Gastos Fixos", label: "Gastos Fixos", value: finances?.fixed_expense || 0, color: "hsl(298, 74%, 27%)" }, // #77127B
      { id: "Gastos Variáveis", label: "Gastos Variáveis", value: finances?.variable_expense || 0, color: "hsl(319, 78%, 42%)" }, // #C1188B
      { id: "Dívidas", label: "Dívidas", value: finances?.debts || 0, color: "hsl(331, 100%, 45%)" }, // #E80070
      { id: "Investimentos", label: "Investimentos", value: finances?.investments || 0, color: "hsl(267, 50%, 50%)" }, // #brand-purple approx
    ].filter(item => item.value > 0); 
  }, [finances]);

  // Agrupa as transações reais por mês para o Bar Chart
  const barData = useMemo(() => {
    if (!transactions || transactions.length === 0) return [];
    
    // Meses curtos em pt-BR (Jan, Fev, Mar...)
    const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    
    // Objeto para agrupar
    const grouped: Record<string, { month: string, Receita: number, Despesa: number, monthIndex: number }> = {};
    
    transactions.forEach(t => {
      // Usa created_at ou current date fallback
      const date = t.created_at ? new Date(t.created_at) : new Date();
      const mIndex = date.getMonth();
      const monthName = months[mIndex];
      
      if (!grouped[monthName]) {
        grouped[monthName] = { month: monthName, Receita: 0, Despesa: 0, monthIndex: mIndex };
      }
      
      if (t.type === "Renda") {
        grouped[monthName].Receita += t.value;
      } else {
        grouped[monthName].Despesa += t.value;
      }
    });

    // Ordena por ordem cronológica dos meses e pega os últimos 6
    return Object.values(grouped)
      .sort((a, b) => a.monthIndex - b.monthIndex)
      .slice(-6);
  }, [transactions]);

  // Tema base para os gráficos Nivo (Suporte Dark/Light)
  const nivoTheme = {
    textColor: theme === 'dark' ? '#94a3b8' : '#64748b', // slate-400 / slate-500
    fontSize: 12,
    axis: {
      domain: { line: { stroke: 'transparent', strokeWidth: 1 } },
      ticks: { line: { stroke: 'transparent', strokeWidth: 1 } },
    },
    grid: {
      line: {
        stroke: theme === 'dark' ? '#334155' : '#e2e8f0', // slate-700 / slate-200
        strokeWidth: 1,
        strokeDasharray: '4 4'
      }
    },
    tooltip: {
      container: {
        background: theme === 'dark' ? '#1e293b' : '#ffffff', // slate-800 / white
        color: theme === 'dark' ? '#f8fafc' : '#0f172a', // slate-50 / slate-900
        fontSize: '13px',
        borderRadius: '8px',
        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
        border: `1px solid ${theme === 'dark' ? '#334155' : '#e2e8f0'}`,
      }
    }
  };

  const formatBRL = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const isLoading = isLoadingFinances || isLoadingTransactions;

  if (isLoading) {
    return (
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 opacity-50 pointer-events-none">
            <div className="bg-card rounded-2xl p-6 shadow-sm border border-border h-[400px] flex items-center justify-center">
                <p className="animate-pulse text-muted-foreground font-medium">Renderizando Gráficos Nivo...</p>
            </div>
            <div className="bg-card rounded-2xl p-6 shadow-sm border border-border h-[400px] flex items-center justify-center">
                <p className="animate-pulse text-muted-foreground font-medium">Processando Visualizações...</p>
            </div>
        </section>
    );
  }

  return (
    <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      
      {/* Nivo Pie Chart */}
      <div className="bg-card rounded-2xl p-6 shadow-sm border border-border relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-48 h-48 bg-brand-pink/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none transition-transform group-hover:scale-110 duration-700" />
        
        <h3 className="text-xl font-heading font-bold text-foreground mb-1 relative z-10">
          Distribuição dos Seus Ganhos
        </h3>
        <p className="text-sm text-muted-foreground mb-6 relative z-10">
          Como seu dinheiro está sendo dividido neste mês.
        </p>

        <div className="h-[300px] relative z-10 w-full">
          {pieData.length === 0 ? (
            <div className="w-full h-full flex flex-col items-center justify-center text-center">
              <p className="text-muted-foreground font-medium">Ainda sem dados suficentes.</p>
              <p className="text-sm text-muted-foreground/70">Adicione renda ou gastos no painel.</p>
            </div>
          ) : (
            <ResponsivePie
              data={pieData}
              theme={nivoTheme}
              margin={{ top: 20, right: 20, bottom: 40, left: 20 }}
              innerRadius={0.65}
              padAngle={2}
              cornerRadius={5}
              activeOuterRadiusOffset={8}
              colors={{ datum: 'data.color' }}
              borderWidth={1}
              borderColor={{ from: 'color', modifiers: [['darker', 0.2]] }}
              enableArcLinkLabels={false}
              arcLabelsSkipAngle={10}
              arcLabelsTextColor="#ffffff"
              valueFormat={formatBRL}
              animate={true}
              motionConfig="gentle"
              legends={[
                {
                  anchor: 'bottom',
                  direction: 'row',
                  justify: false,
                  translateX: 0,
                  translateY: 35,
                  itemsSpacing: 10,
                  itemWidth: 100,
                  itemHeight: 18,
                  itemTextColor: nivoTheme.textColor,
                  itemDirection: 'left-to-right',
                  itemOpacity: 1,
                  symbolSize: 12,
                  symbolShape: 'circle',
                  effects: [
                    {
                      on: 'hover',
                      style: {
                        itemTextColor: theme === 'dark' ? '#fff' : '#000',
                      }
                    }
                  ]
                }
              ]}
            />
          )}
        </div>
      </div>

      {/* Nivo Bar Chart */}
      <div className="bg-card rounded-2xl p-6 shadow-sm border border-border relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none transition-transform group-hover:scale-110 duration-700" />
        
        <h3 className="text-xl font-heading font-bold text-foreground mb-1 relative z-10">
          Histórico: Receita vs Despesa
        </h3>
        <p className="text-sm text-muted-foreground mb-6 relative z-10">
          Acompanhamento do seu fluxo de caixa nos últimos 6 meses.
        </p>

        <div className="h-[300px] relative z-10 w-full">
          {barData.length === 0 ? (
            <div className="w-full h-full flex flex-col items-center justify-center text-center">
              <p className="text-muted-foreground font-medium">Sem histórico de transações.</p>
              <p className="text-sm text-muted-foreground/70">Adicione transações para ver o comparativo.</p>
            </div>
          ) : (
            <ResponsiveBar
            data={barData}
            keys={['Receita', 'Despesa']}
            indexBy="month"
            theme={nivoTheme}
            margin={{ top: 10, right: 10, bottom: 40, left: 60 }}
            padding={0.3}
            groupMode="grouped"
            valueScale={{ type: 'linear' }}
            indexScale={{ type: 'band', round: true }}
            colors={[ "hsl(214, 66%, 34%)", "hsl(331, 100%, 45%)"]} // Primary & Pink/Destructive
            borderRadius={4}
            borderColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
            axisTop={null}
            axisRight={null}
            axisBottom={{
              tickSize: 0,
              tickPadding: 16,
              tickRotation: 0,
            }}
            axisLeft={{
              tickSize: 0,
              tickPadding: 12,
              tickRotation: 0,
              format: (v) => `R$${v/1000}k`, // Formata para ficar mais limpo
            }}
            enableLabel={false}
            enableGridX={false}
            animate={true}
            motionConfig="wobbly"
            valueFormat={formatBRL}
            legends={[
              {
                dataFrom: 'keys',
                anchor: 'bottom',
                direction: 'row',
                justify: false,
                translateX: 0,
                translateY: 35,
                itemsSpacing: 20,
                itemWidth: 80,
                itemHeight: 20,
                itemDirection: 'left-to-right',
                itemOpacity: 0.85,
                symbolSize: 12,
                symbolShape: 'circle',
                effects: [
                  {
                    on: 'hover',
                    style: {
                      itemOpacity: 1
                    }
                  }
                ]
              }
            ]}
          />
          )}
        </div>
      </div>

    </section>
  );
}
