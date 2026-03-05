import { useState } from "react";
import { Link } from "react-router-dom";
import css from "../App.css";
import Sidebar from "@/components/Sidebar";
import { Pencil, Check } from "lucide-react";

export default function Resultado() {
  const [editMode, setEditMode] = useState(false);

  const [values, setValues] = useState({
    rendaFixa: 0,
    rendaVariavel: 0,
    gastosFixos: 0,
    gastosVariaveis: 0,
    dividas: 0,
    investimentos: 0,
  });

  const handleChange = (field: string, value: string) => {
    setValues({ ...values, [field]: Number(value) });
  };

  const cards = [
    { label: "Renda Fixa", key: "rendaFixa", color: "#6D2077" },
    { label: "Renda Variável", key: "rendaVariavel", color: "#6D2077" },
    { label: "Gastos Fixos", key: "gastosFixos", color: "#E63888" },
    { label: "Gastos Variáveis", key: "gastosVariaveis", color: "#E63888" },
    { label: "Dívidas", key: "dividas", color: "#E63888" },
    { label: "Investimentos", key: "investimentos", color: "#6D2077" },
  ];

  return (
    <>
      <Sidebar />

      <div className="background">
        <div className="min-h-screen flex items-center justify-center px-10 bg-[#1D4F91]">
          <section className="relative w-full max-w-6xl bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl p-10">
            {/* Botão editar/salvar */}
            <button
              onClick={() => setEditMode(!editMode)}
              className="absolute top-6 right-6 p-3 bg-[#6D2077] text-white rounded-full shadow-lg hover:bg-[#E63888] transition"
            >
              {editMode ? <Check size={18} /> : <Pencil size={18} />}
            </button>

            <h1 className="text-3xl font-bold text-center mb-12 text-[#1D4F91]">
              Seu Painel Financeiro
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              {cards.map((item) => (
                <div
                  key={item.key}
                  className="p-6 bg-gray-50 rounded-xl shadow-md border-t-4"
                  style={{ borderColor: item.color }}
                >
                  <h2 className="font-semibold" style={{ color: item.color }}>
                    {item.label}
                  </h2>

                  {editMode ? (
                    <input
                      type="number"
                      value={values[item.key as keyof typeof values]}
                      onChange={(e) => handleChange(item.key, e.target.value)}
                      className="mt-3 text-2xl font-bold text-center border rounded-md w-full p-2"
                    />
                  ) : (
                    <p
                      className="text-2xl mt-3 font-bold"
                      style={{ color: item.color }}
                    >
                      R${" "}
                      {values[item.key as keyof typeof values].toLocaleString(
                        "pt-BR",
                      )}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}