import { useState } from "react";
import { Link } from "react-router-dom";

export type Debts = {
  credor?: string;
  valorOriginal?: number;
  valorAttJuros?: number;
  taxaJuros?: number;
  dataVenc?: Date;
  status?: string;
};

export default function Debts() {
  const [credor, setCredor] = useState();
  const [valorOriginal, setvalorOriginal] = useState();
  const [valorAttJuros, setValorAttJuros] = useState();
  const [taxaJuros, setTaxaJuros] = useState();
  const [dataVenc, setDataVenc] = useState();
  const [status, setStatus] = useState();
  const [pToast, setPToast] = useState("");

  function showToast(msg: string) {
    setPToast(msg);

    setTimeout(() => {
      setPToast("");
    }, 5000);
  }
  
  return (
    <>
      {pToast.length && (
        <div className="toast">
          <p id="toast">{pToast}</p>
        </div>
      )}
      <h1>Acompanhe sua dívida</h1>
      <Link to={"/"}>Voltar</Link>
      <p>
        aqui estão todos os seus dados para acompanhar o andamento de seus
        endividamentos
      </p>
      <input
        type="string"
        onChange={(e) => setCredor({...Debts, credor: e.target.value  })}
      />
    </>
  );
}
