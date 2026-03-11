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
  const queryClient = useQueryClient();

  const { data: finances, isLoading, error } = useQuery({
    queryKey: ["finances"],
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

  const { mutateAsync: saveFinances, isPending: isSaving } = useMutation({
    mutationFn: async (updatedData: FinanceData) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

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
    onSuccess: () => {
      // Invalida a query para forçar uma recarga rápida em tela
      queryClient.invalidateQueries({ queryKey: ["finances"] });
    },
  });

  return { finances, isLoading, error, saveFinances, isSaving };
}
