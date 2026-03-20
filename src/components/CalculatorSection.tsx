import { useState, KeyboardEvent, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, ArrowRight, ArrowLeft, SkipForward, X, Download } from "lucide-react";
import * as XLSX from "xlsx";
import supabase from "../../utils/supabase"; 
import { useAuth } from "../context/AuthContext"; 
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
  { key: "divida", title: "Dívida Ativa", question: "Você possui alguma dívida ativa?", description: "Dívida ativa é qualquer valor que você deve a terceiros.", image: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&q=80", multiple: true },
  { key: "rendaFixa", title: "Renda Fixa", question: "Deseja adicionar alguma renda fixa?", description: "Renda fixa é todo valor que você recebe regularmente.", image: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800&q=80", multiple: true },
  { key: "rendaVariavel", title: "Renda Variável", question: "Deseja adicionar alguma renda variável?", description: "Freelances, comissões ou ganhos sem valor fixo.", image: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=800&q=80", multiple: true },
  { key: "gastosFixos", title: "Gastos Fixos", question: "Deseja adicionar algum gasto fixo?", description: "Aluguel, financiamentos ou escola.", image: "https://images.unsplash.com/photo-1554224154-26032ffc0d07?w=800&q=80", multiple: true },
  { key: "gastosVariaveis", title: "Gastos Variáveis", question: "Deseja adicionar algum gasto variável?", description: "Alimentação, lazer ou transporte.", image: "https://images.unsplash.com/photo-1607006411046-bf25eb6e1da3?w=800&q=80", multiple: true },
  { key: "investimentos", title: "Investimentos", question: "Você possui algum valor investido mensalmente?", description: "Valores aplicados para multiplicar patrimônio.", image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80", multiple: true },
];

const formatCurrency = (val: string) => {
  const num = val.replace(/\D/g, "");
  const parsed = (parseInt(num || "0") / 100).toFixed(2);
  return parsed.replace(".", ",").replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

export default function CalculatorSection() {
  const { user } = useAuth(); 

  // --- LÓGICA DE PERSISTÊNCIA (LOCALSTORAGE) ---
  
  // Estado inicial carregando do LocalStorage para não resetar ao navegar
  const [currentStep, setCurrentStep] = useState<number>(() => {
    const saved = localStorage.getItem("calc_step");
    return saved ? parseInt(saved) : 0;
  });

  const [data, setData] = useState<FinancialData>(() => {
    const saved = localStorage.getItem("calc_data");
    return saved ? JSON.parse(saved) : {
      divida: [], rendaFixa: [], rendaVariavel: [], gastosFixos: [], gastosVariaveis: [], investimentos: [],
    };
  });

  const [showResults, setShowResults] = useState<boolean>(() => {
    return localStorage.getItem("calc_showResults") === "true";
  });

  const [inputValue, setInputValue] = useState("");
  const [items, setItems] = useState<number[]>([]);
  const [history, setHistory] = useState<any[]>([]);

  // Efeito para salvar no LocalStorage sempre que houver mudança
  useEffect(() => {
    localStorage.setItem("calc_data", JSON.stringify(data));
    localStorage.setItem("calc_step", currentStep.toString());
    localStorage.setItem("calc_showResults", showResults.toString());
  }, [data, currentStep, showResults]);

  // Efeito para carregar dados salvos no banco caso o usuário já tenha feito
  useEffect(() => {
    async function fetchExistingData() {
      if (!user) return;
      if (localStorage.getItem("calc_forceEdit") === "true") return;

      const { data: existing } = await supabase
        .from("financial")
        .select('*')
        .eq('user_id', user.id)
        .order('id', { ascending: false })
        .limit(1)
        .single();
        
      if (existing) {
        // Preenche com os dados existentes
        setData({
          divida: [], 
          rendaFixa: [existing.fixedIncome || 0],
          rendaVariavel: [existing.variableIncome || 0],
          gastosFixos: [existing.fixedExpenses || 0],
          gastosVariaveis: [existing.variableExpenses || 0],
          investimentos: [existing.investments || 0]
        });
        setShowResults(true);
      }
    }
    
    // Só tenta buscar no banco se o localStorage não estiver dizendo explicitamente que ele quer re-editar
    if (!localStorage.getItem("calc_showResults")) {
      fetchExistingData();
    }
  }, [user]);

  const step = steps[currentStep];
  const progressPercentage = ((currentStep + 1) / steps.length) * 100;

  // --- FUNÇÕES DE AÇÃO ---

  async function saveToSupabase(finalData: FinancialData) {
    if (!user) return;

    const payload = {
      user_id: user.id,
      fixedIncome: finalData.rendaFixa.reduce((acc, val) => acc + val, 0),
      variableIncome: finalData.rendaVariavel.reduce((acc, val) => acc + val, 0),
      fixedExpenses: finalData.gastosFixos.reduce((acc, val) => acc + val, 0),
      variableExpenses: finalData.gastosVariaveis.reduce((acc, val) => acc + val, 0),
      investments: finalData.investimentos.reduce((acc, val) => acc + val, 0),
    };

    // Verifica se já existe um registro para atualizar em vez de criar duplicatas
    const { data: existing } = await supabase
      .from("financial")
      .select('id')
      .eq('user_id', user.id)
      .order('id', { ascending: false })
      .limit(1)
      .single();

    if (existing) {
      const { error } = await supabase.from("financial").update(payload).eq('id', existing.id);
      if (error) console.error("Erro Supabase Update:", error.message);
      else console.log("Atualizado no banco!");
    } else {
      const { error } = await supabase.from("financial").insert([payload]);
      if (error) console.error("Erro Supabase Insert:", error.message);
      else console.log("Salvo no banco!");
    }
    
    // Limpa a flag de edição forçada após salvar com sucesso
    localStorage.removeItem("calc_forceEdit");
  }

  const handleAddItem = () => {
    const num = parseFloat(inputValue.replace(/\./g, "").replace(",", ".")) || 0;
    if (num > 0) {
      setItems([...items, num]);
      setInputValue("");
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
      saveToSupabase(newData);
      return;
    }

    setHistory([...history, { data: { ...data }, items }]);
    setData(newData);
    setCurrentStep(currentStep + 1);
    setInputValue("");
    setItems([]);
  };

  const handleBack = () => {
    if (history.length === 0) {
        if(currentStep > 0) setCurrentStep(currentStep - 1);
        return;
    }
    const prev = history[history.length - 1];
    setData(prev.data);
    setItems(prev.items);
    setHistory(history.slice(0, -1));
    setCurrentStep(currentStep - 1);
  };

  const resetCalculator = () => {
    localStorage.removeItem("calc_data");
    localStorage.removeItem("calc_step");
    localStorage.removeItem("calc_showResults");
    localStorage.setItem("calc_forceEdit", "true");
    window.location.reload(); // Recarrega para limpar tudo
  };

  if (showResults) {
    return (
      <section className="min-h-screen py-24 bg-gray-50 dark:bg-gray-900 flex items-center">
        <div className="container mx-auto px-4 flex flex-col items-center">
          <div className="w-full max-w-6xl flex justify-between mb-4">
            <button onClick={resetCalculator} className="text-sm text-gray-500 hover:underline">Reiniciar Calculadora</button>
            <ResultsSection data={data} />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="calculator" className="py-24 bg-gray-50 dark:bg-gray-900 min-h-screen flex items-center">
      <div className="container mx-auto px-4">
        <ScrollReveal>
          <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#1D4F91] via-[#77127B] to-[#E80070] text-center mb-10">
            Raio-X Financeiro
          </h2>
        </ScrollReveal>

        <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 shadow-2xl rounded-3xl overflow-hidden flex flex-col md:flex-row relative">
          <div className="absolute top-0 left-0 h-1.5 bg-gray-200 dark:bg-gray-700 w-full z-10">
            <motion.div className="h-full bg-gradient-to-r from-[#1D4F91] via-[#77127B] to-[#E80070]" initial={{ width: 0 }} animate={{ width: `${progressPercentage}%` }} />
          </div>

          <div className="w-full md:w-5/12 hidden md:block relative bg-gray-900">
            <AnimatePresence mode="wait">
              <motion.img key={step.image} src={step.image} alt={step.title} initial={{ opacity: 0 }} animate={{ opacity: 0.6 }} exit={{ opacity: 0 }} className="absolute inset-0 w-full h-full object-cover" />
            </AnimatePresence>
            <div className="absolute inset-0 bg-gradient-to-t from-[#1D4F91]/80 to-transparent flex items-end p-8">
              <p className="text-white text-lg font-medium">{step.description}</p>
            </div>
          </div>

          <div className="w-full md:w-7/12 p-8 md:p-12 flex flex-col justify-center min-h-[500px]">
            <AnimatePresence mode="wait">
              <motion.div key={currentStep} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col h-full">
                <div className="mb-2 text-sm font-bold text-[#426DA9] uppercase tracking-wider">Passo {currentStep + 1} de {steps.length}</div>
                <h3 className="text-3xl font-bold text-gray-800 dark:text-white mb-3">{step.title}</h3>
                <p className="text-gray-500 dark:text-gray-300 mb-8 text-lg">{step.question}</p>

                {items.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-6">
                    {items.map((item, i) => (
                      <div key={i} className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 text-[#1D4F91] px-4 py-1.5 rounded-full font-semibold">
                        R$ {item.toFixed(2).replace(".", ",")}
                        <button onClick={() => setItems(items.filter((_, idx) => idx !== i))} className="text-[#C1188B]"><X className="w-4 h-4" /></button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3 mb-auto">
                  <div className="relative flex-1">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">R$</span>
                    <input 
                      value={inputValue} 
                      onChange={(e) => setInputValue(formatCurrency(e.target.value))} 
                      className="w-full h-14 pl-12 pr-4 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl outline-none focus:border-[#E80070]" 
                      placeholder="0,00" 
                    />
                  </div>
                  <button onClick={handleAddItem} className="h-14 px-6 border-2 border-[#1D4F91] text-[#1D4F91] hover:bg-[#1D4F91] hover:text-white rounded-xl flex items-center gap-2 font-semibold">
                    <Plus size={20} /> Adicionar
                  </button>
                </div>

                <div className="flex justify-between items-center mt-12 pt-6 border-t border-gray-100 dark:border-gray-700">
                  <button onClick={handleBack} disabled={currentStep === 0} className="flex items-center gap-2 text-gray-500 disabled:opacity-30 font-medium"><ArrowLeft size={18} /> Voltar</button>
                  <button onClick={handleNext} className="bg-gradient-to-r from-[#1D4F91] to-[#426DA9] text-white px-8 py-3 rounded-xl flex items-center gap-2 font-semibold shadow-lg">
                    {currentStep === steps.length - 1 ? "Ver Resultados" : "Próximo"} <ArrowRight size={20} />
                  </button>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
