import { useState } from "react";
import { motion } from "framer-motion";

/* -------------------- Expense Analysis -------------------- */

type Expense = {
  categoria: string;
  valor: number;
  percent: number;
};

/* 🔧 ADICIONADO: tipagem das props que vêm da Dashboard */
type TransactionsSectionProps = {
  expenses: Expense[];
  setExpenses: React.Dispatch<React.SetStateAction<Expense[]>>;
};

const barColors = [
  "bg-blue-500",
  "bg-green-500",
  "bg-red-500",
  "bg-yellow-500",
  "bg-purple-500",
  "bg-blue-300",
  "bg-green-300",
  "bg-gray-400",
];

/* -------------------- Main Page -------------------- */

/* 🔧 ALTERADO: componente agora recebe props da Dashboard */
export default function TransactionsSection({
  expenses,
  setExpenses,
}: TransactionsSectionProps) {

  const [step, setStep] = useState<"start" | "questions" | "result">("start");

  const [answers, setAnswers] = useState({
    food: "",
    entertainment: "",
    subscriptions: "",
    housing:"",
    delivery:"",
    transportation:"",
    health:"",
    others:""
  });

  function handleChange(field: string, value: string) {
    setAnswers((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  /* Converter respostas em despesas */

  const expensesBase = [
    { categoria: "Alimentação", valor: Number(answers.food) },
    { categoria: "Serviços de streaming", valor: Number(answers.entertainment) },
    { categoria: "Assinaturas", valor: Number(answers.subscriptions) },
    { categoria: "Moradia", valor: Number(answers.housing) },
    { categoria: "Deliverys", valor: Number(answers.delivery) },
    { categoria: "Saude", valor: Number(answers.health) },
    { categoria: "Transporte", valor: Number(answers.transportation) },
    { categoria: "Outros", valor: Number(answers.others) },
  ];

  const total = expensesBase.reduce((acc, item) => acc + item.valor, 0);

  const expensesCalculated: Expense[] = expensesBase.map((item) => ({
    ...item,
    percent: total ? (item.valor / total) * 100 : 0,
  }));
  /* 🔧 ADICIONADO: renomeei para expensesCalculated para não conflitar com a prop expenses */

  function ExpenseAnalysis({ expenses }: { expenses: Expense[] }) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-white p-8 rounded-2xl shadow-md border border-gray-100 max-w-6xl mx-auto"
      >
        <h2 className="text-xl font-semibold text-gray-800 mb-1">
          Análise de Gastos
        </h2>

        <p className="text-sm text-gray-500 mb-6">
          Distribuição dos seus gastos por categoria
        </p>

        <div className="space-y-3">
          {expenses.map((exp, i) => (
            <div key={exp.categoria} className="flex items-center gap-3">
              <span className="text-xs text-gray-500 w-24 shrink-0 text-right">
                {exp.categoria}
              </span>

              <div className="flex-1 h-6 bg-gray-200 rounded overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${exp.percent}%` }}
                  transition={{ duration: 0.6, delay: i * 0.05 }}
                  className={`h-full ${barColors[i % barColors.length]}`}
                />
              </div>

              <span className="text-sm font-medium w-24 text-right">
                R$ {exp.valor.toLocaleString("pt-BR")}
              </span>

              <span className="text-xs text-gray-500 w-12 text-right">
                {exp.percent.toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      </motion.div>
    );
  }

  return (
    <section
      id="transactions-section"
      className="w-full max-w-6xl mx-auto mt-10 space-y-6 px-6"
    >

      {/* START */}

      {step === "start" && (
        <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-100 text-center space-y-4">
          <h2 className="text-2xl font-semibold text-gray-800">
            Crie sua transição financeira
          </h2>

          <p className="text-gray-500">
            Responda algumas perguntas para analisarmos seus gastos e gerar
            desafios personalizados.
          </p>

          <button
            onClick={() => setStep("questions")}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
          >
            Começar agora
          </button>
        </div>
      )}

      {/* QUESTIONS */}

      {step === "questions" && (
        <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-100 space-y-6">

          <h2 className="text-xl font-semibold text-gray-800 text-center">
            Questionário de gastos
          </h2>

           <div className="space-y-4">

            <div className="flex flex-col">
              <label className="text-sm text-gray-600 mb-1">
                Quanto você gasta com alimentação?
              </label>

              <input
                type="number"
                value={answers.food}
                onChange={(e) => handleChange("food", e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

             <div className="flex flex-col">
              <label className="text-sm text-gray-600 mb-1">
                Quanto você gasta com Moradia?
              </label>

              <input
                type="number"
                value={answers.housing}
                onChange={(e) =>
                  handleChange("housing", e.target.value)
                }
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

             <div className="flex flex-col">
              <label className="text-sm text-gray-600 mb-1">
                Quanto você gasta com saude?
              </label>

              <input
                type="number"
                value={answers.health}
                onChange={(e) =>
                  handleChange("health", e.target.value)
                }
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

             <div className="flex flex-col">
              <label className="text-sm text-gray-600 mb-1">
                Quanto você gasta com Transporte?
              </label>

              <input
                type="number"
                value={answers.transportation}
                onChange={(e) =>
                  handleChange("transportation", e.target.value)
                }
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

             <div className="flex flex-col">
              <label className="text-sm text-gray-600 mb-1">
                Quanto você gasta com delivery?
              </label>

              <input
                type="number"
                value={answers.delivery}
                onChange={(e) =>
                  handleChange("delivery", e.target.value)
                }
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

             <div className="flex flex-col">
              <label className="text-sm text-gray-600 mb-1">
                Quanto você gasta com Outros?
              </label>

              <input
                type="number"
                value={answers.others}
                onChange={(e) =>
                  handleChange("others", e.target.value)
                }
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-sm text-gray-600 mb-1">
                Quanto você gasta com serviços de streaming?
              </label>

              <input
                type="number"
                value={answers.entertainment}
                onChange={(e) =>
                  handleChange("entertainment", e.target.value)
                }
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-sm text-gray-600 mb-1">
                Quanto você paga em assinaturas?
              </label>

              <input
                type="number"
                value={answers.subscriptions}
                onChange={(e) =>
                  handleChange("subscriptions", e.target.value)
                }
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>


          </div>

          <button
            onClick={() => {
              setStep("result");

              /* 🔧 ADICIONADO:
                 envia os gastos calculados para a Dashboard
                 isso permite que a ChallengerSection detecte os gastos */
              setExpenses(expensesCalculated);
            }}
            className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition"
          >
            Ver análise de gastos
          </button>

        </div>
      )}

      {/* RESULT */}

      {step === "result" && (
        /* 🔧 ALTERADO: usa expensesCalculated */
        <ExpenseAnalysis expenses={expensesCalculated} />
      )}

    </section>
  );
}