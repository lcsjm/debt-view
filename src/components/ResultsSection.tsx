
import { ResponsivePie } from "@nivo/pie";
import { ResponsiveBar } from "@nivo/bar";
import { AlertTriangle, CheckCircle } from "lucide-react";
import { useMemo } from "react";

interface FinancialData {
  divida: number[];
  rendaFixa: number[];
  rendaVariavel: number[];
  gastosFixos: number[];
  gastosVariaveis: number[];
  investimentos: number[];
}

interface Props {
  data: FinancialData;
}

const COLORS = {
  primary: "hsl(213, 66%, 34%)",
  light: "hsl(213, 43%, 46%)",
  secondary: "hsl(298, 75%, 28%)",
  raspberry: "hsl(320, 79%, 43%)",
  magenta: "hsl(331, 100%, 45%)",
};

export default function ResultsSection({ data }: Props) {

  const sum = (arr: number[]) => arr.reduce((a, b) => a + b, 0);

  const renda = sum(data.rendaFixa) + sum(data.rendaVariavel);
  const gastosFixos = sum(data.gastosFixos);
  const gastosVariaveis = sum(data.gastosVariaveis);
  const investimentos = sum(data.investimentos);
  const dividas = sum(data.divida);

  const saldo = renda - gastosFixos - gastosVariaveis - investimentos;

  const pieData = useMemo(() => [
    { name: "Gastos Fixos", value: gastosFixos },
    { name: "Gastos Variáveis", value: gastosVariaveis },
    { name: "Investimentos", value: investimentos },
    { name: "Saldo Livre", value: Math.max(0, saldo) },
  ], [gastosFixos, gastosVariaveis, investimentos, saldo]);

  const barData = useMemo(() => [
    { name: "Renda", value: renda, color: COLORS.primary },
    { name: "G. Fixos", value: gastosFixos, color: COLORS.light },
    { name: "G. Variáveis", value: gastosVariaveis, color: COLORS.raspberry },
    { name: "Dívidas", value: dividas, color: COLORS.magenta },
    { name: "Investimentos", value: investimentos, color: COLORS.secondary },
  ], [renda, gastosFixos, gastosVariaveis, dividas, investimentos]);

  const formatCurrency = (v: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

  return (
    <section className="py-24 bg-muted/30">

      <div className="container mx-auto px-4 max-w-4xl">

        <AlertsPanel
          renda={renda}
          gastosFixos={gastosFixos}
          gastosVariaveis={gastosVariaveis}
        />

        <div className="grid md:grid-cols-2 gap-8 mb-12">

          <div className="p-6 flex flex-col items-center">
            <h3 className="font-semibold mb-4">Distribuição</h3>

            <div className="w-full h-[320px]">
              <ResponsivePie
                data={pieData.map((d) => ({
                  id: d.name,
                  label: d.name,
                  value: d.value,
                }))}
                innerRadius={0.6}
                padAngle={2}
                cornerRadius={4}
              />
            </div>
          </div>

          <div className="p-6 flex flex-col items-center">
            <h3 className="font-semibold mb-4">Comparativo</h3>

            <div className="w-full h-[320px]">
              <ResponsiveBar
                data={barData}
                keys={["value"]}
                indexBy="name"
                padding={0.3}
                colors={({ data }) => data.color}
                enableLabel={false}
              />
            </div>
          </div>

        </div>

        <div className="p-6 mb-6">

          <h3 className="font-semibold mb-4 text-center">Resumo</h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">

            {[
              { label: "Renda", value: renda },
              { label: "Gastos Fixos", value: gastosFixos },
              { label: "Gastos Variáveis", value: gastosVariaveis },
              { label: "Dívidas", value: dividas },
              { label: "Investimentos", value: investimentos },
              { label: "Saldo Livre", value: saldo },
            ].map((item) => (

              <div key={item.label} className="text-center">
                <p className="text-sm text-muted-foreground">{item.label}</p>
                <p className="font-bold text-lg">
                  {formatCurrency(item.value)}
                </p>
              </div>

            ))}

          </div>
        </div>

      </div>
    </section>
  );
}

function AlertsPanel({
  renda,
  gastosFixos,
  gastosVariaveis
}: {
  renda: number;
  gastosFixos: number;
  gastosVariaveis: number;
}) {

  if (renda <= 0) return null;

  const fixosPct = (gastosFixos / renda) * 100;
  const varPct = (gastosVariaveis / renda) * 100;

  const alerts: { msg: string; level: "warning" | "danger" }[] = [];

  if (fixosPct > 60)
    alerts.push({ msg: "Atenção, seus gastos fixos estão muito altos.", level: "danger" });
  else if (fixosPct >= 51)
    alerts.push({ msg: "Cuidado, seus gastos fixos estão no limite.", level: "warning" });

  if (varPct > 40)
    alerts.push({ msg: "Atenção, seus gastos variáveis estão muito altos.", level: "danger" });
  else if (varPct >= 31)
    alerts.push({ msg: "Cuidado, seus gastos variáveis estão no limite.", level: "warning" });

  if (alerts.length === 0)
    return (
      <div className="mb-6 p-4 flex items-center gap-3 text-primary">
        <CheckCircle size={22} />
        <span className="font-medium">
          Seus gastos parecem equilibrados. Continue assim!
        </span>
      </div>
    );

  return (
    <div className="mb-6 flex flex-col gap-3">
      {alerts.map((a, i) => (
        <div
          key={i}
          className={`p-4 rounded-xl flex items-center gap-3 font-medium ${
            a.level === "danger"
              ? "bg-destructive/10 text-destructive"
              : "bg-magenta/10 text-magenta"
          }`}
        >
          <AlertTriangle size={22} />
          <span>{a.msg}</span>
        </div>
      ))}
    </div>
  );
}
