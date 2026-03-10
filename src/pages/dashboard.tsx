import { useState } from "react";
import { Link } from "react-router-dom";
import css from "../App.css";
import Sidebar from "@/components/Sidebar";
import { Pencil, Check } from "lucide-react";
import { E } from "vitest/dist/chunks/environment.d.cL3nLXbE.js";

export default function Dashboard() {
  const [editMode, setEditMode] = useState(false);

  // Estado unificado para todas as finanças
  const [finances, setFinances] = useState({
    rendaFixa: 0,
    rendaVariavel: 0,
    gastosFixos: 0,
    gastosVariaveis: 0,
    dividas: 0,
    investimentos: 0,
  });

  return (
    <>
      <Sidebar />

      <div className="min-h-screen flex items-center justify-center px-10 bg-[#1D4F91]">
        <section className="relative w-full max-w-6xl bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl p-10">
          
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
            
            {/* Input: Renda Fixa */}
            <div className="p-6 bg-gray-50 rounded-xl shadow-md border-t-4 border-[#6D2077]">
              <h2 className="font-semibold mb-4 text-[#6D2077]">Renda Fixa</h2>
              <input
                type="number"
                placeholder="Renda Fixa"
                disabled={!editMode}
                value={finances.rendaFixa}
                onChange={(e) => setFinances({ ...finances, rendaFixa: Number(e.target.value) })}
                className={`w-full p-3 text-xl font-bold text-center border-2 rounded-lg transition-all ${
                  editMode ? "bg-white border-gray-300" : "bg-transparent border-transparent cursor-default"
                }`}
              />
            </div>

            {/* Input: Renda Variável */}
            <div className="p-6 bg-gray-50 rounded-xl shadow-md border-t-4 border-[#6D2077]">
              <h2 className="font-semibold mb-4 text-[#6D2077]">Renda Variável</h2>
              <input
                type="number"
                placeholder="Renda Variável"
                disabled={!editMode}
                value={finances.rendaVariavel}
                onChange={(e) => setFinances({ ...finances, rendaVariavel: Number(e.target.value) })}
                className={`w-full p-3 text-xl font-bold text-center border-2 rounded-lg transition-all ${
                  editMode ? "bg-white border-gray-300" : "bg-transparent border-transparent cursor-default"
                }`}
              />
            </div>

            {/* Input: Gastos Fixos */}
            <div className="p-6 bg-gray-50 rounded-xl shadow-md border-t-4 border-[#E63888]">
              <h2 className="font-semibold mb-4 text-[#E63888]">Gastos Fixos</h2>
              <input
                type="number"
                placeholder="Gastos Fixos"
                disabled={!editMode}
                value={finances.gastosFixos}
                onChange={(e) => setFinances({ ...finances, gastosFixos: Number(e.target.value) })}
                className={`w-full p-3 text-xl font-bold text-center border-2 rounded-lg transition-all ${
                  editMode ? "bg-white border-gray-300" : "bg-transparent border-transparent cursor-default"
                }`}
              />
            </div>

            {/* Input: Gastos Variáveis */}
            <div className="p-6 bg-gray-50 rounded-xl shadow-md border-t-4 border-[#E63888]">
              <h2 className="font-semibold mb-4 text-[#E63888]">Gastos Variáveis</h2>
              <input
                type="number"
                placeholder="Gastos Variáveis"
                disabled={!editMode}
                value={finances.gastosVariaveis}
                onChange={(e) => setFinances({ ...finances, gastosVariaveis: Number(e.target.value) })}
                className={`w-full p-3 text-xl font-bold text-center border-2 rounded-lg transition-all ${
                  editMode ? "bg-white border-gray-300" : "bg-transparent border-transparent cursor-default"
                }`}
              />
            </div>

            {/* Input: Dívidas */}
            <div className="p-6 bg-gray-50 rounded-xl shadow-md border-t-4 border-[#E63888]">
              <h2 className="font-semibold mb-4 text-[#E63888]">Dívidas</h2>
              <input
                type="number"
                placeholder="Dívidas"
                disabled={!editMode}
                value={finances.dividas}
                onChange={(e) => setFinances({ ...finances, dividas: Number(e.target.value) })}
                className={`w-full p-3 text-xl font-bold text-center border-2 rounded-lg transition-all ${
                  editMode ? "bg-white border-gray-300" : "bg-transparent border-transparent cursor-default"
                }`}
              />
            </div>

            {/* Input: Investimentos */}
            <div className="p-6 bg-gray-50 rounded-xl shadow-md border-t-4 border-[#6D2077]">
              <h2 className="font-semibold mb-4 text-[#6D2077]">Investimentos</h2>
              <input
                type="number"
                placeholder="Investimentos"
                disabled={!editMode}
                value={finances.investimentos}
                onChange={(e) => setFinances({ ...finances, investimentos: Number(e.target.value) })}
                className={`w-full p-3 text-xl font-bold text-center border-2 rounded-lg transition-all ${
                  editMode ? "bg-white border-gray-300" : "bg-transparent border-transparent cursor-default"
                }`}
              />
            </div>

          </div>
        </section>
      </div>
    </>
  );
}