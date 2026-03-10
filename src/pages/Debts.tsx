import { useState } from "react";
import { Link } from "react-router-dom";
import "../App.css";

export type Debts = {
  credor?: string;
  valorOriginal?: number;
  valorAttJuros?: number;
  taxaJuros?: number;
  dataVenc?: string;
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
          value={debts.credor ?? ""}
          onChange={(e) => setDebts({ ...debts, credor: e.target.value })}
        />

        <p>Digite o valor da sua dívida</p>
        <input
          type="number"
          value={debts.valorOriginal ?? ""}
          onChange={(e) =>
            setDebts({ ...Debts, valorOriginal: parseFloat(e.target.value) })
          }
        />

        <p>Digite o valor atual do juros aplicado a sua dívida</p>
        <input
          type="number"
          value={debts.valorAttJuros ?? ""}
          onChange={(e) =>
            setDebts({ ...debts, valorAttJuros: parseFloat(e.target.value) })
          }
        />

        <p>Digite a taxa de juros aplicada a sua dívida</p>
        <input
          type="number"
          value={debts.taxaJuros ?? ""}
          onChange={(e) =>
            setDebts({ ...debts, taxaJuros: parseFloat(e.target.value) })
          }
        />

        <p>Digite a data de vencimento da sua dívida</p>
        <input
          type="date"
          onChange={(e) => setDebts({ ...debts, dataVenc: e.target.value })}
        />

        <p>Digite o status da sua dívida</p>
        <input
          type="text"
          value={debts.status ?? ""}
          onChange={(e) => setDebts({ ...debts, status: e.target.value })}
        />

        <div>
          <button
            onClick={() => {
              if (!debts.credor) {
                showToast("Informe o credor!");
                return;
              }
              showToast("Seus dados foram salvos");
            }}
          >
            Salvar
          </button>
        </div>
      </div>
    </>
  );
}
