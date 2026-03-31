import supabase from '../../utils/supabase';

const fmt = (v: number) =>
  `R$ ${v.toFixed(2).replace(".", ",").replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;

export async function getAICachedContext(user: any): Promise<string> {
  if (!user || !user.id) return "";

  const CACHE_KEY = `ai_context_${user.id}`;
  const CACHE_MINUTES = 5;

  const cachedStr = localStorage.getItem(CACHE_KEY);
  if (cachedStr) {
    try {
      const cached = JSON.parse(cachedStr);
      const ageInMs = Date.now() - cached.timestamp;
      
      // If Cache is valid (less than CACHE_MINUTES minutes old)
      if (ageInMs < CACHE_MINUTES * 60 * 1000 && cached.context) {
        return cached.context;
      }
    } catch (e) {
       // Ignore parse error and proceed to fetch
       console.warn("Failed to parse AI context cache. Re-fetching...");
    }
  }

  try {
    // Fetch real-time data from Supabase across all requested tables
    const [
      profileReq, 
      financialReq, 
      financesReq,
      debtsReq, 
      serasaReq, 
      transReq,
      simulatorsReq,
      chatReq
    ] = await Promise.all([
      supabase.from('profiles').select('*').eq('user_id', user.id).maybeSingle(),
      supabase.from('financial').select('*').eq('user_id', user.id).maybeSingle(),
      supabase.from('finances').select('*').eq('user_id', user.id).maybeSingle(),
      supabase.from('debts').select('*').eq('user_id', user.id),
      supabase.from('profiles').select('cpf').eq('user_id', user.id).maybeSingle()
        .then((res: any) => res.data?.cpf ? supabase.from('mock_serasa_debts').select('*').eq('user_cpf', res.data.cpf) : { data: [] }),
      supabase.from('transactions').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(10),
      supabase.from('simulators').select('*').eq('user_id', user.id),
      supabase.from('chat').select('id, created_at').eq('user_id', user.id).maybeSingle()
    ]);

    const p = profileReq.data;
    const f1 = financialReq.data;
    const f2 = financesReq.data;
    const d = debtsReq.data || [];
    const s = serasaReq.data || [];
    const t = transReq.data || [];
    const sim = simulatorsReq.data || [];
    const chat = chatReq.data;

    const liveContextStr = `\n\n--- DADOS BANCÁRIOS E PERFIL COMPLETOS (ÚLTIMA SINCRONIZAÇÃO HÁ POUCO TEMPO) ---
    Nome: ${p?.name || 'Desconhecido'} | CPF: ${p?.cpf || 'Não informado'} | Nascimento: ${p?.birth || 'Não informado'}
    
    [Tabela Financial]
    Gastos Fixos (Financial): ${fmt(f1?.fixedExpenses || 0)} | Gastos Variáveis (Financial): ${fmt(f1?.variableExpenses || 0)}
    Renda Fixa (Financial): ${fmt(f1?.fixedIncome || 0)} | Renda Variável (Financial): ${fmt(f1?.variableIncome || 0)}
    Investimentos (Financial): ${fmt(f1?.investments || 0)}
    
    [Tabela Finances]
    Gastos Fixos (Finances): ${fmt(f2?.fixed_expense || 0)} | Gastos Variáveis (Finances): ${fmt(f2?.variable_expense || 0)}
    Renda Fixa (Finances): ${fmt(f2?.fixed_income || 0)} | Renda Variável (Finances): ${fmt(f2?.variable_income || 0)}
    Dívidas (Finances): ${fmt(f2?.debts || 0)} | Investimentos (Finances): ${fmt(f2?.investments || 0)}

    Dívidas Atuais (Serasa Mock): ${s.length > 0 ? s.map((x: any) => `${x.creditor_name} - ${fmt(x.current_amount)} (Vence em: ${x.due_date})`).join(', ') : 'Nenhuma'}
    Outras Dívidas Cadastradas: ${d.length > 0 ? d.map((x: any) => `${x.creditor} - ${fmt(x.amount || x.value || 0)} (Taxa: ${x.rate}%)`).join(', ') : 'Nenhuma'}
    Últimas Transações: ${t.length > 0 ? t.map((x: any) => `${x.category} (${x.type}): ${fmt(x.value || 0)}`).join(', ') : 'Nenhuma'}
    
    Simuladores Salvos: ${sim.length > 0 ? sim.map((x: any) => `${x.creditor} - Valor: ${fmt(x.value)} a ${x.rate}% (${x.installments}x de ${fmt(x.payment)})`).join(', ') : 'Nenhum simulador criado.'}
    Status do Histórico de Chat (Table Chat): ${chat ? 'Possui histórico salvo' : 'Sem histórico prévio na tabela'}
    `;

    // Save to Cache
    localStorage.setItem(CACHE_KEY, JSON.stringify({
      timestamp: Date.now(),
      context: liveContextStr
    }));

    return liveContextStr;
  } catch (err) {
    console.error("AI Cache Error:", err);
    return ""; // Silent failure, just proceeds without the additional context.
  }
}
