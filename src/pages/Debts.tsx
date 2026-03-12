import { useState } from "react";
import { Link } from "react-router-dom";
import * as XLSX from "xlsx";
import "../App.css";

export type Debts = {
  creditor?: string;
  type?: string;
  value?: number;
  amount?: number;
  rate?: number;
  date?: string;
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

  //css da div do button: style={{ marginTop: 16 }} - adaptar para tailwind

  return (
    <>
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
        />

        <p>Digite o tipo da sua dívida</p>
        <input
          type="text"
          value={debts.type ?? ""}
          onChange={(e) => setDebts({ ...debts, type: e.target.value })}
        />

        <p>Digite o valor da sua dívida</p>
        <input
          type="number"
          value={debts.value ?? ""}
          onChange={(e) =>
            setDebts({ ...debts, value: parseFloat(e.target.value) })
          }
        />

        <p>Digite o valor atual do juros aplicado a sua dívida</p>
        <input
          type="number"
          value={debts.amount ?? ""}
          onChange={(e) =>
            setDebts({ ...debts, amount: parseFloat(e.target.value) })
          }
        />

        <p>Digite a taxa de juros aplicada a sua dívida</p>
        <input
          type="number"
          value={debts.rate ?? ""}
          onChange={(e) =>
            setDebts({ ...debts, rate: parseFloat(e.target.value) })
          }
        />

        <p>Digite a data de vencimento da sua dívida</p>
        <input
          type="date"
          onChange={(e) => setDebts({ ...debts, date: e.target.value })}
        />

        <p>Digite o status da sua dívida</p>
        <input
          type="text"
          value={debts.status ?? ""}
          onChange={(e) => setDebts({ ...debts, status: e.target.value })}
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
