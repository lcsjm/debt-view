import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import supabase from "../../utils/supabase";

export interface Transaction {
  id?: string;
  value: number;
  type: string;
  category: string;
  date: string;
  user_id?: string;
  created_at?: string;
}

export function useTransactions() {
  const queryClient = useQueryClient();

  // 1 — Buscar transações
  const { data: transactions, isLoading } = useQuery({
    queryKey: ["transactions"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: false }); // mais recente primeiro

      if (error) throw error;
      return data || [];
    }
  });

  // 2 — Adicionar transação
  const { mutateAsync: addTransaction } = useMutation({
    mutationFn: async (newTransaction: Omit<Transaction, "id" | "user_id" | "created_at">) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");
      if (!newTransaction.date) throw new Error("Data não informada");

      const { data, error } = await supabase
        .from("transactions")
        .insert({ ...newTransaction, user_id: user.id });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    }
  });

  // 3 — Atualizar transação
  const { mutateAsync: updateTransaction } = useMutation({
    mutationFn: async (updatedTransaction: Transaction) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");
      if (!updatedTransaction.id) throw new Error("ID da transação não fornecido");

      const { id, created_at, user_id, ...updatePayload } = updatedTransaction;

      const { data, error } = await supabase
        .from("transactions")
        .update(updatePayload)
        .eq("id", id)
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

  // 4 — Deletar transação
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

  return {
    transactions,
    isLoading,
    addTransaction,
    updateTransaction,
    deleteTransaction
  };
}
