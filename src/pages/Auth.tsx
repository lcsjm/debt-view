import { useState } from "react";
import { Link } from "react-router-dom";
export type User = {
  email?: string;
  pass?: string;
};
export default function Auth() {
const [login, setLogin] = useState(true);
const [user, setUser] = useState<User>();
const [users, setUsers] = useState<User[]>([]);

function checkedLogin() {
  let loged = users.find(
    (u) => u.email == user?.email && u.pass === user?.pass,
  );
  if (loged) {
    showToast("Parabéns! Verificado");
  } else {
    showToast("Inválido");
  }
}

function handleRegister() {
  if (user?.email && user?.pass) setUsers([...users, user]);
}

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

      <h1>Página de login</h1>
      <Link to="/"> Voltar </Link>
      <input
        type="email"
        onChange={(e) => setUser({ ...user, email: e.target.value })}
      />
      <input
        type="password"
        onChange={(e) => setUser({ ...user, pass: e.target.value })}
      />

      {login ? (
        <a className="button" onClick={() => checkedLogin()}>
          Login{" "}
        </a>
      ) : (
        <a className="button" onClick={() => handleRegister()}>
          Cadastre-se{" "}
        </a>
      )}

      <a className="link" onClick={() => setLogin(!login)}>
        {login
          ? "Clique aqui para se cadastrar"
          : "Clique aqui para fazer login"}
      </a>
    </>
  );
}

