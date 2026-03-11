import React, { useState } from 'react';
import supabase from "../../utils/supabase";
import { useAuth } from '@/context/AuthContext';

const FinancePage = () => {
  // Estado inicial com os 6 campos
  const [finances, setFinances] = useState({
    rendaFixa: 0,
    rendaVariavel: 0,
    aluguel: 0,
    cartao: 0,
    alimentacao: 0,
    extras: 0,
  });

  async function handleFinance (){
    const data = {...finances, user_id: user?.id};

    const {data, error} = await supabase.from('Finances')
        .insert(data)
        if(error){
            alert('error.mensage')
            return
        }
        alert("financias certa")
  }

  return (
    <div style={{ padding: '20px', maxWidth: '400px', fontFamily: 'sans-serif' }}>
      <h2>Painel Financeiro</h2>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        
        {/* Input 1 */}
        <label>Renda Fixa:</label>
        <input  
          type="number" 
          placeholder="Renda Fixa" 
          value={finances.rendaFixa}
          onChange={(e) => setFinances({ ...finances, rendaFixa: Number(e.target.value) })}
        />

        {/* Input 2 */}
        <label>Renda Variável:</label>
        <input  
          type="number" 
          placeholder="Renda Variável" 
          value={finances.rendaVariavel}
          onChange={(e) => setFinances({ ...finances, rendaVariavel: Number(e.target.value) })}
        />

        {/* Input 3 */}
        <label>Aluguel:</label>
        <input  
          type="number" 
          placeholder="Aluguel" 
          value={finances.aluguel}
          onChange={(e) => setFinances({ ...finances, aluguel: Number(e.target.value) })}
        />

        {/* Input 4 */}
        <label>Cartão de Crédito:</label>
        <input  
          type="number" 
          placeholder="Cartão" 
          value={finances.cartao}
          onChange={(e) => setFinances({ ...finances, cartao: Number(e.target.value) })}
        />

        {/* Input 5 */}
        <label>Alimentação:</label>
        <input  
          type="number" 
          placeholder="Alimentação" 
          value={finances.alimentacao}
          onChange={(e) => setFinances({ ...finances, alimentacao: Number(e.target.value) })}
        />

        {/* Input 6 */}
        <label>Extras:</label>
        <input  
          type="number" 
          placeholder="Extras" 
          value={finances.extras}
          onChange={(e) => setFinances({ ...finances, extras: Number(e.target.value) })}
        />

      </div>

      <div style={{ marginTop: '20px', fontWeight: 'bold' }}>
        Total: R$ {Object.values(finances).reduce((acc, curr) => acc + curr, 0)}
      </div>
      <button onClick={handleFinance}>alterar financias</button>
    </div>
  );
};

export default FinancePage;

const {user, singOutUser} = useAuth ();