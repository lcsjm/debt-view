import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import supabase from "../../utils/supabase"

export interface Transaction {
  id?: string;
  value: number;
  type: string;
  category: string;
  user_id?: string;
  created_at?: string;
}

export function useTransactions() {
  // 🎓 Pegamos o queryClient para poder dizer a ele quando atualizar os dados da tela
  const queryClient = useQueryClient();

  // 1️⃣ LENDO TRANSAÇÕES (SELECT)
  const { data: transactions, isLoading } = useQuery({
    queryKey: ["transactions"], // Nome no cache para a lista de transações
    queryFn: async () => {

      const { data: { user } } = await supabase.auth.getUser()

      if(!user) throw new Error("Usuário não autenticado")

      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user.id)

      if(error) throw error

      return data || []
    }
  })

  // 2️⃣ CRIANDO UMA NOVA TRANSAÇÃO (INSERT)
  const { mutateAsync: addTransaction } = useMutation({
    mutationFn: async (newTransaction: Transaction) => {

      const { data: { user } } = await supabase.auth.getUser()

      if(!user) throw new Error("Usuário não autenticado")

      const { data, error } = await supabase
        .from("transactions")
        .insert({
          ...newTransaction,
          user_id: user.id
        })

      if(error) throw error

      return data
    },
    // 🔔 onSuccess é o segredo do React Query. 
    // Quando a transação salva no banco, ele roda isso:
    onSuccess: () => {
      // 🎓 Ele "invalida" (apaga) o cache velho e obriga o useQuery ali em cima a rodar de novo!
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    }
  });

  return { transactions, isLoading, addTransaction }

}