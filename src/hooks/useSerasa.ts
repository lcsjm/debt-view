import { useQuery } from "@tanstack/react-query";
import supabase from "../../utils/supabase";

export interface SerasaDebt {
  id: string;
  user_cpf: string;
  creditor_name: string;
  original_amount: number;
  current_amount: number;
  due_date: string;
  status: string;
}

export function useSerasa() {
  const { data: debts, isLoading, error } = useQuery({
    queryKey: ["serasa_debts"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não logado");

      // 1. Pega o CPF do usuario pelo profile public
      const { data: profile, error: profileErr } = await supabase
        .from("profiles")
        .select("cpf")
        .eq("user_id", user.id)
        .single();

      if (profileErr) throw profileErr;
      if (!profile?.cpf) return []; // sem CPF = sem dividas

      // 2. Busca dividas pelo CPF no mock
      const { data: mockDebts, error: debtsErr } = await supabase
        .from("mock_serasa_debts")
        .select("*")
        .eq("user_cpf", profile.cpf);

      if (debtsErr) throw debtsErr;
      
      return (mockDebts as SerasaDebt[]) || [];
    },
  });

  return { debts, isLoading, error };
}
