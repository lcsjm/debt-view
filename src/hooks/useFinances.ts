import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import supabase from "../../utils/supabase";

export interface FinanceData {
  id?: string;
  fixed_expense: number;
  variable_expense: number;
  fixed_income: number;
  variable_income: number;
  debts: number;
  investments: number;
  user_id?: string;
}

// Fetch finances for the logged-in user
export function useFinances() {
  // 🎓 queryClient nos permite conversar com o "gerente de cache" do React Query.
  // Vamos usar ele lá embaixo para forçar a tela a atualizar.
  const queryClient = useQueryClient();

  // 1️⃣ LENDO DADOS (SELECT) via useQuery
  // O React Query faz um SELECT e guarda o resultado na variável 'finances'.
  // Ele também gerencia se está carregando (isLoading) ou se deu erro (error).
  const { data: finances, isLoading, error } = useQuery({
    queryKey: ["finances"], // Nome único dessa requisição no cache
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const { data, error } = await supabase
        .from("finances")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      
      // Se não houver dados ainda, retorna um objeto zerado padrão
      return data || {
        fixed_expense: 0,
        variable_expense: 0,
        fixed_income: 0,
        variable_income: 0,
        debts: 0,
        investments: 0,
      };
    },
  });

  // 2️⃣ SALVANDO/ALTERANDO DADOS (INSERT/UPDATE) via useMutation
  // Enquanto o useQuery é automático para ler, o useMutation é disparado só quando pedimos (ex: num clique de botão).
  const { mutateAsync: saveFinances, isPending: isSaving } = useMutation({
    mutationFn: async (updatedData: FinanceData) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      // Faz o INSERT ou UPDATE no Supabase
      const { data, error } = await supabase
        .from("finances")
        .upsert({ 
            ...updatedData, 
            user_id: user.id 
        }, { onConflict: 'user_id' })
        .select()
        .single();
        
      if (error) throw error;
      return data;
    },
    // 🔔 onSuccess é chamado se o Supabase salvar com sucesso.
    onSuccess: () => {
      // 🎓 MÁGICA: Aqui dizemos "Ei, os dados com nome 'finances' ficaram velhos".
      // O React Query automaticamente refaz o SELECT lá de cima e atualiza a tela sem precisar dar F5!
      queryClient.invalidateQueries({ queryKey: ["finances"] });
    },
  });

  return { finances, isLoading, error, saveFinances, isSaving };
}
