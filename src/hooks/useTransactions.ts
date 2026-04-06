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

  // 3️⃣ ATUALIZANDO UMA TRANSAÇÃO (UPDATE)
  const { mutateAsync: updateTransaction } = useMutation({
    mutationFn: async (updatedTransaction: Transaction) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");
      
      if (!updatedTransaction.id) throw new Error("ID da transação não fornecido");

      // Impede de enviar o id no corpo do update
      const { id, created_at, user_id, ...updatePayload } = updatedTransaction;

      const { data, error } = await supabase
        .from("transactions")
        .update(updatePayload)
        .eq("id", updatedTransaction.id)
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    }
  });

  // 4️⃣ DELETANDO UMA TRANSAÇÃO (DELETE)
  const { mutateAsync: deleteTransaction } = useMutation({
    mutationFn: async (id: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const { error } = await supabase
        .from("transactions")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    }
  });

  return { transactions, isLoading, addTransaction, updateTransaction, deleteTransaction }

}