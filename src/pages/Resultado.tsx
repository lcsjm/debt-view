import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import { Pencil, Check, Lightbulb, TrendingDown, Target, ShieldCheck, Wallet, ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import { 
  PieChart, Pie, Cell, ResponsiveContainer, 
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid 
} from "recharts";

export default function Resultado() {
  const [editMode, setEditMode] = useState(false);

  const [finances, setFinances] = useState({
    rendaFixa: 0,
    rendaVariavel: 0,
    gastosFixos: 0,
    gastosVariaveis: 0,
    dividas: 0,
    investimentos: 0,
  });

  const totalReceitas = finances.rendaFixa + finances.rendaVariavel;
  const totalDespesas = finances.gastosFixos + finances.gastosVariaveis + finances.dividas;

  const dataPie = [
    { name: "Gastos Fixos", value: finances.gastosFixos, color: "#E63888" },
    { name: "Gastos Variáveis", value: finances.gastosVariaveis, color: "#FF69B4" },
    { name: "Dívidas", value: finances.dividas, color: "#1D4F91" },
    { name: "Investimentos", value: finances.investimentos, color: "#6D2077" },
  ].filter(item => item.value > 0);

  const dataBar = [
    { name: "Entradas", valor: totalReceitas, fill: "#6D2077" },
    { name: "Saídas", valor: totalDespesas, fill: "#E63888" },
  ];

  return (
    <>
      <Sidebar />
      <div className="min-h-screen bg-[#1D4F91] py-10 px-4 md:px-10 space-y-12">
        
        {/* --- SECTION 1: PAINEL DE INPUTS (TODOS OS 6 AQUI) --- */}
        <section className="relative w-full max-w-6xl mx-auto bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl p-8 md:p-12">
          <button
            onClick={() => setEditMode(!editMode)}
            className="absolute top-8 right-8 p-4 bg-[#6D2077] text-white rounded-full shadow-lg hover:bg-[#E63888] transition-all transform hover:scale-110 flex items-center gap-2 z-10"
          >
            {editMode ? <><Check size={20} /> Salvar</> : <><Pencil size={20} /> Editar</>}
          </button>

          <h1 className="text-3xl font-black text-center mb-12 text-[#1D4F91] uppercase tracking-tighter">
            Painel de Controle <span className="text-[#E63888]">Financeiro</span>
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Input 1: Renda Fixa */}
            <div className="p-6 bg-white rounded-2xl shadow-sm border-t-8 border-[#6D2077] flex flex-col justify-between h-full">
              <h2 className="font-bold mb-3 text-[#6D2077] flex items-center justify-center gap-2">
                <ArrowUpCircle size={18}/> Renda Fixa
              </h2>
              <input
                type="number"
                disabled={!editMode}
                value={finances.rendaFixa}
                onChange={(e) => setFinances({ ...finances, rendaFixa: Number(e.target.value) })}
                className={`w-full p-3 text-2xl font-black text-center border-2 rounded-xl transition-all ${
                  editMode ? "bg-gray-50 border-purple-200 focus:border-[#6D2077]" : "bg-transparent border-transparent text-[#1D4F91]"
                }`}
              />
            </div>

            {/* Input 2: Renda Variável */}
            <div className="p-6 bg-white rounded-2xl shadow-sm border-t-8 border-[#6D2077] flex flex-col justify-between h-full">
              <h2 className="font-bold mb-3 text-[#6D2077] flex items-center justify-center gap-2">
                <ArrowUpCircle size={18}/> Renda Variável
              </h2>
              <input
                type="number"
                disabled={!editMode}
                value={finances.rendaVariavel}
                onChange={(e) => setFinances({ ...finances, rendaVariavel: Number(e.target.value) })}
                className={`w-full p-3 text-2xl font-black text-center border-2 rounded-xl transition-all ${
                  editMode ? "bg-gray-50 border-purple-200 focus:border-[#6D2077]" : "bg-transparent border-transparent text-[#1D4F91]"
                }`}
              />
            </div>

            {/* Input 3: Gastos Fixos */}
            <div className="p-6 bg-white rounded-2xl shadow-sm border-t-8 border-[#E63888] flex flex-col justify-between h-full">
              <h2 className="font-bold mb-3 text-[#E63888] flex items-center justify-center gap-2">
                <ArrowDownCircle size={18}/> Gastos Fixos
              </h2>
              <input
                type="number"
                disabled={!editMode}
                value={finances.gastosFixos}
                onChange={(e) => setFinances({ ...finances, gastosFixos: Number(e.target.value) })}
                className={`w-full p-3 text-2xl font-black text-center border-2 rounded-xl transition-all ${
                  editMode ? "bg-gray-50 border-pink-200 focus:border-[#E63888]" : "bg-transparent border-transparent text-[#E63888]"
                }`}
              />
            </div>

            {/* Input 4: Gastos Variáveis */}
            <div className="p-6 bg-white rounded-2xl shadow-sm border-t-8 border-[#E63888] flex flex-col justify-between h-full">
              <h2 className="font-bold mb-3 text-[#E63888] flex items-center justify-center gap-2">
                <ArrowDownCircle size={18}/> Gastos Variáveis
              </h2>
              <input
                type="number"
                disabled={!editMode}
                value={finances.gastosVariaveis}
                onChange={(e) => setFinances({ ...finances, gastosVariaveis: Number(e.target.value) })}
                className={`w-full p-3 text-2xl font-black text-center border-2 rounded-xl transition-all ${
                  editMode ? "bg-gray-50 border-pink-200 focus:border-[#E63888]" : "bg-transparent border-transparent text-[#E63888]"
                }`}
              />
            </div>

            {/* Input 5: Dívidas */}
            <div className="p-6 bg-white rounded-2xl shadow-sm border-t-8 border-red-500 flex flex-col justify-between h-full">
              <h2 className="font-bold mb-3 text-red-500 flex items-center justify-center gap-2">
                ⚠️ Dívidas
              </h2>
              <input
                type="number"
                disabled={!editMode}
                value={finances.dividas}
                onChange={(e) => setFinances({ ...finances, dividas: Number(e.target.value) })}
                className={`w-full p-3 text-2xl font-black text-center border-2 rounded-xl transition-all ${
                  editMode ? "bg-red-50 border-red-200 focus:border-red-500" : "bg-transparent border-transparent text-red-600"
                }`}
              />
            </div>

            {/* Input 6: Investimentos */}
            <div className="p-6 bg-white rounded-2xl shadow-sm border-t-8 border-green-500 flex flex-col justify-between h-full">
              <h2 className="font-bold mb-3 text-green-500 flex items-center justify-center gap-2">
                <ShieldCheck size={18}/> Investimentos
              </h2>
              <input
                type="number"
                disabled={!editMode}
                value={finances.investimentos}
                onChange={(e) => setFinances({ ...finances, investimentos: Number(e.target.value) })}
                className={`w-full p-3 text-2xl font-black text-center border-2 rounded-xl transition-all ${
                  editMode ? "bg-green-50 border-green-200 focus:border-green-500" : "bg-transparent border-transparent text-green-600"
                }`}
              />
            </div>

          </div>
        </section>

        {/* --- SECTION 2: GRÁFICOS --- */}
        <div className="w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          <section className="bg-white rounded-[2.5rem] p-8 shadow-xl">
            <h3 className="text-xl font-black mb-6 text-[#1D4F91] border-b pb-2 italic text-center uppercase tracking-tighter">Distribuição</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={dataPie} innerRadius={70} outerRadius={100} paddingAngle={8} dataKey="value">
                    {dataPie.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className="bg-white rounded-[2.5rem] p-8 shadow-xl">
            <h3 className="text-xl font-black mb-6 text-[#1D4F91] border-b pb-2 italic text-center uppercase tracking-tighter">Comparativo</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dataBar}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip cursor={{fill: '#f3f4f6'}} />
                  <Bar dataKey="valor" radius={[10, 10, 0, 0]} barSize={60} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>
        </div>

        {/* --- SECTION 3: ESTRATÉGIA --- */}
        <section className="w-full max-w-6xl mx-auto bg-gradient-to-r from-[#E63888] to-[#FF69B4] text-white rounded-3xl p-10 shadow-xl flex flex-col md:flex-row items-center gap-10">
          <div className="p-6 bg-white/20 rounded-full border-4 border-white/30 animate-pulse shrink-0">
            <TrendingDown size={60} strokeWidth={3} />
          </div>
          <div>
            <h2 className="text-3xl font-black mb-4 uppercase italic tracking-tighter">1. O Método Bola de Neve</h2>
            <p className="text-lg leading-relaxed font-medium">
              Liste suas dívidas da <strong>menor para a maior</strong>. Ao quitar a pequena primeiro, você ganha impulso psicológico para as maiores.
            </p>
          </div>
        </section>

        {/* --- SECTION 4: RESERVA --- */}
        <section className="w-full max-w-6xl mx-auto bg-white rounded-3xl p-10 shadow-xl border-l-[15px] border-yellow-400">
          <div className="flex items-center gap-5 mb-8">
            <ShieldCheck className="text-yellow-500" size={45} />
            <h2 className="text-3xl font-black text-[#1D4F91] tracking-tighter">2. Sua Reserva de Paz</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <p className="text-xl text-gray-600 font-medium">
              Sua meta atual é acumular: <span className="text-4xl block mt-2 text-[#1D4F91] font-black tracking-tighter">R$ {(finances.gastosFixos * 6).toLocaleString('pt-BR')}</span>
            </p>
            <div className="bg-gray-100 p-8 rounded-2xl text-center border-2 border-dashed border-gray-300">
               <p className="text-sm font-bold uppercase text-gray-400 mb-2">Status da Reserva</p>
               <div className="text-5xl font-black text-[#1D4F91]">15%</div>
            </div>
          </div>
        </section>

      </div>
    </>
  );
}