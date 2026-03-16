
import { useState, KeyboardEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, ArrowRight, ArrowLeft, SkipForward, X } from "lucide-react";
import ScrollReveal from "./ScrollReveal";
import ResultsSection from "./ResultsSection";

interface FinancialData {
  divida: number[];
  rendaFixa: number[];
  rendaVariavel: number[];
  gastosFixos: number[];
  gastosVariaveis: number[];
  investimentos: number[];
}

const steps = [
  {
    key: "divida",
    title: "Dívida Ativa",
    question: "Você possui alguma dívida ativa? Digite o valor:",
    description:
      "Dívida ativa é qualquer valor que você deve a terceiros — bancos, lojas, cartão de crédito, empréstimos, etc.",
    image:
      "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&q=80",
    multiple: true,
  },
  {
    key: "rendaFixa",
    title: "Renda Fixa",
    question: "Deseja adicionar alguma renda fixa?",
    description:
      "Renda fixa é todo valor que você recebe regularmente e de forma previsível.",
    image:
      "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800&q=80",
    multiple: true,
  },
  {
    key: "rendaVariavel",
    title: "Renda Variável",
    question: "Deseja adicionar alguma renda variável?",
    description:
      "Renda variável inclui freelances, comissões ou qualquer ganho sem valor fixo.",
    image:
      "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=800&q=80",
    multiple: true,
  },
  {
    key: "gastosFixos",
    title: "Gastos Fixos",
    question: "Deseja adicionar algum gasto fixo?",
    description: "Gastos recorrentes como aluguel, financiamentos ou escola.",
    image:
      "https://images.unsplash.com/photo-1554224154-26032ffc0d07?w=800&q=80",
    multiple: true,
  },
  {
    key: "gastosVariaveis",
    title: "Gastos Variáveis",
    question: "Deseja adicionar algum gasto variável?",
    description:
      "Gastos que mudam mensalmente como alimentação, lazer ou transporte.",
    image:
      "https://images.unsplash.com/photo-1607006411046-bf25eb6e1da3?w=800&q=80",
    multiple: true,
  },
  {
    key: "investimentos",
    title: "Investimentos",
    question: "Você possui algum valor investido mensalmente?",
    description:
      "Valores aplicados com o objetivo de multiplicar seu patrimônio.",
    image:
      "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80",
    multiple: true,
  },
];

const formatCurrency = (val: string) => {
  const num = val.replace(/\D/g, "");
  const parsed = (parseInt(num || "0") / 100).toFixed(2);
  return parsed.replace(".", ",").replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

interface StepSnapshot {
  data: FinancialData;
  inputValue: string;
  items: number[];
}

export default function CalculatorSection() {
  const [currentStep, setCurrentStep] = useState(0);
  const [showResults, setShowResults] = useState(false);

  const [data, setData] = useState<FinancialData>({
    divida: [],
    rendaFixa: [],
    rendaVariavel: [],
    gastosFixos: [],
    gastosVariaveis: [],
    investimentos: [],
  });

  const [inputValue, setInputValue] = useState("");
  const [items, setItems] = useState<number[]>([]);
  const [history, setHistory] = useState<StepSnapshot[]>([]);

  const step = steps[currentStep];

  const handleAddItem = () => {
    const num =
      parseFloat(inputValue.replace(/\./g, "").replace(",", ".")) || 0;

    if (num > 0) {
      setItems([...items, num]);
      setInputValue("");
    }
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const saveAndAdvance = (newData: FinancialData) => {
    setHistory([...history, { data: { ...data }, inputValue, items }]);
    setData(newData);

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      setInputValue("");
      setItems([]);
    }
  };

  const handleNext = () => {
    const num =
      parseFloat(inputValue.replace(/\./g, "").replace(",", ".")) || 0;

    const newData = { ...data };

    if (step.multiple) {
      const allItems = num > 0 ? [...items, num] : items;
      (newData as any)[step.key] = allItems;
    }

    if (currentStep === steps.length - 1) {
      setData(newData);
      setShowResults(true);
      return;
    }

    saveAndAdvance(newData);
  };

  const handleSkip = () => {
    const newData = { ...data };
    (newData as any)[step.key] = [];

    saveAndAdvance(newData);
  };

  const handleBack = () => {
    if (history.length === 0) return;

    const prev = history[history.length - 1];

    setData(prev.data);
    setInputValue(prev.inputValue);
    setItems(prev.items);
    setHistory(history.slice(0, -1));
    setCurrentStep(currentStep - 1);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddItem();
    }
  };

  if (showResults) {
    return <ResultsSection data={data} />;
  }

  return (
    <section id="calculator" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">

        <ScrollReveal>
          <h2 className="text-3xl font-bold text-center mb-10">
            Análise Financeira
          </h2>
        </ScrollReveal>

        <div className="max-w-3xl mx-auto bg-card border rounded-2xl p-8">

          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
            >

              <h3 className="text-2xl font-bold mb-2">
                {step.title}
              </h3>

              <p className="text-muted-foreground mb-6">
                {step.question}
              </p>

              {items.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {items.map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 bg-muted px-3 py-1 rounded-full"
                    >
                      R$ {item.toFixed(2).replace(".", ",")}

                      <button onClick={() => handleRemoveItem(i)}>
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-3">

                <input
                  value={inputValue}
                  onChange={(e) =>
                    setInputValue(formatCurrency(e.target.value))
                  }
                  onKeyDown={handleKeyDown}
                  className="flex-1 h-12 border rounded-lg px-4"
                  placeholder="0,00"
                />

                <button
                  onClick={handleAddItem}
                  className="px-5 border rounded-lg flex items-center gap-2"
                >
                  <Plus size={18} />
                  Adicionar
                </button>

              </div>

              <div className="flex justify-between mt-8">

                {currentStep > 0 && (
                  <button
                    onClick={handleBack}
                    className="flex items-center gap-2"
                  >
                    <ArrowLeft size={18} />
                    Voltar
                  </button>
                )}

                <div className="flex gap-3">

                  <button
                    onClick={handleSkip}
                    className="flex items-center gap-2"
                  >
                    <SkipForward size={18} />
                    Pular
                  </button>

                  <button
                    onClick={handleNext}
                    className="bg-primary text-white px-6 py-2 rounded-lg flex items-center gap-2"
                  >
                    {currentStep === steps.length - 1
                      ? "Ver Resultados"
                      : "Próximo"}

                    <ArrowRight size={18} />
                  </button>

                </div>

              </div>

            </motion.div>
          </AnimatePresence>

        </div>

      </div>
    </section>
  );
}

