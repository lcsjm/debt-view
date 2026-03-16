import { useState } from "react";
import { Link } from "react-router-dom";
import * as XLSX from "xlsx";
import "../App.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ptBR } from "date-fns/locale/pt-BR";
import { useDebts, DebtData } from "../hooks/useDebts";
import { Trash2 } from "lucide-react";

export default function Debts() {
  const { debts, isLoading, saveDebt, isSaving, deleteDebt } = useDebts();
  
  const [newDebt, setNewDebt] = useState<Partial<DebtData>>({
    creditor: "",
    value: 0,
    amount: 0,
    rate: 0,
    status: "",
  });
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  
  const [pToast, setPToast] = useState("");

  function showToast(msg: string) {
    setPToast(msg);
    setTimeout(() => {
      setPToast("");
    }, 5000);
  }

  const handleSave = async () => {
    if (!newDebt.creditor || !newDebt.value) {
      showToast("Informe o credor e o valor original!");
      return;
    }

    try {
      await saveDebt({
        creditor: newDebt.creditor,
        value: newDebt.value || 0,
        amount: newDebt.amount || 0,
        rate: newDebt.rate || 0,
        status: newDebt.status || "Pendente",
        date: selectedDate ? selectedDate.toISOString() : null,
      } as DebtData);
      
      showToast("Dívida salva com sucesso!");
      
      // Reset form
      setNewDebt({ creditor: "", value: 0, amount: 0, rate: 0, status: "" });
      setSelectedDate(new Date());
    } catch (e: any) {
      showToast("Erro ao salvar: " + e.message);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDebt(id);
      showToast("Dívida excluída.");
    } catch (e: any) {
      showToast("Erro: " + e.message);
    }
  };

  const exportToExcel = () => {
    if (!debts || debts.length === 0) {
      showToast("Nenhuma dívida para exportar.");
      return;
    }
    const worksheet = XLSX.utils.json_to_sheet(debts);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Dívidas");
    XLSX.writeFile(workbook, "Minhas_Dividas.xlsx");
    showToast("Relatório exportado com sucesso!");
  };

  return (
    <>
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-slate-900 relative overflow-hidden text-white">
      <div className="absolute inset-0 auth-gradient-bg opacity-50 z-0"></div>
      
      <div className="relative z-10 w-full max-w-lg mx-auto p-4 md:p-8 flex flex-col pt-12">
        <div className="backdrop-blur-xl bg-white/[0.08] border border-white/20 rounded-3xl p-8 shadow-2xl flex flex-col gap-4">
          {pToast && (
            <div className="bg-emerald-600 px-4 py-2 rounded-lg text-center font-bold absolute top-4 left-4 right-4 z-50">
              <p>{pToast}</p>
            </div>
          )}

          <h1 className="text-2xl font-bold">Acompanhe sua dívida</h1>
          <Link to={"/dashboard"} className="text-blue-400 hover:text-blue-300 transition-colors">← Voltar pro Dashboard</Link>

          <p className="text-sm opacity-80">
            aqui estão todos os seus dados para acompanhar o andamento das suas dívidas
          </p>

          <div className="flex flex-col gap-3">
            <label className="text-sm">Digite o seu credor</label>
            <input
              type="text"
              className="px-4 py-2 rounded-lg bg-black/20 border border-white/10 outline-none focus:border-blue-400"
              value={newDebt.creditor || ""}
              onChange={(e) => setNewDebt({ ...newDebt, creditor: e.target.value })}
              placeholder="Ex: Banco Itau"
            />

            <label className="text-sm">Digite o valor original da sua dívida</label>
            <input
              type="number"
              className="px-4 py-2 rounded-lg bg-black/20 border border-white/10 outline-none focus:border-blue-400"
              value={newDebt.value || ""}
              onChange={(e) =>
                setNewDebt({ ...newDebt, value: parseFloat(e.target.value) })
              }
              placeholder="0,00"
            />

            <label className="text-sm">Digite o valor atual do juros aplicado a sua dívida</label>
            <input
              type="number"
              className="px-4 py-2 rounded-lg bg-black/20 border border-white/10 outline-none focus:border-blue-400"
              value={newDebt.amount || ""}
              onChange={(e) =>
                setNewDebt({ ...newDebt, amount: parseFloat(e.target.value) })
              }
              placeholder="0,00"
            />

            <label className="text-sm">Digite a taxa de juros aplicada</label>
            <input
              type="number"
              className="px-4 py-2 rounded-lg bg-black/20 border border-white/10 outline-none focus:border-blue-400"
              value={newDebt.rate || ""}
              onChange={(e) =>
                setNewDebt({ ...newDebt, rate: parseFloat(e.target.value) })
              }
              placeholder="0,00%"
            />

            <label className="text-sm">Data de vencimento (Opcional)</label>
            <DatePicker
              selected={selectedDate}
              onChange={(date) => setSelectedDate(date)}
              dateFormat="dd/MM/yyyy"
              locale={ptBR}
              placeholderText="Ex: 25/12/2024"
              className="w-full px-4 py-2 rounded-lg bg-black/20 border border-white/10 outline-none focus:border-blue-400"
              showPopperArrow={false}
              autoComplete="off"
            />

            <label className="text-sm">Status da sua dívida</label>
            <input
              type="text"
              className="px-4 py-2 rounded-lg bg-black/20 border border-white/10 outline-none focus:border-blue-400"
              value={newDebt.status || ""}
              onChange={(e) => setNewDebt({ ...newDebt, status: e.target.value })}
              placeholder="Em andamento"
            />
          </div>

          <div className="flex gap-4 mt-6">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors flex-1"
            >
              {isSaving ? "Salvando..." : "Salvar Dívida"}
            </button>

            <button
              onClick={exportToExcel}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-6 rounded-lg transition-colors flex-1"
            >
              Exportar Excel
            </button>
          </div>
        </div>
      </div>
      
      {/* Lista de dividas já salvas */}
      <div className="relative z-10 w-full max-w-2xl mx-auto p-4 md:p-8 flex flex-col pt-12 md:pt-12">
        <h2 className="text-xl font-bold mb-6 mt-4 md:mt-0">Suas Dívidas Ativas</h2>
        {isLoading ? (
          <p>Carregando dívidas...</p>
        ) : !debts || debts.length === 0 ? (
          <p className="opacity-70">Nenhuma dívida salva ainda.</p>
        ) : (
          <div className="flex flex-col gap-4 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
            {debts.map((d) => (
              <div key={d.id} className="bg-black/40 backdrop-blur-md p-4 flex justify-between items-center rounded-xl border border-white/10 hover:border-white/30 transition-colors">
                <div>
                  <h3 className="font-bold text-lg">{d.creditor}</h3>
                  <p className="text-sm opacity-70">Status: {d.status}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm opacity-70">Original: R$ {d.value?.toFixed(2)}</p>
                    <p className="font-bold text-red-400">Total: R$ {((d.value || 0) + (d.amount || 0)).toFixed(2)}</p>
                  </div>
                  <button 
                    onClick={() => d.id && handleDelete(d.id)}
                    className="p-2 bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white rounded-lg transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
    </>
  );
}
