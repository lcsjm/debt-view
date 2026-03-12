import { useState } from "react";
import { motion } from "framer-motion";

/* -------------------- Expense Analysis -------------------- */

type Expense = {
  categoria: string;
  valor: number;
  percent: number;
};

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

export default function TransactionsSection({
  expenses,
  setExpenses,
}: TransactionsSectionProps) {

  const [step, setStep] = useState<"start" | "questions" | "result">("start");

  /* STEP DAS PERGUNTAS */
  const [questionStep, setQuestionStep] = useState(0);

  const [answers, setAnswers] = useState({
    food: "",
    entertainment: "",
    subscriptions: "",
    housing: "",
    delivery: "",
    transportation: "",
    health: "",
    others: "",
  });

  function handleChange(field: string, value: string) {
    setAnswers((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  const expensesBase = [
    { categoria: "Moradia", valor: Number(answers.housing) },
    { categoria: "Alimentação", valor: Number(answers.food) },
    { categoria: "Transporte", valor: Number(answers.transportation) },
    { categoria: "Saúde", valor: Number(answers.health) },
    { categoria: "Assinaturas", valor: Number(answers.subscriptions) },
    { categoria: "Streaming", valor: Number(answers.entertainment) },
    { categoria: "Delivery", valor: Number(answers.delivery) },
    { categoria: "Outros", valor: Number(answers.others) },
  ];

  const total = expensesBase.reduce((acc, item) => acc + item.valor, 0);

  const expensesCalculated: Expense[] = expensesBase.map((item) => ({
    ...item,
    percent: total ? (item.valor / total) * 100 : 0,
  }));

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
            Responda algumas perguntas para analisarmos seus gastos.
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
        <div className="bg-white p-10 rounded-2xl shadow-md border border-gray-100 space-y-8">

          <h2 className="text-xl font-semibold text-gray-800 text-center">
            Questionário de gastos
          </h2>

          {/* PERGUNTA */}

          <motion.div
            key={questionStep}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >

            {questionStep === 0 && (
              <>
                <label className="text-sm font-medium text-gray-600">
                  Quanto você gasta com moradia?
                </label>
                <input
                  type="number"
                  placeholder="Ex: 1200"
                  value={answers.housing}
                  onChange={(e) => handleChange("housing", e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-5 py-4 text-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none shadow-sm transition"
                />
              </>
            )}

            {questionStep === 1 && (
              <>
                <label className="text-sm font-medium text-gray-600">
                  Quanto você gasta com alimentação?
                </label>
                <input
                  type="number"
                  placeholder="Ex: 600"
                  value={answers.food}
                  onChange={(e) => handleChange("food", e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-5 py-4 text-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none shadow-sm transition"
                />
              </>
            )}

            {questionStep === 2 && (
              <>
                <label className="text-sm font-medium text-gray-600">
                  Quanto você gasta com transporte?
                </label>
                <input
                  type="number"
                  placeholder="Ex: 300"
                  value={answers.transportation}
                  onChange={(e) =>
                    handleChange("transportation", e.target.value)
                  }
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-5 py-4 text-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none shadow-sm transition"
                />
              </>
            )}

            {questionStep === 3 && (
              <>
                <label className="text-sm font-medium text-gray-600">
                  Quanto você gasta com saúde?
                </label>
                <input
                  type="number"
                  placeholder="Ex: 200"
                  value={answers.health}
                  onChange={(e) => handleChange("health", e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-5 py-4 text-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none shadow-sm transition"
                />
              </>
            )}

            {questionStep === 4 && (
              <>
                <label className="text-sm font-medium text-gray-600">
                  Quanto você paga em assinaturas?
                </label>
                <input
                  type="number"
                  placeholder="Ex: 80"
                  value={answers.subscriptions}
                  onChange={(e) =>
                    handleChange("subscriptions", e.target.value)
                  }
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-5 py-4 text-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none shadow-sm transition"
                />
              </>
            )}

            {questionStep === 5 && (
              <>
                <label className="text-sm font-medium text-gray-600">
                  Quanto você gasta com streaming?
                </label>
                <input
                  type="number"
                  placeholder="Ex: 50"
                  value={answers.entertainment}
                  onChange={(e) =>
                    handleChange("entertainment", e.target.value)
                  }
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-5 py-4 text-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none shadow-sm transition"
                />
              </>
            )}

            {questionStep === 6 && (
              <>
                <label className="text-sm font-medium text-gray-600">
                  Quanto você gasta com delivery?
                </label>
                <input
                  type="number"
                  placeholder="Ex: 150"
                  value={answers.delivery}
                  onChange={(e) => handleChange("delivery", e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-5 py-4 text-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none shadow-sm transition"
                />
              </>
            )}

            {questionStep === 7 && (
              <>
                <label className="text-sm font-medium text-gray-600">
                  Outros gastos
                </label>
                <input
                  type="number"
                  placeholder="Ex: 100"
                  value={answers.others}
                  onChange={(e) => handleChange("others", e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-5 py-4 text-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none shadow-sm transition"
                />
              </>
            )}

          </motion.div>

          {/* BOTÕES */}

          <div className="flex justify-between">

            {questionStep > 0 && (
              <button
                onClick={() => setQuestionStep((prev) => prev - 1)}
                className="px-5 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Voltar
              </button>
            )}

            {questionStep < 7 ? (
              <button
                onClick={() => setQuestionStep((prev) => prev + 1)}
                className="ml-auto bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
              >
                Próxima
              </button>
            ) : (
              <button
                onClick={() => {
                  setStep("result");
                  setExpenses(expensesCalculated);
                }}
                className="ml-auto bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
              >
                Ver análise
              </button>
            )}

          </div>

        </div>
      )}

      {/* RESULT */}

      {step === "result" && (
        <ExpenseAnalysis expenses={expensesCalculated} />
      )}

    </section>
  );
}