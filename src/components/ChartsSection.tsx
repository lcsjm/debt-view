import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

const pieData = [
  { name: "Renda Fixa", value: 3500, color: "#1D4F91" },
  { name: "Renda Variável", value: 1200, color: "#426DA9" },
  { name: "Gastos Fixos", value: 2100, color: "#77127B" },
  { name: "Gastos Variáveis", value: 800, color: "#C1188B" },
  { name: "Dívidas", value: 5400, color: "#E80070" },
  { name: "Investimentos", value: 950, color: "#1D4F91" },
];

const barData = [
  { month: "Jan", receita: 4700, despesa: 3200 },
  { month: "Fev", receita: 4500, despesa: 3800 },
  { month: "Mar", receita: 5100, despesa: 2900 },
  { month: "Abr", receita: 4800, despesa: 3500 },
  { month: "Mai", receita: 4900, despesa: 3100 },
  { month: "Jun", receita: 5200, despesa: 3400 },
];

export function ChartsSection() {
  return (
    <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Pie Chart */}
      <div className="bg-card rounded-xl p-6 shadow-card border border-border">
        <h3 className="text-lg font-heading font-semibold text-foreground mb-4">
          Distribuição Financeira
        </h3>
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={3}
              dataKey="value"
            >
              {pieData.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number) =>
                value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
              }
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Bar Chart */}
      <div className="bg-card rounded-xl p-6 shadow-card border border-border">
        <h3 className="text-lg font-heading font-semibold text-foreground mb-4">
          Receita vs Despesa
        </h3>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={barData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 14% 89%)" />
            <XAxis dataKey="month" stroke="hsl(216 20% 46%)" fontSize={12} />
            <YAxis stroke="hsl(216 20% 46%)" fontSize={12} />
            <Tooltip
              formatter={(value: number) =>
                value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
              }
            />
            <Legend />
            <Bar dataKey="receita" fill="#1D4F91" radius={[4, 4, 0, 0]} name="Receita" />
            <Bar dataKey="despesa" fill="#E80070" radius={[4, 4, 0, 0]} name="Despesa" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
