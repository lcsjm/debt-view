import { Copy, ExternalLink, ShieldCheck, Calculator } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const scripts = [
  {
    title: "Redução de juros do cartão",
    text: "Olá, gostaria de solicitar a revisão da minha taxa de juros do cartão de crédito. Tenho sido cliente fiel e gostaria de uma condição mais competitiva para continuar utilizando o cartão.",
  },
  {
    title: "Renegociação de dívida",
    text: "Boa tarde, estou entrando em contato para renegociar minha dívida. Tenho condições de pagar à vista com desconto ou parcelar em até X vezes. Qual a melhor oferta que vocês podem me fazer?",
  },
];

const links = [
  { name: "Serasa Limpa Nome", url: "https://www.serasa.com.br/limpa-nome-online/" },
  { name: "Desenrola Brasil", url: "https://www.gov.br/fazenda/pt-br/assuntos/desenrola" },
];

export function RenegotiationCenter() {
  const [rate, setRate] = useState("");
  const averageRate = 13.5;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Texto copiado!");
  };

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-heading font-bold text-foreground">
        Central de Renegociação & Direitos
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Scripts */}
        <div className="lg:col-span-2 bg-card rounded-xl p-5 shadow-card border border-border">
          <div className="flex items-center gap-2 mb-4">
            <ShieldCheck className="w-5 h-5 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Modelos de Texto</h3>
          </div>
          <div className="space-y-3">
            {scripts.map((script) => (
              <div
                key={script.title}
                className="p-4 bg-muted rounded-lg"
              >
                <div className="flex justify-between items-start mb-2">
                  <p className="text-sm font-semibold text-foreground">{script.title}</p>
                  <button
                    onClick={() => copyToClipboard(script.text)}
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-sm text-muted-foreground">{script.text}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 flex gap-3 flex-wrap">
            {links.map((link) => (
              <a
                key={link.name}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
              >
                <ExternalLink className="w-3.5 h-3.5" /> {link.name}
              </a>
            ))}
          </div>
        </div>

        {/* Calculator */}
        <div className="bg-card rounded-xl p-5 shadow-card border border-border">
          <div className="flex items-center gap-2 mb-4">
            <Calculator className="w-5 h-5 text-accent" />
            <h3 className="text-sm font-semibold text-foreground">Calculadora de Juros</h3>
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            Sua taxa está acima da média do mercado?
          </p>
          <input
            type="number"
            placeholder="Sua taxa (% a.m.)"
            value={rate}
            onChange={(e) => setRate(e.target.value)}
            className="w-full rounded-lg bg-muted px-4 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring mb-3"
          />
          {rate && (
            <div
              className={`p-3 rounded-lg text-sm font-medium ${
                parseFloat(rate) > averageRate
                  ? "bg-destructive/10 text-destructive"
                  : "bg-primary/10 text-primary"
              }`}
            >
              {parseFloat(rate) > averageRate
                ? `⚠️ Sua taxa está ${(parseFloat(rate) - averageRate).toFixed(1)}% acima da média (${averageRate}%)! Renegocie!`
                : `✅ Sua taxa está dentro ou abaixo da média (${averageRate}%).`}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
