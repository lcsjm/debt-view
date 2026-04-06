import { useState, KeyboardEvent, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
// Adicionado o ícone RefreshCw para o botão de reiniciar
import { Plus, ArrowRight, ArrowLeft, SkipForward, X, Download, RefreshCw } from "lucide-react";
import * as XLSX from "xlsx-js-style";
import supabase from "../../utils/supabase"; 
import { useAuth } from "../context/AuthContext"; 
import ScrollReveal from "./ScrollReveal";
import ResultsSection from "./ResultsSection";

// --- COMPONENTE MAGNETIC BUTTON ---
const MagneticButton = ({ children, className, onClick, disabled }: any) => {
  const ref = useRef<HTMLButtonElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouse = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return; 
    const { clientX, clientY } = e;
    const { height, width, left, top } = ref.current!.getBoundingClientRect();
    const middleX = clientX - (left + width / 2);
    const middleY = clientY - (top + height / 2);
    setPosition({ x: middleX * 0.3, y: middleY * 0.3 }); 
  };

  const reset = () => {
    setPosition({ x: 0, y: 0 });
  };

  return (
    <motion.button
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: "spring", stiffness: 300, damping: 20, mass: 0.5 }}
      className={className}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </motion.button>
  );
};

interface FinancialData {
  divida: number[];
  rendaFixa: number[];
  rendaVariavel: number[];
  gastosFixos: number[];
  gastosVariaveis: number[];
  investimentos: number[];
}

// --- NOTA DO DESENVOLVEDOR ---
// As imagens abaixo estão sendo servidas da pasta 'public'.
// Certifique-se de que as extensões de arquivo (.jpg, .png, etc.)
// correspondem exatamente aos arquivos reais na sua pasta 'public'.
const steps = [
  { key: "divida", title: "Dívida Ativa", question: "Você possui alguma dívida ativa?", description: "Dívida ativa é qualquer valor que você deve a terceiros.", image: "/divida.png", multiple: true },
  { key: "rendaFixa", title: "Renda Fixa", question: "Deseja adicionar alguma renda fixa?", description: "Renda fixa é todo valor que você recebe regularmente.", image: "/rendafixa.png", multiple: true },
  { key: "rendaVariavel", title: "Renda Variável", question: "Deseja adicionar alguma renda variável?", description: "Freelances, comissões ou ganhos sem valor fixo.", image: "/rendavariavel.png", multiple: true },
  { key: "gastosFixos", title: "Gastos Fixos", question: "Deseja adicionar algum gasto fixo?", description: "Aluguel, financiamentos ou escola.", image: "/gastosfixos.png", multiple: true },
  { key: "gastosVariaveis", title: "Gastos Variáveis", question: "Deseja adicionar algum gasto variável?", description: "Alimentação, lazer ou transporte.", image: "/gastosvariaveis.png", multiple: true },
  { key: "investimentos", title: "Investimentos", question: "Você possui algum valor investido mensalmente?", description: "Valores aplicados para multiplicar patrimônio.", image: "/investimentos.png", multiple: true },
];

