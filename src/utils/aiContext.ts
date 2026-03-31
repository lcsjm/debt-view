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
    // Fetch real-time data from Supabase
    // Note: Utilizando a tabela 'financial' baseada na sua configuração em produção atual.
    const [profileReq, financesReq, debtsReq, serasaReq, transReq] = await Promise.all([
      supabase.from('profiles').select('*').eq('user_id', user.id).maybeSingle(),
      supabase.from('financial').select('*').eq('user_id', user.id).maybeSingle(),
      supabase.from('debts').select('*').eq('user_id', user.id),
      supabase.from('profiles').select('cpf').eq('user_id', user.id).maybeSingle()
        .then((res: any) => res.data?.cpf ? supabase.from('mock_serasa_debts').select('*').eq('user_cpf', res.data.cpf) : { data: [] }),
      supabase.from('transactions').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(10)
    ]);

    const p = profileReq.data;
    const f = financesReq.data;
    const d = debtsReq.data || [];
    const s = serasaReq.data || [];
    const t = transReq.data || [];

    const liveContextStr = `\n\n--- DADOS DO USUÁRIO PARA CONTEXTO OBRIGATÓRIO (ÚLTIMA SINCRONIZAÇÃO HÁ POUCO TEMPO) ---
    Nome: ${p?.name || 'Desconhecido'}
    Gastos Fixos Mensais: ${fmt(f?.fixedExpenses || 0)}
    Gastos Variáveis Mensais: ${fmt(f?.variableExpenses || 0)}
    Renda Fixa Mensal: ${fmt(f?.fixedIncome || 0)}
    Renda Variável Mensal: ${fmt(f?.variableIncome || 0)}
    Dívidas Atuais (Serasa Mock): ${s.length > 0 ? s.map((x: any) => `${x.creditor_name} - ${fmt(x.current_amount)} (Vence em: ${x.due_date})`).join(', ') : 'Nenhuma'}
    Outras Dívidas Cadastradas: ${d.length > 0 ? d.map((x: any) => `${x.creditor} - ${fmt(x.amount)}`).join(', ') : 'Nenhuma'}
    Últimas Transações: ${t.length > 0 ? t.map((x: any) => `${x.category} (${x.type}): ${fmt(x.value)}`).join(', ') : 'Nenhuma'}
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
