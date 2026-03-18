import { useState, KeyboardEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, ArrowRight, ArrowLeft, SkipForward, X, Download } from "lucide-react";
import * as XLSX from "xlsx"; // Lembre-se de rodar: npm install xlsx
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
    description: "Dívida ativa é qualquer valor que você deve a terceiros — bancos, lojas, cartão de crédito, empréstimos, etc.",
    image: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&q=80",
    multiple: true,
  },
  {
    key: "rendaFixa",
    title: "Renda Fixa",
    question: "Deseja adicionar alguma renda fixa?",
    description: "Renda fixa é todo valor que você recebe regularmente e de forma previsível.",
    image: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800&q=80",
    multiple: true,
  },
  {
    key: "rendaVariavel",
    title: "Renda Variável",
    question: "Deseja adicionar alguma renda variável?",
    description: "Renda variável inclui freelances, comissões ou qualquer ganho sem valor fixo.",
    image: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=800&q=80",
    multiple: true,
  },
  {
    key: "gastosFixos",
    title: "Gastos Fixos",
    question: "Deseja adicionar algum gasto fixo?",
    description: "Gastos recorrentes como aluguel, financiamentos ou escola.",
    image: "https://images.unsplash.com/photo-1554224154-26032ffc0d07?w=800&q=80",
    multiple: true,
  },
  {
    key: "gastosVariaveis",
    title: "Gastos Variáveis",
    question: "Deseja adicionar algum gasto variável?",
    description: "Gastos que mudam mensalmente como alimentação, lazer ou transporte.",
    image: "https://images.unsplash.com/photo-1607006411046-bf25eb6e1da3?w=800&q=80",
    multiple: true,
  },
  {
    key: "investimentos",
    title: "Investimentos",
    question: "Você possui algum valor investido mensalmente?",
    description: "Valores aplicados com o objetivo de multiplicar seu patrimônio.",
    image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80",
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
  const progressPercentage = ((currentStep + 1) / steps.length) * 100;

  const handleAddItem = () => {
    const num = parseFloat(inputValue.replace(/\./g, "").replace(",", ".")) || 0;
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
    const num = parseFloat(inputValue.replace(/\./g, "").replace(",", ".")) || 0;
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
      const num = parseFloat(inputValue.replace(/\./g, "").replace(",", ".")) || 0;
      if (num > 0) {
        handleAddItem();
      } else {
        handleNext();
      }
    }
  };

  const handleDownloadExcel = () => {
    const rows = [["Categoria", "Valor (R$)"]];
    const categorias = {
      divida: "Dívida Ativa",
      rendaFixa: "Renda Fixa",
      rendaVariavel: "Renda Variável",
      gastosFixos: "Gastos Fixos",
      gastosVariaveis: "Gastos Variáveis",
      investimentos: "Investimentos"
    };

    let total = 0;
    Object.entries(data).forEach(([key, values]) => {
      values.forEach((val) => {
        rows.push([(categorias as any)[key], val.toFixed(2)]);
        if (key === "rendaFixa" || key === "rendaVariavel") total += val;
        else total -= val;
      });
    });

    rows.push(["", ""]);
    rows.push(["SALDO ESTIMADO", total.toFixed(2)]);

    const worksheet = XLSX.utils.aoa_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Análise Serasa");
    XLSX.writeFile(workbook, "analise_financeira_experian.xlsx");
  };

  if (showResults) {
    return (
      <section className="min-h-screen py-24 bg-gray-50 dark:bg-gray-900 transition-colors duration-300 flex items-center">
        <div className="container mx-auto px-4 flex flex-col items-center">
          <div className="w-full max-w-6xl flex justify-end mb-4">
            <button
              onClick={handleDownloadExcel}
              className="flex items-center gap-2 bg-gradient-to-r from-[#1D4F91] to-[#77127B] hover:from-[#77127B] hover:to-[#E80070] text-white px-6 py-3 rounded-xl font-semibold shadow-lg transition-all hover:scale-105"
            >
              <Download size={20} />
              Baixar Relatório (.xlsx)
            </button>
          </div>
          <div className="w-full">
            <ResultsSection data={data} />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="calculator" className="py-24 bg-gray-50 dark:bg-gray-900 min-h-screen flex items-center transition-colors duration-300">
      <div className="container mx-auto px-4">
        <ScrollReveal>
          <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#1D4F91] via-[#77127B] to-[#E80070] text-center mb-10">
            Raio-X Financeiro
          </h2>
        </ScrollReveal>

        <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 shadow-2xl rounded-3xl overflow-hidden flex flex-col md:flex-row relative transition-colors duration-300">
          
          {/* Barra de Progresso no topo do card */}
          <div className="absolute top-0 left-0 h-1.5 bg-gray-200 dark:bg-gray-700 w-full z-10 transition-colors duration-300">
            <motion.div
              className="h-full bg-gradient-to-r from-[#1D4F91] via-[#77127B] to-[#E80070]"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            />
          </div>

          {/* Seção da Imagem Dinâmica */}
          <div className="w-full md:w-5/12 hidden md:block relative bg-gray-900">
            <AnimatePresence mode="wait">
              <motion.img
                key={step.image}
                src={step.image}
                alt={step.title}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 0.6, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0 w-full h-full object-cover"
              />
            </AnimatePresence>
            <div className="absolute inset-0 bg-gradient-to-t from-[#1D4F91]/80 to-transparent flex items-end p-8">
              <p className="text-white text-lg font-medium drop-shadow-md">
                {step.description}
              </p>
            </div>
          </div>

          {/* Seção do Formulário */}
          <div className="w-full md:w-7/12 p-8 md:p-12 flex flex-col justify-center min-h-[500px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col h-full"
              >
                <div className="mb-2 text-sm font-bold text-[#426DA9] dark:text-[#6a95d6] uppercase tracking-wider">
                  Passo {currentStep + 1} de {steps.length}
                </div>
                
                <h3 className="text-3xl font-bold text-gray-800 dark:text-white mb-3 transition-colors duration-300">
                  {step.title}
                </h3>
                <p className="text-gray-500 dark:text-gray-300 mb-8 text-lg transition-colors duration-300">
                  {step.question}
                </p>

                {/* Tags de Valores Adicionados */}
                {items.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-6">
                    {items.map((item, i) => (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        key={i}
                        className="flex items-center gap-2 bg-[#F3F4F6] dark:bg-gray-700 text-[#1D4F91] dark:text-[#8baee0] border border-[#426DA9]/30 dark:border-gray-600 px-4 py-1.5 rounded-full font-semibold shadow-sm transition-colors duration-300"
                      >
                        R$ {item.toFixed(2).replace(".", ",")}
                        <button 
                          onClick={() => handleRemoveItem(i)}
                          className="text-[#C1188B] hover:text-[#E80070] transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* Input e Adicionar */}
                <div className="flex flex-col sm:flex-row gap-3 mb-auto">
                  <div className="relative flex-1">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 font-medium transition-colors duration-300">R$</span>
                    <input
                      value={inputValue}
                      onChange={(e) => setInputValue(formatCurrency(e.target.value))}
                      onKeyDown={handleKeyDown}
                      className="w-full h-14 pl-12 pr-4 border-2 border-gray-200 dark:border-gray-600 bg-transparent dark:bg-gray-700 rounded-xl outline-none focus:border-[#E80070] dark:focus:border-[#E80070] focus:ring-4 focus:ring-[#E80070]/20 transition-all text-lg font-medium text-gray-700 dark:text-white dark:placeholder-gray-400"
                      placeholder="0,00"
                    />
                  </div>
                  <button
                    onClick={handleAddItem}
                    className="h-14 px-6 border-2 border-[#1D4F91] dark:border-[#426DA9] text-[#1D4F91] dark:text-[#426DA9] hover:bg-[#1D4F91] dark:hover:bg-[#426DA9] hover:text-white dark:hover:text-white rounded-xl flex items-center justify-center gap-2 font-semibold transition-all duration-300"
                  >
                    <Plus size={20} />
                    <span>Adicionar</span>
                  </button>
                </div>

                {/* Controles de Navegação */}
                <div className="flex justify-between items-center mt-12 pt-6 border-t border-gray-100 dark:border-gray-700 transition-colors duration-300">
                  {currentStep > 0 ? (
                    <button
                      onClick={handleBack}
                      className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-[#1D4F91] dark:hover:text-[#8baee0] font-medium transition-colors"
                    >
                      <ArrowLeft size={18} />
                      Voltar
                    </button>
                  ) : (
                    <div /> // Espaçador
                  )}

                  <div className="flex gap-4">
                    <button
                      onClick={handleSkip}
                      className="flex items-center gap-2 text-gray-400 dark:text-gray-500 hover:text-[#77127B] dark:hover:text-[#c45dbd] font-medium transition-colors"
                    >
                      Pular
                      <SkipForward size={18} />
                    </button>

                    <button
                      onClick={handleNext}
                      className="bg-gradient-to-r from-[#1D4F91] to-[#426DA9] hover:from-[#1D4F91] hover:to-[#77127B] text-white px-8 py-3 rounded-xl flex items-center gap-2 font-semibold shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5"
                    >
                      {currentStep === steps.length - 1 ? "Ver Resultados" : "Próximo"}
                      <ArrowRight size={20} />
                    </button>
                  </div>
                </div>

              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}