const formatCurrency = (val: string) => {
  const num = val.replace(/\D/g, "");
  const parsed = (parseInt(num || "0") / 100).toFixed(2);
  return parsed.replace(".", ",").replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

export default function CalculatorSection() {
  const { user } = useAuth(); 

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

  useEffect(() => {
    localStorage.setItem("calc_data", JSON.stringify(data));
    localStorage.setItem("calc_step", currentStep.toString());
    localStorage.setItem("calc_showResults", showResults.toString());
  }, [data, currentStep, showResults]);

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
    
    if (!localStorage.getItem("calc_showResults")) {
      fetchExistingData();
    }
  }, [user]);

  const step = steps[currentStep];
  const progressPercentage = ((currentStep + 1) / steps.length) * 100;

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
    } else {
      const { error } = await supabase.from("financial").insert([payload]);
      if (error) console.error("Erro Supabase Insert:", error.message);
    }
    
    localStorage.removeItem("calc_forceEdit");
  }

  const handleSaveEdits = async (valores: {
    rendaFixa: number;
    rendaVariavel: number;
    gastosFixos: number;
    gastosVariaveis: number;
    dividas: number;
    investimentos: number;
  }) => {
    const newData: FinancialData = {
      rendaFixa: [valores.rendaFixa],
      rendaVariavel: [valores.rendaVariavel],
      gastosFixos: [valores.gastosFixos],
      gastosVariaveis: [valores.gastosVariaveis],
      divida: [valores.dividas], 
      investimentos: [valores.investimentos]
    };

    setData(newData); 
    await saveToSupabase(newData); 
  };

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
    window.location.reload(); 
  };

  if (showResults) {
    return (
      <div className="w-full relative animate-in fade-in duration-500">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#1D4F91] via-[#77127B] to-[#E80070] tracking-tight">
            Raio-X Financeiro
          </h2>
          
          {/* --- BOTÃO REINICIAR ATUALIZADO --- */}
          <MagneticButton 
            onClick={resetCalculator} 
            className="group relative overflow-hidden flex items-center px-6 py-3 rounded-2xl font-bold text-sm text-white shadow-lg shadow-[#1D4F91]/20 hover:shadow-[#E80070]/40 transition-all duration-300 hover:-translate-y-0.5 active:scale-95"
          >
            {/* Gradiente Padrão: Dark Blue -> Purple */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#1D4F91] to-[#77127B] transition-opacity duration-500 group-hover:opacity-0" />
            
            {/* Gradiente de Hover: Purple -> Raspberry -> Magenta */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#77127B] via-[#C1188B] to-[#E80070] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            
            {/* Conteúdo em z-index alto para ficar acima do fundo */}
            <span className="relative z-10 flex items-center gap-2.5">
              <RefreshCw className="w-4 h-4 group-hover:-rotate-180 transition-transform duration-500 ease-in-out" />
              Reiniciar Calculadora
            </span>
          </MagneticButton>
          {/* --------------------------------- */}

        </div>
        <ResultsSection data={data} onSave={handleSaveEdits} />
      </div>
    );
  }

  return (
    <div id="calculator" className="w-full animate-in slide-in-from-bottom-4 duration-500">
      <ScrollReveal>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#1D4F91] via-[#77127B] to-[#E80070] tracking-tight">
            Raio-X Financeiro
          </h2>
        </div>
      </ScrollReveal>

      <div className="w-full bg-white dark:bg-gray-800 shadow-2xl shadow-[#1D4F91]/10 rounded-3xl overflow-hidden flex flex-col md:flex-row relative border border-gray-100 dark:border-gray-700">
          <div className="absolute top-0 left-0 h-1.5 bg-gray-100 dark:bg-gray-700 w-full z-10">
            <motion.div 
              className="h-full bg-gradient-to-r from-[#1D4F91] via-[#77127B] to-[#E80070]" 
              initial={{ width: 0 }} 
              animate={{ width: `${progressPercentage}%` }} 
              transition={{ duration: 0.5, ease: "easeInOut" }} 
            />
          </div>

          <div className="w-full h-48 md:h-auto md:w-5/12 relative bg-gray-900 overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.img 
                key={step.image} 
                src={step.image} 
                alt={step.title} 
                initial={{ scale: 1.05, opacity: 0 }} 
                animate={{ scale: 1, opacity: 0.7 }} 
                exit={{ scale: 0.95, opacity: 0 }} 
                transition={{ duration: 0.4 }} 
                className="absolute inset-0 w-full h-full object-cover" 
              />
            </AnimatePresence>
            <div className="absolute inset-0 bg-gradient-to-t from-[#1D4F91]/90 via-[#1D4F91]/40 to-transparent flex items-end p-8">
              <p className="text-white text-lg font-medium drop-shadow-md">{step.description}</p>
            </div>
          </div>

          <div className="w-full md:w-7/12 p-8 md:p-12 flex flex-col justify-center min-h-[500px]">
            <AnimatePresence mode="wait">
              <motion.div key={currentStep} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }} className="flex flex-col h-full w-full">
                
                <motion.div layout className="mb-3 text-sm font-extrabold text-[#C1188B] uppercase tracking-widest bg-[#C1188B]/10 dark:bg-[#C1188B]/20 inline-block px-4 py-1.5 rounded-full w-max">
                  Passo {currentStep + 1} de {steps.length}
                </motion.div>
                
                <motion.h3 layout className="text-3xl font-extrabold text-[#1D4F91] dark:text-white mb-3 tracking-tight">
                  {step.title}
                </motion.h3>
                <motion.p layout className="text-gray-500 dark:text-gray-300 mb-8 text-lg leading-relaxed">
                  {step.question}
                </motion.p>

                <div className="flex flex-col flex-grow justify-end">
                  {items.length > 0 && (
                    <motion.div layout className="flex flex-wrap gap-2.5 mb-6 max-h-[160px] overflow-y-auto pr-2 pb-2 custom-scrollbar">
                      <AnimatePresence>
                        {items.map((item, i) => (
                          <motion.div 
                            layout
                            initial={{ scale: 0.8, opacity: 0, y: 10 }} 
                            animate={{ scale: 1, opacity: 1, y: 0 }} 
                            exit={{ scale: 0.8, opacity: 0, width: 0 }}
                            transition={{ duration: 0.2 }}
                            key={i} 
                            className="flex items-center gap-2 bg-[#426DA9]/10 dark:bg-[#426DA9]/20 border border-[#426DA9]/30 text-[#1D4F91] dark:text-[#426DA9] px-4 py-2.5 rounded-full font-bold shadow-sm"
                          >
                            R$ {item.toFixed(2).replace(".", ",")}
                            <MagneticButton 
                              onClick={() => setItems(items.filter((_, idx) => idx !== i))} 
                              className="text-[#E80070] hover:text-[#C1188B] hover:scale-110 transition-all p-1 flex items-center justify-center"
                            >
                              <X className="w-4 h-4" />
                            </MagneticButton>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </motion.div>
                  )}

                  <motion.div layout className="flex flex-col sm:flex-row gap-4 mt-auto mb-6">
                    <div className="relative flex-1 group">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-lg group-focus-within:text-[#E80070] dark:group-focus-within:text-[#E80070] transition-colors">R$</span>
                      <input 
                        value={inputValue} 
                        onChange={(e) => setInputValue(formatCurrency(e.target.value))} 
                        onKeyDown={(e) => { if (e.key === 'Enter') handleAddItem(); }}
                        className="w-full h-14 pl-12 pr-4 border-2 border-gray-200 bg-gray-50 text-gray-900 focus:bg-white focus:border-[#E80070] focus:ring-4 focus:ring-[#E80070]/10 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:focus:bg-gray-700 dark:focus:border-[#E80070] dark:focus:text-white dark:focus:ring-[#E80070]/20 rounded-2xl outline-none transition-all font-bold text-lg" 
                        placeholder="0,00" 
                      />
                    </div>
                    <MagneticButton 
                      onClick={handleAddItem} 
                      className="h-14 px-8 border-2 border-[#426DA9] text-[#426DA9] hover:bg-[#426DA9] hover:text-white rounded-2xl flex items-center justify-center gap-2 font-bold transition-all disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-[#426DA9] active:scale-95" 
                      disabled={!inputValue || inputValue === "0,00"}
                    >
                      <Plus size={20} /> Adicionar
                    </MagneticButton>
                  </motion.div>
                </div>

                <motion.div layout className="flex justify-between items-center pt-6 border-t border-gray-100 dark:border-gray-700 mt-2 gap-4">
                  <MagneticButton 
                    onClick={handleBack} 
                    disabled={currentStep === 0 && history.length === 0} 
                    className="bg-gradient-to-r from-[#C1188B] to-[#E80070] hover:from-[#77127B] hover:to-[#C1188B] text-white px-8 py-3.5 rounded-2xl flex items-center gap-3 font-bold shadow-lg shadow-[#E80070]/30 hover:shadow-[#E80070]/50 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-[#C1188B] disabled:hover:to-[#E80070] disabled:shadow-none"
                  >
                    <ArrowLeft size={20} /> Voltar
                  </MagneticButton>
                  <MagneticButton 
                    onClick={handleNext} 
                    className="bg-gradient-to-r from-[#C1188B] to-[#E80070] hover:from-[#77127B] hover:to-[#C1188B] text-white px-8 py-3.5 rounded-2xl flex items-center gap-3 font-bold shadow-lg shadow-[#E80070]/30 hover:shadow-[#E80070]/50 transition-all active:scale-95"
                  >
                    {currentStep === steps.length - 1 ? "Ver Resultados" : "Próximo"} <ArrowRight size={20} />
                  </MagneticButton>
                </motion.div>

              </motion.div>
            </AnimatePresence>
          </div>
        </div>
    </div>
  );
}