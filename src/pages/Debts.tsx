import { useState } from "react";
import { Link } from "react-router-dom";
import * as XLSX from "xlsx";
import "../App.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ptBR } from "date-fns/locale/pt-BR";

export type Debts = {
  creditor?: string;
  type?: string;
  value?: number;
  amount?: number;
  rate?: number;
  date?: Date;
  status?: string;
};

export default function Debts() {
  const [debts, setDebts] = useState<Debts>({});
  const [pToast, setPToast] = useState("");

  function showToast(msg: string) {
    setPToast(msg);
    setTimeout(() => {
      setPToast("");
    }, 5000);
  }

  const exportToExcel = () => {
    // Exporta o state atual (se houvesse um array, exportaria a lista)
    const dataToExport = [debts];
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Dívidas");
    XLSX.writeFile(workbook, "Minhas_Dividas.xlsx");
    showToast("Relatório exportado com sucesso!");
  };

  date: new Date();

  //css da div do button: style={{ marginTop: 16 }} - adaptar para tailwind

  return (
    <>
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-900 relative overflow-hidden"></div>
      <div className="absolute inset-0 auth-gradient-bg opacity-50"></div>
      
      <div className="relative z-10 w-full max-w-md mx-4 transition-all duration-500"></div>
        <div className="backdrop-blur-xl bg-white/[0.08] border border-white/20 rounded-3xl p-8 shadow-2xl"></div>
      <div>
        {pToast && (
          <div className="toast">
            <p id="toast">{pToast}</p>
          </div>
        )}

        <h1>Acompanhe sua dívida</h1>
        <Link to={"/"}>Voltar</Link>

        <p>
          aqui estão todos os seus dados para acompanhar o andamento das suas
          dívidas
        </p>

        <p>Digite o seu credor</p>
        <input
          type="text"
          value={debts.creditor ?? ""}
          onChange={(e) => setDebts({ ...debts, creditor: e.target.value })}
          placeholder="Ex: Banco Itau"
        />

        <p>Digite o tipo da sua dívida</p>
        <input
          type="text"
          value={debts.type ?? ""}
          onChange={(e) => setDebts({ ...debts, type: e.target.value })}
          placeholder="Fixa"
        />

        <p>Digite o valor original da sua dívida</p>
        <input
          type="number"
          value={debts.value ?? ""}
          onChange={(e) =>
            setDebts({ ...debts, value: parseFloat(e.target.value) })
          }
          placeholder="0,00"
        />

        <p>Digite o valor atual do juros aplicado a sua dívida</p>
        <input
          type="number"
          value={debts.amount ?? ""}
          onChange={(e) =>
            setDebts({ ...debts, amount: parseFloat(e.target.value) })
          }
          placeholder="0,00"
        />

        <p>Digite a taxa de juros aplicada a sua dívida</p>
        <input
          type="number"
          value={debts.rate ?? ""}
          onChange={(e) =>
            setDebts({ ...debts, rate: parseFloat(e.target.value) })
          }
          placeholder="0,00%"
        />

        <p>Digite a data de vencimento da sua dívida</p>
        <DatePicker
          selected={debts.date}
          onChange={(date) => setDebts({ ...debts, date: date })}
          dateFormat="dd/MM/yyyy"
          locale="pt-BR"
          placeholderText="Ex: 25/12/2024"
          className="input-data"
          showPopperArrow={false}
          autoComplete="off"
        />
        <p>Digite o status da sua dívida</p>
        <input
          type="text"
          value={debts.status ?? ""}
          onChange={(e) => setDebts({ ...debts, status: e.target.value })}
          placeholder="Em andamento"
        />

        <div className="flex gap-4 mt-4">
          <button
            onClick={() => {
              if (!debts.creditor) {
                showToast("Informe o credor!");
                return;
              }
              showToast("Seus dados foram salvos");
            }}
          >
            Salvar
          </button>

          <button
            onClick={exportToExcel}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-4 rounded transition-colors"
          >
            Exportar Excel
          </button>
        </div>
      </div>
    </>
  );
}
