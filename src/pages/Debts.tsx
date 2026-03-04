import { useState } from "react";
import { Link } from "react-router-dom";
<<<<<<< HEAD
import "../App.css";
=======
import '../App.css'
>>>>>>> 744845533b8e998277a354769fbe8102a0b9973d

export type Debts = {
  credor?: string;
  valorOriginal?: number;
  valorAttJuros?: number;
  taxaJuros?: number;
  dataVenc?: Date;
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

<<<<<<< HEAD
  //=== "" ? undefined : parseFloat(e.target.value) nos input numbers, é necessario, pra impedir not null
  //pro date: value={debts.dataVenc? debts.dataVenc.toISOString().slice(0, 10) // yyyy-mm-dd: ""} e ? new Date(e.target.value) : undefined, é necessário, se sim, pq?
  //css da div do button: style={{ marginTop: 16 }} - adaptar para tailwind

=======
>>>>>>> 744845533b8e998277a354769fbe8102a0b9973d
  return (
    <>
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
<<<<<<< HEAD
        type="text"
        value={debts.credor ?? ""}
        onChange={(e) =>
          setDebts((setDebts) => ({ ...debts, credor: e.target.value }))
        }
=======
        type="string"
        onChange={(e) => setCredor({ ...Debts, credor: e.target.value })}
>>>>>>> 744845533b8e998277a354769fbe8102a0b9973d
      />

      <p>Digite o valor da sua dívida</p>
      <input
        type="number"
<<<<<<< HEAD
        value={debts.valorOriginal ?? ""}
        onChange={(e) =>
          setDebts((setDebts) => ({...debts, valorOriginal: e.target.value === "" ? undefined : parseFloat(e.target.value)}))}
=======
        onChange={(e) => setCredor({ ...Debts, valorOriginal: e.target.value })}
>>>>>>> 744845533b8e998277a354769fbe8102a0b9973d
      />

      <p>Digite o valor atual do juros aplicado a sua dívida</p>
      <input
        type="number"
<<<<<<< HEAD
        value={debts.valorAttJuros ?? ""}
        onChange={(e) =>
          setDebts((setDebts) => ({...debts, valorAttJuros: e.target.value === "" ? undefined : parseFloat(e.target.value)}))
        }
=======
        onChange={(e) => setCredor({ ...Debts, valorAttJuros: e.target.value })}
>>>>>>> 744845533b8e998277a354769fbe8102a0b9973d
      />

      <p>Digite a taxa de juros aplicada a sua dívida</p>
      <input
        type="number"
<<<<<<< HEAD
        value={debts.taxaJuros ?? ""}
        onChange={(e) =>
          setDebts((setDebts) => ({...debts, taxaJuros:e.target.value === "" ? undefined : parseFloat(e.target.value)}))}
      />

      <p>Digite a data de vencimento da sua dívida</p>
      <input
        type="date"
        
        onChange={(e) =>
          setDebts((setDebts) => ({...debts,dataVenc: e.target.value}))}
      />

      <p>Digite o status da sua dívida</p>
      <input
        type="text"
        value={debts.status ?? ""}
        onChange={(e) =>
          setDebts((setDebts) => ({ ...debts, status: e.target.value }))
        }
=======
        onChange={(e) => setCredor({ ...Debts, taxaJuros: e.target.value })}
      />
      <input
        type="Date"
        onChange={(e) => setCredor({ ...Debts, dataVenc: e.target.value })}
      />
      <input
        type="string"
        onChange={(e) => setCredor({ ...Debts, status: e.target.value })}
>>>>>>> 744845533b8e998277a354769fbe8102a0b9973d
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
    </>
  );
}
